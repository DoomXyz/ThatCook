import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';

import { keyOutline, home, mailOutline, eyeOffOutline, eyeOutline, call, person, maleFemaleOutline, location } from 'ionicons/icons';

import './Register.scss';
import Spinner from '../../components/Spinner';

import { handleRegisterApi } from '../../services/accountServices';

import { getAllCodes, validateAccountInput } from '../../utils/pakage'

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountname: '',
      email: '',
      password: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      accounttype: 'C', //mặc định tạo khách hàng
      confirmPassword: '',
      isTogglePassword1: false,
      isTogglePassword2: false,
      codeGender: [],
      isLoading: true,
    };
  }
  async componentDidMount() {
    await this.handleLoadCode(['Gender']);
  }
  //load các code cần trong mảng
  handleLoadCode = async (codeTypes) => {
    try {
      const responses = await Promise.all(codeTypes.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypes.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        newState[type.toLowerCase()] = response.data.length > 0 ? response.data[0].Code : '';
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  //ẩn hiện pass
  handleTogglePassword = (type) => {
    let value;
    switch (type) {
      case 1: value = 'isTogglePassword1';
        break;
      case 2: value = 'isTogglePassword2';
        break;
      default: break;
    }
    this.setState((prevState) => ({ [value]: !prevState[value] }));
  }
  //quản lý state nhập  
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };
  //thực hiện đăng ký
  handleRegister = async () => {
    this.setState({ isLoading: true });
    const { accountname, email, password, username, phone, address, gender, accounttype, confirmPassword } = this.state;
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không trùng khớp!');
      this.setState({ isLoading: false });
      return;
    }
    const userInfo = {
      accountname,
      email,
      password,
      username,
      phone,
      address,
      gender,
      accounttype,
    };
    const isValidateInput = await validateAccountInput(userInfo, "REG");
    if (!isValidateInput.valid) {
      toast.error(isValidateInput.errMessage);
      this.setState({ isLoading: false });
      return;
    }
    try {
      const response = await handleRegisterApi(userInfo);
      if (response && response.errCode === 0) {
        toast.success('Đăng ký tài khoản thành công!');
        setTimeout(() => this.props.navigate('/login'), 501);
      } else {
        const errMessage = response?.errMessage || 'Đăng ký tài khoản thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Register:', e);
      toast.error('Xảy ra lỗi khi đăng ký, vui lòng thử lại!');
    }
    this.setState({
      isLoading: false,
    });
  };
  render() {
    const { accountname, email, password, username, phone, address, gender, confirmPassword, isTogglePassword1, isTogglePassword2, codeGender, isLoading } = this.state;
    return (
      <div className="body-register">
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="register-container">
            <div className="form-container">
              <div className="home-button">
                <a href='/home'>
                  <IonIcon icon={home}></IonIcon>
                </a>
              </div>
              <div className="register-content">
                <h1>ĐĂNG KÝ</h1>
                <div className="single">
                  <div className="inputbox">
                    <IonIcon icon={mailOutline}></IonIcon>
                    <input type="email" placeholder="" value={email} onChange={(event) => this.handleOnChangeInput(event, 'email')} />
                    <label>Email</label>
                  </div>

                </div>
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
                      <IonIcon icon={isTogglePassword1 ? eyeOutline : eyeOffOutline} onClick={() => this.handleTogglePassword(1)}></IonIcon>
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
                      <IonIcon icon={isTogglePassword2 ? eyeOutline : eyeOffOutline} onClick={() => this.handleTogglePassword(2)}></IonIcon>
                    </div>
                    <input type={isTogglePassword2 ? 'text' : 'password'} placeholder="" value={confirmPassword} onChange={(event) => this.handleOnChangeInput(event, 'confirmPassword')} />
                    <label>Xác nhận mật khẩu</label>
                  </div>
                </div>
                <div className="single">
                  <div className="inputbox">
                    <IonIcon icon={location}></IonIcon>
                    <input type="text" placeholder="" value={address} onChange={(event) => this.handleOnChangeInput(event, 'address')} />
                    <label>Địa chỉ</label>
                  </div>
                </div>
                <button className="register-button" onClick={this.handleRegister}>
                  <p>Đăng ký</p>
                </button>
                <div className="login">
                  <p>Đã có tài khoản? </p>
                  <a href='/login'>Đăng nhập</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Register;