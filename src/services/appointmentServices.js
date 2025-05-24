import axios from '../axios';

const handleCreateAppointmentApi = (appointmentData) => {
  return axios.post('/api/create-appointment', appointmentData);
};

const handleGetAvailableTimesApi = (appointmentDate, veterinarianID, serviceID) => {
  return axios.get(`/api/get-available-times?appointmentDate=${appointmentDate}&veterinarianID=${veterinarianID}&serviceID=${serviceID}`);
};

const handleLoadAppointmentsApi = (veterinarianid, page, limit, search, filter, sort, date1, date2, status) => {
  return axios.get(`/api/load-appointments?veterinarianid=${veterinarianid}&page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date1=${date1}&date2=${date2}&status=${status}`);
};

const handleLoadAppointmentInfoApi = (accountid, page, limit, search, filter, sort, date1, date2) => {
  return axios.get(`/api/load-appointmentinfo?accountid=${accountid}&page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date1=${date1}&date2=${date2}`);
};

const handleLoadAppointmentDetailsApi = (appointmentid) => {
  return axios.get(`/api/load-appointmentdetails?appointmentid=${appointmentid}`);
};

const handleChangeAppointmentStatusApi = (appointmentid, appointmentstatus, accountid) => {
  return axios.put('/api/change-appointmentstatus', { appointmentid, appointmentstatus, accountid });
};

const handleCreateAppointmentBillApi = (appointmentBillData) => {
  return axios.post('/api/create-appointmentbill', appointmentBillData);
};

const handleGetAppointmentBillDetailApi = (appointmentbillid) => {
  return axios.get(`/api/get-appointmentbilldetail?appointmentbillid=${appointmentbillid}`);
};

export {
  handleCreateAppointmentApi,
  handleGetAvailableTimesApi,
  handleLoadAppointmentsApi,
  handleLoadAppointmentInfoApi,
  handleLoadAppointmentDetailsApi,
  handleChangeAppointmentStatusApi,
  handleCreateAppointmentBillApi,
  handleGetAppointmentBillDetailApi,
};
