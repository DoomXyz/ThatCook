import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from "@ionic/react"; //import thư viện icon
import { } from "ionicons/icons"; //chỉ import các icon cần dùng
import './ForgotPassword.scss'; //import scss

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {

            currentStep: 1,//Theo dõi bước hiện tại
            //state test
            email: '',//email tài khoản
            verificationCode: '', // Lưu mã xác minh từ bước 2
            newPassword: '' // Lưu mật khẩu mới từ bước 3
        }
    }
    componentDidMount() {

    }
    handleStep1Submit = (e) => {
        e.preventDefault();
        this.setState({ currentStep: 2 });
    }
    handleStep2Submit = (e) => {
        e.preventDefault();
        this.setState({ currentStep: 3 });
    }
    handleStep3Submit = (e) => {
        e.preventDefault();
        console.log("Password reset complete")
    }
    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }
    renderForm() {
        const { currentStep, email, verificationCode, newPassword } = this.state;
        switch (currentStep) {
            case 1:
                return (
                    <form className='forgot-form-step' onSubmit={this.handleStep1Submit}>
                        <div className='forgot-form-content'>
                            <label> <b>Vui lòng nhập Email cần đổi mật khẩu:</b> </label>
                            <div className='input-form'>
                                <input type='text'
                                    name='email'
                                    value={email}
                                    onChange={this.handleInputChange}
                                    placeholder='Email' required
                                />
                            </div>
                        </div>
                        <div className='button-submit'>
                            <button type='submit'>Tiếp tục</button>
                        </div>
                    </form>
                );
            case 2:
                return (
                    <form className='forgot-form-step' onSubmit={this.handleStep2Submit}>
                        <div className='forgot-form-content'>
                            <label> <b>Vui lòng nhập mã xác minh được gửi đến Email của bạn:</b> </label>
                            <div className='input-form'>
                                <input type='text'
                                    name='verificationCode'
                                    value={verificationCode}
                                    onChange={this.handleInputChange}
                                    placeholder='Mã xác minh ' required
                                />
                            </div>
                        </div>
                        <div className='button-submit'>
                            <button type='submit'>Tiếp tục </button>
                        </div>
                    </form>
                );
            case 3:
                return (
                    <form className='forgot-form-step' onSubmit={this.handleStep3Submit}>
                        <div className='forgot-form-content'>
                            <div className='input-form'>
                                <label> <b>Nhập mật khẩu mới:</b> </label>
                                <input type='text'
                                    name='newPassword'
                                    placeholder='Nhập mật khẩu mới' required
                                />
                                <label> <b>Nhập lại mật khẩu:</b> </label>
                                <input type='text'
                                    name='newPassword'
                                    value={newPassword}
                                    onChange={this.handleInputChange}
                                    placeholder='Nhập lại mật khẩu ' required
                                />
                            </div>
                        </div>
                        <div className='button-submit'>
                            <button type='submit'>Hoàn tất </button>
                        </div>
                    </form>
                );
            default:
                return null;
        }
    }
    render() {
        const { currentStep } = this.state;
        return (
            <div className='forgot-background'>
                <div className='forgot-container'>
                    <div className='forgot-content'>
                        <a>Quên Mật Khẩu</a>
                        <div className='forgot-status'>
                            <div className='forgot-step'>
                                <div className={`forgot-step-email ${currentStep === 1 ? 'active' : ''}`}>
                                    <div className='icon'>1</div>
                                    <div className='step-description'>Nhập tài khoản </div>
                                </div>
                                <div className={`forgot-step-authentic ${currentStep === 2 ? 'active' : ''}`}>
                                    <div className='icon'>2</div>
                                    <div className='step-description'>Xác minh bảo mật </div>
                                </div>
                                <div className={`forgot-step-password ${currentStep === 3 ? 'active' : ''}`}>
                                    <div className='icon'>3</div>
                                    <div className='step-description'>Thiệt lập lại mật khẩu </div>
                                </div>
                            </div>
                        </div>
                        {this.renderForm()}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);