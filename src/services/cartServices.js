import axios from '../axios';

const handleAddToCartApi = (AccountID, cartInfo) => {
  return axios.post('/api/add-to-cart', { AccountID, cartInfo });
};
const handleGetCartApi = (AccountID) => {
  return axios.get(`/api/get-cart?AccountID=${AccountID}`);
};

const handleGetCartDetailApi = (cartInfo) => {
  return axios.get(`/api/get-cartdetail?cartInfo=${cartInfo}`);
};

const handleGetDetailListApi = (cartInfo) => {
  return axios.get(`/api/get-detaillist?cartInfo=${cartInfo}`);
};

const handleUpdateQuantityApi = (AccountID, ProductID, ProductDetailID, Quantity) => {
  return axios.put('/api/update-quantity', { AccountID, ProductID, ProductDetailID, Quantity });
};

const handleRemoveFromCartApi = (AccountID, ProductID, ProductDetailID) => {
  return axios.delete('/api/remove-from-cart', { data: { AccountID, ProductID, ProductDetailID } });
};

const handleUpdateCartDetailApi = (AccountID, ProductID, ProductDetailID1, ProductDetailID2) => {
  return axios.put('/api/update-cart-detail', { AccountID, ProductID, ProductDetailID1, ProductDetailID2 });
};

const handleMergeCartDetailApi = (AccountID, ProductID, ProductDetailID1, ProductDetailID2, Quantity) => {
  return axios.put('/api/merge-cart-detail', { AccountID, ProductID, ProductDetailID1, ProductDetailID2, Quantity });
};

export { handleAddToCartApi, handleGetCartApi, handleGetCartDetailApi, handleGetDetailListApi, handleUpdateQuantityApi, handleRemoveFromCartApi, handleUpdateCartDetailApi, handleMergeCartDetailApi };
