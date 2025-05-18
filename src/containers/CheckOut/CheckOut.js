import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';

import './CheckOut.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import { IonIcon } from '@ionic/react';

import { chevronBackOutline } from 'ionicons/icons';

import { handleGetAccountInfoApi, handleLogoutApi } from '../../services/accountServices';
import { handleGetCartDetailApi } from '../../services/cartServices';
import { handleCreateInvoiceApi } from '../../services/invoiceServices';
import { handleGetAllCodesApi, handleCheckCouponApi, handleGetCouponApi } from '../../services/utilitiesServices';

import { checkLoginStatus } from '../../utils/pakage';
import { clearCart, clearCheckOutCart, saveCartForCheckOut, userLogin, userLogout } from '../../store/actions';

import cart from '../../assets/icons/shopping-cart.png';
import card from '../../assets/icons/cheque.png';
import visa from '../../assets/icons/visa.png';
import mastercard from '../../assets/icons/card.png';

class CheckOut extends Component {
  state = {
    isLoading: true,
    isLoggedIn: false,
    accountInfo: null,
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    couponCode: '',
    tempCouponCode: '',
    codePaymentType: [],
    codeShippingMethod: [],
    selectedPaymentType: '',
    selectedShippingMethod: '',
    checkOutCart: [],
    loadedCheckOutCartDetailInfo: [],
    totalPrice: 0,
    totalPriceAfterPromo: 0,
    discountAmout: 0,
    totalPayment: 0,
    isBuyNow: false,
    isPlaced: false,
    invoiceID: null,
    currentPage: 1,
    tempCurrentPage: '1',
    limitProductPerQuery: 5,
    totalPages: 1,
    triggerCountCartItem: false,
  };

  async componentDidMount() {
    await this.handleIsLogin();
    await this.loadAllCodes();
    await this.loadCheckOutCart();
    setTimeout(() => {
      this.loadReceiverInfo();
      this.loadCheckOutCartInfo();
    }, 10);
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        this.loadReceiverInfo();
      }, 10);
    }
    if (prevProps.checkoutCarts !== this.props.checkoutCarts) {
      await this.loadCheckOutCart();
      setTimeout(() => {
        this.loadCheckOutCartInfo();
      }, 10);
    }
  }

  loadAllCodes = async () => {
    try {
      await this.loadPaymentType();
      await this.loadShippingMethod();
    } catch (e) {
      console.log('Error loading allcodes data:', e);
      toast.error('Lỗi khi tải dữ liệu!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  loadPaymentType = async () => {
    try {
      const codePaymentType = await handleGetAllCodesApi('PaymentType');
      if (!codePaymentType || codePaymentType.length === 0) {
        toast.error('Không thể tải phương thức thanh toán!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePaymentType,
        selectedPaymentType: codePaymentType.length > 0 ? codePaymentType[0].Code : '',
      });
    } catch (e) {
      console.log('Error loading paymenttype code:', e);
      toast.error('Lỗi khi tải phương thức thanh toán!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  loadShippingMethod = async () => {
    try {
      const codeShippingMethod = await handleGetAllCodesApi('ShippingMethod');
      if (!codeShippingMethod || codeShippingMethod.length === 0) {
        toast.error('Không thể tải cách thức vận chuyển!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeShippingMethod,
        selectedShippingMethod: codeShippingMethod.length > 0 ? codeShippingMethod[0].Code : '',
      });
    } catch (e) {
      console.log('Error loading shippingmethod code:', e);
      toast.error('Lỗi khi tải cách thức vận chuyển!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  triggerCountCartItem = () => {
    this.setState((prevState) => ({
      triggerCountCartItem: !prevState.triggerCountCartItem,
    }));
  };

  handleIsLogin = async () => {
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          accountInfo,
          isLoggedIn: true,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          accountInfo: null,
          isLoggedIn: false,
        });
      }
    } catch (e) {
      this.props.navigate('/home');
      console.log('Token not found!');
    }
    this.triggerCountCartItem();
  };

  loadReceiverInfo = async () => {
    const { isLoggedIn, accountInfo } = this.state;
    if (isLoggedIn) {
      try {
        const response = await handleGetAccountInfoApi(accountInfo.AccountID);
        if (response && response.errCode === 0) {
          const userInfo = response.data;
          this.setState({
            receiverName: userInfo.UserName,
            receiverPhone: userInfo.Phone,
            receiverAddress: userInfo.Address,
          });
        } else {
          toast.error('Tải thông tin người dùng thất bại!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        }
      } catch (e) {
        console.log(e);
        toast.error('Lỗi khi tải thông tin người dùng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    }
  };

  loadCheckOutCart = async () => {
    const { checkOutCarts } = this.props;
    if (!checkOutCarts || checkOutCarts.length === 0) {
      toast.error('Giỏ hàng không tồn tại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      this.setState({ isExpired: true });
      this.props.navigate('/cart');
      return;
    } else {
      const checkOutCart = checkOutCarts[0];
      const now = new Date().getTime();
      const expiresAt = parseInt(checkOutCart.expiresAt);
      const timeLeft = expiresAt - now;
      if (timeLeft <= -5000) {
        toast.error('Giỏ hàng thanh toán đã hết hạn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.props.clearCheckOutCart();
        this.setState({ isExpired: true, checkOutCarts: null });
        this.props.navigate('/cart');
        return;
      } else if (timeLeft <= 10 * 60 * 1000) {
        const newExpiresAt = now + 60 * 60 * 1000;
        this.props.saveCartForCheckOut(checkOutCart.cartItems, checkOutCart.AccountID, newExpiresAt, false);
        this.setState({
          isExpired: false,
          checkOutCart: checkOutCart.cartItems,
          isBuyNow: checkOutCart.isBuyNow,
        });
      } else {
        this.setState({
          isExpired: false,
          checkOutCart: checkOutCart.cartItems,
          isBuyNow: checkOutCart.isBuyNow,
        });
      }
    }
  };

  loadCheckOutCartInfo = async () => {
    try {
      const { checkOutCart, limitProductPerQuery } = this.state;
      const responseDetail = await handleGetCartDetailApi(JSON.stringify(checkOutCart));
      if (responseDetail && responseDetail.errCode === 0) {
        const checkOutCart = responseDetail.data;
        let totalPrice = 0;
        for (let i = 0; i < checkOutCart.length; i++) {
          if (checkOutCart[i].ProductPrice > 0) {
            totalPrice += checkOutCart[i].ProductPrice * checkOutCart[i].ItemQuantity;
          }
        }
        let totalPriceAfterPromo = 0;
        for (let i = 0; i < checkOutCart.length; i++) {
          let productPrice = 0;
          if (checkOutCart[i].ProductPrice > 0) {
            productPrice = checkOutCart[i].ProductPrice;
          }
          if (checkOutCart[i].Promotion) {
            productPrice *= (100 - parseFloat(checkOutCart[i].Promotion, 10)) / 100;
          }
          totalPriceAfterPromo += productPrice * checkOutCart[i].ItemQuantity;
        }
        this.setState({
          loadedCheckOutCartDetailInfo: checkOutCart,
          totalPages: Math.ceil(checkOutCart.length / limitProductPerQuery),
          totalPrice,
          totalPriceAfterPromo,
          isLoading: false,
        });
        setTimeout(() => {
          this.handleCalculateTotalPayment();
        }, 10);
      } else {
        toast.error('Tải chi tiết giỏ hàng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải chi tiết giỏ hàng!');
    }
  };

  handleApplyCouponCode = async () => {
    const { tempCouponCode, couponCode, totalPriceAfterPromo, selectedShippingMethod, codeShippingMethod } = this.state;
    const shipValue = parseFloat(codeShippingMethod.find((method) => method.Code === selectedShippingMethod).ExtraValue);
    let finalPrice = totalPriceAfterPromo + shipValue;
    if (tempCouponCode !== couponCode) {
      try {
        const response = await handleGetCouponApi(tempCouponCode);
        console.log(response)
        if (response && response.data.errCode === 0 &&
          parseFloat(finalPrice) > parseFloat(response.data.data.MinOrderValue) && response.data.data.CouponStatus === "ACTIVE") {
          this.setState({ isLoading: true });
          toast.success('Áp dụng mã giảm giá thành công!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          this.setState({ couponCode: tempCouponCode, isLoading: false });
        } else {
          toast.error('Áp dụng mã giảm giá thất bại', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          this.setState({ couponCode: '' });
        }
      } catch (e) {
        console.log(e);
        toast.error('Lỗi khi tải thông tin giảm giá!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    }
    setTimeout(() => {
      this.handleCalculateTotalPayment();
    }, 10);
  };

  handleCalculateTotalPayment = async () => {
    const { totalPriceAfterPromo, couponCode, selectedShippingMethod, codeShippingMethod } = this.state;
    const shipValue = parseFloat(codeShippingMethod.find((method) => method.Code === selectedShippingMethod).ExtraValue);
    let finalPrice = totalPriceAfterPromo + shipValue;
    let discount = 0;
    if (couponCode) {
      try {
        const response = await handleCheckCouponApi(couponCode, finalPrice);
        if (response && response.data.errCode === 0) {
          discount = response.data.data;
          this.setState({ discountAmout: discount });
        } else {
          this.setState({ discountAmout: 0 });
        }
      } catch (e) {
        console.log(e);
        toast.error('Lỗi khi tải thông tin giảm giá!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    }
    const totalPayment = finalPrice - discount;
    this.setState({
      totalPayment,
    });
  };

  handleOnChangeInput = (event, type) => {
    if (type === 'tempCouponCode') {
      this.setState({ couponCode: '' });
    }
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

  handleShippingMethodChange = (event) => {
    this.setState({ selectedShippingMethod: event.target.value }, () => {
      this.handleCalculateTotalPayment();
    });
  };

  handlePaymentTypeChange = (event) => {
    this.setState({ selectedPaymentType: event.target.value });
  };

  handleFirstPage = () => {
    this.setState({ currentPage: 1, tempCurrentPage: 1 });
  };

  handlePrevPage = () => {
    this.setState((prevState) => ({
      currentPage: Math.max(1, prevState.currentPage - 1),
      tempCurrentPage: Math.max(1, prevState.currentPage - 1),
    }));
  };

  handleNextPage = () => {
    this.setState((prevState) => ({
      currentPage: Math.min(prevState.totalPages, prevState.currentPage + 1),
      tempCurrentPage: Math.min(prevState.totalPages, prevState.currentPage + 1),
    }));
  };

  handleLastPage = () => {
    this.setState((prevState) => ({
      currentPage: prevState.totalPages,
      tempCurrentPage: prevState.totalPages,
    }));
  };

  handlePageInputChange = (e) => {
    const value = e.target.value;
    this.setState({ tempCurrentPage: value });
  };

  handlePageKeyDown = (e) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(this.state.tempCurrentPage, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.state.totalPages) {
        this.setState({ currentPage: pageNumber });
      } else {
        this.setState({ currentPage: 1, tempCurrentPage: 1 });
      }
    }
  };

  handlePageInputBlur = () => {
    const { tempCurrentPage, totalPages } = this.state;
    const pageNumber = parseInt(tempCurrentPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      this.setState({ currentPage: pageNumber });
    } else {
      this.setState({ currentPage: 1, tempCurrentPage: 1 });
    }
  };

  handleCompleteOrder = async () => {
    const { receiverName, receiverPhone, receiverAddress, isLoggedIn, accountInfo, checkOutCart, selectedPaymentType, selectedShippingMethod, couponCode, totalPriceAfterPromo, discountAmout, totalPayment } = this.state;
    await this.loadCheckOutCart();
    let couponID = null;
    try {
      const response = await handleGetCouponApi(couponCode);
      if (response && response.data.errCode === 0) {
        couponID = response.data.data.CouponID;
      }
    } catch (e) {
      console.log(e);
      toast.error('Lỗi khi tải thông tin giảm giá!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    const shippingStatus = 'PEND';
    let paymentStatus = 'FAIL';
    let cardInfo = null;
    if (!receiverName || !receiverPhone || !receiverAddress) {
      toast.info('Vui lòng nhập đầy đủ thông tin giao hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    if (selectedPaymentType === 'CARD') {
      const cardNumber = document.querySelector('input[name="card-number"]').value;
      const cardholderName = document.querySelector('input[name="cardholder-name"]').value;
      const expiryDate = document.querySelector('input[name="expiry-date"]').value;
      const cvv = document.querySelector('input[name="cvv"]').value;
      if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
        toast.info('Vui lòng nhập đầy đủ thông tin thẻ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }
      cardInfo = {
        cardNumber,
        cardholderName,
        expiryDate,
        cvv,
      };
      paymentStatus = 'PAID';
    } else if (selectedPaymentType === 'CASH') {
      paymentStatus = 'PEND';
    }
    const invoiceData = {
      accountid: isLoggedIn ? accountInfo.AccountID : null,
      receivername: receiverName,
      receiverphone: receiverPhone,
      receiveraddress: receiverAddress,
      cartItems: checkOutCart.map((item) => ({
        productid: item.ProductID,
        productdetailid: item.ProductDetailID,
        itemprice: item.ItemPrice,
        itemquantity: item.ItemQuantity,
      })),
      totalquantity: checkOutCart.length,
      totalprice: totalPriceAfterPromo,
      discountamount: discountAmout,
      totalpayment: totalPayment,
      paymentstatus: paymentStatus,
      shippingstatus: shippingStatus,
      paymenttype: selectedPaymentType,
      shippingmethod: selectedShippingMethod,
      couponid: couponID,
      cartinfo: cardInfo,
    };
    this.setState({ isLoading: true });
    try {
      const response = await handleCreateInvoiceApi(invoiceData);
      if (response && response.errCode === 0) {
        this.props.clearCheckOutCart();
        this.props.clearCart();
        this.setState({
          invoiceID: response.data,
          isPlaced: true,
          checkOutCart: [],
          loadedCheckOutCartDetailInfo: [],
        });
        toast.success(
          <div>
            Đặt hàng thành công! Mã đơn hàng: {response.data}
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => this.props.navigate(`/bill/${response.data}`)}
                style={{
                  marginRight: '10px',
                  color: 'blue',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                }}
              >
                Xem chi tiết
              </button>
              <button
                onClick={() => this.props.navigate('/home')}
                style={{
                  color: 'blue',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                }}
              >
                Về trang chủ
              </button>
            </div>
          </div>,
          {
            autoClose: 5000,
            closeOnClick: false,
            onClose: () => {
              this.props.clearCheckOutCart();
              this.props.navigate('/home');
            },
          }
        );
      } else {
        toast.error(response.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ isLoading: false });
    } catch (e) {
      toast.error('Lỗi khi tạo đơn hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { isLoading, receiverName, receiverPhone, receiverAddress, tempCouponCode, codePaymentType, codeShippingMethod, selectedPaymentType, selectedShippingMethod, discountAmout, loadedCheckOutCartDetailInfo, totalPrice, totalPriceAfterPromo, totalPayment, currentPage, limitProductPerQuery, totalPages, tempCurrentPage, isPlaced } = this.state;

    const startIndex = (currentPage - 1) * limitProductPerQuery;
    const endIndex = startIndex + limitProductPerQuery;
    const paginatedCheckOutCartDetailInfo = loadedCheckOutCartDetailInfo.slice(startIndex, endIndex);
    return (
      <div className="none-logged-body">
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
        <ToastContainer />
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            <div className="container-checkout">
              <div className="pay-top-warp">
                <div className="pay-top">
                  <div className="pay-top-cart pay-top-item">
                    <img src={cart} alt="Cart" />
                  </div>
                  <div className="pay-top-moneycheck pay-top-item">
                    <img src={card} alt="Payment" />
                  </div>
                </div>
              </div>
              <div className="delivery-content-left-button row">
                <a href="/cart" className="f">
                  <IonIcon icon={chevronBackOutline}></IonIcon>
                  <p
                    style={{
                      color: 'rgba(91, 82, 82)',
                      fontWeight: 'bold',
                    }}
                  >
                    TRỞ LẠI
                  </p>
                </a>
              </div>
            </div>
            <div className="pay" style={{ marginBottom: '100px' }}>
              <div className="container-checkout">
                <div className="pay-content row">
                  <div className="delivery-content-left">
                    <p style={{ fontWeight: 'bold' }}>Thông tin khách hàng</p>
                    <div className="delivery-content-left-input-top-none-logged">
                      <div className="delivery-content-left-input-top-item-none-logged">
                        <label>Họ tên</label>
                        <input type="text" value={receiverName} onChange={(event) => this.handleOnChangeInput(event, 'receiverName')} />
                      </div>
                      <div className="delivery-content-left-input-top-item-none-logged">
                        <label>Số điện thoại</label>
                        <input type="text" value={receiverPhone} onChange={(event) => this.handleOnChangeInput(event, 'receiverPhone')} />
                      </div>
                      <div className="delivery-content-left-input-top-item-none-logged">
                        <label>Địa chỉ</label>
                        <input type="text" value={receiverAddress} onChange={(event) => this.handleOnChangeInput(event, 'receiverAddress')} />
                      </div>
                      <div className="delivery-content-left-input-top-item-none-logged">
                        <label>Mã giảm giá</label>
                        <div className="f">
                          <input type="text" value={tempCouponCode} onChange={(event) => this.handleOnChangeInput(event, 'tempCouponCode')} />
                          <button onClick={this.handleApplyCouponCode}>Áp dụng</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pay-content-left">
                    <div className="pay-content-left-method-delivery">
                      <p style={{ fontWeight: 'bold' }}>Phương thức giao hàng</p>
                      {codeShippingMethod.length > 0 ? (
                        codeShippingMethod.map((method, index) => (
                          <div key={index} className="pay-content-left-method-delivery-item">
                            <input type="radio" value={method.Code} checked={selectedShippingMethod === method.Code} onChange={this.handleShippingMethodChange} />
                            <label htmlFor={method.Code}>
                              {method.CodeValueVI} ({method.Code === 'FAST' ? '3-7 ngày' : method.Code === 'ECO' ? '7-14 ngày' : '~1 ngày'})
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="pay-content-left-method-delivery-item">
                          <label>Không có cách thức giao hàng</label>
                        </div>
                      )}
                    </div>
                    <div className="pay-content-left-method-payment">
                      <p style={{ fontWeight: 'bold' }}>Phương thức thanh toán</p>
                      <p>
                        <u>
                          <i style={{ color: 'blue' }}>*Lưu ý:</i>
                        </u>{' '}
                        Thông tin thẻ không được lưu lại
                      </p>
                      {codePaymentType.length > 0 ? (
                        codePaymentType.map((type, index) => (
                          <div key={index} className="pay-content-left-method-payment-item">
                            <input type="radio" name="paymentType" value={type.Code} checked={selectedPaymentType === type.Code} onChange={this.handlePaymentTypeChange} />
                            <label htmlFor={type.Code}>{type.CodeValueVI}</label>
                          </div>
                        ))
                      ) : (
                        <div className="pay-content-left-method-payment-item">
                          <input type="radio" defaultChecked />
                          <label>Thanh toán bằng tiền mặt</label>
                        </div>
                      )}
                      <div className="pay-content-left-method-payment-item-img">
                        <img src={visa} alt="Visa" />
                        <img src={mastercard} alt="MasterCard" />
                      </div>
                      {selectedPaymentType === 'CARD' && (
                        <div className="pay-content-left-method-payment-item-input block">
                          <p style={{ fontWeight: 'bold' }}>Nhập thông tin thẻ</p>
                          <input type="text" name="card-number" maxLength="16" pattern="[0-9]{13,16}" placeholder="Số thẻ (13-16 chữ số)" />
                          <input type="text" name="cardholder-name" placeholder="Tên trên thẻ" />
                          <input type="text" name="expiry-date" pattern="(0[1-9]|1[0-2])/[0-9]{2}" placeholder="MM/YY" />
                          <input type="text" name="cvv" maxLength="3" pattern="[0-9]{3}" placeholder="CVV" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pay-content-right">
                    <table>
                      <thead>
                        <tr>
                          <th>Tên Sản Phẩm</th>
                          <th>Hình ảnh</th>
                          <th>Loại</th>
                          <th>Số Lượng</th>
                          <th>Đơn giá</th>
                          <th>Khuyến mãi</th>
                          <th>Thành Tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCheckOutCartDetailInfo.length > 0 ? (
                          paginatedCheckOutCartDetailInfo.map((item, index) => (
                            <tr key={index} className="pay-content-right-item">
                              <td>
                                <p>{item.ProductName}</p>
                              </td>
                              <td>
                                <img src={item.ProductImage} alt="" style={{ width: '50px', height: '50px' }} />
                              </td>
                              <td>
                                <p>{item.DetailName}</p>
                              </td>
                              <td>
                                <p>{item.ItemQuantity}</p>
                              </td>
                              <td>
                                <div className="f">
                                  <p>{item.ProductPrice}</p>
                                  <sup>đ</sup>
                                </div>
                              </td>
                              <td>
                                {' '}
                                <p>{item.Promotion > 0 ? parseFloat(item.Promotion, 10) + '%' : ''}</p>
                              </td>
                              <td>
                                <div className="f">
                                  <p>{item.ItemPrice}</p>
                                  <sup>đ</sup>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>
                              Giỏ hàng trống
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="6">Tổng sản phẩm</td>
                          <td>{loadedCheckOutCartDetailInfo.length > 0 ? `${loadedCheckOutCartDetailInfo.length} sản phẩm` : ''}</td>
                        </tr>
                        <tr>
                          <td colSpan="6">Tổng tiền hàng (trước giảm giá)</td>
                          <td>
                            <div className="f">
                              {totalPrice > 0 ? (
                                <>
                                  <p>{totalPrice}</p>
                                  <sup>đ</sup>
                                </>
                              ) : (
                                ''
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6">Tổng tiền hàng (sau giảm giá)</td>
                          <td>
                            <div className="f">
                              {totalPriceAfterPromo > 0 ? (
                                <>
                                  <p>{totalPriceAfterPromo}</p>
                                  <sup>đ</sup>
                                </>
                              ) : (
                                ''
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6">{codeShippingMethod.find((method) => method.Code === selectedShippingMethod).CodeValueVI}</td>
                          <td>
                            <div className="f">
                              <p>{parseFloat(codeShippingMethod.find((method) => method.Code === selectedShippingMethod).ExtraValue)}</p>
                              <sup>đ</sup>
                            </div>
                          </td>
                        </tr>
                        {discountAmout > 0 ? (
                          <tr className="discount">
                            <td colSpan="6">Số tiền giảm</td>
                            <td>
                              <div className="f">
                                <>
                                  <p>-{parseFloat(discountAmout)}</p>
                                  <sup>đ</sup>
                                </>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          ''
                        )}
                        <tr className="total">
                          <td colSpan="6" style={{ fontWeight: 'bold' }}>
                            TỔNG THANH TOÁN
                          </td>
                          <td>
                            <p>
                              <b>{totalPayment}</b>
                              <sup>
                                <b>đ</b>
                              </sup>
                            </p>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    {totalPages > 1 && (
                      <div className="page-content">
                        <div className="page-content-item">
                          <button className="first" onClick={this.handleFirstPage} disabled={currentPage === 1}>
                            <p> {'<<'}</p>
                          </button>
                          <button className="prev" onClick={this.handlePrevPage} disabled={currentPage === 1}>
                            <p> {'<'}</p>
                          </button>
                          <input type="text" value={tempCurrentPage} onChange={this.handlePageInputChange} onKeyDown={this.handlePageKeyDown} onBlur={this.handlePageInputBlur} />
                          <span className="total-pages">/ {totalPages}</span>
                          <button className="next" onClick={this.handleNextPage} disabled={currentPage === totalPages}>
                            <p>{'>'}</p>
                          </button>
                          <button className="last" onClick={this.handleLastPage} disabled={currentPage === totalPages}>
                            <p>{'>>'}</p>
                          </button>
                        </div>
                      </div>
                    )}
                    <div>
                      {!isPlaced && loadedCheckOutCartDetailInfo.length > 0 ? (
                        <button className="pay-content-right-button" onClick={this.handleCompleteOrder} disabled={isLoading} style={{ opacity: isLoading ? 0.5 : 1 }}>
                          {isLoading ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
                        </button>
                      ) : (
                        <div style={{ color: 'green', fontWeight: 'bold' }}>{loadedCheckOutCartDetailInfo.length === 0 ? 'Giỏ hàng trống, vui lòng chọn lại sản phẩm!' : 'Đơn hàng đã được đặt thành công!'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  checkOutCarts: state.cart.checkOutCarts,
});

const mapDispatchToProps = (dispatch) => ({
  clearCart: () => dispatch(clearCart()),
  clearCheckOutCart: () => dispatch(clearCheckOutCart()),
  saveCartForCheckOut: (checkOutCart, accountID, expiresAt, isBuyNow) => dispatch(saveCartForCheckOut(checkOutCart, accountID, expiresAt, isBuyNow)),
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CheckOut);
