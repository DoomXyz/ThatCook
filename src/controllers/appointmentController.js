import appointmentService from '../services/appointmentService';

let handleCreateAppointment = async (req, res) => {
  try {
    const {
      customername,
      customeremail,
      customerphone,
      appointmentdate,
      starttime,

      notes,
      accountid,
      veterinarianid,
      serviceid,
      petid,
      imageInfo,
    } = req.body;

    let response = await appointmentService.createAppointment(
      customername,
      customeremail,
      customerphone,
      appointmentdate,
      starttime,

      notes,
      accountid,
      veterinarianid,
      serviceid,
      petid,
      imageInfo
    );
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

module.exports = {
  handleCreateAppointment,
  handleGetAvailableTimes,
  handleGetServiceInfo
};
