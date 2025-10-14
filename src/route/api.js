import express from 'express';
import accountController from '../controllers/accountController';
import bannerController from '../controllers/bannerController';
import productController from '../controllers/productController';
import cartController from '../controllers/cartController';
import couponController from '../controllers/couponController';
import invoiceController from '../controllers/invoiceController';
import petController from '../controllers/petController';
import serviceController from '../controllers/serviceController';
import appointmentController from '../controllers/appointmentController';
import scheduleController from '../controllers/scheduleController';
import utilitiesController from '../controllers/utilitiesController';
import { checkAdminJWT, checkOwnerJWT, checkVeterinarianJWT } from '../middleware/jwtController';
let router = express.Router();

const protectRoute = (req, res, next) => {
  const adminPaths = ['/api/load-accountinfo', '/api/change-accountstatus', '/api/load-serviceinfo', '/api/create-service', '/api/change-serviceinfo', '/api/change-servicestatus'];

  const ownerPaths = [
    '/api/get-bannerinfo',
    '/api/load-bannerinfo',
    '/api/create-banner',
    '/api/change-bannerinfo',

    '/api/get-productinfo',
    '/api/load-productinfo',
    '/api/create-product',
    '/api/change-productinfo',
    '/api/load-filtered-productinfo',

    '/api/load-couponinfo',
    '/api/create-coupon',
    '/api/change-couponinfo',

    '/api/load-invoiceinfo',

    '/api/load-revenue-stats', // Thêm dòng này nếu chưa có
    '/api/load-top-products',
  ];

  const veterinarianPaths = ['/api/change-workingstatus', '/api/load-appointments', '/api/create-appointmentbill', '/api/load-schedule', '/api/change-schedulestatus'];

  if (adminPaths.includes(req.path)) {
    return checkAdminJWT(req, res, next);
  }

  if (ownerPaths.includes(req.path)) {
    return checkOwnerJWT(req, res, next);
  }

  if (veterinarianPaths.includes(req.path)) {
    return checkVeterinarianJWT(req, res, next);
  }
  return next();
};

let initAPIRoutes = (app) => {
  router.use(protectRoute);
  //no protection
  router.post('/api/register', accountController.handleRegister);
  router.post('/api/login', accountController.handleLogin);
  router.get('/api/logout', accountController.handleLogout);
  router.get('/api/verify-token', accountController.handleVerifyToken);
  router.get('/api/get-accountinfo', accountController.handleGetAccountInfo);
  router.put('/api/change-accountinfo', accountController.handleChangeAccountInfo);
  router.put('/api/change-password', accountController.handleChangePassword);
  router.post('/api/send-forgot-token', accountController.handleSendForgotToken);
  router.post('/api/verify-forgot-token', accountController.handleVerifyForgotToken);
  router.get('/api/get-veterinarianinfo', accountController.handleGetVeterinarianInfo);
  router.get('/api/load-veterinarianinfo', accountController.handleLoadVeterinarianInfo);

  router.get('/api/get-sale-bannerinfo', bannerController.handleGetSaleBannerInfo);

  router.get('/api/get-sale-productinfo', productController.handleGetSaleProductInfo);
  router.get('/api/load-sale-productinfo', productController.handleLoadSaleProductInfo);
  router.get('/api/get-productdetailinfo', productController.handleGetProductDetailInfo);

  router.get('/api/get-cart', cartController.handleGetCart);
  router.get('/api/get-cartdetail', cartController.handleGetCartDetail);
  router.get('/api/get-detaillist', cartController.handleGetDetailList);
  router.post('/api/add-to-cart', cartController.handleAddToCart);
  router.put('/api/update-quantity', cartController.handleUpdateQuantity);
  router.put('/api/update-cart-detail', cartController.handleUpdateCartDetail);
  router.put('/api/merge-cart-detail', cartController.handleMergeCartDetail);
  router.delete('/api/remove-from-cart', cartController.handleRemoveFromCart);

  router.get('/api/get-couponinfo', couponController.handleGetCouponInfo);
  router.get('/api/check-coupon', couponController.handleCheckCoupon);

  router.get('/api/get-account-invoiceinfo', invoiceController.handleGetAccountInvoiceInfo);
  router.get('/api/get-invoicedetailinfo', invoiceController.handleGetInvoiceDetailInfo);
  router.post('/api/create-invoice', invoiceController.handleCreateInvoice);
  router.put('/api/change-invoicestatus', invoiceController.handleChangeInvoiceStatus);
  router.post('/api/get-invoice-email', invoiceController.handleGetInvoiceEmail);

  router.get('/api/get-account-petinfo', petController.handleGetAccountPetInfo);
  router.get('/api/get-petinfo', petController.handleGetPetInfo);
  router.post('/api/save-petinfo', petController.handleSavePetInfo);
  router.put('/api/change-petinfo', petController.handleChangePetInfo);
  router.put('/api/remove-pet', petController.handleRemovePet);

  router.get('/api/get-veterinarianservice', serviceController.handleGetVeterinarianService);
  router.get('/api/get-serviceinfo', serviceController.handleGetServiceInfo);

  router.get('/api/get-available-times', appointmentController.handleGetAvailableTimes);
  router.get('/api/load-appointmentinfo', appointmentController.handleLoadAppointmentInfo);
  router.get('/api/load-appointmentdetails', appointmentController.handleLoadAppointmentDetails);
  router.get('/api/get-appointmentbilldetail', appointmentController.handleGetAppointmentBillDetail);
  router.post('/api/create-appointment', appointmentController.handleCreateAppointment);
  router.put('/api/change-appointmentstatus', appointmentController.handleChangeAppointmentStatus);
  router.post('/api/get-appointment-email', appointmentController.handleGetAppointmentEmail);
  router.post('/api/get-appointmentbill-email', appointmentController.handleGetAppointmentBillEmail);
  //admin
  router.get('/api/load-accountinfo', accountController.handleLoadAccountInfo);
  router.put('/api/change-accountstatus', accountController.handleChangeAccountStatus);

  router.get('/api/load-serviceinfo', serviceController.handleLoadServiceInfo);
  router.post('/api/create-service', serviceController.handleCreateService);
  router.put('/api/change-serviceinfo', serviceController.handleChangeServiceInfo);
  router.put('/api/change-servicestatus', serviceController.handleChangeServiceStatus);

  router.get('/api/get-allcodes', utilitiesController.handleGetAllCodes);
  router.get('/api/load-allcodesinfo', utilitiesController.handleLoadAllCodesInfo);
  router.post('/api/create-code', utilitiesController.handleCreateCode);
  router.put('/api/change-codeinfo', utilitiesController.handleChangeCodeInfo);
  //owner
  router.get('/api/get-bannerinfo', bannerController.handleGetBannerInfo);
  router.get('/api/load-bannerinfo', bannerController.handleLoadBannerInfo);
  router.post('/api/create-banner', bannerController.handleCreateBanner);
  router.put('/api/change-bannerinfo', bannerController.handleChangeBannerInfo);

  router.get('/api/get-productinfo', productController.handleGetProductInfo);
  router.get('/api/load-productinfo', productController.handleLoadProductInfo);
  router.post('/api/create-product', productController.handleCreateProduct);
  router.put('/api/change-productinfo', productController.handleChangeProductInfo);
  router.get('/api/load-filtered-productinfo', productController.handleLoadFilteredProductInfo);

  router.get('/api/load-invoiceinfo', invoiceController.handleLoadInvoiceInfo);

  router.get('/api/load-couponinfo', couponController.handleLoadCouponInfo);
  router.post('/api/create-coupon', couponController.handleCreateCoupon);
  router.put('/api/change-couponinfo', couponController.handleChangeCouponInfo);

  router.get('/api/load-revenue-stats', invoiceController.handleLoadRevenueStats);
  router.get('/api/load-top-products', invoiceController.handleLoadTopProducts);
  //veterinarian
  router.put('/api/change-workingstatus', accountController.handleChangeWorkingStatus);

  router.get('/api/load-appointments', appointmentController.handleLoadAppointments);
  router.post('/api/create-appointmentbill', appointmentController.handleCreateAppointmentBill);

  router.get('/api/load-schedule', scheduleController.handleLoadSchedule);
  router.put('/api/change-schedulestatus', scheduleController.handleChangeScheduleStatus);
  return app.use('/', router);
};

module.exports = initAPIRoutes;
