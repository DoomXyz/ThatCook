import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import { mailOutline, eyeOffOutline, peopleCircleOutline, eyeOutline, person, call, location, maleFemaleOutline, keyOutline, informationCircleOutline, idCardOutline, invertModeOutline } from 'ionicons/icons';
import './CreateAccountModal.scss';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';

class CreateAccountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounttype: '',
      accountname: '',
      email: '',
      password: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      confirmPassword: '',
      bio: '',
      specialization: '',
      workingstatus: '',
      isTogglePassword1: false,
      isTogglePassword2: false,
      codeGender: [],
      codeAccountType: [],
      codeWorkingStatus: [],
    };
  }

  async componentDidMount() {
    await this.handleLoadCodeGender();
    await this.handleLoadCodeAccountType();
    await this.handleLoadCodeWorkingStatus();
  }

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

  resetState = () => {
    this.setState({
      accountname: '',
      email: '',
      password: '',
      username: '',
      phone: '',
      address: '',
      confirmPassword: '',
      bio: '',
      specialization: '',
      isTogglePassword1: false,
      isTogglePassword2: false,
    });
  };

  toggle = async () => {
    this.resetState();
    this.props.toggleFromModal();
  };

  handleTogglePassword1 = () => {
    this.setState({ isTogglePassword1: !this.state.isTogglePassword1 });
  };

  handleTogglePassword2 = () => {
    this.setState({ isTogglePassword2: !this.state.isTogglePassword2 });
  };

  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

  checkValidateInput = () => {
    const { accountname, email, password, username, phone, address, gender, confirmPassword, codeGender, specialization } = this.state;
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    const specializationRegex = /^$|^[A-Za-zÀ-ỹ\s]{0,50}$/;

    if (!accountname) return { errCode: -1, errMessage: 'Tên tài khoản trống!' };
    if (!accountNameRegex.test(accountname)) return { errCode: 1, errMessage: 'Tên tài khoản sai định dạng!' };

    if (!email) return { errCode: -1, errMessage: 'Email trống!' };
    if (!emailRegex.test(email)) return { errCode: 1, errMessage: 'Email sai định dạng!' };

    if (!password) return { errCode: -1, errMessage: 'Mật khẩu trống!' };
    if (!passwordRegex.test(password)) return { errCode: 1, errMessage: 'Mật khẩu không hợp lệ! (Cần ít nhất 8 ký tự)' };

    if (!username) return { errCode: -1, errMessage: 'Tên người dùng trống!' };
    if (!userNameRegex.test(username)) return { errCode: 1, errMessage: 'Tên người dùng không hợp lệ!' };

    if (!phone) return { errCode: -1, errMessage: 'Số điện thoại trống!' };
    if (!phoneRegex.test(phone)) return { errCode: 1, errMessage: 'Số điện thoại không hợp lệ!' };

    if (!address) return { errCode: -1, errMessage: 'Địa chỉ trống!' };

    const validGenderCode = codeGender.map((item) => item.Code);
    if (!gender) return { errCode: -1, errMessage: 'Giới tính không tồn tại!' };
    if (!validGenderCode.includes(gender)) return { errCode: 1, errMessage: 'Giới tính không hợp lệ!' };

    if (password !== confirmPassword) return { errCode: 1, errMessage: 'Mật khẩu không trùng khớp!' };

    if (specialization && !specializationRegex.test(specialization)) return { errCode: 1, errMessage: 'Chuyên môn không hợp lệ!' };

    return { errCode: 0, errMessage: 'Kiểm tra thông tin hoàn tất!' };
  };

  handleCreateAccount = () => {
    let isValidateInput = this.checkValidateInput();
    if (isValidateInput.errCode === 0) {
      const { accounttype, accountname, email, password, username, phone, address, gender, bio, specialization, workingstatus } = this.state;
      const userInfo = {
        accounttype,
        accountname,
        email,
        password,
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
      this.props.handleCreateAccountFromModal(userInfo);
    } else {
      toast.error(isValidateInput.errMessage, {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  render() {
    const { isOpen } = this.props;
    const { accounttype, accountname, email, password, username, phone, address, gender, confirmPassword, bio, specialization, workingstatus, isTogglePassword1, isTogglePassword2, codeGender, codeAccountType, codeWorkingStatus } = this.state;
    return (
      <Modal show={isOpen} onHide={this.toggle} className="create-user-modal" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Tạo người dùng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={mailOutline}></IonIcon>
              <input type="email" placeholder="" value={email} onChange={(event) => this.handleOnChangeInput(event, 'email')} />
              <label>Email</label>
            </div>
            <div className="selectbox">
              <label>Phân quyền</label>
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
            <div className="inputbox">
              <div className="toggle-password">
                <IonIcon icon={isTogglePassword1 ? eyeOutline : eyeOffOutline} onClick={this.handleTogglePassword1}></IonIcon>
              </div>
              <input type={isTogglePassword1 ? 'text' : 'password'} placeholder="" value={password} onChange={(event) => this.handleOnChangeInput(event, 'password')} />
              <label>Mật khẩu</label>
            </div>
          </div>
          <div className="R1">
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
            <div className="inputbox">
              <div className="toggle-password">
                <IonIcon icon={isTogglePassword2 ? eyeOutline : eyeOffOutline} onClick={this.handleTogglePassword2}></IonIcon>
              </div>
              <input type={isTogglePassword2 ? 'text' : 'password'} placeholder="" value={confirmPassword} onChange={(event) => this.handleOnChangeInput(event, 'confirmPassword')} />
              <label>Xác nhận mật khẩu</label>
            </div>
          </div>
          <div className="R2">
            <div className="inputbox-address">
              <IonIcon icon={location}></IonIcon>
              <input className="address" type="text" placeholder="" value={address} onChange={(event) => this.handleOnChangeInput(event, 'address')} />
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
