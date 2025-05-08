import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import {
  mailOutline,
  person,
  call,
  location,
  personOutline,
  extensionPuzzleOutline
} from "ionicons/icons"; //chỉ import các icon cần dùng
import "./AdminEditUserModal.scss";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import _ from "lodash";

class AdminEditUserModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mataikhoan: "",
      email: "",
      hoten: "",
      sdt: "",
      gender: 'M',
      diachi: "",
      accounttype: 'C',
    };
  }
  componentDidMount() {
    if (this.props.currentUser) {
      this.loadThongTinTaiKhoan(this.props.currentUser);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({
        mataikhoan: "",
        email: "",
        hoten: "",
        sdt: "",
        gender: 'M',
        diachi: "",
        accounttype: 'C',
      });
      if (this.props.currentUser) {
        this.loadThongTinTaiKhoan(this.props.currentUser);
      }
    }
  }

  loadThongTinTaiKhoan = (userInfo) => {
    if (userInfo && !_.isEmpty(userInfo)) {
      this.setState({
        mataikhoan: userInfo.MATAIKHOAN,
        email: userInfo.Email,
        hoten: userInfo.HoTen,
        sdt: userInfo.SDT,
        gender: userInfo.Gender,
        diachi: userInfo.DiaChi,
        accounttype: userInfo.AccountType,
      });
    }
  }

  toggle = () => {
    this.props.toggleFromModal();
  };
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };
  checkValidateInput = () => {
    let arrInput = ["email", "hoten", "sdt", "diachi"];
    let textInput = ["Email", "Họ tên", "Số điện thoại", "Địa chỉ"];
    for (let i = 0; i < arrInput.length; i++) {
      if (!this.state[arrInput[i]]) {
        return textInput[i] + " không được bỏ trống!";
      }
    }
    return "";
  };
  handleEditUser = () => {
    let errMessage = this.checkValidateInput();
    if (!errMessage) {
      const confirmEdit = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>Bạn có chắc muốn chỉnh sửa thông tin không?</p>
              <button
                className="toast-confirm-btn"
                onClick={() => {
                  resolve(true);
                  toast.dismiss();
                }}
              >
                Có
              </button>
              <button
                className="toast-cancel-btn"
                onClick={() => {
                  resolve(false);
                  toast.dismiss();
                }}
              >
                Không
              </button>
            </div>,
            { position: "top-center", autoClose: 1000, closeOnClick: false }
          );
        });
      confirmEdit().then((isConfirmed) => {
        if (isConfirmed) {
          this.props.editUser(this.state);
        }
      });
    } else {
      toast.error(errMessage);
    }
  };
  render() {
    let userInfo = this.props.currentUser;
    if (!userInfo) {
      return (
        <Modal show={this.props.isOpen}
          onHide={this.toggle}
          className="edit-user-modal"
          centered
          backdrop="static"
        >
          <Modal.Body>Không tìm thấy tài khoản người dùng.</Modal.Body>
        </Modal>
      );
    }
    return (
      <Modal
        show={this.props.isOpen}
        onHide={this.toggle}
        className="edit-user-modal"
        centered
        backdrop="static"
      >
        <ToastContainer />
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="R1">
            <div className="selectbox">
              <label>Phân quyền</label>
              <select
                value={this.state.accounttype}
                onChange={(event) =>
                  this.handleOnChangeInput(event, "accounttype")
                }
                disabled
              >
                <option value="A">Admin</option>
                <option value="O">Chủ cửa hàng</option>
                <option value="C">Khách hàng</option>
              </select>
              <IonIcon icon={extensionPuzzleOutline}></IonIcon>
            </div>
            <div className="inputbox">
              <IonIcon icon={mailOutline}></IonIcon>
              <input
                type="email"
                placeholder=""
                value={this.state.email}
                onChange={(event) => this.handleOnChangeInput(event, "email")}
                disabled
              />
              <label>Email</label>
            </div>
          </div>
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
            <div className="selectbox">
              <label>Giới tính</label>
              <select
                value={this.state.gender}
                onChange={(event) =>
                  this.handleOnChangeInput(event, "gender")
                }
              >
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
                <option value="O">Khác</option>
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
          <Button variant="primary" onClick={this.handleEditUser}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AdminEditUserModal);
