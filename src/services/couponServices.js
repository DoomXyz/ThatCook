import axios from 'axios';

const handleCheckCouponApi = async (couponcode, price) => {
    return axios.get(`/api/check-coupon?couponcode=${couponcode}&price=${price}`);
};

const handleGetCouponApi = async (couponcode) => {
    return axios.get(`/api/get-couponinfo?couponcode=${couponcode}`);
};

const handleLoadCouponInfoApi = (page, limit, search, filter, sort, date) => {
    return axios.get(`/api/load-couponinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date=${date}`);
};

const handleCreateCouponApi = (couponInfo) => {
    return axios.post('/api/create-coupon', couponInfo);
};

const handleChangeCouponInfoApi = (couponInfo) => {
    return axios.put('/api/change-couponinfo', couponInfo);
};

export { handleCheckCouponApi, handleGetCouponApi, handleLoadCouponInfoApi, handleCreateCouponApi, handleChangeCouponInfoApi };
