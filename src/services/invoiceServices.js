import axios from '../axios';

const handleCreateInvoiceApi = (invoiceData) => {
  return axios.post('/api/create-invoice', invoiceData);
};

const handleGetAccountInvoiceInfoApi = (AccountID) => {
  return axios.get(`/api/get-account-invoiceinfo?AccountID=${AccountID}`);
};

const handleGetInvoiceDetailInfoApi = (InvoiceID) => {
  return axios.get(`/api/get-invoicedetailinfo?InvoiceID=${InvoiceID}`);
};

const handleLoadInvoiceInfoApi = (page, limit, search, filter, sort, date) => {
  return axios.get(`/api/load-invoiceinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date=${date}`);
};

const handleChangeInvoiceStatusApi = (InvoiceID, Type, Status, CancelReason) => {
  return axios.put('/api/change-invoicestatus', { InvoiceID, Type, Status, CancelReason });
};

const handleSendInvoiceEmailApi = (sendInfo) => {
  return axios.post('/api/get-invoice-email', sendInfo);
};

// const handleLoadRevenueStatsApi = (Type, StartDate, EndDate) => {
//   return axios.get(`/api/load-revenue-stats?Type=${Type}&StartDate=${StartDate}&EndDate=${EndDate}`);
// };

const handleLoadRevenueStatsApi = (Type, StartDate, EndDate) => {
  return axios.get(`/api/load-revenue-stats?Type=${Type}&StartDate=${StartDate}&EndDate=${EndDate}`, { withCredentials: true });
};

// const handleLoadTopProductsApi = (Type, StartDate, EndDate) => {
//   return axios.get(`/api/load-top-products?Type=${Type}&StartDate=${StartDate}&EndDate=${EndDate}`);
// };

const handleLoadTopProductsApi = (Type, StartDate, EndDate) => {
  return axios.get(`/api/load-top-products?Type=${Type}&StartDate=${StartDate}&EndDate=${EndDate}`, { withCredentials: true });
};

export { handleCreateInvoiceApi, handleGetAccountInvoiceInfoApi, handleGetInvoiceDetailInfoApi, handleLoadInvoiceInfoApi, handleChangeInvoiceStatusApi, handleSendInvoiceEmailApi, handleLoadRevenueStatsApi, handleLoadTopProductsApi };
