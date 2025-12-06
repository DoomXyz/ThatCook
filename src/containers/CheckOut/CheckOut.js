import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import Chat from '../../components/Chat';
import { arrowBackOutline, cartOutline, cardOutline } from 'ionicons/icons';

import './CheckOut.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import { handleGetAccountInfoApi, handleLogoutApi } from '../../services/accountServices';
import { handleGetCartDetailApi } from '../../services/cartServices';
import { handleCreateInvoiceApi } from '../../services/invoiceServices';
import { handleCheckCouponApi, handleGetCouponApi } from '../../services/couponServices';

import { checkLoginStatus, getAllCodes } from '../../utils/pakage';
import { clearCart, clearCheckOutCart, saveCartForCheckOut, userLogin, userLogout, saveTrackInfo } from '../../store/actions';

import visa from '../../assets/icons/visa.png';
import mastercard from '../../assets/icons/card.png';

class CheckOut extends Component {
  state = {
    isLoading: true,
    isLoggedIn: false,
    accountInfo: null,
    ReceiverName: '',
    ReceiverPhone: '',
    ReceiverAddress: '',
    ReceiverEmail: '',
    PaymentType: '',
    ShippingMethod: '',
    CouponCode: '',
    tempCouponCode: '',
    codePaymentType: [],
    codeShippingMethod: [],
    checkOutCart: [],
    loadedCheckOutCartDetailInfo: [],
    TotalPrice: 0,
    totalPriceAfterPromo: 0,
    DiscountAmount: 0,
    TotalPayment: 0,
    isBuyNow: false,
    isPlaced: false,
    InvoiceID: null,
    vnpayUrl: null, // State mới để lưu URL redirect VNPay
    currentPage: 1,
    tempCurrentPage: '1',
    limitProductPerQuery: 5,
    totalPages: 1,
    triggerCountCartItem: false,
  };

  async componentDidMount() {
    await this.handleLoadCode(['PaymentType', 'ShippingMethod']);
    await this.handleIsLogin();
    await this.loadCheckOutCart();
    setTimeout(() => {
      this.loadReceiverInfo();
      this.loadCheckOutCartInfo();
    }, 10);
  }

  async componentDidUpdate(prevProps, prevState) {
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

  handleLoadCode = async (codeTypeFilter) => {
    try {
      const responses = await Promise.all(codeTypeFilter.map((type) => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypeFilter.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        newState[type] = response.data.length > 0 ? response.data[0].Code : '';
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
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
    }
    this.setState({
      isLoading: false,
    });
  };

  triggerCountCartItem = () => {
    this.setState((prevState) => ({
      triggerCountCartItem: !prevState.triggerCountCartItem,
    }));
  };

  loadReceiverInfo = async () => {
    const { isLoggedIn, accountInfo } = this.state;
    if (isLoggedIn) {
      try {
        const response = await handleGetAccountInfoApi(accountInfo.AccountID);
        if (response && response.errCode === 0) {
          const userInfo = response.data;
          this.setState({
            ReceiverName: userInfo.UserName,
            ReceiverPhone: userInfo.Phone,
            ReceiverAddress: userInfo.Address,
          });
        } else {
          toast.error('Tải thông tin người dùng thất bại!');
        }
      } catch (e) {
        console.log(e);
        toast.error('Lỗi khi tải thông tin người dùng!');
      }
    }
  };

  loadCheckOutCart = async () => {
    const { checkOutCarts } = this.props;
    if (!checkOutCarts || checkOutCarts.length === 0) {
      toast.error('Giỏ hàng không tồn tại!');
      this.setState({ isExpired: true });
      this.props.navigate('/cart');
      return;
    } else {
      const checkOutCart = checkOutCarts[0];
      const now = new Date().getTime();
      const expiresAt = parseInt(checkOutCart.expiresAt);
      const timeLeft = expiresAt - now;
      if (timeLeft <= -5000) {
        toast.error('Giỏ hàng thanh toán đã hết hạn!');
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
        let TotalPrice = 0;
        for (let i = 0; i < checkOutCart.length; i++) {
          if (checkOutCart[i].ProductPrice > 0) {
            TotalPrice += checkOutCart[i].ProductPrice * checkOutCart[i].ItemQuantity;
          }
        }
        let totalPriceAfterPromo = 0;
        for (let i = 0; i < checkOutCart.length; i++) {
          let ProductPrice = 0;
          if (checkOutCart[i].ProductPrice > 0) {
            ProductPrice = checkOutCart[i].ProductPrice;
          }
          if (checkOutCart[i].Promotion) {
            ProductPrice *= (100 - parseFloat(checkOutCart[i].Promotion, 10)) / 100;
          }
          totalPriceAfterPromo += ProductPrice * checkOutCart[i].ItemQuantity;
        }
        this.setState({
          loadedCheckOutCartDetailInfo: checkOutCart,
          totalPages: Math.ceil(checkOutCart.length / limitProductPerQuery),
          TotalPrice,
          totalPriceAfterPromo,
          isLoading: false,
        });
        setTimeout(() => {
          this.handleCalculateTotalPayment();
        }, 10);
      } else {
        toast.error('Tải chi tiết giỏ hàng thất bại!');
      }
    } catch (e) {
      console.log('Lỗi khi tải chi tiết giỏ hàng!');
    }
  };

  handleApplyCouponCode = async () => {
    const { tempCouponCode, CouponCode, totalPriceAfterPromo, ShippingMethod, codeShippingMethod } = this.state;
    const shipValue = parseFloat(codeShippingMethod.find((method) => method.Code === ShippingMethod).ExtraValue);
    let finalPrice = totalPriceAfterPromo + shipValue;
    if (tempCouponCode !== CouponCode) {
      try {
        const responseApi = await handleGetCouponApi(tempCouponCode);
        const response = responseApi.data;
        if (response && response.errCode === 0 && parseFloat(finalPrice) > parseFloat(response.data.MinOrderValue) && response.data.CouponStatus === 'ACTIVE') {
          this.setState({ isLoading: true });
          toast.success('Áp dụng mã giảm giá thành công!');
          this.setState({ CouponCode: tempCouponCode, isLoading: false });
        } else {
          toast.error('Áp dụng mã giảm giá thất bại');
          this.setState({ CouponCode: '' });
        }
      } catch (e) {
        console.log(e);
        toast.error('Lỗi khi tải thông tin giảm giá!');
      }
    }
    setTimeout(() => {
      this.handleCalculateTotalPayment();
    }, 10);
  };

  handleCalculateTotalPayment = async () => {
    const { totalPriceAfterPromo, CouponCode, ShippingMethod, codeShippingMethod } = this.state;
    const shipValue = parseFloat(codeShippingMethod.find((method) => method.Code === ShippingMethod).ExtraValue);
    let finalPrice = totalPriceAfterPromo + shipValue;
    let discount = 0;
    if (CouponCode) {
      try {
        console.log(CouponCode, finalPrice);
        const responseApi = await handleCheckCouponApi(CouponCode, finalPrice);
        const response = responseApi.data;
        console.log(response.data);
        if (response && response.errCode === 0) {
          discount = response.data;
          this.setState({ DiscountAmount: discount });
        } else {
          this.setState({ DiscountAmount: 0 });
        }
      } catch (e) {
        console.log(e);
        toast.error('Lỗi khi tải thông tin giảm giá!');
      }
    }
    const TotalPayment = finalPrice - discount;
    this.setState({
      TotalPayment,
    });
  };

  handleOnChangeInput = (event, type) => {
    if (type === 'tempCouponCode') {
      this.setState({ CouponCode: '' });
    }
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
    if (type === 'ShippingMethod') {
      setTimeout(() => {
        this.handleCalculateTotalPayment();
      }, 10);
    }
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
    const { ReceiverName, ReceiverPhone, ReceiverAddress, ReceiverEmail, isLoggedIn, accountInfo, checkOutCart, PaymentType, ShippingMethod, CouponCode, totalPriceAfterPromo, DiscountAmount, TotalPayment, isBuyNow } = this.state;

    await this.loadCheckOutCart();
    let CouponID = null;
    try {
      const response = await handleGetCouponApi(CouponCode);
      if (response && response.data.errCode === 0) {
        CouponID = response.data.data.CouponID;
      }
    } catch (e) {
      console.log(e);
      toast.error('Lỗi khi tải thông tin giảm giá!');
    }
    const ShippingStatus = 'PEND';
    let PaymentStatus = 'FAIL';
    let cartInfo = null;
    if (!ReceiverName || !ReceiverPhone || !ReceiverAddress) {
      toast.info('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }
    if (PaymentType === 'CARD' || PaymentType === 'QR') {
      PaymentStatus = 'PEND'; // Pending cho VNPay redirect
    } else if (PaymentType === 'CASH') {
      PaymentStatus = 'PEND';
    }
    if (ReceiverEmail) {
      const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+.[^\s@]+$/;
      if (!emailRegex.test(ReceiverEmail)) {
        toast.error('Email sai định dạng!');
        return;
      }
    }
    const invoiceData = {
      AccountID: isLoggedIn ? accountInfo.AccountID : null,
      ReceiverName,
      ReceiverPhone,
      ReceiverAddress,
      Email: ReceiverEmail ? ReceiverEmail : null,
      cartItems: checkOutCart.map((item) => ({
        ProductID: item.ProductID,
        ProductDetailID: item.ProductDetailID,
        ItemPrice: item.ItemPrice,
        ItemQuantity: item.ItemQuantity,
      })),
      TotalQuantity: checkOutCart.length,
      TotalPrice: totalPriceAfterPromo,
      DiscountAmount,
      TotalPayment,
      PaymentStatus,
      ShippingStatus,
      PaymentType,
      ShippingMethod,
      CouponID,
      cartInfo,
      isBuyNow,
    };
    this.setState({ isLoading: true });
    try {
      const response = await handleCreateInvoiceApi(invoiceData);
      if (response && response.errCode === 0) {
        this.props.clearCheckOutCart();
        this.props.clearCart();
        this.setState({
          InvoiceID: response.data.InvoiceID,
          isPlaced: true,
          checkOutCart: [],
          loadedCheckOutCartDetailInfo: [],
          vnpayUrl: response.data.vnpayUrl || null,
        });
        console.log('response.data.vnpayUrl', response.data.vnpayUrl);
        toast.success('Đặt hàng thành công!');
        this.props.saveTrackInfo({ BillID: response.data.InvoiceID, BillType: 1 });
        if ((PaymentType === 'CARD' || PaymentType === 'QR') && response.data.vnpayUrl) {
          // Redirect đến trang VNPay
          window.location.href = response.data.vnpayUrl;
        } else {
          this.props.navigate('/track');
        }
      } else {
        toast.error(response.errMessage);
      }
      this.setState({ isLoading: false });
    } catch (e) {
      toast.error('Lỗi khi tạo đơn hàng!');
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { isLoading, ReceiverName, ReceiverPhone, ReceiverAddress, ReceiverEmail, tempCouponCode, codePaymentType, codeShippingMethod, PaymentType, ShippingMethod, DiscountAmount, loadedCheckOutCartDetailInfo, TotalPrice, totalPriceAfterPromo, TotalPayment, currentPage, limitProductPerQuery, totalPages, tempCurrentPage, isPlaced } = this.state;

    const startIndex = (currentPage - 1) * limitProductPerQuery;
    const endIndex = startIndex + limitProductPerQuery;
    const paginatedCheckOutCartDetailInfo = loadedCheckOutCartDetailInfo.slice(startIndex, endIndex);
    return (
      <div className="none-logged-body">
        <ToastContainer autoClose={500} newestOnTop={true} closeOnClick={false} pauseOnFocusLoss={false} draggable={true} transition={Slide} limit={1} />
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            <div className="container-checkout">
              <div className="pay-top-warp">
                <div className="pay-top">
                  <div className="pay-top-cart pay-top-item">
                    <IonIcon icon={cartOutline}></IonIcon>
                  </div>
                  <div className="pay-top-moneycheck pay-top-item">
                    <IonIcon icon={cardOutline}></IonIcon>
                  </div>
                </div>
              </div>
              <div className="delivery-content-left-button row">
                <a href="/cart" className="f">
                  <IonIcon icon={arrowBackOutline}></IonIcon>
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
                        <input type="text" value={ReceiverName} onChange={(event) => this.handleOnChangeInput(event, 'ReceiverName')} />
                      </div>
                      <div className="delivery-content-left-input-top-item-none-logged">
                        <label>Số điện thoại</label>
                        <input type="text" value={ReceiverPhone} onChange={(event) => this.handleOnChangeInput(event, 'ReceiverPhone')} />
                      </div>
                      <div className="delivery-content-left-input-top-item-none-logged">
                        <label>Địa chỉ</label>
                        <input type="text" value={ReceiverAddress} onChange={(event) => this.handleOnChangeInput(event, 'ReceiverAddress')} />
                      </div>
                      <div className="delivery-content-left-input-top-item-none-logged">
                        <label>Email</label>
                        <input type="text" value={ReceiverEmail} placeholder="Nhập Email nếu cần gửi hóa đơn" onChange={(event) => this.handleOnChangeInput(event, 'ReceiverEmail')} />
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
                            <input type="radio" id={method.Code} value={method.Code} checked={ShippingMethod === method.Code} onChange={(event) => this.handleOnChangeInput(event, 'ShippingMethod')} />
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
                            <input type="radio" id={type.Code} name="PaymentType" value={type.Code} checked={PaymentType === type.Code} onChange={(event) => this.handleOnChangeInput(event, 'PaymentType')} />
                            <label htmlFor={type.Code}>{type.CodeValueVI}</label>
                          </div>
                        ))
                      ) : (
                        <div className="pay-content-left-method-payment-item">
                          <input type="radio" defaultChecked />
                          <label>Thanh toán bằng tiền mặt</label>
                        </div>
                      )}
                      <div className="pay-content-left-method-payment-item">
                        <input type="radio" id="QR" name="PaymentType" value="QR" checked={PaymentType === 'QR'} onChange={(event) => this.handleOnChangeInput(event, 'PaymentType')} />
                        <label htmlFor="QR">Quét QR (VNPay)</label>
                      </div>
                      <div className="pay-content-left-method-payment-item-img">
                        <img src={visa} alt="Visa" />
                        <img src={mastercard} alt="MasterCard" />
                      </div>
                      {/* Xóa phần input card info, vì giờ redirect VNPay */}
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
                              {TotalPrice > 0 ? (
                                <>
                                  <p>{TotalPrice}</p>
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
                          <td colSpan="6">{codeShippingMethod.find((method) => method.Code === ShippingMethod).CodeValueVI}</td>
                          <td>
                            <div className="f">
                              <p>{parseFloat(codeShippingMethod.find((method) => method.Code === ShippingMethod).ExtraValue)}</p>
                              <sup>đ</sup>
                            </div>
                          </td>
                        </tr>
                        {DiscountAmount > 0 ? (
                          <tr className="discount">
                            <td colSpan="6">Số tiền giảm</td>
                            <td>
                              <div className="f">
                                <>
                                  <p>-{parseFloat(DiscountAmount)}</p>
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
                              <b>{TotalPayment}</b>
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
        <Chat />
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
  saveCartForCheckOut: (checkOutCart, AccountID, expiresAt, isBuyNow) => dispatch(saveCartForCheckOut(checkOutCart, AccountID, expiresAt, isBuyNow)),
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  saveTrackInfo: (trackData) => dispatch(saveTrackInfo(trackData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CheckOut);
