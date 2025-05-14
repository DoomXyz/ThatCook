import React, { Component } from 'react';

import './HomeFooter.scss';

import fb from '../assets/icons/social-fb.png';
import tiktok from '../assets/icons/social-media.png';
import insta from '../assets/icons/play.png';
import phone from '../assets/icons/phone-call.png';

class Footer extends Component {
  render() {
    return (
      <div className="footer">
        <div className="contact">
          <p>Thông tin liên hệ</p>
          <li>
            <b>Mincow</b> là trang mua sắm trực tuyến các sản phẩm bán lẻ dành cho thú cưng của <b>Mincow Pet Shop</b>.<b>Công ty TNHH MINCOW</b>. Giấy chứng nhận Đăng ký Kinh doanh số 0315592769 do
            Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp ngày 28/03/2019.
          </li>
        </div>
        <div className="address">
          <p>Thông tin cửa hàng</p>
          <li>
            <b>Địa chỉ</b>: 136 Huỳnh Văn Bánh, p. 11, quận Phú Nhuận, HCM
          </li>
          <li>
            <b>0901131141</b>
          </li>
          <li>info@mincow.vn</li>
        </div>
        <div className="support">
          <div className="suport-cus">
            <p>Chăm sóc khách hàng</p>
            <li>
              <img src={phone}></img>
              <b>0901131141</b>
            </li>
          </div>
          <p>Follow Us</p>
          <div className="social">
            <li>
              <a href="https://www.facebook.com/profile.php?id=100067441635059">
                <img src={fb} alt=""></img>
              </a>
            </li>
            <li>
              <a href="">
                <img src={insta} alt=""></img>
              </a>
            </li>
            <li>
              <a href="">
                <img src={tiktok} alt=""></img>
              </a>
            </li>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;
