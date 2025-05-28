import appointmentService from '../services/appointmentService';

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};

let handleGetAvailableTimes = async (req, res) => {
  try {
    const { appointmentDate, veterinarianID, serviceID } = req.query;
    let response = await appointmentService.getAvailableTimes(appointmentDate, veterinarianID, serviceID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadAppointmentInfo = async (req, res) => {
  try {
    const accountid = req.query.accountid || ''
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    const date1 = req.query.date1 || '';
    const date2 = req.query.date2 || '';
    let response = await appointmentService.loadAppointmentInfo(accountid, page, limit, search, filter, sort, date1, date2);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadAppointments = async (req, res) => {
  try {
    const veterinarianid = req.query.veterinarianid || ''
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    const date1 = req.query.date1 || '';
    const date2 = req.query.date2 || '';
    const status = req.query.status || '';
    let response = await appointmentService.loadAppointments(veterinarianid, page, limit, search, filter, sort, date1, date2, status);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadAppointmentDetails = async (req, res) => {
  try {
    let response = await appointmentService.loadAppointmentDetails(req.query.appointmentid);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetAppointmentBillDetail = async (req, res) => {
  try {
    const { appointmentbillid } = req.query;
    let response = await appointmentService.getAppointmentBillDetail(appointmentbillid);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateAppointment = async (req, res) => {
  try {
    const { customername, customeremail, customerphone, appointmentdate, starttime, notes, accountid, veterinarianid, serviceid, petid, imageInfo, type, prevappointmentid } = req.body;
    let response = await appointmentService.createAppointment(customername, customeremail, customerphone, appointmentdate, starttime, notes, accountid, veterinarianid, serviceid, petid, imageInfo, type, prevappointmentid);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateAppointmentBill = async (req, res) => {
  try {
    const { veterinarianid, appointmentid, serviceprice, medicalprice, medicalimage, medicalnotes } = req.body;
    let response = await appointmentService.createAppointmentBill(veterinarianid, appointmentid, serviceprice, medicalprice, medicalimage, medicalnotes);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleChangeAppointmentStatus = async (req, res) => {
  try {
    const { appointmentid, appointmentstatus, accountid } = req.body
    let response = await appointmentService.changeAppointmentStatus(appointmentid, appointmentstatus, accountid);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetAppointmentEmail = async (req, res) => {
  try {
    const { billid, email } = req.body;
    let response = await appointmentService.getAppointmentEmail(billid, email);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetAppointmentBillEmail = async (req, res) => {
  try {
    const { billid, email } = req.body;
    let response = await appointmentService.getAppointmentBillEmail(billid, email);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  handleGetAvailableTimes,
  handleLoadAppointmentInfo,
  handleLoadAppointments,
  handleLoadAppointmentDetails,
  handleGetAppointmentBillDetail,
  handleCreateAppointment,
  handleCreateAppointmentBill,
  handleChangeAppointmentStatus,
  handleGetAppointmentEmail,
  handleGetAppointmentBillEmail,
};