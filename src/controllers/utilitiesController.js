import utilitiesService from '../services/utilitiesService';

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};

let handleGetAllCodes = async (req, res) => {
  try {
    let response = await utilitiesService.getAllCodes(req.query.type);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleLoadAllCodesInfo = async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    let response = await utilitiesService.loadAllCodesInfo(page, limit, search, filter, sort);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleCreateCode = async (req, res) => {
  try {
    let response = await utilitiesService.createCode(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

let handleChangeCodeInfo = async (req, res) => {
  try {
    let response = await utilitiesService.changeCodeInfo(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};

module.exports = {
  handleGetAllCodes,
  handleLoadAllCodesInfo,
  handleCreateCode,
  handleChangeCodeInfo,
};