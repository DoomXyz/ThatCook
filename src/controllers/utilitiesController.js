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

let handleCheckCoupon = async (req, res) => {
  try {
    const { couponcode, price } = req.query;
    let response = await utilitiesService.checkCoupon(couponcode, price);
    return res.status(200).json(response);
  } catch (e) {
    console.log('Error in handleCheckCoupon: ', e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};

let handleGetCouponInfo = async (req, res) => {
  try {
    let response = await utilitiesService.getCouponInfo(req.query.couponcode);
    return res.status(200).json(response);
  } catch (e) {
    console.log('Error in handleGetCouponInfo: ', e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};

module.exports = {
  handleGetAllCodes,
  handleCheckCoupon,
  handleGetCouponInfo,
};
