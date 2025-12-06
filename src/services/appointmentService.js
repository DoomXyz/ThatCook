import { Op } from 'sequelize';
import db from '../models/index';
import { generateID, checkValidAllCode } from './utilitiesService';
import { getPetInfo } from './petService';
import { sendNotification } from './utilitiesService';
import querystring from 'qs';
import crypto from 'crypto';
const nodemailer = require('nodemailer');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

let sendAppointmentEmail = async (AppointmentID, Email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // Retrieve appointment details
    const appointment = await db.Appointment.findOne({
      where: { AppointmentID },
      attributes: ['AppointmentID', 'CustomerName', 'CustomerPhone', 'AppointmentDate', 'StartTime', 'EndTime', 'AppointmentStatus', 'AppointmentType', 'Notes', 'ServiceID', 'PetID', 'VeterinarianID', 'CreatedAt', 'AccountID'],
      include: [
        {
          model: db.Service,
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
      raw: true,
      nest: true,
    });
    if (!appointment) {
      return false;
    }

    const petResult = await getPetInfo(appointment.AccountID, appointment.PetID);
    const PetName = petResult.errCode === 0 ? petResult.data.PetName : 'Thú cưng (đã xóa)';
    const PetType = petResult.errCode === 0 ? petResult.data.PetType : '';

    // Retrieve appointment status and type from AllCodes
    const AppointmentStatus = await db.AllCodes.findOne({
      where: { Type: 'AppointmentStatus', Code: appointment.AppointmentStatus },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    const AppointmentType = await db.AllCodes.findOne({
      where: { Type: 'AppointmentType', Code: appointment.AppointmentType },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    // Format the Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: `Lịch hẹn #${appointment.AppointmentID} - Xác nhận đặt lịch`,
      text: `
        Kính gửi Quý khách,

        Cảm ơn quý khách đã đặt lịch tại trung tâm thú y của chúng tôi! Dưới đây là chi tiết lịch hẹn của quý khách:

        Mã lịch hẹn: ${appointment.AppointmentID}
        Tên khách hàng: ${appointment.CustomerName}
        Số điện thoại: ${appointment.CustomerPhone}
        Ngày hẹn: ${new Date(appointment.AppointmentDate).toLocaleDateString('vi-VN')}
        Giờ hẹn: ${appointment.StartTime.slice(0, 5)} - ${appointment.EndTime.slice(0, 5)}
        Tên thú cưng: ${PetName} (${PetType || 'Không xác định'})
        Dịch vụ: ${appointment.Service.ServiceName}
        Bác sĩ phụ trách: ${appointment.Veterinarian?.UserName || 'Chưa phân bác sĩ'}
        Loại lịch hẹn: ${AppointmentType?.CodeValueVI || appointment.AppointmentType}
        Trạng thái lịch hẹn: ${AppointmentStatus?.CodeValueVI || appointment.AppointmentStatus}
        Ghi chú: ${appointment.Notes || 'Không có ghi chú'}
        Ngày đặt lịch: ${new Date(appointment.CreatedAt).toLocaleString('vi-VN')}

        Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.

        Trân trọng,
        Đội ngũ trung tâm thú y
      `,
    };

    // Send the Email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log('Lỗi khi gửi Email: ', e);
    return false;
  }
};
let sendAppointmentBillEmail = async (AppointmentBillID, Email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // Retrieve appointment bill details
    const appointmentBill = await db.AppointmentBill.findOne({
      where: { AppointmentBillID },
      attributes: ['AppointmentBillID', 'AppointmentID', 'ServicePrice', 'MedicalPrice', 'TotalPayment', 'MedicalNotes', 'CreatedAt'],
      include: [
        {
          model: db.Appointment,
          attributes: ['CustomerName', 'CustomerPhone', 'AppointmentDate', 'StartTime', 'EndTime', 'AppointmentStatus', 'ServiceID', 'PetID', 'VeterinarianID', 'AccountID'],
          include: [
            {
              model: db.Service,
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
      raw: true,
      nest: true,
    });
    if (!appointmentBill) {
      return false;
    }
    const petResult = await getPetInfo(appointmentBill.Appointment.AccountID, appointmentBill.Appointment.PetID);
    const PetName = petResult.errCode === 0 ? petResult.data.PetName : 'Thú cưng (đã xóa)';
    const PetType = petResult.errCode === 0 ? petResult.data.PetType : '';
    // Retrieve appointment status from AllCodes
    const AppointmentStatus = await db.AllCodes.findOne({
      where: { Type: 'AppointmentStatus', Code: appointmentBill.Appointment.AppointmentStatus },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    // Format the Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: `Hóa đơn lịch hẹn #${appointmentBill.AppointmentBillID} - Xác nhận thanh toán`,
      text: `
        Kính gửi Quý khách,

        Cảm ơn quý khách đã sử dụng dịch vụ tại trung tâm của chúng tôi! Dưới đây là chi tiết hóa đơn lịch hẹn của quý khách:

        Mã hóa đơn: ${appointmentBill.AppointmentBillID}
        Mã lịch hẹn: ${appointmentBill.AppointmentID}
        Tên khách hàng: ${appointmentBill.Appointment.CustomerName}
        Số điện thoại: ${appointmentBill.Appointment.CustomerPhone}
        Ngày hẹn: ${new Date(appointmentBill.Appointment.AppointmentDate).toLocaleDateString('vi-VN')}
        Giờ hẹn: ${appointmentBill.Appointment.StartTime.slice(0, 5)} - ${appointmentBill.Appointment.EndTime.slice(0, 5)}
        Tên thú cưng: ${PetName} (${PetType || 'Không xác định'})
        Dịch vụ: ${appointmentBill.Appointment.Service.ServiceName}
        Bác sĩ phụ trách: ${appointmentBill.Appointment.Veterinarian?.UserName || 'Chưa phân bác sĩ'}
        Chi phí dịch vụ: ${parseFloat(appointmentBill.ServicePrice).toLocaleString('vi-VN')} VND
        Chi phí thuốc: ${parseFloat(appointmentBill.MedicalPrice).toLocaleString('vi-VN')} VND
        Tổng thanh toán: ${parseFloat(appointmentBill.TotalPayment).toLocaleString('vi-VN')} VND
        Ghi chú y tế: ${appointmentBill.MedicalNotes || 'Không có ghi chú'}
        Trạng thái lịch hẹn: ${AppointmentStatus?.CodeValueVI || appointmentBill.Appointment.AppointmentStatus}
        Ngày tạo hóa đơn: ${new Date(appointmentBill.CreatedAt).toLocaleString('vi-VN')}

        Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.

        Trân trọng,
        Đội ngũ trung tâm thú y
      `,
    };
    // Send the Email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log('Lỗi khi gửi Email: ', e);
    return false;
  }
};
let validateAppointmentInput = async (appointmentInfo) => {
  if (!appointmentInfo || Object.keys(appointmentInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin đặt lịch!',
      data: null,
    };
  }
  const { CustomerName, CustomerEmail, CustomerPhone, AppointmentDate, StartTime, Notes, AccountID, VeterinarianID, ServiceID, PetID, Type, PrevAppointmentID } = appointmentInfo;
  if (!CustomerName) {
    return {
      errCode: -1,
      errMessage: 'Tên khách hàng không được để trống!',
      data: null,
    };
  } else {
    const customerNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!customerNameRegex.test(CustomerName.trim())) {
      return {
        errCode: 1,
        errMessage: 'Tên khách hàng sai định dạng!',
        data: null,
      };
    }
  }
  if (!CustomerEmail) {
    return {
      errCode: -1,
      errMessage: 'Email không được để trống!',
      data: null,
    };
  } else {
    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(CustomerEmail.trim())) {
      return {
        errCode: 1,
        errMessage: 'Email sai định dạng!',
        data: null,
      };
    }
  }
  if (!CustomerPhone) {
    return {
      errCode: -1,
      errMessage: 'Số điện thoại không được để trống!',
      data: null,
    };
  } else {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(CustomerPhone.trim())) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại không hợp lệ!',
        data: null,
      };
    }
  }
  if (!AppointmentDate || !StartTime) {
    return {
      errCode: -1,
      errMessage: 'Ngày hoặc giờ hẹn không được để trống!',
      data: null,
    };
  } else {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(StartTime)) {
      return {
        errCode: 1,
        errMessage: 'Giờ hẹn không hợp lệ (HH:mm)!',
        data: null,
      };
    }
    const dateCheck = new Date(AppointmentDate);
    if (isNaN(dateCheck.getTime())) {
      return {
        errCode: 1,
        errMessage: 'Ngày hẹn không hợp lệ!',
        data: null,
      };
    }
    const [hours, minutes] = StartTime.split(':').map(Number);
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
  if (Notes) {
    const notesCheck = Notes.trim();
    if (notesCheck.length > 65535) {
      return {
        errCode: 1,
        errMessage: 'Mô tả tình trạng không hợp lệ hoặc vượt quá giới hạn ký tự!',
        data: null,
      };
    }
  }
  if (!AccountID) {
    return {
      errCode: -1,
      errMessage: 'Tài khoản không được để trống!',
      data: null,
    };
  } else {
    const validAccount = await db.Account.findOne({
      where: { AccountID },
    });
    if (!validAccount) {
      return {
        errCode: 2,
        errMessage: 'Tài khoản không tồn tại!',
        data: null,
      };
    }
  }
  if (VeterinarianID) {
    const validVeterinarian = await db.VeterinarianInfo.findOne({
      where: { AccountID: VeterinarianID },
    });
    if (!validVeterinarian) {
      return {
        errCode: 2,
        errMessage: 'Bác sĩ không tồn tại trong hệ thống!',
        data: null,
      };
    }
  }
  if (!ServiceID) {
    return {
      errCode: -1,
      errMessage: 'Dịch vụ không được để trống!',
      data: null,
    };
  } else {
    const validService = await db.Service.findOne({
      where: { ServiceID, ServiceStatus: 'VALID' },
    });
    if (!validService) {
      return {
        errCode: 2,
        errMessage: 'Dịch vụ không tồn tại!',
        data: null,
      };
    }
  }
  if (!PetID) {
    return {
      errCode: -1,
      errMessage: 'Thú cưng không được để trống!',
      data: null,
    };
  } else {
    const petResult = await getPetInfo(AccountID, PetID);
    if (petResult.errCode !== 0 || petResult.data.PetStatus !== 'VALID') {
      return {
        errCode: 2,
        errMessage: 'Thú cưng không tồn tại hoặc đã bị xóa!',
        data: null,
      };
    }
  }
  if (!Type) {
    return {
      errCode: -1,
      errMessage: 'Loại lịch hẹn không được để trống!',
      data: null,
    };
  } else {
    const validAppointmentType = await checkValidAllCode('AppointmentType', Type);
    if (!validAppointmentType) {
      return {
        errCode: 1,
        errMessage: 'Loại lịch hẹn không hợp lệ!',
        data: null,
      };
    }
  }
  if (PrevAppointmentID) {
    const validPrevAppointment = await db.Appointment.findOne({
      where: { AppointmentID: PrevAppointmentID },
    });
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
  const { VeterinarianID, AppointmentID, ServicePrice, MedicalPrice, MedicalImage, MedicalNotes, PaymentType } = appointmentBillInfo;
  if (!AppointmentID) {
    return {
      errCode: -1,
      errMessage: 'Mã lịch hẹn không được để trống!',
      data: null,
    };
  } else {
    const validAppointment = await db.Appointment.findOne({
      where: { AppointmentID },
    });
    if (!validAppointment) {
      return {
        errCode: 2,
        errMessage: 'Lịch hẹn không tồn tại!',
        data: null,
      };
    }
  }
  if (!VeterinarianID) {
    return {
      errCode: -1,
      errMessage: 'Mã bác sĩ không được để trống!',
      data: null,
    };
  } else {
    const validVeterinarian = await db.VeterinarianInfo.findOne({
      where: { AccountID: VeterinarianID },
    });
    if (!validVeterinarian) {
      return {
        errCode: 2,
        errMessage: 'Bác sĩ không tồn tại trong hệ thống!',
        data: null,
      };
    }
  }
  if (!ServicePrice || ServicePrice <= 0) {
    return {
      errCode: -1,
      errMessage: 'Giá dịch vụ không hợp lệ!',
      data: null,
    };
  }
  if (!MedicalPrice || MedicalPrice < 0) {
    return {
      errCode: -1,
      errMessage: 'Giá thuốc không hợp lệ!',
      data: null,
    };
  }
  if (MedicalImage) {
    const imageCheck = MedicalImage.trim();
    if (!imageCheck || imageCheck.length > 2048) {
      return {
        errCode: 1,
        errMessage: 'URL ảnh không hợp lệ hoặc vượt quá 2048 ký tự!',
        data: null,
      };
    }
  }
  if (MedicalNotes) {
    const notesCheck = MedicalNotes.trim();
    if (notesCheck.length > 65535) {
      return {
        errCode: 1,
        errMessage: 'Ghi chú y tế không hợp lệ hoặc vượt quá giới hạn ký tự!',
        data: null,
      };
    }
  }
  if (PaymentType && !['CASH', 'CARD', 'QR'].includes(PaymentType)) {
    return {
      errCode: 1,
      errMessage: 'Phương thức thanh toán không hợp lệ!',
      data: null,
    };
  }
  return null;
};
let cancelExpiredAppointments = () => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const currentDateTime = new Date();
      const pendingAppointments = await db.Appointment.findAll({
        where: {
          AppointmentStatus: 'PEND',
        },
        attributes: ['AppointmentID', 'AppointmentDate', 'StartTime'],
        raw: true,
        transaction,
      });
      const expiredAppointments = pendingAppointments.filter((app) => {
        const dateStr = app.AppointmentDate.toISOString().split('T')[0]; // Lấy YYYY-MM-DD
        const appointmentStart = new Date(`${dateStr}T${app.StartTime}+07:00`);
        return appointmentStart < currentDateTime;
      });
      if (!expiredAppointments || expiredAppointments.length === 0) {
        await transaction.commit();
        resolve({
          errCode: 0,
          errMessage: 'Không có lịch hẹn quá hạn để hủy!',
          data: null,
        });
        return;
      }
      const appointmentIDs = expiredAppointments.map((app) => app.AppointmentID);
      await db.Appointment.update(
        { AppointmentStatus: 'CANCELED' },
        {
          where: { AppointmentID: { [Op.in]: appointmentIDs } },
          transaction,
        }
      );
      await db.Schedule.destroy({
        where: { AppointmentID: { [Op.in]: appointmentIDs } },
        transaction,
      });
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Hủy các lịch hẹn quá hạn thành công!',
        data: { canceledCount: expiredAppointments.length },
      });
    } catch (e) {
      await transaction.rollback();
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi hủy lịch hẹn quá hạn: ${e.message}`,
        data: null,
      });
    }
  });
};
const confirmAppointment = async (AppointmentID, VeterinarianID, transaction) => {
  try {
    const appointment = await db.Appointment.findOne({
      where: { AppointmentID },
      transaction,
    });
    if (!appointment) {
      throw new Error('Lịch hẹn không tồn tại!');
    }
    if (appointment.VeterinarianID && appointment.VeterinarianID !== VeterinarianID) {
      throw new Error('Lịch hẹn không thuộc bác sĩ này!');
    }
    await db.Appointment.update({ AppointmentStatus: 'CONF' }, { where: { AppointmentID }, transaction });
    const conflictingAppointments = await db.Appointment.findAll({
      where: {
        VeterinarianID,
        AppointmentDate: appointment.AppointmentDate,
        AppointmentID: { [Op.ne]: AppointmentID },
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
        await db.Appointment.update({ AppointmentStatus: 'CANCELED' }, { where: { AppointmentID: conflictingApp.AppointmentID }, transaction });
        await db.Schedule.destroy({
          where: { AppointmentID: conflictingApp.AppointmentID },
          transaction,
        });
      }
    }
    await db.Schedule.create(
      {
        VeterinarianID,
        AppointmentID: appointment.AppointmentID,
        Date: appointment.AppointmentDate,
        StartTime: appointment.StartTime,
        EndTime: appointment.EndTime,
        ScheduleStatus: 'PEND',
      },
      { transaction }
    );
    return {
      errCode: 0,
      errMessage: 'Xác nhận lịch hẹn thành công!',
    };
  } catch (e) {
    throw new Error(`Lỗi khi xác nhận lịch hẹn: ${e.message}`);
  }
};
let getAvailableTimes = (AppointmentDate, VeterinarianID, ServiceID) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra tham số
      if (!AppointmentDate || !ServiceID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const dateCheck = new Date(AppointmentDate);
      if (isNaN(dateCheck.getTime())) {
        resolve({
          errCode: 1,
          errMessage: 'Ngày hẹn không hợp lệ!',
          data: null,
        });
        return;
      }
      const service = await db.Service.findOne({
        where: { ServiceID, ServiceStatus: 'VALID' },
      });
      if (!service) {
        resolve({
          errCode: 1,
          errMessage: 'Dịch vụ không tồn tại!',
          data: null,
        });
        return;
      }
      const Duration = service.Duration;
      const fixedTimes = ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00', '21:59'];
      let availableTimes = [...fixedTimes];

      let vetIds = VeterinarianID && VeterinarianID !== 'ALL' ? [VeterinarianID] : (await db.VeterinarianInfo.findAll({ attributes: ['AccountID'], raw: true })).map((vet) => vet.AccountID);

      // Lấy lịch làm việc
      const schedules = await db.Schedule.findAll({
        where: {
          VeterinarianID: { [Op.in]: vetIds },
          Date: AppointmentDate,
          ScheduleStatus: 'PEND',
        },
        attributes: ['VeterinarianID', 'StartTime', 'EndTime'],
        raw: true,
      });

      if (VeterinarianID && VeterinarianID !== 'ALL') {
        // Trường hợp bác sĩ cụ thể
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const StartTime = new Date(AppointmentDate);
          StartTime.setHours(hours, minutes);
          const EndTime = new Date(StartTime.getTime() + Duration * 60000);

          // Kiểm tra nếu khung giờ trùng với lịch làm việc
          const isInSchedule = schedules.some((sch) => {
            if (sch.VeterinarianID !== VeterinarianID) return false;
            const schStart = new Date(`${AppointmentDate}T${sch.StartTime}`);
            const schEnd = new Date(`${AppointmentDate}T${sch.EndTime}`);
            return StartTime < schEnd && EndTime > schStart;
          });

          return !isInSchedule;
        });
      } else {
        // Trường hợp ALL
        availableTimes = fixedTimes.filter((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const StartTime = new Date(AppointmentDate);
          StartTime.setHours(hours, minutes);
          const EndTime = new Date(StartTime.getTime() + Duration * 60000);

          // Kiểm tra nếu tất cả bác sĩ đều có lịch làm việc bao phủ khung giờ
          const allVetsScheduled = vetIds.every((vetId) => {
            return schedules.some((sch) => {
              if (sch.VeterinarianID !== vetId) return false;
              const schStart = new Date(`${AppointmentDate}T${sch.StartTime}`);
              const schEnd = new Date(`${AppointmentDate}T${sch.EndTime}`);
              return StartTime < schEnd && EndTime > schStart;
            });
          });

          return !allVetsScheduled;
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
let loadAppointmentInfo = (AccountID, page, limit, search, filter, sort, date1, date2) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountID || !page || !limit || page < 1 || limit < 1) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu hoặc không hợp lệ tham số AccountID, page, hoặc limit!',
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
        AccountID, // Lọc theo AccountID của người dùng
      };
      let order = [];
      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 50);
        where[Op.or] = [{ '$Service.ServiceName$': { [Op.like]: `%${searchTerm}%` } }];
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
          //load theo Appointmentstatus
          const validStatus = await checkValidAllCode('AppointmentStatus', value);
          if (!validStatus) {
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
        attributes: ['AppointmentID', 'AppointmentDate', 'StartTime', 'EndTime', 'ServiceID', 'CustomerName', 'Notes', 'AppointmentStatus', 'VeterinarianID', 'PetID', 'AccountID'],
        include: [
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
      for (const row of rows) {
        const pet = await getPetInfo(row.AccountID, row.PetID);
        row.dataValues.PetName = pet.errCode === 0 && pet.data?.PetStatus === 'VALID' ? pet.data.PetName : 'Thú cưng đã xóa';
      }
      const data = rows.map((row) => ({
        AppointmentID: row.AppointmentID,
        AppointmentDate: row.AppointmentDate,
        StartTime: row.StartTime,
        EndTime: row.EndTime,
        ServiceName: row.Service.ServiceName,
        PetName: row.dataValues.PetName,
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
let loadAppointments = (VeterinarianID, page, limit, search, filter, sort, date1, date2, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const validStatus = await checkValidAllCode('AppointmentStatus', status);
      if (!validStatus) {
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái lịch hẹn không hợp lệ!',
          data: null,
        });
        return;
      }
      if (!VeterinarianID || !page || !limit || page < 1 || limit < 1) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số VeterinarianID, page hoặc limit không hợp lệ!',
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
        AppointmentStatus: status,
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
            where.VeterinarianID = VeterinarianID;
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
        where[Op.or] = [{ VeterinarianID: null }, { VeterinarianID }];
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
               WHERE s.VeterinarianID = '${VeterinarianID}'
               AND s.ScheduleStatus = 'PEND'
               AND a.AppointmentStatus = 'PEND')
            `),
          },
        },
        attributes: ['AppointmentID', 'AppointmentDate', 'StartTime', 'EndTime', 'ServiceID', 'VeterinarianID', 'CustomerName', 'Notes', 'PetID', 'AccountID'],
        include: [
          {
            model: db.Service,
            as: 'Service',
            attributes: ['ServiceName'],
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
      for (const row of rows) {
        const pet = await getPetInfo(row.AccountID, row.PetID); // cần thêm AccountID vào attributes
        row.dataValues.PetName = pet.errCode === 0 && pet.data?.PetStatus === 'VALID' ? pet.data.PetName : 'Thú cưng đã xóa';
      }
      const data = rows.map((row) => ({
        AppointmentID: row.AppointmentID,
        AppointmentDate: row.AppointmentDate,
        StartTime: row.StartTime,
        EndTime: row.EndTime,
        ServiceName: row.Service.ServiceName,
        PetName: row.dataValues.PetName,
        VeterinarianID: row.VeterinarianID,
        CustomerName: row.CustomerName,
        Notes: row.Notes,
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
let loadAppointmentDetails = (AppointmentID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AppointmentID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã lịch hẹn!',
          data: null,
        });
        return;
      }
      const appointment = await db.Appointment.findOne({
        where: { AppointmentID },
        attributes: ['AppointmentID', 'CustomerName', 'CustomerEmail', 'CustomerPhone', 'AppointmentDate', 'StartTime', 'EndTime', 'Notes', 'AppointmentStatus', 'AppointmentType', 'PrevAppointmentID', 'VeterinarianID', 'AccountID', 'CreatedAt', 'PetID', 'ServiceID'],
        include: [
          {
            model: db.Service,
            as: 'Service',
            attributes: ['ServiceID', 'ServiceName', 'Price'],
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
      const petResult = await getPetInfo(appointment.AccountID, appointment.PetID);

      const pet = petResult.errCode === 0 && petResult.data?.PetStatus === 'VALID' ? petResult.data : { PetName: 'Thú cưng đã xóa', PetType: '', PetWeight: 0, Age: 0, PetGender: '', petImage: '' };
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
        AccountID: appointment.AccountID,
        PrevAppointmentID: appointment.PrevAppointmentID,
        CreatedAt: appointment.CreatedAt,
        Pet: {
          PetID: appointment.PetID,
          PetName: pet.PetName,
          PetType: pet.PetType,
          PetWeight: pet.PetWeight,
          Age: pet.Age,
          PetGender: pet.PetGender,
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
let getAppointmentBillDetail = (AppointmentBillID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AppointmentBillID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã hóa đơn lịch hẹn!',
          data: null,
        });
        return;
      }
      const appointmentBill = await db.AppointmentBill.findOne({
        where: { AppointmentBillID },
        attributes: ['AppointmentBillID', 'AppointmentID', 'ServicePrice', 'MedicalPrice', 'TotalPayment', 'MedicalImage', 'MedicalNotes', 'CreatedAt'],
        include: [
          {
            model: db.Appointment,
            as: 'Appointment',
            attributes: ['CustomerName', 'CustomerEmail', 'CustomerPhone', 'AppointmentDate', 'StartTime', 'EndTime', 'AppointmentStatus', 'VeterinarianID', 'ServiceID'],
            include: [
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
      const petResult = await getPetInfo(appointmentBill.Appointment.AccountID, appointmentBill.Appointment.PetID);
      const PetName = petResult.errCode === 0 ? petResult.data.PetName : 'Thú cưng đã xóa';
      const PetType = petResult.errCode === 0 ? petResult.data.PetType : '';
      const PetGender = petResult.errCode === 0 ? petResult.data.PetGender : '';
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
          PetName,
          PetType,
          PetGender,
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
let createAppointment = (CustomerName, CustomerEmail, CustomerPhone, AppointmentDate, StartTime, Notes, AccountID, VeterinarianID, ServiceID, PetID, imageInfo, Type, PrevAppointmentID) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const appointmentInfo = { CustomerName, CustomerEmail, CustomerPhone, AppointmentDate, StartTime, Notes, AccountID, VeterinarianID, ServiceID, PetID, imageInfo, Type, PrevAppointmentID };
      let isValidateInput = await validateAppointmentInput(appointmentInfo);
      if (isValidateInput) {
        resolve(isValidateInput);
        return;
      }
      const existService = await db.Service.findOne({
        where: { ServiceID, ServiceStatus: 'VALID' },
        transaction,
      });
      if (!existService) {
        resolve({
          errCode: 2,
          errMessage: 'Dịch vụ không tồn tại!',
          data: null,
        });
        return;
      }
      const Duration = existService.Duration;
      const [startHours, startMinutes] = StartTime.split(':').map(Number);
      const startDateTime = new Date(AppointmentDate);
      startDateTime.setHours(startHours, startMinutes);
      const EndTime = new Date(startDateTime.getTime() + Duration * 60000);
      let finalVeterinarianID = VeterinarianID;
      if (Type === 'FOLLOW_UP' && PrevAppointmentID) {
        const prevAppointment = await db.Appointment.findOne({
          where: { AppointmentID: PrevAppointmentID },
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
          AppointmentDate,
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
          return app.VeterinarianID === finalVeterinarianID && startDateTime < appEnd && EndTime > appStart;
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
            return startDateTime < appEnd && EndTime > appStart;
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
      const appointmentIdResult = await generateID('L', 9, 'Appointment', 'AppointmentID');
      if (appointmentIdResult.errCode !== 0) {
        resolve(appointmentIdResult);
        return;
      }
      const AppointmentID = appointmentIdResult.data;
      const CreatedAt = new Date();
      const AppointmentStatus = Type === 'FOLLOW_UP' ? 'CONF' : 'PEND';
      await db.Appointment.create(
        {
          AppointmentID,
          CustomerName,
          CustomerEmail,
          CustomerPhone,
          AppointmentDate,
          StartTime,
          EndTime: EndTime.toTimeString().slice(0, 5),
          Notes,
          AccountID,
          VeterinarianID: finalVeterinarianID,
          ServiceID,
          PetID,
          CreatedAt: CreatedAt,
          AppointmentStatus,
          AppointmentType: Type,
          PrevAppointmentID,
        },
        { transaction }
      );
      if (Type === 'FOLLOW_UP' && finalVeterinarianID) {
        await db.Schedule.create(
          {
            VeterinarianID: finalVeterinarianID,
            AppointmentID,
            Date: AppointmentDate,
            StartTime,
            EndTime: EndTime.toTimeString().slice(0, 5),
            ScheduleStatus: 'PEND',
          },
          { transaction }
        );
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
          await db.Image.create(
            {
              Image: image.Image.trim(),
              ReferenceType: 'Appointment',
              ReferenceID: AppointmentID,
            },
            { transaction }
          );
        }
      }
      await transaction.commit();
      // === THÊM THÔNG BÁO APM_SUCCESS CHO KHÁCH HÀNG ===
      if (AccountID) {
        try {
          await sendNotification(
            AccountID, // Người gửi: hệ thống
            AccountID, // Gửi riêng cho khách hàng
            null, // Không gửi theo role
            'APM_SUCCESS', // Loại: đặt lịch thành công
            appointmentIdResult.data // ExtraValue: mã lịch khám
          );
        } catch (notifErr) {
          console.log('[ERROR] Gửi APM_SUCCESS thất bại:', notifErr);
        }
      }

      // === THÊM THÔNG BÁO APM_WAIT CHO BÁC SĨ ===
      try {
        if (VeterinarianID) {
          // Trường hợp chọn bác sĩ cụ thể → gửi riêng
          await sendNotification(
            AccountID || 'GUEST', // Người gửi: khách hàng (hoặc guest)
            VeterinarianID, // Gửi riêng cho bác sĩ đó
            null, // Không gửi theo role
            'APM_WAIT', // Loại: lịch khám chờ xác nhận
            appointmentIdResult.data
          );
        } else {
          // Không chọn bác sĩ → gửi cho tất cả bác sĩ (role 'V')
          await sendNotification(
            AccountID || 'GUEST',
            null,
            'V', // Gửi cho toàn bộ AccountType = 'V'
            'APM_WAIT',
            appointmentIdResult.data
          );
        }
      } catch (notifErr) {
        console.log('[ERROR] Gửi APM_WAIT thất bại:', notifErr);
      }
      let emailSent = true;
      if (CustomerEmail) {
        emailSent = await sendAppointmentEmail(AppointmentID, CustomerEmail);
      }
      if (!emailSent && CustomerEmail) {
        resolve({
          errCode: 0,
          errMessage: 'Tạo hóa đơn lịch hẹn thành công, nhưng gửi Email thất bại!',
          data: { AppointmentID },
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Đăng ký lịch hẹn thành công!',
        data: { AppointmentID },
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
let createAppointmentBill = (VeterinarianID, AppointmentID, ServicePrice, MedicalPrice, MedicalImage, MedicalNotes, PaymentType = 'CASH') => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const appointmentbillInfo = { VeterinarianID, AppointmentID, ServicePrice, MedicalPrice, MedicalImage, MedicalNotes, PaymentType };
      let isValidateInput = await validateAppointmentBillInput(appointmentbillInfo);
      if (isValidateInput) {
        resolve(isValidateInput);
        return;
      }
      const appointmentBillIdResult = await generateID('LH', 8, 'AppointmentBill', 'AppointmentBillID');
      if (appointmentBillIdResult.errCode !== 0) {
        resolve(appointmentBillIdResult);
        return;
      }
      const AppointmentBillID = appointmentBillIdResult.data;
      const TotalPayment = parseFloat(ServicePrice) + parseFloat(MedicalPrice);
      let PaymentStatus = 'PEND';
      let vnpayUrl = null;

      if (PaymentType === 'CARD' || PaymentType === 'QR') {
        console.log('BE: Bắt đầu generate VNPay cho PaymentType:', PaymentType);
        const ipAddr = '127.0.0.1';
        const tmnCode = process.env.VNP_TMNCODE;
        const secretKey = process.env.VNP_HASHSECRET;
        let vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURNURL_APPOINTMENT;
        console.log('BE: Env vars:', { tmnCode, secretKey, vnpUrl, returnUrl });
        const date = new Date();
        const createDate = date.getFullYear() + '' + ('0' + (date.getMonth() + 1)).slice(-2) + '' + ('0' + date.getDate()).slice(-2) + '' + ('0' + date.getHours()).slice(-2) + '' + ('0' + date.getMinutes()).slice(-2) + '' + ('0' + date.getSeconds()).slice(-2);
        const orderId = AppointmentBillID;
        let amount = TotalPayment * 100;
        let bankCode = '';
        let locale = 'vn';
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Amount'] = amount;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan hoa don lich hen:' + orderId;
        vnp_Params['vnp_OrderType'] = 'billpayment';
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (PaymentType === 'CARD') {
          vnp_Params['vnp_BankCode'] = 'NCB'; // Example
        }

        vnp_Params = sortObject(vnp_Params);

        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac('sha512', secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex'); // Fix deprecated: Buffer.from thay new Buffer
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        vnpayUrl = vnpUrl;
        console.log('BE: Generated vnpayUrl:', vnpayUrl);
      } else {
        console.log('BE: Không generate VNPay vì PaymentType:', PaymentType);
      }

      await db.AppointmentBill.create(
        {
          AppointmentBillID,
          AppointmentID,
          ServicePrice,
          MedicalPrice,
          TotalPayment,
          MedicalImage,
          MedicalNotes,
          PaymentType,
          PaymentStatus,
          CreatedAt: new Date(),
        },
        { transaction }
      );

      if (PaymentType === 'CASH') {
        const schedule = await db.Schedule.findOne({
          where: { AppointmentID },
          transaction,
        });
        if (schedule) {
          await db.Schedule.update({ ScheduleStatus: 'COMP' }, { where: { AppointmentID }, transaction });
        }
        const appointment = await db.Appointment.findOne({
          where: { AppointmentID },
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
            VeterinarianID: appointment.VeterinarianID || VeterinarianID,
            AppointmentStatus: 'COMP',
          },
          { where: { AppointmentID }, transaction }
        );
      }
      const customerinfo = await db.Appointment.findOne({
        where: { AppointmentID },
        attributes: ['AccountID', 'AppointmentStatus'],
        transaction,
      });

      await transaction.commit();
      if (customerinfo) {
        const CustomerID = customerinfo.AccountID;
        const AppointmentStatus = customerinfo.AppointmentStatus;
        if (AppointmentStatus === 'COMP' && CustomerID) {
          await sendNotification(VeterinarianID || 'SYSTEM', CustomerID, null, 'APM_COMPLETE', AppointmentID);
        }
      }
      let emailSent = true;
      let appointment = await db.Appointment.findOne({ where: { AppointmentID } });
      if (appointment.CustomerEmail) {
        emailSent = await sendAppointmentBillEmail(AppointmentBillID, appointment.CustomerEmail);
      }
      if (!emailSent && appointment.CustomerEmail) {
        resolve({
          errCode: 0,
          errMessage: 'Tạo hóa đơn lịch hẹn thành công, nhưng gửi Email thất bại!',
          data: { AppointmentID, AppointmentBillID, vnpayUrl },
        });
        return;
      }

      resolve({
        errCode: 0,
        errMessage: 'Tạo hóa đơn lịch hẹn thành công!',
        data: { AppointmentID, AppointmentBillID, vnpayUrl },
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

let changeAppointmentStatus = (AppointmentID, AppointmentStatus, VeterinarianID) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      // Kiểm tra tham số
      if (!AppointmentID || !AppointmentStatus || !VeterinarianID) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      // Kiểm tra trạng thái hợp lệ
      const validAppointmentStatus = await checkValidAllCode('AppointmentStatus', AppointmentStatus);
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
        where: { AppointmentID },

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
      if (appointment.AppointmentStatus === AppointmentStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      const customerId = appointment.AccountID;
      const vetId = VeterinarianID;
      // Bác sĩ đang thực hiện hành động
      if (AppointmentStatus === 'CONF') {
        // Gọi hàm xác nhận
        const result = await confirmAppointment(AppointmentID, VeterinarianID, transaction);
        await sendNotification(
          vetId, // Người gửi: bác sĩ
          customerId, // Gửi riêng cho khách hàng
          null,
          'APM_CONFIRM', // Loại: xác nhận lịch khám
          AppointmentID // ExtraValue: mã lịch khám
        );
        await transaction.commit();
        resolve({
          errCode: result.errCode,
          errMessage: result.errMessage,
          data: null,
        });
      } else {
        // Cập nhật trạng thái không phải CONF
        await db.Appointment.update({ AppointmentStatus }, { where: { AppointmentID }, transaction });
        // Xóa bản ghi Schedule
        await db.Schedule.destroy({
          where: { AppointmentID },
          transaction,
        });
        await sendNotification(
          vetId, // Người gửi: bác sĩ
          customerId, // Gửi riêng cho khách hàng
          null,
          'APM_REFUSE', // Loại: từ chối lịch khám
          AppointmentID // ExtraValue: mã lịch khám
        );
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

const getAppointmentEmail = async (BillID, Email) => {
  try {
    const emailSent = await sendAppointmentEmail(BillID, Email);
    if (emailSent) {
      return {
        errCode: 0,
        errMessage: 'Gửi Email lịch hẹn thành công!',
      };
    } else {
      return {
        errCode: 1,
        errMessage: 'Gửi Email lịch hẹn thất bại!',
      };
    }
  } catch (e) {
    console.log('Error in handleSendAppointmentEmail: ', e);
    return {
      errCode: 2,
      errMessage: 'Lỗi khi gửi Email lịch hẹn: ' + e.message,
    };
  }
};

const getAppointmentBillEmail = async (BillID, Email) => {
  try {
    const emailSent = await sendAppointmentBillEmail(BillID, Email);
    if (emailSent) {
      return {
        errCode: 0,
        errMessage: 'Gửi Email hóa đơn khám thành công!',
      };
    } else {
      return {
        errCode: 1,
        errMessage: 'Gửi Email hóa đơn khám thất bại!',
      };
    }
  } catch (e) {
    console.log('Error in handleSendAppointmentBillEmail: ', e);
    return {
      errCode: 2,
      errMessage: 'Lỗi khi gửi Email hóa đơn khám: ' + e.message,
    };
  }
};

let handleVnpayIpn = (params) => {
  return new Promise(async (resolve, reject) => {
    let secureHash = params['vnp_SecureHash'];
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];
    params = sortObject(params);
    let signData = querystring.stringify(params, { encode: false });
    let hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    if (secureHash === signed) {
      const transaction = await db.sequelize.transaction();
      try {
        await db.AppointmentBill.update({ PaymentStatus: params['vnp_ResponseCode'] === '00' ? 'PAID' : 'FAIL' }, { where: { AppointmentBillID: params['vnp_TxnRef'] }, transaction });
        if (params['vnp_ResponseCode'] === '00') {
          const bill = await db.AppointmentBill.findOne({
            where: { AppointmentBillID: params['vnp_TxnRef'] },
            attributes: ['AppointmentID'],
            transaction,
          });
          const AppointmentID = bill.AppointmentID;
          const schedule = await db.Schedule.findOne({
            where: { AppointmentID },
            transaction,
          });
          if (schedule) {
            await db.Schedule.update({ ScheduleStatus: 'COMP' }, { where: { AppointmentID }, transaction });
          }
          await db.Appointment.update({ AppointmentStatus: 'COMP' }, { where: { AppointmentID }, transaction });
        }
        await transaction.commit();
        resolve('OK');
      } catch (e) {
        await transaction.rollback();
        console.log('IPN error:', e);
        resolve('InputDataError');
      }
    } else {
      resolve('ChecksumError');
    }
  });
};

let completeAppointmentAfterPayment = async (AppointmentBillID) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const bill = await db.AppointmentBill.findOne({
        where: { AppointmentBillID },
        attributes: ['AppointmentID'],
        transaction,
      });
      if (!bill) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Không tìm thấy hóa đơn!',
          data: null,
        });
        return;
      }
      const AppointmentID = bill.AppointmentID;
      const schedule = await db.Schedule.findOne({
        where: { AppointmentID },
        transaction,
      });
      if (schedule) {
        await db.Schedule.update({ ScheduleStatus: 'COMP' }, { where: { AppointmentID }, transaction });
      }
      await db.Appointment.update({ AppointmentStatus: 'COMP' }, { where: { AppointmentID }, transaction });
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật trạng thái lịch hẹn thành công sau thanh toán!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in completeAppointmentAfterPayment: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi cập nhật trạng thái sau thanh toán: ${e.message}`,
        data: null,
      });
    }
  });
};

module.exports = {
  getAvailableTimes,
  loadAppointmentInfo,
  loadAppointments,
  loadAppointmentDetails,
  getAppointmentBillDetail,
  createAppointment,
  createAppointmentBill,
  changeAppointmentStatus,
  getAppointmentEmail,
  getAppointmentBillEmail,
  handleVnpayIpn,
  completeAppointmentAfterPayment, // Thêm hàm mới vào exports
};
