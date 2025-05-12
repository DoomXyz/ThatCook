import hoadonService from "../services/hoadonService.js";

// Lấy thông tin đơn hàng dựa trên MADONHANG
let handleGetOrderDetails = async (req, res) => {
    try {
        const madonhang = req.query.madonhang;
        let response = await hoadonService.getOrderDetails(madonhang);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error From Server",
        });
    }
};

export default {
    handleGetOrderDetails,
};