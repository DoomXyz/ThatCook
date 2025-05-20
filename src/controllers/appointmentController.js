import appointmentService from '../services/appointmentService';

let handleCreateAppointment = async (req, res) => {
  try {
    const { customername, customeremail, customerphone, appointmentdate, starttime, notes, accountid, veterinarianid, serviceid, petid, imageInfo, type, prevappointmentid } = req.body;
    let response = await appointmentService.createAppointment(customername, customeremail, customerphone, appointmentdate, starttime, notes, accountid, veterinarianid, serviceid, petid, imageInfo, type, prevappointmentid);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};

let handleGetAvailableTimes = async (req, res) => {
  try {
    const { appointmentDate, veterinarianID, serviceID } = req.query;
    let response = await appointmentService.getAvailableTimes(appointmentDate, veterinarianID, serviceID);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};

let handleGetServiceInfo = async (req, res) => {
  try {
    const { serviceid } = req.query;
    let response = await appointmentService.getServiceInfo(serviceid);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};

let handleLoadPendingAppointments = async (req, res) => {
  try {
    const veterinarianid = req.query.veterinarianid || ''
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    const date1 = req.query.date1 || '';
    const date2 = req.query.date2 || '';
    let response = await appointmentService.loadPendingAppointments(veterinarianid, page, limit, search, filter, sort, date1, date2);
    return res.status(200).json(response);
  } catch (e) {
    console.log('Error in handleLoadPendingAppointments: ', e);
    return res.status(500).json({
      errCode: 3,
      errMessage: `Lỗi từ server: ${e.message}`,
      data: null,
    });
  }
};

let handleChangeAppointmentStatus = async (req, res) => {
  try {
    const { appointmentid, appointmentstatus, accountid } = req.body
    let response = await appointmentService.changeAppointmentStatus(appointmentid, appointmentstatus, accountid);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};


module.exports = {
  handleCreateAppointment,
  handleGetAvailableTimes,
  handleGetServiceInfo,
  handleLoadPendingAppointments,
  handleChangeAppointmentStatus,
};
