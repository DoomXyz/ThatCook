import utilitiesService from '../services/utilitiesService';

let handleGetAllCodes = async (req, res) => {
  try {
    let response = await utilitiesService.getAllCodes(req.query.type);
    return res.status(200).json(response);
  } catch (e) {
    console.log('Error in handleGetAllCodes: ', e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};

module.exports = {
  handleGetAllCodes,
};
