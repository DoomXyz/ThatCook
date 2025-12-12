import React, { useState } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';

import { home, keyOutline, eyeOffOutline, eyeOutline, mailOutline, call, person, maleFemaleOutline, location, personOutline } from 'ionicons/icons';

import './Login.scss'; // Import the new SCSS file for combined styles
import Spinner from '../../components/Spinner';

import { handleLoginApi, handleLogoutApi } from '../../services/accountServices';
import { handleAddToCartApi } from '../../services/cartServices';
import { handleRegisterApi } from '../../services/accountServices';

import { checkLoginStatus } from '../../utils/pakage';
import { getAllCodes, validateAccountInput } from '../../utils/pakage';

import { userLogin, userLogout, clearCart, clearCheckOutCart, clearNotification } from '../../store/actions';

import logo from '../../assets/images/logo.png';

const LoginForm = connect(
  (state) => ({
    userInfo: state.user.userInfo,
    cartItems: state.cart.cartItems,
    pageNotification: state.pagenotification.notification,
  }),
  (dispatch) => ({
    userLogin: (userInfo) => dispatch(userLogin(userInfo)),
    userLogout: () => dispatch(userLogout()),
    clearCart: () => dispatch(clearCart()),
    clearCheckOutCart: () => dispatch(clearCheckOutCart()),
    clearNotification: () => dispatch(clearNotification()),
  })
)((props) => {
  const [state, setState] = useState({
    AccountName: '',
    Password: '',
    isTogglePassword: false,
    rememberLogin: false,
    isLoading: true,
  });

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  React.useEffect(() => {
    const message = props.pageNotification;
    setTimeout(() => {
      if (message) {
        toast.info(message);
      }
      props.clearNotification();
    }, 100);
    handleIsLogin();
  }, []);

  const handleOnChangeInput = (event, type) => {
    updateState({ [type]: event.target.value });
  };

  const handleTogglePassword = () => {
    updateState({ isTogglePassword: !state.isTogglePassword });
  };

  const handleIsLogin = async () => {
    const navigateMap = {
      A: '/user/admin',
      O: '/user/owner',
      V: '/user/veterinarian',
      C: '/home',
    };
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!props.userInfo) {
          props.userLogin(accountInfo);
        }
        const path = navigateMap[accountInfo.AccountType] || '/login';
        setTimeout(() => {
          props.navigate(path);
        }, 0);
      } else {
        await handleLogoutApi();
        props.userLogout();
      }
    } catch (e) {
      props.navigate('/login');
    }
    updateState({ isLoading: false });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    updateState({ isLoading: true });
    try {
      const { AccountName, Password, rememberLogin } = state;
      let response = await handleLoginApi(AccountName, Password, rememberLogin);
      if (response && response.errCode !== 0) {
        toast.error(response.errMessage);
      } else {
        const { AccountID, AccountName, AccountType, UserImage, UserName, navigate } = response.data;
        if (props.cartItems.length !== 0) {
          const responseCart = await handleAddToCartApi(AccountID, props.cartItems);
          if (responseCart) {
            props.clearCart();
          }
        }
        props.clearCheckOutCart();
        props.userLogin({
          AccountID,
          AccountName,
          AccountType,
          UserImage,
          UserName,
        });
        toast.success('Đăng nhập thành công!');
        setTimeout(() => {
          props.navigate(navigate);
        }, 501);
      }
    } catch (e) {
      toast.error('Đã xảy ra lỗi không xác định!');
    }
    updateState({ isLoading: false });
  };

  const { AccountName, Password, rememberLogin, isLoading, isTogglePassword } = state;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="home-button-login">
            <a href="/home">
              <IonIcon icon={home} />
            </a>
          </div>
          <img src={logo} alt="logo" className="logo-img" />
          <h1 className="text-login">ĐĂNG NHẬP</h1>
          <form onSubmit={handleLogin}>
            <div className="inputbox-login">
              <IonIcon icon={personOutline} />
              <input type="text" placeholder="" value={AccountName} onChange={(event) => handleOnChangeInput(event, 'AccountName')} required />
              <label>Tên đăng nhập</label>
            </div>
            <div className="inputbox-login">
              <div className="toggle-password-login" onClick={handleTogglePassword}>
                <IonIcon icon={isTogglePassword ? eyeOutline : eyeOffOutline} />
              </div>
              <IonIcon icon={keyOutline} />
              <input type={isTogglePassword ? 'text' : 'password'} placeholder="" value={Password} onChange={(event) => handleOnChangeInput(event, 'Password')} required />
              <label>Mật khẩu</label>
            </div>
            <div className="password-util">
              <div className="remember-me">
                <input type="checkbox" id="rememberLogin" checked={rememberLogin} onChange={(event) => updateState({ rememberLogin: event.target.checked })} />
                <label htmlFor="rememberLogin">Ghi nhớ đăng nhập</label>
              </div>
              <a href="/forgotpassword" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div>
            <button type="submit" className="login-button">
              <p>Đăng nhập</p>
            </button>
          </form>
        </>
      )}
    </>
  );
});

const RegisterForm = (props) => {
  const [state, setState] = useState({
    AccountName: '',
    Email: '',
    Password: '',
    UserName: '',
    Phone: '',
    Address: '',
    Gender: '',
    AccountType: 'C',
    confirmPassword: '',
    isTogglePassword1: false,
    isTogglePassword2: false,
    codeGender: [],
    isLoading: true,
  });

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  React.useEffect(() => {
    handleLoadCode(['Gender']);
  }, []);

  const handleLoadCode = async (codeTypeFilter) => {
    try {
      const responses = await Promise.all(codeTypeFilter.map((type) => getAllCodes(type)));
      const newState = { isLoading: false };
      const hasDefault = ['Gender'];
      codeTypeFilter.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        if (hasDefault.includes(type)) {
          newState[type] = response.data.length > 0 ? response.data[0].Code : '';
        }
      });
      updateState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      updateState({ isLoading: false });
    }
  };

  const handleTogglePassword = (type) => {
    let value;
    switch (type) {
      case 1:
        value = 'isTogglePassword1';
        break;
      case 2:
        value = 'isTogglePassword2';
        break;
      default:
        break;
    }
    updateState({ [value]: !state[value] });
  };

  const handleOnChangeInput = (event, type) => {
    updateState({ [type]: event.target.value });
  };

  const handleRegister = async () => {
    updateState({ isLoading: true });
    const { AccountName, Email, Password, UserName, Phone, Address, Gender, AccountType, confirmPassword } = state;
    if (Password !== confirmPassword) {
      toast.error('Mật khẩu không trùng khớp!');
      updateState({ isLoading: false });
      return;
    }
    const userInfo = {
      AccountName,
      Email,
      Password,
      UserName,
      Phone,
      Address,
      Gender,
      AccountType,
    };
    const isValidateInput = await validateAccountInput(userInfo, 'REG');
    if (!isValidateInput.valid) {
      toast.error(isValidateInput.errMessage);
      updateState({ isLoading: false });
      return;
    }
    try {
      const response = await handleRegisterApi(userInfo);
      if (response && response.errCode === 0) {
        toast.success('Đăng ký tài khoản thành công!');
        setTimeout(() => props.navigate('/login'), 501);
      } else {
        const errMessage = response?.errMessage || 'Đăng ký tài khoản thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Register:', e);
      toast.error('Xảy ra lỗi khi đăng ký, vui lòng thử lại!');
    }
    updateState({ isLoading: false });
  };

  const { AccountName, Email, Password, UserName, Phone, Address, Gender, confirmPassword, isTogglePassword1, isTogglePassword2, codeGender, isLoading } = state;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="home-button-login">
            <a href="/home">
              <IonIcon icon={home} />
            </a>
          </div>
          <h1 className="text-register">ĐĂNG KÝ</h1>
          <div className="single">
            <div className="inputbox-login">
              <IonIcon icon={mailOutline} />
              <input type="email" placeholder="" value={Email} onChange={(event) => handleOnChangeInput(event, 'Email')} />
              <label>Email</label>
            </div>
          </div>
          <div className="R1">
            <div className="inputbox-login">
              <IonIcon icon={person} />
              <input type="text" placeholder="" value={UserName} onChange={(event) => handleOnChangeInput(event, 'UserName')} />
              <label>Họ Tên</label>
            </div>
            <div className="inputbox-login">
              <IonIcon icon={call} />
              <input type="tel" placeholder="" value={Phone} onChange={(event) => handleOnChangeInput(event, 'Phone')} />
              <label>Số điện thoại</label>
            </div>
          </div>
          <div className="R1">
            <div className="inputbox-login">
              <IonIcon icon={personOutline} />
              <input type="text" placeholder="" value={AccountName} onChange={(event) => handleOnChangeInput(event, 'AccountName')} />

              <label>Tên tài khoản</label>
            </div>
            <div className="inputbox-login">
              <div className="toggle-password-login">
                <IonIcon icon={isTogglePassword1 ? eyeOutline : eyeOffOutline} onClick={() => handleTogglePassword(1)} />
              </div>
              <IonIcon icon={keyOutline} />
              <input type={isTogglePassword1 ? 'text' : 'password'} placeholder="" value={Password} onChange={(event) => handleOnChangeInput(event, 'Password')} />
              <label>Mật khẩu</label>
            </div>
          </div>
          <div className="R1">
            <div className="selectbox-login">
              <select value={Gender} onChange={(event) => handleOnChangeInput(event, 'Gender')}>
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
              <IonIcon icon={maleFemaleOutline} />
            </div>
            <div className="inputbox-login">
              <div className="toggle-password-login">
                <IonIcon icon={isTogglePassword2 ? eyeOutline : eyeOffOutline} onClick={() => handleTogglePassword(2)} />
              </div>
              <IonIcon icon={keyOutline} />
              <input type={isTogglePassword2 ? 'text' : 'password'} placeholder="" value={confirmPassword} onChange={(event) => handleOnChangeInput(event, 'confirmPassword')} />
              <label>Xác nhận mật khẩu</label>
            </div>
          </div>
          <div className="single">
            <div className="inputbox-login">
              <IonIcon icon={location} />
              <input type="text" placeholder="" value={Address} onChange={(event) => handleOnChangeInput(event, 'Address')} />
              <label>Địa chỉ</label>
            </div>
          </div>
          <button className="register-button" onClick={handleRegister}>
            <p>Đăng ký</p>
          </button>
        </>
      )}
    </>
  );
};

const Auth = (props) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const toggle = () => setIsSignUp(!isSignUp);

  return (
    <div className="auth-background">
      <ToastContainer autoClose={500} newestOnTop={true} closeOnClick={false} pauseOnFocusLoss={false} draggable={true} transition={Slide} limit={1} />

      <div className={`login-container ${isSignUp ? 'right-panel-active' : ''}`}>
        <div className="login-form-container sign-up-container">
          <RegisterForm toggle={toggle} navigate={props.navigate} />
        </div>
        <div className="login-form-container sign-in-container">
          <LoginForm toggle={toggle} navigate={props.navigate} />
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Chào mừng trở lại với Shop!</h1>
              <p>Để tiếp tục mua sắm, vui lòng đăng nhập bằng thông tin cá nhân của bạn</p>
              <button className="ghost" onClick={toggle}>
                Đăng nhập
              </button>
              <p className="p-address">Địa chỉ shop: 136 Huỳnh Văn Bánh, P.11, Q.Phú Nhuận, TP.HCM</p>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Shop Mincow xin chào!</h1>
              <p>Hãy tạo tài khoản để nhập thêm nhiều ưu đãi và thông báo về khuyến mãi ngay nào !</p>
              <button className="ghost" onClick={toggle}>
                Đăng ký
              </button>
              <p className="p-address">Địa chỉ shop: 136 Huỳnh Văn Bánh, P.11, Q.Phú Nhuận, TP.HCM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
