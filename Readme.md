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
RoomID INT AUTO_INCREMENT PRIMARY KEY,
RoomName VARCHAR(30) NOT NULL,
LastMessage TEXT NOT NULL,
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
