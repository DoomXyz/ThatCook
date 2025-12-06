import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import Chat from '../../components/Chat';
import { cogOutline, cartOutline, cardOutline } from 'ionicons/icons';

import './Cart.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import { handleLogoutApi } from '../../services/accountServices';
import { handleGetCartApi, handleGetCartDetailApi, handleGetDetailListApi, handleUpdateQuantityApi, handleRemoveFromCartApi, handleUpdateCartDetailApi, handleMergeCartDetailApi } from '../../services/cartServices';
import { handleGetProductDetailInfoApi } from '../../services/productServices';

import { checkLoginStatus } from '../../utils/pakage';
import { updateItemQuantity, removeFromCart, updateCartDetail, mergeCartDetail, saveCartForCheckOut, clearCheckOutCart, userLogout } from '../../store/actions';

class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      accountInfo: null,
      isSaveDelete: true,
      isSaveMerge: true,
      loadedCartInfo: [],
      loadedCartDetailInfo: [],
      loadedCartDetailList: [],
      currentPage: 1,
      tempCurrentPage: '1',
      limitProductPerQuery: 10,
      totalPages: 1,
      triggerCountCartItem: false,
      disabledButtons: {
        removeFromCart: false,
        mergeCart: false,
      },
    };
  }
  async componentDidMount() {
    await this.handleIsLogin();
    setTimeout(() => {
      this.handleLoadCartInfo();
    }, 10);
    setTimeout(() => {
      this.handleCheckCartQuantity();
    }, 100);
  }
  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
    }
    if (prevProps.cartItems !== this.props.cartItems) {
      await this.handleLoadCartInfo();
      if (this.state.loadedCartDetailInfo.length === 0) {
        this.props.clearCheckOutCart();
      }
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
  handleLoadCartInfo = async () => {
    const { isLoggedIn, accountInfo } = this.state;
    if (isLoggedIn) {
      this.loadCartInfo(accountInfo.AccountID);
    } else {
      await this.loadCartInfo();
    }
    this.setState((prevState) => ({
      currentPage: Math.min(prevState.currentPage, prevState.totalPages),
      tempCurrentPage: Math.min(prevState.currentPage, prevState.totalPages),
    }));
  };
  loadCartInfo = async (AccountID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = [];
        if (AccountID) {
          const response = await handleGetCartApi(AccountID);
          if (response && response.errCode === 0) {
            cartItems = response.data || [];
          } else {
            toast.error('Tải giỏ hàng thất bại!');
            reject(new Error('Tải giỏ hàng thất bại'));
            return;
          }
        } else {
          cartItems = this.props.cartItems;
        }
        const responseDetail = await handleGetCartDetailApi(JSON.stringify(cartItems));
        if (responseDetail && responseDetail.errCode === 0) {
          const detailInfo = responseDetail.data || [];
          this.setState(
            {
              loadedCartInfo: cartItems,
              loadedCartDetailInfo: detailInfo,
              totalPages: Math.ceil(detailInfo.length / this.state.limitProductPerQuery) || 1,
              currentPage: 1,
              tempCurrentPage: '1',
            },
            async () => {
              await this.handleLoadDetailList(cartItems);
              resolve();
            }
          );
        } else {
          this.setState(
            {
              loadedCartInfo: [],
              loadedCartDetailInfo: [],
              totalPages: 1,
              currentPage: 1,
              tempCurrentPage: '1',
            },
            () => resolve()
          );
        }
      } catch (e) {
        console.log('Lỗi khi tải chi tiết giỏ hàng!');
        reject(e);
      }
    });
  };
  handleLoadDetailList = async (loadCartInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const responseList = await handleGetDetailListApi(JSON.stringify(loadCartInfo));
        if (responseList && responseList.errCode === 0) {
          this.setState(
            {
              loadedCartDetailList: responseList.data,
            },
            () => resolve()
          );
        } else {
          toast.error('Tải danh sách chi tiết thất bại!');
          reject(new Error('Tải danh sách chi tiết thất bại'));
        }
      } catch (e) {
        console.log('Lỗi tải giỏ hàng!');
        reject(e);
      }
    });
  };
  handleCheckCartQuantity = async () => {
    const { loadedCartInfo, loadedCartDetailInfo } = this.state;
    try {
      let updatedCartInfo = [...loadedCartInfo];
      let hasChanges = false;
      for (let i = 0; i < updatedCartInfo.length; i++) {
        const cartItem = updatedCartInfo[i];
        const productInfo = loadedCartDetailInfo.find((product) => product.ProductID === cartItem.ProductID && product.ProductDetailID === cartItem.ProductDetailID);
        if (productInfo && cartItem.ItemQuantity > productInfo.Stock) {
          updatedCartInfo[i] = {
            ...cartItem,
            ItemQuantity: productInfo.Stock,
          };
          hasChanges = true;
          await this.handleQuantityChange(cartItem.ProductID, cartItem.ProductDetailID, productInfo.Stock);
        }
      }
      if (hasChanges) {
        this.setState({ loadedCartInfo: updatedCartInfo }, async () => {
          await this.loadCartInfo();
          this.triggerCountCartItem();
        });
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra số lượng giỏ hàng:', error);
      toast.error('Có lỗi xảy ra khi kiểm tra số lượng giỏ hàng!');
    }
  };
  handleTotalProductPrice = () => {
    const { loadedCartDetailInfo } = this.state;
    let totalProductPrice = 0;
    for (let i = 0; i < loadedCartDetailInfo.length; i++) {
      if (loadedCartDetailInfo[i].ProductPrice > 0) {
        totalProductPrice += loadedCartDetailInfo[i].ProductPrice * loadedCartDetailInfo[i].ItemQuantity;
      }
    }
    return totalProductPrice;
  };
  handleTotalPriceAfterPromotion = () => {
    const { loadedCartDetailInfo } = this.state;
    let TotalPrice = 0;
    for (let i = 0; i < loadedCartDetailInfo.length; i++) {
      let ProductPrice = 0;
      if (loadedCartDetailInfo[i].ProductPrice > 0) {
        ProductPrice = loadedCartDetailInfo[i].ProductPrice;
      }
      if (loadedCartDetailInfo[i].Promotion) {
        ProductPrice *= (100 - parseFloat(loadedCartDetailInfo[i].Promotion, 10)) / 100;
      }
      TotalPrice += ProductPrice * loadedCartDetailInfo[i].ItemQuantity;
    }
    return TotalPrice;
  };
  handleQuantityChange = async (ProductID, ProductDetailID, Quantity) => {
    const { loadedCartDetailInfo, isLoggedIn, accountInfo } = this.state;
    let newQuantity = parseInt(Quantity, 10) || 1;
    const detailInfo = loadedCartDetailInfo.find((detail) => detail.ProductID === ProductID && detail.ProductDetailID === ProductDetailID);
    if (newQuantity < 1) {
      newQuantity = 1;
    } else if (newQuantity > detailInfo.Stock) {
      newQuantity = detailInfo.Stock;
    }
    if (isLoggedIn) {
      const response = await handleUpdateQuantityApi(accountInfo.AccountID, detailInfo.ProductID, detailInfo.ProductDetailID, newQuantity);
      if (response && response.errCode !== 0) {
        toast.error('Cập nhật số lượng thất bại!');
      }
    } else {
      this.props.updateItemQuantity(detailInfo.ProductID, detailInfo.ProductDetailID, newQuantity);
    }
    await this.handleLoadCartInfo();
    this.triggerCountCartItem();
  };
  handleAddQuantity = async (ProductID, ProductDetailID, Quantity) => {
    this.handleQuantityChange(ProductID, ProductDetailID, Quantity);
  };
  handleDecreaseQuantity = async (ProductID, ProductDetailID, Quantity) => {
    if (Quantity === 0) {
      this.handleRemoveFromCart(ProductID, ProductDetailID);
      return;
    }
    this.handleQuantityChange(ProductID, ProductDetailID, Quantity);
  };
  handleQuantityInputChange = (ProductID, ProductDetailID, e) => {
    const newQuantity = parseInt(e.target.value, 10) || 1;
    this.handleQuantityChange(ProductID, ProductDetailID, newQuantity);
  };
  handleRemoveFromCart = async (ProductID, ProductDetailID) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, removeFromCart: true } });
    const { isSaveDelete } = this.state;
    let isConfirmed = false;
    if (isSaveDelete) {
      const confirmAction = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>Xác nhận xóa sản phẩm khỏi giỏ hàng?</p>
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
                this.setState({ disabledButtons: { ...this.state.disabledButtons, removeFromCart: false } });
              },
            }
          );
        });
      isConfirmed = await confirmAction();
    } else {
      isConfirmed = true;
    }
    if (isConfirmed) {
      this.setState({ isLoading: true });
      const { isLoggedIn, accountInfo } = this.state;
      try {
        if (isLoggedIn) {
          const response = await handleRemoveFromCartApi(accountInfo.AccountID, ProductID, ProductDetailID);
          if (response && response.errCode === 0) {
            toast.success('Xóa sản phẩm thành công');
          } else {
            toast.error('Xóa sản phẩm thất bại!');
          }
        } else {
          this.props.removeFromCart(ProductID, ProductDetailID);
          toast.success('Xóa sản phẩm thành công');
        }
        await this.handleLoadCartInfo();
        this.triggerCountCartItem();
      } catch (e) {
        toast.error('Lỗi khi xóa sản phẩm!');
      }
    } else {
    }
    this.setState({ isLoading: false });
  };
  handleChangeProductDetail = async (ProductID, ProductDetailID1, ProductDetailID2) => {
    const { isLoggedIn, accountInfo, loadedCartDetailInfo } = this.state;
    let isExistDetail = false;
    if (loadedCartDetailInfo && loadedCartDetailInfo.length > 0) {
      isExistDetail = loadedCartDetailInfo.some((item) => item.ProductID === ProductID && item.ProductDetailID === ProductDetailID2);
    }
    if (!isExistDetail) {
      if (isLoggedIn) {
        const response = await handleUpdateCartDetailApi(accountInfo.AccountID, ProductID, ProductDetailID1, ProductDetailID2);
        if (response && response.errCode !== 0) {
          toast.error('Đổi chi tiết sản phẩm thất bại!');
        }
      } else {
        const productDetailInfo = await handleGetProductDetailInfoApi(ProductID, ProductDetailID2);
        if (productDetailInfo && productDetailInfo.errCode === 0) {
          const { cartItems } = this.props;
          const detail = productDetailInfo.data;
          const currentProduct = cartItems.find((cart) => cart.ProductID === ProductID && cart.ProductDetailID === ProductDetailID1);
          const newItemPrice = (parseFloat(detail.ProductPrice) + parseFloat(detail.ExtraPrice)) * (1 - parseFloat(detail.Promotion) / 100);
          const newItemQuantity = currentProduct.ItemQuantity > detail.Stock ? detail.Stock : currentProduct.ItemQuantity;
          this.props.updateCartDetail(ProductID, ProductDetailID1, ProductDetailID2, newItemPrice, newItemQuantity);
        }
      }
    } else {
      const { isSaveMerge } = this.state;
      this.setState({ disabledButtons: { ...this.state.disabledButtons, mergeCart: true } });
      let isConfirmed = false;
      if (isSaveMerge) {
        const confirmAction = () =>
          new Promise((resolve) => {
            toast(
              <div>
                <p>Bạn đang có chung sản phẩm nhưng khác loại trong giỏ hàng, xác nhận gộp sản phẩm?</p>
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
                  this.setState({ disabledButtons: { ...this.state.disabledButtons, mergeCart: false } });
                },
              }
            );
          });
        isConfirmed = await confirmAction();
      } else {
        isConfirmed = true;
      }
      if (isConfirmed) {
        this.setState({
          isLoading: true,
        });
        const { isLoggedIn, accountInfo } = this.state;
        const Quantity1 = loadedCartDetailInfo.find((item) => item.ProductDetailID === ProductDetailID1)?.ItemQuantity || 0;
        const Quantity2 = loadedCartDetailInfo.find((item) => item.ProductDetailID === ProductDetailID2)?.ItemQuantity || 0;
        const newQuantity = Quantity1 + Quantity2;
        const productDetailInfo = await handleGetProductDetailInfoApi(ProductID, ProductDetailID2);
        const detail = productDetailInfo.data;
        const newItemQuantity = newQuantity > detail.Stock ? detail.Stock : newQuantity;
        if (isLoggedIn) {
          const response = await handleMergeCartDetailApi(accountInfo.AccountID, ProductID, ProductDetailID1, ProductDetailID2, newItemQuantity);
          if (response && response.errCode !== 0) {
            toast.error('Gộp chi tiết sản phẩm thất bại!');
          }
        } else {
          this.props.mergeCartDetail(ProductID, ProductDetailID1, ProductDetailID2, newItemQuantity);
        }
      }
    }
    await this.handleLoadCartInfo();
    this.triggerCountCartItem();
    this.setState({
      isLoading: false,
    });
  };
  handleCheckOut = () => {
    const { isLoggedIn, accountInfo, loadedCartInfo } = this.state;
    let checkOutCart = null;
    let AccountID = null;
    if (isLoggedIn) {
      AccountID = accountInfo.AccountID;
      checkOutCart = loadedCartInfo.map(({ CartItemID, ...rest }) => rest);
    } else {
      checkOutCart = this.props.cartItems;
    }
    if (!checkOutCart || checkOutCart.length === 0) {
      toast.info('Không có sản phẩm để thanh toán!');
      return;
    }
    const expiresAt = new Date().getTime() + 60 * 60 * 1000;
    this.props.saveCartForCheckOut(checkOutCart, AccountID, expiresAt, false);
    this.props.navigate('/checkout');
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

  render() {
    const { isLoading, loadedCartDetailInfo, loadedCartDetailList, currentPage, tempCurrentPage, limitProductPerQuery, totalPages, disabledButtons } = this.state;
    const Price = this.handleTotalProductPrice() || 0;
    const priceAfterPromo = this.handleTotalPriceAfterPromotion() || 0;

    const startIndex = (currentPage - 1) * limitProductPerQuery;
    const endIndex = startIndex + limitProductPerQuery;
    const paginatedCartDetailInfo = loadedCartDetailInfo.slice(startIndex, endIndex);
    return (
      <div>
        <ToastContainer autoClose={500} newestOnTop={true} closeOnClick={false} pauseOnFocusLoss={false} draggable={true} transition={Slide} limit={1} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="cart">
            <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
            <div className="container-cart">
              <div className="check-content ">
                <div className="check-content-option f">
                  <IonIcon icon={cogOutline}></IonIcon>
                  <p>Cài đặt giỏ hàng: </p>
                </div>
                <div className="check-btn f">
                  <input type="checkbox" className="turn-off-save-delete" id="saveDelete" checked={this.state.isSaveDelete} onChange={(e) => this.setState({ isSaveDelete: e.target.checked })} />
                  <label htmlFor="saveDelete">Thông báo xóa</label>

                  <input type="checkbox" className="turn-off-save-merge" id="saveMerge" checked={this.state.isSaveMerge} onChange={(e) => this.setState({ isSaveMerge: e.target.checked })} />
                  <label htmlFor="saveMerge">Thông báo gộp sản phẩm</label>
                </div>
              </div>
              <div className="cart-top-warp">
                <div className="cart-top">
                  <div className="cart-top-cart cart-top-item">
                    <IonIcon icon={cartOutline}></IonIcon>
                  </div>
                  <div className="cart-top-moneycheck cart-top-item">
                    <IonIcon icon={cardOutline}></IonIcon>
                  </div>
                </div>
              </div>
            </div>
            <div className="container-cart">
              <div className="cart-content row">
                <div className="cart-content-left">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên Sản Phẩm</th>
                        <th>Hình Ảnh</th>
                        <th>Loại</th>
                        <th>Số Lượng</th>
                        <th>Đơn Giá</th>
                        <th>Khuyến mãi</th>
                        <th>Thành Tiền</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCartDetailInfo.length > 0 ? (
                        paginatedCartDetailInfo.map((item, index) => (
                          <tr key={index} className="cart-content-left-item">
                            <td>
                              <p>{item.ProductName}</p>
                            </td>
                            <td>
                              <img src={item.ProductImage || ''} alt="" />
                            </td>
                            <td>
                              <select value={item.ProductDetailID} onChange={(e) => this.handleChangeProductDetail(item.ProductID, item.ProductDetailID, parseInt(e.target.value, 10))}>
                                {loadedCartDetailList.find((detail) => detail.ProductID === item.ProductID)?.DetailList?.length > 0 ? (
                                  loadedCartDetailList
                                    .find((detail) => detail.ProductID === item.ProductID)
                                    .DetailList.map((detail, index) => (
                                      <option key={index} value={detail.ProductDetailID}>
                                        {detail.DetailName}
                                      </option>
                                    ))
                                ) : (
                                  <option value="">Không có chi tiết</option>
                                )}
                              </select>
                            </td>
                            <td>
                              <button className="minus" onClick={() => this.handleDecreaseQuantity(item.ProductID, item.ProductDetailID, item.ItemQuantity - 1)} disabled={disabledButtons.removeFromCart}>
                                -
                              </button>
                              <input type="text" value={item.ItemQuantity} onChange={(e) => this.handleQuantityInputChange(item.ProductID, item.ProductDetailID, e)} min="1" />
                              <button className="plus" onClick={() => this.handleAddQuantity(item.ProductID, item.ProductDetailID, item.ItemQuantity + 1)}>
                                +
                              </button>
                            </td>
                            <td>
                              <div className="f">
                                <p>{item.ProductPrice}</p>
                                <sup>đ</sup>
                              </div>
                            </td>
                            <td>
                              <p>{item.Promotion > 0 ? parseFloat(item.Promotion, 10) + '%' : ''}</p>
                            </td>
                            <td>
                              <div className="f">
                                <p>{item.ItemPrice}</p>
                                <sup>đ</sup>
                              </div>
                            </td>
                            <td>
                              <button onClick={() => this.handleRemoveFromCart(item.ProductID, item.ProductDetailID)} disabled={disabledButtons.removeFromCart}>
                                <p>x</p>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center' }}>
                            Hãy về trang chủ mua hàng nhé!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div className="page-content">
                      <div className="page-content-item">
                        <button className="first" onClick={this.handleFirstPage} disabled={currentPage === 1}>
                          {'<<'}
                        </button>
                        <button className="prev" onClick={this.handlePrevPage} disabled={currentPage === 1}>
                          {'<'}
                        </button>
                        <input type="text" value={tempCurrentPage} onChange={this.handlePageInputChange} onKeyDown={this.handlePageKeyDown} onBlur={this.handlePageInputBlur} />
                        <span className="total-pages">/ {totalPages}</span>
                        <button className="next" onClick={this.handleNextPage} disabled={currentPage === totalPages}>
                          {'>'}
                        </button>
                        <button className="last" onClick={this.handleLastPage} disabled={currentPage === totalPages}>
                          {'>>'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="cart-content-right">
                  <table>
                    <thead>
                      <tr>
                        <th colSpan="2">THÔNG TIN GIỎ HÀNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <b>TỔNG SẢN PHẨM:</b>
                        </td>
                        <td>
                          <b>{loadedCartDetailInfo.length > 0 ? `${loadedCartDetailInfo.length} sản phẩm` : ''}</b>
                        </td>
                      </tr>
                      <tr>
                        <td>TẠM TÍNH</td>
                        <td>
                          {Price > 0 ? (
                            <>
                              <p>{Price}</p>
                              <sup>đ</sup>
                            </>
                          ) : (
                            ''
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>GIÁ SAU KHI ÁP DỤNG GIẢM GIÁ</td>
                        <td>
                          {priceAfterPromo > 0 ? (
                            <>
                              <p>{priceAfterPromo}</p>
                              <sup>đ</sup>
                            </>
                          ) : (
                            ''
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="cart-content-right-button">
                    <button onClick={() => this.props.navigate('/home')}>TIẾP TỤC MUA SẮM</button>
                    <div>
                      <button onClick={this.handleCheckOut} disabled={loadedCartDetailInfo.length === 0}>
                        THANH TOÁN
                      </button>
                    </div>
                  </div>
                  <div className="cart-content-right-login">
                    {!this.state.isLoggedIn && (
                      <p>
                        Hãy{' '}
                        <a href="/login">
                          <u>ĐĂNG NHẬP</u>
                        </a>{' '}
                        tài khoản để có thể trải nghiệm mua sắm tốt hơn!
                      </p>
                    )}
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
  cartItems: state.cart.cartItems,
});

const mapDispatchToProps = (dispatch) => ({
  removeFromCart: (ProductID, ProductDetailID) => dispatch(removeFromCart(ProductID, ProductDetailID)),
  updateItemQuantity: (ProductID, ProductDetailID, Quantity) => dispatch(updateItemQuantity(ProductID, ProductDetailID, Quantity)),
  updateCartDetail: (ProductID, ProductDetailID1, ProductDetailID2, newItemPrice, newItemQuantity) => dispatch(updateCartDetail(ProductID, ProductDetailID1, ProductDetailID2, newItemPrice, newItemQuantity)),
  mergeCartDetail: (ProductID, ProductDetailID1, ProductDetailID2, Quantity) => dispatch(mergeCartDetail(ProductID, ProductDetailID1, ProductDetailID2, Quantity)),
  saveCartForCheckOut: (checkOutCart, AccountID, expiresAt, isBuyNow) => dispatch(saveCartForCheckOut(checkOutCart, AccountID, expiresAt, isBuyNow)),
  clearCheckOutCart: () => dispatch(clearCheckOutCart()),
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
