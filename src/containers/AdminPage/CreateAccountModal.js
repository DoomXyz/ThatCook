import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import {
  mailOutline,
  eyeOffOutline,
  eyeOutline,
  person,
  call,
  location,
  personOutline,
} from "ionicons/icons"; //chỉ import các icon cần dùng
import "./CreateAccountModal.scss";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { emitter } from "../../utils/emitter";

class AdminCreateUserModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoten: "",
      sdt: "",
      diachi: "",
      gender: "M",
      accounttype: "C",
      email: "",
      password: "",
      confirmPassword: "",
      isTogglePassword1: false,
      isTogglePassword2: false,
    };
    this.listenToEmitter();
  }
  //emitter xóa hết dữ liệu khi mở lại modal
  listenToEmitter() {
    emitter.on("EVENT_CLEAR_MODAL_DATA", () => {
      this.setState({
        hoten: "",
        sdt: "",
        diachi: "",
        gender: "M",
        accounttype: "C",
        email: "",
        password: "",
        confirmPassword: "",
        isTogglePassword1: false,
        isTogglePassword2: false,
      });
    });
  }
  //tắt modal
  toggle = () => {
    this.props.toggleFromModal();
  };
  //ẩn hiện pass
  handleTogglePassword1 = () => {
    this.setState({
      isTogglePassword1: !this.state.isTogglePassword1,
    });
  };
  //ẩn hiện comfirmpass
  handleTogglePassword2 = () => {
    this.setState({
      isTogglePassword2: !this.state.isTogglePassword2,
    });
  };
  //quản lý state nhập
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };
  //kiểm tra dữ liệu
  checkValidateInput = () => {
    const { email, hoten, sdt, diachi, password, confirmPassword } = this.state;
    if (!email) {
      return {
        errCode: 1,
        errMessage: "Email không được bỏ trống!",
      };
    }
    if (!hoten) {
      return {
        errCode: 1,
        errMessage: "Họ tên không được bỏ trống!",
      };
    }
    if (!sdt) {
      return {
        errCode: 1,
        errMessage: "Số điện thoại không được bỏ trống!",
      };
    }
    if (!diachi) {
      return {
        errCode: 1,
        errMessage: "Địa chỉ không được bỏ trống!",
      };
    }
    if (!password) {
      return {
        errCode: 1,
        errMessage: "Mật khẩu không được bỏ trống!",
      };
    }
    if (password !== confirmPassword) {
      return {
        errCode: 1,
        errMessage: "Mật khẩu không trùng khớp!",
      };
    }
    return {
      errCode: 0,
      errMessage: "All corret!",
    };
  };
  //gọi hàm tạo người dùng ở admin
  handleAddNewUser = () => {
    let isValid = this.checkValidateInput();
    if (isValid.errCode === 0) {
      this.props.createNewUser(this.state);
    } else {
      toast.error(isValid.errMessage);
    }
  };
  render() {
    return (
      <Modal
        show={this.props.isOpen}
        onHide={this.toggle} //overdrive onHide -> this.toggle
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
              <IonIcon icon={person}></IonIcon>
              <input
                type="text"
                placeholder=""
                value={this.state.hoten}
                onChange={(event) => this.handleOnChangeInput(event, "hoten")}
              />
              <label>Họ Tên</label>
            </div>
            <div className="inputbox">
              <IonIcon icon={call}></IonIcon>
              <input
                type="tel"
                placeholder=""
                value={this.state.sdt}
                onChange={(event) => this.handleOnChangeInput(event, "sdt")}
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
                value={this.state.email}
                onChange={(event) => this.handleOnChangeInput(event, "email")}
              />
              <label>Email</label>
            </div>
            <div className="inputbox">
              <div
                className="toggle-password"
                onClick={() => this.handleTogglePassword1()}
              /*có thể để event onclick lồng vào ionicon bên dưới, xem ví dụ ở trang register*/
              >
                <IonIcon
                  icon={
                    this.state.isTogglePassword1 ? eyeOutline : eyeOffOutline
                  }
                ></IonIcon>
              </div>
              <input
                type={this.state.isTogglePassword1 ? "text" : "password"}
                placeholder=""
                value={this.state.password}
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
                value={this.state.gender}
                onChange={(event) => this.handleOnChangeInput(event, "gender")}
              >
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
                <option value="O">Khác</option>
              </select>
              <IonIcon icon={personOutline}></IonIcon>
            </div>
            <div className="inputbox">
              <div
                className="toggle-password"
                onClick={() => this.handleTogglePassword2()}
              >
                <IonIcon
                  icon={
                    this.state.isTogglePassword2 ? eyeOutline : eyeOffOutline
                  }
                ></IonIcon>
              </div>
              <input
                type={this.state.isTogglePassword2 ? "text" : "password"}
                placeholder=""
                value={this.state.confirmPassword}
                onChange={(event) =>
                  this.handleOnChangeInput(event, "confirmPassword")
                }
              />
              <label>Xác nhận mật khẩu</label>
            </div>
          </div>

          <div className="address R1">
            <div className="selectbox">
              <label>Phân quyền</label>
              <select
                value={this.state.accounttype}
                onChange={(event) =>
                  this.handleOnChangeInput(event, "accounttype")
                }
              >
                <option value="A">Admin</option>
                <option value="O">Chủ cửa hàng</option>
                <option value="C">Khách hàng</option>
              </select>
              <IonIcon icon={personOutline}></IonIcon>
            </div>
            <div className="inputbox">
              <IonIcon icon={location}></IonIcon>
              <input
                type="text"
                placeholder=""
                value={this.state.diachi}
                onChange={(event) => this.handleOnChangeInput(event, "diachi")}
              />
              <label>Địa chỉ</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleAddNewUser}>
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminCreateUserModal);
