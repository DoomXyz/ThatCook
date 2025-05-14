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

      const isServiceExist = await db.Service.findOne({
        where: { ServiceID: serviceid },
      });
      if (!isServiceExist) {
        resolve({
          errCode: 2,
          errMessage: 'Dịch vụ không tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const endTime = null;
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
        EndTime: endTime,
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

export default { createAppointment };
