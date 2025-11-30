import productService from '../services/productService';

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

module.exports = {
  handleGetSaleProductInfo,
  handleLoadSaleProductInfo,
  handleGetProductInfo,
  handleLoadProductInfo,
  handleGetProductDetailInfo,
  handleCreateProduct,
  handleChangeProductInfo,
  handleLoadFilteredProductInfo,
};