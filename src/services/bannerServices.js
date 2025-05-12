import axios from "../axios";

const handleGetSaleBannerInfoApi = (productid) => {
    return axios.get(`/api/get-sale-bannerinfo?productid=${productid}`);
}

const handleLoadBannerInfoApi = (page, limit, search, filter, sort, date) => {
    return axios.get(`/api/load-bannerinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}&date=${date}`);
};

const handleGetBannerInfoApi = (bannerid) => {
    return axios.get(`/api/get-bannerinfo?bannerid=${bannerid}`);
}

export {
    handleGetSaleBannerInfoApi,
    handleLoadBannerInfoApi,
    handleGetBannerInfoApi,
}