import axios from '../axios';

const handleCreateAppointmentApi = (appointmentData) => {
  return axios.post('/api/create-appointment', appointmentData);
};

const handleGetServiceInfoApi = (serviceid) => {
  return axios.get(`/api/get-serviceinfo?serviceid=${serviceid}`);
};

export {
  handleCreateAppointmentApi,
  handleGetServiceInfoApi
};
