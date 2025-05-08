import { response } from "express";
import cartService from "../services/cartService";
//converted
let handleAddToCart = async (req, res) => {
    try {
        let response = await cartService.addToCart(req.body.accountid, req.body.cartInfo);
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

let handleGetCart = async (req, res) => {
    try {
        let response = await cartService.getCart(req.query.accountid);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null
        });
    }
};

let handleGetCartDetail = async (req, res) => {
    try {
        let response = await cartService.getCartDetail(JSON.parse(req.query.cartInfo));
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

let handleGetDetailList = async (req, res) => {
    try {
        let response = await cartService.getDetailList(JSON.parse(req.query.cartInfo));
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

let handleUpdateQuantity = async (req, res) => {
    try {
        const { accountid, productid, productdetailid, quantity } = req.body
        let response = await cartService.updateQuantity(accountid, productid, productdetailid, quantity);
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

let handleRemoveFromCart = async (req, res) => {
    try {
        const { accountid, productid, productdetailid } = req.body
        let response = await cartService.removeFromCart(accountid, productid, productdetailid);
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

let handleUpdateCartDetail = async (req, res) => {
    try {
        const { accountid, productid, productdetailid1, productdetailid2 } = req.body
        let response = await cartService.updateCartDetail(accountid, productid, productdetailid1, productdetailid2)
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null
        });
    }
};

let handleMergeCartDetail = async (req, res) => {
    try {
        const { accountid, productid, productdetailid1, productdetailid2, quantity } = req.body
        let response = await cartService.mergeCartDetail(accountid, productid, productdetailid1, productdetailid2, quantity);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi từ server: ' + e.message,
            data: null
        });
    }
};
//non converted
let handleUpdGioHang = async (req, res) => {
    try {
        let response = await giohangService.updGioHang(req.body.mataikhoan, req.body.giohangInfo);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Get error: ", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error From Server",
        });
    }
}

let handleDelGioHang = async (req, res) => {
    try {
        let response = await giohangService.delGioHang(req.body.mataikhoan);
        return res.status(200).json(response);
    } catch (e) {
        console.log("Get error: ", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error From Server",
        });
    }
}
module.exports = {
    handleAddToCart,
    handleGetCart,
    handleGetCartDetail,
    handleGetDetailList,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleUpdateCartDetail,
    handleMergeCartDetail,

    handleUpdGioHang,
    handleDelGioHang,
}