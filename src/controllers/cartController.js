import cartService from "../services/cartService";
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

module.exports = {
    handleAddToCart,
    handleGetCart,
    handleGetCartDetail,
    handleGetDetailList,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleUpdateCartDetail,
    handleMergeCartDetail,
}