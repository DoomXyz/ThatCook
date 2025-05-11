import { response } from "express";
import productService from "../services/productService";

//converted
let handleLoadProductInfo = async (req, res) => {
    try {
        const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
        const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
        const search = req.query.search || '';
        const filter = req.query.filter || 'ALL';
        const sort = req.query.sort || '0';
        let response = await productService.loadProductInfo(page, limit, search, filter, sort);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Error in handleLoadProductInfo: ", e);
        return res.status(500).json({
            errCode: 3,
            errMessage: `Lỗi từ server: ${e.message}`,
            data: null
        });
    }
};
let handleLoadSaleProductInfo = async (req, res) => {
    try {
        const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
        const limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
        const search = req.query.search || '';
        const filter = req.query.filter || 'ALL';
        const sort = req.query.sort || '0';
        let response = await productService.loadSaleProductInfo(page, limit, search, filter, sort);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Error in handleLoadSaleProductInfo: ", e);
        return res.status(500).json({
            errCode: 3,
            errMessage: `Lỗi từ server: ${e.message}`,
            data: null
        });
    }
};
let handleGetProductInfo = async (req, res) => {
    try {
        let response = await productService.getProductInfo(req.query.productid);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Error in handleGetProductInfo: ", e);
        return res.status(500).json({
            errCode: 3,
            errMessage: `Lỗi từ server: ${e.message}`,
            data: null
        });
    }
};

let handleGetProductDetailInfo = async (req, res) => {
    try {
        const { productid, productdetailid } = req.query
        let response = await productService.getProductDetailInfo(productid, productdetailid);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Error in handleGetProductDetailInfo: ", e);
        return res.status(500).json({
            errCode: 3,
            errMessage: `Lỗi từ server: ${e.message}`,
            data: null
        });
    }
}
//non converted

let handleGetChiTietHinhAnh = async (req, res) => {
    try {
        let data = await sanphamService.getChiTietHinhAnh(req.query.masanpham);
        return res.status(200).json(data);
    } catch (e) {
        console.log('Get error: ', e);
        return response.status(200).json({
            errCode: -1,
            errMessage: 'Error From Server'
        })
    }
}
let handleGetProductDetailsByMASANPHAM = async (req, res) => {
    try {
        const masanpham = req.query.masanpham;
        let response = await sanphamService.getProductDetailsByMASANPHAM(masanpham);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Get product details error: ", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error From Server",
        });
    }
}

let handleLoadBanner = async (req, res) => {
    try {
        console.log(req.query)
        const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
        const limit = isNaN(parseInt(req.query.limit)) ? 10 : parseInt(req.query.limit);
        const search = req.query.search;
        const sort = req.query.sort;
        const filter = req.query.filter;
        let response = await sanphamService.loadBanner(page, limit, search, sort, filter);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Load banners error: ", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error From Server",
        });
    }
};
let handleCreateProduct = async (req, res) => {
    let response = await sanphamService.createProduct(req.body);
    if (response) {
        return res.status(200).json(response);
    } else {
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Missing required parameters',
        })
    }
}

let handleDelSanPham = async (req, res) => {
    try {
        let response = await sanphamService.delSanPham(req.body.masanpham)
        return res.status(200).json(response);
    } catch (e) {
        console.log('Get all code error: ', e);
        return response.status(200).json({
            errCode: -1,
            errMessage: 'Error From Server'
        })
    }
}

let handleUpdateProduct = async (req, res) => {
    try {
        let response = await sanphamService.updateProduct(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Update product error: ", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error From Server",
        });
    }
};

module.exports = {
    handleLoadProductInfo,
    handleLoadSaleProductInfo,
    handleGetProductInfo,
    handleGetProductDetailInfo,

    handleGetChiTietHinhAnh,
    handleGetProductDetailsByMASANPHAM,
    handleLoadBanner,
    handleCreateProduct,
    handleUpdateProduct,
    handleDelSanPham,
}