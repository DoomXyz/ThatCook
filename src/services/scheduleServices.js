import axios from '../axios';

const handleLoadScheduleApi = (VeterinarianID, startDate) => {
    return axios.get(`/api/load-schedule?VeterinarianID=${VeterinarianID}&startDate=${startDate}`);
};

const handleChangeScheduleStatusApi = (ScheduleID, ScheduleStatus) => {
    return axios.put('/api/change-ScheduleStatus', { ScheduleID, ScheduleStatus });
};

export {
    handleLoadScheduleApi,
    handleChangeScheduleStatusApi
}