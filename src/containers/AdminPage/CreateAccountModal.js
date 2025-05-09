import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import { mailOutline, eyeOffOutline, peopleCircleOutline, eyeOutline, person, call, location, maleFemaleOutline, keyOutline } from "ionicons/icons"; //chỉ import các icon cần dùng
import "./CreateAccountModal.scss";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { handleGetAllCodesApi } from "../../services/utilitiesServices"

class CreateAccountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounttype: "",
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
      codeAccountType: [],
    };
  }
  async componentDidMount() {
    await this.handleLoadCodeGender();
    await this.handleLoadCodeAccountType();
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
  handleLoadCodeAccountType = async () => {
    try {
      const codeAccountType = await handleGetAllCodesApi('AccountType');
      if (!codeAccountType || codeAccountType.length === 0) {
        toast.error("Không thể tải danh sách phân quyền!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeAccountType,
        accounttype: codeAccountType.length > 0 ? codeAccountType[0].Code : "",
      });
    } catch (e) {
      console.log("Error loading accounttype code:", e);
      toast.error("Lỗi khi tải danh sách phân quyền!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  toggle = async () => {
    await this.handleLoadCodeGender();
    await this.handleLoadCodeAccountType();
    this.setState({
      accountname: "",
      email: "",
      password: "",
      username: "",
      phone: "",
      address: "",
      confirmPassword: "",
      isTogglePassword1: false,
      isTogglePassword2: false,
    });
    this.props.toggleFromModal();
  };
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
  //gọi hàm tạo người dùng ở admin
  handleCreateAccount = () => {
    let isValidateInput = this.checkValidateInput();
    if (isValidateInput.errCode === 0) {
      const { accounttype, accountname, email, password, username, phone, address, gender } = this.state
      this.props.handleCreateAccountFromModal({
        accounttype: accounttype,
        accountname: accountname,
        email: email,
        password: password,
        username: username,
        phone: phone,
        address: address,
        gender: gender,
      });
    } else {
      toast.error(isValidateInput.errMessage, {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true
      });
    }
  };
  render() {
    const { isOpen } = this.props;
    const { accounttype, accountname, email, password, username, phone, address, gender,
      confirmPassword, isTogglePassword1, isTogglePassword2, codeGender, codeAccountType } = this.state;
    return (
      <Modal
        show={isOpen}
        onHide={this.toggle}
        className="create-user-modal"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tạo người dùng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
            <div className="selectbox">
              <label>Phân quyền</label>
              <select
                value={accounttype}
                onChange={(event) =>
                  this.handleOnChangeInput(event, "accounttype")}
              >
                {codeAccountType.length > 0 ? (
                  codeAccountType.map((item) => (
                    <option key={item.Code} value={item.Code}>
                      {item.CodeValueVI}
                    </option>
                  ))
                ) : (
                  <option value="">Không có dữ liệu phân quyền</option>
                )}
              </select>
              <IonIcon icon={peopleCircleOutline}></IonIcon>
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
          <div className="R2">
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleCreateAccount}>
            Lưu
          </Button>
          <Button variant="primary" onClick={this.toggle}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccountModal);
