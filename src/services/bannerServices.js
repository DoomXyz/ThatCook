import axios from "../axios";

const handleGetBannerInfoApi = (productid) => {
    return axios.get(`/api/get-bannerinfo?productid=${productid}`);
}

const handleLoadBannerInfoApi = (page, limit, search, filter, sort, date) => {
    return axios.get(`/api/load-bannerinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date=${date}`);
};

export {
    handleGetBannerInfoApi,
    handleLoadBannerInfoApi,
}