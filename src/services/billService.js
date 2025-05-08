import axios from "../axios";

const handleGetOrderDetails = (madonhang) => {
    return axios.get(`/api/get-order-details?madonhang=${madonhang}`);
};

const getUserOrders = (mataikhoan) => {
    return axios.get(`/api/get-user-orders?mataikhoan=${mataikhoan}`);
}

const handleLoadHoaDon = ({ page, limit, search, date, sort }) => {
    return axios.get(`/api/load-hoadon?page=${page}&limit=${limit}&search=${search || ''}&date=${date || ''}&sort=${sort || '0'}`);
};

export {
    handleLoadHoaDon,
    handleGetOrderDetails,
    getUserOrders,
};