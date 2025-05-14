import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomeProductModal from '../Home/HomeProductModal';
import bannerimg1 from '../../assets/bannerimgs/1.webp';
import doctor from '../../assets/doctor-imgs/Anh-bac-si-Web_ThS.-BS.-DOAN-TRONG-NGHIA-.jpg';
import tongquat from '../../assets/doctor-imgs/img1.png';
import dieutri from '../../assets/doctor-imgs/dieutribenh.png';
import phauthuat from '../../assets/doctor-imgs/phauthuat.png';
import tiemphong from '../../assets/doctor-imgs/tiemphong.png';
import xetnghiem from '../../assets/doctor-imgs/xetnghiem.png';
import dr from '../../assets/doctor-imgs/dr.png';
import im1 from '../../assets/doctor-imgs/dv2.jpg';
import im2 from '../../assets/doctor-imgs/dv4.jpg';
import im3 from '../../assets/doctor-imgs/im-2.png';
import im4 from '../../assets/doctor-imgs/im-3.png';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import './HomeAppointment.scss';

const bannerImagesFallback = [{ HinhAnh: bannerimg1, MASANPHAM: null }];

// Sample doctor data (you can replace this with an API call later)
const doctors = [
  { name: 'Nguyễn Văn A', appointments: 10, image: doctor },
  { name: 'Nguyễn Văn B', appointments: 15, image: doctor },
  { name: 'Nguyễn Văn C', appointments: 8, image: doctor },
];

class HomeAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0, // Tracks active banner slide
      bannerImages: [], // Stores banner data from API
      isShowHomeProductModal: false, // Controls product modal visibility
      productDetail: {}, // Stores selected product details
      doctorIndex: 0, // Tracks active doctor slide
    };
    this.bannerIntervalId = null; // For banner slideshow interval
  }

  componentWillUnmount() {
    if (this.bannerIntervalId) clearInterval(this.bannerIntervalId);
  }

  showProductDetailFromBanner = async (MASANPHAM) => {
    if (!MASANPHAM) {
      toast.error('No product associated with this banner!', {
        autoClose: 2000,
        closeOnClick: true,
      });
      return;
    }
  };

  changeSlide = () => {
    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex + 1) % (this.state.bannerImages.length || 1),
    }));
  };

  handleRightClick = () => {
    clearInterval(this.bannerIntervalId);
    this.changeSlide();
    this.bannerIntervalId = setInterval(this.changeSlide, 4000);
  };

  handleLeftClick = () => {
    clearInterval(this.bannerIntervalId);
    this.setState((prevState) => ({
      currentIndex: prevState.currentIndex === 0 ? (this.state.bannerImages.length || 1) - 1 : prevState.currentIndex - 1,
    }));
    this.bannerIntervalId = setInterval(this.changeSlide, 4000);
  };

  toggleHomeProductModal = () => {
    this.setState({
      isShowHomeProductModal: !this.state.isShowHomeProductModal,
    });
  };

  // Handle navigation for doctors slideshow
  handleDoctorLeftClick = () => {
    this.setState((prevState) => ({
      doctorIndex: Math.max(0, prevState.doctorIndex - 1),
    }));
  };

  handleDoctorRightClick = () => {
    this.setState((prevState) => ({
      doctorIndex: Math.min(
        doctors.length - 1, // Prevent going beyond the last doctor
        prevState.doctorIndex + 1
      ),
    }));
  };

  render() {
    const { currentIndex, bannerImages, isShowHomeProductModal, productDetail, doctorIndex } = this.state;

    return (
      <div className="HomeAppointment-body">
        <ToastContainer />
        <HomeProductModal isOpen={isShowHomeProductModal} toggleFromModal={this.toggleHomeProductModal} currentProduct={productDetail.MASANPHAM} handleBuyNowFromModal={(masanpham, soluong, mactsp) => console.log('Buy now:', masanpham, soluong, mactsp)} handleAddToCartFromModal={(masanpham, soluong, mactsp) => console.log('Add to cart:', masanpham, soluong, mactsp)} />
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />

        <div className="home-bg"></div>
        {/* <div className="home-banner">
          <div className="home-slide-show">
            <div
              className="list-img"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              <img src={bannerimg1} />
            </div>
            <div className="btns">
              <button className="btn-right" onClick={this.handleRightClick}>
                {">"}
              </button>
              <button className="btn-left" onClick={this.handleLeftClick}>
                {"<"}
              </button>
            </div>
            <div className="index-img">
              {bannerImages.map((_, index) => (
                <div
                  key={index}
                  className={`index-item index-item-${index} ${
                    currentIndex === index ? "active" : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div> */}
        <div className="top-doctor">
          <div className="f">
            <h1>CÁC BÁC SĨ NỔI BẬT</h1>
            <p
              onClick={() => {
                this.props.navigate('/user/showdoctor');
              }}
            >
              Xem tất cả bác sĩ
            </p>
          </div>
          <div className="stra"></div>
          <div className="doctor-slide-show">
            <button className="doctor-btn-left" onClick={this.handleDoctorLeftClick} disabled={doctorIndex === 0}>
              {'<'}
            </button>
            <div className="doctor-list-wrapper">
              <div
                className="doctor-list"
                style={{
                  transform: `translateX(calc(50% - 7rem - ${doctorIndex * 14}rem))`, // Center the active item
                }}
              >
                {doctors.map((doctor, index) => (
                  <div className={`top-doctor-item ${index === doctorIndex ? 'active' : ''}`} key={index}>
                    <img src={doctor.image} alt={doctor.name} />
                    <p>{doctor.name}</p>
                    <p>Số lượt đặt lịch: {doctor.appointments}</p>
                    <button>Đặt lịch ngay</button>
                  </div>
                ))}
              </div>
            </div>
            <button className="doctor-btn-right" onClick={this.handleDoctorRightClick} disabled={doctorIndex === doctors.length - 1}>
              {'>'}
            </button>
          </div>
        </div>
        <div className="service container">
          <h1>CÁC DỊCH VỤ CỦA CHÚNG TÔI</h1>
          <div className="stra"></div>
          <div className="f">
            <div
              className="service-item"
              onClick={() => {
                this.props.navigate('/user/genhealthcheck');
              }}
            >
              <img src={tongquat} />
              <p>Khám Sức Khỏe Tổng Quát</p>
            </div>
            <div
              className="service-item"
              onClick={() => {
                this.props.navigate('/user/vaccination');
              }}
            >
              <img src={tiemphong} />
              <p>Tiêm Phòng</p>
            </div>
            <div
              className="service-item"
              onClick={() => {
                this.props.navigate('/user/surgery');
              }}
            >
              <img src={phauthuat} />
              <p>Phẩu thuật cơ bản</p>
            </div>
          </div>
          <div
            className="service-item"
            onClick={() => {
              this.props.navigate('/user/test');
            }}
          >
            <img src={xetnghiem} />
            <p>Xét Nghiệm Và Chẩn Đoán</p>
          </div>
        </div>
        <div className="bottom">
          <div className="f">
            <div className="bottom-left">
              <h1>
                VÌ THÚ CƯNG
                <br />
                KHÔNG NGỪNG VƯƠN TỚI
              </h1>
              <div className="stra"></div>
              <p>Website Thú Y Mincow luôn nỗ lực để đạt được sự hài lòng và tín nhiệm bằng chất lượng dịch vụ, trải nghiệm hoàn hảo với chi phí hợp lý. Đáp ứng kỳ vọng của khách hàng, đạt được sự tin tưởng gắn kết với sứ mệnh phát triển và nâng cao sức khoẻ cho thú cưng Việt Nam.</p>
              <div className="f">
                <img src={im1} />
                <img src={im2} />
                <img src={im3} />
                <img src={im4} />
              </div>
            </div>
            <div className="bottom-right">
              <img src={dr} />
            </div>
          </div>
          <div className="bottom-bottom"></div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(HomeAppointment);
