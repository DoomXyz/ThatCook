import axios from 'axios';

const handleGetServiceInfoApi = (ServiceID) => {
    return axios.get(`/api/get-serviceinfo?ServiceID=${ServiceID}`);
};

const handleLoadServiceInfoApi = (page, limit, search, filter, sort) => {
    return axios.get(`/api/load-serviceinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleCreateServiceApi = (serviceInfo) => {
    return axios.post('/api/create-service', serviceInfo);
};

const handleChangeServiceInfoApi = (serviceInfo) => {
    return axios.put('/api/change-serviceinfo', serviceInfo);
};

const handleChangeServiceStatusApi = (ServiceID, newStatus) => {
    return axios.put('/api/change-servicestatus', { ServiceID, newStatus });
};

export {
    handleGetServiceInfoApi,
    handleLoadServiceInfoApi,
    handleCreateServiceApi,
    handleChangeServiceInfoApi,
    handleChangeServiceStatusApi,
}