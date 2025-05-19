import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import { } from 'ionicons/icons'; //chỉ import các icon cần dùng
import './AppointmentCheckOut.scss'; //import scss
import logo from '../../assets/images/logo1.png';
import Header from '../../components/HomeHeader';

class AppointmentCheckOut extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() { }
    render() {
        return (
            <div className="appointment-check-out-body">
                <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} />
                <div className="appointment-check-out-content">
                    <div className="appointment-check-out-content-top">
                        <h1>Thông Tin Thanh Toán</h1>
                    </div>
                    <div className="f">
                        <div className="appointment-check-out-content-left ">
                            <div className="appointment-check-out-content-left-cus-info">
                                <p>*Thông tin khách hàng</p>
                                <input type="text" disabled />
                                <br />
                                <input type="text" disabled />
                                <br />
                                <input type="text" disabled />
                                <br />
                                <p>*Tên thú cưng</p>
                                <input type="text" disabled />
                            </div>
                            <div className="appointment-check-out-content-left-service-medicine-total">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <p>Dịch vụ</p>
                                            </th>
                                            <th colSpan={2}>
                                                <p>Giá</p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <p>Xét Nghiệm</p>
                                            </td>
                                            <td>
                                                <p>100000</p>
                                            </td>
                                            <td>
                                                <p>vnđ</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td>
                                                <p>Phí dược phẩm</p>
                                            </td>
                                            <td>
                                                <p>
                                                    <input type="text" />
                                                </p>
                                            </td>
                                            <td>
                                                <p>vnđ</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p>
                                                    <b>TỔNG CỘNG</b>
                                                </p>
                                            </td>
                                            <td>
                                                <p>
                                                    <b>100000</b>
                                                </p>
                                            </td>
                                            <td>
                                                <p>
                                                    <b>vnđ</b>
                                                </p>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div className="appointment-check-out-content-right">
                            <div className="appointment-check-out-content-right-img">
                                <p>*Thêm hình ảnh nếu có ( Tối đa 1 )</p>
                                <div className="appointment-check-out-content-right-img-item">
                                    <button>
                                        <p>+</p>
                                    </button>
                                </div>
                            </div>
                            <div className="appointment-check-out-content-right-notes">
                                <p>*Thêm ghi chú nếu có</p>
                                <div className="appointment-check-out-content-right-notes-item">
                                    <textarea></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="appointment-check-out-content-bottom">
                        <button>Xác nhận</button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(AppointmentCheckOut);
