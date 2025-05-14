import axios from '../axios';

const handleAddToCartApi = (accountid, cartInfo) => {
  return axios.post('/api/add-to-cart', { accountid, cartInfo });
};
const handleGetCartApi = (accountid) => {
  return axios.get(`/api/get-cart?accountid=${accountid}`);
};

const handleGetCartDetailApi = (cartInfo) => {
  return axios.get(`/api/get-cartdetail?cartInfo=${cartInfo}`);
};

const handleGetDetailListApi = (cartInfo) => {
  return axios.get(`/api/get-detaillist?cartInfo=${cartInfo}`);
};

const handleUpdateQuantityApi = (accountid, productid, productdetailid, quantity) => {
  return axios.put('/api/update-quantity', { accountid, productid, productdetailid, quantity });
};

const handleRemoveFromCartApi = (accountid, productid, productdetailid) => {
  return axios.delete('/api/remove-from-cart', { data: { accountid, productid, productdetailid } });
};

const handleUpdateCartDetailApi = (accountid, productid, productdetailid1, productdetailid2) => {
  return axios.put('/api/update-cart-detail', { accountid, productid, productdetailid1, productdetailid2 });
};

const handleMergeCartDetailApi = (accountid, productid, productdetailid1, productdetailid2, quantity) => {
  return axios.put('/api/merge-cart-detail', { accountid, productid, productdetailid1, productdetailid2, quantity });
};

export { handleAddToCartApi, handleGetCartApi, handleGetCartDetailApi, handleGetDetailListApi, handleUpdateQuantityApi, handleRemoveFromCartApi, handleUpdateCartDetailApi, handleMergeCartDetailApi };
