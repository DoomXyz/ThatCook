import axios from "../axios";

const handleLoadProductInfoApi = (page, limit, search, filter, sort) => {
    return axios.get(`/api/load-productinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleGetProductInfoApi = (productid) => {
    return axios.get(`/api/get-productinfo?productid=${productid}`);
}

const handleLoadSaleProductInfoApi = (page, limit, search, filter, sort) => {
    return axios.get(`/api/load-sale-productinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleGetSaleProductInfoApi = (productid) => {
    return axios.get(`/api/get-sale-productinfo?productid=${productid}`);
}

const handleGetProductDetailInfoApi = (productid, productdetailid) => {
    return axios.get(`/api/get-productdetailinfo?productid=${productid}&productdetailid=${productdetailid}`);
};

const handleCreateProductApi = (productInfo) => {
    return axios.post("/api/create-product", productInfo);
};

const handleChangeProductInfoApi = (productInfo) => {
    return axios.put("/api/change-productinfo", productInfo);
}

const handleLoadFilteredProductInfoApi = (filterProductType, filterPetType, search) => {
    return axios.get(`/api/load-filtered-productinfo?filterProductType=${filterProductType}&filterPetType=${filterPetType}&search=${search}`);
};

export {
    handleLoadProductInfoApi,
    handleGetProductInfoApi,
    handleLoadSaleProductInfoApi,
    handleGetSaleProductInfoApi,
    handleGetProductDetailInfoApi,
    handleChangeProductInfoApi,
    handleCreateProductApi,
    handleLoadFilteredProductInfoApi,
};