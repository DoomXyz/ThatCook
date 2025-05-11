import React, { Component } from "react";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react";
import { ToastContainer, toast } from "react-toastify";
import { cart, person, informationCircleOutline, logOutOutline, } from "ionicons/icons";
import "./HomeHeader.scss";
import "../styles/ToastifyOverride.scss";
import { handleGetAccountInfoApi, handleLogoutApi } from "../services/accountServices";
import { handleGetCartApi } from "../services/cartServices";
import { handleGetAllCodesApi } from "../services/utilitiesServices"
import { checkLoginStatus } from '../utils/pakage';
import { userLogin, userLogout, clearCheckOutCart } from "../store/actions/";

const defUserImage = "https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg";

class HomeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      accountInfo: null,
      userImage: null,
      userName: null,
      codePetType: [],
      cartItemsCount: 0,
    };
  }

  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadPetType();
    setTimeout(() => {
      this.countCartItem();
      this.handleLoadInformation();
    }, 0);
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
          accountInfo: accountInfo
        })
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          isLoggedIn: false,
          accountInfo: null
        })
      }
    } catch (e) {
      console.log("Token not found!")
    }
  };

  handleLoadInformation = async () => {
    const { isLoggedIn, accountInfo } = this.state
    if (isLoggedIn) {
      const response = await handleGetAccountInfoApi(accountInfo.AccountID)
      if (response && response.errCode === 0) {
        const accountInfo = response.data
        this.setState({
          userImage: accountInfo.UserImage || defUserImage,
          userName: accountInfo.UserName,
        })
      }
    }
  }

  handleLoadPetType = async () => {
    try {
      const codePetType = await handleGetAllCodesApi('PetType');
      if (!codePetType || codePetType.length === 0) {
        toast.error("Không thể tải danh sách sản phẩm!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePetType,
      });
    } catch (e) {
      console.log("Error loading pettype code:", e);
      toast.error("Lỗi khi tải danh sách sản phẩm!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }

  countCartItem = async () => {
    try {
      const { isLoggedIn, accountInfo } = this.state
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
        cartItemsCount: count
      })
    } catch (e) {
      console.log("Chưa kết nối backend!")
    }
  };

  handlePetTypeFilter = (code) => {
    this.props.navigate("/home")
    const formatedCode = "pettype-" + code
    console.log("PetType code:", formatedCode);
  };

  handlePromotionFilter = () => {
    this.props.navigate("/home")
    console.log("Promotion product only selected")
  }

  handleAccountTypeNavigate = (accounttype) => {
    const navigateMap = {
      'A': '/user/admin',
      'O': '/user/owner',
      'V': '/user/veterinarian',
      'C': '/home'
    };
    const path = navigateMap[accounttype] || '/login';
    setTimeout(() => {
      this.props.navigate(path);
    }, 0);
  }

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
          { autoClose: 1000, closeOnClick: true }
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
        })
        this.props.navigate("/home");
        toast.success("Đăng xuất thành công!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
      } catch (e) {
        console.log(e)
        toast.error("Đăng xuất thất bại. Vui lòng thử lại!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
      }
    }
    await this.countCartItem()
  };

  render() {
    const { accountInfo, isLoggedIn, cartItemsCount, userImage, userName, codePetType } = this.state;
    return (
      <div className="body-container">
        <div className="header-container">
          <div className="header-top">
            <div
              className="logo"
              onClick={() => {
                this.props.navigate("/home");
              }}
            ></div>
            <div className="menu">
              <li>
                <a>
                  SẢN PHẨM
                </a>
                <ul className="sub-menu">
                  {codePetType.map((type) => (
                    <li key={type.Code}>
                      <a onClick={() => this.handlePetTypeFilter(type.Code)}>
                        {type.CodeValueVI}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <a onClick={() => this.handlePromotionFilter()}>
                  ƯU ĐÃI
                </a>
              </li>
              <li>
                <a onClick={() => this.props.navigate("/appointment")}>
                  DỊCH VỤ
                </a>
              </li>
              {isLoggedIn && accountInfo ? (
                accountInfo.AccountType === "C" ? (
                  <li>
                    <a onClick={() => this.props.navigate("/information")}>
                      LIÊN HỆ
                    </a>
                  </li>
                ) : (
                  <li>
                    <a onClick={() => this.handleAccountTypeNavigate(accountInfo.AccountType)}>
                      QUẢN TRỊ
                    </a>
                  </li>
                )
              ) : (
                <li>
                  <a onClick={() => this.props.navigate("/information")}>
                    LIÊN HỆ
                  </a>
                </li>
              )}
            </div>
            <div className="others">
              <li>
                <a href="/cart" className="shopping-bag">
                  <IonIcon icon={cart}></IonIcon>
                  {cartItemsCount > 0 && (
                    <span className="cart-bubble">{cartItemsCount}</span>
                  )}
                </a>
              </li>
              <li>
                {isLoggedIn ? (
                  <div className="user f" id="user-icon">
                    <img src={userImage} />
                    <p>{userName}</p>
                    <ul className="sub-menu">
                      <li>
                        <div
                          className="f"
                          onClick={() => this.props.navigate("/user/customer")}
                        >
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
                      <a onClick={() => this.props.navigate("/login")}>
                        <p>Đăng nhập</p>
                      </a>
                      <p>|</p>
                      <a onClick={() => this.props.navigate("/register")}>
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

// Map state từ Redux store vào props
const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  cartItems: state.cart.cartItems,
  isUpdateCartCount: state.cart.isUpdateCartCount,
});

// Map dispatch để gửi action lên store
const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  clearCheckOutCart: () => dispatch(clearCheckOutCart()),
});
export default connect(mapStateToProps, mapDispatchToProps)(HomeHeader);
