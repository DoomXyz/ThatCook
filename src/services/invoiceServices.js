import axios from '../axios';

const handleCreateInvoiceApi = (invoiceData) => {
  return axios.post('/api/create-invoice', invoiceData);
};

const handleGetAccountInvoiceInfoApi = (accountid) => {
  return axios.get(`/api/get-account-invoiceinfo?accountid=${accountid}`);
};

const handleGetInvoiceDetailInfoApi = (invoiceid) => {
  return axios.get(`/api/get-invoicedetailinfo?invoiceid=${invoiceid}`);
};

const handleLoadInvoiceInfoApi = (page, limit, search, filter, sort, date) => {
  return axios.get(`/api/load-invoiceinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date=${date}`);
};

const handleChangeInvoiceStatusApi = (invoiceid, type, status, cancelReason) => {
  return axios.put('/api/change-invoicestatus', { invoiceid, type, status, cancelReason });
};

const handleSendInvoiceEmailApi = (sendInfo) => {
  return axios.post('/api/get-invoice-email', sendInfo);
};

// const handleLoadRevenueStatsApi = (type, startDate, endDate) => {
//   return axios.get(`/api/load-revenue-stats?type=${type}&startDate=${startDate}&endDate=${endDate}`);
// };

const handleLoadRevenueStatsApi = (type, startDate, endDate) => {
  return axios.get(`/api/load-revenue-stats?type=${type}&startDate=${startDate}&endDate=${endDate}`, { withCredentials: true });
};

// const handleLoadTopProductsApi = (type, startDate, endDate) => {
//   return axios.get(`/api/load-top-products?type=${type}&startDate=${startDate}&endDate=${endDate}`);
// };

const handleLoadTopProductsApi = (type, startDate, endDate) => {
  return axios.get(`/api/load-top-products?type=${type}&startDate=${startDate}&endDate=${endDate}`, { withCredentials: true });
};

export { handleCreateInvoiceApi, handleGetAccountInvoiceInfoApi, handleGetInvoiceDetailInfoApi, handleLoadInvoiceInfoApi, handleChangeInvoiceStatusApi, handleSendInvoiceEmailApi, handleLoadRevenueStatsApi, handleLoadTopProductsApi };
