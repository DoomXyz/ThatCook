import db from "../models/index";

//lấy thông tin allcodes
let getAllCodes = (type) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!type) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            let allCodes = await db.AllCodes.findAll({
                where: { Type: type },
                attributes: ['Code', 'CodeValueVI', 'ExtraValue'],
                raw: true
            });
            resolve({
                errCode: 0,
                errMessage: 'Lấy danh sách mã thành công!',
                data: allCodes.length > 0 ? allCodes : []
            });
        } catch (e) {
            console.log('Error in getAllCodes: ', e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi lấy danh sách mã: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: "Gender",
                    Code: gender,
                },
            });
            resolve(exist ? true : false)
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: "AccountType",
                    Code: accountType,
                },
            });
            resolve(exist ? true : false)
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: 'AccountStatus',
                    Code: accountStatus
                }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: "ProductType",
                    Code: productType
                }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: "PaymentStatus",
                    Code: paymentStatus
                }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: "ShippingStatus",
                    Code: shippingStatus
                }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: "PaymentType",
                    Code: paymentType
                }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.AllCodes.findOne({
                where: {
                    Type: "ShippingMethod",
                    Code: shippingMethod
                }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let discountAmout = 0;
            const couponInfo = await db.Coupon.findOne({
                where: { CouponCode: couponcode },
                attributes: { exclude: ['CouponID', 'CouponDescription'] }
            })
            const currentDate = new Date();
            if (!couponInfo) {
                resolve({
                    errCode: 1,
                    errMessage: "Mã giảm giá không tồn tại!",
                    data: discountAmout
                })
                return;
            }
            if (couponInfo.EndDate < currentDate, couponInfo.CouponStatus === "EXPIRED") {
                resolve({
                    errCode: 2,
                    errMessage: "Mã giảm giá hết hạn!",
                    data: discountAmout
                })
                return;
            }
            if (couponInfo.StartDate > currentDate || couponInfo.EndDate < currentDate) {
                resolve({
                    errCode: 2,
                    errMessage: "Mã giảm giá chưa bắt đầu!",
                    data: discountAmout
                })
                return;
            }
            if (price < parseFloat(couponInfo.MinOrderValue)) {
                resolve({
                    errCode: 2,
                    errMessage: "Không thể áp dụng mã giảm giá!",
                    data: discountAmout
                })
                return;
            }
            let discountValue = 0;
            if (couponInfo.DiscountType === "FIXED") {
                discountValue = parseFloat(couponInfo.DiscountValue)
            } else {
                discountValue = price * (parseFloat(couponInfo.DiscountValue) / 100);
            }
            discountValue = (price - discountValue) > couponInfo.MaxDiscount ? couponInfo.MaxDiscount : discountValue
            resolve({
                errCode: 0,
                errMessage: "Kiểm tra giảm giá thành công!",
                data: discountValue
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra thông tin: ' + e.message,
                data: null
            });
        }
    });
}

let getCouponInfo = (couponcode) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!couponcode) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            let couponData = null;
            if (couponcode === "ALL") {
                couponData = await db.Coupon.findAll();
            } else {
                couponData = await db.Coupon.findOne({
                    where: { CouponCode: couponcode },
                });
            }
            if (couponData !== null) {
                resolve({
                    errCode: 0,
                    errMessage: "Lấy dữ liệu thành công!",
                    data: couponData
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: "Mã giảm giá không tồn tại!",
                    data: null
                })
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra thông tin: ' + e.message,
                data: null
            });
        }
    });
}

module.exports = {
    getAllCodes,
    checkGender,
    checkAccountType,
    checkAccountStatus,
    checkProductType,
    checkPaymentStatus,
    checkShippingStatus,
    checkPaymentType,
    checkShippingMethod,
    checkCoupon,
    getCouponInfo,
};