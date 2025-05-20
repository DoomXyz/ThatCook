import axios from '../axios';

//converted
const handleRegisterApi = (userInfo) => {
  return axios.post('/api/register', userInfo);
};
const handleLoginApi = (accountname, password, rememberLogin) => {
  return axios.post('/api/login', { accountname, password, rememberLogin });
};
const handleVerifyTokenApi = () => {
  return axios.get('/api/verify-token');
};
const handleLogoutApi = () => {
  return axios.get('/api/logout');
};
const handleGetAccountInfoApi = (accountid) => {
  return axios.get(`/api/get-accountinfo?accountid=${accountid}`);
};

const handleLoadAccountInfoApi = (page, limit, search, filter, sort) => {
  return axios.get(`/api/load-accountinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleChangeAccountStatusApi = (accountid, accountstatus) => {
  return axios.put('/api/change-accountstatus', { accountid, accountstatus });
};

const handleChangeAccountInfoApi = (userInfo) => {
  return axios.put('/api/change-accountinfo', userInfo);
};

const handleChangePasswordApi = (accountid, password, newpassword) => {
  return axios.put('/api/change-password', { accountid, password, newpassword });
};

const handleGetVeterinarianInfoApi = (accountid) => {
  return axios.get(`/api/get-veterinarianinfo?accountid=${accountid}`);
};

const handleGetVeterinarianServicesApi = (accountid) => {
  return axios.get(`/api/get-veterinarianservice?accountid=${accountid}`);
};


const handleSendForgotTokenApi = (email) => {
  return axios.post('/api/send-forgot-token', { email });
};

const handleVerifyForgotTokenApi = (accountid, token) => {
  return axios.post('/api/verify-forgot-token', { accountid, token });
};

const handleLoadVeterinarianInfoApi = (page, limit, search, filter, sort) => {
  return axios.get(`/api/load-veterinarianinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleChangeWorkingStatusApi = (accountid, workingstatus) => {
  return axios.put('/api/change-workingstatus', { accountid, workingstatus });
};

export {
  handleRegisterApi,
  handleLoginApi,
  handleVerifyTokenApi,
  handleLogoutApi,
  handleGetAccountInfoApi,
  handleLoadAccountInfoApi,
  handleChangeAccountStatusApi,
  handleChangeAccountInfoApi,
  handleChangePasswordApi,
  handleGetVeterinarianInfoApi,
  handleGetVeterinarianServicesApi,
  handleSendForgotTokenApi,
  handleVerifyForgotTokenApi,
  handleLoadVeterinarianInfoApi,
  handleChangeWorkingStatusApi,
};
