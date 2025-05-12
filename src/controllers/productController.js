import productService from "../services/productService";

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

let handleGetSaleProductInfo = async (req, res) => {
    try {
        let response = await productService.getSaleProductInfo(req.query.productid);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Error in handleGetSaleProductInfo: ", e);
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
};

let handleCreateProduct = async (req, res) => {
    try {
        let response = await productService.createProduct(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null
        });
    }
}

let handleChangeProductInfo = async (req, res) => {
    try {
        let response = await productService.changeProductInfo(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null
        });
    }
}

module.exports = {
    handleLoadProductInfo,
    handleGetProductInfo,
    handleLoadSaleProductInfo,
    handleGetSaleProductInfo,
    handleGetProductDetailInfo,
    handleCreateProduct,
    handleChangeProductInfo,
}