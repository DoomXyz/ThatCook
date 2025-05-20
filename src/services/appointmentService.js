import { Op, where } from 'sequelize';
import db from '../models/index.js';
import { checkAppointmentType, checkAppointmentStatus } from './utilitiesService';
import Appointment from '../models/Appointment.js';


let validateAppointmentInput = async (appointmentInfo) => {
  if (!appointmentInfo || Object.keys(appointmentInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin đặt lịch!',
      data: null,
    };
  }
  const { customername, customeremail, customerphone, appointmentdate, starttime, notes, accountid, veterinarianid, serviceid, petid, type, prevappointmentid } = appointmentInfo
  if (!customername) {
    return {
      errCode: -1,
      errMessage: 'Tên khách hàng không được để trống!',
      data: null,
    };
  } else {
    const customerName = customername.trim();
    const customerNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!customerNameRegex.test(customerName)) {
      return {
        errCode: 1,
        errMessage: 'Tên khách hàng sai định dạng!',
        data: null,
      };
    }
  }
  if (!customeremail) {
    return {
      errCode: -1,
      errMessage: 'Email không được để trống!',
      data: null,
    };
  } else {
    const customerEmail = customeremail.trim();
    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return {
        errCode: 1,
        errMessage: 'Email sai định dạng!',
        data: null,
      };
    }
  }
  if (!customerphone) {
    return {
      errCode: -1,
      errMessage: 'Số điện thoại không được để trống!',
      data: null,
    };
  } else {
    const phoneNumber = customerphone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại không hợp lệ!',
        data: null,
      };
    }
  }
  if (!appointmentdate || !starttime) {
    return {
      errCode: -1,
      errMessage: 'Ngày hoặc giờ hẹn không được để trống!',
      data: null,
    };
  } else {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(starttime)) {
      return {
        errCode: 1,
        errMessage: 'Giờ hẹn không hợp lệ (HH:mm)!',
        data: null,
      };
    }
    const dateCheck = new Date(appointmentdate);
    if (isNaN(dateCheck.getTime())) {
      return {
        errCode: 1,
        errMessage: 'Ngày hẹn không hợp lệ!',
        data: null,
      };
    }
    const [hours, minutes] = starttime.split(':').map(Number);
    dateCheck.setHours(hours, minutes, 0, 0);
    const now = new Date();
    if (dateCheck <= now) {
      return {
        errCode: 1,
        errMessage: 'Thời gian hẹn phải trong tương lai!',
        data: null,
      };
    }
  }
  if (notes) {
    const notesCheck = notes.trim();
    if (!notesCheck || notesCheck.length > 65535) {
      return {
        errCode: 1,
        errMessage: 'Mô tả tình trạng không hợp lệ hoặc vượt quá giới hạn ký tự!',
        data: null,
      };
    }
  }
  if (!accountid) {
    return {
      errCode: -1,
      errMessage: 'Tài khoản không được để trống!',
      data: null,
    };
  } else {
    const validAccount = await db.Pet.findOne({
      where: { AccountID: accountid }
    });
    if (!validAccount) {
      return {
        errCode: 2,
        errMessage: 'Tài khoản không tồn tại!',
        data: null,
      };
    }
  }
  if (veterinarianid) {
    const validVeterinarian = await db.VeterinarianInfo.findOne({
      where: { AccountID: veterinarianid },
    });
    if (!validVeterinarian) {
      return {
        errCode: 2,
        errMessage: 'Bác sĩ không tồn tại trong hệ thống!',
        data: null,
      };
    }
  }
  if (!serviceid) {
    return {
      errCode: -1,
      errMessage: 'Dịch vụ không được để trống!',
      data: null,
    };
  } else {
    const validService = await db.Service.findOne({
      where: { ServiceID: serviceid }
    });
    if (!validService) {
      return {
        errCode: 2,
        errMessage: 'Dịch vụ không tồn tại!',
        data: null,
      };
    }
  }
  if (!petid) {
    return {
      errCode: -1,
      errMessage: 'Thú cưng không được để trống!',
      data: null,
    };
  } else {
    const validPet = await db.Pet.findOne({
      where: { PetID: petid }
    });
    if (!validPet) {
      return {
        errCode: 2,
        errMessage: 'Thú cưng không tồn tại!',
        data: null,
      };
    }
  }
  if (!type) {
    return {
      errCode: -1,
      errMessage: 'Loại lịch hẹn không được để trống!',
      data: null,
    };
  } else {
    const validAppointmentType = await checkAppointmentType(type);
    if (!validAppointmentType) {
      return {
        errCode: 1,
        errMessage: 'Loại lịch hẹn không hợp lệ!',
        data: null,
      };
    }
  }
  if (prevappointmentid) {
    const validPrevAppointment = await db.Appointment.findOne({
      where: { AppointmentID: prevappointmentid }
    })
    if (!validPrevAppointment) {
      return {
        errCode: 2,
        errMessage: 'Không tìm thấy lần hẹn trước!',
        data: null,
      };
    }
  }
  return null;
};
let generateAppointmentID = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const prefix = 'S';
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
let createAppointment = (customername, customeremail, customerphone, appointmentdate, starttime, notes, accountid, veterinarianid, serviceid, petid, imageInfo, type, prevappointmentid) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const appointmentInfo = { customername, customeremail, customerphone, appointmentdate, starttime, notes, accountid, veterinarianid, serviceid, petid, imageInfo, type, prevappointmentid };
      let isValidateInput = await validateAppointmentInput(appointmentInfo);
      if (isValidateInput) {
        resolve(isValidateInput);
        return;
      }
      const existService = await db.Service.findOne({
        where: { ServiceID: serviceid }
      });
      if (!existService) {
        resolve({
          errCode: 2,
          errMessage: 'Dịch vụ không tồn tại!',
          data: null,
        })
        return;
      }
      const duration = existService.Duration;
      const [startHours, startMinutes] = starttime.split(':').map(Number);
      const startDateTime = new Date(appointmentdate);
      startDateTime.setHours(startHours, startMinutes);
      const endTime = new Date(startDateTime.getTime() + duration * 60000);
      const appointments = await db.Appointment.findAll({
        where: {
          AppointmentDate: appointmentdate,
          VeterinarianID: veterinarianid ? veterinarianid : { [Op.ne]: null },
        },
        attributes: ['AppointmentID', 'AppointmentDate', 'StartTime', 'EndTime', 'VeterinarianID'],
        raw: true,
      });
      if (veterinarianid) {
        const isConflict = appointments.some((app) => {
          const appStart = new Date(`${app.AppointmentDate}T${app.StartTime}`);
          const appEnd = new Date(`${app.AppointmentDate}T${app.EndTime}`);
          return (
            app.VeterinarianID === veterinarianid &&
            startDateTime < appEnd &&
            endTime > appStart
          );
        });
        if (isConflict) {
          resolve({
            errCode: 1,
            errMessage: 'Khung giờ của bác sĩ này đã được đặt!',
            data: null,
          });
          return;
        }
      } else {
        const veterinarians = await db.VeterinarianInfo.findAll({
          attributes: ['AccountID'],
          raw: true,
        });
        const hasAvailableVet = veterinarians.some((vet) => {
          const vetAppointments = appointments.filter((app) => app.VeterinarianID === vet.AccountID);
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
        AppointmentType: 'FIRST'
      }, { transaction });
      if (imageInfo && imageInfo.length > 0) {
        if (imageInfo.length > 3) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Tối đa 3 hình ảnh!',
            data: null,
          });
          return;
        }
        for (const image of imageInfo) {
          if (!image.Image || image.Image.trim().length > 2048) {
            await transaction.rollback();
            resolve({
              errCode: 1,
              errMessage: 'URL ảnh không hợp lệ hoặc vượt quá 2048 ký tự!',
              data: null,
            });
            return;
          }
          await db.Image.create({
            Image: image.Image.trim(),
            ReferenceType: 'Appointment',
            ReferenceID: appointmentID,
          }, { transaction });
        }
      }
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Đăng ký lịch hẹn thành công!',
        data: { AppointmentID: appointmentID },
      });
    } catch (e) {
      await transaction.rollback();
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
      // lấy thêm thông tin cho chỉ lấy serviceid mà veterinarianid đó có làm
      if (!appointmentDate || !serviceID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const dateCheck = new Date(appointmentDate);
      if (isNaN(dateCheck.getTime())) {
        resolve({
          errCode: 1,
          errMessage: 'Ngày hẹn không hợp lệ!',
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
      let vetIds = veterinarianID && veterinarianID !== 'ALL' ? [veterinarianID] : (await db.VeterinarianInfo.findAll({ attributes: ['AccountID'], raw: true })).map(vet => vet.AccountID);
      // Lấy lịch làm việc từ Schedule
      const schedules = await db.Schedule.findAll({
        where: {
          VeterinarianID: { [Op.in]: vetIds },
          Date: appointmentDate,
          ScheduleStatus: 'AVAILABLE',
        },
        attributes: ['VeterinarianID', 'StartTime', 'EndTime'],
        raw: true,
      });
      // Lấy lịch hẹn từ Appointment
      const appointments = await db.Appointment.findAll({
        where: {
          VeterinarianID: { [Op.in]: vetIds },
          AppointmentDate: appointmentDate,
        },
        attributes: ['VeterinarianID', 'StartTime', 'EndTime'],
        raw: true,
      });
      if (veterinarianID && veterinarianID !== 'ALL') {
        // Lọc khung giờ khả dụng cho bác sĩ cụ thể
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(appointmentDate);
          startTime.setHours(hours, minutes);
          const endTime = new Date(startTime.getTime() + duration * 60000);
          // Kiểm tra lịch làm việc
          const hasScheduleConflict = schedules.some((sch) => {
            if (sch.VeterinarianID !== veterinarianID) return false;
            const schStart = new Date(`${appointmentDate}T${sch.StartTime}`);
            const schEnd = new Date(`${appointmentDate}T${sch.EndTime}`);
            return startTime < schEnd && endTime > schStart;
          });
          // Kiểm tra lịch hẹn
          const hasAppointmentConflict = appointments.some((app) => {
            if (app.VeterinarianID !== veterinarianID) return false;
            const appStart = new Date(`${appointmentDate}T${app.StartTime}`);
            const appEnd = new Date(`${appointmentDate}T${app.EndTime}`);
            return startTime < appEnd && endTime > appStart;
          });
          return !hasScheduleConflict && !hasAppointmentConflict;
        });
      } else {
        // Lọc khung giờ khả dụng khi không chọn bác sĩ
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(appointmentDate);
          startTime.setHours(hours, minutes);
          const endTime = new Date(startTime.getTime() + duration * 60000);
          return vetIds.some((vetId) => {
            // Kiểm tra lịch làm việc
            const hasScheduleConflict = schedules.some((sch) => {
              if (sch.VeterinarianID !== vetId) return false;
              const schStart = new Date(`${appointmentDate}T${sch.StartTime}`);
              const schEnd = new Date(`${appointmentDate}T${sch.EndTime}`);
              return startTime < schEnd && endTime > schStart;
            });
            // Kiểm tra lịch hẹn
            const hasAppointmentConflict = appointments.some((app) => {
              if (app.VeterinarianID !== vetId) return false;
              const appStart = new Date(`${appointmentDate}T${app.StartTime}`);
              const appEnd = new Date(`${appointmentDate}T${app.EndTime}`);
              return startTime < appEnd && endTime > appStart;
            });
            return !hasScheduleConflict && !hasAppointmentConflict;
          });
        });
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy khung giờ thành công!',
        data: availableTimes,
      });
    } catch (e) {
      console.log('Error in getAvailableTimes: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy khung giờ: ${e.message}`,
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
let loadPendingAppointments = (veterinarianid, page, limit, search, filter, sort, date1, date2) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!veterinarianid || !page || !limit || page < 1 || limit < 1) {
        resolve({
          errCode: -1,
          errMessage: 'Tham số veterinarianid, page hoặc limit không hợp lệ!',
          data: null,
        });
        return;
      }
      if (filter !== 'ALL' && !filter.includes('-')) {
        resolve({
          errCode: 1,
          errMessage: 'Tham số filter không hợp lệ!',
          data: null,
        });
        return;
      }
      if (sort && !['0', '1', '2'].includes(sort)) {
        resolve({
          errCode: 1,
          errMessage: 'Tham số sort không hợp lệ!',
          data: null,
        });
        return;
      }
      const offset = (page - 1) * limit;
      let where = {
        AppointmentStatus: 'PEND', // Chỉ lấy các cuộc hẹn đang chờ xử lý
      };
      let order = [];
      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 50);
        // where[Op.or] = [
        //   { '$Service.ServiceName$': { [Op.like]: `%${searchTerm}%` } },
        //   { '$Pet.PetName$': { [Op.like]: `%${searchTerm}%` } },
        // ];
      }
      if (date1 && date2) {
        where.AppointmentDate = { [Op.between]: [date1, date2] };
      } else if (date1) {
        where.AppointmentDate = { [Op.gte]: date1 };
      } else if (date2) {
        where.AppointmentDate = { [Op.lte]: date2 };
      }
      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        if (field === 'veterinarian') {
          if (value === 'PRIVATE') {
            where.VeterinarianID = veterinarianid;
          } else if (value === 'PUBLIC') {
            where.VeterinarianID = null;
          } else {
            resolve({
              errCode: 1,
              errMessage: 'Giá trị filter veterinarian không hợp lệ!',
              data: null,
            });
            return;
          }
        } else {
          resolve({
            errCode: 1,
            errMessage: 'Tham số filter không hợp lệ!',
            data: null,
          });
          return;
        }
      } else {
        where[Op.or] = [
          { VeterinarianID: null },
          { VeterinarianID: veterinarianid },
        ];
      }
      switch (sort) {
        case '1': // Cuộc hẹn mới nhất
          order.push(['AppointmentDate', 'DESC'], ['StartTime', 'DESC']);
          break;
        case '2': // Cuộc hẹn cũ nhất
          order.push(['AppointmentDate', 'ASC'], ['StartTime', 'ASC']);
          break;
        default: // Mặc định (0)
          order.push(['AppointmentDate', 'ASC'], ['StartTime', 'ASC']);
          break;
      }
      const { count, rows } = await db.Appointment.findAndCountAll({
        where,
        attributes: [
          'AppointmentID',
          'AppointmentDate',
          'StartTime',
          'EndTime',
          'ServiceID',
          'VeterinarianID',
          'CustomerName',
        ],
        include: [
          {
            model: db.Service,
            as: 'Service',
            attributes: ['ServiceName'],
            required: true,
          },
          {
            model: db.Pet,
            as: 'Pet',
            attributes: ['PetName'],
            required: true,
          },
        ],
        limit: parseInt(limit),
        offset,
        order,
        raw: false,
        distinct: true,
        nest: true,
      });

      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy cuộc hẹn nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }
      const data = rows.map(row => ({
        AppointmentID: row.AppointmentID,
        AppointmentDate: row.AppointmentDate,
        StartTime: row.StartTime,
        EndTime: row.EndTime,
        ServiceID: row.ServiceID,
        ServiceName: row.Service.ServiceName,
        PetName: row.Pet.PetName,
        VeterinarianID: row.VeterinarianID,
        CustomerName: row.CustomerName,
      }));

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách cuộc hẹn thành công!',
        data,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadPendingAppointments: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách cuộc hẹn: ${e.message}`,
        data: null,
      });
    }
  });
};
let changeAppointmentStatus = (appointmentid, appointmentstatus, veterinarianid) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!appointmentid || !appointmentstatus || !veterinarianid) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const validAppointmentStatus = await checkAppointmentStatus(appointmentstatus);
      if (!validAppointmentStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái lịch hẹn không hợp lệ!',
          data: null,
        });
        return;
      }
      const appointment = await db.Appointment.findOne({
        where: { AppointmentID: appointmentid },
        transaction,
      });
      if (!appointment) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Lịch hẹn không tồn tại!',
          data: null,
        });
        return;
      }
      if (appointment.AppointmentStatus === appointmentstatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      await db.Appointment.update(
        { AppointmentStatus: appointmentstatus },
        { where: { AppointmentID: appointmentid }, transaction }
      );
      if (appointmentstatus === 'CONF') {
        // Tạo bản ghi trong Schedule khi trạng thái là 'CONF'
        await db.Schedule.create({
          VeterinarianID: veterinarianid,
          AppointmentID: appointment.AppointmentID,
          Date: appointment.AppointmentDate,
          StartTime: appointment.StartTime,
          EndTime: appointment.EndTime,
          ScheduleStatus: 'PEND',
        }, { transaction });
      } else {
        // Xóa bản ghi trong Schedule nếu trạng thái không phải 'CONF'
        await db.Schedule.destroy({
          where: { AppointmentID: appointmentid },
          transaction,
        });
      }
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Thay đổi trạng thái lịch hẹn thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi thay đổi trạng thái: ' + e.message,
        data: null,
      });
    }
  });
};

export default {
  createAppointment,
  getAvailableTimes,
  getServiceInfo,
  loadPendingAppointments,
  changeAppointmentStatus,
};