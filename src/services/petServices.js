import axios from '../axios';

const handleGetAccountPetInfoApi = (accountid) => {
  return axios.get(`/api/get-account-petinfo?accountid=${accountid}`);
};

const handleGetPetInfoApi = (petid) => {
  return axios.get(`/api/get-petinfo?petid=${petid}`);
};

const handleSavePetInfoApi = (accountid, petInfo) => {
  return axios.post('/api/save-petinfo', { accountid, petInfo });
};

const handleChangePetInfoApi = (petid, petInfo) => {
  return axios.put('/api/change-petinfo', { petid, petInfo });
};

const handleRemovePetApi = (petid) => {
  return axios.put('/api/remove-pet', { petid });
};

export {
  handleGetAccountPetInfoApi,
  handleGetPetInfoApi,
  handleSavePetInfoApi,
  handleChangePetInfoApi,
  handleRemovePetApi,
};
