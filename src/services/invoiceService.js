import { Op, literal } from 'sequelize';
import db from '../models/index';
import { checkValidAllCode, generateID, sendNotification } from './utilitiesService';

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const querystring = require('qs');

let sendInvoiceEmail = async (InvoiceID, Email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const invoice = await db.Invoice.findOne({
      where: { InvoiceID },
      attributes: ['InvoiceID', 'ReceiverName', 'ReceiverPhone', 'ReceiverAddress', 'TotalQuantity', 'TotalPrice', 'DiscountAmount', 'TotalPayment', 'CreatedAt', 'PaymentType', 'ShippingMethod', 'ShippingStatus'],
      raw: true,
    });
    if (!invoice) {
      console.log('Hóa đơn không tồn tại');
      return false;
    }
    const invoiceDetails = await db.InvoiceDetail.findAll({
      where: { InvoiceID },
      attributes: ['ProductID', 'ProductDetailID', 'ItemQuantity', 'ItemPrice'],
      raw: true,
    });
    let productList = [];
    for (const detail of invoiceDetails) {
      const product = await db.Product.findOne({
        where: { ProductID: detail.ProductID },
        attributes: ['ProductName'],
        raw: true,
      });
      const productDetail = await db.ProductDetail.findOne({
        where: { ProductDetailID: detail.ProductDetailID },
        attributes: ['DetailName'],
        raw: true,
      });
      if (product && productDetail) {
        productList.push(`
          - ${product.ProductName} (${productDetail.DetailName}): ${detail.ItemQuantity} x ${detail.ItemPrice.toLocaleString()} VND
        `);
      }
    }
    const PaymentType = await db.AllCodes.findOne({
      where: { Type: 'PaymentType', Code: invoice.PaymentType },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    const ShippingMethod = await db.AllCodes.findOne({
      where: { Type: 'ShippingMethod', Code: invoice.ShippingMethod },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    const ShippingStatus = await db.AllCodes.findOne({
      where: { Type: 'ShippingStatus', Code: invoice.ShippingStatus },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: `Hóa đơn #${invoice.InvoiceID} - Xác nhận đơn hàng`,
      text: `
        Kính gửi Quý khách,

        Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi! Dưới đây là chi tiết hóa đơn của bạn:

        Mã hóa đơn: ${invoice.InvoiceID}
        Tên người nhận: ${invoice.ReceiverName}
        Số điện thoại: ${invoice.ReceiverPhone}
        Địa chỉ giao hàng: ${invoice.ReceiverAddress}
        Danh sách sản phẩm:
        ${productList.join('')}
        Tổng sản phẩm: ${invoice.TotalQuantity}
        Tổng thanh toán: ${invoice.TotalPayment.toLocaleString()} VND
        Phương thức thanh toán: ${PaymentType?.CodeValueVI || invoice.PaymentType}
        Phương thức giao hàng: ${ShippingMethod?.CodeValueVI || invoice.ShippingMethod}
        Trạng thái giao hàng: ${ShippingStatus?.CodeValueVI || invoice.ShippingStatus}
        Ngày tạo: ${new Date(invoice.CreatedAt).toLocaleString()}

        Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.

        Trân trọng,
        Đội ngũ cửa hàng
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log('Lỗi khi gửi Email: ', e);
    return false;
  }
};

let validateInvoiceInput = async (invoiceInfo) => {
  if (!invoiceInfo || Object.keys(invoiceInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin hóa đơn!',
      data: null,
    };
  }
  const { AccountID, ReceiverName, ReceiverPhone, ReceiverAddress, cartItems, TotalQuantity, TotalPrice, DiscountAmount, TotalPayment, PaymentStatus, ShippingStatus, PaymentType, ShippingMethod, CouponID } = invoiceInfo;
  if (!ReceiverName?.trim()) {
    return {
      errCode: -1,
      errMessage: 'Tên người nhận không được để trống!',
      data: null,
    };
  }
  const UserName = ReceiverName.trim();
  const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
  if (!userNameRegex.test(UserName)) {
    return {
      errCode: 1,
      errMessage: 'Tên người nhận hàng sai định dạng!',
      data: null,
    };
  }
  if (!ReceiverPhone?.trim()) {
    return {
      errCode: -1,
      errMessage: 'Số điện thoại không được để trống!',
      data: null,
    };
  } else {
    const phoneNumber = ReceiverPhone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại nhận hàng không hợp lệ!',
        data: null,
      };
    }
  }
  if (!ReceiverAddress?.trim() || ReceiverAddress.trim().length > 255) {
    return {
      errCode: -1,
      errMessage: 'Địa chỉ nhận hàng trống hoặc vượt quá 255 ký tự!',
      data: null,
    };
  }
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      errCode: -1,
      errMessage: 'Giỏ hàng trống hoặc không hợp lệ!',
      data: null,
    };
  }
  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    if (!item.ProductID || !item.ProductDetailID || !item.ItemQuantity || !item.ItemPrice) {
      return {
        errCode: -1,
        errMessage: `Thiếu thông tin sản phẩm tại dòng ${i + 1}!`,
        data: null,
      };
    }
    if (isNaN(item.ItemQuantity) || item.ItemQuantity <= 0) {
      return {
        errCode: 1,
        errMessage: `Số lượng sản phẩm tại dòng ${i + 1} không hợp lệ!`,
        data: null,
      };
    }
    if (isNaN(item.ItemPrice) || item.ItemPrice < 0) {
      return {
        errCode: 1,
        errMessage: `Giá sản phẩm tại dòng ${i + 1} không hợp lệ!`,
        data: null,
      };
    }
    const validProduct = await db.Product.findOne({
      where: { ProductID: item.ProductID },
    });
    if (!validProduct) {
      return {
        errCode: 2,
        errMessage: `Sản phẩm ${item.ProductID} tại dòng ${i + 1} không tồn tại!`,
        data: null,
      };
    }
    const validDetail = await db.ProductDetail.findOne({
      where: { ProductDetailID: item.ProductDetailID },
    });
    if (!validDetail) {
      return {
        errCode: 2,
        errMessage: `Chi tiết sản phẩm ${item.ProductDetailID} tại dòng ${i + 1} không tồn tại!`,
        data: null,
      };
    }
    if (validDetail.Stock < item.ItemQuantity) {
      return {
        errCode: 2,
        errMessage: `Sản phẩm ${validProduct.ProductName} (${validDetail.DetailName}) tại dòng ${i + 1} không đủ tồn kho!`,
        data: null,
      };
    }
  }
  if (!TotalQuantity || isNaN(TotalQuantity) || TotalQuantity <= 0) {
    return {
      errCode: -1,
      errMessage: 'Tổng số lượng sản phẩm không hợp lệ!',
      data: null,
    };
  }
  if (!TotalPrice || isNaN(TotalPrice) || TotalPrice < 0) {
    return {
      errCode: -1,
      errMessage: 'Tổng giá trị đơn hàng không hợp lệ!',
      data: null,
    };
  }
  if (DiscountAmount && (isNaN(DiscountAmount) || DiscountAmount < 0)) {
    return {
      errCode: -1,
      errMessage: 'Số tiền giảm giá không hợp lệ!',
      data: null,
    };
  }
  if (!TotalPayment || isNaN(TotalPayment) || TotalPayment < 0) {
    return {
      errCode: -1,
      errMessage: 'Tổng thanh toán không hợp lệ!',
      data: null,
    };
  }
  if (!PaymentStatus) {
    return {
      errCode: -1,
      errMessage: 'Trạng thái thanh toán không được để trống!',
      data: null,
    };
  } else {
    const validPaymentStatus = await checkValidAllCode('PaymentStatus', PaymentStatus);
    if (!validPaymentStatus) {
      return {
        errCode: 1,
        errMessage: 'Trạng thái thanh toán không hợp lệ!',
        data: null,
      };
    }
  }
  if (!ShippingStatus) {
    return {
      errCode: -1,
      errMessage: 'Trạng thái giao hàng không được để trống!',
      data: null,
    };
  } else {
    const validShippingStatus = await checkValidAllCode('ShippingStatus', ShippingStatus);
    if (!validShippingStatus) {
      return {
        errCode: 1,
        errMessage: 'Trạng thái giao hàng không hợp lệ!',
        data: null,
      };
    }
  }
  if (!PaymentType) {
    return {
      errCode: -1,
      errMessage: 'Phương thức thanh toán không được để trống!',
      data: null,
    };
  } else {
    const validPaymentType = await checkValidAllCode('PaymentType', PaymentType);
    if (!validPaymentType) {
      return {
        errCode: 1,
        errMessage: 'Phương thức thanh toán không hợp lệ!',
        data: null,
      };
    }
  }
  if (!ShippingMethod) {
    return {
      errCode: -1,
      errMessage: 'Phương thức giao hàng không được để trống!',
      data: null,
    };
  } else {
    const validShippingMethod = await checkValidAllCode('ShippingMethod', ShippingMethod);
    if (!validShippingMethod) {
      return {
        errCode: 1,
        errMessage: 'Phương thức giao hàng không hợp lệ!',
        data: null,
      };
    }
  }
  if (AccountID) {
    const check = await checkAccountExist(AccountID);
    if (!check) {
      return {
        errCode: 1,
        errMessage: 'Tài khoản không tồn tại trong hệ thống!',
        data: null,
      };
    }
  }
  if (CouponID) {
    const check = await checkCouponExist(CouponID);
    if (!check) {
      return {
        errCode: 1,
        errMessage: 'Mã giảm giá không tồn tại trong hệ thống!',
        data: null,
      };
    }
  }
  return null;
};

let checkAccountExist = (AccountID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã tài khoản để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.Account.findOne({
        where: { AccountID },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log('Error in checkAccountExist: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra AccountID: ' + e.message,
        data: null,
      });
    }
  });
};

let checkCouponExist = (CouponID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!CouponID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã giảm giá để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.Coupon.findOne({
        where: { CouponID },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log('Error in checkCouponExist: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra CouponID: ' + e.message,
        data: null,
      });
    }
  });
};

let getAccountInvoiceInfo = (AccountID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const accountExists = await checkAccountExist(AccountID);
      if (!accountExists) {
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }
      const data = await db.Invoice.findAll({
        where: { AccountID },
        attributes: ['InvoiceID', 'ReceiverName', 'ReceiverPhone', 'ReceiverAddress', 'TotalQuantity', 'TotalPayment', 'CreatedAt', 'CanceledAt', 'PaymentStatus', 'ShippingStatus'],
        order: [['CreatedAt', 'DESC']],
        raw: true,
      });
      if (!data || data.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy đơn hàng nào!',
          data: [],
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin đơn hàng thành công!',
        data,
      });
    } catch (e) {
      console.log('Error in getAccountInvoiceInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin đơn hàng: ' + e,
        data: null,
      });
    }
  });
};

let loadInvoiceInfo = (page, limit, search, filter, sort, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!page || !limit || page < 1 || limit < 1) {
        resolve({
          errCode: -1,
          errMessage: 'Tham số page hoặc limit không hợp lệ!',
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
      if (sort && !['0', '1', '2', '3', '4', '5', '6'].includes(sort)) {
        resolve({
          errCode: 1,
          errMessage: 'Tham số sort không hợp lệ!',
          data: null,
        });
        return;
      }
      const offset = (page - 1) * limit;
      let where = {};
      let order = [];

      // Tìm kiếm theo ReceiverName hoặc ReceiverPhone
      if (search) {
        const searchTerm = search.trim().substring(0, 50);
        where[Op.or] = [{ ReceiverName: { [Op.like]: `%${searchTerm}%` } }, { ReceiverPhone: { [Op.like]: `%${searchTerm}%` } }];
      }
      // Lọc theo ngày (bỏ qua giờ)
      if (date) {
        const startOfDay = new Date(date);
        if (isNaN(startOfDay.getTime())) {
          resolve({
            errCode: 1,
            errMessage: 'Tham số date không hợp lệ!',
            data: null,
          });
          return;
        }
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);
        where.CreatedAt = {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay,
        };
      }
      // Lọc theo PaymentStatus, ShippingStatus hoặc TotalPayment
      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        if (field === 'PaymentStatus') {
          const validPaymentStatus = await checkValidAllCode('PaymentStatus', value);
          if (!validPaymentStatus) {
            resolve({
              errCode: 1,
              errMessage: 'Trạng thái thanh toán không hợp lệ!',
              data: null,
            });
            return;
          }
          where.PaymentStatus = value;
        } else if (field === 'ShippingStatus') {
          const validShippingStatus = await checkValidAllCode('ShippingStatus', value);
          if (!validShippingStatus) {
            resolve({
              errCode: 1,
              errMessage: 'Trạng thái giao hàng không hợp lệ!',
              data: null,
            });
            return;
          }
          where.ShippingStatus = value;
        } else if (field === 'TotalPayment') {
          switch (value) {
            case '0': // 500k-1m
              where.TotalPayment = { [Op.between]: [500000, 1000000] };
              break;
            case '1': // 1m-1.5m
              where.TotalPayment = { [Op.between]: [1000000, 1500000] };
              break;
            case '2': // 1.5m-2m
              where.TotalPayment = { [Op.between]: [1500000, 2000000] };
              break;
            case '3': // >2m
              where.TotalPayment = { [Op.gt]: 2000000 };
              break;
            default:
              resolve({
                errCode: 1,
                errMessage: 'Khoảng giá không hợp lệ!',
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
      }

      // Sắp xếp
      switch (sort) {
        case '1': // Đơn hàng mới nhất
          order.push(['CreatedAt', 'DESC']);
          break;
        case '2': // Đơn hàng cũ nhất
          order.push(['CreatedAt', 'ASC']);
          break;
        case '3': // TotalPayment tăng dần
          order.push(['TotalPayment', 'ASC']);
          break;
        case '4': // TotalPayment giảm dần
          order.push(['TotalPayment', 'DESC']);
          break;
        case '5': // TotalQuantity tăng dần
          order.push(['TotalQuantity', 'ASC']);
          break;
        case '6': // TotalQuantity giảm dần
          order.push(['TotalQuantity', 'DESC']);
          break;
        default: // Mặc định (0)
          order.push(['CreatedAt', 'DESC']);
          break;
      }

      // Lấy danh sách hóa đơn
      const { count, rows } = await db.Invoice.findAndCountAll({
        where,
        attributes: ['InvoiceID', 'ReceiverName', 'ReceiverPhone', 'TotalQuantity', 'TotalPayment', 'CreatedAt', 'CanceledAt', 'PaymentStatus', 'ShippingStatus'],
        include: [
          {
            model: db.Account,
            attributes: ['AccountID', 'UserName'], // Lấy AccountID và UserName
            required: true, // INNER JOIN để chỉ lấy hóa đơn có khách hàng
          },
        ],
        limit: parseInt(limit),
        offset,
        order,
        raw: true,
        nest: true,
        distinct: true,
      });
      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy đơn hàng nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }
      const formattedRows = rows.map(invoice => ({
        ...invoice,
        AccountID: invoice.Account?.AccountID || null,     // ← ĐÂY LÀ THÔNG TIN BẠN CẦU CẦN
        UserName: invoice.Account?.UserName || 'Khách lẻ',
      }));
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách đơn hàng thành công!',
        data: formattedRows,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadInvoiceInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách đơn hàng: ${e.message}`,
        data: null,
      });
    }
  });
};

let getInvoiceDetailInfo = (InvoiceID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!InvoiceID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const invoice = await db.Invoice.findOne({
        where: { InvoiceID },
        attributes: ['InvoiceID', 'TotalQuantity', 'ReceiverName', 'ReceiverPhone', 'ReceiverAddress', 'TotalPrice', 'DiscountAmount', 'TotalPayment', 'CreatedAt', 'PaymentType', 'ShippingStatus', 'ShippingMethod', 'PaymentStatus', 'CancelReason'],
        raw: true,
      });
      if (!invoice) {
        resolve({
          errCode: 2,
          errMessage: 'Hóa đơn không tồn tại!',
          data: null,
        });
        return;
      }
      const invoiceDetails = await db.InvoiceDetail.findAll({
        where: { InvoiceID },
        attributes: ['ProductID', 'ProductDetailID', 'ItemQuantity', 'ItemPrice'],
        raw: true,
      });
      if (!invoiceDetails || invoiceDetails.length === 0) {
        resolve({
          errCode: 2,
          errMessage: 'Chi tiết đơn hàng không tồn tại!',
          data: null,
        });
        return;
      }
      const data = {
        InvoiceID: invoice.InvoiceID,
        ReceiverName: invoice.ReceiverName,
        ReceiverPhone: invoice.ReceiverPhone,
        ReceiverAddress: invoice.ReceiverAddress,
        TotalQuantity: invoice.TotalQuantity,
        TotalPrice: invoice.TotalPrice,
        DiscountAmount: invoice.DiscountAmount,
        TotalPayment: invoice.TotalPayment,
        CreatedAt: invoice.CreatedAt,
        PaymentType: invoice.PaymentType,
        ShippingMethod: invoice.ShippingMethod,
        ShippingStatus: invoice.ShippingStatus,
        PaymentStatus: invoice.PaymentStatus,
        CancelReason: invoice.CancelReason,
        productList: [],
      };
      for (const detail of invoiceDetails) {
        const product = await db.Product.findOne({
          where: { ProductID: detail.ProductID },
          attributes: ['ProductName', 'ProductPrice', 'ProductImage'],
          raw: true,
        });
        const productDetail = await db.ProductDetail.findOne({
          where: { ProductDetailID: detail.ProductDetailID },
          attributes: ['DetailName', 'ExtraPrice', 'Promotion'],
          raw: true,
        });
        if (!product || !productDetail) {
          resolve({
            errCode: 2,
            errMessage: `Dữ liệu sản phẩm ${detail.ProductID} hoặc chi tiết ${detail.ProductDetailID} không tồn tại!`,
            data: null,
          });
          return;
        }
        data.productList.push({
          ProductName: product.ProductName,
          DetailName: productDetail.DetailName,
          ProductImage: product.ProductImage,
          ItemPrice: detail.ItemPrice,
          ItemQuantity: detail.ItemQuantity,
        });
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy chi tiết đơn hàng thành công!',
        data,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy chi tiết đơn hàng: ' + e,
        data: null,
      });
    }
  });
};

let createInvoice = (AccountID, ReceiverName, ReceiverPhone, ReceiverAddress, cartItems, TotalQuantity, TotalPrice, DiscountAmount, TotalPayment, PaymentStatus, ShippingStatus, PaymentType, ShippingMethod, CouponID, Email, isBuyNow, req) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const invoiceInfo = {
        AccountID,
        ReceiverName,
        ReceiverPhone,
        ReceiverAddress,
        cartItems,
        TotalQuantity,
        TotalPrice,
        DiscountAmount,
        TotalPayment,
        PaymentStatus,
        ShippingStatus,
        PaymentType,
        ShippingMethod,
        CouponID,
      };
      const isValidateInput = await validateInvoiceInput(invoiceInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const invoiceData = {
        AccountID,
        ReceiverName: ReceiverName.trim(),
        ReceiverPhone: ReceiverPhone.trim(),
        ReceiverAddress: ReceiverAddress.trim(),
        cartItems: cartItems.map((item) => ({
          ProductID: item.ProductID,
          ProductDetailID: item.ProductDetailID,
          ItemPrice: item.ItemPrice,
          ItemQuantity: parseInt(item.ItemQuantity),
        })),
        TotalQuantity: parseInt(TotalQuantity),
        TotalPrice,
        DiscountAmount: DiscountAmount || '0.00',
        TotalPayment,
        PaymentStatus,
        ShippingStatus,
        PaymentType,
        ShippingMethod,
        CouponID: CouponID || null,
        Email,
      };
      if (!AccountID) {
        const guestIdResult = await generateID('G', 9, 'Account', 'AccountID');
        if (guestIdResult.errCode !== 0) {
          await transaction.rollback();
          resolve(guestIdResult);
          return;
        }
        AccountID = guestIdResult.data;
      }
      const invoiceIdResult = await generateID('DH', 8, 'Invoice', 'InvoiceID');
      if (invoiceIdResult.errCode !== 0) {
        await transaction.rollback();
        resolve(invoiceIdResult);
        return;
      }
      const InvoiceID = invoiceIdResult.data;
      await db.Invoice.create(
        {
          InvoiceID,
          AccountID,
          ReceiverName: invoiceData.ReceiverName,
          ReceiverPhone: invoiceData.ReceiverPhone,
          ReceiverAddress: invoiceData.ReceiverAddress,
          TotalQuantity: invoiceData.TotalQuantity,
          TotalPrice: invoiceData.TotalPrice,
          DiscountAmount: invoiceData.DiscountAmount,
          TotalPayment: invoiceData.TotalPayment,
          CreatedAt: new Date(),
          CanceledAt: null,
          CancelReason: null,
          PaymentStatus: invoiceData.PaymentStatus,
          ShippingStatus: invoiceData.ShippingStatus,
          PaymentType: invoiceData.PaymentType,
          ShippingMethod: invoiceData.ShippingMethod,
          CouponID: invoiceData.CouponID,
        },
        { transaction }
      );
      for (const item of invoiceData.cartItems) {
        await db.InvoiceDetail.create(
          {
            InvoiceID,
            ProductID: item.ProductID,
            ProductDetailID: item.ProductDetailID,
            ItemPrice: item.ItemPrice,
            ItemQuantity: item.ItemQuantity,
          },
          { transaction }
        );
        await db.ProductDetail.update(
          {
            Stock: literal(`Stock - ${item.ItemQuantity}`),
          },
          {
            where: { ProductDetailID: item.ProductDetailID },
            transaction,
          }
        );
      }
      if (invoiceData.AccountID && !isBuyNow) {
        await db.CartItem.destroy({
          where: { AccountID: invoiceData.AccountID },
          transaction,
        });
      }
      await transaction.commit();
      //Phân loại thanh toán để thông báo 
      if (AccountID && PaymentType === 'CASH') {
        const owner = await db.Account.findOne({
          where: { AccountType: 'O' },
          attributes: ['AccountID'],
          raw: true,
        });
        if (owner?.AccountID) {
          await sendNotification(
            AccountID,     // người gửi (khách hàng)
            null,          // không gửi cho người cụ thể
            'O',           // gửi cho tất cả chủ shop
            'ORDER_CONFIRM',
            InvoiceID      // mã đơn hàng
          );
        } else {
          console.log('[ERROR] Không tìm thấy chủ cửa hàng (AccountType=O) trong DB!');
        }
        if (AccountID) {
          try {
            await sendNotification(
              AccountID,
              AccountID,
              null,
              'ORDER_SUCCESS',
              InvoiceID
            );
          } catch (err) {
            console.log('[NOTIF ERROR] Gửi ORDER_SUCCESS thất bại:', err);
          }
        }
      }
      let vnpayUrl = null;
      if (PaymentType === 'QR' || PaymentType === 'CARD') {
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
        const bankCode = PaymentType === 'QR' ? 'VNPAYQR' : ''; // Rỗng cho card form
        const vnpayResponse = await generateVnpayUrl(InvoiceID, TotalPayment, ipAddr, bankCode); // Thêm bankCode param
        if (vnpayResponse.errCode === 0) {
          vnpayUrl = vnpayResponse.data;
        }
      }

      let emailSent = true;
      if (invoiceData.Email) {
        emailSent = await sendInvoiceEmail(InvoiceID, invoiceData.Email);
      }
      if (!emailSent && invoiceData.Email) {
        resolve({
          errCode: 0,
          errMessage: 'Tạo đơn hàng thành công, nhưng gửi Email thất bại!',
          data: { InvoiceID, vnpayUrl },
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Tạo đơn hàng thành công!',
        data: { InvoiceID, vnpayUrl },
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in createInvoice: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi tạo đơn hàng: ' + e,
        data: null,
      });
    }
  });
};

let changeInvoiceStatus = (InvoiceID, Type, Status, CancelReason) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!InvoiceID || !Type || !Status) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const invoice = await db.Invoice.findOne({
        where: { InvoiceID },
        raw: false,
        transaction,
      });
      if (!invoice) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Hóa đơn không tồn tại!',
          data: null,
        });
        return;
      }
      if (!['PaymentStatus', 'ShippingStatus'].includes(Type)) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Loại trạng thái không hợp lệ!',
          data: null,
        });
        return;
      }
      const currentStatus = Type === 'PaymentStatus' ? invoice.PaymentStatus : invoice.ShippingStatus;
      if (currentStatus === Status) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      const validStatus = await checkValidAllCode(Type === 'PaymentStatus' ? 'PaymentStatus' : 'ShippingStatus', Status);
      if (!validStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: `Trạng thái ${Type === 'PaymentStatus' ? 'thanh toán' : 'giao hàng'} không hợp lệ!`,
          data: null,
        });
        return;
      }
      if (Type === 'ShippingStatus' && ['PEND_CANCEL', 'CANCELED'].includes(Status)) {
        if (Status === 'PEND_CANCEL' && !CancelReason?.trim()) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Thiếu lý do hủy khi chuyển sang trạng thái chờ hủy!',
            data: null,
          });
          return;
        }
        if (Status === 'CANCELED' && !CancelReason?.trim() && !invoice.CancelReason) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Thiếu lý do hủy khi chuyển sang trạng thái đã hủy!',
            data: null,
          });
          return;
        }
      }
      if (Type === 'PaymentStatus') {
        invoice.PaymentStatus = Status;
      } else {
        invoice.ShippingStatus = Status;
        if (['PEND_CANCEL', 'CANCELED'].includes(Status)) {
          invoice.CancelReason = CancelReason?.trim() || invoice.CancelReason;
        }
        if (Status === 'CANCELED') {
          invoice.CanceledAt = new Date();
          const invoiceDetails = await db.InvoiceDetail.findAll({
            where: { InvoiceID },
            attributes: ['ProductDetailID', 'ItemQuantity'],
            raw: true,
            transaction,
          });
          for (const detail of invoiceDetails) {
            await db.ProductDetail.update(
              {
                Stock: literal(`Stock + ${detail.ItemQuantity}`),
              },
              {
                where: { ProductDetailID: detail.ProductDetailID },
                transaction,
              }
            );
          }
        }
      }
      await invoice.save({ transaction });
      await transaction.commit();
      // THÊM TỪ ĐÂY ↓↓↓ - GỬI THÔNG BÁO ORDER_CANCEL CHO KHÁCH HÀNG KHI HỦY
      if (Type === 'ShippingStatus' && Status === 'CANCELED') {
        try {
          const invoiceData = await db.Invoice.findOne({
            where: { InvoiceID },
            attributes: ['AccountID'],
            raw: true,
          });
          if (invoiceData?.AccountID) {
            const owner = await db.Account.findOne({
              where: { AccountType: 'O' },
              attributes: ['AccountID'],
              raw: true,
            });
            if (owner?.AccountID) {
              const cancelResult = await sendNotification(
                owner.AccountID,              // Người gửi: chủ cửa hàng
                invoiceData.AccountID,        // Gửi cho: khách hàng cụ thể
                null,                         // Không gửi theo role
                'ORDER_CANCEL',               // Loại: hủy đơn hàng
                InvoiceID                     // Extra: mã đơn hàng
              );
            } else {
              console.log('[ERROR CHANGE] KHÔNG TÌM THẤY CHỦ SHOP!');
            }
          } else {
            console.log('[DEBUG CHANGE] Đơn hàng không có AccountID (khách vãng lai) - Không gửi thông báo');
          }
        } catch (notifErr) {
          console.log('[ERROR CHANGE] Lỗi gửi ORDER_CANCEL: ', notifErr);
        }
      }
      // === THÊM THÔNG BÁO KHI CHUYỂN SANG PAID (admin bấm tay) ===
      if (Type === 'PaymentStatus' && Status === 'PAID') {
        const invoice = await db.Invoice.findOne({
          where: { InvoiceID },
          attributes: ['AccountID'],
          raw: true,
        });

        if (invoice?.AccountID) {
          const owner = await db.Account.findOne({
            where: { AccountType: 'O' },
            attributes: ['AccountID'],
            raw: true,
          });

          if (owner?.AccountID) {
            // Thông báo cho chủ shop
            await sendNotification(
              invoice.AccountID,
              null,
              'O',
              'ORDER_COMPLETE',
              InvoiceID
            );
            // Thông báo cho khách hàng (Sai)
            //await sendNotification(
            //  owner.AccountID,
            //  invoice.AccountID,
            //  null,
            //  'ORDER_SUCCESS',.
            //   InvoiceID
            // );
          } else {
            console.log('[ERROR] Không tìm thấy chủ cửa hàng (AccountType=O) trong DB!');
          }
        } else {
          console.log(`[DEBUG] Đơn hàng ${InvoiceID} không có AccountID (khách vãng lai)`);
        }
      }
      resolve({
        errCode: 0,
        errMessage: 'Thay đổi trạng thái hóa đơn thành công!',
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

const getInvoiceEmail = async (BillID, Email) => {
  try {
    const emailSent = await sendInvoiceEmail(BillID, Email);
    if (emailSent) {
      return {
        errCode: 0,
        errMessage: 'Gửi Email hóa đơn thành công!',
      };
    } else {
      return {
        errCode: 1,
        errMessage: 'Gửi Email hóa đơn thất bại!',
      };
    }
  } catch (e) {
    console.log('Error in handleSendInvoiceEmail: ', e);
    return {
      errCode: 2,
      errMessage: 'Lỗi khi gửi Email hóa đơn: ' + e.message,
    };
  }
};

const getRevenueStats = async (Type = 'monthly', StartDate, EndDate) => {
  let groupBy;
  let dateFormat;

  switch (Type) {
    case 'daily':
      groupBy = [db.sequelize.fn('DATE', db.sequelize.col('Invoice.CreatedAt'))];
      dateFormat = '%Y-%m-%d';
      break;
    case 'monthly':
      groupBy = [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('Invoice.CreatedAt'), '%Y-%m')];
      dateFormat = '%Y-%m';
      break;
    case 'yearly':
      groupBy = [db.sequelize.fn('YEAR', db.sequelize.col('Invoice.CreatedAt'))];
      dateFormat = '%Y';
      break;
    default:
      throw new Error('Invalid Type: must be daily, monthly, or yearly');
  }

  const where = {
    '$Invoice.PaymentStatus$': 'PAID',
    '$Invoice.CanceledAt$': null,
  };

  if (StartDate) {
    where['$Invoice.CreatedAt$'] = { [Op.gte]: new Date(StartDate) };
  }
  if (EndDate) {
    where['$Invoice.CreatedAt$'] = { ...where['$Invoice.CreatedAt$'], [Op.lte]: new Date(EndDate) };
  }

  const revenues = await db.InvoiceDetail.findAll({
    attributes: [
      [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('Invoice.CreatedAt'), dateFormat), 'period'],
      [db.sequelize.fn('SUM', db.sequelize.literal('ItemQuantity * ItemPrice')), 'revenue'],
      [db.sequelize.fn('COUNT', db.sequelize.col('Invoice.InvoiceID')), 'invoiceCount'],
    ],
    include: [
      {
        model: db.Invoice,
        attributes: [],
        required: true,
      },
    ],
    where,
    group: groupBy,
    order: [['period', 'DESC']],
    raw: true,
  });

  return revenues;
};

const getTopProducts = async (Type = 'monthly', StartDate, EndDate) => {
  const where = {
    '$Invoice.PaymentStatus$': 'PAID',
    '$Invoice.CanceledAt$': null,
  };

  if (StartDate) {
    where['$Invoice.CreatedAt$'] = { [Op.gte]: new Date(StartDate) };
  }
  if (EndDate) {
    where['$Invoice.CreatedAt$'] = { ...where['$Invoice.CreatedAt$'], [Op.lte]: new Date(EndDate) };
  }

  const topProducts = await db.InvoiceDetail.findAll({
    attributes: ['ProductID', [db.sequelize.fn('SUM', db.sequelize.col('ItemQuantity')), 'TotalSold']],
    include: [
      {
        model: db.Invoice,
        attributes: [],
        required: true,
      },
      {
        model: db.Product,
        attributes: ['ProductName'],
      },
    ],
    where,
    group: ['ProductID'],
    order: [[db.sequelize.fn('SUM', db.sequelize.col('ItemQuantity')), 'DESC']],
    limit: 5,
    raw: true,
  });

  return topProducts.map((item) => ({
    ProductID: item.ProductID,
    ProductName: item['Product.ProductName'],
    TotalSold: item.TotalSold,
  }));
};

// Hàm sắp xếp object (từ demo VNPay - fix %20 -> +)
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

// Hàm tạo URL VNPay (thêm bankCode param)
let generateVnpayUrl = (InvoiceID, TotalPayment, ipAddr, bankCode = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      let vnpUrl = process.env.VNP_URL;
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      let date = new Date();
      let createDate = date.getFullYear().toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2) + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2);
      let orderId = InvoiceID;
      let amount = TotalPayment * 100;
      let locale = 'vn';
      let currCode = 'VND';
      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = process.env.VNP_TMNCODE;
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = amount;
      vnp_Params['vnp_ReturnUrl'] = process.env.VNP_RETURNURL;
      console.log('Generated vnp_ReturnUrl:', process.env.VNP_RETURNURL);
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode; // QR: 'VNPAYQR', card: rỗng hoặc 'NCB' cho test
      }

      vnp_Params = sortObject(vnp_Params);

      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
      let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

      resolve({
        errCode: 0,
        errMessage: 'Tạo URL VNPay thành công',
        data: vnpUrl,
      });
    } catch (e) {
      console.log('Lỗi tạo URL VNPay:', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi tạo URL VNPay: ' + e.message,
        data: null,
      });
    }
  });
};

// Hàm handleVnpayIpn (từ demo, fix Buffer)
let handleVnpayIpn = (query) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      let vnp_Params = query;
      let secureHash = vnp_Params['vnp_SecureHash'];

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      vnp_Params = sortObject(vnp_Params);
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
      let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      if (secureHash === signed) {
        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
        console.log('IPN received for order:', orderId, 'rspCode:', rspCode);

        if (rspCode === '00') {
          // Success - update 'PAID'
          await db.Invoice.update({ PaymentStatus: 'PAID' }, { where: { InvoiceID: orderId }, transaction });
          const invoice = await db.Invoice.findOne({
            where: { InvoiceID: orderId },
            attributes: ['AccountID'],
            raw: true,
          });

          if (invoice?.AccountID) {
            const owner = await db.Account.findOne({
              where: { AccountType: 'O' },
              attributes: ['AccountID'],
              raw: true,
            });

            if (owner?.AccountID) {

              await sendNotification(invoice.AccountID, null, 'O', 'ORDER_COMPLETE', orderId);
              await sendNotification(owner.AccountID, invoice.AccountID, null, 'ORDER_SUCCESS', orderId);
            } else {
              console.log('[ERROR] Không tìm thấy chủ cửa hàng (AccountType=O) trong DB!');
            }
          } else {
            console.log(`[DEBUG] Đơn hàng ${orderId} không có AccountID (khách vãng lai)`);
          }
          await transaction.commit();
          console.log('IPN Success: Updated Invoice ' + orderId + ' to PAID');
          resolve({ RspCode: '00', Message: 'Confirm Success' });
        } else {
          await transaction.rollback();
          console.log('IPN Fail: rspCode ' + rspCode);
          resolve({ RspCode: rspCode, Message: 'Fail Code ' + rspCode });
        }
      } else {
        await transaction.rollback();
        console.log('IPN Fail: Checksum failed for params:', vnp_Params);
        resolve({ RspCode: '97', Message: 'Checksum failed' });
      }
    } catch (e) {
      await transaction.rollback();
      console.log('Lỗi IPN:', e);
      resolve({ RspCode: '99', Message: 'Unknow error' });
    }
  });
};

module.exports = {
  createInvoice,
  getAccountInvoiceInfo,
  getInvoiceDetailInfo,
  loadInvoiceInfo,
  changeInvoiceStatus,
  getInvoiceEmail,
  getRevenueStats,
  getTopProducts,
  handleVnpayIpn,
};
