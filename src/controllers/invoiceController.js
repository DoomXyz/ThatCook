import invoiceService from '../services/invoiceService';

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
    let response = await invoiceService.getAccountInvoiceInfo(req.query.accountid);
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
    let response = await invoiceService.getInvoiceDetailInfo(req.query.invoiceid);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateInvoice = async (req, res) => {
  try {
    const { accountid, receivername, receiverphone, receiveraddress, cartItems, totalquantity, totalprice, discountamount,
      totalpayment, paymentstatus, shippingstatus, paymenttype, shippingmethod, couponid, email, isBuyNow } = req.body;
    let response = await invoiceService.createInvoice(accountid, receivername, receiverphone, receiveraddress, cartItems, totalquantity, totalprice, discountamount, totalpayment, paymentstatus, shippingstatus, paymenttype, shippingmethod, couponid, email, isBuyNow);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleChangeInvoiceStatus = async (req, res) => {
  try {
    const { invoiceid, type, status, cancelReason } = req.body;
    let response = await invoiceService.changeInvoiceStatus(invoiceid, type, status, cancelReason);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return handleError(res, e);
  }
};

let handleGetInvoiceEmail = async (req, res) => {
  try {
    const { invoiceid, email } = req.body;
    let response = await invoiceService.getInvoiceEmail(invoiceid, email);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  handleGetAccountInvoiceInfo,
  handleLoadInvoiceInfo,
  handleGetInvoiceDetailInfo,
  handleCreateInvoice,
  handleChangeInvoiceStatus,
  handleGetInvoiceEmail,
};