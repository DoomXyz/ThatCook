import { Op, where } from 'sequelize';
import db from '../models/index.js';
import { checkAppointmentType, checkAppointmentStatus } from './utilitiesService';

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
      where: { ServiceID: serviceid, ServiceStatus: 'VALID' }
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
let validateAppointmentBillInput = async (appointmentBillInfo) => {
  if (!appointmentBillInfo || Object.keys(appointmentBillInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin hóa đơn!',
      data: null,
    };
  }
  const { veterinarianid, appointmentid, serviceprice, medicalprice, medicalimage, medicalnotes } = appointmentBillInfo;
  if (!appointmentid) {
    return {
      errCode: -1,
      errMessage: 'Mã lịch hẹn không được để trống!',
      data: null,
    };
  } else {
    const validAppointment = await db.Appointment.findOne({
      where: { AppointmentID: appointmentid },
    });
    if (!validAppointment) {
      return {
        errCode: 2,
        errMessage: 'Lịch hẹn không tồn tại!',
        data: null,
      };
    }
  }
  if (!veterinarianid) {
    return {
      errCode: -1,
      errMessage: 'Mã bác sĩ không được để trống!',
      data: null,
    };
  } else {
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
  if (!serviceprice || serviceprice <= 0) {
    return {
      errCode: -1,
      errMessage: 'Giá dịch vụ không hợp lệ!',
      data: null,
    };
  }
  if (!medicalprice || medicalprice < 0) {
    return {
      errCode: -1,
      errMessage: 'Giá thuốc không hợp lệ!',
      data: null,
    };
  }
  if (medicalimage) {
    const imageCheck = medicalimage.trim();
    if (!imageCheck || imageCheck.length > 2048) {
      return {
        errCode: 1,
        errMessage: 'URL ảnh không hợp lệ hoặc vượt quá 2048 ký tự!',
        data: null,
      };
    }
  }
  if (medicalnotes) {
    const notesCheck = medicalnotes.trim();
    if (!notesCheck || notesCheck.length > 65535) {
      return {
        errCode: 1,
        errMessage: 'Ghi chú y tế không hợp lệ hoặc vượt quá giới hạn ký tự!',
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
let generateAppointmentBillID = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const prefix = 'B';
      // Get timestamp
      const timestamp = Date.now().toString();
      // Get last 9 digits from timestamp
      const timestampDigits = timestamp.slice(-9);
      let appointmentBillId = `${prefix}${timestampDigits}`;
      // Check if appointmentBillId exists in DB
      let existingBill = await db.AppointmentBill.findOne({
        where: { AppointmentBillID: appointmentBillId },
      });
      // If exists, retry with new timestamp (max 5 attempts)
      let attempts = 0;
      while (existingBill && attempts < 5) {
        const newTimestamp = Date.now().toString();
        const newTimestampDigits = newTimestamp.slice(-9);
        appointmentBillId = `${prefix}${newTimestampDigits}`;
        attempts++;
        existingBill = await db.AppointmentBill.findOne({
          where: { AppointmentBillID: appointmentBillId },
        });
      }
      if (attempts >= 5) {
        resolve({
          errCode: 1,
          errMessage: 'Failed to generate bill ID!',
          data: null,
        });
      }
      resolve(appointmentBillId);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Error generating bill ID: ' + e.message,
        data: null,
      });
    }
  });
};
let cancelExpiredAppointments = () => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const currentDateTime = new Date();
      const pendingAppointments = await db.Appointment.findAll({
        where: {
          AppointmentStatus: 'PEND'
        },
        attributes: ['AppointmentID', 'AppointmentDate', 'StartTime'],
        raw: true,
        transaction,
      });
      const expiredAppointments = pendingAppointments.filter(app => {
        const dateStr = app.AppointmentDate.toISOString().split('T')[0]; // Lấy YYYY-MM-DD
        const appointmentStart = new Date(`${dateStr}T${app.StartTime}+07:00`);
        return appointmentStart < currentDateTime;
      });
      if (!expiredAppointments || expiredAppointments.length === 0) {
        await transaction.commit();
        resolve({
          errCode: 0,
          errMessage: 'Không có lịch hẹn quá hạn để hủy!',
          data: null
        });
        return;
      }
      const appointmentIDs = expiredAppointments.map(app => app.AppointmentID);
      await db.Appointment.update(
        { AppointmentStatus: 'CANCELED' },
        {
          where: { AppointmentID: { [Op.in]: appointmentIDs } },
          transaction
        }
      );
      await db.Schedule.destroy({
        where: { AppointmentID: { [Op.in]: appointmentIDs } },
        transaction
      });
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Hủy các lịch hẹn quá hạn thành công!',
        data: { canceledCount: expiredAppointments.length }
      });
    } catch (e) {
      await transaction.rollback();
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi hủy lịch hẹn quá hạn: ${e.message}`,
        data: null
      });
    }
  });
};
const confirmAppointment = async (appointmentid, veterinarianid, transaction) => {
  try {
    const appointment = await db.Appointment.findOne({
      where: { AppointmentID: appointmentid },
      transaction,
    });
    if (!appointment) {
      throw new Error('Lịch hẹn không tồn tại!');
    }
    if (appointment.VeterinarianID && appointment.VeterinarianID !== veterinarianid) {
      throw new Error('Lịch hẹn không thuộc bác sĩ này!');
    }
    // if (!appointment.VeterinarianID) {
    //   await db.Appointment.update(
    //     { VeterinarianID: veterinarianid },
    //     { where: { AppointmentID: appointmentid }, transaction }
    //   );
    // }
    await db.Appointment.update(
      { AppointmentStatus: 'CONF' },
      { where: { AppointmentID: appointmentid }, transaction }
    );
    const conflictingAppointments = await db.Appointment.findAll({
      where: {
        VeterinarianID: veterinarianid,
        AppointmentDate: appointment.AppointmentDate,
        AppointmentID: { [Op.ne]: appointmentid },
        AppointmentStatus: 'PEND',
      },
      transaction,
    });
    const dateStr = appointment.AppointmentDate.toISOString().split('T')[0];
    const appointmentStart = new Date(`${dateStr}T${appointment.StartTime}`);
    const appointmentEnd = new Date(`${dateStr}T${appointment.EndTime}`);
    for (const conflictingApp of conflictingAppointments) {
      const conflictingStart = new Date(`${conflictingApp.AppointmentDate.toISOString().split('T')[0]}T${conflictingApp.StartTime}`);
      const conflictingEnd = new Date(`${conflictingApp.AppointmentDate.toISOString().split('T')[0]}T${conflictingApp.EndTime}`);
      if (appointmentStart < conflictingEnd && appointmentEnd > conflictingStart) {
        await db.Appointment.update(
          { AppointmentStatus: 'CANCELED' },
          { where: { AppointmentID: conflictingApp.AppointmentID }, transaction }
        );
        await db.Schedule.destroy({
          where: { AppointmentID: conflictingApp.AppointmentID },
          transaction,
        });
      }
    }
    await db.Schedule.create({
      VeterinarianID: veterinarianid,
      AppointmentID: appointment.AppointmentID,
      Date: appointment.AppointmentDate,
      StartTime: appointment.StartTime,
      EndTime: appointment.EndTime,
      ScheduleStatus: 'PEND',
    }, { transaction });
    return {
      errCode: 0,
      errMessage: 'Xác nhận lịch hẹn thành công!',
    };
  } catch (e) {
    throw new Error(`Lỗi khi xác nhận lịch hẹn: ${e.message}`);
  }
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
        where: { ServiceID: serviceid, ServiceStatus: 'VALID' },
        transaction,
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
      let finalVeterinarianID = veterinarianid;
      if (type === 'FOLLOW_UP' && prevappointmentid) {
        const prevAppointment = await db.Appointment.findOne({
          where: { AppointmentID: prevappointmentid },
          attributes: ['VeterinarianID'],
          transaction,
        });
        if (!prevAppointment || !prevAppointment.VeterinarianID) {
          await transaction.rollback();
          resolve({
            errCode: 2,
            errMessage: 'Lịch hẹn trước không tồn tại hoặc chưa có bác sĩ!',
            data: null,
          });
          return;
        }
        finalVeterinarianID = prevAppointment.VeterinarianID;
      }
      const appointments = await db.Appointment.findAll({
        where: {
          AppointmentDate: appointmentdate,
          VeterinarianID: finalVeterinarianID ? finalVeterinarianID : { [Op.ne]: null },
        },
        attributes: ['AppointmentID', 'AppointmentDate', 'StartTime', 'EndTime', 'VeterinarianID'],
        raw: true,
        transaction,
      });
      if (finalVeterinarianID) {
        const isConflict = appointments.some((app) => {
          const appStart = new Date(`${app.AppointmentDate}T${app.StartTime}`);
          const appEnd = new Date(`${app.AppointmentDate}T${app.EndTime}`);
          return (
            app.VeterinarianID === finalVeterinarianID &&
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
          transaction,
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
      const appointmentStatus = type === 'FOLLOW_UP' ? 'CONF' : 'PEND';
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
        VeterinarianID: finalVeterinarianID,
        ServiceID: serviceid,
        PetID: petid,
        CreatedAt: createdAt,
        AppointmentStatus: appointmentStatus,
        AppointmentType: type,
        PrevAppointmentID: prevappointmentid,
      }, { transaction });
      if (type === 'FOLLOW_UP' && finalVeterinarianID) {
        await db.Schedule.create({
          VeterinarianID: finalVeterinarianID,
          AppointmentID: appointmentID,
          Date: appointmentdate,
          StartTime: starttime,
          EndTime: endTime.toTimeString().slice(0, 5),
          ScheduleStatus: 'PEND',
        }, { transaction });
      }
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
  console.log(appointmentDate, veterinarianID);
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra tham số
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
      const service = await db.Service.findOne({
        where: { ServiceID: serviceID, ServiceStatus: 'VALID' }
      });
      if (!service) {
        resolve({
          errCode: 1,
          errMessage: 'Dịch vụ không tồn tại!',
          data: null,
        });
        return;
      }
      const duration = service.Duration;
      console.log(duration)
      const fixedTimes = ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];
      let availableTimes = [...fixedTimes];

      let vetIds = veterinarianID && veterinarianID !== 'ALL'
        ? [veterinarianID]
        : (await db.VeterinarianInfo.findAll({ attributes: ['AccountID'], raw: true })).map(vet => vet.AccountID);

      // Lấy lịch làm việc
      const schedules = await db.Schedule.findAll({
        where: {
          VeterinarianID: { [Op.in]: vetIds },
          Date: appointmentDate,
          ScheduleStatus: 'PEND',
        },
        attributes: ['VeterinarianID', 'StartTime', 'EndTime'],
        raw: true,
      });

      if (veterinarianID && veterinarianID !== 'ALL') {
        // Trường hợp bác sĩ cụ thể
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(appointmentDate);
          startTime.setHours(hours, minutes);
          const endTime = new Date(startTime.getTime() + duration * 60000);

          // Kiểm tra nếu khung giờ trùng với lịch làm việc
          const isInSchedule = schedules.some((sch) => {
            if (sch.VeterinarianID !== veterinarianID) return false;
            const schStart = new Date(`${appointmentDate}T${sch.StartTime}`);
            const schEnd = new Date(`${appointmentDate}T${sch.EndTime}`);
            return startTime < schEnd && endTime > schStart;
          });

          return !isInSchedule;
        });
      } else {
        // Trường hợp ALL
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(appointmentDate);
          startTime.setHours(hours, minutes);
          const endTime = new Date(startTime.getTime() + duration * 60000);

          // Kiểm tra nếu tất cả bác sĩ đều có lịch làm việc bao phủ khung giờ
          const allVetsScheduled = vetIds.every((vetId) => {
            return schedules.some((sch) => {
              if (sch.VeterinarianID !== vetId) return false;
              const schStart = new Date(`${appointmentDate}T${sch.StartTime}`);
              const schEnd = new Date(`${appointmentDate}T${sch.EndTime}`);
              return startTime < schEnd && endTime > schStart;
            });
          });

          return !allVetsScheduled;
        });
      }
      console.log(availableTimes)
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
          where: { ServiceStatus: 'VALID' },
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
          where: { ServiceID: serviceid, ServiceStatus: 'VALID' },
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
let loadAppointments = (veterinarianid, page, limit, search, filter, sort, date1, date2, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!status || !['PEND', 'COMP'].includes(status)) {
        resolve({
          errCode: -1,
          errMessage: 'Trạng thái lịch hẹn không hợp lệ!',
          data: null,
        });
        return;
      }
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
      await cancelExpiredAppointments()
      const offset = (page - 1) * limit;
      let where = {
        AppointmentStatus: status
      };
      let order = [];
      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 50);
        //khi nào cần search thì thay sau
        // where[Op.or] = [
        //   { '$Service.ServiceName$': { [Op.like]: `%${searchTerm}%` } },
        //   { '$Pet.PetName$': { [Op.like]: `%${searchTerm}%` } },
        // ];
      }
      let start = new Date(date1);
      let end = new Date(date2);
      if (date1 && date2) {
        if (start > end) {
          [start, end] = [end, start];
        }
        start.setHours(0, 0, 0, 0); // Đầu ngày sớm hơn
        end.setHours(23, 59, 59, 999); // Cuối ngày muộn hơn
        where.AppointmentDate = { [Op.between]: [start, end] };
      } else if (date1) {
        start.setHours(0, 0, 0, 0);
        where.AppointmentDate = { [Op.gte]: start };
      } else if (date2) {
        end.setHours(0, 0, 0, 0);
        where.AppointmentDate = { [Op.lte]: end };
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
        } else if (field === 'service') {
          const validService = await db.Service.findOne({
            where: { ServiceID: value },
          });
          if (!validService) {
            resolve({
              errCode: 1,
              errMessage: 'Dịch vụ không tồn tại!',
              data: null,
            });
            return;
          }
          where.ServiceID = value;
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
          order.push([db.sequelize.literal(`CONCAT(AppointmentDate, ' ', StartTime)`), 'DESC']);
          break;
        case '2': // Cuộc hẹn cũ nhất
          order.push([db.sequelize.literal(`CONCAT(AppointmentDate, ' ', StartTime)`), 'ASC']);
          break;
        default: // Mặc định (0)
          order.push([db.sequelize.literal(`CONCAT(AppointmentDate, ' ', StartTime)`), 'ASC']);
          break;
      }
      const { count, rows } = await db.Appointment.findAndCountAll({
        where: {
          ...where,
          AppointmentID: {
            [Op.notIn]: db.sequelize.literal(`
              (SELECT a.AppointmentID
               FROM Appointment a
               INNER JOIN Schedule s
               ON DATE(a.AppointmentDate) = s.Date
               AND a.StartTime < s.EndTime
               AND a.EndTime > s.StartTime
               WHERE s.VeterinarianID = '${veterinarianid}'
               AND s.ScheduleStatus = 'PEND'
               AND a.AppointmentStatus = 'PEND')
            `)
          }
        },
        attributes: [
          'AppointmentID',
          'AppointmentDate',
          'StartTime',
          'EndTime',
          'ServiceID',
          'VeterinarianID',
          'CustomerName',
          'Notes',
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
        ServiceName: row.Service.ServiceName,
        PetName: row.Pet.PetName,
        VeterinarianID: row.VeterinarianID,
        CustomerName: row.CustomerName,
        Notes: row.Notes
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
let loadAppointmentInfo = (accountid, page, limit, search, filter, sort, date1, date2) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid || !page || !limit || page < 1 || limit < 1) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu hoặc không hợp lệ tham số accountid, page, hoặc limit!',
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
      await cancelExpiredAppointments();

      const offset = (page - 1) * limit;
      let where = {
        AccountID: accountid, // Lọc theo accountid của người dùng
      };
      let order = [];
      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 50);
        where[Op.or] = [
          { '$Pet.PetName$': { [Op.like]: `%${searchTerm}%` } },
          { '$Service.ServiceName$': { [Op.like]: `%${searchTerm}%` } },
        ];
      }
      let start = date1 ? new Date(date1) : null;
      let end = date2 ? new Date(date2) : null;
      if (start && end) {
        if (start > end) {
          [start, end] = [end, start];
        }
        start.setHours(0, 0, 0, 0); // Đầu ngày
        end.setHours(23, 59, 59, 999); // Cuối ngày
        where.AppointmentDate = { [Op.between]: [start, end] };
      } else if (start) {
        start.setHours(0, 0, 0, 0);
        where.AppointmentDate = { [Op.gte]: start };
      } else if (end) {
        end.setHours(0, 0, 0, 0);
        where.AppointmentDate = { [Op.lte]: end };
      }
      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        if (field === 'status') {
          if (!['PEND', 'COMP', 'CANCELED'].includes(value)) {
            resolve({
              errCode: 1,
              errMessage: 'Trạng thái lịch hẹn không hợp lệ!',
              data: null,
            });
            return;
          }
          where.AppointmentStatus = value;
        } else if (field === 'service') {
          const validService = await db.Service.findOne({
            where: { ServiceID: value },
          });
          if (!validService) {
            resolve({
              errCode: 1,
              errMessage: 'Dịch vụ không tồn tại!',
              data: null,
            });
            return;
          }
          where.ServiceID = value;
        } else {
          resolve({
            errCode: 1,
            errMessage: 'Tham số filter không hợp lệ!',
            data: null,
          });
          return;
        }
      }
      switch (sort) {
        case '1': // Mới nhất
          order.push(['CreatedAt', 'DESC']);
          break;
        case '2': // Cũ nhất
          order.push(['CreatedAt', 'ASC']);
          break;
        default: // Mặc định
          order.push([db.sequelize.literal(`CONCAT(AppointmentDate, ' ', StartTime)`), 'ASC']);
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
          'CustomerName',
          'Notes',
          'AppointmentStatus',
          'VeterinarianID',
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
          {
            model: db.Account,
            as: 'Veterinarian',
            attributes: ['UserName'],
            required: false,
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
          errMessage: 'Không tìm thấy lịch hẹn nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }
      const data = rows.map((row) => ({
        AppointmentID: row.AppointmentID,
        AppointmentDate: row.AppointmentDate,
        StartTime: row.StartTime,
        EndTime: row.EndTime,
        ServiceName: row.Service.ServiceName,
        PetName: row.Pet.PetName,
        CustomerName: row.CustomerName,
        Notes: row.Notes,
        AppointmentStatus: row.AppointmentStatus,
        VeterinarianName: row.Veterinarian ? row.Veterinarian.UserName : 'Chưa phân bác sĩ',
      }));
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách lịch hẹn thành công!',
        data,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadAppointmentInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách lịch hẹn: ${e.message}`,
        data: null,
      });
    }
  });
};
let loadAppointmentDetails = (appointmentid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!appointmentid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã lịch hẹn!',
          data: null,
        });
        return;
      }

      const appointment = await db.Appointment.findOne({
        where: { AppointmentID: appointmentid },
        attributes: [
          'AppointmentID',
          'CustomerName',
          'CustomerEmail',
          'CustomerPhone',
          'AppointmentDate',
          'StartTime',
          'EndTime',
          'Notes',
          'AppointmentStatus',
          'AppointmentType',
          'PrevAppointmentID',
          'VeterinarianID',
        ],
        include: [
          {
            model: db.Service,
            as: 'Service',
            attributes: ['ServiceID', 'ServiceName', 'Price'],
            required: true,
          },
          {
            model: db.Pet,
            as: 'Pet',
            attributes: ['PetID', 'PetName', 'PetType', 'PetWeight', 'Age', 'PetGender'],
            required: true,
          },
          {
            model: db.AppointmentBill,
            as: 'AppointmentBill',
            attributes: ['AppointmentBillID', 'TotalPayment'],
            required: false,
          },
          {
            model: db.Image,
            as: 'Images',
            attributes: ['ImageID', 'Image'],
            where: { ReferenceType: 'Appointment' },
            required: false,
          },
          {
            model: db.Schedule,
            as: 'Schedule',
            attributes: ['ScheduleID', 'ScheduleStatus'],
            required: false,
          },
          {
            model: db.Account,
            as: 'Veterinarian',
            attributes: ['UserName', 'UserImage'],
            required: false,
            include: [
              {
                model: db.VeterinarianInfo,
                as: 'VeterinarianInfo',
                attributes: ['Specialization'],
                required: false,
              },
            ],
          },
        ],
        raw: false,
        nest: true,
      });

      if (!appointment) {
        resolve({
          errCode: 1,
          errMessage: 'Không tìm thấy lịch hẹn!',
          data: null,
        });
        return;
      }

      const data = {
        AppointmentID: appointment.AppointmentID,
        CustomerName: appointment.CustomerName,
        CustomerEmail: appointment.CustomerEmail,
        CustomerPhone: appointment.CustomerPhone,
        AppointmentDate: appointment.AppointmentDate,
        StartTime: appointment.StartTime.slice(0, 5),
        EndTime: appointment.EndTime.slice(0, 5),
        Notes: appointment.Notes || 'Không có ghi chú',
        AppointmentStatus: appointment.AppointmentStatus,
        AppointmentType: appointment.AppointmentType,
        PrevAppointmentID: appointment.PrevAppointmentID,
        Pet: {
          PetID: appointment.Pet.PetID,
          PetName: appointment.Pet.PetName,
          PetType: appointment.Pet.PetType,
          PetWeight: appointment.Pet.PetWeight,
          Age: appointment.Pet.Age,
          PetGender: appointment.Pet.PetGender,
        },
        Service: {
          ServiceID: appointment.Service.ServiceID,
          ServiceName: appointment.Service.ServiceName,
          Price: appointment.Service.Price,
        },
        AppointmentBill: appointment.AppointmentBill || null,
        Images: appointment.Images || [],
        ScheduleID: appointment.Schedule ? appointment.Schedule.ScheduleID : null,
        ScheduleStatus: appointment.Schedule ? appointment.Schedule.ScheduleStatus : null,
        VeterinarianID: appointment.VeterinarianID,
        Veterinarian: appointment.Veterinarian
          ? {
            AccountID: appointment.VeterinarianID,
            UserName: appointment.Veterinarian.UserName,
            UserImage: appointment.Veterinarian.UserImage,
            Specialization: appointment.Veterinarian.VeterinarianInfo?.Specialization || null,
          }
          : null,
      };

      resolve({
        errCode: 0,
        errMessage: 'Lấy chi tiết lịch hẹn thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in loadAppointmentDetails: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy chi tiết lịch hẹn: ${e.message}`,
        data: null,
      });
    }
  });
};
let changeAppointmentStatus = (appointmentid, appointmentstatus, veterinarianid) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      // Kiểm tra tham số
      if (!appointmentid || !appointmentstatus || !veterinarianid) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      // Kiểm tra trạng thái hợp lệ
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
      // Kiểm tra lịch hẹn
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
      // Kiểm tra trạng thái không thay đổi
      if (appointment.AppointmentStatus === appointmentstatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      if (appointmentstatus === 'CONF') {
        // Gọi hàm xác nhận
        const result = await confirmAppointment(appointmentid, veterinarianid, transaction);
        await transaction.commit();
        resolve({
          errCode: result.errCode,
          errMessage: result.errMessage,
          data: null,
        });
      } else {
        // Cập nhật trạng thái không phải CONF
        await db.Appointment.update(
          { AppointmentStatus: appointmentstatus },
          { where: { AppointmentID: appointmentid }, transaction }
        );
        // Xóa bản ghi Schedule
        await db.Schedule.destroy({
          where: { AppointmentID: appointmentid },
          transaction,
        });
        await transaction.commit();
        resolve({
          errCode: 0,
          errMessage: 'Thay đổi trạng thái lịch hẹn thành công!',
          data: null,
        });
      }
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
let createAppointmentBill = (veterinarianid, appointmentid, serviceprice, medicalprice, medicalimage, medicalnotes) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const appointmentbillInfo = { veterinarianid, appointmentid, serviceprice, medicalprice, medicalimage, medicalnotes };
      let isValidateInput = await validateAppointmentBillInput(appointmentbillInfo);
      if (isValidateInput) {
        resolve(isValidateInput);
        return;
      }
      const appointmentBillID = await generateAppointmentBillID();
      if (typeof appointmentBillID === 'object' && appointmentBillID.errCode) {
        resolve(appointmentBillID);
        return;
      }
      const appointmentBill = await db.AppointmentBill.create(
        {
          AppointmentBillID: appointmentBillID,
          AppointmentID: appointmentid,
          ServicePrice: serviceprice,
          MedicalPrice: medicalprice,
          TotalPayment: parseFloat(serviceprice) + parseFloat(medicalprice),
          MedicalImage: medicalimage,
          MedicalNotes: medicalnotes,
          CreatedAt: new Date(),
        },
        { transaction }
      );
      const schedule = await db.Schedule.findOne({
        where: { AppointmentID: appointmentid },
        transaction,
      });
      if (schedule) {
        await db.Schedule.update(
          { ScheduleStatus: 'COMP' },
          { where: { AppointmentID: appointmentid }, transaction }
        );
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
      await db.Appointment.update(
        {
          VeterinarianID: appointment.VeterinarianID || veterinarianid,
          AppointmentStatus: 'COMP',
        },
        { where: { AppointmentID: appointmentid }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Tạo hóa đơn lịch hẹn thành công!',
        data: { AppointmentID: appointmentBill.AppointmentID },
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi tạo hóa đơn: ' + e.message,
        data: null,
      });
    }
  });
};
let getAppointmentBillDetail = (appointmentbillid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!appointmentbillid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã hóa đơn lịch hẹn!',
          data: null,
        });
        return;
      }
      const appointmentBill = await db.AppointmentBill.findOne({
        where: { AppointmentBillID: appointmentbillid },
        attributes: [
          'AppointmentBillID',
          'AppointmentID',
          'ServicePrice',
          'MedicalPrice',
          'TotalPayment',
          'MedicalImage',
          'MedicalNotes',
          'CreatedAt',
        ],
        include: [
          {
            model: db.Appointment,
            as: 'Appointment',
            attributes: [
              'CustomerName',
              'CustomerEmail',
              'CustomerPhone',
              'AppointmentDate',
              'StartTime',
              'EndTime',
              'AppointmentStatus',
              'VeterinarianID',
              'ServiceID',
            ],
            include: [
              {
                model: db.Pet,
                as: 'Pet',
                attributes: ['PetType', 'PetGender', 'PetName'],
                required: true,
              },
              {
                model: db.Service,
                as: 'Service',
                attributes: ['ServiceName'],
                required: true,
              },
              {
                model: db.Account,
                as: 'Veterinarian',
                attributes: ['UserName'],
                required: false,
              },
            ],
            required: true,
          },
        ],
        raw: false,
        nest: true,
      });
      if (!appointmentBill) {
        resolve({
          errCode: 2,
          errMessage: 'Hóa đơn lịch hẹn không tồn tại!',
          data: null,
        });
        return;
      }
      const data = {
        AppointmentBill: {
          AppointmentBillID: appointmentBill.AppointmentBillID,
          AppointmentID: appointmentBill.AppointmentID,
          ServicePrice: appointmentBill.ServicePrice,
          MedicalPrice: appointmentBill.MedicalPrice,
          TotalPayment: appointmentBill.TotalPayment,
          MedicalImage: appointmentBill.MedicalImage,
          MedicalNotes: appointmentBill.MedicalNotes || 'Không có ghi chú',
          CreatedAt: appointmentBill.CreatedAt,
        },
        CustomerName: appointmentBill.Appointment.CustomerName,
        CustomerEmail: appointmentBill.Appointment.CustomerEmail,
        CustomerPhone: appointmentBill.Appointment.CustomerPhone,
        AppointmentDate: appointmentBill.Appointment.AppointmentDate,
        StartTime: appointmentBill.Appointment.StartTime.slice(0, 5),
        EndTime: appointmentBill.Appointment.EndTime.slice(0, 5),
        AppointmentStatus: appointmentBill.Appointment.AppointmentStatus,
        Pet: {
          PetType: appointmentBill.Appointment.Pet.PetType,
          PetGender: appointmentBill.Appointment.Pet.PetGender,
          PetName: appointmentBill.Appointment.Pet.PetName,
        },
        Service: {
          ServiceName: appointmentBill.Appointment.Service.ServiceName,
        },
        VeterinarianID: appointmentBill.Appointment.VeterinarianID,
        VeterinarianName: appointmentBill.Appointment.Veterinarian ? appointmentBill.Appointment.Veterinarian.UserName : null,
      };
      resolve({
        errCode: 0,
        errMessage: 'Lấy chi tiết hóa đơn lịch hẹn thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in getAppointmentBillDetailInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy chi tiết hóa đơn lịch hẹn: ${e.message}`,
        data: null,
      });
    }
  });
};

export default {
  createAppointment,
  getAvailableTimes,
  getServiceInfo,
  loadAppointments,
  loadAppointmentInfo,
  loadAppointmentDetails,
  changeAppointmentStatus,
  createAppointmentBill,
  getAppointmentBillDetail,
};