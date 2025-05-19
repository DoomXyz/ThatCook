import couponService from '../services/couponService';

let handleCheckCoupon = async (req, res) => {
    try {
        const { couponcode, price } = req.query;
        let response = await couponService.checkCoupon(couponcode, price);
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
        let response = await couponService.getCouponInfo(req.query.couponcode);
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

let handleLoadCouponInfo = async (req, res) => {
    try {
        const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
        const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
        const search = req.query.search || '';
        const filter = req.query.filter || 'ALL';
        const sort = req.query.sort || '0';
        const date = req.query.date || '';
        let response = await utilitiesService.loadCouponInfo(page, limit, search, filter, sort, date);
        return res.status(200).json(response);
    } catch (e) {
        console.log('Error in handleLoadCouponInfo: ', e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null,
        });
    }
};

module.exports = {
    handleCheckCoupon,
    handleGetCouponInfo,
    handleLoadCouponInfo
};