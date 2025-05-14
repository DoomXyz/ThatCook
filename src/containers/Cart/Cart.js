import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';

import './Cart.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import { handleLogoutApi } from '../../services/accountServices';
import { handleGetProductDetailInfoApi } from '../../services/productServices';
import { handleGetCartApi, handleGetCartDetailApi, handleGetDetailListApi, handleUpdateQuantityApi, handleRemoveFromCartApi, handleUpdateCartDetailApi, handleMergeCartDetailApi } from '../../services/cartServices';

import { checkLoginStatus } from '../../utils/pakage';
import { updateItemQuantity, removeFromCart, updateCartDetail, mergeCartDetail, saveCartForCheckOut, clearCheckOutCart, userLogout } from '../../store/actions';

import cart from '../../assets/icons/shopping-cart.png';
import card from '../../assets/icons/cheque.png';

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
      disabledRemoveButton: false,
      triggerCountCartItem: false,
    };
  }

  async componentDidMount() {
    await this.handleIsLogin();
    setTimeout(() => {
      this.handleLoadCartInfo();
    }, 0);
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

  triggerCountCartItem = () => {
    this.setState((prevState) => ({
      triggerCountCartItem: !prevState.triggerCountCartItem,
    }));
    // this.triggerCountCartItem(); dòng này dùng để gọi hàm này
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
    this.setState({
      isLoading: false,
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
      toast.error('Có lỗi xảy ra khi kiểm tra số lượng giỏ hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
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

  loadCartInfo = async (accountid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = [];
        if (accountid) {
          const response = await handleGetCartApi(accountid);
          if (response && response.errCode === 0) {
            cartItems = response.data;
          } else {
            toast.error('Tải giỏ hàng thất bại!', {
              position: 'top-right',
              autoClose: 500,
              closeOnClick: true,
            });
            reject(new Error('Tải giỏ hàng thất bại'));
            return;
          }
        } else {
          cartItems = this.props.cartItems;
        }
        const responseDetail = await handleGetCartDetailApi(JSON.stringify(cartItems));
        if (responseDetail && responseDetail.errCode === 0) {
          this.setState(
            {
              loadedCartInfo: cartItems,
              loadedCartDetailInfo: responseDetail.data,
              totalPages: Math.ceil(responseDetail.data.length / this.state.limitProductPerQuery),
            },
            async () => {
              await this.handleLoadDetailList(cartItems);
              resolve();
            }
          );
        } else {
          toast.error('Tải chi tiết giỏ hàng thất bại!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          reject(new Error('Tải chi tiết giỏ hàng thất bại'));
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
          toast.error('Tải danh sách chi tiết thất bại!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          reject(new Error('Tải danh sách chi tiết thất bại'));
        }
      } catch (e) {
        console.log('Lỗi tải giỏ hàng!');
        reject(e);
      }
    });
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
    let totalPrice = 0;
    for (let i = 0; i < loadedCartDetailInfo.length; i++) {
      let productPrice = 0;
      if (loadedCartDetailInfo[i].ProductPrice > 0) {
        productPrice = loadedCartDetailInfo[i].ProductPrice;
      }
      if (loadedCartDetailInfo[i].Promotion) {
        productPrice *= (100 - parseFloat(loadedCartDetailInfo[i].Promotion, 10)) / 100;
      }
      totalPrice += productPrice * loadedCartDetailInfo[i].ItemQuantity;
    }
    return totalPrice;
  };

  handleAddQuantity = async (productid, productdetailid, quantity) => {
    this.handleQuantityChange(productid, productdetailid, quantity);
  };

  handleDecreaseQuantity = async (productid, productdetailid, quantity) => {
    if (quantity === 0) {
      this.handleRemoveFromCart(productid, productdetailid);
      return;
    }
    this.handleQuantityChange(productid, productdetailid, quantity);
  };

  handleQuantityChange = async (productid, productdetailid, quantity) => {
    const { loadedCartDetailInfo, isLoggedIn, accountInfo } = this.state;
    let newQuantity = parseInt(quantity, 10) || 1;
    const detailInfo = loadedCartDetailInfo.find((detail) => detail.ProductID === productid && detail.ProductDetailID === productdetailid);
    if (newQuantity < 1) {
      newQuantity = 1;
    } else if (newQuantity > detailInfo.Stock) {
      newQuantity = detailInfo.Stock;
    }
    if (isLoggedIn) {
      const response = await handleUpdateQuantityApi(accountInfo.AccountID, detailInfo.ProductID, detailInfo.ProductDetailID, newQuantity);
      if (response && response.errCode !== 0) {
        toast.error('Cập nhật số lượng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } else {
      this.props.updateItemQuantity(detailInfo.ProductID, detailInfo.ProductDetailID, newQuantity);
    }
    await this.handleLoadCartInfo();
    this.triggerCountCartItem();
  };

  handleQuantityInputChange = (productid, productdetailid, e) => {
    const newQuantity = parseInt(e.target.value, 10) || 1;
    this.handleQuantityChange(productid, productdetailid, newQuantity);
  };

  handleRemoveFromCart = async (productid, productdetailid) => {
    this.setState({ disabledRemoveButton: true });
    const { isSaveDelete } = this.state;
    let isConfirmed = false;
    if (isSaveDelete) {
      const confirmRemove = () =>
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
            { position: 'top-center', autoClose: 1000, closeOnClick: false, onClose: () => resolve(false) }
          );
        });
      isConfirmed = await confirmRemove();
    } else {
      isConfirmed = true;
    }
    if (isConfirmed) {
      const { isLoggedIn, accountInfo } = this.state;
      if (isLoggedIn) {
        const response = await handleRemoveFromCartApi(accountInfo.AccountID, productid, productdetailid);
        if (response && response.errCode === 0) {
          toast.success('Xóa sản phẩm thành công', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        } else {
          toast.error('Xóa sản phẩm thất bại!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        }
      } else {
        this.props.removeFromCart(productid, productdetailid);
        toast.success('Xóa sản phẩm thành công', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    }
    await this.handleLoadCartInfo();
    this.triggerCountCartItem();
    this.setState({ disabledRemoveButton: false });
  };

  handleChangeProductDetail = async (productid, productdetailid1, productdetailid2) => {
    const { isLoggedIn, accountInfo, loadedCartDetailInfo } = this.state;
    let isExistDetail = false;
    if (loadedCartDetailInfo && loadedCartDetailInfo.length > 0) {
      isExistDetail = loadedCartDetailInfo.some((item) => item.ProductID === productid && item.ProductDetailID === productdetailid2);
    }
    if (!isExistDetail) {
      if (isLoggedIn) {
        const response = await handleUpdateCartDetailApi(accountInfo.AccountID, productid, productdetailid1, productdetailid2);
        if (response && response.errCode !== 0) {
          toast.error('Đổi chi tiết sản phẩm thất bại!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        }
      } else {
        const productDetailInfo = await handleGetProductDetailInfoApi(productid, productdetailid2);
        if (productDetailInfo && productDetailInfo.errCode === 0) {
          const { cartItems } = this.props;
          const detail = productDetailInfo.data;
          const currentProduct = cartItems.find((cart) => cart.ProductID === productid && cart.ProductDetailID === productdetailid1);
          const newItemPrice = (parseFloat(detail.ProductPrice) + parseFloat(detail.ExtraPrice)) * (1 - parseFloat(detail.Promotion) / 100);
          const newItemQuantity = currentProduct.ItemQuantity > detail.Stock ? detail.Stock : currentProduct.ItemQuantity;
          this.props.updateCartDetail(productid, productdetailid1, productdetailid2, newItemPrice, newItemQuantity);
        }
      }
    } else {
      const { isSaveMerge } = this.state;
      let isConfirmed = false;
      if (isSaveMerge) {
        const confirmMerge = () =>
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
              { position: 'top-center', autoClose: 1000, closeOnClick: false }
            );
          });
        isConfirmed = await confirmMerge();
      } else {
        isConfirmed = true;
      }
      if (isConfirmed) {
        this.setState({
          isLoading: true,
        });
        const { isLoggedIn, accountInfo } = this.state;
        const quantity1 = loadedCartDetailInfo.find((item) => item.ProductDetailID === productdetailid1)?.ItemQuantity || 0;
        const quantity2 = loadedCartDetailInfo.find((item) => item.ProductDetailID === productdetailid2)?.ItemQuantity || 0;
        const newQuantity = quantity1 + quantity2;
        const productDetailInfo = await handleGetProductDetailInfoApi(productid, productdetailid2);
        const detail = productDetailInfo.data;
        const newItemQuantity = newQuantity > detail.Stock ? detail.Stock : newQuantity;
        if (isLoggedIn) {
          const response = await handleMergeCartDetailApi(accountInfo.AccountID, productid, productdetailid1, productdetailid2, newItemQuantity);
          if (response && response.errCode !== 0) {
            toast.error('Gộp chi tiết sản phẩm thất bại!', {
              position: 'top-right',
              autoClose: 500,
              closeOnClick: true,
            });
          }
        } else {
          this.props.mergeCartDetail(productid, productdetailid1, productdetailid2, newItemQuantity);
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
    let accountID = null;
    if (isLoggedIn) {
      accountID = accountInfo.AccountID;
      checkOutCart = loadedCartInfo.map(({ CartItemID, ...rest }) => rest);
    } else {
      checkOutCart = this.props.cartItems;
    }
    if (!checkOutCart || checkOutCart.length === 0) {
      toast.info('Không có sản phẩm để thanh toán!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    const expiresAt = new Date().getTime() + 60 * 60 * 1000;
    this.props.saveCartForCheckOut(checkOutCart, accountID, expiresAt, false);
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
    const { isLoading, loadedCartDetailInfo, loadedCartDetailList, currentPage, limitProductPerQuery, totalPages, tempCurrentPage, disabledRemoveButton } = this.state;
    const price = this.handleTotalProductPrice() || 0;
    const priceAfterPromo = this.handleTotalPriceAfterPromotion() || 0;

    const startIndex = (currentPage - 1) * limitProductPerQuery;
    const endIndex = startIndex + limitProductPerQuery;
    const paginatedCartDetailInfo = loadedCartDetailInfo.slice(startIndex, endIndex);
    return (
      <div>
        <ToastContainer />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="cart">
            <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
            <div className="container-cart">
              <div className="cart-top-warp">
                <div className="cart-top">
                  <div className="cart-top-cart cart-top-item">
                    <img src={cart} alt="Cart Icon" />
                  </div>
                  <div className="cart-top-moneycheck cart-top-item">
                    <img src={card} alt="Payment Icon" />
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
                              <button onClick={() => this.handleDecreaseQuantity(item.ProductID, item.ProductDetailID, item.ItemQuantity - 1)} disabled={disabledRemoveButton}>
                                -
                              </button>
                              <input type="text" value={item.ItemQuantity} onChange={(e) => this.handleQuantityInputChange(item.ProductID, item.ProductDetailID, e)} min="1" />
                              <button onClick={() => this.handleAddQuantity(item.ProductID, item.ProductDetailID, item.ItemQuantity + 1)}>+</button>
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
                              <button onClick={() => this.handleRemoveFromCart(item.ProductID, item.ProductDetailID)} disabled={disabledRemoveButton}>
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
                        <td>TỔNG SẢN PHẨM:</td>
                        <td>{loadedCartDetailInfo.length > 0 ? `${loadedCartDetailInfo.length} sản phẩm` : ''}</td>
                      </tr>
                      <tr>
                        <td>TẠM TÍNH</td>
                        <td>
                          {price > 0 ? (
                            <>
                              <p>{price}</p>
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
  removeFromCart: (productid, productdetailid) => dispatch(removeFromCart(productid, productdetailid)),
  updateItemQuantity: (productid, productdetailid, quantity) => dispatch(updateItemQuantity(productid, productdetailid, quantity)),
  updateCartDetail: (productid, productdetailid1, productdetailid2, newItemPrice, newItemQuantity) => dispatch(updateCartDetail(productid, productdetailid1, productdetailid2, newItemPrice, newItemQuantity)),
  mergeCartDetail: (productid, productdetailid1, productdetailid2, quantity) => dispatch(mergeCartDetail(productid, productdetailid1, productdetailid2, quantity)),
  saveCartForCheckOut: (checkOutCart, accountID, expiresAt, isBuyNow) => dispatch(saveCartForCheckOut(checkOutCart, accountID, expiresAt, isBuyNow)),
  clearCheckOutCart: () => dispatch(clearCheckOutCart()),
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
