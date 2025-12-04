import axios from '../axios';

const handleLoadScheduleApi = (VeterinarianID, StartDate) => {
  return axios.get(`/api/load-schedule?VeterinarianID=${VeterinarianID}&StartDate=${StartDate}`);
};

const handleChangeScheduleStatusApi = (ScheduleID, ScheduleStatus) => {
  return axios.put('/api/change-ScheduleStatus', { ScheduleID, ScheduleStatus });
};

export { handleLoadScheduleApi, handleChangeScheduleStatusApi };
