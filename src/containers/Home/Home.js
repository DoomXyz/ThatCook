import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';

import { searchOutline, cartOutline } from 'ionicons/icons';

import './Home.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';
import HomeProductModal from './HomeProductModal';
import Chat from '../../components/Chat';

import { handleLogoutApi } from '../../services/accountServices';
import { handleGetSaleBannerInfoApi } from '../../services/bannerServices';
import { handleAddToCartApi, handleGetCartApi } from '../../services/cartServices';
import { handleLoadSaleProductInfoApi, handleGetProductDetailInfoApi } from '../../services/productServices';

import { checkLoginStatus, getAllCodes } from '../../utils/pakage';
import { userLogin, userLogout, addToCart, clearCart, saveCartForCheckOut } from '../../store/actions';

import cat from '../../assets/icons/cat.png';
import dog from '../../assets/icons/golden-retriever.png';
const defBannerImage = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/defaultbanner_p9kvda.webp';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      accountInfo: null,
      codeProductType: [],
      codePetType: [],
      loadedBannerInfo: [],
      loadedProductInfo: [],
      selectedProduct: null,
      currentPage: 1,
      tempCurrentPage: '1',
      limitProductPerQuery: 20,
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      totalPages: 1,
      currentBannerIndex: 0,
      bannerSlideTime: 5000,
      isShowHomeProductModal: false,
      triggerCountCartItem: false,
      disabledButtons: {
        addToCart: false,
      },
    };
    this.debounceTimeout = null;
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadProductInfo();
    await this.handleGetBannerInfo();
    await this.handleLoadCode(['ProductType', 'PetType']);
    this.bannerInterval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.loadedBannerInfo.length === 0) return { currentBannerIndex: 0 };
        // Chuyển về banner đầu khi đến banner cuối
        return {
          currentBannerIndex: prevState.currentBannerIndex + 1 >= prevState.loadedBannerInfo.length ? 0 : prevState.currentBannerIndex + 1,
        };
      });
    }, this.state.bannerSlideTime);
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
    }
  }
  componentWillUnmount() {
    clearInterval(this.bannerInterval);
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
          isLoggedIn: false
        });
      }
    } catch (e) {
      this.props.navigate('/home')
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
  handleLoadCode = async (codeTypeFilter) => {
    try {
      const responses = await Promise.all(codeTypeFilter.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypeFilter.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  handleLoadProductInfo = async () => {
    const { currentPage, limitProductPerQuery, searchValue, filterValue, sortValue } = this.state;
    try {
      const response = await handleLoadSaleProductInfoApi(currentPage, limitProductPerQuery, searchValue, filterValue, sortValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedProductInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitProductPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading productinfo:', e);
      toast.error('Lỗi khi load danh sách sản phẩm!');
    }
  };
  handleGetBannerInfo = async () => {
    try {
      const response = await handleGetSaleBannerInfoApi('ALL');
      if (response && response.errCode === 0) {
        this.setState({
          loadedBannerInfo: response.data,
        });
      }
    } catch (e) {
      console.log('Error loading bannerinfo:', e);
      toast.error('Lỗi khi load danh sách banner!');
    }
  };
  handleBannerRightClick = () => {
    this.setState((prevState) => {
      if (prevState.loadedBannerInfo.length === 0) return { currentBannerIndex: 0 };
      // Chuyển về banner đầu khi đến banner cuối
      return {
        currentBannerIndex: prevState.currentBannerIndex + 1 >= prevState.loadedBannerInfo.length ? 0 : prevState.currentBannerIndex + 1,
      };
    });
  };
  handleBannerLeftClick = () => {
    this.setState((prevState) => {
      if (prevState.loadedBannerInfo.length === 0) return { currentBannerIndex: 0 };
      // Chuyển về banner cuối khi ở banner đầu
      return {
        currentBannerIndex: prevState.currentBannerIndex === 0 ? prevState.loadedBannerInfo.length - 1 : prevState.currentBannerIndex - 1,
      };
    });
  };
  handlePageChange = (page) => {
    this.setState({
      isLoading: true,
    });
    const { totalPages } = this.state;
    let newPage = page;
    // Xử lý giá trị không hợp lệ
    if (isNaN(page) || page <= 0) {
      newPage = 1; // Nếu nhập chữ, ký tự, hoặc số không hợp lệ, về trang 1
    } else if (page > totalPages) {
      newPage = totalPages; // Nếu nhập số lớn hơn totalPages, đặt thành totalPages
    }
    this.setState(
      {
        isLoading: false,
        currentPage: newPage,
        tempCurrentPage: newPage.toString(),
      }, () => {
        this.handleLoadProductInfo();
      }
    );
  };
  handlePrevPage = () => {
    this.setState(
      (prevState) => {
        const newPage = Math.max(1, prevState.currentPage - 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      }, () => {
        this.handleLoadProductInfo();
      }
    );
  };
  handleNextPage = () => {
    this.setState(
      (prevState) => {
        const newPage = Math.min(prevState.totalPages, prevState.currentPage + 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      }, () => {
        this.handleLoadProductInfo();
      }
    );
  };
  handlePageInputChange = (event) => {
    const value = event.target.value;
    this.setState({ tempCurrentPage: value });
  };
  handlePageInputBlur = () => {
    const { tempCurrentPage } = this.state;
    const page = parseInt(tempCurrentPage, 10);
    this.handlePageChange(page);
  };
  handlePageKeyDown = (event) => {
    if (event.key === 'Enter') {
      const { tempCurrentPage } = this.state;
      const page = parseInt(tempCurrentPage, 10);
      this.handlePageChange(page);
    }
  };
  toggleHomeProductModal = () => {
    this.setState({
      isShowHomeProductModal: !this.state.isShowHomeProductModal,
    });
  };
  handleSelectedProduct = (ProductID) => {
    this.setState({
      selectedProduct: ProductID,
      isShowHomeProductModal: true,
    });
  };
  handleBuyNowFromModal = (productInfo) => {
    this.toggleHomeProductModal();
    const { isLoggedIn, accountInfo } = this.state;
    let AccountID = null;
    if (isLoggedIn) {
      AccountID = accountInfo.AccountID;
    }
    if (!productInfo) {
      toast.info('Không có sản phẩm để thanh toán!');
      return;
    }
    const expiresAt = new Date().getTime() + 60 * 60 * 1000;
    this.props.saveCartForCheckOut([productInfo], AccountID, expiresAt, true);
    this.props.navigate('/checkout');
  };
  handleAddToCart = async (product) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, addToCart: true } });
    try {
      const quantity = product.ItemQuantity ? product.ItemQuantity : 1;
      await this.handleIsLogin();
      const addToCartProduct = [
        {
          ProductID: product.ProductID,
          ProductDetailID: product.ProductDetailID,
          ItemPrice: product.ItemPrice,
          ItemQuantity: quantity,
        },
      ];
      const { isLoggedIn, accountInfo } = this.state;
      let fullStock = false;
      let productData;
      if (isLoggedIn) {
        const response = await handleGetCartApi(accountInfo.AccountID);
        if (response && response.errCode === 0) {
          productData = response.data;
        } else {
          toast.error('Kiểm tra giỏ hàng thất bại!');
          return;
        }
      } else {
        productData = this.props.cartItems;
      }
      const addedProductID = addToCartProduct[0].ProductID;
      const addedProductDetailID = addToCartProduct[0].ProductDetailID;
      const addedItemQuantity = addToCartProduct[0].ItemQuantity;
      const productInfo = productData.filter((product) => product.ProductID === addedProductID && product.ProductDetailID === addedProductDetailID);
      if (productInfo.length > 0) {
        const currentQuantity = productInfo[0].ItemQuantity ? productInfo[0].ItemQuantity : 0;
        const newQuantity = currentQuantity + addedItemQuantity;
        const response = await handleGetProductDetailInfoApi(addedProductID, addedProductDetailID);
        if (response && response.errCode === 0) {
          if (newQuantity > response.data.Stock) {
            fullStock = true;
          }
        }
      }
      if (!fullStock) {
        if (isLoggedIn) {
          await handleAddToCartApi(accountInfo.AccountID, addToCartProduct);
        } else {
          this.props.addToCart(addToCartProduct, quantity);
        }
      } else {
        toast.info('Vượt quá số lượng tồn kho!', {
          onClose: () => this.setState({ disabledButtons: { ...this.state.disabledButtons, addToCart: false } })
        });
      }
      this.triggerCountCartItem();
    } catch (e) {
      console.log(e);
      toast.error('Thêm vào giỏ hàng thất bại!');
    } finally {
      this.setState({ disabledButtons: { ...this.state.disabledButtons, addToCart: false } });
    }
  };
  handleSearchChange = (event) => {
    const value = event.target.value;
    this.setState(
      {
        searchValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      }, () => {
        if (this.debounceTimeout) {
          clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(() => {
          this.handleLoadProductInfo();
        }, 500);
      }
    );
  };
  handleFilterProduct = (value) => {
    this.setState(
      {
        filterValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      }, () => {
        this.handleLoadProductInfo();
      }
    );
  };
  handleSortProduct = (value) => {
    this.setState(
      {
        sortValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      }, () => {
        this.handleLoadProductInfo();
      }
    );
  };
  render() {
    const { isLoading, loadedBannerInfo, loadedProductInfo, codeProductType, codePetType, disabledButtons,
      searchValue, filterValue, sortValue, currentPage, tempCurrentPage, totalPages, isShowHomeProductModal, selectedProduct, currentBannerIndex } = this.state;
    return (
      <div className="home-body">
        <ToastContainer
          autoClose={500}
          newestOnTop={true}
          closeOnClick={false}
          pauseOnFocusLoss={false}
          draggable={true}
          transition={Slide}
          limit={1}
        />
        <HomeProductModal
          isOpen={isShowHomeProductModal}
          toggleFromModal={this.toggleHomeProductModal}
          selectedProductID={selectedProduct}
          handleBuyNowFromModal={this.handleBuyNowFromModal}
          handleAddToCart={this.handleAddToCart}
        />
        <Header
          navigate={this.props.navigate}
          cartItems={this.props.cartItems}
          userInfo={this.props.userInfo}
          triggerCountCartItem={this.state.triggerCountCartItem}
        />
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            <div className="home-banner">
              <div className="home-slide-show">
                <div className="list-img" style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}>
                  {loadedBannerInfo && loadedBannerInfo.length > 0 ? loadedBannerInfo.map((item, index) => <img key={index} alt="" src={item.BannerImage}
                    onClick={() => item.ProductID ? this.handleSelectedProduct(item.ProductID) : null} />) : <img alt="" src={defBannerImage} />}
                </div>
                <div className="btns">
                  <button className="btn-right" onClick={this.handleBannerRightClick}>
                    {'>'}
                  </button>
                  <button className="btn-left" onClick={this.handleBannerLeftClick}>
                    {'<'}
                  </button>
                </div>
              </div>
            </div>
            <section className="cartegory f">
              <div className="row">
                <div className="cartegory-content">
                  <div className="cute f">
                    <img src={cat} alt="" />
                    <img src={dog} alt="" />
                  </div>
                  <div className="abc f">
                    <div className="cartegory-content-top-item">
                      <p>TẤT CẢ SẢN PHẨM</p>
                    </div>
                    <div className="cartegory-content-top-item">
                      <div className="searchs">
                        <input placeholder="Tìm kiếm tên sản phẩm..." type="text" className="search" value={searchValue} onChange={this.handleSearchChange} />
                        <IonIcon icon={searchOutline}></IonIcon>
                      </div>
                    </div>
                    <div className="cartegory-content-top-item">
                      <div>
                        <label>Lọc sản phẩm:</label>
                        <select value={filterValue} onChange={(event) => this.handleFilterProduct(event.target.value)}>
                          <option value="ALL">Tất cả sản phẩm</option>
                          <option value="PROMOTION">Sản phẩm có khuyến mãi</option>
                          {codeProductType && codeProductType.length > 0 && (
                            <optgroup label="Loại sản phẩm">
                              {codeProductType.map((item) => (
                                <option key={`ProductType-${item.Code}`} value={`ProductType-${item.Code}`}>
                                  {item.CodeValueVI}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {codePetType && codePetType.length > 0 && (
                            <optgroup label="Loại thú cưng">
                              {codePetType.map((item) => (
                                <option key={`PetType-${item.Code}`} value={`PetType-${item.Code}`}>
                                  Sản phẩm dành cho {item.CodeValueVI}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="cartegory-content-top-item">
                      <div>
                        <label>Sắp Xếp:</label>
                        <br />
                        <select value={sortValue} onChange={(event) => this.handleSortProduct(event.target.value)}>
                          <option value="0">Mặc định</option>
                          <option value="1">Bán chạy</option>
                          <option value="2">Giá bán tăng dần</option>
                          <option value="3">Giá bán giảm dần</option>
                          <option value="4">Hàng mới về</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="cartegory-content-content">
                    {loadedProductInfo && loadedProductInfo.length > 0 ? (
                      loadedProductInfo.map((item) => (
                        <div className="cartegory-content-content-item" key={item.ProductID}>
                          <img src={item.ProductImage} alt={item.ProductName} onClick={() => this.handleSelectedProduct(item.ProductID)} style={{ cursor: 'pointer' }} />
                          <h1 style={{ color: 'rgb(91, 85, 85)', cursor: 'pointer' }} onClick={() => this.handleSelectedProduct(item.ProductID)}>
                            {item.ProductName}
                          </h1>
                          <p className="type">(Mặc định: {item.DetailName})</p>
                          <div className="f">
                            <p>{Number(item.ItemPrice).toLocaleString('vi-VN')}</p>
                            <sup>đ</sup>
                            <p className="sale">{item.Promotion > 0 ? ` (${item.Promotion}%)` : ''}</p>
                          </div>
                          <div className="f">
                            <button onClick={() => this.handleAddToCart(item)} disabled={disabledButtons.addToCart}>
                              Thêm vào giỏ
                              <IonIcon icon={cartOutline}></IonIcon>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="cartegory-content-bottom row">
                      <div className="cartegory-content-bottom-item">
                        <button className="first" onClick={() => this.handlePageChange(1)} disabled={currentPage === 1}>
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
                        <button className="last" onClick={() => this.handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                          {'>>'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
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
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  addToCart: (product, Quantity) => dispatch(addToCart(product, Quantity)),
  clearCart: () => dispatch(clearCart()),
  saveCartForCheckOut: (cartItems, AccountID, expiresAt, isBuyNow) => dispatch(saveCartForCheckOut(cartItems, AccountID, expiresAt, isBuyNow)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
