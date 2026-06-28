import axios from '../axios';

const handleLoadProductInfoApi = (page, limit, search, filter, sort) => {
  return axios.get(`/api/load-productinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleGetProductInfoApi = (ProductID) => {
  return axios.get(`/api/get-productinfo?ProductID=${ProductID}`);
};

const handleLoadSaleProductInfoApi = (page, limit, search, filter, sort) => {
  return axios.get(`/api/load-sale-productinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleGetSaleProductInfoApi = (ProductID) => {
  return axios.get(`/api/get-sale-productinfo?ProductID=${ProductID}`);
};

const handleGetProductDetailInfoApi = (ProductID, ProductDetailID) => {
  return axios.get(`/api/get-productdetailinfo?ProductID=${ProductID}&ProductDetailID=${ProductDetailID}`);
};

const handleCreateProductApi = (productInfo) => {
  return axios.post('/api/create-product', productInfo);
};

const handleChangeProductInfoApi = (productInfo) => {
  return axios.put('/api/change-productinfo', productInfo);
};

const handleLoadFilteredProductInfoApi = (filterProductType, filterPetType, search) => {
  return axios.get(`/api/load-filtered-productinfo?filterProductType=${filterProductType}&filterPetType=${filterPetType}&search=${search}`);
};

const handleTrackProductClickApi = (ProductID) => {
  return axios.post('/api/track-product-click', { ProductID });
};

const handleLoadClickStatsApi = (Type, StartDate, EndDate) => {
  let url = `/api/load-click-stats?Type=${Type}`;
  if (StartDate) url += `&StartDate=${StartDate}`;
  if (EndDate) url += `&EndDate=${EndDate}`;
  return axios.get(url);
};

const handleGetBrowseHistoryApi = () => {
  return axios.get('/api/get-browse-history');
};

export { handleLoadProductInfoApi, handleGetProductInfoApi, handleLoadSaleProductInfoApi, handleGetSaleProductInfoApi, handleGetProductDetailInfoApi, handleChangeProductInfoApi, handleCreateProductApi, handleLoadFilteredProductInfoApi, handleTrackProductClickApi, handleLoadClickStatsApi, handleGetBrowseHistoryApi };
