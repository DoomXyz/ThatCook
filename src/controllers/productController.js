import productService from '../services/productService';
import { verifyJWT } from '../middleware/jwtController';

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};

let handleGetSaleProductInfo = async (req, res) => {
  try {
    let response = await productService.getSaleProductInfo(req.query.ProductID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadSaleProductInfo = async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    let response = await productService.loadSaleProductInfo(page, limit, search, filter, sort);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetProductInfo = async (req, res) => {
  try {
    let response = await productService.getProductInfo(req.query.ProductID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadProductInfo = async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    let response = await productService.loadProductInfo(page, limit, search, filter, sort);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetProductDetailInfo = async (req, res) => {
  try {
    const { ProductID, ProductDetailID } = req.query;
    let response = await productService.getProductDetailInfo(ProductID, ProductDetailID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateProduct = async (req, res) => {
  try {
    let response = await productService.createProduct(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleChangeProductInfo = async (req, res) => {
  try {
    let response = await productService.changeProductInfo(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadFilteredProductInfo = async (req, res) => {
  try {
    const filterProductType = req.query.filterProductType || 'ALL';
    const filterPetType = req.query.filterPetType ? JSON.parse(req.query.filterPetType) : ['ALL'];
    let response = await productService.loadFilteredProductInfo(filterProductType, filterPetType);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleTrackProductClick = async (req, res) => {
  try {
    const { ProductID } = req.body;
    // Try to get AccountID from JWT cookie (optional - guest clicks are also tracked)
    let AccountID = null;
    try {
      const token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      if (token) {
        const decoded = verifyJWT(token);
        if (decoded && decoded.AccountID) AccountID = decoded.AccountID;
      }
    } catch (e) { /* guest user, no token */ }
    let response = await productService.trackProductClick(ProductID, AccountID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadClickStats = async (req, res) => {
  try {
    const Type = req.query.Type || 'monthly';
    const StartDate = req.query.StartDate || null;
    const EndDate = req.query.EndDate || null;
    let response = await productService.getClickStats(Type, StartDate, EndDate);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetBrowseHistory = async (req, res) => {
  try {
    const token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.AccountID) {
      return res.status(401).json({ errCode: -1, errMessage: 'Unauthorized.' });
    }
    let response = await productService.getBrowseHistory(decoded.AccountID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  handleGetSaleProductInfo,
  handleLoadSaleProductInfo,
  handleGetProductInfo,
  handleLoadProductInfo,
  handleGetProductDetailInfo,
  handleCreateProduct,
  handleChangeProductInfo,
  handleLoadFilteredProductInfo,
  handleTrackProductClick,
  handleLoadClickStats,
  handleGetBrowseHistory,
};