import invoiceService from '../services/invoiceService';
const { getRevenueStats } = require('../services/invoiceService');
const { getTopProducts } = require('../services/invoiceService');

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};

let handleGetAccountInvoiceInfo = async (req, res) => {
  try {
    let response = await invoiceService.getAccountInvoiceInfo(req.query.AccountID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadInvoiceInfo = async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    const date = req.query.date || '';
    let response = await invoiceService.loadInvoiceInfo(page, limit, search, filter, sort, date);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetInvoiceDetailInfo = async (req, res) => {
  try {
    let response = await invoiceService.getInvoiceDetailInfo(req.query.InvoiceID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateInvoice = async (req, res) => {
  try {
    const { AccountID, ReceiverName, ReceiverPhone, ReceiverAddress, cartItems, TotalQuantity, TotalPrice, DiscountAmount, TotalPayment, PaymentStatus, ShippingStatus, PaymentType, ShippingMethod, CouponID, Email, isBuyNow } = req.body;
    let response = await invoiceService.createInvoice(AccountID, ReceiverName, ReceiverPhone, ReceiverAddress, cartItems, TotalQuantity, TotalPrice, DiscountAmount, TotalPayment, PaymentStatus, ShippingStatus, PaymentType, ShippingMethod, CouponID, Email, isBuyNow, req); // Thêm req ở cuối
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleChangeInvoiceStatus = async (req, res) => {
  try {
    const { InvoiceID, Type, Status, CancelReason } = req.body;
    let response = await invoiceService.changeInvoiceStatus(InvoiceID, Type, Status, CancelReason);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return handleError(res, e);
  }
};

let handleGetInvoiceEmail = async (req, res) => {
  try {
    const { BillID, Email } = req.body;
    let response = await invoiceService.getInvoiceEmail(BillID, Email);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadRevenueStats = async (req, res) => {
  try {
    const { Type, StartDate, EndDate } = req.query; // Lấy params từ query (daily/monthly/yearly, dates)
    const data = await getRevenueStats(Type, StartDate, EndDate); // Gọi service
    return res.status(200).json({ errCode: 0, errMessage: 'OK', data });
  } catch (e) {
    console.log(e);
    return res.status(200).json({ errCode: -1, errMessage: 'Error from server...' });
  }
};

let handleLoadTopProducts = async (req, res) => {
  try {
    const { Type, StartDate, EndDate } = req.query;
    const data = await getTopProducts(Type, StartDate, EndDate);
    return res.status(200).json({ errCode: 0, errMessage: 'OK', data });
  } catch (e) {
    console.log(e);
    return res.status(200).json({ errCode: -1, errMessage: 'Error from server...' });
  }
};

module.exports = {
  handleGetAccountInvoiceInfo,
  handleLoadInvoiceInfo,
  handleGetInvoiceDetailInfo,
  handleCreateInvoice,
  handleChangeInvoiceStatus,
  handleGetInvoiceEmail,
  handleLoadRevenueStats,
  handleLoadTopProducts,
};
