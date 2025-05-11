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

let handleLoadHoaDon = async (req, res) => {
    try {
        const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
        const limit = isNaN(parseInt(req.query.limit)) ? 10 : parseInt(req.query.limit);
        const search = req.query.search || '';
        const date = req.query.date || ''; // Thêm date
        const sort = req.query.sort || '0';
        let response = await hoadonService.loadHoaDon(page, limit, search, date, sort);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Load invoices error: ", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error From Server",
        });
    }
};
export default {
    handleGetOrderDetails,
    handleLoadHoaDon,
};