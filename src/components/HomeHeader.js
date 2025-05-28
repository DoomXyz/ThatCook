import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';

import { cart, person, informationCircleOutline, logOutOutline, menuOutline, cartOutline, newspaperOutline } from 'ionicons/icons';

import './HomeHeader.scss';
import '../styles/ToastifyOverride.scss';

import { handleGetAccountInfoApi, handleLogoutApi } from '../services/accountServices';
import { handleGetCartApi } from '../services/cartServices';
import { handleGetServiceInfoApi } from '../services/serviceServices';

import { checkLoginStatus } from '../utils/pakage';
import { userLogin, userLogout, clearCheckOutCart, selectServiceType } from '../store/actions/';

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
      disabledButtons: {
        logout: false,
      },
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
        toast.error(response.errMessage || 'Không thể tải danh sách dịch vụ!');
        this.setState({ codeService: [] });
        return;
      }
      this.setState({ codeService: response.data });
    } catch (e) {
      console.log('Error loading service:', e);
      toast.error('Lỗi khi tải danh sách dịch vụ!');
    }
  };

  handleServiceNavigate = (serviceID) => {
    const serviceTypeMap = {
      1: 1, // General Health Check
      2: 2, // Vaccination
      3: 3, // Surgery
      4: 4, // Test
    };
    const serviceType = serviceTypeMap[serviceID] || 1;
    this.props.selectServiceType(serviceType);
    this.props.navigate('/showservice');
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
    this.setState({ disabledButtons: { ...this.state.disabledButtons, logout: true } });
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
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, logout: false } }); },
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
        toast.success('Đăng xuất thành công!');
      } catch (e) {
        console.log(e);
        toast.error('Đăng xuất thất bại. Vui lòng thử lại!');
      }
    }
    await this.countCartItem();
  };

  render() {
    const { accountInfo, isLoggedIn, cartItemsCount, userImage, userName, codeService, isScrolled, disabledButtons } = this.state;
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
                <button type="button" className="link-button">
                  <IonIcon icon={menuOutline}></IonIcon>
                </button>
                <ul className="sub-menu-1">
                  <li>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        this.props.navigate('/home');
                      }}
                    >
                      <IonIcon icon={cartOutline}></IonIcon>Cửa Hàng
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        this.props.navigate('/homeappointment');
                      }}
                    >
                      <IonIcon icon={newspaperOutline}></IonIcon>Dịch vụ
                    </button>
                  </li>
                </ul>
              </li>
              <li>
                <button type="button" className="link-button">Dịch vụ</button>
                <ul className="sub-menu-2">
                  {codeService.length > 0 ? (
                    codeService.map((service) => (
                      <li key={service.ServiceID}>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => this.handleServiceNavigate(service.ServiceID)}
                        >
                          {service.ServiceName}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span>Không có dịch vụ</span>
                    </li>
                  )}
                </ul>
              </li>
              <li>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => this.props.navigate('/makeappointment')}
                >
                  Đặt lịch
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => this.props.navigate('/showdoctor')}
                >
                  Bác sĩ
                </button>
              </li>
              {isLoggedIn && accountInfo ? (
                accountInfo.AccountType === 'C' ? (
                  <li>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => this.props.navigate('/track')}
                    >
                      Tra cứu
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => this.handleAccountTypeNavigate(accountInfo.AccountType)}
                    >
                      Nghiệp vụ
                    </button>
                  </li>
                )
              ) : (
                <li>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => this.props.navigate('/information')}
                  >
                    Liên hệ
                  </button>
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
                          <button
                            type="button"
                            className="link-button"
                            onClick={() => this.props.navigate('/user/customer')}
                          >
                            Thông tin người dùng
                          </button>
                        </div>
                      </li>
                      <li>
                        <div className="f" onClick={this.handleLogout}>
                          <IonIcon icon={logOutOutline}></IonIcon>
                          <button
                            type="button"
                            className="link-button"
                            onClick={this.handleLogout}
                            disabled={disabledButtons.logout}
                          >
                            Đăng xuất
                          </button>
                        </div>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="user-none" id="user-icon">
                    <div className="f">
                      <IonIcon icon={person}></IonIcon>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => this.props.navigate('/login')}
                      >
                        Đăng nhập
                      </button>
                      <p>|</p>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => this.props.navigate('/register')}
                      >
                        Đăng ký
                      </button>
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
  selectServiceType: (serviceType) => dispatch(selectServiceType(serviceType)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeHeader);
