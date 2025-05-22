import axios from '../axios';

const handleLoadScheduleApi = (veterinarianid, startDate) => {
    return axios.get(`/api/load-schedule?veterinarianid=${veterinarianid}&startDate=${startDate}`);
};

const handleChangeScheduleStatusApi = (scheduleid, schedulestatus) => {
    return axios.put('/api/change-schedulestatus', { scheduleid, schedulestatus });
};

export {
    handleLoadScheduleApi,
    handleChangeScheduleStatusApi
}