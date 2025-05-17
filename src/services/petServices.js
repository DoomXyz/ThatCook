import axios from '../axios';

const handleGetAccountPetInfoApi = (accountid) => {
  return axios.get(`/api/get-account-petinfo?accountid=${accountid}`);
};

const handleSavePetInfoApi = (accountid, petInfo) => {
  console.log(accountid, petInfo);
  return axios.post('/api/save-petinfo', { accountid, petInfo });
};

const handleChangePetInfoApi = (petid, petInfo) => {
  return axios.put('/api/change-petinfo', { petid, petInfo });
};

export { handleGetAccountPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi };
