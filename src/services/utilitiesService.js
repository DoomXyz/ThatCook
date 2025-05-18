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

let checkCoupon = (couponcode, price) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!couponcode || !price) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let discountAmout = 0;
      const couponInfo = await db.Coupon.findOne({
        where: { CouponCode: couponcode, CouponStatus: 'ACTIVE' },
        attributes: ['DiscountType', 'DiscountValue', 'MaxDiscount', 'MinOrderValue', 'StartDate', 'EndDate'],
      });
      if (!couponInfo) {
        resolve({
          errCode: 1,
          errMessage: 'Mã giảm giá không tồn tại hoặc đã hết hạn!',
          data: discountAmout,
        });
        return;
      }
      const currentDate = new Date();
      if (couponInfo.StartDate > currentDate || couponInfo.EndDate < currentDate) {
        resolve({
          errCode: 2,
          errMessage: 'Mã giảm giá không trong thời gian hiệu lực!',
          data: discountAmout,
        });
        return;
      }
      if (couponInfo.StartDate > currentDate || couponInfo.EndDate < currentDate) {
        resolve({
          errCode: 2,
          errMessage: 'Mã giảm giá chưa bắt đầu!',
          data: discountAmout,
        });
        return;
      }
      if (parseFloat(price) < parseFloat(couponInfo.MinOrderValue)) {
        resolve({
          errCode: 2,
          errMessage: 'Không thể áp dụng mã giảm giá!',
          data: discountAmout,
        });
        return;
      }
      let discountValue = 0;
      if (couponInfo.DiscountType === 'FIXED') {
        discountValue = parseFloat(couponInfo.DiscountValue);
      } else {
        discountValue = price * (parseFloat(couponInfo.DiscountValue) / 100);
      }
      discountValue = price - discountValue > couponInfo.MaxDiscount ? couponInfo.MaxDiscount : discountValue;
      resolve({
        errCode: 0,
        errMessage: 'Kiểm tra giảm giá thành công!',
        data: discountValue,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra thông tin: ' + e.message,
        data: null,
      });
    }
  });
};

let getCouponInfo = (couponcode) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!couponcode) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let couponData = null;
      if (couponcode === 'ALL') {
        couponData = await db.Coupon.findAll({
          attributes: ['CouponCode', 'MinOrderValue', 'DiscountValue', 'MaxDiscount', 'StartDate', 'EndDate', 'DiscountType', 'CouponStatus'],
        });
      } else {
        couponData = await db.Coupon.findOne({
          where: { CouponCode: couponcode },
          attributes: ['CouponCode', 'MinOrderValue', 'DiscountValue', 'MaxDiscount', 'StartDate', 'EndDate', 'DiscountType', 'CouponStatus'],
        });
      }
      if (couponData !== null) {
        resolve({
          errCode: 0,
          errMessage: 'Lấy dữ liệu thành công!',
          data: couponData,
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: 'Mã giảm giá không tồn tại!',
          data: null,
        });
      }
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra thông tin: ' + e.message,
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
  checkBannerStatus,
  checkAppointmentType,
  checkCoupon,
  getCouponInfo,
};
