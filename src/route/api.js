import express from "express";
import accountController from "../controllers/accountController";
import bannerController from "../controllers/bannerController"
import productController from "../controllers/productController";
import cartController from "../controllers/cartController";
import invoiceController from "../controllers/invoiceController";
import utilitiesController from "../controllers/utilitiesController"
import { checkAdminJWT, checkOwnerJWT, checkCustomerJWT, checkVeterinarianJWT } from "../middleware/jwtController";
let router = express.Router();

import billController from "../controllers/billController";

const protectRoute = (req, res, next) => {
    const adminPaths = [
        '/api/load-accountinfo',
        '/api/change-accountstatus'
    ];

    const ownerPaths = [
        // '/api/create-product',
        // '/api/update-product',
        // '/api/xoa-sanpham',
        // '/api/load-hoadon',
        // '/api/load-banner'
    ];

    const customerPaths = [
    ];

    const veterinarianPaths = [
    ];

    if (adminPaths.includes(req.path)) {
        return checkAdminJWT(req, res, next);
    }

    if (ownerPaths.includes(req.path)) {
        return checkOwnerJWT(req, res, next);
    }

    if (customerPaths.includes(req.path)) {
        return checkCustomerJWT(req, res, next);
    }

    if (veterinarianPaths.includes(req.path)) {
        return checkVeterinarianJWT(req, res, next);
    }
    return next();
};

let initAPIRoutes = (app) => {
    router.use(protectRoute);
    //public
    router.get("/api/get-allcodes", utilitiesController.handleGetAllCodes);
    router.get("/api/check-coupon", utilitiesController.handleCheckCoupon);
    router.get("/api/get-couponinfo", utilitiesController.handleGetCouponInfo);

    router.post("/api/register", accountController.handleRegister);
    router.post("/api/login", accountController.handleLogin);
    router.get("/api/logout", accountController.handleLogout);
    router.get("/api/get-accountinfo", accountController.handleGetAccountInfo);
    router.get("/api/verify-token", accountController.handleVerifyToken);
    router.put("/api/edit-accountinfo", accountController.handleChangeAccountInfo);
    router.put("/api/change-password", accountController.handleChangePassword);

    router.get("/api/get-bannerinfo", bannerController.handleGetBannerInfo)

    router.get("/api/load-sale-productinfo", productController.handleLoadSaleProductInfo);
    router.get("/api/get-sale-productinfo", productController.handleGetSaleProductInfo)
    router.get("/api/get-productdetailinfo", productController.handleGetProductDetailInfo);

    router.post("/api/add-to-cart", cartController.handleAddToCart);
    router.get("/api/get-cart", cartController.handleGetCart);
    router.get("/api/get-cartdetail", cartController.handleGetCartDetail);
    router.get("/api/get-detaillist", cartController.handleGetDetailList);
    router.put("/api/update-quantity", cartController.handleUpdateQuantity);
    router.delete("/api/remove-from-cart", cartController.handleRemoveFromCart);
    router.put("/api/update-cart-detail", cartController.handleUpdateCartDetail);
    router.put("/api/merge-cart-detail", cartController.handleMergeCartDetail);

    router.post("/api/create-invoice", invoiceController.handleCreateInvoice);
    router.get("/api/get-account-invoiceinfo", invoiceController.handleGetAccountInvoiceInfo);
    router.get("/api/get-invoicedetailinfo", invoiceController.handleGetInvoiceDetailInfo)
    //admin
    router.get("/api/load-accountinfo", accountController.handleLoadAccountInfo);
    router.put("/api/change-accountstatus", accountController.handleChangeAccountStatus);
    //owner
    router.get("/api/load-productinfo", productController.handleLoadProductInfo);
    router.get("/api/load-invoiceinfo", invoiceController.handleLoadInvoiceInfo);
    router.get("/api/load-bannerinfo", bannerController.handleLoadBannerInfo);
    router.get("/api/get-productinfo", productController.handleGetProductInfo)
    //veterinarian

    //not converted
    // router.get("/api/get-thongtin-thanhtoan", accountController.handleGetThongTinThanhToan);

    // router.get("/api/get-sanpham", productController.handleGetSanPham)
    // router.get("/api/get-chitiethinhanh", productController.handleGetChiTietHinhAnh);
    // router.get("/api/get-product-details-by-masanpham", productController.handleGetProductDetailsByMASANPHAM);
    // router.post("/api/create-product", productController.handleCreateProduct);
    // router.put("/api/update-product", productController.handleUpdateProduct);
    // router.put("/api/xoa-sanpham", productController.handleDelSanPham);//thay đổi trạng thái sản phẩm

    // router.put("/api/upd-giohang", cartController.handleUpdGioHang);
    // router.delete("/api/del-giohang", cartController.handleDelGioHang);
    // router.get("/api/get-order-details", billController.handleGetOrderDetails);


    return app.use("/", router);
};

module.exports = initAPIRoutes; 