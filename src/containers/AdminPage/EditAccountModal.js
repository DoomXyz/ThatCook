import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon

import { mailOutline, person, call, keyOutline, location, maleFemaleOutline, peopleCircleOutline, informationCircleOutline, idCardOutline, invertModeOutline } from 'ionicons/icons';

import './EditAccountModal.scss';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { handleGetAccountInfoApi, handleGetVeterinarianInfoApi } from '../../services/accountServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';

class EditAccountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedAccountInfo: null,
      selectedAccountID: null,
      accounttype: '',
      accountname: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      bio: '',
      specialization: '',
      workingstatus: '',
      codeGender: [],
      codeAccountType: [],
      codeWorkingStatus: [],
    };
  }
  async componentDidMount() {
    await this.handleLoadCodeGender();
    await this.handleLoadCodeAccountType();
    await this.handleLoadCodeWorkingStatus();
    const { selectedAccountID } = this.props;
    if (selectedAccountID) {
      this.loadAccountInfo(selectedAccountID);
    }
  }
  async componentDidUpdate(prevProps) {
    const { selectedAccountID, isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      await this.handleLoadCodeGender();
      await this.handleLoadCodeAccountType();
      await this.handleLoadCodeWorkingStatus();
      this.resetState();
      if (selectedAccountID) {
        this.loadAccountInfo(selectedAccountID);
      }
    }
  }
  resetState = () => {
    this.setState({
      loadedAccountInfo: null,
      selectedAccountID: null,
      accounttype: '',
      accountname: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      bio: '',
      specialization: '',
      workingstatus: '',
    });
  };
  loadAccountInfo = async (accountid) => {
    try {
      const [accountResponse, vetResponse] = await Promise.all([handleGetAccountInfoApi(accountid), handleGetVeterinarianInfoApi(accountid)]);
      if (accountResponse && accountResponse.errCode === 0) {
        const accountInfo = accountResponse.data;
        const vetInfo = vetResponse && vetResponse.errCode === 0 ? vetResponse.data : null;
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
          bio: vetInfo ? vetInfo.Bio || '' : '',
          specialization: vetInfo ? vetInfo.Specialization || '' : '',
          workingstatus: vetInfo ? vetInfo.WorkingStatus || '' : '',
        });
      } else {
        this.resetState();
        toast.error('Tải tài khoản thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      this.resetState();
      toast.error('Lỗi khi tải tài khoản!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodeGender = async () => {
    try {
      const codeGender = await handleGetAllCodesApi('Gender');
      if (!codeGender || codeGender.length === 0) {
        toast.error('Không thể tải danh sách giới tính!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeGender,
        gender: codeGender.length > 0 ? codeGender[0].Code : '',
      });
    } catch (e) {
      console.log('Error loading gender code:', e);
      toast.error('Lỗi khi tải danh sách giới tính!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodeAccountType = async () => {
    try {
      const codeAccountType = await handleGetAllCodesApi('AccountType');
      if (!codeAccountType || codeAccountType.length === 0) {
        toast.error('Không thể tải danh sách phân quyền!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeAccountType,
        accounttype: codeAccountType.length > 0 ? codeAccountType[0].Code : '',
      });
    } catch (e) {
      console.log('Error loading accounttype code:', e);
      toast.error('Lỗi khi tải danh sách phân quyền!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodeWorkingStatus = async () => {
    try {
      const codeWorkingStatus = await handleGetAllCodesApi('WorkingStatus');
      if (!codeWorkingStatus || codeWorkingStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái làm việc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeWorkingStatus,
        workingstatus: codeWorkingStatus.length > 0 ? codeWorkingStatus[0].Code : '',
      });
    } catch (e) {
      console.log('Error loading working status code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái làm việc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  toggle = async () => {
    this.resetState();
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
    const { accountname, username, phone, address, gender, codeGender, specialization } = this.state;
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    const specializationRegex = /^$|^[A-Za-zÀ-ỹ\s]{0,50}$/;

    if (!accountname) return { errCode: -1, errMessage: 'Tên tài khoản trống!' };
    if (!accountNameRegex.test(accountname)) return { errCode: 1, errMessage: 'Tên tài khoản sai định dạng!' };

    if (!username) return { errCode: -1, errMessage: 'Tên người dùng trống!' };
    if (!userNameRegex.test(username)) return { errCode: 1, errMessage: 'Tên người dùng không hợp lệ!' };

    if (!phone) return { errCode: -1, errMessage: 'Số điện thoại trống!' };
    if (!phoneRegex.test(phone)) return { errCode: 1, errMessage: 'Số điện thoại không hợp lệ!' };

    if (!address) return { errCode: -1, errMessage: 'Địa chỉ trống!' };

    const validGenderCode = codeGender.map((item) => item.Code);
    if (!gender) return { errCode: -1, errMessage: 'Giới tính không tồn tại!' };
    if (!validGenderCode.includes(gender)) return { errCode: 1, errMessage: 'Giới tính không hợp lệ!' };

    if (specialization && !specializationRegex.test(specialization)) return { errCode: 1, errMessage: 'Chuyên môn không hợp lệ!' };

    return { errCode: 0, errMessage: 'Kiểm tra thông tin hoàn tất!' };
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });
    let isConfirmed = await confirmEdit();
    if (isConfirmed) {
      let isValidateInput = this.checkValidateInput();
      if (isValidateInput.errCode === 0) {
        const { selectedAccountID, accounttype, accountname, username, phone, address, gender, bio, specialization, workingstatus } = this.state;
        const userInfo = {
          accountid: selectedAccountID,
          accounttype,
          accountname,
          username,
          phone,
          address,
          gender,
        };
        if (accounttype === 'V') {
          userInfo.veterinarianInfo = {
            bio: bio || null,
            specialization: specialization || null,
            workingstatus: workingstatus || null,
          };
        }
        this.props.handleEditAccountFromModal(userInfo);
      } else {
        toast.error(isValidateInput.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    }
  };
  render() {
    const { isOpen } = this.props;
    const { loadedAccountInfo, email, accounttype, username, phone, accountname, gender, address, codeGender, codeAccountType, codeWorkingStatus, bio, specialization, workingstatus } = this.state;
    if (!loadedAccountInfo) {
      return (
        <Modal show={isOpen} onHide={this.toggle} className="edit-user-modal" centered backdrop="static">
          <Modal.Body>Không tìm thấy thông tin tài khoản.</Modal.Body>
        </Modal>
      );
    }
    return (
      <Modal show={this.props.isOpen} onHide={this.toggle} className="edit-user-modal" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={mailOutline}></IonIcon>
              <input type="email" placeholder="" value={email} disabled />
              <label>Email</label>
            </div>
            <div className="selectbox">
              <select value={accounttype} onChange={(event) => this.handleOnChangeInput(event, 'accounttype')}>
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
          {accounttype === 'V' && (
            <div className="R2 veterinarian-info">
              <div className="f">
                <div className="inputbox-2">
                  <IonIcon icon={idCardOutline}></IonIcon>
                  <input type="text" placeholder="" value={specialization} onChange={(event) => this.handleOnChangeInput(event, 'specialization')} />
                  <label>Chuyên khoa</label>
                </div>
                <div className="selectbox">
                  <label>Trạng thái làm việc</label>
                  <select value={workingstatus} onChange={(event) => this.handleOnChangeInput(event, 'workingstatus')}>
                    {codeWorkingStatus.length > 0 ? (
                      codeWorkingStatus.map((item) => (
                        <option key={item.Code} value={item.Code}>
                          {item.CodeValueVI}
                        </option>
                      ))
                    ) : (
                      <option value="">Không có dữ liệu trạng thái</option>
                    )}
                  </select>
                  <IonIcon icon={invertModeOutline}></IonIcon>

                </div>
              </div>
              <div className="inputbox-1">
                <IonIcon icon={informationCircleOutline}></IonIcon>
                <textarea placeholder="" value={bio} onChange={(event) => this.handleOnChangeInput(event, 'bio')} />
                <label>Tiểu sử</label>
              </div>
            </div>
          )}
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={person}></IonIcon>
              <input type="text" placeholder="" value={username} onChange={(event) => this.handleOnChangeInput(event, 'username')} />
              <label>Họ Tên</label>
            </div>
            <div className="inputbox">
              <IonIcon icon={call}></IonIcon>
              <input type="tel" placeholder="" value={phone} onChange={(event) => this.handleOnChangeInput(event, 'phone')} />
              <label>Số điện thoại</label>
            </div>
          </div>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={keyOutline}></IonIcon>
              <input type="text" placeholder="" value={accountname} onChange={(event) => this.handleOnChangeInput(event, 'accountname')} />
              <label>Tên tài khoản</label>
            </div>
            <div className="selectbox">
              <label>Giới tính</label>
              <select value={gender} onChange={(event) => this.handleOnChangeInput(event, 'gender')}>
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
            <div className="inputbox-address">
              <IonIcon icon={location}></IonIcon>
              <input type="text" placeholder="" value={address} onChange={(event) => this.handleOnChangeInput(event, 'address')} />
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
