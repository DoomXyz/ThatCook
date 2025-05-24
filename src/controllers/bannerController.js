import bannerService from '../services/bannerService';

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};

let handleGetSaleBannerInfo = async (req, res) => {
  try {
    let response = await bannerService.getBannerSaleInfo(req.query.productid);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleGetBannerInfo = async (req, res) => {
  try {
    let response = await bannerService.getBannerInfo(req.query.bannerid);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadBannerInfo = async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 10 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    const date = req.query.date || '';
    let response = await bannerService.loadBannerInfo(page, limit, search, filter, sort, date);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateBanner = async (req, res) => {
  try {
    let response = await bannerService.createBanner(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleChangeBannerInfo = async (req, res) => {
  try {
    let response = await bannerService.changeBannerInfo(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  handleGetSaleBannerInfo,
  handleGetBannerInfo,
  handleLoadBannerInfo,
  handleCreateBanner,
  handleChangeBannerInfo,
};
