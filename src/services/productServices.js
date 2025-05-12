import axios from "../axios";

//converted
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

const handleEditProductInfoApi = (productInfo) => {
    return axios.put("/api/edit-productinfo", productInfo);
}

//non converted
const handleGetProductDetailsByMASANPHAM = (masanpham) => {
    return axios.get(`/api/get-product-details-by-masanpham?masanpham=${masanpham}`);
};

const handleCreateProduct = (productInfo) => {
    return axios.post("/api/create-product", productInfo);
};

export {
    handleLoadProductInfoApi,
    handleGetProductInfoApi,
    handleLoadSaleProductInfoApi,
    handleGetSaleProductInfoApi,
    handleGetProductDetailInfoApi,
    handleEditProductInfoApi,

    handleGetProductDetailsByMASANPHAM,
    handleCreateProduct,
};