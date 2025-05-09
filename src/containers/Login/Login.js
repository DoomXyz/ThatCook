import React, { Component } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { connect } from 'react-redux';
import { IonIcon } from "@ionic/react"; //import thư viện icon
import { home, keyOutline, eyeOffOutline, eyeOutline } from "ionicons/icons"; //chỉ import các icon cần dùng
import Spinner from '../../components/Spinner';
import './Login.scss'; //import scss
import { handleLoginApi, handleLogoutApi } from '../../services/accountServices'; //import hành động login
import { handleAddToCartApi } from "../../services/cartServices"
import { checkLoginStatus } from '../../utils/pakage';
import { userLogin, userLogout, clearCart, clearCheckOutCart } from '../../store/actions'

class Login extends Component {
    constructor(props) {
        super(props);
        //set all state cần quản lý ở giá trị mặc định
        this.state = {
            accountname: '',
            password: '',
            isTogglePassword: false,
            rememberMe: false,
            isLoading: true,
        }
    }
    async componentDidMount() {
        await this.handleIsLogin();
    }
    //state khi thay đổi ô email để set ô email theo người dùng nhập ở thời gian thực
    handleOnChangeAccountName = (event) => {
        this.setState({
            accountname: event.target.value,
        })
    }
    //tương tự trên nhưng là password
    handleOnChangePassword = (event) => {
        this.setState({
            password: event.target.value,
        })
    }
    //quản lý state ẩn hiện password
    handleTogglePassword = () => {
        this.setState({
            //khi ấn vào thì chuyển state thành state đối nghịch
            isTogglePassword: !this.state.isTogglePassword
        })
    }
    //kiểm tra xem có đang đăng nhập không
    handleIsLogin = async () => {
        const navigateMap = {
            'A': '/user/admin',
            'O': '/user/owner',
            'V': '/user/veterinarian',
            'C': '/home'
        };
        try {
            const { status, accountInfo } = await checkLoginStatus();
            if (status && accountInfo) {
                if (!this.props.userInfo) {
                    this.props.userLogin(accountInfo);
                }
                const path = navigateMap[accountInfo.AccountType] || '/login';
                setTimeout(() => {
                    this.props.navigate(path);
                }, 0);
            } else {
                await handleLogoutApi();
                this.props.userLogout();
            }
        } catch (e) {
            this.props.navigate('/login');
            console.log("Token not found!")
        }
        this.setState({
            isLoading: false
        })
    }
    //state khi ấn nút đăng nhập
    handleLogin = async (e) => {
        e.preventDefault();
        this.setState({
            isLoading: true
        })
        try {
            //gọi api login ở backend, truyển email và password đi để kiểm tra
            //biến data dùng để lưu thông tin trả về từ api
            const { accountname, password, rememberMe } = this.state
            let response = await handleLoginApi(accountname, password, rememberMe);
            // nếu nhận được thông tin từ backend với mã lỗi khác 0 -> các trường hợp sai mail, sai pass,...
            if (response && response.errCode !== 0) {
                toast.error(response.errMessage, {
                    position: "bottom-center",
                    autoClose: 500,
                    closeOnClick: true
                });
            } else {
                const accountInfo = response.data
                if (this.props.cartItems.length !== 0) {
                    const responseCart = await handleAddToCartApi(accountInfo.AccountID, this.props.cartItems);
                    if (responseCart) {
                        toast.info("Đồng bộ giỏ hàng thành công!", {
                            position: "top-right",
                            autoClose: 500,
                            closeOnClick: true
                        });
                        this.props.clearCart()
                    }
                }
                this.props.clearCheckOutCart();
                this.props.userLogin({
                    AccountID: accountInfo.AccountID,
                    AccountName: accountInfo.AccountName,
                    AccountType: accountInfo.AccountType,
                    UserImage: accountInfo.UserImage,
                    UserName: accountInfo.UserName
                });
                toast.success("Đăng nhập thành công!", {
                    position: "bottom-center",
                    autoClose: 500,
                    closeOnClick: true
                });
                setTimeout(() => {
                    this.props.navigate(response.navigate);
                }, 501);
            }
        } catch (e) {
            toast.error("Đã xảy ra lỗi không xác định!", {
                position: "bottom-center",
                autoClose: 500,
                closeOnClick: true
            });
        }
        this.setState({
            isLoading: false
        })
    }
    render() {
        const { accountname, password, rememberMe, isLoading } = this.state
        return (
            <div className='login-background'>
                <ToastContainer />
                {isLoading ? <Spinner /> : (
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
                                    <IonIcon icon={keyOutline}></IonIcon>
                                    <input type="text"
                                        placeholder=''
                                        //set value của ô input bằng dữ liệu của state
                                        value={accountname}
                                        //quản lý event khi thay đổi thì gọi hàm handleOnChangeEmail để chuyển state
                                        onChange={(event) => this.handleOnChangeAccountName(event)}
                                        required />
                                    <label>Tên đăng nhập</label>
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
                                        value={password}
                                        onChange={(event) => this.handleOnChangePassword(event)}
                                        required />
                                    <label>Mật khẩu</label>
                                </div>
                                <div className="password-util">
                                    <div className="remember-me">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(event) => this.setState({ rememberMe: event.target.checked })}
                                        />
                                        <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
                                    </div>
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
                )}
            </div>
        );
    }
}

// Map state từ Redux store vào props (nếu cần lấy dữ liệu từ store)
const mapStateToProps = (state) => ({
    userInfo: state.user.userInfo,
    cartItems: state.cart.cartItems,
});

// Map dispatch để gửi action lên store
const mapDispatchToProps = (dispatch) => ({
    userLogin: (userInfo) => dispatch(userLogin(userInfo)),
    userLogout: () => dispatch(userLogout()),
    clearCart: () => dispatch(clearCart()),
    clearCheckOutCart: () => dispatch(clearCheckOutCart()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);