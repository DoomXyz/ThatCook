import express from "express";
import userController from "../controllers/userController";
import productController from "../controllers/productController";
import cartController from "../controllers/cartController";
import invoiceController from "../controllers/invoiceController";
import utilitiesController from "../controllers/utilitiesController"
import { checkAdminJWT, checkOwnerJWT, checkCustomerJWT, checkVeterinarianJWT } from "../middleware/jwtController";
let router = express.Router();

import billController from "../controllers/billController";

const protectRoute = (req, res, next) => {
    const adminPaths = [
        // '/api/get-alltaikhoan',
        // '/api/setstatus-taikhoan',
        // '/api.delete-taikhoan',
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
    //converted
    //public
    router.get("/api/get-allcodes", utilitiesController.handleGetAllCodes);
    router.get("/api/check-coupon", utilitiesController.handleCheckCoupon);
    router.get("/api/get-couponinfo", utilitiesController.handleGetCouponInfo);

    router.post("/api/register", userController.handleRegister);
    router.post("/api/login", userController.handleLogin);
    router.get("/api/logout", userController.handleLogout);
    router.get("/api/get-accountinfo", userController.handleGetAccountInfo);
    router.get("/api/verify-token", userController.handleVerifyToken);
    router.put("/api/edit-accountinfo", userController.handleChangeAccountInfo);
    router.put("/api/change-password", userController.handleChangePassword);

    router.get("/api/load-productinfo", productController.handleLoadProductInfo);
    router.get("/api/get-productinfo", productController.handleGetProductInfo)
    router.get("/api/get-bannerinfo", productController.handleGetBannerInfo)
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
    //admin
    router.get("/api/load-accountinfo", userController.handleLoadAccountInfo);
    router.put("/api/change-accountstatus", userController.handleChangeAccountStatus);
    //owner

    //veterinarian

    //customer

    //not converted
    // router.get("/api/get-thongtin-thanhtoan", userController.handleGetThongTinThanhToan);

    // router.get("/api/get-sanpham", productController.handleGetSanPham)
    // router.get("/api/get-chitiethinhanh", productController.handleGetChiTietHinhAnh);
    // router.get("/api/get-product-details-by-masanpham", productController.handleGetProductDetailsByMASANPHAM);
    // router.post("/api/create-product", productController.handleCreateProduct);
    // router.put("/api/update-product", productController.handleUpdateProduct);
    // router.put("/api/xoa-sanpham", productController.handleDelSanPham);//thay đổi trạng thái sản phẩm
    // router.get("/api/load-hoadon", billController.handleLoadHoaDon);
    // router.get("/api/load-banner", productController.handleLoadBanner);
    // router.put("/api/upd-giohang", cartController.handleUpdGioHang);
    // router.delete("/api/del-giohang", cartController.handleDelGioHang);
    // router.get("/api/get-order-details", billController.handleGetOrderDetails);
    // router.get("/api/get-user-orders", billController.handleGetUserOrders);

    return app.use("/", router);
};

module.exports = initAPIRoutes; 