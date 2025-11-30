import cartService from '../services/cartService';

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};

let handleGetCart = async (req, res) => {
  try {
    let response = await cartService.getCart(req.query.AccountID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetCartDetail = async (req, res) => {
  try {
    let response = await cartService.getCartDetail(JSON.parse(req.query.cartInfo));
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetDetailList = async (req, res) => {
  try {
    let response = await cartService.getDetailList(JSON.parse(req.query.cartInfo));
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleAddToCart = async (req, res) => {
  try {
    let response = await cartService.addToCart(req.body.AccountID, req.body.cartInfo);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleUpdateQuantity = async (req, res) => {
  try {
    const { AccountID, ProductID, ProductDetailID, Quantity } = req.body;
    let response = await cartService.updateQuantity(AccountID, ProductID, ProductDetailID, Quantity);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleUpdateCartDetail = async (req, res) => {
  try {
    const { AccountID, ProductID, ProductDetailID1, ProductDetailID2 } = req.body;
    let response = await cartService.updateCartDetail(AccountID, ProductID, ProductDetailID1, ProductDetailID2);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleMergeCartDetail = async (req, res) => {
  try {
    const { AccountID, ProductID, ProductDetailID1, ProductDetailID2, Quantity } = req.body;
    let response = await cartService.mergeCartDetail(AccountID, ProductID, ProductDetailID1, ProductDetailID2, Quantity);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleRemoveFromCart = async (req, res) => {
  try {
    const { AccountID, ProductID, ProductDetailID } = req.body;
    let response = await cartService.removeFromCart(AccountID, ProductID, ProductDetailID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  handleGetCart,
  handleGetCartDetail,
  handleGetDetailList,
  handleAddToCart,
  handleUpdateQuantity,
  handleUpdateCartDetail,
  handleMergeCartDetail,
  handleRemoveFromCart,
};