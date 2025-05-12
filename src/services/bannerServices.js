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

const handleCreateBannerApi = (bannerInfo) => {
    return axios.post("/api/create-banner", bannerInfo);
};

const handleChangeBannerInfoApi = (bannerInfo) => {
    return axios.put("/api/change-bannerinfo", bannerInfo);
}

export {
    handleGetSaleBannerInfoApi,
    handleLoadBannerInfoApi,
    handleGetBannerInfoApi,
    handleCreateBannerApi,
    handleChangeBannerInfoApi,
}