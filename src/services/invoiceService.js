import { where } from "sequelize";
import db from "../models/index.js";
import { checkPaymentStatus, checkShippingStatus, checkPaymentType, checkShippingMethod } from "./utilitiesService";

let validateInvoiceInput = async (accountid, receivername, receiverphone, couponid) => {
    if (accountid) {
        const check = await checkAccountExist(accountid);
        if (!check) {
            return {
                errCode: 1,
                errMessage: "Tài khoản không tồn tại trong hệ thống!",
                data: null
            };
        }
    }
    const userName = receivername.trim();
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/; //chứa chữ cái, số hoặc khoảng trắng, dài từ 2-50 ký tự
    if (!userNameRegex.test(userName)) {
        return {
            errCode: 1,
            errMessage: "Tên người nhận hàng sai định dạng!",
            data: null
        };
    }
    const phoneNumber = receiverphone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return {
            errCode: 1,
            errMessage: "Số điện thoại nhận hàng không hợp lệ!",
            data: null
        };
    }
    if (couponid) {
        const check = await checkCouponExist(couponid);
        if (!check) {
            return {
                errCode: 1,
                errMessage: "Thông tin giảm giá không tồn tại trong hệ thống!",
                data: null
            };
        }
    }
    return null;
};

let checkAccountExist = (accountID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!accountID) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu mã tài khoản để kiểm tra!',
                    data: null
                });
                return;
            }
            let exist = await db.Account.findOne({
                where: { AccountID: accountID }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra accountid: ' + e.message,
                data: null
            });
        }
    });
};

let checkCouponExist = (couponID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!couponID) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu mã giảm giá để kiểm tra!',
                    data: null
                });
                return;
            }
            let exist = await db.Coupon.findOne({
                where: { CouponID: couponID }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra couponid: ' + e.message,
                data: null
            });
        }
    });
};

let generateGuestID = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const prefix = "G"
            // Lấy timestamp
            const timestamp = Date.now().toString();
            // Lấy 9 chữ số từ timestamp
            const timestampDigits = timestamp.slice(-9); // Lấy 9 chữ số cuối
            let accountId = `${prefix}${timestampDigits}`;
            // Kiểm tra xem accountId có trùng trong DB không
            let existingAccount = await db.Account.findOne({
                where: { AccountID: accountId },
            });
            // Nếu trùng, thử lại với timestamp mới (tối đa 5 lần)
            let attempts = 0;
            while (existingAccount && attempts < 5) {
                const newTimestamp = Date.now().toString();
                const newTimestampDigits = newTimestamp.slice(-9);
                accountId = `${prefix}${newTimestampDigits}`;
                attempts++;
                existingAccount = await db.Account.findOne({
                    where: { AccountID: accountId },
                });
            }
            if (attempts >= 5) {
                resolve({
                    errCode: 1,
                    errMessage: "Tạo mã khách hàng thất bại!",
                    data: null
                });
            }
            resolve(accountId);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo mã khách hàng: ' + e.message,
                data: null
            });
        }
    });
};

let generateInvoiceID = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const prefix = "DH"
            // Lấy timestamp
            const timestamp = Date.now().toString();
            // Lấy 9 chữ số từ timestamp
            const timestampDigits = timestamp.slice(-8); // Lấy 9 chữ số cuối
            let invoiceId = `${prefix}${timestampDigits}`;
            // Kiểm tra xem accountId có trùng trong DB không
            let existingInvoice = await db.Invoice.findOne({
                where: { InvoiceID: invoiceId },
            });
            // Nếu trùng, thử lại với timestamp mới (tối đa 5 lần)
            let attempts = 0;
            while (existingInvoice && attempts < 5) {
                const newTimestamp = Date.now().toString();
                const newTimestampDigits = newTimestamp.slice(-9);
                invoiceId = `${prefix}${newTimestampDigits}`;
                attempts++;
                existingInvoice = await db.Invoice.findOne({
                    where: { InvoiceID: invoiceId },
                });
            }
            if (attempts >= 5) {
                resolve({
                    errCode: 1,
                    errMessage: "Tạo mã đơn hàng thất bại!",
                    data: null
                });
            }
            resolve(invoiceId);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo mã đơn hàng: ' + e.message,
                data: null
            });
        }
    });
};

// Tạo đơn hàng 
let createInvoice = (accountid, receivername, receiverphone, receiveraddress, cartItems, totalquantity, totalprice,
    discountamount, totalpayment, paymentstatus, shippingstatus, paymenttype, shippingmethod, couponid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!receivername || !receiverphone || !receiveraddress || !cartItems || !totalquantity || !totalprice
                || !totalpayment || !paymentstatus || !shippingstatus || !paymenttype || !shippingmethod) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            const validPaymentStatus = await checkPaymentStatus(paymentstatus);
            if (!validPaymentStatus) {
                resolve({
                    errCode: 1,
                    errMessage: "Trạng thái thanh toán không hợp lệ!",
                    data: null
                });
                return;
            }
            const validShippingStatus = await checkShippingStatus(shippingstatus);
            if (!validShippingStatus) {
                resolve({
                    errCode: 1,
                    errMessage: "Trạng thái giao hàng không hợp lệ!",
                    data: null
                })
                return;
            }
            const validPaymentType = await checkPaymentType(paymenttype);
            if (!validPaymentType) {
                resolve({
                    errCode: 1,
                    errMessage: "Phương thức thanh toán không hợp lệ!",
                    data: null
                });
                return;
            }
            const validShippingMethod = await checkShippingMethod(shippingmethod);
            if (!validShippingMethod) {
                resolve({
                    errCode: 1,
                    errMessage: "Cách thức giao hàng không hợp lệ!",
                    data: null
                });
                return;
            }
            let isValidateInput = await validateInvoiceInput(accountid, receivername, receiverphone, couponid)
            if (isValidateInput) {
                resolve(isValidateInput);
                return;
            }
            for (let item of cartItems) {
                const validProduct = await db.Product.findOne({
                    where: { ProductID: item.productid }
                })
                if (!validProduct) {
                    resolve({
                        errCode: 2,
                        errMessage: "Sản phẩm không tồn tại trong hệ thống!",
                    });
                    return;
                }
                const validDetail = await db.ProductDetail.findOne({
                    where: { ProductDetailID: item.productdetailid }
                })
                if (!validDetail) {
                    resolve({
                        errCode: 2,
                        errMessage: "Chi tiết sản phẩm không tồn tại trong hệ thống!",
                    });
                    return;
                }
                if (validDetail.Stock < item.itemquantity) {
                    resolve({
                        errCode: 2,
                        errMessage: "Sản phẩm không đủ tồn kho!",
                    });
                    return;
                }
            }
            let AccountID;
            if (accountid) {
                AccountID = accountid
            } else {
                const GuestID = await generateGuestID();
                if (typeof GuestID === 'object' && GuestID.errCode) {
                    resolve(GuestID);
                    return;
                }
                AccountID = GuestID
            }
            const InvoiceID = await generateInvoiceID();
            if (typeof InvoiceID === 'object' && InvoiceID.errCode) {
                resolve(InvoiceID);
                return;
            }
            await db.Invoice.create({
                InvoiceID,
                AccountID,
                ReceiverName: receivername,
                ReceiverPhone: receiverphone,
                ReceiverAddress: receiveraddress,
                TotalQuantity: totalquantity,
                TotalPrice: totalprice,
                DiscountAmount: discountamount,
                TotalPayment: totalpayment,
                CreatedAt: new Date(),
                CanceledAt: null,
                CancelReason: null,
                PaymentStatus: paymentstatus,
                ShippingStatus: shippingstatus,
                PaymentType: paymenttype,
                ShippingMethod: shippingmethod,
                CouponID: couponid,
            })
            for (let item of cartItems) {
                await db.InvoiceDetail.create({
                    InvoiceID,
                    ProductID: item.productid,
                    ProductDetailID: item.productdetailid,
                    ItemPrice: item.itemprice,
                    ItemQuantity: item.itemquantity
                })
                const detail = await db.ProductDetail.findOne({
                    where: { ProductDetailID: item.productdetailid }
                })
                await db.ProductDetail.update({
                    Stock: detail.Stock - item.itemquantity
                }, {
                    where: { ProductDetailID: item.productdetailid }
                })
            }
            if (accountid) {
                await db.CartItem.destroy({
                    where: { AccountID: accountid }
                })
            }
            resolve({
                errCode: 0,
                errMessage: "Tạo đơn hàng thành công!",
                data: InvoiceID
            })
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo đơn hàng: ' + e,
                data: null
            });
        }
    });
};

export default {
    createInvoice,
};
