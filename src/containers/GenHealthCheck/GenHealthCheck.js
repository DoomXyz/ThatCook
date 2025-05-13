import React, { Component } from "react";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import {} from "ionicons/icons"; //chỉ import các icon cần dùng
import "./GenHealthCheck.scss"; //import scss
import Header from "../../components/HomeHeader";
import Footer from "../../components/HomeFooter";

import image from "../../assets/doctor-imgs/genheath.png";
import icon from "../../assets/doctor-imgs/icon.jpeg";

class GenHealthCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <div className="genhealthcheck-body">
        <Header
          navigate={this.props.navigate}
          cartItems={this.props.cartItems}
          userInfo={this.props.userInfo}
          triggerCountCartItem={this.state.triggerCountCartItem}
        />
        <div className="genhealthcheck-content f gen-container">
          <div className="genhealthcheck-content-left">
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
          <div className="genhealthcheck-content-right">
            <div className="image-container">
              <img src={image} alt="General Health Check" />
            </div>
            <h1>DỊCH VỤ KHÁM TỔNG QUÁT</h1>
            <p>
              Dịch vụ khám sức khỏe tổng quát thú y tại phòng khám của chúng tôi
              mang đến sự chăm sóc toàn diện, giúp đảm bảo sức khỏe và hạnh phúc
              cho thú cưng của bạn. Với đội ngũ bác sĩ thú y giàu kinh nghiệm và
              trang thiết bị hiện đại, chúng tôi thực hiện kiểm tra kỹ lưỡng từ
              đánh giá thể chất, xét nghiệm máu, siêu âm đến kiểm tra răng miệng
              và các cơ quan nội tạng. Mục tiêu là phát hiện sớm các vấn đề tiềm
              ẩn, tư vấn dinh dưỡng phù hợp và xây dựng kế hoạch chăm sóc lâu
              dài. Dịch vụ được thiết kế linh hoạt, phù hợp với mọi giống loài
              và độ tuổi của thú cưng, đảm bảo mang lại sự an tâm cho chủ nuôi
              trong việc duy trì cuộc sống khỏe mạnh và tràn đầy năng lượng cho
              người bạn đồng hành yêu quý.
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
export default connect(mapStateToProps, mapDispatchToProps)(GenHealthCheck);
