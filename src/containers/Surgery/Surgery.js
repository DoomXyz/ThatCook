import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import {} from 'ionicons/icons'; //chỉ import các icon cần dùng
import './Surgery.scss'; //import scss
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import image from '../../assets/doctor-imgs/Phauthuat.jpg';
import icon from '../../assets/doctor-imgs/icon.jpeg';

class Surgery extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <div className="surgery-body">
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
        <div className="surgery-content f gen-container">
          <div className="surgery-content-left">
            <ul>
              <li>
                <p>Dịch Vụ Khác</p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/user/genhealthcheck');
                  }}
                >
                  Khám Tổng Quát
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/user/vaccination');
                  }}
                >
                  Tiêm Phòng
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/user/surgery');
                  }}
                >
                  Phẫu Thuật Cơ Bản
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/user/test');
                  }}
                >
                  Xét Nghiệm
                </p>
              </li>
            </ul>
          </div>
          <div className="surgery-content-right">
            <img src={image} />
            <h1>DỊCH VỤ PHẨU THUẬT CƠ BẢN</h1>
            <p>
              Dịch vụ phẫu thuật cơ bản cho thú cưng cung cấp các giải pháp y tế an toàn và hiệu quả, giúp cải thiện sức khỏe và chất lượng cuộc sống cho người bạn đồng hành của bạn. Với đội ngũ bác sĩ thú y giàu kinh nghiệm và cơ sở vật chất hiện đại, chúng tôi thực hiện các thủ thuật phổ biến như:
              <li>Triệt sản</li>
              <li>Cắt bỏ khối u hoặc u nang</li>
              <li>Xử lý vết thương</li>
              <li>Cắt cụt</li>
              <li>Phẫu thuật nha khoa</li>
              Mỗi ca phẫu thuật được tiến hành cẩn thận, từ kiểm tra sức khỏe trước phẫu thuật, gây mê an toàn đến chăm sóc hậu phẫu chu đáo, đảm bảo thú cưng hồi phục nhanh chóng. Dịch vụ được thiết kế phù hợp với mọi giống loài và tình trạng sức khỏe, mang lại sự an tâm tuyệt đối cho chủ nuôi, giúp thú cưng khỏe mạnh, vui vẻ và đồng hành lâu dài bên gia đình bạn.
            </p>
            <ul className="f">
              <li className="f">
                <img src={icon} />
                <p>Tổ chức nhân sự</p>
              </li>
              <li className="f">
                <img src={icon} />
                <p>Trình độ chuyên môn</p>
              </li>
              <li className="f">
                <img src={icon} />
                <p>Hoạt động y khoa</p>
              </li>
              <li className="f">
                <img src={icon} />
                <p>Cơ sở vật chất</p>
              </li>
            </ul>
            <button>Đặt lịch khám ngay !</button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(Surgery);
