import axios from '../axios';

const handleVerifyTokenApi = () => {
  return axios.get('/api/verify-token');
};
const handleRegisterApi = (userInfo) => {
  return axios.post('/api/register', userInfo);
};
const handleLoginApi = (AccountName, Password, rememberLogin) => {
  return axios.post('/api/login', { AccountName, Password, rememberLogin });
};
const handleLogoutApi = () => {
  return axios.get('/api/logout');
};
const handleGetAccountInfoApi = (AccountID) => {
  return axios.get(`/api/get-accountinfo?AccountID=${AccountID}`);
};
const handleLoadAccountInfoApi = (page, limit, search, filter, sort) => {
  return axios.get(`/api/load-accountinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};
const handleChangeAccountStatusApi = (AccountID, AccountStatus) => {
  return axios.put('/api/change-accountstatus', { AccountID, AccountStatus });
};
const handleChangeAccountInfoApi = (userInfo) => {
  return axios.put('/api/change-accountinfo', userInfo);
};
const handleChangePasswordApi = (AccountID, Password, newPassword) => {
  return axios.put('/api/change-password', { AccountID, Password, newPassword });
};
const handleGetVeterinarianInfoApi = (VeterinarianID) => {
  return axios.get(`/api/get-veterinarianinfo?VeterinarianID=${VeterinarianID}`);
};
const handleSendForgotTokenApi = (Email) => {
  return axios.post('/api/send-forgot-token', { Email });
};
const handleVerifyForgotTokenApi = (AccountID, Token) => {
  return axios.post('/api/verify-forgot-token', { AccountID, Token });
};
const handleLoadVeterinarianInfoApi = (page, limit, search, filter, sort) => {
  return axios.get(`/api/load-veterinarianinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};
const handleChangeWorkingStatusApi = (VeterinarianID, WorkingStatus) => {
  return axios.put('/api/change-workingstatus', { VeterinarianID, WorkingStatus });
};
//nằm ở serviceServices
const handleGetVeterinarianServicesApi = (AccountID) => {
  return axios.get(`/api/get-veterinarianservice?AccountID=${AccountID}`);
};
const handleLoadRoleAccountApi = (AccountType) => {
  return axios.get(`/api/get-role-account?AccountType=${AccountType}`);
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
  handleSendForgotTokenApi,
  handleVerifyForgotTokenApi,
  handleLoadVeterinarianInfoApi,
  handleChangeWorkingStatusApi,
  handleGetVeterinarianServicesApi,
  handleLoadRoleAccountApi,
};
