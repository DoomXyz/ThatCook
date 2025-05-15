import axios from '../axios';

const handleCreateAppointmentApi = (appointmentData) => {
  return axios.post('/api/create-appointment', appointmentData);
};

const handleGetAvailableTimesApi = (appointmentDate, veterinarianID, serviceID) => {
  return axios.get(`/api/get-available-times?appointmentDate=${appointmentDate}&veterinarianID=${veterinarianID}&serviceID=${serviceID}`);
};

const handleGetServiceInfoApi = (serviceid) => {
  return axios.get(`/api/get-serviceinfo?serviceid=${serviceid}`);
};

export {
  handleCreateAppointmentApi,
  handleGetAvailableTimesApi,
  handleGetServiceInfoApi
};
