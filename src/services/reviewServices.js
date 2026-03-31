import axios from '../axios';

const handleCheckUserCanReviewApi = (AccountID, ProductID) => {
  return axios.get(`/api/check-user-can-review?AccountID=${AccountID}&ProductID=${ProductID}`);
};

const handleCreateReviewApi = (reviewData) => {
  return axios.post('/api/create-review', reviewData);
};

export { handleCheckUserCanReviewApi, handleCreateReviewApi };
