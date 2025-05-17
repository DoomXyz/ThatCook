import axios from '../axios';

const handleGetPetInfoApi = (accountid) => {
    return axios.get(`/api/get-petinfo?accountid=${accountid}`);
};

const handleSavePetInfoApi = (accountid, petInfo) => {
    console.log(accountid, petInfo)
    return axios.post('/api/save-petinfo', { accountid, petInfo });
};

export {
    handleGetPetInfoApi,
    handleSavePetInfoApi
}
