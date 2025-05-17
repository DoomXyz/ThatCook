import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import { searchOutline } from 'ionicons/icons'; //chỉ import các icon cần dùng
import './ShowDoctor.scss'; //import scss
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import doctor from '../../assets/doctor-imgs/Anh-bac-si-Web_ThS.-BS.-DOAN-TRONG-NGHIA-.jpg';

class ShowDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <div className="showdoctor-body">
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
        <div className="showdoctor-content">
          <h1>Danh sách bác sĩ</h1>
          <div className="showdoctor-content-top f  ">
            <div className="showdoctor-content-top-search ">
              <input type="text" placeholder="Tìm kiếm bác sĩ"></input>
              <IonIcon icon={searchOutline}></IonIcon>
            </div>
            <div className="showdoctor-content-top-sort f">
              <p>Sắp xếp:</p>
              <select>
                <option>Số lượt đặt lịch</option>
                <option>A - Z</option>
                <option>Z - A</option>
              </select>
            </div>
            <div className="showdoctor-content-top-filter f">
              <p>Chuyên ngành: </p>
              <select>
                <option>Số lượt đặt lịch</option>
                <option>A - Z</option>
                <option>Z - A</option>
              </select>
            </div>
          </div>
          <div className="showdoctor-content-mid showdoctor-con">
            <div className="showdoctor-content-mid-list">
              <div className="showdoctor-content-mid-list-item ">
                <div className="f">
                  <img src={doctor} />
                  <div>
                    <div>
                      <p>
                        Bác sĩ: <b>NGUYỄN VĂN A</b>
                      </p>
                      <p>
                        <b>Chuyên ngành:</b> Khoa tạo mạng mạc
                      </p>
                      <p>
                        <b>Số lượt đặt lịch:</b> 50
                      </p>
                      <p>
                        <b>Trạng thái:</b> Onl
                      </p>
                    </div>
                    <div>
                      <button>Đặt lịch</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(ShowDoctor);
