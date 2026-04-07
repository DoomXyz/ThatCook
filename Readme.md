<div align="center">

# 🐾 ThatCook — Pet Shop & Services

### Nền tảng thương mại điện tử cho thú cưng tích hợp Blockchain

[![Node.js](https://img.shields.io/badge/Node.js-22.14.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Solidity](https://img.shields.io/badge/Solidity-Smart_Contract-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)

</div>

---

## 📖 Giới thiệu

**ThatCook** là một nền tảng trọn gói dành cho thú cưng, kết hợp giữa **thương mại điện tử** và **dịch vụ thú y**, được xây dựng trên kiến trúc **Node.js/Express** (Backend) + **React** (Frontend) và tích hợp **Blockchain Ethereum** (Solidity + Truffle + Ganache) để quản lý hồ sơ thú cưng phi tập trung.

### ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|---|---|
| 🛒 **Cửa hàng thú cưng** | Mua sắm sản phẩm, quản lý giỏ hàng, áp dụng mã giảm giá, thanh toán & hóa đơn |
| 🏥 **Dịch vụ thú y** | Đặt lịch khám, quản lý lịch trình bác sĩ, thanh toán dịch vụ |
| ⛓️ **Blockchain** | Đăng ký & quản lý hồ sơ thú cưng trên Ethereum (Smart Contract) |
| 💬 **Chat thời gian thực** | Nhắn tin giữa người dùng & bác sĩ thú y qua Socket.IO |
| 🔔 **Thông báo** | Hệ thống notification đa dạng sự kiện (đơn hàng, lịch khám) |
| 🔐 **Xác thực JWT** | Đăng nhập/đăng ký bảo mật với token & blacklist |
| 📊 **Thống kê** | Dashboard với biểu đồ trực quan (Chart.js) |
| 🖼️ **Quản lý hình ảnh** | Upload & lưu trữ hình ảnh qua Cloudinary |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│   UI Components  ·  Chart.js  ·  MetaMask Integration   │
└──────────┬──────────────────────────────────┬───────────┘
           │ REST API                         │ WebSocket
           ▼                                  ▼
┌──────────────────────────┐    ┌─────────────────────────┐
│    Backend (Express.js)  │    │     Socket.IO Server    │
│  Controllers · Services  │    │   Real-time Messaging   │
│   Middleware · JWT Auth   │    └─────────────────────────┘
└──────────┬───────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐ ┌──────────────────────┐
│  MySQL   │ │  Ethereum Blockchain │
│ Sequelize│ │  Truffle · Ganache   │
│   ORM    │ │  PetRegistry.sol     │
└──────────┘ └──────────────────────┘
```

---

## 📂 Cấu trúc dự án

```
📦 ThatCook/
├── 📁 be/                        # Backend (Node.js/Express)
│   ├── 📁 src/
│   │   ├── 📁 config/            # Cấu hình database & ứng dụng
│   │   ├── 📁 controllers/       # Xử lý request/response
│   │   ├── 📁 middleware/         # JWT Auth, validation
│   │   ├── 📁 migrations/        # Database migrations (Sequelize)
│   │   ├── 📁 models/             # Data models (Account, Product...)
│   │   ├── 📁 route/              # API endpoints
│   │   ├── 📁 seeders/            # Dữ liệu mẫu
│   │   ├── 📁 services/           # Business logic
│   │   └── 📄 server.js           # Entry point
│   ├── 📁 truffle_project/
│   │   ├── 📁 contracts/          # Smart contracts (PetRegistry.sol)
│   │   └── 📁 migrations/         # Truffle migrations
│   ├── 📄 .env
│   └── 📄 package.json
│
└── 📁 fe/                        # Frontend (React)
    ├── 📁 public/                 # Static assets & index.html
    ├── 📁 src/
    │   ├── 📁 components/         # React components
    │   ├── 📁 containers/         # Page containers
    │   ├── 📁 routes/             # Route definitions
    │   ├── 📁 services/           # API service calls
    │   ├── 📁 store/              # Redux store & reducers
    │   ├── 📁 styles/             # SCSS stylesheets
    │   ├── 📁 utils/              # Utility functions
    │   └── 📄 axios.js            # Axios instance config
    ├── 📄 .env
    └── 📄 package.json
```

---

## ⚡ Yêu cầu hệ thống

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| **Node.js** | `22.14.0` | Bắt buộc đúng version |
| **MySQL** | 8.x+ | Cần phpMyAdmin hoặc MySQL Workbench |
| **Git** | Mới nhất | Quản lý mã nguồn |
| **MetaMask** | Extension | Trình duyệt Chrome/Edge |
| **Truffle** | Global install | Cho Blockchain (cần Node 18.x) |
| **Ganache CLI** | Global install | Mạng Ethereum local |

> [!TIP]
> Nếu bạn cần dùng nhiều version Node.js, hãy cài **nvm** (Node Version Manager):
> ```bash
> # (Nếu cần cài nvm) → Xóa Node.js cũ → Tải nvm → Cài version mới nhất
> nvm install 22.14.0
> nvm use 22.14.0
> ```

---

## 🚀 Hướng dẫn cài đặt

### 1️⃣ Clone dự án

```bash
# Tạo thư mục gốc
mkdir ThatCook && cd ThatCook

# Clone Backend vào folder be/
git clone https://github.com/KhangChinh/Pet-Shop-and-Services-with-simple-BlockChain-JavaScrippt_React_Node.git -b be

# Clone Frontend vào folder fe/
git clone https://github.com/KhangChinh/Pet-Shop-and-Services-with-simple-BlockChain-JavaScrippt_React_Node.git -b fe
```

### 2️⃣ Cấu hình môi trường

#### 🔙 Backend (`be/.env`)

Xóa đuôi `.example` của file `.env.example` trong thư mục `be/`:

```env mẫu
PORT=9999
NODE_ENV=development
URL_REACT=http://localhost:3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
JWT_EXPIRES_IN_LONG=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### 🖥️ Frontend (`fe/.env`)

Xóa đuôi `.example` của file `.env.example` trong thư mục `fe/`:

```env mẫu
REACT_APP_BACKEND_URL=http://localhost:9999
REACT_APP_CONTRACT_ADDRESS=0x_your_contract_address
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_API_KEY=your_api_key
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3️⃣ Cài đặt thư viện

```bash
# Cài đặt Backend
cd be
npm install

# Cài đặt Frontend
cd ../fe
npm install
```

### 4️⃣ Thiết lập Database

1. Mở **phpMyAdmin** → Tạo database mới tên **`thatcookdb`**
   - Nếu đã có database cùng tên, xóa đi tạo lại
2. Chạy migration & seed (trong thư mục `be/`):

```bash
cd be

# Tạo các bảng
npx sequelize-cli db:migrate

# Thêm dữ liệu mẫu
npx sequelize-cli db:seed:all
```

> [!WARNING]
> Nếu gặp lỗi khi chạy migrate/seed, hãy undo rồi chạy lại:
> ```bash
> npx sequelize-cli db:migrate:undo:all
> npx sequelize-cli db:migrate
> npx sequelize-cli db:seed:all
> ```

### 5️⃣ Khởi chạy ứng dụng

> [!IMPORTANT]
> Cần mở **2 terminal riêng biệt** để chạy cả Backend và Frontend cùng lúc.

**Terminal 1 — Backend** (port `9999`):

```bash
cd be
npm start
```

**Terminal 2 — Frontend** (port `3000`):

```bash
cd fe
npm start
```

✅ Truy cập ứng dụng tại: **http://localhost:3000**

---

## ⛓️ Hướng dẫn thiết lập Blockchain

> [!IMPORTANT]
> Phần Blockchain cần **Node.js 18.20.8**. Dùng `nvm` để chuyển version nếu cần.

### Bước 1 — Cài đặt công cụ

```bash
npm install
npm install -g truffle
npm install -g ganache
npm install ganache-cli
```

### Bước 2 — Compile Smart Contract

```bash
cd truffle_project
truffle compile
```

### Bước 3 — Khởi động mạng Ganache

> Mở **Terminal riêng** (ở thư mục `be/`):

```bash
cd be
  ganache-cli --port 7545 --accounts 10 --account_keys_path keys.json --deterministic --db ./ganache-data
```

### Bước 4 — Deploy Smart Contract

> Mở **Terminal riêng** (ở thư mục `be/truffle_project`):

```bash
cd be/truffle_project
truffle migrate --network development
```

📋 **Copy `contract address`** từ output và thêm vào:

| File | Biến môi trường |
|---|---|
| `be/.env` | `CONTRACT_ADDRESS=0x...` |
| `fe/.env` | `REACT_APP_CONTRACT_ADDRESS=0x...` |

### Bước 5 — Cấu hình MetaMask

1. Cài extension **MetaMask** trên trình duyệt
2. Tạo hoặc đăng nhập tài khoản MetaMask
3. Thêm mạng tùy chỉnh:

   | Trường | Giá trị |
   |---|---|
   | Network Name | `Ganache Local` |
   | RPC URL | `http://127.0.0.1:7545` |
   | Chain ID | `1337` |

4. Tạo tài khoản mới trên web → Lưu **Private Key**
5. Import Private Key vào MetaMask

---

## 🔢 Bảng mã lỗi (Error Codes)

| Mã | Ý nghĩa |
|:---:|---|
| `-1` | Tham số rỗng hoặc không hợp lệ (thiếu userInfo, accountname, password, token...) |
| `0` | ✅ Xử lý yêu cầu **thành công** |
| `1` | Định dạng sai, dữ liệu trùng lặp, mã không tồn tại, filter/sort không hợp lệ |
| `2` | Tài khoản không tồn tại, sai mật khẩu, bị khóa, token hết hạn/vô hiệu |
| `3` | Lỗi hệ thống (database, JWT, ngoại lệ không xử lý được) |

---

## 🔧 Hướng dẫn Git cơ bản

<details>
<summary>📌 Cấu hình Git lần đầu</summary>

```bash
git config --global user.name "[Tên của bạn]"
git config --global user.email "[email@example.com]"
git config --list   # Kiểm tra thông tin
```

</details>

<details>
<summary>📤 Đẩy code lên (Push)</summary>

```bash
git add .
git commit -m "Mô tả thay đổi"
git push origin [fe hoặc be]
```

</details>

<details>
<summary>📥 Kéo code xuống (Pull)</summary>

```bash
git fetch origin [fe hoặc be]
git pull origin [fe hoặc be]
```

</details>

---

## 🗄️ Database Scripts

<details>
<summary>📸 Cập nhật hình ảnh mẫu cho sản phẩm</summary>

> Chạy các câu lệnh SQL sau trong phpMyAdmin hoặc MySQL Workbench:

```sql
-- Cập nhật Banner
UPDATE Banner
SET BannerImage = ELT(
  FLOOR(1 + RAND() * 3),
  'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/2_wa9qke.jpg',
  'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/defaultbanner_p9kvda.webp',
  'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/1_hto4q9.jpg'
);

-- Cập nhật hình ảnh sản phẩm
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

-- Cập nhật bảng Image
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
```

</details>

<details>
<summary>🔄 Sửa độ dài AccountID (VARCHAR 42) cho Blockchain</summary>

> ⚠️ **Lưu ý:** Tên foreign key có thể khác tùy database của bạn.

```sql
-- Xóa các foreign key hiện tại
ALTER TABLE thatcookdb.appointment      DROP FOREIGN KEY appointment_ibfk_1;
ALTER TABLE thatcookdb.cartitem         DROP FOREIGN KEY cartitem_ibfk_1;
ALTER TABLE thatcookdb.schedule         DROP FOREIGN KEY schedule_ibfk_1;
ALTER TABLE thatcookdb.veterinarianinfo DROP FOREIGN KEY veterinarianinfo_ibfk_1;
ALTER TABLE thatcookdb.veterinarianservice DROP FOREIGN KEY veterinarianservice_ibfk_1;

-- Mở rộng cột AccountID / VeterinarianID sang VARCHAR(42)
ALTER TABLE thatcookdb.account             MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.appointment         MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.cartitem            MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.schedule            MODIFY COLUMN VeterinarianID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.veterinarianinfo    MODIFY COLUMN AccountID VARCHAR(42) NOT NULL;
ALTER TABLE thatcookdb.veterinarianservice MODIFY COLUMN VeterinarianID VARCHAR(42) NOT NULL;

-- Tạo lại các foreign key
ALTER TABLE thatcookdb.appointment
  ADD CONSTRAINT appointment_ibfk_1
  FOREIGN KEY (AccountID) REFERENCES thatcookdb.account(AccountID)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE thatcookdb.cartitem
  ADD CONSTRAINT cartitem_ibfk_1
  FOREIGN KEY (AccountID) REFERENCES thatcookdb.account(AccountID)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE thatcookdb.schedule
  ADD CONSTRAINT schedule_ibfk_1
  FOREIGN KEY (VeterinarianID) REFERENCES thatcookdb.account(AccountID)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE thatcookdb.veterinarianinfo
  ADD CONSTRAINT veterinarianinfo_ibfk_1
  FOREIGN KEY (AccountID) REFERENCES thatcookdb.account(AccountID)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE thatcookdb.veterinarianservice
  ADD CONSTRAINT veterinarianservice_ibfk_1
  FOREIGN KEY (VeterinarianID) REFERENCES thatcookdb.account(AccountID)
  ON DELETE CASCADE ON UPDATE CASCADE;
```

</details>

<details>
<summary>🔔 Tạo bảng Notification</summary>

```sql
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
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm các loại thông báo
INSERT IGNORE INTO AllCodes (`Type`, `Code`, `CodeValueVI`, `ExtraValue`) VALUES
  ('NotifType',   'ORDER_COMPLETE', 'đã thanh toán',              NULL),
  ('NotifType',   'ORDER_CONFIRM',  'chờ xác nhận đơn hàng',      NULL),
  ('NotifType',   'ORDER_SUCCESS',  'đặt đơn hàng thành công',    NULL),
  ('NotifType',   'ORDER_CANCEL',   'hủy đơn hàng',               NULL),
  ('NotifType',   'APM_SUCCESS',    'lịch khám đã được đặt',      NULL),
  ('NotifType',   'APM_WAIT',       'lịch khám chờ xác nhận',     NULL),
  ('NotifType',   'APM_CONFIRM',    'xác nhận lịch khám',         NULL),
  ('NotifType',   'APM_REFUSE',     'từ chối lịch khám',          NULL),
  ('NotifType',   'APM_COMPLETE',   'hoàn thành lịch khám',       NULL),
  ('NotifType',   'APM_CANCAEL',    'hủy lịch khám',              NULL),
  ('NotifStatus', 'READ',           'Đã đọc',                     NULL),
  ('NotifStatus', 'UNREAD',         'Chưa đọc',                   NULL);
```

</details>

<details>
<summary>💬 Tạo bảng Chat (Room, Message, RoomMember)</summary>

> Chạy từng đoạn SQL để đảm bảo chính xác.

```sql
-- Bảng Room
CREATE TABLE Room (
  RoomID INT PRIMARY KEY,
  RoomName VARCHAR(30) NOT NULL,
  LastMessage TEXT NULL,
  LastMessageTime DATETIME NULL,
  CreatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Message
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

-- Bảng RoomMember
CREATE TABLE RoomMember (
  RoomMemberID INT AUTO_INCREMENT PRIMARY KEY,
  AccountID VARCHAR(42) NOT NULL,
  RoomID INT NOT NULL,
  UNIQUE KEY unique_member_per_room (RoomID, AccountID),
  INDEX idx_account (AccountID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Foreign Keys
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
```

</details>

<details>
<summary>🐾 Xóa bảng Pet cũ (nếu cần)</summary>

```sql
-- Kiểm tra foreign key liên quan đến bảng Pet
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME,
       REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'pet'
  AND TABLE_SCHEMA = 'thatcookdb';

-- Xóa foreign key và bảng
ALTER TABLE appointment DROP FOREIGN KEY appointment_ibfk_3;
ALTER TABLE appointment DROP INDEX appointment_ibfk_3;
DROP TABLE pet;
```

</details>

<details>
<summary>📦 Cài đặt thêm Socket.IO</summary>

```bash
# Chạy ở cả Frontend và Backend
npm install socket.io

# Chỉ chạy ở Frontend
npm install socket.io-client
```

</details>

<details>
<summary>📝 Ghi chú bổ sung</summary>

- Tắt `AUTO_INCREMENT` ở `RoomID` và bật `NULL` cho `LastMessage` trong bảng `Room`
- Thêm cột `appointmentbill` (STRING 20) và `appointmentstatus` (STRING 20) vào bảng tương ứng
- Dùng `ngrok http 9999` nếu cần expose server ra ngoài

</details>

---

<div align="center">

### 📬 Liên hệ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ qua:

[![Facebook](https://img.shields.io/badge/Facebook-Liên_hệ-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/starofthestarsofthestars/)
[![GitHub](https://img.shields.io/badge/GitHub-KhangChinh-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/KhangChinh/Pet-Shop-and-Services-with-simple-BlockChain-JavaScrippt_React_Node)

---

</div>
