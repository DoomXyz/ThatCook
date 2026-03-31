import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';

import { cartOutline, add, remove } from 'ionicons/icons';

import './HomeProductModal.scss';
import Modal from 'react-bootstrap/Modal';

import { addToCart } from '../../store/actions';
import { handleGetSaleProductInfoApi } from '../../services/productServices';
import { handleGetReviewsByProductApi } from '../../services/reviewServices';

class HomeProductModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImage: '',
      Quantity: 1,
      loadedProductInfo: null,
      loadedProductDetail: null,
      loadedProductImage: null,
      selectedProductDetail: null,
      loadedReviews: [],
      avgRating: 0,
      totalReviews: 0,
      reviewPage: 1,
      reviewTotalPages: 1,
    };
  }
  async componentDidUpdate(prevProps, prevState) {
    const { selectedProductID, isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      this.resetState();
      if (selectedProductID) {
        await this.loadProductDetails(selectedProductID);
      }
    }
  }
  resetState = async () => {
    this.setState({
      selectedImage: '',
      Quantity: 1,
      loadedProductInfo: null,
      loadedProductDetail: null,
      loadedProductImage: null,
      selectedProductDetail: null,
      loadedReviews: [],
      avgRating: 0,
      totalReviews: 0,
      reviewPage: 1,
      reviewTotalPages: 1,
    });
  };
  loadProductDetails = async (ProductID) => {
    try {
      const response = await handleGetSaleProductInfoApi(ProductID);
      if (response && response.errCode === 0) {
        const loadedInfo = response.data;
        const loadedProductImage = loadedInfo.Image;
        const loadedProductDetail = loadedInfo.ProductDetail;
        const loadedProductInfo = {
          ProductID: loadedInfo.ProductID,
          ProductName: loadedInfo.ProductName,
          ProductPrice: loadedInfo.ProductPrice,
          ProductImage: loadedInfo.ProductImage,
          ProductDescription: loadedInfo.ProductDescription,
        };
        this.setState({
          loadedProductInfo,
          loadedProductDetail,
          loadedProductImage,
          selectedProductDetail: loadedProductDetail[0] || null,
          selectedImage: loadedProductInfo.ProductImage || '',
        });
        await this.loadReviews(ProductID);
      } else {
        this.resetState();
        toast.error('Tải sản phẩm thất bại!');
      }
    } catch (e) {
      this.resetState();
      toast.error('Lỗi khi tải sản phẩm!');
    }
  };
  loadReviews = async (ProductID, page = 1) => {
    try {
      const response = await handleGetReviewsByProductApi(ProductID, page, 5);
      if (response && response.errCode === 0) {
        this.setState({
          loadedReviews: response.data.reviews,
          avgRating: response.data.avgRating,
          totalReviews: response.data.totalReviews,
          reviewPage: response.data.currentPage,
          reviewTotalPages: response.data.totalPages,
        });
      }
    } catch (e) {
      console.log('Error loading reviews:', e);
    }
  };
  handleReviewPageChange = async (newPage) => {
    const { loadedProductInfo } = this.state;
    if (loadedProductInfo) {
      await this.loadReviews(loadedProductInfo.ProductID, newPage);
    }
  };
  handleQuantityIncrease = () => {
    const { selectedProductDetail, Quantity } = this.state;
    if (selectedProductDetail && Quantity < selectedProductDetail.Stock) {
      this.setState((prevState) => ({ Quantity: prevState.Quantity + 1 }));
    }
  };
  handleQuantityDecrease = () => {
    this.setState((prevState) => ({
      Quantity: Math.max(1, prevState.Quantity - 1),
    }));
  };
  handleProductDetailChange = (selectedProductDetail) => {
    this.setState({
      selectedProductDetail,
      Quantity: 1,
    });
  };
  handleProductImageClick = (src) => {
    this.setState({ selectedImage: src });
  };
  handleAddToCart = () => {
    const { loadedProductInfo, Quantity, selectedProductDetail } = this.state;
    if (!loadedProductInfo || !selectedProductDetail) return;
    // Gọi hàm thêm vào giỏ hàng
    const ProductPrice = (parseFloat(loadedProductInfo.ProductPrice) + parseFloat(selectedProductDetail.ExtraPrice)) * (1 - parseFloat(selectedProductDetail.Promotion) / 100);
    this.props.handleAddToCart({
      ProductID: loadedProductInfo.ProductID,
      ProductDetailID: selectedProductDetail.ProductDetailID,
      ItemPrice: ProductPrice,
      ItemQuantity: Quantity,
    });
    // Reset state về trạng thái ban đầu
    const firstDetail = this.state.loadedProductDetail[0] || null;
    this.setState({
      selectedImage: loadedProductInfo.ProductImage || '',
      Quantity: 1,
      selectedProductDetail: firstDetail,
    });
  };
  handleBuyNow = () => {
    const { loadedProductInfo, Quantity, selectedProductDetail } = this.state;
    if (!loadedProductInfo || !selectedProductDetail) return;
    const ProductPrice = (parseFloat(loadedProductInfo.ProductPrice) + parseFloat(selectedProductDetail.ExtraPrice)) * (1 - parseFloat(selectedProductDetail.Promotion) / 100);
    this.props.handleBuyNowFromModal({
      ProductID: loadedProductInfo.ProductID,
      ProductDetailID: selectedProductDetail.ProductDetailID,
      ItemPrice: ProductPrice,
      ItemQuantity: Quantity,
    });
  };
  toggle = () => {
    this.resetState();
    this.props.toggleFromModal();
  };
  render() {
    const { isOpen } = this.props;
    const { selectedImage, Quantity, selectedProductDetail, loadedProductInfo, loadedProductDetail, loadedProductImage, loadedReviews, avgRating, totalReviews, reviewPage, reviewTotalPages } = this.state;
    if (!loadedProductInfo || !loadedProductDetail) {
      return (
        <Modal show={isOpen} onHide={this.toggle} className="HomeProductModal" centered backdrop="static">
          <Modal.Body>Không tìm thấy thông tin sản phẩm.</Modal.Body>
        </Modal>
      );
    }
    const basePrice = selectedProductDetail ? (parseFloat(loadedProductInfo.ProductPrice) + parseFloat(selectedProductDetail.ExtraPrice || 0)) * (1 - parseFloat(selectedProductDetail.Promotion || 0) / 100) : parseFloat(loadedProductInfo.ProductPrice);
    const formattedOriginalPrice = basePrice.toLocaleString('vi-VN');
    const finalPrice = Quantity * basePrice;
    const formattedFinalPrice = finalPrice.toLocaleString('vi-VN');
    const handleQuantityChange = (e) => {
      const value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < 1) {
        this.setState({ Quantity: 1 });
      } else if (selectedProductDetail && value > selectedProductDetail.Stock) {
        this.setState({ Quantity: selectedProductDetail.Stock });
      } else {
        this.setState({ Quantity: value });
      }
    };
    return (
      <Modal show={isOpen} onHide={this.toggle} className="HomeProductModal" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            <span>Thông tin sản phẩm</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="product-content row">
            <div className="product-content-left row">
              <div className="product-content-left-big-img">
                <img src={selectedImage} alt="Product" />
              </div>
              <div className="product-content-left-small-imgs">
                {loadedProductInfo.ProductImage && <img src={loadedProductInfo.ProductImage} alt="Main Product" onClick={() => this.handleProductImageClick(loadedProductInfo.ProductImage)} className={selectedImage === loadedProductInfo.ProductImage ? 'selected' : ''} />}
                {loadedProductImage && loadedProductImage.map((img, index) => <img key={index} src={img.Image} alt={`Thumbnail ${index}`} onClick={() => this.handleProductImageClick(img.Image)} />)}
              </div>
            </div>
            <div className="product-content-right">
              <div className="product-content-right-product-name">
                <h1>{loadedProductInfo.ProductName}</h1>
                <div className="product-avg-rating">
                  <div className="stars-display">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`star-icon ${star <= Math.round(avgRating) ? 'filled' : ''}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-info">
                    {avgRating > 0 ? `${avgRating}/5` : 'Chưa có đánh giá'} ({totalReviews} đánh giá)
                  </span>
                </div>
              </div>
              <div className="product-content-right-price">
                <p>
                  {formattedOriginalPrice} <sup>đ</sup>
                  {selectedProductDetail.Promotion && parseFloat(selectedProductDetail.Promotion) > 0 ? ` (${selectedProductDetail.Promotion}%)` : ''}
                </p>
              </div>

              <div className="product-content-right-choice">
                <div className="choice">
                  {loadedProductDetail &&
                    loadedProductDetail.map((detail) => (
                      <span key={detail.ProductDetailID} className={selectedProductDetail === detail ? 'selected' : ''} onClick={() => this.handleProductDetailChange(detail)}>
                        {detail.DetailName}
                      </span>
                    ))}
                </div>
              </div>
              <div className="quantity">
                <p>Số lượng:</p>
                <div className="quantity-control">
                  <button onClick={this.handleQuantityDecrease}>
                    <IonIcon icon={remove} />
                  </button>
                  <input type="text" value={Quantity} onChange={handleQuantityChange} min="1" max={selectedProductDetail ? selectedProductDetail.Stock : ''} style={{ width: '50px', textAlign: 'center' }} />
                  <button onClick={this.handleQuantityIncrease}>
                    <IonIcon icon={add} />
                  </button>
                </div>
              </div>
              <div className="product-content-right-instock">
                <p>Kho: {selectedProductDetail ? selectedProductDetail.Stock : 'N/A'}</p>
              </div>
              <div className="product-content-right-total-price">
                <p>
                  Tổng tiền: {formattedFinalPrice} <sup>đ</sup>
                </p>
              </div>
              <div className="product-content-right-product-button">
                <button onClick={this.handleBuyNow}>Mua ngay</button>
                <button onClick={this.handleAddToCart}>
                  <IonIcon icon={cartOutline} />
                </button>
              </div>
              <div className="product-content-right-bottom">
                <h1>
                  <u>*Mô tả sản phẩm:</u>
                </h1>
                <div className="product-content-right-bottom-content">
                  <p>{loadedProductInfo.ProductDescription || ''}</p>
                </div>
              </div>
              <div className="product-reviews-section">
                <h2>
                  <u>*Đánh giá từ khách hàng:</u>
                </h2>
                {loadedReviews.length > 0 ? (
                  <>
                    {loadedReviews.map((review) => (
                      <div key={review.ReviewID} className="review-item">
                        <div className="review-header">
                          <img src={review.Account?.UserImage || 'https://via.placeholder.com/40'} alt="User" className="review-user-avatar" />
                          <div className="review-user-info">
                            <span className="review-username">{review.Account?.UserName || 'Ẩn danh'}</span>
                            <div className="review-stars-small">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= review.Rating ? 'star-filled' : 'star-empty'}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="review-date">{new Date(review.CreatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {review.Comment && <p className="review-comment">{review.Comment}</p>}
                        {review.ReviewImages && review.ReviewImages.length > 0 && (
                          <div className="review-images-display">
                            {review.ReviewImages.map((img, idx) => (
                              <img key={idx} src={img} alt={`Review ${idx}`} className="review-img-thumb" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {reviewTotalPages > 1 && (
                      <div className="review-pagination">
                        <button disabled={reviewPage <= 1} onClick={() => this.handleReviewPageChange(reviewPage - 1)}>
                          {'<'}
                        </button>
                        <span>
                          {reviewPage} / {reviewTotalPages}
                        </span>
                        <button disabled={reviewPage >= reviewTotalPages} onClick={() => this.handleReviewPageChange(reviewPage + 1)}>
                          {'>'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  cartItems: state.cart.cartItems,
});

const mapDispatchToProps = {
  addToCart,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeProductModal);
