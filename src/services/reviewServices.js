import axios from '../axios';

const handleCheckUserCanReviewApi = (AccountID, ProductID) => {
  return axios.get(`/api/check-user-can-review?AccountID=${AccountID}&ProductID=${ProductID}`);
};

const handleCreateReviewApi = (reviewData) => {
  return axios.post('/api/create-review', reviewData);
};

const handleGetReviewsByProductApi = (ProductID, page, limit) => {
  return axios.get(`/api/get-reviews?ProductID=${ProductID}&page=${page}&limit=${limit}`);
};

export { handleCheckUserCanReviewApi, handleCreateReviewApi, handleGetReviewsByProductApi };
