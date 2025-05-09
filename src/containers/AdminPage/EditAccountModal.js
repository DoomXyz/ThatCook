import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import { mailOutline, person, call, keyOutline, location, personOutline, maleFemaleOutline, extensionPuzzleOutline, peopleCircleOutline } from "ionicons/icons"; //chỉ import các icon cần dùng
import "./EditAccountModal.scss";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import _ from "lodash";

import { handleGetAccountInfoApi } from "../../services/accountServices"
import { handleGetAllCodesApi } from "../../services/utilitiesServices"


class EditAccountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedAccountInfo: null,
      selectedAccountID: null,
      accounttype: "",
      accountname: "",
      email: "",
      username: "",
      phone: "",
      address: "",
      gender: "",
      codeGender: [],
      codeAccountType: [],
    };
  }
  async componentDidMount() {
    await this.handleLoadCodeGender();
    await this.handleLoadCodeAccountType();
    const { selectedAccountID } = this.props
    if (selectedAccountID) {
      this.loadAccountInfo(selectedAccountID);
    }
  }
  async componentDidUpdate(prevProps) {
    const { selectedAccountID, isOpen } = this.props
    if (isOpen && !prevProps.isOpen) {
      await this.handleLoadCodeGender();
      await this.handleLoadCodeAccountType();
      this.setState({
        loadedAccountInfo: null,
        accountname: "",
        email: "",
        username: "",
        phone: "",
        address: "",
      });
      if (selectedAccountID) {
        this.loadAccountInfo(selectedAccountID);
      }
    }
  }
  loadAccountInfo = async (accountid) => {
    try {
      const response = await handleGetAccountInfoApi(accountid);
      if (response && response.errCode === 0) {
        const accountInfo = response.data
        this.setState({
          loadedAccountInfo: accountInfo,
          selectedAccountID: accountInfo.AccountID,
          accounttype: accountInfo.AccountType,
          accountname: accountInfo.AccountName,
          email: accountInfo.Email,
          username: accountInfo.UserName,
          phone: accountInfo.Phone,
          address: accountInfo.Address,
          gender: accountInfo.Gender,
        })
      } else {
        this.setState({
          loadedAccountInfo: null,
          accounttype: "",
          accountname: "",
          email: "",
          username: "",
          phone: "",
          address: "",
          gender: "",
        });
        toast.error("Tải tài khoản thất bại!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log("Lỗi khi tải tài khoản:", e);
      this.setState({
        loadedAccountInfo: null,
        accounttype: "",
        accountname: "",
        email: "",
        username: "",
        phone: "",
        address: "",
        gender: "",
      });
      toast.error("Lỗi khi tải tài khoản!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
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
      username: "",
      phone: "",
      address: "",
    });
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
    const { accountname, username, phone, address, gender, codeGender } = this.state;
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/; //chứa chữ cái, số hoặc khoảng trắng, dài từ 2-50 ký tự
    const phoneRegex = /^[0-9]{10,11}$/; //chỉ chứa số và có độ dài từ 10-11 ký tự

    if (!accountname) return { errCode: -1, errMessage: "Tên tài khoản trống!" };
    if (!accountNameRegex.test(accountname)) return { errCode: 1, errMessage: "Tên tài khoản sai định dạng!" };

    if (!username) return { errCode: -1, errMessage: "Tên người dùng trống!" };
    if (!userNameRegex.test(username)) return { errCode: 1, errMessage: "Tên người dùng không hợp lệ!" };

    if (!phone) return { errCode: -1, errMessage: "Số điện thoại trống!" };
    if (!phoneRegex.test(phone)) return { errCode: 1, errMessage: "Số điện thoại không hợp lệ!" };

    if (!address) return { errCode: -1, errMessage: "Địa chỉ trống!" }

    const validGenderCode = codeGender.map(item => item.Code);
    if (!gender) return { errCode: -1, errMessage: "Giới tính không tồn tại!" };
    if (!validGenderCode.includes(gender)) return { errCode: 1, errMessage: "Giới tính không hợp lệ!" };

    return { errCode: 0, errMessage: "Kiểm tra thông tin hoàn tất!" };
  };
  handleEditAccount = async () => {
    const confirmEdit = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận sửa chỉnh sửa thông tin người dùng?</p>
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
    let isConfirmed = await confirmEdit();
    if (isConfirmed) {
      let isValidateInput = this.checkValidateInput();
      if (isValidateInput.errCode === 0) {
        const { selectedAccountID, accounttype, accountname, username, phone, address, gender } = this.state
        this.props.handleEditAccountFromModal({
          accountid: selectedAccountID,
          accounttype: accounttype,
          accountname: accountname,
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
    }
  };
  render() {
    const { isOpen } = this.props;
    const { loadedAccountInfo, email, accounttype, username, phone, accountname, gender, address, codeGender, codeAccountType } = this.state
    if (!loadedAccountInfo) {
      return (
        <Modal show={isOpen}
          onHide={this.toggle}
          className="edit-user-modal"
          centered
          backdrop="static"
        >
          <Modal.Body>Không tìm thấy thông tin tài khoản.</Modal.Body>
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
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={mailOutline}></IonIcon>
              <input
                type="email"
                placeholder=""
                value={email}
                disabled
              />
              <label>Email</label>
            </div>
            <div className="selectbox">
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
          <Button variant="secondary" onClick={this.handleEditAccount}>
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

export default connect(mapStateToProps, mapDispatchToProps)(EditAccountModal);
