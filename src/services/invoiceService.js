import { Op } from "sequelize";
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

let getAccountInvoiceInfo = (accountid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!accountid) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            const data = await db.Invoice.findAll({
                where: { AccountID: accountid },
                attributes: [
                    "InvoiceID",
                    "ReceiverName",
                    "ReceiverPhone",
                    "ReceiverAddress",
                    "TotalQuantity",
                    "TotalPayment",
                    "CreatedAt",
                    "CanceledAt",
                    "PaymentStatus",
                    "ShippingStatus",
                ],
                raw: true,
            });
            if (data) {
                resolve({
                    errCode: 0,
                    errMessage: 'Lấy thông tin đơn hàng của người dùng thành công!',
                    data
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Thông tin đơn hàng của người dùng không tồn tại!',
                    data: null
                });
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi lấy thông tin đơn hàng: ' + e,
                data: null
            });
        }
    });
};

let getInvoiceDetailInfo = (invoiceid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!invoiceid) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            const invoiceData = await db.InvoiceDetail.findAll({
                where: { InvoiceID: invoiceid },
                attributes: [
                    "ProductID",
                    "ProductDetailID",
                    "ItemQuantity",
                ],
            })
            const invoiceHeader = await db.Invoice.findOne({
                where: { InvoiceID: invoiceid },
                attributes: [
                    "TotalQuantity",
                    "ReceiverName",
                    "ReceiverPhone",
                    "ReceiverAddress",
                    "TotalPrice",
                    "DiscountAmount",
                    "TotalPayment",
                    "CreatedAt",
                    "PaymentType",
                    "ShippingStatus",
                    "ShippingMethod"
                ],
            });
            if (!invoiceData || !invoiceHeader) {
                resolve({
                    errCode: 2,
                    errMessage: 'Chi tiết đơn hàng không tồn tại!',
                    data: null
                });
                return;
            }
            let data = {
                ReceiverName: invoiceHeader.ReceiverName,
                ReceiverPhone: invoiceHeader.ReceiverPhone,
                ReceiverAddress: invoiceHeader.ReceiverAddress,
                TotalQuantity: invoiceHeader.TotalQuantity,
                TotalPrice: invoiceHeader.TotalPrice,
                DiscountAmount: invoiceHeader.DiscountAmount,
                TotalPayment: invoiceHeader.TotalPayment,
                CreatedAt: invoiceHeader.CreatedAt,
                PaymentType: invoiceHeader.PaymentType,
                ShippingMethod: invoiceHeader.ShippingMethod,
                ShippingStatus: invoiceHeader.ShippingStatus,
                ProductList: []
            };
            for (let i = 0; i < invoiceData.length; i++) {
                const productid = invoiceData[i].ProductID
                const productdetailid = invoiceData[i].ProductDetailID
                const productData = await db.Product.findOne({
                    where: { ProductID: productid },
                    attributes: [
                        "ProductName",
                        "ProductPrice",
                        "ProductImage",
                    ],
                })
                const productdetailData = await db.ProductDetail.findOne({
                    where: { ProductDetailID: productdetailid },
                    attributes: [
                        "DetailName",
                        "ExtraPrice",
                        "Promotion"
                    ],
                })
                if (!productData || !productdetailData) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Dữ liệu sản phẩm không tồn tại!',
                        data: null
                    });
                    return;
                }
                const itemPrice = (parseFloat(productData.ProductPrice) + parseFloat(productdetailData.ExtraPrice)) * (1 - parseFloat(productdetailData.Promotion) / 100);
                data.ProductList.push({
                    ProductName: productData.ProductName,
                    DetailName: productdetailData.DetailName,
                    ProductImage: productData.ProductImage,
                    ItemPrice: itemPrice,
                    ItemQuantity: invoiceData[i].ItemQuantity
                });
            }
            resolve({
                errCode: 0,
                errMessage: 'Lấy chi tiết đơn hàng thành công!',
                data
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi lấy chi tiết đơn hàng: ' + e,
                data: null
            });
        }
    });
}

let loadInvoiceInfo = (page, limit, search, filter, sort, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!page || !limit || page < 1 || limit < 1) {
                resolve({
                    errCode: -1,
                    errMessage: "Tham số page hoặc limit không hợp lệ!",
                    data: null
                });
                return;
            }
            if (filter !== "ALL" && !filter.includes("-")) {
                resolve({
                    errCode: 1,
                    errMessage: "Tham số filter không hợp lệ!",
                    data: null
                });
                return;
            }
            if (sort && !["0", "1", "2", "3", "4", "5", "6"].includes(sort)) {
                resolve({
                    errCode: 1,
                    errMessage: "Tham số sort không hợp lệ!",
                    data: null
                });
                return;
            }
            const offset = (page - 1) * limit;
            let where = {};
            let order = [];

            // Tìm kiếm theo ReceiverName hoặc ReceiverPhone
            if (search) {
                where[Op.or] = [
                    { ReceiverName: { [Op.like]: `%${search}%` } },
                    { ReceiverPhone: { [Op.like]: `%${search}%` } }
                ];
            }

            // Lọc theo ngày (bỏ qua giờ)
            if (date) {
                const startOfDay = new Date(date);
                if (isNaN(startOfDay.getTime())) {
                    resolve({
                        errCode: 1,
                        errMessage: "Tham số date không hợp lệ!",
                        data: null
                    });
                    return;
                }
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                where.CreatedAt = {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay
                };
            }

            // Lọc theo paymentstatus, shippingstatus hoặc totalpayment
            if (filter !== "ALL") {
                const [field, value] = filter.split("-");
                if (field === "paymentstatus") {
                    const validPaymentStatus = await checkPaymentStatus(value);
                    if (!validPaymentStatus) {
                        resolve({
                            errCode: 1,
                            errMessage: "Trạng thái thanh toán không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.PaymentStatus = value;
                } else if (field === "shippingstatus") {
                    const validShippingStatus = await checkShippingStatus(value);
                    if (!validShippingStatus) {
                        resolve({
                            errCode: 1,
                            errMessage: "Trạng thái giao hàng không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.ShippingStatus = value;
                } else if (field === "totalpayment") {
                    switch (value) {
                        case "0": // 500k-1m
                            where.TotalPayment = { [Op.between]: [500000, 1000000] };
                            break;
                        case "1": // 1m-1.5m
                            where.TotalPayment = { [Op.between]: [1000000, 1500000] };
                            break;
                        case "2": // 1.5m-2m
                            where.TotalPayment = { [Op.between]: [1500000, 2000000] };
                            break;
                        case "3": // >2m
                            where.TotalPayment = { [Op.gt]: 2000000 };
                            break;
                        default:
                            resolve({
                                errCode: 1,
                                errMessage: "Khoảng giá không hợp lệ!",
                                data: null
                            });
                            return;
                    }
                }
            }

            // Sắp xếp
            switch (sort) {
                case "1": // Đơn hàng mới nhất
                    order.push(["CreatedAt", "DESC"]);
                    break;
                case "2": // Đơn hàng cũ nhất
                    order.push(["CreatedAt", "ASC"]);
                    break;
                case "3": // TotalPayment tăng dần
                    order.push(["TotalPayment", "ASC"]);
                    break;
                case "4": // TotalPayment giảm dần
                    order.push(["TotalPayment", "DESC"]);
                    break;
                case "5": // TotalQuantity tăng dần
                    order.push(["TotalQuantity", "ASC"]);
                    break;
                case "6": // TotalQuantity giảm dần
                    order.push(["TotalQuantity", "DESC"]);
                    break;
                default: // Mặc định (0)
                    break;
            }

            // Lấy danh sách hóa đơn
            const { count, rows } = await db.Invoice.findAndCountAll({
                where,
                attributes: [
                    "InvoiceID",
                    "ReceiverName",
                    "ReceiverPhone",
                    "TotalQuantity",
                    "TotalPayment",
                    "CreatedAt",
                    "CanceledAt",
                    "PaymentStatus",
                    "ShippingStatus"
                ],
                limit,
                offset,
                order,
                raw: true
            });
            const data = rows.map(item => ({
                InvoiceID: item.InvoiceID,
                ReceiverName: item.ReceiverName,
                ReceiverPhone: item.ReceiverPhone,
                TotalQuantity: parseInt(item.TotalQuantity),
                TotalPayment: parseFloat(item.TotalPayment),
                CreatedAt: item.CreatedAt,
                CanceledAt: item.CanceledAt,
                PaymentStatus: item.PaymentStatus,
                ShippingStatus: item.ShippingStatus
            }));
            resolve({
                errCode: 0,
                errMessage: "Lấy danh sách đơn hàng thành công!",
                data,
                totalItems: count
            });
        } catch (e) {
            console.log("Error in loadInvoiceInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy danh sách đơn hàng: ${e.message}`,
                data: null
            });
        }
    });
};

export default {
    createInvoice,
    getAccountInvoiceInfo,
    getInvoiceDetailInfo,
    loadInvoiceInfo,
};
