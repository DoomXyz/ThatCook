"Node.js version 22.14.0"
*Dòng dưới chỉ dùng nếu cần dùng nhiều version node, không thì install nodejs 22.14.0 là được
Xóa node.js (nếu có) -> Tải nvm -> Cài lại node.js đúng version [nvm install {version}] -> Dùng version đó [nvm use {version}]
-------------Hướng dẫn Setup Git-------------
tải git
chuột phải vào folder bên ngoài để chứa folder chứa code
chọn git bash
git config --global user.name "[tên]"
git config --global user.email "[email]"
git config --list (xem thông tin đã được lưu chưa)
*Mở vsc, chọn đúng folder chứa code sau đó mở powershell trong đó bằng ctrl + `và chạy 2 lệnh:
git clone -b be https://github.com/DoomXyz/ThatCook.git .
git clone -b fe https://github.com/DoomXyz/ThatCook.git .
-------------Hướng dẫn setup cơ bản-------------
*Làm 1 lần duy nhất:
git init
git remote add origin https://github.com/DoomXyz/That-Cook.git
*Đưa code lên
git add .
git commit -m '[tên gọi]'
git push origin [fe hoặc be]
*Kéo code xuống
git fetch origin [fe hoặc be]
git pull origin [fe hoặc be]
*Cài thư viện (Làm lại tương tự sau khi đã làm ở be/fe)
npm init
npm install
*Setup cổng
xóa .example ở file .env.example và thêm giá trị để dùng liên hệ để biết thêm chi tiết: https://www.facebook.com/starofthestarsofthestars/ 
-------------Hướng dẫn setup database-------------
vào myphpadmin nếu đã có database tên [thatcookdb] thì xóa đi
tạo lại database đặt tên là [thatcookdb]
mở ctrl +` chạy 2 lệnh dưới:
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
*nếu chạy xong 2 lệnh hoặc bị lỗi khi đang chạy thì chạy lệnh dưới sau đó chạy lại 2 lệnh trên
npx sequelize-cli db:migrate:undo:all
---------------Danh sách mã lỗi trong code (errCode)-----------------
-1 = Tham số rỗng hoặc không hợp lệ (ví dụ: thiếu userInfo, accountname, password, accountid, token, userGender, userAccountType, page, limit).
0 = Xử lí yêu cầu thành công
1 = Định dạng sai (tên tài khoản, email, mật khẩu, số điện thoại, giới tính, loại tài khoản), trùng tên tài khoản/email/số điện thoại, mã không tồn tại (gender, accounttype), tham số filter/sort không hợp lệ, tạo mã tài khoản thất bại.
2 = Tài khoản không tồn tại, sai mật khẩu, tài khoản bị khóa, vượt quá số lần đăng nhập, token không hợp lệ, token hết hạn, token bị vô hiệu hóa.
3 = Lỗi cơ sở dữ liệu, lỗi mã hóa JWT, lỗi xác minh token, ngoại lệ không xử lý được, khóa bí mật JWT không được cấu hình.
----------------Set dữ liệu hình ảnh mẫu trong database mysql---------------------
*Chạy hết đoạn dưới vào SQL là được
UPDATE Banner
SET BannerImage = ELT(
FLOOR(1 + RAND() _ 3),
'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/2_wa9qke.jpg',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/defaultbanner_p9kvda.webp',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/1_hto4q9.jpg'
);
UPDATE Product
SET ProductImage = ELT(
FLOOR(1 + RAND() _ 3),
'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558124/byc7mrjoarwcgyrtea0r.jpg',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558125/ls9e3xebscd1bmaneny8.jpg',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558126/fsbxdr20pi2pjxebxrht.jpg'
);
UPDATE Image
SET Image = ELT(
FLOOR(1 + RAND() * 3),
'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558124/byc7mrjoarwcgyrtea0r.jpg',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558125/ls9e3xebscd1bmaneny8.jpg',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1744558126/fsbxdr20pi2pjxebxrht.jpg'
);
-------------Hướng dẫn setup blockchain-------------
*tải hạ version nodejs 18.20.8 nếu lỗi
-chạy lệnh ở dưới mysql để cập nhật database
-đổi độ dài VeterinarianID ở bảng appointment thành 42
-chạy lần lượt các lệnh:
+npm install
+npm install -g truffle
+npm install -g ganache
+npm install ganache-cli
-cd vào truffle*project chạy truffle compile
-tách 2 console ở be
+console ở be chạy lệnh ganache-cli --port 7545 --accounts 10 --account_keys_path keys.json --deterministic --db ./ganache-data
+console đang cd truffle_project chạy truffle migrate --network development
-copy contract address vào:
+thêm dòng CONTRACT_ADDRESS ở .env của be rồi copy contract address vào
+thêm dòng REACT_APP_CONTRACT_ADDRESS ở .env của fe rồi copy contract address vào
-cd .. ở console chạy lệnh truffle migrate
-chạy npm start
-tải extension metamask ở trình duyệt
-đăng nhập như 1 con người
-thêm netword:
+NETWORK: Ganache Local
+URL RPC: http://127.0.0.1:7545
+CHAIN ID: 1337
-tạo 1 tài khoản mới ở web
-lưu private key
-nhập private vào metamask
-------------Lệnh sửa db ở mysql-------------
\*\*\_Lệnh có thể sai nếu tên fk khác*\*\*
ALTER TABLE thatcookdb.appointment
DROP FOREIGN KEY appointment_ibfk_1;
ALTER TABLE thatcookdb.cartitem
DROP FOREIGN KEY cartitem_ibfk_1;
ALTER TABLE thatcookdb.schedule
DROP FOREIGN KEY schedule_ibfk_1;
ALTER TABLE thatcookdb.veterinarianinfo
DROP FOREIGN KEY veterinarianinfo_ibfk_1;
ALTER TABLE thatcookdb.veterinarianservice
DROP FOREIGN KEY veterinarianservice_ibfk_1;
ALTER TABLE thatcookdb.account
MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.appointment
MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.cartitem
MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.schedule
MODIFY COLUMN VeterinarianID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.veterinarianinfo
MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.veterinarianservice
MODIFY COLUMN VeterinarianID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.appointment
ADD CONSTRAINT appointment_ibfk_1
FOREIGN KEY (AccountID)
REFERENCES thatcookdb.account(AccountID)
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE thatcookdb.cartitem
ADD CONSTRAINT cartitem_ibfk_1
FOREIGN KEY (AccountID)
REFERENCES thatcookdb.account(AccountID)
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE thatcookdb.schedule
ADD CONSTRAINT schedule_ibfk_1
FOREIGN KEY (VeterinarianID)
REFERENCES thatcookdb.account(AccountID)
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE thatcookdb.veterinarianinfo
ADD CONSTRAINT veterinarianinfo_ibfk_1
FOREIGN KEY (AccountID)
REFERENCES thatcookdb.account(AccountID)
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE thatcookdb.veterinarianservice
ADD CONSTRAINT veterinarianservice_ibfk_1
FOREIGN KEY (VeterinarianID)
REFERENCES thatcookdb.account(AccountID)
ON DELETE CASCADE ON UPDATE CASCADE;

api.js fix xong lỗi track:
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
// router.post('/api/save-petinfo', petController.handleSavePetInfo);
// router.put('/api/change-petinfo', petController.handleChangePetInfo);
// router.put('/api/remove-pet', petController.handleRemovePet);

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

// Route mới cho VNPay return (GET)
router.get('/api/vnpay_return', (req, res) => {
console.log('VNPay Return Params:', req.query); // Log để check rspCode
const rspCode = req.query.vnp_ResponseCode;
if (rspCode === '00') {
// Redirect đến FE /track với success và invoice ID (từ vnp_TxnRef)
res.redirect(`${process.env.URL_FRONTEND}/track?success=true&invoiceId=${req.query.vnp_TxnRef}`);
} else {
res.redirect(`${process.env.URL_FRONTEND}/checkout?error=Thanh toán thất bại&code=${rspCode}`);
}
});

// Route mới cho VNPay IPN (POST)
router.post('/api/vnpay_ipn', async (req, res) => {
console.log('VNPay IPN Callback:', req.query); // Debug
const response = await invoiceService.handleVnpayIpn(req.query);
res.status(200).send(response);
});

return app.use('/', router);
};

module.exports = initAPIRoutes;

---
