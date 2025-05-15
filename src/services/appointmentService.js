import { Op, where } from 'sequelize';
import db from '../models/index.js';
import Appointment from '../models/Appointment.js';

let validateAppointmentInput = async (appointmentInfo) => {
  if (!appointmentInfo || Object.keys(appointmentInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin đặt lịch!',
      data: null,
    };
  }
  if (!appointmentInfo.customername) {
    return {
      errCode: -1,
      errMessage: 'Tên người dùng trống!',
      data: null,
    };
  } else {
    const customerName = appointmentInfo.customername.trim();
    const customerNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!customerNameRegex.test(customerName)) {
      return {
        errCode: 1,
        errMessage: 'Tên người dùng sai định dạng!',
        data: null,
      };
    }
  }
  if (!appointmentInfo.customeremail) {
    return {
      errCode: -1,
      errMessage: 'Email trống!',
      data: null,
    };
  } else {
    const customeremail = appointmentInfo.customeremail.trim();
    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customeremail)) {
      return {
        errCode: 1,
        errMessage: 'Email sai định dạng!',
        data: null,
      };
    }
  }
  if (!appointmentInfo.customerphone) {
    return {
      errCode: -1,
      errMessage: 'Số điện thoại trống!',
      data: null,
    };
  } else {
    const phoneNumber = appointmentInfo.customerphone.trim();
    const phoneRegex = /^[0-9]{10,11}$/; //chỉ chứa số và có độ dài từ 10-11 ký tự
    if (!phoneRegex.test(phoneNumber)) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại không hợp lệ!',
        data: null,
      };
    }
  }
  if (!appointmentInfo.appointmentdate) {
    return {
      errCode: -1,
      errMessage: 'Chưa nhập ngày hẹn!',
      data: null,
    };
  } else {
    const dateCheck = new Date(appointmentInfo.appointmentdate);
    if (isNaN(dateCheck.getTime())) {
      return {
        errCode: 1,
        errMessage: 'Ngày hẹn không hợp lệ!',
        data: null,
      };
    }
  }

  return null;
};
let generateAppointmentID = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const prefix = 'A'; // Chỉ lấy A, O, V, hoặc C
      // Lấy timestamp
      const timestamp = Date.now().toString();
      // Lấy 9 chữ số từ timestamp
      const timestampDigits = timestamp.slice(-9); // Lấy 9 chữ số cuối
      let appointmentId = `${prefix}${timestampDigits}`;
      // Kiểm tra xem accountId có trùng trong DB không
      let existingAppointment = await db.Appointment.findOne({
        where: { AppointmentID: appointmentId },
      });
      // Nếu trùng, thử lại với timestamp mới (tối đa 5 lần)
      let attempts = 0;
      while (existingAppointment && attempts < 5) {
        const newTimestamp = Date.now().toString();
        const newTimestampDigits = newTimestamp.slice(-9);
        appointmentId = `${prefix}${newTimestampDigits}`;
        attempts++;
        existingAppointment = await db.Appointment.findOne({
          where: { AppointmentID: appointmentId },
        });
      }
      if (attempts >= 5) {
        resolve({
          errCode: 1,
          errMessage: 'Tạo mã lịch hẹn thất bại!',
          data: null,
        });
      }
      resolve(appointmentId);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi tạo mã lịch hẹn ' + e.message,
        data: null,
      });
    }
  });
};
let createAppointment = (
  customername,
  customeremail,
  customerphone,
  appointmentdate,
  starttime,

  notes,
  accountid,
  veterinarianid,
  serviceid,
  petid
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!customername || !customeremail || !customerphone || !appointmentdate || !starttime || !serviceid || !petid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }

      const appointmentInfo = {
        customername,
        customeremail,
        customerphone,
        appointmentdate,
        starttime,
        notes,
        accountid,
        veterinarianid,
        serviceid,
        petid,
        imageInfo,
      };
      let isValidateInput = await validateAppointmentInput(appointmentInfo);
      if (isValidateInput) {
        //có trả lỗi về -> dữ liệu nhập vào không hợp lệ
        resolve(isValidateInput);
        return;
      }

      if (accountid) {
        const isAccountIDExist = await db.Account.findOne({
          where: { AccountID: accountid },
        });
        if (!isAccountIDExist) {
          resolve({
            errCode: 2,
            errMessage: 'Tài khoản không tồn tại trong hệ thống!',
            data: null,
          });
          return;
        }
      }

      //Veterinarian
      if (veterinarianid) {
        const isVeterinarianIDExist = await db.VeterinarianInfo.findOne({
          where: { AccountID: veterinarianid },
        });
        if (!isVeterinarianIDExist) {
          resolve({
            errCode: 2,
            errMessage: 'Bác sĩ không tồn tại trong hệ thống!',
            data: null,
          });
          return;
        }
      }

      const isPetIDExist = await db.Pet.findOne({
        where: { PetID: petid },
      });
      if (!isPetIDExist) {
        resolve({
          errCode: 2,
          errMessage: 'Thú cưng không tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }

      const service = await db.Service.findOne({ where: { ServiceID: serviceid } });
      if (!service) {
        resolve({
          errCode: 2,
          errMessage: 'Dịch vụ không tồn tại!',
          data: null,
        });
        return;
      }
      const duration = service.Duration;
      const [startHours, startMinutes] = starttime.split(':').map(Number);
      const startDateTime = new Date(appointmentdate);
      startDateTime.setHours(startHours, startMinutes);
      const endTime = new Date(startDateTime.getTime() + duration * 60000);
      const appointments = await db.Appointment.findAll({
        where: { AppointmentDate: appointmentdate },
        include: [{ model: db.Schedule, as: 'Schedules' }],
      });
      if (veterinarianid) {
        const isConflict = appointments.some((app) => {
          const appStart = new Date(`${app.AppointmentDate}T${app.StartTime}`);
          const appEnd = new Date(`${app.AppointmentDate}T${app.EndTime}`);
          return (
            app.Schedules.some((sch) => sch.VeterinarianID === veterinarianid) &&
            startDateTime < appEnd &&
            endTime > appStart
          );
        });
        if (isConflict) {
          resolve({
            errCode: 1,
            errMessage: 'Khung giờ đã được đặt bởi bác sĩ này!',
            data: null,
          });
          return;
        }
      } else {
        const veterinarians = await db.VeterinarianInfo.findAll();
        const hasAvailableVet = veterinarians.some((vet) => {
          const vetAppointments = appointments.filter((app) =>
            app.Schedules.some((sch) => sch.VeterinarianID === vet.AccountID)
          );
          return !vetAppointments.some((app) => {
            const appStart = new Date(`${app.AppointmentDate}T${app.StartTime}`);
            const appEnd = new Date(`${app.AppointmentDate}T${app.EndTime}`);
            return startDateTime < appEnd && endTime > appStart;
          });
        });
        if (!hasAvailableVet) {
          resolve({
            errCode: 1,
            errMessage: 'Tất cả bác sĩ đều bận trong khung giờ này!',
            data: null,
          });
          return;
        }
      }
      const appointmentID = await generateAppointmentID();
      if (typeof appointmentID === 'object' && appointmentID.errCode) {
        resolve(appointmentID);
        return;
      }
      const createdAt = new Date();
      await db.Appointment.create({
        AppointmentID: appointmentID,
        CustomerName: customername,
        CustomerEmail: customeremail,
        CustomerPhone: customerphone,
        AppointmentDate: appointmentdate,
        StartTime: starttime,
        EndTime: endTime.toTimeString().slice(0, 5),
        Notes: notes,
        AccountID: accountid,
        VeterinarianID: veterinarianid,
        ServiceID: serviceid,
        PetID: petid,
        CreatedAt: createdAt,
        AppointmentStatus: 'PEND',
      });
      resolve({
        errCode: 0,
        errMessage: 'Đăng ký lịch hẹn thành công!',
        data: null,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi đăng ký: ' + e.message,
        data: null,
      });
    }
  });
};

let getAvailableTimes = (appointmentDate, veterinarianID, serviceID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!appointmentDate || !serviceID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }

      let duration;
      if (serviceID === 'ALL') {
        const services = await db.Service.findAll({
          attributes: [[db.sequelize.fn('MIN', db.sequelize.col('Duration')), 'minDuration']],
          raw: true,
        });
        if (!services || services.length === 0 || !services[0].minDuration) {
          resolve({
            errCode: 1,
            errMessage: 'Không tìm thấy dịch vụ nào!',
            data: null,
          });
          return;
        }
        duration = services[0].minDuration;
      } else {
        const service = await db.Service.findOne({ where: { ServiceID: serviceID } });
        if (!service) {
          resolve({
            errCode: 1,
            errMessage: 'Dịch vụ không tồn tại!',
            data: null,
          });
          return;
        }
        duration = service.Duration;
      }

      const fixedTimes = ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];
      let availableTimes = [...fixedTimes];

      // Lấy danh sách Schedule theo ngày và bác sĩ (nếu có)
      let scheduleWhere = {};
      if (veterinarianID && veterinarianID !== 'ALL') {
        scheduleWhere.VeterinarianID = veterinarianID;
      }
      const schedules = await db.Schedule.findAll({
        where: scheduleWhere,
        attributes: ['AppointmentID', 'VeterinarianID'],
        raw: true,
      });

      // Lấy danh sách Appointment tương ứng
      const appointmentIDs = schedules.map((sch) => sch.AppointmentID);
      const appointments = await db.Appointment.findAll({
        where: {
          AppointmentID: { [Op.in]: appointmentIDs },
          AppointmentDate: appointmentDate,
        },
        attributes: ['AppointmentID', 'AppointmentDate', 'StartTime', 'EndTime'],
        raw: true,
      });

      // Tạo map để ánh xạ AppointmentID với VeterinarianID
      const scheduleMap = schedules.reduce((map, sch) => {
        map[sch.AppointmentID] = sch.VeterinarianID;
        return map;
      }, {});

      if (veterinarianID && veterinarianID !== 'ALL') {
        // Lọc khung giờ khả dụng cho bác sĩ cụ thể
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(appointmentDate);
          startTime.setHours(hours, minutes);
          const endTime = new Date(startTime.getTime() + duration * 60000);
          return !appointments.some((app) => {
            if (scheduleMap[app.AppointmentID] !== veterinarianID) return false;
            const appStart = new Date(`${app.AppointmentDate}T${app.StartTime}`);
            const appEnd = new Date(`${app.AppointmentDate}T${app.EndTime}`);
            return startTime < appEnd && endTime > appStart;
          });
        });
      } else {
        // Lọc khung giờ khả dụng khi không chọn bác sĩ
        const veterinarians = await db.VeterinarianInfo.findAll({
          attributes: ['AccountID'],
          raw: true,
        });
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(appointmentDate);
          startTime.setHours(hours, minutes);
          const endTime = new Date(startTime.getTime() + duration * 60000);
          return veterinarians.some((vet) => {
            const vetAppointments = appointments.filter((app) => scheduleMap[app.AppointmentID] === vet.AccountID);
            return !vetAppointments.some((app) => {
              const appStart = new Date(`${app.AppointmentDate}T${app.StartTime}`);
              const appEnd = new Date(`${app.AppointmentDate}T${app.EndTime}`);
              return startTime < appEnd && endTime > appStart;
            });
          });
        });
      }

      resolve({
        errCode: 0,
        errMessage: 'Lấy khung giờ thành công!',
        data: availableTimes,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy khung giờ: ' + e.message,
        data: null,
      });
    }
  });
};

let getServiceInfo = (serviceid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!serviceid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let data = null;
      if (serviceid === 'ALL') {
        const services = await db.Service.findAll({
          attributes: ['ServiceID', 'ServiceName', 'Price', 'Duration', 'Description'],
          raw: true,
        });
        if (!services || services.length === 0) {
          resolve({
            errCode: 1,
            errMessage: 'Không tìm thấy dịch vụ nào!',
            data: [],
          });
          return;
        }
        data = services;
      } else {
        const service = await db.Service.findOne({
          where: { ServiceID: serviceid },
          attributes: ['ServiceID', 'ServiceName', 'Price', 'Duration', 'Description'],
          raw: true,
        });
        if (!service) {
          resolve({
            errCode: 2,
            errMessage: 'Dịch vụ không tồn tại!',
            data: null,
          });
          return;
        }
        data = service;
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin dịch vụ thành công!',
        data,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin dịch vụ: ' + e.message,
        data: null,
      });
    }
  });
};

export default {
  createAppointment,
  getAvailableTimes,
  getServiceInfo,
};
