import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';

import './ReviewModal.scss';
import Modal from 'react-bootstrap/Modal';

import { handleCreateReviewApi } from '../services/reviewServices';

class ReviewModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 0,
      hoverRating: 0,
      comment: '',
      reviewImages: [],
      isSubmitting: false,
    };
  }

  componentDidUpdate(prevProps) {
    // Reset state khi modal mở
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({
        rating: 0,
        hoverRating: 0,
        comment: '',
        reviewImages: [],
        isSubmitting: false,
      });
    }
  }

  handleStarClick = (star) => {
    this.setState({ rating: star });
  };

  handleStarHover = (star) => {
    this.setState({ hoverRating: star });
  };

  handleStarLeave = () => {
    this.setState({ hoverRating: 0 });
  };

  handleCommentChange = (e) => {
    this.setState({ comment: e.target.value });
  };

  handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (this.state.reviewImages.length + files.length > 3) {
      toast.error('Tối đa 3 ảnh!');
      return;
    }
    // Convert sang Base64
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh quá lớn, tối đa 5MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState((prevState) => ({
          reviewImages: [...prevState.reviewImages, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null; // Reset input
  };

  handleRemoveImage = (index) => {
    this.setState((prevState) => ({
      reviewImages: prevState.reviewImages.filter((_, i) => i !== index),
    }));
  };

  handleSubmit = async () => {
    const { rating, comment, reviewImages } = this.state;
    const { AccountID, ProductID } = this.props;

    if (!rating || rating < 1) {
      toast.error('Vui lòng chọn số sao!');
      return;
    }

    this.setState({ isSubmitting: true });
    try {
      const response = await handleCreateReviewApi({
        AccountID,
        ProductID,
        Rating: rating,
        Comment: comment.trim() || null,
        ReviewImages: reviewImages.length > 0 ? reviewImages : null,
      });
      if (response && response.errCode === 0) {
        toast.success('Đánh giá thành công!');
        this.props.toggleFromModal();
        // Gọi callback reload nếu có
        if (this.props.onReviewSuccess) {
          this.props.onReviewSuccess();
        }
      } else {
        toast.error(response?.errMessage || 'Đánh giá thất bại!');
      }
    } catch (e) {
      console.log(e);
      toast.error('Lỗi khi gửi đánh giá!');
    }
    this.setState({ isSubmitting: false });
  };

  toggle = () => {
    this.props.toggleFromModal();
  };

  render() {
    const { isOpen } = this.props;
    const { rating, hoverRating, comment, reviewImages, isSubmitting } = this.state;

    return (
      <Modal show={isOpen} onHide={this.toggle} className="ReviewModal" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Đánh giá sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Star Rating */}
          <div className="review-stars">
            <p>Chọn đánh giá:</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onClick={() => this.handleStarClick(star)}
                  onMouseEnter={() => this.handleStarHover(star)}
                  onMouseLeave={this.handleStarLeave}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="rating-text">{rating > 0 ? `${rating}/5 sao` : 'Chưa chọn'}</p>
          </div>

          {/* Comment */}
          <div className="review-comment">
            <p>Nhận xét:</p>
            <textarea
              rows="4"
              placeholder="Viết nhận xét của bạn..."
              value={comment}
              onChange={this.handleCommentChange}
              maxLength={500}
            />
          </div>

          {/* Image Upload */}
          <div className="review-images">
            <p>Ảnh đánh giá (tối đa 3 ảnh):</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={this.handleImageChange}
              disabled={reviewImages.length >= 3}
            />
            <div className="image-preview">
              {reviewImages.map((img, index) => (
                <div key={index} className="preview-item">
                  <img src={img} alt={`Preview ${index}`} />
                  <button onClick={() => this.handleRemoveImage(index)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-cancel" onClick={this.toggle}>Hủy</button>
          <button className="btn-submit" onClick={this.handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

export default connect(mapStateToProps)(ReviewModal);
