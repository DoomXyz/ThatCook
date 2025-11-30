import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon

import { home, keyOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons'; //chỉ import các icon cần dùng

import './Login.scss'; //import scss
import Spinner from '../../components/Spinner';

import { handleLoginApi, handleLogoutApi } from '../../services/accountServices';
import { handleAddToCartApi } from '../../services/cartServices';

import { checkLoginStatus } from '../../utils/pakage';
import { userLogin, userLogout, clearCart, clearCheckOutCart, clearNotification } from '../../store/actions';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AccountName: '',
      Password: '',
      isTogglePassword: false,
      rememberLogin: false,
      isLoading: true,
    };
  }
  async componentDidMount() {
    const message = this.props.pageNotification;
    setTimeout(() => {
      if (message) {
        toast.info(message);
      }
      this.props.clearNotification();
    }, 100);
    await this.handleIsLogin();
  }
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };
  //quản lý state ẩn hiện Password
  handleTogglePassword = () => {
    this.setState({
      //khi ấn vào thì chuyển state thành state đối nghịch
      isTogglePassword: !this.state.isTogglePassword,
    });
  };
  //kiểm tra xem có đang đăng nhập không
  handleIsLogin = async () => {
    const navigateMap = {
      A: '/user/admin',
      O: '/user/owner',
      V: '/user/veterinarian',
      C: '/home',
    };
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        const path = navigateMap[accountInfo.AccountType] || '/login';
        setTimeout(() => {
          this.props.navigate(path);
        }, 0);
      } else {
        await handleLogoutApi();
        this.props.userLogout();
      }
    } catch (e) {
      this.props.navigate('/login');
    }
    this.setState({
      isLoading: false,
    });
  };
  //state khi ấn nút đăng nhập
  handleLogin = async (e) => {
    e.preventDefault();
    this.setState({
      isLoading: true,
    });
    try {
      //gọi api login ở backend, truyển email và Password đi để kiểm tra
      //biến data dùng để lưu thông tin trả về từ api
      const { AccountName, Password, rememberLogin } = this.state;
      let response = await handleLoginApi(AccountName, Password, rememberLogin);
      // nếu nhận được thông tin từ backend với mã lỗi khác 0 -> các trường hợp sai mail, sai pass,...
      if (response && response.errCode !== 0) {
        toast.error(response.errMessage);
      } else {
        const { AccountID, AccountName, AccountType, UserImage, UserName, navigate } = response.data;
        if (this.props.cartItems.length !== 0) {
          const responseCart = await handleAddToCartApi(AccountID, this.props.cartItems);
          if (responseCart) {
            this.props.clearCart();
          }
        }
        this.props.clearCheckOutCart();
        this.props.userLogin({
          AccountID,
          AccountName,
          AccountType,
          UserImage,
          UserName,
        });
        toast.success('Đăng nhập thành công!');
        setTimeout(() => {
          this.props.navigate(navigate);
        }, 501);
      }
    } catch (e) {
      toast.error('Đã xảy ra lỗi không xác định!');
    }
    this.setState({
      isLoading: false,
    });
  };
  render() {
    const { AccountName, Password, rememberLogin, isLoading } = this.state;
    return (
      <div className="login-background">
        <ToastContainer autoClose={500} newestOnTop={true} closeOnClick={false} pauseOnFocusLoss={false} draggable={true} transition={Slide} limit={1} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="login-container">
            <div className="login-content">
              <div className="home-button">
                <a href="/home">
                  <IonIcon icon={home}></IonIcon>
                </a>
              </div>
              <div className="text-login">ĐĂNG NHẬP</div>
              <form onSubmit={this.handleLogin}>
                <div className="inputbox">
                  <IonIcon icon={keyOutline}></IonIcon>
                  <input
                    type="text"
                    placeholder=""
                    //set value của ô input bằng dữ liệu của state
                    value={AccountName}
                    //quản lý event khi thay đổi thì gọi hàm handleOnChangeEmail để chuyển state
                    onChange={(event) => this.handleOnChangeInput(event, 'AccountName')}
                    required
                  />
                  <label>Tên đăng nhập</label>
                </div>
                <div className="inputbox">
                  <div
                    className="toggle-password"
                    //quản lý event khi click vào thì gọi hàm để chuyển state
                    onClick={() => this.handleTogglePassword()}
                  >
                    <IonIcon
                      //biến icon của IonIcon, icon sẽ dựa vào state isTogglePassword true hoặc false để đổi icon tương ứng
                      icon={this.state.isTogglePassword ? eyeOutline : eyeOffOutline}
                    ></IonIcon>
                  </div>
                  <input
                    //các state hoạt động như email
                    type={this.state.isTogglePassword ? 'text' : 'password'}
                    id="password"
                    placeholder=""
                    value={Password}
                    onChange={(event) => this.handleOnChangeInput(event, 'Password')}
                    required
                  />
                  <label>Mật khẩu</label>
                </div>
                <div className="password-util">
                  <div className="remember-me">
                    <input type="checkbox" id="rememberLogin" checked={rememberLogin} onChange={(event) => this.setState({ rememberLogin: event.target.checked })} />
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
              <div className="signin">
                <p>
                  Không có tài khoản?
                  <a href="/register"> Đăng ký ngay!</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Map state từ Redux store vào props (nếu cần lấy dữ liệu từ store)
const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  cartItems: state.cart.cartItems,
  pageNotification: state.pagenotification.notification,
});

// Map dispatch để gửi action lên store
const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  clearCart: () => dispatch(clearCart()),
  clearCheckOutCart: () => dispatch(clearCheckOutCart()),
  clearNotification: () => dispatch(clearNotification()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
