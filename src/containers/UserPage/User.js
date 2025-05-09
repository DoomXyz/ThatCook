import React, { Component } from "react";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react";
import "./User.scss"; // Import SCSS
import Header from "../../components/HomeHeader";
import Footer from "../../components/HomeFooter";
import { chevronBack, pencil } from "ionicons/icons";
import {
  handleGetAccountInfoApi,
  handleVerifyTokenApi,
  handleLogoutApi,
  handleEditTaiKhoan,
  handleGetThongTinThanhToan,
  handleChangePassword,
} from "../../services/accountServices";
import {
  handleGetProductInfoApi,
  handleGetProductDetailInfoApi,
} from "../../services/productServices";
import {
  getUserOrders,
  handleGetOrderDetails,
} from "../../services/billService";
import { uploadImageToCloudinary } from "../../services/utilitiesServices"; // Thay uploadImageToGoogleDrive
import { userLogout } from "../../store/actions";
import { toast } from "react-toastify";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      actionPage: 1, // Chuyển sang số nguyên
      oldPassword: "", // Mật khẩu cũ
      newPassword: "", // Mật khẩu mới
      confirmPassword: "", // Xác nhận mật khẩu mới
      errorMessage: "", // Thông báo lỗi
      editField: null, // Theo dõi trường đang chỉnh sửa (ví dụ: "name", "phone", ...)
      originalValue: "",
      formData: {
        name: "Zani",
        phone: "0901018771",
        address: "Averado Bank, Rinascita",
        gender: "F",
        email: "castorice@gmail.com",
        avatar: "https://i.imgur.com/RlCfwMn.jpeg",
      },
      fileToUpload: null,
      isUploading: false,
      orders: [],
      selectedOrder: null,
    };
    this.handlePreviewAvatar = this.handlePreviewAvatar.bind(this);
    this.handleUploadAvatar = this.handleUploadAvatar.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  async componentDidMount() {
    if (this.props.userInfo) {
      await this.handleIsLogin();
      const mataikhoan = this.props.userInfo.mataikhoan;
      if (mataikhoan) {
        const response = await getUserOrders(mataikhoan);
        if (response && response.errCode === 0) {
          this.setState({ orders: response.data });
        } else {
          toast.error("Lấy thông tin đơn hàng thất bại!");
        }
      }

    } else {
      this.setState({ isLoggedIn: false });
      toast.info("Bạn cần đăng nhập để truy cập trang này!", {
        autoClose: 2000,
        closeOnClick: true,
      });
      this.props.navigate("/login");
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      if (this.props.userInfo) {
        await this.handleIsLogin();
      } else {
        this.setState({ isLoggedIn: false });
        toast.info("Bạn cần đăng nhập để truy cập trang này!", {
          autoClose: 2000,
          closeOnClick: true,
        });
        this.props.navigate("/login");
      }
    }
    if (this.state.isLoggedIn && !prevState.isLoggedIn) {
      const response = await handleGetAccountInfoApi(this.props.userInfo.mataikhoan);
      if (response && response.errCode === 0 && response.taikhoan) {
        // Sửa điều kiện !response.data thành response.taikhoan
        const { HoTen, SDT, DiaChi, Gender, Email, AnhDaiDien } =
          response.taikhoan;
        this.setState({
          formData: {
            ...this.state.formData,
            mataikhoan: this.props.userInfo.mataikhoan,
            accounttype: "C",
            name: HoTen,
            phone: SDT,
            address: DiaChi,
            gender: Gender,
            email: Email,
            avatar: AnhDaiDien,
          },
        });
      } else {
        toast.error("Tải thông tin người dùng thất bại");
      }
    }
    // Dời đoạn gọi API ra ngoài
    if (
      this.state.actionPage === 4 &&
      prevState.actionPage !== 4 &&
      this.state.selectedOrder
    ) {
      const orderDetails = await this.fetchOrderDetails(
        this.state.selectedOrder.madonhang
      );
      if (orderDetails) {
        const products = [];
        const chiTietSanPhams = [];
        for (const item of orderDetails.orderInfo) {
          const product = await this.fetchSanPham(item.masanpham);
          const chiTiet = await this.fetchChiTietSanPham(
            item.masanpham,
            item.mactsp
          );
          if (product) products.push(product);
          if (chiTiet) chiTietSanPhams.push(chiTiet);
        }
        const thongTinThanhToan = await this.fetchThongTinThanhToan(
          orderDetails.MAKHACHHANG
        );
        const totalPriceAfterPromo = this.calculatePriceAfterPromo(
          orderDetails.orderInfo,
          products,
          chiTietSanPhams
        );
        const shippingFee = this.getShippingFee(orderDetails.DeliveryMethod);
        const totalPayment = totalPriceAfterPromo + shippingFee;

        this.setState({
          selectedOrder: {
            ...orderDetails,
            products,
            chiTietSanPhams,
            thongTinThanhToan,
            totalPriceAfterPromo,
            shippingFee,
            totalPayment,
          },
        });
      } else {
        this.setState({ selectedOrder: null });
      }
    }
  }
  componentWillUnmount() {
    if (this.state.formData.avatar && this.state.fileToUpload) {
      URL.revokeObjectURL(this.state.formData.avatar);
    }
  }

  handleIsLogin = async () => {
    try {
      const result = await handleVerifyTokenApi();
      if (result && result.errCode === 0) {
        this.setState({ isLoggedIn: true });
      } else {
        this.setState({ isLoggedIn: false });
        const logoutResponse = await handleLogoutApi();
        if (logoutResponse && logoutResponse.errCode === 0) {
          this.props.userLogout();
          toast.info("Phiên của bạn đã hết hạn, bạn đã được đăng xuất!", {
            autoClose: 2000,
            closeOnClick: true,
          });
          this.props.navigate("/login");
        } else {
          toast.error("Đăng xuất thất bại, vui lòng thử lại!", {
            autoClose: 2000,
            closeOnClick: true,
          });
          this.props.navigate("/login");
        }
      }
    } catch (e) {
      console.error("Lỗi khi kiểm tra token:", e);
      this.setState({ isLoggedIn: false });
      const logoutResponse = await handleLogoutApi();
      if (logoutResponse && logoutResponse.errCode === 0) {
        this.props.userLogout();
        toast.error("Lỗi kết nối, bạn đã được đăng xuất!", {
          autoClose: 2000,
          closeOnClick: true,
        });
        this.props.navigate("/login");
      } else {
        toast.error("Đăng xuất thất bại, vui lòng thử lại!", {
          autoClose: 2000,
          closeOnClick: true,
        });
        this.props.navigate("/login");
      }
    }
  };

  handleFormHoSoNguoiDung = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 1, errorMessage: "", editField: null }); // Reset lỗi khi chuyển ta
  };

  handleFormLichSuDonHang = (e) => {
    if (e) e.preventDefault();
    this.setState({ actionPage: 2, errorMessage: "", selectedOrder: null });
  };

  handleFormDoiMatKhau = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 3, errorMessage: "" });
  };
  handleFormChiTietDonHang = (order) => {
    this.setState({ actionPage: 4, errorMessage: "", selectedOrder: order });
  };
  // Xử lý thay đổi giá trị input
  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, errorMessage: "" }); // Reset lỗi khi nhập
  };
  // Xử lý thay đổi trong các trường thông tin người dùng
  handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === "gender" && this.state.editField !== "gender") {
      this.setState({
        editField: "gender",
        originalValue: this.state.formData.gender, // Lưu giá trị ban đầu của gender
      });
    }

    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  handlePasswordChange = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = this.state;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    const pass = newPassword.trim();
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(pass)) {
      toast.error("Mật khẩu mới không hợp lệ!");
      return;
    }
    try {
      // Ví dụ: const response = await apiChangePassword({ oldPassword, newPassword });
      const response = await handleChangePassword(
        this.props.userInfo.mataikhoan,
        oldPassword,
        newPassword
      );

      if (response && response.errCode === 0) {
        toast.success(
          "Đổi mật khẩu thành công, hãy đăng nhập lại với mật khẩu mới",
          {
            position: "top-right",
            autoClose: 2000,
          }
        );
        this.setState({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
          errorMessage: "",
        });
        this.setState({ isLoggedIn: false });
        const logoutResponse = await handleLogoutApi();
        if (logoutResponse && logoutResponse.errCode === 0) {
          setTimeout(() => {
            this.props.userLogout();
          }, 2001);
        } else {
          toast.error("Đăng xuất thất bại, vui lòng thử lại!", {
            autoClose: 2000,
            closeOnClick: true,
          });
          this.props.navigate("/login");
        }
      } else {
        toast.error(response.errMessage);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  handlePreviewAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File info:", file.name, file.size, file.type);
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh!");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      console.log("Preview URL:", previewUrl);
      this.setState({
        formData: {
          ...this.state.formData,
          avatar: previewUrl,
        },
        fileToUpload: file,
      });
    } else {
      console.log("Không có file được chọn!");
    }
  };

  handleUploadAvatar = async () => {
    const { fileToUpload } = this.state;
    if (!fileToUpload) {
      toast.error("Vui lòng chọn ảnh trước!");
      return;
    }

    try {
      console.log(
        "Gửi yêu cầu upload ảnh lên Cloudinary:",
        fileToUpload.name,
        fileToUpload.size
      );
      const response = await uploadImageToCloudinary(fileToUpload);
      console.log("Kết quả upload từ Cloudinary:", response);

      if (response && response.errCode === 0) {
        const { public_id, secure_url, original_filename, format, created_at } =
          response.data;
        this.setState({
          formData: {
            ...this.state.formData,
            avatar: secure_url, // Cập nhật avatar bằng secure_url
          },
          fileToUpload: null,
        });
        toast.success("Tải ảnh lên Cloudinary thành công!");
        return response.data; // Trả về dữ liệu để sử dụng trong handleUpdate
      } else {
        console.error("Lỗi từ Cloudinary:", response.errMessage, response);
        toast.error(response.errMessage || "Tải ảnh lên Cloudinary thất bại!");
      }
    } catch (error) {
      console.error("Chi tiết lỗi khi tải ảnh:", error.message);
      toast.error(error.message || "Lỗi kết nối, vui lòng thử lại!");
    }
  };

  handleEditClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state.formData[field], // Lưu giá trị ban đầu của trường
    });
  };
  handleUpdate = async (e) => {
    e.preventDefault();
    const { fileToUpload, isUploading, editField, originalValue, formData } =
      this.state;

    // Khởi tạo updateInfo với các trường từ formData
    let updateInfo = {
      mataikhoan: formData.mataikhoan,
      accounttype: formData.accounttype,
      hoten: formData.name,
      sdt: formData.phone,
      diachi: formData.address,
      gender: formData.gender,
      email: formData.email,
      anhdaidien: formData.avatar,
    };

    // Biến để kiểm tra xem có thay đổi nào không
    let hasChanges = false;

    // Xử lý upload ảnh nếu có fileToUpload
    if (fileToUpload) {
      if (isUploading) {
        toast.info("Đang tải ảnh, vui lòng chờ!");
        return;
      }
      this.setState({ isUploading: true });
      try {
        const imageData = await this.handleUploadAvatar();
        if (imageData) {
          const userIMG = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
            original_filename: imageData.original_filename,
            format: imageData.format,
            created_at: imageData.created_at,
          };
          // Cập nhật anhdaidien trong updateInfo thành userIMG
          updateInfo.anhdaidien = userIMG;
          hasChanges = true; // Có upload ảnh, đánh dấu là có thay đổi
        }
      } finally {
        this.setState({ isUploading: false });
      }
    }

    // Kiểm tra xem có thay đổi dữ liệu không
    if (editField) {
      const newValue = formData[editField];
      if (originalValue !== newValue) {
        hasChanges = true; // Có thay đổi dữ liệu, đánh dấu là có thay đổi
      }
    }
    let error = true;
    const phoneNumber = updateInfo.sdt.trim();
    const basicPhoneRegex = /^[0-9]{10,11}$/; //chỉ chứa số và có độ dài từ 9-11 ký tự
    if (!basicPhoneRegex.test(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ!");
    } else {
      error = false;
    }
    // Chỉ console.log nếu có thay đổi
    if (hasChanges && error === false) {
      console.log(updateInfo);
      let response = await handleEditTaiKhoan(updateInfo);
      if (response && response.errCode === 0) {
        toast.success(
          "Cập nhật thông tin thành công, hãy đăng nhập lại để tải dữ liệu mới nhất",
          {
            position: "top-right",
            autoClose: 2000,
          }
        );
        this.setState({ isLoggedIn: false });
        const logoutResponse = await handleLogoutApi();
        if (logoutResponse && logoutResponse.errCode === 0) {
          setTimeout(() => {
            this.props.userLogout();
          }, 2001);
        } else {
          toast.error("Đăng xuất thất bại, vui lòng thử lại!", {
            autoClose: 2000,
            closeOnClick: true,
          });
          this.props.navigate("/login");
        }
      } else {
        toast.error("Số điện thoại đã được sử dụng!");
      }
    }

    this.setState({ editField: null, originalValue: "" });
  };

  // Hàm lấy chi tiết đơn hàng
  fetchOrderDetails = async (madonhang) => {
    try {
      const response = await handleGetOrderDetails(madonhang);
      if (response && response.errCode === 0) {
        return response.data;
      } else {
        toast.error("Lấy chi tiết đơn hàng thất bại!");
        return null;
      }
    } catch (e) {
      toast.error("Lỗi kết nối, vui lòng thử lại!");
      return null;
    }
  };

  // Hàm lấy thông tin sản phẩm
  fetchSanPham = async (masanpham) => {
    try {
      const response = await handleGetProductInfoApi(masanpham);
      if (response && response.errCode === 0) {
        return response.data;
      } else {
        toast.error("Lấy thông tin sản phẩm thất bại!");
        return null;
      }
    } catch (e) {
      toast.error("Lỗi kết nối, vui lòng thử lại!");
      return null;
    }
  };

  // Hàm lấy chi tiết sản phẩm
  fetchChiTietSanPham = async (masanpham, mactsp) => {
    try {
      const response = await handleGetProductDetailInfoApi(masanpham, mactsp);
      if (response && response.errCode === 0) {
        return response.data;
      } else {
        toast.error("Lấy chi tiết sản phẩm thất bại!");
        return null;
      }
    } catch (e) {
      toast.error("Lỗi kết nối, vui lòng thử lại!");
      return null;
    }
  };

  // Hàm lấy thông tin thanh toán
  fetchThongTinThanhToan = async (mataikhoan) => {
    try {
      const response = await handleGetThongTinThanhToan(mataikhoan);
      if (response && response.errCode === 0) {
        return response.thongtin;
      } else {
        toast.error("Lấy thông tin thanh toán thất bại!");
        return null;
      }
    } catch (e) {
      toast.error("Lỗi kết nối, vui lòng thử lại!");
      return null;
    }
  };

  // Hàm tính phí vận chuyển
  getShippingFee = (deliveryMethod) => {
    switch (deliveryMethod) {
      case "FAST":
        return 21000;
      case "ECO":
        return 15000;
      case "EXPRESS":
        return 40000;
      default:
        return 21000;
    }
  };

  // Hàm tính tổng giá sau giảm giá
  calculatePriceAfterPromo = (orderItems, products, chiTietSanPhams) => {
    let totalPrice = 0;
    orderItems.forEach((item) => {
      const product = products.find((p) => p.MASANPHAM === item.masanpham);
      const chiTiet = chiTietSanPhams.find((ct) => ct.MACTSP === item.mactsp);
      if (product && chiTiet) {
        let price = parseFloat(product.GiaBan) + parseFloat(chiTiet.GiaThem);
        const khuyenmai = parseFloat(product.KhuyenMai) || 0;
        if (khuyenmai > 0) {
          price *= (100 - khuyenmai) / 100;
        }
        totalPrice += price * item.soluong;
      }
    });
    return totalPrice;
  };
  renderForm() {
    const {
      actionPage,
      oldPassword,
      newPassword,
      confirmPassword,
      errorMessage,
      editField,
      formData,
    } = this.state;

    switch (actionPage) {
      case 1:
        return (
          <form className="user-info-form" onSubmit={this.handleUpdate}>
            <h3>
              <b>Thông tin người dùng:</b>
            </h3>
            <div className="user-info-form-content">
              <div className="user-content-left">
                <div className="user-info-tab">
                  <div className="descreption-user">Họ và tên:</div>
                  {editField === "name" ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={this.handleUserInfoChange}
                      className="value-user-input"
                    />
                  ) : (
                    <div className="value-user">{formData.name}</div>
                  )}
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => this.handleEditClick("name")}
                  >
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Số điện thoại: </div>
                  {editField === "phone" ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={this.handleUserInfoChange}
                      className="value-user-input"
                    />
                  ) : (
                    <div className="value-user">{formData.phone}</div>
                  )}
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => this.handleEditClick("phone")}
                  >
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Địa chỉ:</div>
                  {editField === "address" ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={this.handleUserInfoChange}
                      className="value-user-input"
                    />
                  ) : (
                    <div className="value-user">{formData.address}</div>
                  )}
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => this.handleEditClick("address")}
                  >
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Giới tính:</div>
                  <div className="value-user gender-radio-group">
                    <label className="gender-radio">
                      <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={formData.gender === "M"}
                        onChange={this.handleUserInfoChange}
                      />
                      Nam
                    </label>
                    <label className="gender-radio">
                      <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={formData.gender === "F"}
                        onChange={this.handleUserInfoChange}
                      />
                      Nữ
                    </label>
                    <label className="gender-radio-1">
                      <input
                        type="radio"
                        name="gender"
                        value="O"
                        checked={formData.gender === "O"}
                        onChange={this.handleUserInfoChange}
                      />
                      Khác
                    </label>
                  </div>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Email:</div>
                  <div className="value-user email">{formData.email}</div>
                </div>
                <div
                  className="change-info-button"
                  onSubmit={this.handleUpdate}
                >
                  <button> Cập nhật </button>
                </div>
              </div>
              <div className="user-content-right">
                <div className="user-content-right-img-content">
                  <div className="user-content-img-info">
                    <img
                      className="user-content-img-info"
                      src={formData.avatar}
                      alt="User avatar"
                    />
                  </div>
                </div>
                <div className="user-content-img-button">
                  <input
                    type="file"
                    accept="image/*"
                    id="upload-avatar"
                    onChange={this.handlePreviewAvatar}
                  />
                </div>
              </div>
            </div>
          </form>
        );
      case 2:
        return (
          <form className="user-cart-form">
            <h3>
              <b>Lịch sử đơn hàng của bạn:</b>
            </h3>
            <div className="user-cart-form-content">
              <div className="order-list">
                {this.state.orders.length > 0 ? (
                  this.state.orders.map((order, index) => (
                    <div
                      key={index}
                      className={`order-list-object ${actionPage === 4 ? "active" : ""
                        }`}
                      onClick={() => this.handleFormChiTietDonHang(order)}
                    >
                      <div className="order-list-object-top">
                        <div className="oder-list-descreption-left">
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Mã đơn hàng:</b>
                            </div>
                            <div className="value-oder">{order.madonhang}</div>
                          </div>
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Ngày mua hàng:</b>
                            </div>
                            <div className="value-oder">
                              {new Date(
                                order.ngaylapdonhang
                              ).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <div className="oder-list-descreption-right">
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Tình trạng giao hàng:</b>
                            </div>
                            <div className="value-oder">
                              {order.orderstatus}
                            </div>
                          </div>
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Tình trạng thanh toán:</b>
                            </div>
                            <div className="value-oder">
                              {order.paymentstatus}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="order-list-object-center">
                        <div className="order-list-object-item">
                          <div className="order-list-object-item-left">
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>Tên người nhận hàng:</b>
                              </div>
                              <div className="value-item">
                                {order.tenkhachhang}
                              </div>
                            </div>
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>SĐT nhận hàng:</b>
                              </div>
                              <div className="value-item">
                                {order.sdtnhanhang}
                              </div>
                            </div>
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>Địa chỉ nhận hàng:</b>
                              </div>
                              <div className="value-item">
                                {order.diachinhanhang}
                              </div>
                            </div>
                          </div>
                          <div className="order-list-object-item-center">
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                Số lượng mặt hàng:
                              </div>
                              <div className="value-item">
                                <b>{order.chitietdonhang.length}</b>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="order-list-object-bot">
                        <div className="oder-list-object-price">
                          <div className="price-item">
                            <div className="label">Tổng tiền hàng:</div>
                            <div className="value">
                              <b>
                                {" "}
                                {parseFloat(order.tongtien).toLocaleString(
                                  "vi-VN",
                                  {
                                    style: "currency",
                                    currency: "VND",
                                  }
                                )}
                              </b>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có đơn hàng nào.</p>
                )}
              </div>
            </div>
          </form>
        );
      case 3:
        return (
          <form
            className="user-change-pw-form"
            onSubmit={this.handlePasswordChange}
          >
            <h3>
              <b>Đổi mật khẩu:</b>
            </h3>
            <div className="user-change-pw-form-content">
              <label>Mật khẩu cũ:</label>
              <div className="user-change-pw-form-content-input">
                <input
                  type="password"
                  name="oldPassword"
                  value={oldPassword}
                  onChange={this.handleInputChange}
                  placeholder="Nhập mật khẩu cũ"
                  required
                />
              </div>
              <label>Mật khẩu mới:</label>
              <div className="user-change-pw-form-content-input">
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={this.handleInputChange}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>

              <label>Xác nhận mật khẩu mới:</label>
              <div className="user-change-pw-form-content-input">
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={this.handleInputChange}
                  placeholder="Xác nhận mật khẩu"
                  required
                />
              </div>

              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
            <div className="button-submit">
              <button type="submit">Cập nhật</button>
            </div>
          </form>
        );
      case 4:
        const { selectedOrder } = this.state;
        if (!selectedOrder) {
          return (
            <div>
              <div className="back" onClick={this.handleFormLichSuDonHang}>
                <IonIcon icon={chevronBack}></IonIcon>
                <h5>
                  <b>Trở lại</b>
                </h5>
              </div>
              <p>Không thể tải chi tiết đơn hàng. Vui lòng thử lại!</p>
            </div>
          );
        }
        return (
          <form className="user-cart-form-info">
            <div className="user-cart-form-info-top">
              <div className="user-cart-form-info-left">
                <div className="back" onClick={this.handleFormLichSuDonHang}>
                  <IonIcon icon={chevronBack}></IonIcon>
                  <h5>
                    <b>Trở lại</b>
                  </h5>
                </div>
              </div>
              <div className="user-cart-form-info-right">
                <div className="order-info-tab">
                  <div className="mdh">
                    <h5>Mã đơn hàng: </h5>
                  </div>
                  <div className="ctmd">
                    <h5>{selectedOrder?.MADONHANG || "N/A"}</h5>
                  </div>
                </div>
                <div className="tt">
                  <h5>{selectedOrder?.OrderStatus || "N/A"}</h5>
                </div>
              </div>
            </div>
            <div className="user-cart-form-info-address">
              <div className="user-info-tab">
                <div className="descreption-user">Địa chỉ nhận hàng:</div>
                <div className="value-user">
                  {selectedOrder?.DiaChiNhanHang || "N/A"}
                </div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">Tên người nhận hàng:</div>
                <div className="value-user">
                  {selectedOrder?.TenKhachHang || "N/A"}
                </div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">SĐT nhận hàng:</div>
                <div className="value-user">
                  {selectedOrder?.SDTNhanHang || "N/A"}
                </div>
              </div>
            </div>
            <div className="user-cart-form-info-list-item">
              {selectedOrder?.orderInfo?.length > 0 ? (
                selectedOrder.orderInfo.map((item, index) => {
                  const product = selectedOrder.products?.find(
                    (p) => p.MASANPHAM === item.masanpham
                  );
                  console.log(product);
                  const chiTiet = selectedOrder.chiTietSanPhams?.find(
                    (ct) => ct.MACTSP === item.mactsp
                  );
                  const price =
                    product && chiTiet
                      ? parseFloat(product.GiaBan) + parseFloat(chiTiet.GiaThem)
                      : 0;
                  const khuyenmai = product
                    ? parseFloat(product.KhuyenMai) || 0
                    : 0;
                  const finalPrice =
                    khuyenmai > 0 ? (price * (100 - khuyenmai)) / 100 : price;
                  return (
                    <div
                      key={index}
                      className="user-cart-form-info-list-item-row"
                    >
                      <div className="user-cart-form-info-list-item-left">
                        <div className="img-product">
                          <img
                            src={product?.HinhAnh || ""}
                            alt="Product"
                            style={{ width: "100px", height: "100px" }}
                          />
                        </div>
                      </div>
                      <div className="user-cart-form-info-list-item-center">
                        <div className="item-info-tab">
                          <div className="descreption-item">Tên sản phẩm:</div>
                          <div className="value-item">
                            {product?.TenSanPham || "N/A"}
                          </div>
                        </div>
                        <div className="item-info-tab">
                          <div className="descreption-item">Loại sản phẩm:</div>
                          <div className="value-item">
                            {chiTiet?.TenCTSP || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="user-cart-form-info-list-item-right">
                        <div className="item-info-tab">
                          <div className="descreption-item">Số lượng:</div>
                          <div className="value-item">
                            <b>{item.soluong || "N/A"}</b>
                          </div>
                        </div>
                        <div className="item-info-tab">
                          <div className="descreption-item">Đơn giá:</div>
                          <div className="value-item">
                            {finalPrice
                              ? finalPrice.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                              : "N/A"}
                            {khuyenmai > 0 && ` (Giảm ${khuyenmai}%)`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Không có sản phẩm trong đơn hàng.</p>
              )}
            </div>
            <div className="user-cart-form-info-table-price">
              <div className="price-item">
                <div className="label">Tổng sản phẩm:</div>
                <div className="value">
                  {selectedOrder?.orderInfo?.length || 0}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Tổng tiền hàng (sau giảm giá):</div>
                <div className="value">
                  {selectedOrder?.totalPriceAfterPromo?.toLocaleString(
                    "vi-VN",
                    {
                      style: "currency",
                      currency: "VND",
                    }
                  ) || "0 ₫"}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phí vận chuyển:</div>
                <div className="value">
                  {selectedOrder?.shippingFee?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }) || "0 ₫"}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Tổng thanh toán:</div>
                <div className="value">
                  {selectedOrder?.totalPayment?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }) || "0 ₫"}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phương thức thanh toán:</div>
                <div className="value">
                  {selectedOrder?.PaymentType || "N/A"}
                </div>
              </div>
            </div>
          </form>
        );
      default:
        return null;
    }
  }

  render() {
    const { actionPage } = this.state;
    return (
      <div className="user-page">
        <Header
          navigate={this.props.navigate}
          cartItems={this.props.cartItems}
          userInfo={this.props.userInfo}
        />
        <div className="user-container">
          <div className="user-action-form">
            <div
              className={`user-action-info ${actionPage === 1 ? "active" : ""}`}
              onClick={this.handleFormHoSoNguoiDung}
            >
              Hồ sơ người dùng
            </div>
            <div
              className={`user-action-cart ${actionPage === 2 ? "active" : ""}${actionPage === 4 ? "active" : ""
                }`}
              onClick={this.handleFormLichSuDonHang}
            >
              Lịch sử đơn hàng
            </div>
            <div
              className={`user-action-change-pw ${actionPage === 3 ? "active" : ""
                }`}
              onClick={this.handleFormDoiMatKhau}
            >
              Đổi mật khẩu
            </div>
          </div>
          <div className="user-form">{this.renderForm()}</div>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  cartItems: state.cart.cartItems,
});
const mapDispatchToProps = (dispatch) => ({
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(User);
