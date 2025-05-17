import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import {} from 'ionicons/icons'; //chỉ import các icon cần dùng
import './Vaccination.scss'; //import scss
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import image from '../../assets/doctor-imgs/vaccination.jpg';
import icon from '../../assets/doctor-imgs/icon.jpeg';

class Vaccination extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <div className="vaccination-body">
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
        <div className="vaccination-content f gen-container">
          <div className="vaccination-content-left">
            <ul>
              <li>
                <p>Dịch Vụ Khác</p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/service/genhealthcheck');
                  }}
                >
                  Khám Tổng Quát
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/service/vaccination');
                  }}
                >
                  Tiêm Phòng
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/service/surgery');
                  }}
                >
                  Phẫu Thuật Cơ Bản
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate('/service/test');
                  }}
                >
                  Xét Nghiệm
                </p>
              </li>
            </ul>
          </div>
          <div className="vaccination-content-right">
            <img src={image} />
            <h1>DỊCH VỤ TIÊM PHÒNG</h1>
            <p>
              Dịch vụ tiêm phòng thú y tại phòng khám của chúng tôi giúp bảo vệ thú cưng khỏi các bệnh truyền nhiễm nguy hiểm, đảm bảo một cuộc sống khỏe mạnh và tràn đầy năng lượng. Được thực hiện bởi đội ngũ bác sĩ thú y giàu kinh nghiệm, cùng với việc sử dụng các loại vắc-xin chất lượng cao đạt tiêu chuẩn quốc tế, chúng tôi cung cấp lịch tiêm phòng khoa học, phù hợp với từng giai đoạn phát triển của thú cưng. Trước khi tiêm, bác sĩ sẽ kiểm tra sức khỏe tổng quát để đảm bảo thú cưng ở trạng
              thái tốt nhất, đồng thời tư vấn chi tiết về các loại vắc-xin cần thiết, thời gian tái tiêm và cách chăm sóc sau tiêm. Quy trình được thiết kế cẩn thận, an toàn và minh bạch, với sự theo dõi chặt chẽ để đảm bảo hiệu quả miễn dịch tối ưu. Dịch vụ của chúng tôi không chỉ giúp ngăn ngừa bệnh tật mà còn mang lại sự yên tâm cho chủ nuôi, biết rằng người bạn đồng hành của mình được bảo vệ toàn diện, sẵn sàng vui chơi và gắn bó lâu dài bên gia đình bạn.
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
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(Vaccination);
