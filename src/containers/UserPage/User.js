import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react";

import { eyeOutline, eyeOffOutline, chevronBack, pencil } from "ionicons/icons";

import "./User.scss";
import Spinner from '../../components/Spinner';
import Header from "../../components/HomeHeader";
import Footer from "../../components/HomeFooter";

import { handleGetAccountInfoApi, handleLogoutApi, handleChangeAccountInfoApi, handleChangePasswordApi } from "../../services/accountServices";
import { handleGetAccountInvoiceInfoApi, handleGetInvoiceDetailInfoApi } from "../../services/invoiceServices"
import { uploadImageToCloudinaryApi, handleGetAllCodesApi } from "../../services/utilitiesServices";

import { userLogin, userLogout } from "../../store/actions";
import { checkLoginStatus } from '../../utils/pakage';

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      actionPage: 1,
      editField: null, // Theo dõi trường đang chỉnh sửa (ví dụ: "username", "phone", ...)
      originalValue: "",
      userimage: null,
      accountid: "",
      accountname: "",
      username: "",
      phone: "",
      address: "",
      gender: "",
      email: "",
      codeGender: [],
      codePaymentType: [],
      codeShippingMethod: [],
      codePaymentStatus: [],
      codeShippingStatus: [],
      fileToUpload: null,
      isUploading: false,
      triggerLoadInformation: false,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      loadedInvoiceInfo: [],
      selectedInvoiceID: null,
      loadedInvoiceDetail: null,
    };
    this.handlePreviceUserImage = this.handlePreviceUserImage.bind(this);
    this.handleUploadUserImage = this.handleUploadUserImage.bind(this);
    this.handleUpdateAccountInfo = this.handleUpdateAccountInfo.bind(this);
  }

  async componentDidMount() {
    await this.handleLoadCodeGender();
    await this.handleLoadPaymentType();
    await this.handleLoadShippingMethod();
    await this.handleLoadPaymentStatus();
    await this.handleLoadShippingStatus();
    await this.handleIsLogin();
    if (this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        const { accountid } = this.state
        this.loadAccountInfo(accountid)
        this.loadInvoiceInfo(accountid)
        //loading thông tin người dùng và lịch sử mua hàng
        this.setState({ isLoading: false })
      }, 10)
      setTimeout(() => {
        console.log(this.state)
      }, 100)
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        this.loadAccountInfo();
        this.loadInvoiceInfo();
      }, 10)
    }
  }
  componentWillUnmount() {
    if (this.state.userimage && this.state.fileToUpload) {
      URL.revokeObjectURL(this.state.userimage);
    }
  }
  handleIsLogin = async () => {
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          isLoggedIn: true,
          accountid: accountInfo.AccountID
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          isLoggedIn: false,
          accountid: "",
        });
        this.props.navigate("/login")
      }
    } catch (e) {
      this.props.navigate("/login");
      console.log("Token not found!")
    }
  };
  triggerLoadInformation = () => {
    this.setState((prevState) => ({
      triggerLoadInformation: !prevState.triggerLoadInformation,
    }));
  };
  handleLoadPaymentType = async () => {
    try {
      const codePaymentType = await handleGetAllCodesApi('PaymentType');
      if (!codePaymentType || codePaymentType.length === 0) {
        toast.error("Không thể tải phương thức thanh toán!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePaymentType,
      });
    } catch (e) {
      console.log("Error loading paymenttype code:", e);
      toast.error("Lỗi khi tải phương thức thanh toán!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleLoadShippingMethod = async () => {
    try {
      const codeShippingMethod = await handleGetAllCodesApi('ShippingMethod');
      if (!codeShippingMethod || codeShippingMethod.length === 0) {
        toast.error("Không thể tải cách thức vận chuyển!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeShippingMethod,
      });
    } catch (e) {
      console.log("Error loading shippingmethod code:", e);
      toast.error("Lỗi khi tải cách thức vận chuyển!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleLoadPaymentStatus = async () => {
    try {
      const codePaymentStatus = await handleGetAllCodesApi('PaymentStatus');
      if (!codePaymentStatus || codePaymentStatus.length === 0) {
        toast.error("Không thể tải trạng thái thanh toán!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePaymentStatus,
      });
    } catch (e) {
      console.log("Error loading paymentstatus code:", e);
      toast.error("Lỗi khi tải trạng thái thanh toán!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleLoadShippingStatus = async () => {
    try {
      const codeShippingStatus = await handleGetAllCodesApi('ShippingStatus');
      if (!codeShippingStatus || codeShippingStatus.length === 0) {
        toast.error("Không thể tải trạng thái vận chuyển!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeShippingStatus,
      });
    } catch (e) {
      console.log("Error loading shippingstatus code:", e);
      toast.error("Lỗi khi tải trạng thái vận chuyển!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  loadAccountInfo = async (accountid) => {
    try {
      const response = await handleGetAccountInfoApi(accountid);
      if (response && response.errCode === 0) {
        const accountInfo = response.data
        this.setState({
          accountname: accountInfo.AccountName,
          email: accountInfo.Email,
          username: accountInfo.UserName,
          phone: accountInfo.Phone,
          address: accountInfo.Address,
          gender: accountInfo.Gender,
          userimage: accountInfo.UserImage
        })
      } else {
        toast.error("Bạn đã được đăng xuất!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log("Lỗi khi tải tài khoản:", e);
      toast.error("Lỗi khi tải tài khoản!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  loadInvoiceInfo = async (accountid) => {
    try {
      const response = await handleGetAccountInvoiceInfoApi(accountid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedInvoiceInfo: response.data
        })
      } else {
        toast.error("Tải thông tin đơn hàng thất bại!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log("Lỗi khi tải thông tin đơn hàng:", e);
      toast.error("Lỗi khi tải thông tin đơn hàng!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleLoadCodeGender = async () => {
    try {
      const codeGender = await handleGetAllCodesApi('Gender');
      if (!codeGender || codeGender.length === 0) {
        toast.error("Không thể tải danh sách giới tính!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeGender,
        gender: codeGender.length > 0 ? codeGender[0].Code : "",
      });
    } catch (e) {
      console.log("Error loading gender code:", e);
      toast.error("Lỗi khi tải danh sách giới tính!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handlePreviceUserImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File info:", file.name, file.size, file.type);
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      console.log("Preview URL:", previewUrl);
      this.setState({
        userimage: previewUrl,
        fileToUpload: file,
      });
    } else {
      console.log("Không có file được chọn!");
    }
  };
  handleEditClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state[field], // Lưu giá trị ban đầu của trường
    });
  };
  handleUploadUserImage = async () => {
    const { fileToUpload } = this.state;
    if (!fileToUpload) {
      toast.error("Vui lòng chọn ảnh trước!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    try {
      console.log(
        "Gửi yêu cầu upload ảnh lên Cloudinary:",
        fileToUpload.name,
        fileToUpload.size
      );
      const response = await uploadImageToCloudinaryApi(fileToUpload);
      console.log("Kết quả upload từ Cloudinary:", response);
      if (response && response.errCode === 0) {
        const { secure_url } = response.data;
        this.setState({
          userimage: secure_url,
          fileToUpload: null,
        });
        return response.data;
      } else {
        console.error("Lỗi từ Cloudinary:", response.errMessage, response);
        toast.error(response.errMessage || "Tải ảnh lên Cloudinary thất bại!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (error) {
      console.error("Chi tiết lỗi khi tải ảnh:", error.message);
      toast.error(error.message || "Lỗi kết nối, vui lòng thử lại!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleAccountInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === "gender" && this.state.editField !== "gender") {
      this.setState({
        editField: "gender",
        originalValue: this.state.gender, // Lưu giá trị ban đầu của gender
      });
    }
    this.setState({
      [name]: value,
    });
  }
  toggleShowPassword = (field) => {
    this.setState((prevState) => ({
      [field]: !prevState[field],
    }));
  };
  handleUpdateAccountInfo = async (e) => {
    e.preventDefault();
    const { fileToUpload, isUploading, editField, originalValue, accountid, accountname, username, phone, address, gender, email } = this.state;
    let updateInfo = {
      accountid: accountid,
      accountname: accountname,
      username: username,
      phone: phone,
      address: address,
      gender: gender,
      email: email,
    };
    let hasChanges = false;
    // Xử lý upload ảnh nếu có fileToUpload
    if (fileToUpload) {
      if (isUploading) {
        toast.info("Đang tải ảnh, vui lòng chờ!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }
      this.setState({ isUploading: true, isLoading: true });
      try {
        const imageData = await this.handleUploadUserImage();
        if (imageData) {
          const userIMG = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
            original_filename: imageData.original_filename,
            format: imageData.format,
            created_at: imageData.created_at,
          };
          // Cập nhật anhdaidien trong updateInfo thành userIMG
          updateInfo.userimage = userIMG;
          hasChanges = true; // Có upload ảnh, đánh dấu là có thay đổi
        }
      } finally {
        this.setState({ isUploading: false, isLoading: false });
      }
    }
    // Kiểm tra xem có thay đổi dữ liệu không
    if (editField) {
      const newValue = this.state[editField];
      if (originalValue !== newValue) {
        hasChanges = true;
      }
    }
    const accountName = updateInfo.accountname.trim();
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    if (!accountNameRegex.test(accountName)) {
      toast.error("Tên tài khoản không hợp lệ!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      this.loadAccountInfo(accountid)
      return;
    }
    const phoneNumber = updateInfo.phone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      this.loadAccountInfo(accountid)
      return;
    }
    if (hasChanges) {
      let response = await handleChangeAccountInfoApi(updateInfo);
      if (response && response.errCode === 0) {
        toast.success(
          "Cập nhật thông tin thành công!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
        this.triggerLoadInformation();
      } else {
        toast.error(response.errMessage, {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
        this.loadAccountInfo(accountid)
      }
    }
    this.setState({ editField: null, originalValue: "" });
  }
  handleFormHoSoNguoiDung = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 1, editField: null });
  };
  handleFormLichSuDonHang = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 2, selectedInvoiceID: null });
  };
  handleFormDoiMatKhau = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 3 });
  };
  handleFormChiTietDonHang = async (invoiceid) => {
    try {
      const response = await handleGetInvoiceDetailInfoApi(invoiceid)
      if (response && response.errCode === 0) {
        this.setState({ actionPage: 4, selectedInvoiceID: invoiceid, loadedInvoiceDetail: response.data });
      } else {
        toast.error(response.errMessage, {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      this.setState({ actionPage: 4, selectedInvoiceID: invoiceid, loadedInvoiceDetail: null });
      toast.error("Lỗi khi lấy chi tiết đơn hàng!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleChangePasswordInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleChangePassword = async (e) => {
    e.preventDefault();
    const { accountid, oldPassword, newPassword, confirmPassword } = this.state;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    const checkNewPassword = newPassword.trim();
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(checkNewPassword)) {
      toast.error("Mật khẩu mới không hợp lệ!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    try {
      this.setState({ isLoading: true })
      const response = await handleChangePasswordApi(accountid, oldPassword, newPassword)
      if (response && response.errCode === 0) {
        toast.success("Đổi mật khẩu thành công, hãy đăng nhập lại với mật khẩu mới", {
          position: "top-right",
          autoClose: 1000,
          closeOnClick: true,
        });
        this.setState({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          handleLogoutApi();
          this.props.userLogout();
          this.setState({
            isLoggedIn: false,
            accountid: "",
          });
          this.props.navigate("/login")
        }, 1001);
      } else {
        toast.error(response.errMessage, {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      toast.error("Đổi mật khẩu thất bại!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false })
  };
  handleCancelInvoice = (invoiceid) => {
    console.log(invoiceid)
  }
  handleConfirmReceived = (invoiceid) => {
    console.log(invoiceid)
  }
  renderForm() {
    const { actionPage, oldPassword, newPassword, confirmPassword, editField, codePaymentType, codeShippingMethod, codePaymentStatus, codeShippingStatus,
      userimage, accountname, username, phone, address, gender, email, codeGender, loadedInvoiceInfo } = this.state
    switch (actionPage) {
      case 1:
        return (
          <form className="user-info-form" onSubmit={this.handleUpdateAccountInfo}>
            <h3>
              <b>Thông tin người dùng:</b>
            </h3>
            <div className="user-info-form-content">
              <div className="user-content-left">
                <div className="user-info-tab">
                  <div className="descreption-user">Tên tài khoản:</div>
                  {editField === "accountname" ? (
                    <input
                      type="text"
                      name="accountname"
                      value={accountname}
                      onChange={this.handleAccountInfoChange}
                      className="value-user-input"
                    />
                  ) : (
                    <div className="value-user">{accountname}</div>
                  )}
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => this.handleEditClick("accountname")}
                  >
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Họ và tên:</div>
                  {editField === "username" ? (
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={this.handleAccountInfoChange}
                      className="value-user-input"
                    />
                  ) : (
                    <div className="value-user">{username}</div>
                  )}
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => this.handleEditClick("username")}
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
                      value={phone}
                      onChange={this.handleAccountInfoChange}
                      className="value-user-input"
                    />
                  ) : (
                    <div className="value-user">{phone}</div>
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
                      value={address}
                      onChange={this.handleAccountInfoChange}
                      className="value-user-input"
                    />
                  ) : (
                    <div className="value-user">{address}</div>
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
                    {codeGender.map((item) => (
                      <label key={item.Code} className="gender-radio">
                        <input
                          type="radio"
                          name="gender"
                          value={item.Code}
                          checked={gender === item.Code}
                          onChange={this.handleAccountInfoChange}
                        />
                        {item.CodeValueVI}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Email:</div>
                  <div className="value-user email">{email}</div>
                </div>
                <div
                  className="change-info-button"
                  onSubmit={this.handleUpdateAccountInfo}
                >
                  <button> Cập nhật </button>
                </div>
              </div>
              <div className="user-content-right">
                <div className="user-content-right-img-content">
                  <div className="user-content-img-description">
                    Ảnh đại diện
                  </div>
                  <div className="user-content-img-info">
                    <img
                      className="user-content-img-info"
                      src={userimage}
                      alt="User avatar"
                    />
                  </div>
                </div>
                <div className="user-content-img-button">
                  <input
                    type="file"
                    accept="image/*"
                    id="upload-avatar"
                    onChange={this.handlePreviceUserImage}
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
              <b>Lịch sử đơn hàng:</b>
            </h3>
            <div className="user-cart-form-content">
              <div className="order-list">
                {loadedInvoiceInfo.length > 0 ? (
                  loadedInvoiceInfo.map((invoice, index) => (
                    <div
                      key={index}
                      className={`order-list-object ${actionPage === 4 ? "active" : ""
                        }`}
                      onClick={() => this.handleFormChiTietDonHang(invoice.InvoiceID)}
                    >
                      <div className="order-list-object-top">
                        <div className="oder-list-descreption-left">
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Mã đơn hàng:</b>
                            </div>
                            <div className="value-oder">{invoice.InvoiceID}</div>
                          </div>
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Ngày mua hàng:</b>
                            </div>
                            <div className="value-oder">
                              {new Date(
                                invoice.CreatedAt
                              ).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <div className="oder-list-descreption-right">
                          {invoice.CanceledAt ? (
                            <div className="order-info-tab">
                              <div className="descreption-order"><b>Ngày hủy:</b></div>
                              <div className="value-oder">
                                {new Date(invoice.CanceledAt).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="order-info-tab">
                                <div className="descreption-order"><b>Tình trạng thanh toán:</b></div>
                                <div className="value-oder">
                                  {codePaymentStatus?.find((method) => method.Code === invoice.PaymentStatus)?.CodeValueVI || "N/A"}
                                </div>
                              </div>
                              <div className="order-info-tab">
                                <div className="descreption-order"><b>Tình trạng giao hàng:</b></div>
                                <div className="value-oder">
                                  {codeShippingStatus?.find((method) => method.Code === invoice.ShippingStatus)?.CodeValueVI || "N/A"}
                                </div>
                              </div>
                            </div>
                          )}
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
                                {invoice.ReceiverName}
                              </div>
                            </div>
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>SĐT nhận hàng:</b>
                              </div>
                              <div className="value-item">
                                {invoice.ReceiverPhone}
                              </div>
                            </div>
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>Địa chỉ nhận hàng:</b>
                              </div>
                              <div className="value-item">
                                {invoice.ReceiverAddress}
                              </div>
                            </div>
                          </div>
                          <div className="order-list-object-item-center">
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                Số lượng mặt hàng:
                              </div>
                              <div className="value-item">
                                <b>{invoice.TotalQuantity}</b>
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
                                {parseFloat(invoice.TotalPayment).toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                              </b>
                            </div>
                          </div>
                          {invoice.CanceledAt === null && invoice.ShippingStatus === "PEND" && (
                            <button
                              type="button"
                              className="cancel-order-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.handleCancelInvoice(invoice.InvoiceID);
                              }}
                            >
                              Hủy đơn hàng
                            </button>
                          )}
                          {invoice.CanceledAt === null &&
                            invoice.PaymentStatus === "PAID" &&
                            invoice.ShippingStatus === "PEND" && (
                              <button
                                type="button"
                                className="received-order-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleConfirmReceived(invoice.InvoiceID);
                                }}
                              >
                                Đã nhận hàng
                              </button>
                            )}
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
            onSubmit={this.handleChangePassword}
          >
            <h3>
              <b>Đổi mật khẩu:</b>
            </h3>
            <div className="user-change-pw-form-content">
              <label>Mật khẩu cũ:</label>
              <div className="user-change-pw-form-content-input">
                <input
                  type={this.state.showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={oldPassword}
                  onChange={this.handleChangePasswordInputChange}
                  placeholder="Nhập mật khẩu cũ"
                  required
                />
                <IonIcon
                  icon={this.state.showOldPassword ? eyeOffOutline : eyeOutline}
                  className="password-toggle-icon"
                  onClick={() => this.toggleShowPassword("showOldPassword")}
                />
              </div>
              <label>Mật khẩu mới:</label>
              <div className="user-change-pw-form-content-input">
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={this.handleChangePasswordInputChange}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <IonIcon
                  icon={this.state.showNewPassword ? eyeOffOutline : eyeOutline}
                  className="password-toggle-icon"
                  onClick={() => this.toggleShowPassword("showNewPassword")}
                />
              </div>
              <label>Xác nhận mật khẩu mới:</label>
              <div className="user-change-pw-form-content-input">
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={this.handleChangePasswordInputChange}
                  placeholder="Xác nhận mật khẩu"
                  required
                />
                <IonIcon
                  icon={this.state.showConfirmPassword ? eyeOffOutline : eyeOutline}
                  className="password-toggle-icon"
                  onClick={() => this.toggleShowPassword("showConfirmPassword")}
                />
              </div>
            </div>
            <div className="button-submit">
              <button type="submit">Cập nhật</button>
            </div>
          </form>
        );
      case 4:
        const { loadedInvoiceDetail, selectedInvoiceID } = this.state;
        if (!loadedInvoiceDetail) {
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
                    <h5>{selectedInvoiceID || "N/A"}</h5>
                  </div>
                </div>
                <div className="tt">
                  <h5 style={{ color: loadedInvoiceDetail?.ShippingStatus === "DELI" ? "green" : "inherit" }}>
                    {codeShippingStatus?.find((status) => status.Code === loadedInvoiceDetail?.ShippingStatus)?.CodeValueVI || "N/A"}
                  </h5>
                </div>
              </div>
            </div>
            <div className="user-cart-form-info-address">
              <div className="user-info-tab">
                <div className="descreption-user">Địa chỉ nhận hàng:</div>
                <div className="value-user">
                  {loadedInvoiceDetail?.ReceiverAddress || "N/A"}
                </div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">Tên người nhận hàng:</div>
                <div className="value-user">
                  {loadedInvoiceDetail?.ReceiverName || "N/A"}
                </div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">SĐT nhận hàng:</div>
                <div className="value-user">
                  {loadedInvoiceDetail?.ReceiverPhone || "N/A"}
                </div>
              </div>
            </div>
            <div className="user-cart-form-info-list-item">
              {loadedInvoiceDetail?.ProductList?.length > 0 ? (
                loadedInvoiceDetail.ProductList.map((item, index) => (
                  <div key={index} className="user-cart-form-info-list-item-row">
                    <div className="user-cart-form-info-list-item-left">
                      <div className="img-product">
                        <img
                          src={item?.ProductImage || ""}
                          alt="Product"
                          style={{ width: "100px", height: "100px" }}
                        />
                      </div>
                    </div>
                    <div className="user-cart-form-info-list-item-center">
                      <div className="item-info-tab">
                        <div className="descreption-item">Sản phẩm:</div>
                        <div className="value-item">{item?.ProductName || "N/A"}</div>
                      </div>
                      <div className="item-info-tab">
                        <div className="descreption-item">Loại:</div>
                        <div className="value-item">{item?.DetailName || "N/A"}</div>
                      </div>
                    </div>
                    <div className="user-cart-form-info-list-item-right">
                      <div className="item-info-tab">
                        <div className="descreption-item">Số lượng:</div>
                        <div className="value-item"><b>{item?.ItemQuantity || "N/A"}</b></div>
                      </div>
                      <div className="item-info-tab">
                        <div className="descreption-item">Đơn giá:</div>
                        <div className="value-item">
                          {item?.ItemPrice
                            ? item.ItemPrice.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có sản phẩm trong đơn hàng.</p>
              )}
            </div>
            <div className="user-cart-form-info-table-price">
              <div className="price-item">
                <div className="label">Tổng sản phẩm:</div>
                <div className="value">{loadedInvoiceDetail?.TotalQuantity || 0}</div>
              </div>
              <div className="price-item">
                <div className="label">Tổng tiền hàng:</div>
                <div className="value">
                  {parseFloat(loadedInvoiceDetail?.TotalPrice).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }) || "0 ₫"}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phí vận chuyển:</div>
                <div className="value">
                  {(() => {
                    const shipping = codeShippingMethod?.find(
                      (method) => method.Code === loadedInvoiceDetail?.ShippingMethod
                    );
                    return shipping
                      ? parseFloat(shipping.ExtraValue).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                      : "0 ₫";
                  })()}
                </div>
              </div>
              {parseFloat(loadedInvoiceDetail?.DiscountAmount) > 0 && (
                <div className="price-item">
                  <div className="label">Giảm giá từ coupon:</div>
                  <div className="value">
                    -{parseFloat(loadedInvoiceDetail?.DiscountAmount).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }) || "0 ₫"}
                  </div>
                </div>
              )}
              <div className="price-item">
                <div className="label">Tổng thanh toán:</div>
                <div className="value">
                  {parseFloat(loadedInvoiceDetail?.TotalPayment).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }) || "0 ₫"}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phương thức thanh toán:</div>
                <div className="value">
                  {(() => {
                    const payment = codePaymentType?.find(
                      (method) => method.Code === loadedInvoiceDetail?.PaymentType
                    );
                    return payment ? payment.CodeValueVI : "N/A";
                  })()}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phương thức vận chuyển:</div>
                <div className="value">
                  {(() => {
                    const shipping = codeShippingMethod?.find(
                      (method) => method.Code === loadedInvoiceDetail?.ShippingMethod
                    );
                    return shipping ? shipping.CodeValueVI : "N/A";
                  })()}
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
    const { actionPage, isLoading } = this.state;
    return (
      <div className="user-page">
        <Header
          navigate={this.props.navigate}
          userInfo={this.props.userInfo}
          triggerLoadInformation={this.state.triggerLoadInformation}
        />
        <ToastContainer />
        {isLoading ? <Spinner /> : (
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
        )}
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});
const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(User);