import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import io from 'socket.io-client';
import { cart, person, informationCircleOutline, logOutOutline, menuOutline, cartOutline, newspaperOutline, pawOutline } from 'ionicons/icons';

import './HomeHeader.scss';
import '../styles/ToastifyOverride.scss';

import { handleGetAccountInfoApi, handleLogoutApi } from '../services/accountServices';
import { handleGetCartApi } from '../services/cartServices';
import { handleGetServiceInfoApi } from '../services/serviceServices';

import { checkLoginStatus } from '../utils/pakage';
import { userLogin, userLogout, clearCheckOutCart, selectServiceType, saveTrackInfo } from '../store/actions/';

import { notificationsOutline } from 'ionicons/icons';
import { getUserNotifications, NotifiStatusChange } from '../services/utilitiesServices';

const defUserImage = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg';

class HomeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      accountInfo: null,
      UserImage: null,
      UserName: null,
      codeService: [],
      cartItemsCount: 0,
      isScrolled: false,
      disabledButtons: {
        logout: false,
      },
      //state thông báo
      notifications: [],
      notifCount: 0,
      isNotifOpen: false,
      isLoadingNotif: false,
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
      this.fetchNotifications();
    }, 0);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll();
    this.socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:9999');

    // Join room theo AccountID
    if (this.props.userInfo?.AccountID) {
      this.socket.emit('join-user', this.props.userInfo.AccountID);
    }

    // Join role room nếu là bác sĩ/chủ shop
    if (this.props.userInfo?.AccountType === 'V') {
      this.socket.emit('join-role', 'V');
    }
    if (this.props.userInfo?.AccountType === 'O') {
      this.socket.emit('join-role', 'O');
    }

    // LẮNG NGHE THÔNG BÁO MỚI
    this.socket.on('new-notification', (notif) => {
      console.log('[REAL-TIME] Nhận thông báo mới:', notif);

      this.fetchNotifications();
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, { passive: true });
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      await this.handleLoadInformation();
      await this.countCartItem();
      this.fetchNotifications();
    }
    if (prevProps.triggerCountCartItem !== this.props.triggerCountCartItem) {
      await this.countCartItem();
    }
    if (prevProps.triggerLoadInformation !== this.props.triggerLoadInformation) {
      await this.handleLoadInformation();
    }
    // Đóng dropdown khi click ngoài
    if (this.state.isNotifOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeNotifOnClickOutside);
      }, 0);
    }
  }
  handleNotificationClick = async (notif) => {
    const orderTypes = ['ORDER_SUCCESS', 'ORDER_CANCEL', 'ORDER_COMPLETE', 'ORDER_CONFIRM'];
    const apmTypes = ['APM_SUCCESS', 'APM_WAIT', 'APM_CONFIRM', 'APM_REFUSE', 'APM_COMPLETE', 'APM_CANCEL'];
    if (orderTypes.includes(notif.NotifType) && notif.ExtraValue) {
      const InvoiceID = notif.ExtraValue;
      if (notif.NotifStatus === 'UNREAD') {
        try {
          // GỌI API BẰNG HÀM BẠN ĐÃ TẠO – HOÀN TOÀN ĐÚNG!
          const response = await NotifiStatusChange(notif.NotifID, 'READ');

          // Kiểm tra kết quả từ backend
          if (response?.data?.errCode === 0) {
            console.log('[NOTIF] Đánh dấu đã đọc thành công:', notif.NotifID);

            // Cập nhật UI ngay lập tức
            this.setState((prevState) => ({
              notifCount: Math.max(0, prevState.notifCount - 1),
              notifications: prevState.notifications.map((n) => (n.NotifID === notif.NotifID ? { ...n, NotifStatus: 'READ' } : n)),
            }));
          } else {
            console.log('[NOTIF] Backend lỗi:', response?.data?.errMessage);
          }
        } catch (err) {
          console.log('Lỗi đánh dấu đã đọc:', err);
          // Vẫn chuyển trang dù lỗi (không làm gián đoạn trải nghiệm)
        }
      }
      // Dùng đúng Redux action bạn đã setup
      this.props.saveTrackInfo({
        BillID: InvoiceID,
        BillType: 1,
      });
      // Đóng dropdown thông báo
      this.setState({ isNotifOpen: false });

      // Chuyển hướng đến trang track
      this.props.navigate('/track', { replace: true, state: { refresh: Date.now() } });
    } else if (apmTypes.includes(notif.NotifType) && notif.ExtraValue) {
      const AppointmentID = notif.ExtraValue;

      // Đánh dấu đã đọc (nếu chưa)
      if (notif.NotifStatus === 'UNREAD') {
        try {
          const response = await NotifiStatusChange(notif.NotifID, 'READ');
          if (response?.data?.errCode === 0) {
            this.setState((prevState) => ({
              notifCount: Math.max(0, prevState.notifCount - 1),
              notifications: prevState.notifications.map((n) => (n.NotifID === notif.NotifID ? { ...n, NotifStatus: 'READ' } : n)),
            }));
          }
        } catch (err) {
          console.log('Lỗi đánh dấu đã đọc:', err);
        }
      }
      this.props.saveTrackInfo({
        BillID: AppointmentID,
        BillType: 2,
      });
      console.log('DEBUG: Chuyển đến trang lịch khám với ID:', AppointmentID);
      // Đóng dropdown và chuyển trang lịch khám (tuỳ chỉnh theo route của bạn)
      this.setState({ isNotifOpen: false });
      this.props.navigate(`/track`);
    }
  };

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
          UserImage: accountInfo.UserImage || defUserImage,
          UserName: accountInfo.UserName,
        });
      }
    }
  };

  handleLoadService = async () => {
    try {
      const responseApi = await handleGetServiceInfoApi('ALL');
      const response = responseApi.data;
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

  handleServiceNavigate = (ServiceID) => {
    const serviceTypeMap = {
      1: 1, // General Health Check
      2: 2, // Vaccination
      3: 3, // Surgery
      4: 4, // Test
    };
    const serviceType = serviceTypeMap[ServiceID] || 1;
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
  handleAccountTypeNavigate = (AccountType) => {
    const navigateMap = {
      A: '/user/admin',
      O: '/user/owner',
      V: '/user/veterinarian',
      C: '/home',
    };
    const path = navigateMap[AccountType] || '/login';
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
            onClose: () => {
              this.setState({ disabledButtons: { ...this.state.disabledButtons, logout: false } });
            },
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

  // Lấy danh sách thông báo
  fetchNotifications = async () => {
    const { isLoggedIn, accountInfo } = this.state;

    if (!isLoggedIn || !accountInfo?.AccountID) {
      this.setState({
        notifications: [],
        notifCount: 0,
        isLoadingNotif: false,
      });
      return;
    }

    this.setState({ isLoadingNotif: true });

    try {
      const axiosResponse = await getUserNotifications(accountInfo.AccountID);
      const response = axiosResponse.data;
      if (response && response.errCode === 0) {
        const notifications = response.data || [];
        const notifCount = notifications.filter((n) => n.NotifStatus === 'UNREAD').length;

        this.setState({
          notifications,
          notifCount,
          isLoadingNotif: false,
        });
      } else {
        this.setState({
          notifications: [],
          notifCount: 0,
          isLoadingNotif: false,
        });
      }
    } catch (e) {
      console.log('Lỗi tải thông báo:', e);
      this.setState({ isLoadingNotif: false });
    }
  };
  // Mở/đóng dropdown
  toggleNotifDropdown = () => {
    this.setState((prev) => ({ isNotifOpen: !prev.isNotifOpen }));
  };

  // Đóng khi click ra ngoài
  closeNotifOnClickOutside = (e) => {
    if (!e.target.closest('.notification-wrapper')) {
      this.setState({ isNotifOpen: false });
      document.removeEventListener('click', this.closeNotifOnClickOutside);
    }
  };
  render() {
    const { accountInfo, isLoggedIn, cartItemsCount, UserImage, UserName, codeService, isScrolled, disabledButtons, notifications, notifCount, isNotifOpen, isLoadingNotif } = this.state;
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
                <button type="button" className="link-button">
                  Dịch vụ
                </button>
                <ul className="sub-menu-2">
                  {codeService.length > 0 ? (
                    codeService.map((service) => (
                      <li key={service.ServiceID}>
                        <button type="button" className="link-button" onClick={() => this.handleServiceNavigate(service.ServiceID)}>
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
                <button type="button" className="link-button" onClick={() => this.props.navigate('/makeappointment')}>
                  Đặt lịch
                </button>
              </li>
              <li>
                <button type="button" className="link-button" onClick={() => this.props.navigate('/showdoctor')}>
                  Bác sĩ
                </button>
              </li>
              {isLoggedIn && accountInfo ? (
                accountInfo.AccountType === 'C' ? (
                  <li>
                    <button type="button" className="link-button" onClick={() => this.props.navigate('/track')}>
                      Tra cứu
                    </button>
                  </li>
                ) : (
                  <li>
                    <button type="button" className="link-button" onClick={() => this.handleAccountTypeNavigate(accountInfo.AccountType)}>
                      Nghiệp vụ
                    </button>
                  </li>
                )
              ) : (
                <li>
                  <button type="button" className="link-button" onClick={() => this.props.navigate('/track')}>
                    Tra cứu
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

              {isLoggedIn ? (
                <div className="notification-wrapper">
                  <button type="button" className="notification-bell link-button" onClick={this.toggleNotifDropdown}>
                    <IonIcon icon={notificationsOutline} />
                    {notifCount > 0 && <span className="notif-badge">{notifCount > 99 ? '99+' : notifCount}</span>}
                  </button>

                  {isNotifOpen && (
                    <div className="notification-dropdown">
                      <div className="notif-header">
                        <h4>Thông báo</h4>
                        {notifCount > 0 && <span>{notifCount} chưa đọc</span>}
                      </div>

                      <div className="notif-body">
                        {isLoadingNotif ? (
                          <div className="notif-loading">Đang tải...</div>
                        ) : notifications.length > 0 ? (
                          notifications.map((item) => (
                            <div key={item.NotifID} className={`notif-item ${item.NotifStatus === 'UNREAD' ? 'unread' : ''}`} onClick={() => this.handleNotificationClick(item)}>
                              <p className="notif-desc" dangerouslySetInnerHTML={{ __html: item.NotifDescription }} />
                              <span className="notif-time">{new Date(item.CreatedAt).toLocaleString('vi-VN')}</span>
                            </div>
                          ))
                        ) : (
                          <div className="notif-empty">Không có thông báo</div>
                        )}
                      </div>

                      <div className="notif-footer">
                        <button type="button" className="link-button" onClick={() => this.props.navigate('/notifications')}></button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="notifi"></div>
              )}

              <li>
                {isLoggedIn ? (
                  <div className="user f" id="user-icon">
                    <img src={UserImage} loading="lazy" alt="User" />
                    <p>{UserName}</p>
                    <ul className="sub-menu">
                      <li>
                        <div className="f">
                          <IonIcon icon={informationCircleOutline}></IonIcon>
                          <button type="button" className="link-button" onClick={() => this.props.navigate('/user/customer')}>
                            Thông tin người dùng
                          </button>
                        </div>
                      </li>
                      <li>
                        <div className="f">
                          <IonIcon icon={pawOutline}></IonIcon>
                          <button type="button" className="link-button" onClick={() => this.props.navigate('/pet')}>
                            Danh sách thú cưng
                          </button>
                        </div>
                      </li>
                      <li>
                        <div className="f">
                          <IonIcon icon={logOutOutline}></IonIcon>
                          <button type="button" className="link-button" onClick={this.handleLogout} disabled={disabledButtons.logout}>
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
                      <button type="button" className="link-button" onClick={() => this.props.navigate('/login')}>
                        Đăng nhập | Đăng ký
                      </button>
                      {/* <p> | </p>
                      <button type="button" className="link-button" onClick={() => this.props.navigate('/register')}>
                        Đăng ký
                      </button> */}
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
  trackInfo: state.track.trackInfo,
});

const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  clearCheckOutCart: () => dispatch(clearCheckOutCart()),
  selectServiceType: (serviceType) => dispatch(selectServiceType(serviceType)),
  saveTrackInfo: (trackData) => dispatch(saveTrackInfo(trackData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeHeader);