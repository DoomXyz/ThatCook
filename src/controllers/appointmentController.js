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
    const { AppointmentDate, VeterinarianID, ServiceID } = req.query;
    let response = await appointmentService.getAvailableTimes(AppointmentDate, VeterinarianID, ServiceID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadAppointmentInfo = async (req, res) => {
  try {
    const AccountID = req.query.AccountID || '';
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    const date1 = req.query.date1 || '';
    const date2 = req.query.date2 || '';
    let response = await appointmentService.loadAppointmentInfo(AccountID, page, limit, search, filter, sort, date1, date2);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadAppointments = async (req, res) => {
  try {
    const VeterinarianID = req.query.VeterinarianID || '';
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    const date1 = req.query.date1 || '';
    const date2 = req.query.date2 || '';
    const status = req.query.status || '';
    let response = await appointmentService.loadAppointments(VeterinarianID, page, limit, search, filter, sort, date1, date2, status);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadAppointmentDetails = async (req, res) => {
  try {
    let response = await appointmentService.loadAppointmentDetails(req.query.AppointmentID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetAppointmentBillDetail = async (req, res) => {
  try {
    const { AppointmentBillID } = req.query;
    let response = await appointmentService.getAppointmentBillDetail(AppointmentBillID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateAppointment = async (req, res) => {
  try {
    const { CustomerName, CustomerEmail, CustomerPhone, AppointmentDate, StartTime, Notes, AccountID, VeterinarianID, ServiceID, PetID, imageInfo, Type, PrevAppointmentID } = req.body;
    let response = await appointmentService.createAppointment(CustomerName, CustomerEmail, CustomerPhone, AppointmentDate, StartTime, Notes, AccountID, VeterinarianID, ServiceID, PetID, imageInfo, Type, PrevAppointmentID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateAppointmentBill = async (req, res) => {
  try {
    const { VeterinarianID, AppointmentID, ServicePrice, MedicalPrice, MedicalImage, MedicalNotes, PaymentType } = req.body; // Thêm PaymentType ở đây
    let response = await appointmentService.createAppointmentBill(VeterinarianID, AppointmentID, ServicePrice, MedicalPrice, MedicalImage, MedicalNotes, PaymentType); // Truyền PaymentType vào đây
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleChangeAppointmentStatus = async (req, res) => {
  try {
    const { AppointmentID, AppointmentStatus, AccountID } = req.body;
    let response = await appointmentService.changeAppointmentStatus(AppointmentID, AppointmentStatus, AccountID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetAppointmentEmail = async (req, res) => {
  try {
    const { BillID, Email } = req.body;
    let response = await appointmentService.getAppointmentEmail(BillID, Email);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetAppointmentBillEmail = async (req, res) => {
  try {
    const { BillID, Email } = req.body;
    let response = await appointmentService.getAppointmentBillEmail(BillID, Email);
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
