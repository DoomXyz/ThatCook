import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';

import { cart, person, informationCircleOutline, logOutOutline, menuOutline, cartOutline, newspaperOutline } from 'ionicons/icons';

import './HomeHeader.scss';
import '../styles/ToastifyOverride.scss';

import { handleGetAccountInfoApi, handleLogoutApi } from '../services/accountServices';
import { handleGetCartApi } from '../services/cartServices';
import { handleGetServiceInfoApi } from '../services/serviceServices';

import { checkLoginStatus } from '../utils/pakage';
import { userLogin, userLogout, clearCheckOutCart } from '../store/actions/';

const defUserImage = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg';

class HomeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      accountInfo: null,
      userImage: null,
      userName: null,
      codeService: [],
      cartItemsCount: 0,
      isScrolled: false,
    };
    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll() {
    requestAnimationFrame(() => {
      const isScrolled = window.scrollY > 0;
      if (isScrolled !== this.state.isScrolled) {
        this.setState({ isScrolled });
      }
    });
  }

  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadService();
    setTimeout(() => {
      this.countCartItem();
      this.handleLoadInformation();
    }, 0);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, { passive: true });
  }
  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      await this.handleLoadInformation();
      await this.countCartItem();
    }
    if (prevProps.triggerCountCartItem !== this.props.triggerCountCartItem) {
      await this.countCartItem();
    }
    if (prevProps.triggerLoadInformation !== this.props.triggerLoadInformation) {
      await this.handleLoadInformation();
    }
  }

  handleIsLogin = async () => {
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          isLoggedIn: true,
          accountInfo: accountInfo,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          isLoggedIn: false,
          accountInfo: null,
        });
      }
    } catch (e) {
      console.log('Token not found!');
    }
  };

  handleLoadInformation = async () => {
    const { isLoggedIn, accountInfo } = this.state;
    if (isLoggedIn) {
      const response = await handleGetAccountInfoApi(accountInfo.AccountID);
      if (response && response.errCode === 0) {
        const accountInfo = response.data;
        this.setState({
          userImage: accountInfo.UserImage || defUserImage,
          userName: accountInfo.UserName,
        });
      }
    }
  };

  handleLoadService = async () => {
    try {
      const responseApi = await handleGetServiceInfoApi('ALL');
      const response = responseApi.data
      if (response.errCode !== 0 || !response.data || response.data.length === 0) {
        toast.error(response.errMessage || 'Không thể tải danh sách dịch vụ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({ codeService: [] });
        return;
      }
      this.setState({ codeService: response.data });
    } catch (e) {
      console.log('Error loading service:', e);
      toast.error('Lỗi khi tải danh sách dịch vụ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleServiceNavigate = (serviceID) => {
    const servicePaths = {
      1: '/service/genhealthcheck',
      2: '/service/vaccination',
      3: '/service/surgery',
      4: '/service/test',
    };
    const path = servicePaths[serviceID] || '/homeappointment';
    this.props.navigate(path);
  };

  countCartItem = async () => {
    try {
      const { isLoggedIn, accountInfo } = this.state;
      let count = 0;
      let cartItems = null;
      if (isLoggedIn) {
        const response = await handleGetCartApi(accountInfo.AccountID);
        if (response && response.errCode === 0) {
          cartItems = response.data;
        }
      } else {
        cartItems = this.props.cartItems;
      }
      for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].ItemQuantity > 0) {
          count += cartItems[i].ItemQuantity;
        }
      }
      this.setState({
        cartItemsCount: count,
      });
    } catch (e) {
      console.log('Chưa kết nối backend!');
    }
  };
  handleAccountTypeNavigate = (accounttype) => {
    const navigateMap = {
      A: '/user/admin',
      O: '/user/owner',
      V: '/user/veterinarian',
      C: '/home',
    };
    const path = navigateMap[accounttype] || '/login';
    setTimeout(() => {
      this.props.navigate(path);
    }, 0);
  };

  handleLogout = async () => {
    const confirmLogout = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận đăng xuất?</p>
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
          {
            autoClose: 1000,
            closeOnClick: false,
            onClose: () => resolve(false),
          }
        );
      });
    const isConfirmed = await confirmLogout();
    if (isConfirmed) {
      try {
        await handleLogoutApi();
        this.props.userLogout();
        this.props.clearCheckOutCart();
        this.setState({
          isLoggedIn: false,
          accountInfo: null,
        });
        this.props.navigate('/home');
        toast.success('Đăng xuất thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      } catch (e) {
        console.log(e);
        toast.error('Đăng xuất thất bại. Vui lòng thử lại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    }
    await this.countCartItem();
  };

  render() {
    const { accountInfo, isLoggedIn, cartItemsCount, userImage, userName, codePetType, codeService, isScrolled } = this.state;
    return (
      <div className="body-container">
        <div className={`header-container ${isScrolled ? 'scrolled' : ''}`}>
          <div className="header-top">
            <div
              className="logo"
              onClick={() => {
                this.props.navigate('/home');
              }}
            ></div>
            <div className="menu">
              <li className="menu-icon">
                <a>
                  <IonIcon icon={menuOutline}></IonIcon>
                </a>
                <ul className="sub-menu-1">
                  <li>
                    <a
                      onClick={() => {
                        this.props.navigate('/home');
                      }}
                    >
                      <IonIcon icon={cartOutline}></IonIcon>Cửa Hàng
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        this.props.navigate('/homeappointment');
                      }}
                    >
                      <IonIcon icon={newspaperOutline}></IonIcon>Dịch vụ
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a>Dịch vụ</a>
                <ul className="sub-menu-2">
                  {codeService.length > 0 ? (
                    codeService.map((service) => (
                      <li key={service.ServiceID}>
                        <a>
                          <p onClick={() => this.handleServiceNavigate(service.ServiceID)}>{service.ServiceName}</p>
                        </a>
                      </li>
                    ))
                  ) : (
                    <li>
                      <a>
                        <p>Không có dịch vụ</p>
                      </a>
                    </li>
                  )}
                </ul>
              </li>
              <li>
                <a onClick={() => this.props.navigate('/makeappointment')}>Đặt lịch</a>
              </li>
              <li>
                <a onClick={() => this.props.navigate('/showdoctor')}>Bác sĩ</a>
              </li>
              {isLoggedIn && accountInfo ? (
                accountInfo.AccountType === 'C' ? (
                  <li>
                    <a onClick={() => this.props.navigate('/track')}>Tra cứu</a>
                  </li>
                ) : (
                  <li>
                    <a onClick={() => this.handleAccountTypeNavigate(accountInfo.AccountType)}>Nghiệp vụ</a>
                  </li>
                )
              ) : (
                <li>
                  <a onClick={() => this.props.navigate('/information')}>Liên hệ</a>
                </li>
              )}
            </div>
            <div className="others">
              <li>
                <a href="/cart" className="shopping-bag">
                  <IonIcon icon={cart}></IonIcon>
                  {cartItemsCount > 0 && <span className="cart-bubble">{cartItemsCount}</span>}
                </a>
              </li>
              <li>
                {isLoggedIn ? (
                  <div className="user f" id="user-icon">
                    <img src={userImage} loading="lazy" alt="User" />
                    <p>{userName}</p>
                    <ul className="sub-menu">
                      <li>
                        <div className="f" onClick={() => this.props.navigate('/user/customer')}>
                          <IonIcon icon={informationCircleOutline}></IonIcon>
                          <a>Thông tin người dùng</a>
                        </div>
                      </li>
                      <li>
                        <div className="f" onClick={this.handleLogout}>
                          <IonIcon icon={logOutOutline}></IonIcon>
                          <a>Đăng xuất</a>
                        </div>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="user-none" id="user-icon">
                    <div className="f">
                      <IonIcon icon={person}></IonIcon>
                      <a onClick={() => this.props.navigate('/login')}>
                        <p>Đăng nhập</p>
                      </a>
                      <p>|</p>
                      <a onClick={() => this.props.navigate('/register')}>
                        <p>Đăng ký</p>
                      </a>
                    </div>
                  </div>
                )}
              </li>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  cartItems: state.cart.cartItems,
  isUpdateCartCount: state.cart.isUpdateCartCount,
});

const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  clearCheckOutCart: () => dispatch(clearCheckOutCart()),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeHeader);
