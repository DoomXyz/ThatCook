import React, { Component } from "react";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import {} from "ionicons/icons"; //chỉ import các icon cần dùng
import "./Test.scss"; //import scss
import Header from "../../components/HomeHeader";
import Footer from "../../components/HomeFooter";

import image from "../../assets/doctor-imgs/xetnghiem.jpg";
import icon from "../../assets/doctor-imgs/icon.jpeg";

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <div className="test-body">
        <Header
          navigate={this.props.navigate}
          cartItems={this.props.cartItems}
          userInfo={this.props.userInfo}
          triggerCountCartItem={this.state.triggerCountCartItem}
        />
        <div className="test-content f gen-container">
          <div className="test-content-left">
            <ul>
              <li>
                <p>Dịch Vụ Khác</p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate("/user/genhealthcheck");
                  }}
                >
                  Khám Tổng Quát
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate("/user/vaccination");
                  }}
                >
                  Tiêm Phòng
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate("/user/surgery");
                  }}
                >
                  Phẫu Thuật Cơ Bản
                </p>
              </li>
              <li>
                <p
                  onClick={() => {
                    this.props.navigate("/user/test");
                  }}
                >
                  Xét Nghiệm
                </p>
              </li>
            </ul>
          </div>
          <div className="test-content-right">
            <img src={image} />
            <h1>DỊCH VỤ XÉT NGHIỆM</h1>
            <p>
              Dịch vụ xét nghiệm thú y tại phòng khám của chúng tôi mang đến
              giải pháp chẩn đoán chính xác, giúp theo dõi và bảo vệ sức khỏe
              toàn diện cho thú cưng của bạn. Với đội ngũ bác sĩ thú y chuyên
              môn cao và hệ thống thiết bị xét nghiệm hiện đại, chúng tôi thực
              hiện đa dạng các loại xét nghiệm như xét nghiệm máu, nước tiểu,
              phân, sinh hóa, và chẩn đoán hình ảnh (siêu âm, X-quang). Các xét
              nghiệm này giúp phát hiện sớm các vấn đề sức khỏe tiềm ẩn như
              nhiễm trùng, bệnh thận, gan, tiểu đường, hoặc ký sinh trùng, từ đó
              đưa ra phác đồ điều trị kịp thời. Quy trình được tiến hành nhanh
              chóng, an toàn và minh bạch, kèm theo tư vấn chi tiết để chủ nuôi
              hiểu rõ tình trạng của thú cưng. Dịch vụ xét nghiệm của chúng tôi
              phù hợp với mọi giống loài và độ tuổi, đảm bảo sự an tâm và hỗ trợ
              thú cưng duy trì cuộc sống khỏe mạnh, hạnh phúc bên bạn.
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
export default connect(mapStateToProps, mapDispatchToProps)(Test);
