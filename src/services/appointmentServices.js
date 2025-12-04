import axios from '../axios';

const handleCreateAppointmentApi = (appointmentData) => {
  return axios.post('/api/create-appointment', appointmentData);
};

const handleGetAvailableTimesApi = (AppointmentDate, VeterinarianID, ServiceID) => {
  return axios.get(`/api/get-available-times?AppointmentDate=${AppointmentDate}&VeterinarianID=${VeterinarianID}&ServiceID=${ServiceID}`);
};

const handleLoadAppointmentsApi = (VeterinarianID, page, limit, search, filter, sort, date1, date2, status) => {
  return axios.get(`/api/load-appointments?VeterinarianID=${VeterinarianID}&page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date1=${date1}&date2=${date2}&status=${status}`);
};

const handleLoadAppointmentInfoApi = (AccountID, page, limit, search, filter, sort, date1, date2) => {
  return axios.get(`/api/load-appointmentinfo?AccountID=${AccountID}&page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date1=${date1}&date2=${date2}`);
};

const handleLoadAppointmentDetailsApi = (AppointmentID) => {
  return axios.get(`/api/load-appointmentdetails?AppointmentID=${AppointmentID}`);
};

const handleChangeAppointmentStatusApi = (AppointmentID, AppointmentStatus, AccountID) => {
  return axios.put('/api/change-AppointmentStatus', { AppointmentID, AppointmentStatus, AccountID });
};

const handleCreateAppointmentBillApi = (appointmentBillInfo) => {
  return axios.post('/api/create-appointmentbill', appointmentBillInfo);
};

const handleGetAppointmentBillDetailApi = (AppointmentBillID) => {
  return axios.get(`/api/get-appointmentbilldetail?AppointmentBillID=${AppointmentBillID}`);
};

const handleSendAppointmentEmailApi = (sendInfo) => {
  return axios.post('/api/get-appointment-email', sendInfo);
};

const handleSendAppointmentBillEmailApi = (sendInfo) => {
  return axios.post('/api/get-appointmentbill-email', sendInfo);
};

export { handleCreateAppointmentApi, handleGetAvailableTimesApi, handleLoadAppointmentsApi, handleLoadAppointmentInfoApi, handleLoadAppointmentDetailsApi, handleChangeAppointmentStatusApi, handleCreateAppointmentBillApi, handleGetAppointmentBillDetailApi, handleSendAppointmentEmailApi, handleSendAppointmentBillEmailApi };
