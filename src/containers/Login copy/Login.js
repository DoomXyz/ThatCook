import React, { Component } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { connect } from 'react-redux';
import { IonIcon } from "@ionic/react"; //import thư viện icon
import { home, mailOutline, eyeOffOutline, eyeOutline } from "ionicons/icons"; //chỉ import các icon cần dùng
import './Login.scss'; //import scss
import "../../styles/ToastifyOverride.scss";
import { handleLoginApi, handleVeryfiToken } from '../../services/userServices'; //import hành động login
import { handleAddToCart } from "../../services/cartService"
import { userLogin, clearCart } from '../../store/actions'

class Login extends Component {
    constructor(props) {
        super(props);
        //set all state cần quản lý ở giá trị mặc định
        this.state = {
            email: '',
            password: '',
            isTogglePassword: false,
        }
    }
    async componentDidMount() {
        await this.handleIsLogin();
    }
    //state khi thay đổi ô email để set ô email theo người dùng nhập ở thời gian thực
    handleOnChangeEmail = (event) => {
        this.setState({
            email: event.target.value,
        })
    }
    //tương tự trên nhưng là password
    handleOnChangePassword = (event) => {
        this.setState({
            password: event.target.value,
        })
    }
    handleIsLogin = async () => {
        // Kiểm tra userInfo từ Redux trước
        if (this.props.userInfo && this.props.userInfo.accounttype) {
            const navigateMap = {
                'A': '/user/admin',
                'O': '/user/owner',
                'C': '/home'
            };
            const path = navigateMap[this.props.userInfo.accounttype] || '/login';
            setTimeout(() => {
                this.props.navigate(path);
            }, 0);
            return;
        }
        // Nếu không có userInfo, kiểm tra token
        try {
            const result = await handleVeryfiToken();;
            if (result && result.errCode === 0) {
                const navigateMap = {
                    'A': '/user/admin',
                    'O': '/user/owner',
                    'C': '/home'
                };
                const path = navigateMap[result.data.AccountType] || '/login';
                setTimeout(() => {
                    this.props.navigate(path);
                }, 0);
            }
        } catch (error) {
            console.log("Error verifying token:", error);
        }
    }
    //state khi ấn nút đăng nhập
    handleLogin = async (e) => {
        e.preventDefault();
        try {
            //gọi api login ở backend, truyển email và password đi để kiểm tra
            //biến data dùng để lưu thông tin trả về từ api
            let data = await handleLoginApi(this.state.email, this.state.password);
            //nếu nhận được thông tin từ backend với mã lỗi khác 0 -> các trường hợp sai mail, sai pass,...
            if (data && data.errCode !== 0) {
                toast.error(data.errMessage, {
                    position: "bottom-center",
                    autoClose: 1000,
                });
            }
            if (data && data.errCode === 0) {
                if (this.props.cartItems) {
                    let response = await handleAddToCart(data.MaTaiKhoan, this.props.cartItems);
                    if (response) {
                        toast.info("Đồng bộ giỏ hàng thành công!", {
                            position: "top-right",
                            autoClose: 1000,
                        });
                        this.props.clearCart()
                    }
                }
                this.props.userLogin({
                    accounttype: data.AccountType,
                    email: data.Email,
                    hoten: data.HoTen,
                    anhdaidien: data.AnhDaiDien,
                    mataikhoan: data.MaTaiKhoan
                });

                toast.success("Đăng nhập thành công!", {
                    position: "bottom-center",
                    autoClose: 500,
                });
                setTimeout(() => {
                    this.props.navigate(data.navigate);
                }, 501);
            }
        } catch (error) {
            //lỗi không có thông tin được gửi đi api, trường hợp email và password đều trống
            if (error.response && error.response.data) {
                toast.error(error.response.data.errMessage, {
                    position: "bottom-center",
                    autoClose: 1000,
                });
            } else {
                toast.error("Đã xảy ra lỗi không xác định!", {
                    position: "bottom-center",
                    autoClose: 1000,
                });
            }
        }
    }
    //quản lý state ẩn hiện password
    handleTogglePassword = () => {
        this.setState({
            //khi ấn vào thì chuyển state thành state đối nghịch
            isTogglePassword: !this.state.isTogglePassword
        })
    }
    render() {
        return (
            <div className='login-background'>
                <ToastContainer />
                <div className='login-container'>
                    <div className='login-content'>
                        <div className='home-button'>
                            <a onClick={() => { this.props.navigate('/home') }}><IonIcon icon={home}></IonIcon></a>
                        </div>
                        <div className='text-login'>
                            ĐĂNG NHẬP
                        </div>
                        <form onSubmit={this.handleLogin}>
                            <div className="inputbox">
                                <IonIcon icon={mailOutline}></IonIcon>
                                <input type="email"
                                    placeholder=''
                                    //set value của ô input bằng dữ liệu của state
                                    value={this.state.email}
                                    //quản lý event khi thay đổi thì gọi hàm handleOnChangeEmail để chuyển state
                                    onChange={(event) => this.handleOnChangeEmail(event)}
                                    required />
                                <label>Email</label>
                            </div>
                            <div className="inputbox">
                                <div className="toggle-password"
                                    //quản lý event khi click vào thì gọi hàm để chuyển state
                                    onClick={() => this.handleTogglePassword()}
                                >
                                    <IonIcon
                                        //biến icon của IonIcon, icon sẽ dựa vào state isTogglePassword true hoặc false để đổi icon tương ứng
                                        icon={this.state.isTogglePassword ? eyeOutline : eyeOffOutline}></IonIcon>
                                </div>
                                <input
                                    //các state hoạt động như email
                                    type={this.state.isTogglePassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder=''
                                    value={this.state.password}
                                    onChange={(event) => this.handleOnChangePassword(event)}
                                    required />
                                <label>Mật khẩu</label>
                            </div>
                            <div className="password-util">
                                <a className='forgot-password'
                                    onClick={() => { this.props.navigate('/user/forgotpassword') }}>Quên mật khẩu?</a>
                            </div>
                            <button
                                type="submit"
                                className='login-button'>
                                <p>Đăng nhập</p>
                            </button>
                        </form>
                        <div className='signin'>
                            <p>
                                Không có tài khoản?
                                <a onClick={() => { this.props.navigate('/register') }}> Đăng ký ngay!</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// Map state từ Redux store vào props (nếu cần lấy dữ liệu từ store)
const mapStateToProps = (state) => ({
    userInfo: state.user.userInfo, // Lấy thông tin user từ store nếu cần 
    cartItems: state.product.cartItems,
});

// Map dispatch để gửi action lên store
const mapDispatchToProps = (dispatch) => ({
    userLogin: (userInfo) => dispatch(userLogin(userInfo)), // Dispatch action userLogin
    clearCart: () => dispatch(clearCart()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);