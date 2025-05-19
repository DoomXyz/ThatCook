import db from '../models/index';

//lấy thông tin allcodes
let getAllCodes = (type) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!type) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let allCodes = await db.AllCodes.findAll({
        where: { Type: type },
        attributes: ['Code', 'CodeValueVI', 'ExtraValue'],
        raw: true,
      });
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách mã thành công!',
        data: allCodes.length > 0 ? allCodes : [],
      });
    } catch (e) {
      console.log('Error in getAllCodes: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy danh sách mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkAccountType = (accountType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'AccountType',
          Code: accountType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra: ' + e.message,
        data: null,
      });
    }
  });
};

let checkAccountStatus = (accountStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'AccountStatus',
          Code: accountStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra: ' + e.message,
        data: null,
      });
    }
  });
};

let checkGender = (gender) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!gender) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'Gender',
          Code: gender,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPetGender = (petGender) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!petGender) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PetGender',
          Code: petGender,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkWorkingStatus = (workingStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!workingStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'WorkingStatus',
          Code: workingStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkProductType = (productType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'ProductType',
          Code: productType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPetType = (petType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!petType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PetType',
          Code: petType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkDetailStatus = (detailStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!detailStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'DetailStatus',
          Code: detailStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPaymentType = (paymentType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!paymentType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PaymentType',
          Code: paymentType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPaymentStatus = (paymentStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!paymentStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PaymentStatus',
          Code: paymentStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkShippingStatus = (shippingStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!shippingStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'ShippingStatus',
          Code: shippingStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkShippingMethod = (shippingMethod) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!shippingMethod) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'ShippingMethod',
          Code: shippingMethod,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkCouponStatus = (couponStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!couponStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'CouponStatus',
          Code: couponStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkDiscountType = (discountType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!discountType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'DiscountType',
          Code: discountType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkBannerStatus = (bannerStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bannerStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'BannerStatus',
          Code: bannerStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkAppointmentType = (appointmentType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!appointmentType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'AppointmentType',
          Code: appointmentType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

module.exports = {
  getAllCodes,
  checkAccountType,
  checkAccountStatus,
  checkGender,
  checkPetGender,
  checkPetType,
  checkProductType,
  checkWorkingStatus,
  checkDetailStatus,
  checkPaymentType,
  checkPaymentStatus,
  checkShippingStatus,
  checkShippingMethod,
  checkCouponStatus,
  checkDiscountType,
  checkBannerStatus,
  checkAppointmentType,
};
