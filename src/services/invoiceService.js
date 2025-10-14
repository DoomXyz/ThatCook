import { Op, literal } from 'sequelize';
import db from '../models/index';
import { checkValidAllCode, generateID } from './utilitiesService';

const nodemailer = require('nodemailer');

let sendInvoiceEmail = async (invoiceid, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const invoice = await db.Invoice.findOne({
      where: { InvoiceID: invoiceid },
      attributes: ['InvoiceID', 'ReceiverName', 'ReceiverPhone', 'ReceiverAddress', 'TotalQuantity', 'TotalPrice', 'DiscountAmount', 'TotalPayment', 'CreatedAt', 'PaymentType', 'ShippingMethod', 'ShippingStatus'],
      raw: true,
    });
    if (!invoice) {
      console.log('Hóa đơn không tồn tại');
      return false;
    }
    const invoiceDetails = await db.InvoiceDetail.findAll({
      where: { InvoiceID: invoiceid },
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
    const paymentType = await db.AllCodes.findOne({
      where: { Type: 'PaymentType', Code: invoice.PaymentType },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    const shippingMethod = await db.AllCodes.findOne({
      where: { Type: 'ShippingMethod', Code: invoice.ShippingMethod },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    const shippingStatus = await db.AllCodes.findOne({
      where: { Type: 'ShippingStatus', Code: invoice.ShippingStatus },
      attributes: ['CodeValueVI'],
      raw: true,
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
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
        Phương thức thanh toán: ${paymentType?.CodeValueVI || invoice.PaymentType}
        Phương thức giao hàng: ${shippingMethod?.CodeValueVI || invoice.ShippingMethod}
        Trạng thái giao hàng: ${shippingStatus?.CodeValueVI || invoice.ShippingStatus}
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
  const { accountid, receivername, receiverphone, receiveraddress, cartItems, totalquantity, totalprice, discountamount, totalpayment, paymentstatus, shippingstatus, paymenttype, shippingmethod, couponid } = invoiceInfo;
  if (!receivername?.trim()) {
    return {
      errCode: -1,
      errMessage: 'Tên người nhận không được để trống!',
      data: null,
    };
  }
  const userName = receivername.trim();
  const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
  if (!userNameRegex.test(userName)) {
    return {
      errCode: 1,
      errMessage: 'Tên người nhận hàng sai định dạng!',
      data: null,
    };
  }
  if (!receiverphone?.trim()) {
    return {
      errCode: -1,
      errMessage: 'Số điện thoại không được để trống!',
      data: null,
    };
  } else {
    const phoneNumber = receiverphone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại nhận hàng không hợp lệ!',
        data: null,
      };
    }
  }
  if (!receiveraddress?.trim() || receiveraddress.trim().length > 255) {
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
    if (!item.productid || !item.productdetailid || !item.itemquantity || !item.itemprice) {
      return {
        errCode: -1,
        errMessage: `Thiếu thông tin sản phẩm tại dòng ${i + 1}!`,
        data: null,
      };
    }
    if (isNaN(item.itemquantity) || item.itemquantity <= 0) {
      return {
        errCode: 1,
        errMessage: `Số lượng sản phẩm tại dòng ${i + 1} không hợp lệ!`,
        data: null,
      };
    }
    if (isNaN(item.itemprice) || item.itemprice < 0) {
      return {
        errCode: 1,
        errMessage: `Giá sản phẩm tại dòng ${i + 1} không hợp lệ!`,
        data: null,
      };
    }
    const validProduct = await db.Product.findOne({
      where: { ProductID: item.productid },
    });
    if (!validProduct) {
      return {
        errCode: 2,
        errMessage: `Sản phẩm ${item.productid} tại dòng ${i + 1} không tồn tại!`,
        data: null,
      };
    }
    const validDetail = await db.ProductDetail.findOne({
      where: { ProductDetailID: item.productdetailid },
    });
    if (!validDetail) {
      return {
        errCode: 2,
        errMessage: `Chi tiết sản phẩm ${item.productdetailid} tại dòng ${i + 1} không tồn tại!`,
        data: null,
      };
    }
    if (validDetail.Stock < item.itemquantity) {
      return {
        errCode: 2,
        errMessage: `Sản phẩm ${validProduct.ProductName} (${validDetail.DetailName}) tại dòng ${i + 1} không đủ tồn kho!`,
        data: null,
      };
    }
  }
  if (!totalquantity || isNaN(totalquantity) || totalquantity <= 0) {
    return {
      errCode: -1,
      errMessage: 'Tổng số lượng sản phẩm không hợp lệ!',
      data: null,
    };
  }
  if (!totalprice || isNaN(totalprice) || totalprice < 0) {
    return {
      errCode: -1,
      errMessage: 'Tổng giá trị đơn hàng không hợp lệ!',
      data: null,
    };
  }
  if (discountamount && (isNaN(discountamount) || discountamount < 0)) {
    return {
      errCode: -1,
      errMessage: 'Số tiền giảm giá không hợp lệ!',
      data: null,
    };
  }
  if (!totalpayment || isNaN(totalpayment) || totalpayment < 0) {
    return {
      errCode: -1,
      errMessage: 'Tổng thanh toán không hợp lệ!',
      data: null,
    };
  }
  if (!paymentstatus) {
    return {
      errCode: -1,
      errMessage: 'Trạng thái thanh toán không được để trống!',
      data: null,
    };
  } else {
    const validPaymentStatus = await checkValidAllCode('PaymentStatus', paymentstatus);
    if (!validPaymentStatus) {
      return {
        errCode: 1,
        errMessage: 'Trạng thái thanh toán không hợp lệ!',
        data: null,
      };
    }
  }
  if (!shippingstatus) {
    return {
      errCode: -1,
      errMessage: 'Trạng thái giao hàng không được để trống!',
      data: null,
    };
  } else {
    const validShippingStatus = await checkValidAllCode('ShippingStatus', shippingstatus);
    if (!validShippingStatus) {
      return {
        errCode: 1,
        errMessage: 'Trạng thái giao hàng không hợp lệ!',
        data: null,
      };
    }
  }
  if (!paymenttype) {
    return {
      errCode: -1,
      errMessage: 'Phương thức thanh toán không được để trống!',
      data: null,
    };
  } else {
    const validPaymentType = await checkValidAllCode('PaymentType', paymenttype);
    if (!validPaymentType) {
      return {
        errCode: 1,
        errMessage: 'Phương thức thanh toán không hợp lệ!',
        data: null,
      };
    }
  }
  if (!shippingmethod) {
    return {
      errCode: -1,
      errMessage: 'Phương thức giao hàng không được để trống!',
      data: null,
    };
  } else {
    const validShippingMethod = await checkValidAllCode('ShippingMethod', shippingmethod);
    if (!validShippingMethod) {
      return {
        errCode: 1,
        errMessage: 'Phương thức giao hàng không hợp lệ!',
        data: null,
      };
    }
  }
  if (accountid) {
    const check = await checkAccountExist(accountid);
    if (!check) {
      return {
        errCode: 1,
        errMessage: 'Tài khoản không tồn tại trong hệ thống!',
        data: null,
      };
    }
  }
  if (couponid) {
    const check = await checkCouponExist(couponid);
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

let checkAccountExist = (accountID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã tài khoản để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.Account.findOne({
        where: { AccountID: accountID },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log('Error in checkAccountExist: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra accountid: ' + e.message,
        data: null,
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
          data: null,
        });
        return;
      }
      let exist = await db.Coupon.findOne({
        where: { CouponID: couponID },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log('Error in checkCouponExist: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra couponid: ' + e.message,
        data: null,
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
          data: null,
        });
        return;
      }
      const accountExists = await checkAccountExist(accountid);
      if (!accountExists) {
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }
      const data = await db.Invoice.findAll({
        where: { AccountID: accountid },
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
      // Lọc theo paymentstatus, shippingstatus hoặc totalpayment
      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        if (field === 'paymentstatus') {
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
        } else if (field === 'shippingstatus') {
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
        } else if (field === 'totalpayment') {
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
        limit: parseInt(limit),
        offset,
        order,
        raw: true,
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

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách đơn hàng thành công!',
        data: rows,
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

let getInvoiceDetailInfo = (invoiceid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!invoiceid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const invoice = await db.Invoice.findOne({
        where: { InvoiceID: invoiceid },
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
        where: { InvoiceID: invoiceid },
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
        ProductList: [],
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
        data.ProductList.push({
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

let createInvoice = (accountid, receivername, receiverphone, receiveraddress, cartItems, totalquantity, totalprice, discountamount, totalpayment, paymentstatus, shippingstatus, paymenttype, shippingmethod, couponid, email, isBuyNow) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      const invoiceInfo = {
        accountid,
        receivername,
        receiverphone,
        receiveraddress,
        cartItems,
        totalquantity,
        totalprice,
        discountamount,
        totalpayment,
        paymentstatus,
        shippingstatus,
        paymenttype,
        shippingmethod,
        couponid,
      };

      const isValidateInput = await validateInvoiceInput(invoiceInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const invoiceData = {
        accountid,
        receivername: receivername.trim(),
        receiverphone: receiverphone.trim(),
        receiveraddress: receiveraddress.trim(),
        cartItems: cartItems.map((item) => ({
          productid: item.productid,
          productdetailid: item.productdetailid,
          itemprice: item.itemprice,
          itemquantity: parseInt(item.itemquantity),
        })),
        totalquantity: parseInt(totalquantity),
        totalprice,
        discountamount: discountamount || '0.00',
        totalpayment,
        paymentstatus,
        shippingstatus,
        paymenttype,
        shippingmethod,
        couponid: couponid || null,
        email,
      };
      let AccountID = invoiceData.accountid;
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
          ReceiverName: invoiceData.receivername,
          ReceiverPhone: invoiceData.receiverphone,
          ReceiverAddress: invoiceData.receiveraddress,
          TotalQuantity: invoiceData.totalquantity,
          TotalPrice: invoiceData.totalprice,
          DiscountAmount: invoiceData.discountamount,
          TotalPayment: invoiceData.totalpayment,
          CreatedAt: new Date(),
          CanceledAt: null,
          CancelReason: null,
          PaymentStatus: invoiceData.paymentstatus,
          ShippingStatus: invoiceData.shippingstatus,
          PaymentType: invoiceData.paymenttype,
          ShippingMethod: invoiceData.shippingmethod,
          CouponID: invoiceData.couponid,
        },
        { transaction }
      );
      for (const item of invoiceData.cartItems) {
        await db.InvoiceDetail.create(
          {
            InvoiceID,
            ProductID: item.productid,
            ProductDetailID: item.productdetailid,
            ItemPrice: item.itemprice,
            ItemQuantity: item.itemquantity,
          },
          { transaction }
        );
        await db.ProductDetail.update(
          {
            Stock: literal(`Stock - ${item.itemquantity}`),
          },
          {
            where: { ProductDetailID: item.productdetailid },
            transaction,
          }
        );
      }
      if (invoiceData.accountid && !isBuyNow) {
        await db.CartItem.destroy({
          where: { AccountID: invoiceData.accountid },
          transaction,
        });
      }
      await transaction.commit();
      let emailSent = true;
      if (invoiceData.email) {
        emailSent = await sendInvoiceEmail(InvoiceID, invoiceData.email);
      }
      if (!emailSent && invoiceData.email) {
        resolve({
          errCode: 0,
          errMessage: 'Tạo đơn hàng thành công, nhưng gửi email thất bại!',
          data: { InvoiceID },
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Tạo đơn hàng thành công!',
        data: { InvoiceID },
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

let changeInvoiceStatus = (invoiceid, type, status, cancelReason) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!invoiceid || !type || !status) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const invoice = await db.Invoice.findOne({
        where: { InvoiceID: invoiceid },
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
      if (!['PaymentStatus', 'ShippingStatus'].includes(type)) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Loại trạng thái không hợp lệ!',
          data: null,
        });
        return;
      }
      const currentStatus = type === 'PaymentStatus' ? invoice.PaymentStatus : invoice.ShippingStatus;
      if (currentStatus === status) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      const validStatus = await checkValidAllCode(type === 'PaymentStatus' ? 'PaymentStatus' : 'ShippingStatus', status);
      if (!validStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: `Trạng thái ${type === 'PaymentStatus' ? 'thanh toán' : 'giao hàng'} không hợp lệ!`,
          data: null,
        });
        return;
      }
      if (type === 'ShippingStatus' && ['PEND_CANCEL', 'CANCELED'].includes(status)) {
        if (status === 'PEND_CANCEL' && !cancelReason?.trim()) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Thiếu lý do hủy khi chuyển sang trạng thái chờ hủy!',
            data: null,
          });
          return;
        }
        if (status === 'CANCELED' && !cancelReason?.trim() && !invoice.CancelReason) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Thiếu lý do hủy khi chuyển sang trạng thái đã hủy!',
            data: null,
          });
          return;
        }
      }
      if (type === 'PaymentStatus') {
        invoice.PaymentStatus = status;
      } else {
        invoice.ShippingStatus = status;
        if (['PEND_CANCEL', 'CANCELED'].includes(status)) {
          invoice.CancelReason = cancelReason?.trim() || invoice.CancelReason;
        }
        if (status === 'CANCELED') {
          invoice.CanceledAt = new Date();
          const invoiceDetails = await db.InvoiceDetail.findAll({
            where: { InvoiceID: invoiceid },
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

const getInvoiceEmail = async (billid, email) => {
  try {
    const emailSent = await sendInvoiceEmail(billid, email);
    if (emailSent) {
      return {
        errCode: 0,
        errMessage: 'Gửi email hóa đơn thành công!',
      };
    } else {
      return {
        errCode: 1,
        errMessage: 'Gửi email hóa đơn thất bại!',
      };
    }
  } catch (e) {
    console.log('Error in handleSendInvoiceEmail: ', e);
    return {
      errCode: 2,
      errMessage: 'Lỗi khi gửi email hóa đơn: ' + e.message,
    };
  }
};

const getRevenueStats = async (type = 'monthly', startDate, endDate) => {
  const paidCode = await getPaymentPaidCode(); // Hàm phụ lấy code 'PAID' từ AllCodes

  let groupBy;
  let dateFormat;

  switch (type) {
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
      throw new Error('Invalid type: must be daily, monthly, or yearly');
  }

  const where = {
    '$Invoice.PaymentStatus$': paidCode,
    '$Invoice.CanceledAt$': null,
  };

  if (startDate) {
    where['$Invoice.CreatedAt$'] = { [Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    where['$Invoice.CreatedAt$'] = { ...where['$Invoice.CreatedAt$'], [Op.lte]: new Date(endDate) };
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

const getTopProducts = async (type = 'monthly', startDate, endDate) => {
  const paidCode = await getPaymentPaidCode();

  const where = {
    '$Invoice.PaymentStatus$': paidCode,
    '$Invoice.CanceledAt$': null,
  };

  if (startDate) {
    where['$Invoice.CreatedAt$'] = { [Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    where['$Invoice.CreatedAt$'] = { ...where['$Invoice.CreatedAt$'], [Op.lte]: new Date(endDate) };
  }

  const topProducts = await db.InvoiceDetail.findAll({
    attributes: ['ProductID', [db.sequelize.fn('SUM', db.sequelize.col('ItemQuantity')), 'totalSold']],
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
    productID: item.ProductID,
    productName: item['Product.ProductName'],
    totalSold: item.totalSold,
  }));
};

// Hàm phụ để lấy code 'PAID' động từ AllCodes
const getPaymentPaidCode = async () => {
  try {
    const paidCode = await db.AllCodes.findOne({
      where: { Type: 'PaymentStatus', CodeValueVI: 'Đã thanh toán' }, // Điều chỉnh 'Đã thanh toán' nếu tên VI khác trong DB
      attributes: ['Code'],
      raw: true,
    });
    return paidCode ? paidCode.Code : 'PAID';
  } catch (e) {
    console.log('Error getting PAID code:', e);
    return 'PAID';
  }
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
};
