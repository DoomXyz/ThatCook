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
\*nếu chạy xong 2 lệnh hoặc bị lỗi khi đang chạy thì chạy lệnh dưới sau đó chạy lại 2 lệnh trên
npx sequelize-cli db:migrate:undo:all
---------------Danh sách mã lỗi trong code (errCode)-----------------
-1 = Tham số rỗng hoặc không hợp lệ (ví dụ: thiếu userInfo, accountname, password, accountid, token, userGender, userAccountType, page, limit).
0 = Xử lí yêu cầu thành công
1 = Định dạng sai (tên tài khoản, email, mật khẩu, số điện thoại, giới tính, loại tài khoản), trùng tên tài khoản/email/số điện thoại, mã không tồn tại (gender, accounttype), tham số filter/sort không hợp lệ, tạo mã tài khoản thất bại.
2 = Tài khoản không tồn tại, sai mật khẩu, tài khoản bị khóa, vượt quá số lần đăng nhập, token không hợp lệ, token hết hạn, token bị vô hiệu hóa.
3 = Lỗi cơ sở dữ liệu, lỗi mã hóa JWT, lỗi xác minh token, ngoại lệ không xử lý được, khóa bí mật JWT không được cấu hình.

ngrok http 9999
----------------Set dữ liệu hình ảnh mẫu trong database mysql---------------------
*Chạy hết đoạn dưới vào SQL là được
UPDATE Banner
SET BannerImage = ELT(
FLOOR(1 + RAND() \_ 3),
'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/2_wa9qke.jpg',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/defaultbanner_p9kvda.webp',
'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/1_hto4q9.jpg'
);
UPDATE Product
SET ProductImage = ELT(
FLOOR(1 + RAND() * 26),
'https://product.hstatic.net/200000263355/product/z4422721407280_da218592cafe5883f0c038e017da4431_ecb032d14d3d41d48432d0ec0c4dcf17_master.jpg',
'https://product.hstatic.net/200000263355/product/z5689297270878_c3804aeb70d00a6f0bac98f8b43fad2b_85326496dc1a4259a0039c90f496bd10_master.jpg',
'https://product.hstatic.net/200000263355/product/z4423429265327_dc60f09543c7dedf8622b41f41523554_b2c72fd6aab54f72b416dfab3d12c78f_master.jpg',
'https://product.hstatic.net/200000263355/product/z5625317232002_a6d5cca3bb39d486d8870c927d894c21_839973b078544de8bc1a13c2a6aef528_master.jpg',
'https://cdn.hstatic.net/products/200000263355/565202280_1516269957166879_8056968203765019197_n__1__2b6b01aa2a54441092c808f0e5882bd6_master.png',
'https://cdn.hstatic.net/products/200000263355/z7292076905970_a4bdcc2eaee5f57579e923be9a6d34ce_496ebe82364645eabe4a9620a248bef6_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z4395746689008_cbd4f1b7a943882d364d2ae52d4aba74_ea349869378a4d03bce548427b14d304_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6770451478929_684c531aca78b814781914a664f1877c_d209f23fd5654b04b77bd5c5590830b2_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z7240971545222_1381f6071495376fffb639dfa7f54624_3f21a176d036456f9b8e29ca17fb5778_master.jpg',
'https://cdn.hstatic.net/products/200000263355/box-tube_urinary-tract_e2447af813ac41019383a6a842301dfe_master.png',
'https://cdn.hstatic.net/products/200000263355/z7031117837910_8b94b76a0bc8f49ae84555b88be20f75_46b6d2e0d083456f878dd877283bceed_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6871671614623_77962d7b1884c4dbb7760716e3baeab5_96ab5fd7278a4a74bb801e0709e30ce1_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6839089591733_05f1a79f237043a1aa052b6d5fd152e0_32b80fd5afac491e91d4dab95a836c51_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6817241690771_6c2d09aa91a41a835bb4a1d43a2868a8_631187852d3542e1b64220533adfb062_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6763364237833_8d37b5579895411909b751ce1493f700_34740ac7b6a44c31a3a7697d157fa4c5_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6763365968060_cfcc519f5a2bf8c6e1ded7d72c030816_ac528e4dc1cb45b397e2dd0c843439f1_master.jpg',
'https://product.hstatic.net/200000263355/product/z6723622672111_22ea930e3b46ba8383d5b26a0613941d_74fe4f032f4441d387e86f6b0122cb43_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6763367615894_8f4590a9fc038a392d5e3b26a4d501fd_aa1d910feeab49db8431140408879cc6_master.jpg',
'https://product.hstatic.net/200000263355/product/z6132136356682_3163f6f0d728ea2b9e3c856135ba1b36_6910b5e0f1c74d18bc27a36d4a7b1be3_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6895014082993_e99298b50c04e513a3e5034423a25804_25ff4861a4204099bc0de730202cb20a_master.jpg',
'https://product.hstatic.net/200000263355/product/z4521156670344_241666d21cb6a509932a47697b35a9d3_7f390ac218ed427b8f4d73d735909755_master.jpg',
'https://product.hstatic.net/200000263355/product/z4537790047193_50a8e2789ac9de90187b93b8d35cd4ec_544b26bb1b3d43eaa44ed12448054816_master.jpg',
'https://product.hstatic.net/200000263355/product/z4499757486334_35085035ec242a87749cb68977fe196a_206da9bf645349129f8c881094d0153b_master.jpg',
'https://product.hstatic.net/200000263355/product/z4398310871628_ad4fdf91fa8cf8ed1d61961644303e3d_915195830a4844d9a80a607ccc8c6af1_master.jpg',
'https://product.hstatic.net/200000263355/product/z4467882912123_d3e80a073ddf6232be0e9d6dfc72d306_589e25a72f6a467fbe3f32dd1c5e6de6_master.jpg',
'https://product.hstatic.net/200000263355/product/z4398310781059_33efd3be1efbd662aaae3dc0ff84ab1b_e8b3482f6d5d43ea94e983cbc8287d23_master.jpg'
);
UPDATE Image
SET Image = ELT(
FLOOR(1 + RAND() * 26),
'https://product.hstatic.net/200000263355/product/z4422721407280_da218592cafe5883f0c038e017da4431_ecb032d14d3d41d48432d0ec0c4dcf17_master.jpg',
'https://product.hstatic.net/200000263355/product/z5689297270878_c3804aeb70d00a6f0bac98f8b43fad2b_85326496dc1a4259a0039c90f496bd10_master.jpg',
'https://product.hstatic.net/200000263355/product/z4423429265327_dc60f09543c7dedf8622b41f41523554_b2c72fd6aab54f72b416dfab3d12c78f_master.jpg',
'https://product.hstatic.net/200000263355/product/z5625317232002_a6d5cca3bb39d486d8870c927d894c21_839973b078544de8bc1a13c2a6aef528_master.jpg',
'https://cdn.hstatic.net/products/200000263355/565202280_1516269957166879_8056968203765019197_n__1__2b6b01aa2a54441092c808f0e5882bd6_master.png',
'https://cdn.hstatic.net/products/200000263355/z7292076905970_a4bdcc2eaee5f57579e923be9a6d34ce_496ebe82364645eabe4a9620a248bef6_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z4395746689008_cbd4f1b7a943882d364d2ae52d4aba74_ea349869378a4d03bce548427b14d304_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6770451478929_684c531aca78b814781914a664f1877c_d209f23fd5654b04b77bd5c5590830b2_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z7240971545222_1381f6071495376fffb639dfa7f54624_3f21a176d036456f9b8e29ca17fb5778_master.jpg',
'https://cdn.hstatic.net/products/200000263355/box-tube_urinary-tract_e2447af813ac41019383a6a842301dfe_master.png',
'https://cdn.hstatic.net/products/200000263355/z7031117837910_8b94b76a0bc8f49ae84555b88be20f75_46b6d2e0d083456f878dd877283bceed_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6871671614623_77962d7b1884c4dbb7760716e3baeab5_96ab5fd7278a4a74bb801e0709e30ce1_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6839089591733_05f1a79f237043a1aa052b6d5fd152e0_32b80fd5afac491e91d4dab95a836c51_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6817241690771_6c2d09aa91a41a835bb4a1d43a2868a8_631187852d3542e1b64220533adfb062_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6763364237833_8d37b5579895411909b751ce1493f700_34740ac7b6a44c31a3a7697d157fa4c5_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6763365968060_cfcc519f5a2bf8c6e1ded7d72c030816_ac528e4dc1cb45b397e2dd0c843439f1_master.jpg',
'https://product.hstatic.net/200000263355/product/z6723622672111_22ea930e3b46ba8383d5b26a0613941d_74fe4f032f4441d387e86f6b0122cb43_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6763367615894_8f4590a9fc038a392d5e3b26a4d501fd_aa1d910feeab49db8431140408879cc6_master.jpg',
'https://product.hstatic.net/200000263355/product/z6132136356682_3163f6f0d728ea2b9e3c856135ba1b36_6910b5e0f1c74d18bc27a36d4a7b1be3_master.jpg',
'https://cdn.hstatic.net/products/200000263355/z6895014082993_e99298b50c04e513a3e5034423a25804_25ff4861a4204099bc0de730202cb20a_master.jpg',
'https://product.hstatic.net/200000263355/product/z4521156670344_241666d21cb6a509932a47697b35a9d3_7f390ac218ed427b8f4d73d735909755_master.jpg',
'https://product.hstatic.net/200000263355/product/z4537790047193_50a8e2789ac9de90187b93b8d35cd4ec_544b26bb1b3d43eaa44ed12448054816_master.jpg',
'https://product.hstatic.net/200000263355/product/z4499757486334_35085035ec242a87749cb68977fe196a_206da9bf645349129f8c881094d0153b_master.jpg',
'https://product.hstatic.net/200000263355/product/z4398310871628_ad4fdf91fa8cf8ed1d61961644303e3d_915195830a4844d9a80a607ccc8c6af1_master.jpg',
'https://product.hstatic.net/200000263355/product/z4467882912123_d3e80a073ddf6232be0e9d6dfc72d306_589e25a72f6a467fbe3f32dd1c5e6de6_master.jpg',
'https://product.hstatic.net/200000263355/product/z4398310781059_33efd3be1efbd662aaae3dc0ff84ab1b_e8b3482f6d5d43ea94e983cbc8287d23_master.jpg'
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
-cd vào truffle\*project chạy truffle compile
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
\*\*\_Lệnh có thể sai nếu tên fk khác\*\*\*
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
-------------Thêm bảng Notification vào db-------------
USE thatcookdb;
CREATE TABLE Notification (
NotifID INT AUTO_INCREMENT PRIMARY KEY,
AccountID VARCHAR(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
ReceiveNotifID VARCHAR(42) NULL,
NotifDescription TEXT COLLATE utf8mb4_bin NOT NULL,
CreatedAt DATETIME NOT NULL,
ExtraValue VARCHAR(10) NOT NULL,
RoleReceive VARCHAR(20) NULL,
NotifType VARCHAR(20) NOT NULL,
NotifStatus VARCHAR(20) NOT NULL,

    INDEX index_accountid (AccountID),
    INDEX index_receivenotifid (ReceiveNotifID),
    INDEX index_rolereceive (RoleReceive),

    CONSTRAINT fk_notification_account
        FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-------------------------INSERT NOTIFTYPE------------------------------
INSERT IGNORE INTO AllCodes (`Type`, `Code`, `CodeValueVI`, `ExtraValue`) VALUES
('NotifType', 'ORDER_COMPLETE', 'đã thanh toán', NULL),
('NotifType', 'ORDER_CONFIRM', 'chờ xác nhận đơn hàng', NULL),
('NotifType', 'ORDER_SUCCESS', 'đặt đơn hàng thành công', NULL),
('NotifType', 'ORDER_CANCEL', 'hủy đơn hàng', NULL),
('NotifType', 'APM_SUCCESS', 'lịch khám đã được đặt', NULL),
('NotifType', 'APM_WAIT', 'lịch khám chờ xác nhận', NULL),
('NotifType', 'APM_CONFIRM', 'xác nhận lịch khám', NULL),
('NotifType', 'APM_REFUSE', 'từ chối lịch khám', NULL),
('NotifType', 'APM_COMPLETE', 'hoàn thành lịch khám', NULL),
('NotifType', 'APM_CANCAEL', 'hủy lịch khám', NULL),
('NotifStatus', 'READ', 'Đã đọc', NULL),
('NotifStatus', 'UNREAD', 'Chưa đọc', NULL);

---

SELECT
TABLE_NAME,
COLUMN_NAME,
CONSTRAINT_NAME,
REFERENCED_TABLE_NAME,
REFERENCED_COLUMN_NAME
FROM
INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
REFERENCED_TABLE_NAME = 'pet'
AND TABLE_SCHEMA = 'thatcookdb';

---

ALTER TABLE appointment DROP FOREIGN KEY appointment_ibfk_3;
ALTER TABLE appointment DROP INDEX appointment_ibfk_3;
DROP TABLE pet;
--------------CHẠY TỪNG ĐOẠN 1 CHO CHẮC (LIỀU THÌ CHẠY HẾT)---------------------------
CREATE TABLE Room (
RoomID INT PRIMARY KEY,
RoomName VARCHAR(30) NOT NULL,
LastMessage TEXT NULL,
LastMessageTime DATETIME NULL,
CreatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Message (
MessageID INT AUTO_INCREMENT PRIMARY KEY,
MessageType VARCHAR(20) NOT NULL,
MessageText TEXT NOT NULL,
SentAt DATETIME NOT NULL,
RoomID INT NOT NULL,
AccountID VARCHAR(42) NOT NULL,
INDEX idx_room (RoomID),
INDEX idx_account (AccountID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE RoomMember (
RoomMemberID INT AUTO_INCREMENT PRIMARY KEY,
AccountID VARCHAR(42) NOT NULL,
RoomID INT NOT NULL,
UNIQUE KEY unique_member_per_room (RoomID, AccountID),
INDEX idx_account (AccountID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE Message
ADD CONSTRAINT fk_message_room
FOREIGN KEY (RoomID) REFERENCES Room(RoomID)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Message
ADD CONSTRAINT fk_message_account
FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE RoomMember
ADD CONSTRAINT fk_roommember_room
FOREIGN KEY (RoomID) REFERENCES Room(RoomID)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE RoomMember
ADD CONSTRAINT fk_roommember_account
FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
ON DELETE CASCADE ON UPDATE CASCADE;

---

Thêm cột appointmentbill STRING(20) với appointmentstatus STRING(20)
-----------Install socket-------------------------------------
npm install socket.io(chạy ở fe và be)
npm install socket.io-client(chạy ở fe)

---

tắt A_I ở RoomID và bật null cho LastMessage Bảng Room
