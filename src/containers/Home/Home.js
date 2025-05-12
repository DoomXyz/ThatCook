import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react";

import { searchOutline, cart } from "ionicons/icons";

import "./Home.scss";
import Spinner from '../../components/Spinner';
import Header from "../../components/HomeHeader";
import Footer from "../../components/HomeFooter";

import { handleLogoutApi } from "../../services/accountServices";
import { handleLoadSaleProductInfoApi, handleGetProductDetailInfoApi } from "../../services/productServices";
import { handleGetSaleBannerInfoApi } from "../../services/bannerServices"
import { handleAddToCartApi, handleGetCartApi } from "../../services/cartServices";
import { handleGetAllCodesApi } from "../../services/utilitiesServices";

import { checkLoginStatus } from '../../utils/pakage';
import { userLogin, userLogout, addToCart, clearCart, saveCartForCheckOut } from "../../store/actions";

import HomeProductModal from "./HomeProductModal";

import cat from "../../assets/icons/cat.png";
import dog from "../../assets/icons/golden-retriever.png";

const defBannerImage = "https://res.cloudinary.com/dqblg6ont/image/upload/v1746186450/defaultbanner_p9kvda.webp";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      isLoading: true,
      accountInfo: null,
      loadedProductInfo: [],
      loadedBannerInfo: [],
      loadedFilterValue: [],
      currentPage: 1,
      tempCurrentPage: "1",
      limitProductPerQuery: 20,
      searchValue: "",
      filterValue: "ALL",
      sortValue: "0",
      totalPages: 1,
      currentBannerIndex: 0,
      bannerSlideTime: 5000,
      isShowHomeProductModal: false,
      selectedProduct: null,
      triggerCountCartItem: false,
    };
    this.debounceTimeout = null;
  }

  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadProductInfo();
    await this.handleGetBannerInfo();
    await this.handleLoadFilterValue();
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

  componentWillUnmount() {
    clearInterval(this.bannerInterval);
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
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
        })
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          accountInfo: null,
        })
      }
    } catch (e) {
      console.log("Token not found!")
    }
    this.setState({
      isLoading: false
    })
  };

  handleLoadProductInfo = async () => {
    const { currentPage, limitProductPerQuery, searchValue, filterValue, sortValue } = this.state
    try {
      const response = await handleLoadSaleProductInfoApi(currentPage, limitProductPerQuery, searchValue, filterValue, sortValue)
      if (response && response.errCode === 0) {
        this.setState({
          loadedProductInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitProductPerQuery),
        })
      }
    } catch (e) {
      console.log("Error loading productinfo:", e);
      toast.error("Lỗi khi load danh sách sản phẩm!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleGetBannerInfo = async () => {
    try {
      const response = await handleGetSaleBannerInfoApi("ALL")
      if (response && response.errCode === 0) {
        this.setState({
          loadedBannerInfo: response.data
        })
      }
    } catch (e) {
      console.log("Error loading bannerinfo:", e);
      toast.error("Lỗi khi load danh sách banner!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }

  handleLoadFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('ProductType');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error("Không thể tải danh sách lọc!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedFilterValue,
      });
    } catch (e) {
      console.log("Error loading pettype code:", e);
      toast.error("Lỗi khi tải danh sách lọc!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }

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
    })
    const { totalPages } = this.state;
    let newPage = page;
    // Xử lý giá trị không hợp lệ
    if (isNaN(page) || page <= 0) {
      newPage = 1; // Nếu nhập chữ, ký tự, hoặc số không hợp lệ, về trang 1
    } else if (page > totalPages) {
      newPage = totalPages; // Nếu nhập số lớn hơn totalPages, đặt thành totalPages
    }
    this.setState({
      isLoading: false,
      currentPage: newPage,
      tempCurrentPage: newPage.toString()
    }, () => {
      this.handleLoadProductInfo();
    });
  };

  handlePrevPage = () => {
    this.setState((prevState) => {
      const newPage = Math.max(1, prevState.currentPage - 1);
      return {
        currentPage: newPage,
        tempCurrentPage: newPage.toString()
      };
    }, () => {
      this.handleLoadProductInfo();
    });
  };

  handleNextPage = () => {
    this.setState((prevState) => {
      const newPage = Math.min(prevState.totalPages, prevState.currentPage + 1);
      return {
        currentPage: newPage,
        tempCurrentPage: newPage.toString()
      };
    }, () => {
      this.handleLoadProductInfo();
    });
  };

  handlePageInputChange = (event) => {
    const value = event.target.value;
    this.setState({ tempCurrentPage: value });
  };

  handlePageInputBlur = () => {
    const { tempCurrentPage } = this.state;
    const page = parseInt(tempCurrentPage, 10);
    this.handlePageChange(page)
  };

  handlePageKeyDown = (event) => {
    if (event.key === "Enter") {
      const { tempCurrentPage } = this.state;
      const page = parseInt(tempCurrentPage, 10);
      this.handlePageChange(page);
    }
  };

  handleSelectedProduct = (productid) => {
    this.setState({
      selectedProduct: productid,
      isShowHomeProductModal: true,
    });
  };

  toggleHomeProductModal = () => {
    this.setState({
      isShowHomeProductModal: !this.state.isShowHomeProductModal,
    });
  };

  handleBuyNowFromModal = (productInfo) => {
    this.toggleHomeProductModal();
    const { isLoggedIn, accountInfo } = this.state
    let accountID = null;
    if (isLoggedIn) { accountID = accountInfo.AccountID; }
    if (!productInfo) {
      toast.info("Không có sản phẩm để thanh toán!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true
      });
      return;
    }
    const expiresAt = new Date().getTime() + 60 * 60 * 1000;
    this.props.saveCartForCheckOut(productInfo, accountID, expiresAt, true);
    this.props.navigate("/checkout")
  }

  handleAddToCart = async (product) => {
    try {
      const quantity = product.ItemQuantity ? product.ItemQuantity : 1;
      await this.handleIsLogin();
      const addToCartProduct = [{
        ProductID: product.ProductID,
        ProductDetailID: product.ProductDetailID,
        ItemPrice: product.ItemPrice,
        ItemQuantity: quantity
      }]
      const { isLoggedIn, accountInfo } = this.state
      let fullStock = false
      let productData;
      if (isLoggedIn) {
        const response = await handleGetCartApi(accountInfo.AccountID);
        if (response && response.errCode === 0) {
          productData = response.data
        } else {
          toast.error("Kiểm tra giỏ hàng thất bại!", {
            position: "top-right",
            autoClose: 500,
            closeOnClick: true
          });
        }
      } else {
        productData = this.props.cartItems
      }
      const addedProductID = addToCartProduct[0].ProductID;
      const addedProductDetailID = addToCartProduct[0].ProductDetailID
      const addedItemQuantity = addToCartProduct[0].ItemQuantity
      const productInfo = productData.filter(product => product.ProductID === addedProductID && product.ProductDetailID === addedProductDetailID);
      if (productInfo.length > 0) {
        const currentQuantity = productInfo[0].ItemQuantity ? productInfo[0].ItemQuantity : 0
        const newQuantity = currentQuantity + addedItemQuantity
        const response = await handleGetProductDetailInfoApi(addedProductID, addedProductDetailID)
        if (response && response.errCode === 0) {
          if (newQuantity > response.data.Stock) {
            fullStock = true
          }
        }
      }
      if (!fullStock) {
        if (isLoggedIn) {
          await handleAddToCartApi(accountInfo.AccountID, addToCartProduct);
        } else {
          this.props.addToCart(addToCartProduct, quantity)
        }
        toast.success("Thêm vào giỏ hàng thành công!", {
          position: "top-right",
          autoClose: 300,
          closeOnClick: true
        });
      } else {
        toast.info("Vượt quá số lượng tồn kho!", {
          position: "top-right",
          autoClose: 200,
          closeOnClick: true
        });
      }
      this.triggerCountCartItem();
    } catch (e) {
      console.log(e)
      toast.error("Thêm vào giỏ hàng thất bại!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true
      });
    }
  };

  triggerCountCartItem = () => {
    this.setState((prevState) => ({
      triggerCountCartItem: !prevState.triggerCountCartItem,
    }));
  };

  handleFilterProduct = (value) => {
    this.setState({
      filterValue: value,
      currentPage: 1
    }, () => {
      this.handleLoadProductInfo();
    });
  };

  handleSortProduct = (value) => {
    this.setState({
      sortValue: value,
      currentPage: 1
    }, () => {
      this.handleLoadProductInfo();
    });
  };

  handleSearchChange = (event) => {
    const value = event.target.value;
    this.setState({
      searchValue: value,
      currentPage: 1
    }, () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        this.handleLoadProductInfo();
      }, 500);
    });
  };

  render() {
    const { isLoading, loadedBannerInfo, loadedProductInfo, loadedFilterValue, searchValue, filterValue, sortValue,
      currentPage, totalPages, isShowHomeProductModal, currentBannerIndex, selectedProduct, tempCurrentPage } = this.state;
    return (
      <div className="home-body">
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
        <ToastContainer />

        {isLoading ? <Spinner /> : (
          <div>
            <div className="home-banner">
              <div className="home-slide-show">
                <div className="list-img"
                  style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                >
                  {loadedBannerInfo && loadedBannerInfo.length > 0 ? (
                    loadedBannerInfo.map((item, index) => (
                      <img
                        key={index}
                        alt=""
                        src={item.BannerImage}
                        onClick={() => this.handleSelectedProduct(item.ProductID)}
                      />
                    ))
                  ) : (
                    <img alt="" src={defBannerImage} />
                  )}
                </div>
                <div className="btns">
                  <button className="btn-right" onClick={this.handleBannerRightClick}>
                    {">"}
                  </button>
                  <button className="btn-left" onClick={this.handleBannerLeftClick}>
                    {"<"}
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
                        <input
                          placeholder="Tìm kiếm tên sản phẩm..."
                          type="text"
                          className="search"
                          value={searchValue}
                          onChange={this.handleSearchChange}
                        />
                        <IonIcon icon={searchOutline}></IonIcon>
                      </div>
                    </div>
                    <div className="cartegory-content-top-item">
                      <div>
                        <label>Lọc sản phẩm:</label>
                        <select
                          value={filterValue}
                          onChange={(event) => this.handleFilterProduct(event.target.value)}
                        >
                          <option value="ALL">Tất cả</option>
                          {loadedFilterValue && loadedFilterValue.length > 0 &&
                            loadedFilterValue.map((item) => (
                              <option key={item.Code} value={"producttype-" + item.Code}>
                                {item.CodeValueVI}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="cartegory-content-top-item">
                      <div>
                        <label>Sắp Xếp:</label>
                        <br />
                        <select
                          value={sortValue}
                          onChange={(event) => this.handleSortProduct(event.target.value)}
                        >
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
                          <img
                            src={item.ProductImage}
                            alt={item.ProductName}
                            onClick={() => this.handleSelectedProduct(item.ProductID)}
                            style={{ cursor: "pointer" }}
                          />
                          <h1
                            style={{ color: "rgb(91, 85, 85)", cursor: "pointer" }}
                            onClick={() => this.handleSelectedProduct(item.ProductID)}
                          >
                            {item.ProductName}
                          </h1>
                          <p className="type">(Mặc định: {item.DetailName})</p>
                          <div className="f">
                            <p>{Number(item.ItemPrice).toLocaleString("vi-VN")}</p>
                            <sup>đ</sup>
                            <p className="sale">{item.Promotion > 0 ? ` (${item.Promotion}%)` : ""}</p>
                          </div>
                          <div className="f">
                            <button onClick={() => this.handleAddToCart(item)}>
                              Thêm vào giỏ
                              <IonIcon icon={cart}></IonIcon>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                    )}
                  </div>
                  <div className="cartegory-content-bottom row">
                    <div className="cartegory-content-bottom-item">
                      <button className="first"
                        onClick={() => this.handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        {"<<"}
                      </button>
                      <button className="prev"
                        onClick={this.handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        {"<"}
                      </button>
                      <input
                        type="text"
                        value={tempCurrentPage}
                        onChange={this.handlePageInputChange}
                        onKeyDown={this.handlePageKeyDown}
                        onBlur={this.handlePageInputBlur}
                      />
                      <span className="total-pages">/ {totalPages}</span>
                      <button className="next"
                        onClick={this.handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        {">"}
                      </button>
                      <button className="last"
                        onClick={() => this.handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        {">>"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
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
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  addToCart: (product, quantity) => dispatch(addToCart(product, quantity)),
  clearCart: () => dispatch(clearCart()),
  saveCartForCheckOut: (cartItems, accountid, expiresAt, isBuyNow) => dispatch(saveCartForCheckOut(cartItems, accountid, expiresAt, isBuyNow)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);