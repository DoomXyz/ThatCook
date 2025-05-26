import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';

import { cartOutline, add, remove } from 'ionicons/icons';

import './HomeProductModal.scss';
import Modal from 'react-bootstrap/Modal';

import { addToCart } from '../../store/actions';
import { handleGetSaleProductInfoApi } from '../../services/productServices';

class HomeProductModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImage: '',
      quantity: 1,
      loadedProductInfo: null,
      loadedProductDetail: null,
      loadedProductImage: null,
      selectedProductDetail: null,
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
      quantity: 1,
      loadedProductInfo: null,
      loadedProductDetail: null,
      loadedProductImage: null,
      selectedProductDetail: null,
    });
  };
  loadProductDetails = async (productid) => {
    try {
      const response = await handleGetSaleProductInfoApi(productid);
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
      } else {
        this.resetState();
        toast.error('Tải sản phẩm thất bại!');
      }
    } catch (e) {
      this.resetState();
      toast.error('Lỗi khi tải sản phẩm!');
    }
  };
  handleQuantityIncrease = () => {
    const { selectedProductDetail, quantity } = this.state;
    if (selectedProductDetail && quantity < selectedProductDetail.Stock) {
      this.setState((prevState) => ({ quantity: prevState.quantity + 1 }));
    }
  };
  handleQuantityDecrease = () => {
    this.setState((prevState) => ({
      quantity: Math.max(1, prevState.quantity - 1),
    }));
  };
  handleProductDetailChange = (selectedProductDetail) => {
    this.setState({
      selectedProductDetail,
      quantity: 1,
    });
  };
  handleProductImageClick = (src) => {
    this.setState({ selectedImage: src });
  };
  handleAddToCart = () => {
    const { loadedProductInfo, quantity, selectedProductDetail } = this.state;
    if (!loadedProductInfo || !selectedProductDetail) return;
    // Gọi hàm thêm vào giỏ hàng
    const productPrice = (parseFloat(loadedProductInfo.ProductPrice) + parseFloat(selectedProductDetail.ExtraPrice)) * (1 - parseFloat(selectedProductDetail.Promotion) / 100);
    this.props.handleAddToCart({
      ProductID: loadedProductInfo.ProductID,
      ProductDetailID: selectedProductDetail.ProductDetailID,
      ItemPrice: productPrice,
      ItemQuantity: quantity,
    });
    // Reset state về trạng thái ban đầu
    const firstDetail = this.state.loadedProductDetail[0] || null;
    this.setState({
      selectedImage: loadedProductInfo.ProductImage || '',
      quantity: 1,
      selectedProductDetail: firstDetail,
    });
  };
  handleBuyNow = () => {
    const { loadedProductInfo, quantity, selectedProductDetail } = this.state;
    if (!loadedProductInfo || !selectedProductDetail) return;
    const productPrice = (parseFloat(loadedProductInfo.ProductPrice) + parseFloat(selectedProductDetail.ExtraPrice)) * (1 - parseFloat(selectedProductDetail.Promotion) / 100);
    this.props.handleBuyNowFromModal({
      ProductID: loadedProductInfo.ProductID,
      ProductDetailID: selectedProductDetail.ProductDetailID,
      ItemPrice: productPrice,
      ItemQuantity: quantity,
    });
  };
  toggle = () => {
    this.resetState();
    this.props.toggleFromModal();
  };
  render() {
    const { isOpen } = this.props;
    const { selectedImage, quantity, selectedProductDetail, loadedProductInfo, loadedProductDetail, loadedProductImage } = this.state;
    if (!loadedProductInfo || !loadedProductDetail) {
      return (
        <Modal show={isOpen} onHide={this.toggle} className="HomeProductModal" centered backdrop="static">
          <Modal.Body>Không tìm thấy thông tin sản phẩm.</Modal.Body>
        </Modal>
      );
    }
    const basePrice = selectedProductDetail ? (parseFloat(loadedProductInfo.ProductPrice) + parseFloat(selectedProductDetail.ExtraPrice || 0)) * (1 - parseFloat(selectedProductDetail.Promotion || 0) / 100) : parseFloat(loadedProductInfo.ProductPrice);
    const formattedOriginalPrice = basePrice.toLocaleString('vi-VN');
    const finalPrice = quantity * basePrice;
    const formattedFinalPrice = finalPrice.toLocaleString('vi-VN');
    const handleQuantityChange = (e) => {
      const value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < 1) {
        this.setState({ quantity: 1 });
      } else if (selectedProductDetail && value > selectedProductDetail.Stock) {
        this.setState({ quantity: selectedProductDetail.Stock });
      } else {
        this.setState({ quantity: value });
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
                  <input type="text" value={quantity} onChange={handleQuantityChange} min="1" max={selectedProductDetail ? selectedProductDetail.Stock : ''} style={{ width: '50px', textAlign: 'center' }} />
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
