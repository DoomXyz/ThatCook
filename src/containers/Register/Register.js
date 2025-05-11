import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react";
import { keyOutline, home, mailOutline, eyeOffOutline, eyeOutline, call, person, maleFemaleOutline, location, } from "ionicons/icons";
import Spinner from '../../components/Spinner';
import "./Register.scss";
import { handleRegisterApi } from "../../services/accountServices";
import { handleGetAllCodesApi } from "../../services/utilitiesServices"

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountname: "",
      email: "",
      password: "",
      username: "",
      phone: "",
      address: "",
      gender: "",
      confirmPassword: "",
      isTogglePassword1: false,
      isTogglePassword2: false,
      codeGender: [],
      isLoading: true,
    };
  }
  async componentDidMount() {
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
        isLoading: false
      });
    } catch (e) {
      console.log("Error loading gender code:", e);
      toast.error("Lỗi khi tải danh sách giới tính!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      this.setState({ isLoading: false });
    }
  }
  //ẩn hiện pass
  handleTogglePassword1 = () => {
    this.setState({ isTogglePassword1: !this.state.isTogglePassword1 });
  };
  //ẩn hiện confirmpass
  handleTogglePassword2 = () => {
    this.setState({ isTogglePassword2: !this.state.isTogglePassword2 });
  };
  //quản lý state nhập
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };
  //kiểm tra thông tin trc khi gửi đi
  checkValidateInput = () => {
    const { accountname, email, password, username, phone, address, gender, confirmPassword, codeGender } = this.state;
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;  //cần ít nhất 8 ký tự
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/; //chứa chữ cái, số hoặc khoảng trắng, dài từ 2-50 ký tự
    const phoneRegex = /^[0-9]{10,11}$/; //chỉ chứa số và có độ dài từ 10-11 ký tự

    if (!accountname) return { errCode: -1, errMessage: "Tên tài khoản trống!" };
    if (!accountNameRegex.test(accountname)) return { errCode: 1, errMessage: "Tên tài khoản sai định dạng!" };

    if (!email) return { errCode: -1, errMessage: "Email trống!" };
    if (!emailRegex.test(email)) return { errCode: 1, errMessage: "Email sai định dạng!" };

    if (!password) return { errCode: -1, errMessage: "Mật khẩu trống!" };
    if (!passwordRegex.test(password)) return { errCode: 1, errMessage: "Mật khẩu không hợp lệ! (Cần ít nhất 8 ký tự)" };

    if (!username) return { errCode: -1, errMessage: "Tên người dùng trống!" };
    if (!userNameRegex.test(username)) return { errCode: 1, errMessage: "Tên người dùng không hợp lệ!" };

    if (!phone) return { errCode: -1, errMessage: "Số điện thoại trống!" };
    if (!phoneRegex.test(phone)) return { errCode: 1, errMessage: "Số điện thoại không hợp lệ!" };

    if (!address) return { errCode: -1, errMessage: "Địa chỉ trống!" }

    const validGenderCode = codeGender.map(item => item.Code);
    if (!gender) return { errCode: -1, errMessage: "Giới tính không tồn tại!" };
    if (!validGenderCode.includes(gender)) return { errCode: 1, errMessage: "Giới tính không hợp lệ!" };

    if (password !== confirmPassword) return { errCode: 1, errMessage: "Mật khẩu không trùng khớp!" };

    return { errCode: 0, errMessage: "Kiểm tra thông tin hoàn tất!" };
  };
  //thực hiện đăng ký
  handleRegister = async (stateInfo) => {
    this.setState({ isLoading: true })
    let isValidateInput = this.checkValidateInput();
    if (isValidateInput.errCode !== 0) {
      toast.error(isValidateInput.errMessage, {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true
      });
      this.setState({ isLoading: false });
      return;
    }
    try {
      const userInfo = {
        accountname: stateInfo.accountname,
        email: stateInfo.email,
        password: stateInfo.password,
        username: stateInfo.username,
        phone: stateInfo.phone,
        address: stateInfo.address,
        gender: stateInfo.gender,
        accounttype: "C",
      };
      const response = await handleRegisterApi(userInfo);
      if (response && response.errCode === 0) {
        toast.success("Đăng ký tài khoản thành công!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
        setTimeout(() => this.props.navigate("/login"), 501);
      } else {
        const errMessage = response?.errMessage || "Đăng ký tài khoản thất bại!";
        toast.error(errMessage, {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
      }
    } catch (e) {
      console.error("Register:", e);
      toast.error("Xảy ra lỗi khi đăng ký, vui lòng thử lại!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true
      });
    }
    this.setState({
      isLoading: false
    })
  };
  render() {
    const { accountname, email, password, username, phone, address, gender, confirmPassword, isTogglePassword1, isTogglePassword2, codeGender, isLoading } = this.state
    return (
      <div className="body-register">
        <ToastContainer />
        {isLoading ? <Spinner /> : (
          <div className="register-container">
            <div className="form-container">
              <div className="home-button">
                <a
                  onClick={() => {
                    this.props.navigate("/home");
                  }}
                >
                  <IonIcon icon={home}></IonIcon>
                </a>
              </div>
              <div className="register-content">
                <h1>ĐĂNG KÝ</h1>
                <div className="single">
                  <div className="inputbox">
                    <IonIcon icon={keyOutline}></IonIcon>
                    <input
                      type="text"
                      placeholder=""
                      value={accountname}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "accountname")
                      }
                    />
                    <label>Tên tài khoản</label>
                  </div>
                </div>
                <div className="R1">
                  <div className="inputbox">
                    <IonIcon icon={person}></IonIcon>
                    <input
                      type="text"
                      placeholder=""
                      value={username}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "username")
                      }
                    />
                    <label>Họ Tên</label>
                  </div>
                  <div className="inputbox">
                    <IonIcon icon={call}></IonIcon>
                    <input
                      type="tel"
                      placeholder=""
                      value={phone}
                      onChange={(event) => this.handleOnChangeInput(event, "phone")}
                    />
                    <label>Số điện thoại</label>
                  </div>
                </div>
                <div className="R1">
                  <div className="inputbox">
                    <IonIcon icon={mailOutline}></IonIcon>
                    <input
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "email")
                      }
                    />
                    <label>Email</label>
                  </div>
                  <div className="inputbox">
                    <div className="toggle-password">
                      <IonIcon
                        icon={isTogglePassword1 ? eyeOutline : eyeOffOutline}
                        onClick={this.handleTogglePassword1}
                      ></IonIcon>
                    </div>
                    <input
                      type={isTogglePassword1 ? "text" : "password"}
                      placeholder=""
                      value={password}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "password")
                      }
                    />
                    <label>Mật khẩu</label>
                  </div>
                </div>
                <div className="R1">
                  <div className="selectbox">
                    <label>Giới tính</label>
                    <select
                      value={gender}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "gender")}
                    >
                      {codeGender.length > 0 ? (
                        codeGender.map((item) => (
                          <option key={item.Code} value={item.Code}>
                            {item.CodeValueVI}
                          </option>
                        ))
                      ) : (
                        <option value="">Không có dữ liệu giới tính</option>
                      )}
                    </select>
                    <IonIcon icon={maleFemaleOutline}></IonIcon>
                  </div>
                  <div className="inputbox">
                    <div className="toggle-password">
                      <IonIcon
                        icon={isTogglePassword2 ? eyeOutline : eyeOffOutline}
                        onClick={this.handleTogglePassword2}
                      ></IonIcon>
                    </div>
                    <input
                      type={isTogglePassword2 ? "text" : "password"}
                      placeholder=""
                      value={confirmPassword}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "confirmPassword")
                      }
                    />
                    <label>Xác nhận mật khẩu</label>
                  </div>
                </div>
                <div className="single">
                  <div className="inputbox">
                    <IonIcon icon={location}></IonIcon>
                    <input
                      type="text"
                      placeholder=""
                      value={address}
                      onChange={(event) =>
                        this.handleOnChangeInput(event, "address")
                      }
                    />
                    <label>Địa chỉ</label>
                  </div>
                </div>
                <button
                  className="register-button"
                  onClick={() => this.handleRegister(this.state)}
                >
                  <p>Đăng ký</p>
                </button>
                <div className="login">
                  <p>Đã có tài khoản? </p>
                  <a onClick={() => this.props.navigate("/login")}>Đăng nhập</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
