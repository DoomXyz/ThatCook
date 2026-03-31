import reviewService from '../services/reviewService';

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};

let handleCheckUserCanReview = async (req, res) => {
  try {
    const { AccountID, ProductID } = req.query;
    let response = await reviewService.checkUserCanReview(AccountID, ProductID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateReview = async (req, res) => {
  try {
    let response = await reviewService.createReview(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetReviewsByProduct = async (req, res) => {
  try {
    const ProductID = req.query.ProductID;
    const page = isNaN(parseInt(req.query.page, 10)) ? 1 : parseInt(req.query.page, 10);
    const limit = isNaN(parseInt(req.query.limit, 10)) ? 10 : parseInt(req.query.limit, 10);
    let response = await reviewService.getReviewsByProduct(ProductID, page, limit);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  handleCheckUserCanReview,
  handleCreateReview,
  handleGetReviewsByProduct,
};
