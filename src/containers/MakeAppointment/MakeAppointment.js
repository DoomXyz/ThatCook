import React, { Component } from "react";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import {} from "ionicons/icons"; //chỉ import các icon cần dùng
import "./MakeAppointment.scss"; //import scss
import Header from "../../components/HomeHeader";
import Footer from "../../components/HomeFooter";

import test from "../../assets/productha/hinhtest3.jpg";

class MakeAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <div className="makeappointment-body">
        <Header
          navigate={this.props.navigate}
          cartItems={this.props.cartItems}
          userInfo={this.props.userInfo}
          triggerCountCartItem={this.state.triggerCountCartItem}
        />
        <div className="makeappointment-content">
          {" "}
          <h1>Thông tin đặt lịch</h1>
          <div className="makeappointment-content-user-info">
            <b>*Thông tin Khách hàng</b>
            <input type="text" placeholder="Hãy nhập Họ và Tên"></input>
            <input type="text" placeholder="Hãy nhập Số điện thoại"></input>
            <input type="text" placeholder="Hãy nhập Email"></input>
          </div>
          <div className="makeappointment-content-pet">
            <button>Xem danh sách thú cưng</button>
          </div>
          <div className="makeappointment-content-pet-info">
            <b>*Thông tin Thú cưng</b>

            <input type="text" placeholder="Hãy nhập Tên thú cưng"></input>
            <div className="f">
              <input type="text" placeholder="Hãy nhập Loài"></input>
              <input type="text" placeholder="Hãy nhập Tuổi"></input>
            </div>
            <input
              type="text"
              placeholder="Hãy nhập Giống ( Ví dụ: chó Poodle, mèo Ba Tư, v.v. )"
            ></input>
            <div className="f">
              <input type="text" placeholder="Hãy nhập Giới Tính"></input>
              <input type="text" placeholder="Hãy nhập Cân nặng"></input>
            </div>
          </div>
          <div className="makeappointment-content-doctor">
            <div className="f">
              <button>Chọn bác sĩ</button>
              <p>*Không bắt buộc</p>
            </div>
          </div>
          <div className="makeappointment-content-date">
            <div className="f">
              <button>Chọn lịch</button>
              <button>Reset</button>
            </div>
          </div>
          <div className="f">
            <div className="makeappointment-content-service">
              <p>
                <b>*Dịch vụ</b>
              </p>
              <select>
                <option>1234234234</option>
              </select>
            </div>
            <div className="makeappointment-content-time">
              <p>
                <b>*Khung giờ</b>
              </p>
              <select>
                <option>1223422344</option>
              </select>
            </div>
          </div>
          <textarea placeholder="Mô tả tình trạng thú cưng"></textarea>
          <div className="makeappointment-content-petimgs">
            <p>
              <b>*Thêm hình ảnh ( tối đa 4 )</b>
            </p>
            <div className="makeappointment-content-petimgs-block">
              <div className="makeappointment-content-petimgs-item">
                <img src={test} />
                <button>X</button>
              </div>

              <button className="add">+</button>
            </div>
          </div>
          <button className="makeapp">Gửi yêu cầu</button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(MakeAppointment);
