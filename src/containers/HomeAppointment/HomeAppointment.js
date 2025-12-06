import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import Chat from '../../components/Chat';
import './HomeAppointment.scss';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import { handleLoadVeterinarianInfoApi } from '../../services/accountServices';

import { getAllCodes } from '../../utils/pakage';
import { savePreselectInfo } from '../../store/actions';

import tongquat from '../../assets/doctor-imgs/img1.png';
import phauthuat from '../../assets/doctor-imgs/phauthuat.png';
import tiemphong from '../../assets/doctor-imgs/tiemphong.png';
import xetnghiem from '../../assets/doctor-imgs/xetnghiem.png';
import xquang from '../../assets/doctor-imgs/x-quang.png';
import dieutrikysinhtrung from '../../assets/doctor-imgs/dieu-tri-ky.png';
import chamsocrangmieng from '../../assets/doctor-imgs/sieu-am.png';
import dr from '../../assets/doctor-imgs/dr.png';
import im1 from '../../assets/doctor-imgs/dv2.jpg';
import im2 from '../../assets/doctor-imgs/dv4.jpg';
import im3 from '../../assets/doctor-imgs/im-2.png';
import im4 from '../../assets/doctor-imgs/im-3.png';

class HomeAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctorIndex: 0,
      loadedVeterinarianInfo: [],
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '1',
      currentPage: 1,
      limitItemPerQuery: 5,
      codeWorkingStatus: [],
      disabledButtons: {
        preSelectVeterinarian: false,
      },
    };
  }

  async componentDidMount() {
    await this.handleLoadVeterinarianInfo();
    await this.handleLoadCode(['WorkingStatus']);
  }

  handleLoadCode = async (codeTypes) => {
    try {
      const responses = await Promise.all(codeTypes.map((type) => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypes.forEach((type, index) => {
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

  handleLoadVeterinarianInfo = async () => {
    const { currentPage, limitItemPerQuery, searchValue, filterValue, sortValue } = this.state;
    try {
      const response = await handleLoadVeterinarianInfoApi(currentPage, limitItemPerQuery, searchValue, filterValue, sortValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedVeterinarianInfo: response.data,
        });
      } else {
        toast.error('Lỗi khi tải danh sách bác sĩ!', {
          autoClose: 2000,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải thông tin bác sĩ:', e);
      toast.error('Lỗi khi tải danh sách bác sĩ!', {
        autoClose: 2000,
        closeOnClick: true,
      });
    }
  };

  handlePreSelectVeterinarian = (AccountID) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, preSelectVeterinarian: true } });
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận chọn bác sĩ này để đặt lịch?</p>
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
              this.setState({ disabledButtons: { ...this.state.disabledButtons, preSelectVeterinarian: false } });
            },
          }
        );
      });
    confirmAction().then((isConfirmed) => {
      if (isConfirmed) {
        const { loadedVeterinarianInfo } = this.state;
        const selectedVet = loadedVeterinarianInfo.find((item) => item.AccountID === AccountID);
        if (selectedVet) {
          this.props.savePreselectInfo('Veterinarian', AccountID);
          this.props.navigate('/makeappointment');
        } else {
          toast.error('Không tìm thấy thông tin bác sĩ!', {
            autoClose: 2000,
            closeOnClick: true,
          });
        }
      }
    });
  };

  handlePrevDoctor = () => {
    const { doctorIndex, loadedVeterinarianInfo } = this.state;
    if (doctorIndex > 0) {
      this.setState({ doctorIndex: doctorIndex - 1 });
    }
  };

  handleNextDoctor = () => {
    const { doctorIndex, loadedVeterinarianInfo } = this.state;
    if (doctorIndex < loadedVeterinarianInfo.length - 1) {
      this.setState({ doctorIndex: doctorIndex + 1 });
    }
  };
  handleServiceNavigate = (ServiceID) => {
    const serviceTypeMap = {
      1: 1, // General Health Check
      2: 2, // Vaccination
      3: 3, // Surgery
      4: 4, // Test
    };
    const serviceType = serviceTypeMap[ServiceID] || 1;
    this.props.selectServiceType(serviceType);
    this.props.navigate('/showservice');
  };

  render() {
    const { doctorIndex, loadedVeterinarianInfo, codeWorkingStatus, disabledButtons } = this.state;
    return (
      <div className="HomeAppointment-body">
        <ToastContainer autoClose={500} newestOnTop={true} closeOnClick={false} pauseOnFocusLoss={false} draggable transition={Slide} limit={1} />
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
        <div className="home-bg"></div>
        <div className="top-doctor">
          <div className="f">
            <h1>CÁC BÁC SĨ NỔI BẬT</h1>
            <p onClick={() => this.props.navigate('/showdoctor')}>
              <u>Xem tất cả bác sĩ</u>
            </p>
          </div>
          <div className="stra"></div>
          <div className="doctor-slide-show">
            <button className="doctor-btn-left" onClick={this.handlePrevDoctor} disabled={doctorIndex === 0}>
              &lt;
            </button>
            <div className="doctor-list-wrapper">
              <div
                className="doctor-list"
                style={{
                  transform: `translateX(calc(50% - ${doctorIndex * 15.7}rem - 7rem))`,
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                {loadedVeterinarianInfo.length > 0 ? (
                  loadedVeterinarianInfo.map((doctor, index) => (
                    <div className={`top-doctor-item ${index === doctorIndex ? 'active' : ''}`} key={doctor.AccountID}>
                      <img src={doctor.UserImage} alt={doctor.UserName} />
                      <p>{doctor.UserName}</p>
                      <p>Số lượt đặt lịch: {doctor.BookingCount || 0}</p>
                      <p>Trạng thái: {codeWorkingStatus.find((filterItem) => filterItem.Code === doctor.WorkingStatus)?.CodeValueVI || doctor.WorkingStatus}</p>
                      <button onClick={() => this.handlePreSelectVeterinarian(doctor.AccountID)} disabled={disabledButtons.preSelectVeterinarian || index !== doctorIndex}>
                        Đặt lịch ngay
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Không có bác sĩ nào</p>
                )}
              </div>
            </div>
            <button className="doctor-btn-right" onClick={this.handleNextDoctor} disabled={doctorIndex === loadedVeterinarianInfo.length - 1}>
              &gt;
            </button>
          </div>
        </div>
        <div className="service container">
          <h1>DỊCH VỤ NỔI BẬT CỦA CHÚNG TÔI</h1>
          <div className="stra"></div>
          <div className="f">
            <div className="service-item" onClick={() => this.props.navigate('/service/genhealthcheck')}>
              <img src={tongquat} alt="" />
              <p>Khám Sức Khỏe Tổng Quát</p>
            </div>
            <div className="service-item" onClick={() => this.props.navigate('/service/vaccination')}>
              <img src={tiemphong} alt="" />
              <p>Tiêm Phòng</p>
            </div>
            <div className="service-item">
              <img src={phauthuat} alt="" />
              <p>Phẫu thuật cơ bản</p>
            </div>
          </div>
          <div className="f">
            <div className="service-item">
              <img src={xetnghiem} alt="" />
              <p>Xét Nghiệm Và Chẩn Đoán</p>
            </div>
            <div className="service-item">
              <img src={chamsocrangmieng} alt="" />
              <p>Chăm sóc răng miệng</p>
            </div>
            <div className="service-item xquang">
              <img src={xquang} alt="" />
              <p>X-quang</p>
            </div>
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
                <img src={im3} alt="" />
                <img src={im4} alt="" />
                <img src={im1} alt="" />
                <img src={im2} alt="" />
              </div>
            </div>
            <div className="bottom-right">
              <img src={dr} alt="" />
            </div>
          </div>
          <div className="bottom-bottom"></div>
        </div>
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
  savePreselectInfo: (type, id) => dispatch(savePreselectInfo(type, id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppointment);
