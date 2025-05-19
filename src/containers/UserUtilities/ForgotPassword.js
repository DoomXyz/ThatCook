import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline, chevronBack, pencil } from 'ionicons/icons';
import { connect } from 'react-redux';
import Spinner from '../../components/Spinner';
import { handleSendForgotTokenApi, handleVerifyForgotTokenApi, handleChangePasswordApi } from '../../services/accountServices';
import './ForgotPassword.scss';

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,
      email: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: '',
      accountID: '',
      isLoading: false,
      showNewPassword: false,
      showConfirmPassword: false,
    };
  }
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({ ...copyState });
  };
  toggleShowPassword = (field) => {
    this.setState((prevState) => ({
      [field]: !prevState[field],
    }));
  };
  handleSendForgotToken = async () => {
    const { email } = this.state;
    this.setState({ isLoading: true });
    try {
      const response = await handleSendForgotTokenApi(email);
      if (response && response.errCode === 0) {
        this.setState({
          accountID: response.data,
          currentStep: 2,
        });
        toast.success('Mã xác nhận đã được gửi đến email!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      } else {
        toast.error(response.errMessage || 'Lỗi khi kiểm tra email!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Error sending forgot token:', e);
      toast.error('Lỗi khi gửi yêu cầu kiểm tra email!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleVerifyForgotToken = async () => {
    const { accountID, verificationCode } = this.state;
    this.setState({ isLoading: true });
    try {
      const response = await handleVerifyForgotTokenApi(accountID, verificationCode);
      if (response && response.errCode === 0) {
        this.setState({ currentStep: 3 });
        toast.success('Xác nhận mã thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      } else {
        toast.error(response.errMessage || 'Mã xác nhận không hợp lệ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Error verifying forgot token:', e);
      toast.error('Lỗi khi xác nhận mã!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleChangePassword = async () => {
    const { accountID, newPassword, confirmPassword } = this.state;
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    this.setState({ isLoading: true });
    try {
      const response = await handleChangePasswordApi(accountID, 'forgot_password', newPassword);
      if (response && response.errCode === 0) {
        toast.success('Đổi mật khẩu thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        setTimeout(() => {
          this.props.navigate('/login');
        }, 501);
      } else {
        toast.error(response.errMessage || 'Lỗi khi đổi mật khẩu!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Error changing password:', e);
      toast.error('Lỗi khi gửi yêu cầu đổi mật khẩu!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleStep1Submit = (e) => {
    e.preventDefault();
    this.handleSendForgotToken();
  };

  handleStep2Submit = (e) => {
    e.preventDefault();
    this.handleVerifyForgotToken();
  };
  handleStep3Submit = (e) => {
    e.preventDefault();
    this.handleChangePassword();
  };

  renderForm() {
    const { currentStep, email, verificationCode, newPassword, confirmPassword, isLoading } = this.state;
    switch (currentStep) {
      case 1:
        return (
          <form className="forgot-form-step" onSubmit={this.handleStep1Submit}>
            <div className="forgot-form-content">
              <label>
                <b>Vui lòng nhập Email cần đổi mật khẩu:</b>
              </label>
              <div className="input-form">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => this.handleOnChangeInput(event, 'email')}
                  placeholder="Email"
                  required
                />
              </div>
            </div>
            <div className="button-submit">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <form className="forgot-form-step" onSubmit={this.handleStep2Submit}>
            <div className="forgot-form-content">
              <label>
                <b>Vui lòng nhập mã xác minh được gửi đến Email:</b>
              </label>
              <div className="input-form">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(event) => this.handleOnChangeInput(event, 'verificationCode')}
                  placeholder="Mã xác minh"
                  required
                />
              </div>
            </div>
            <div className="button-submit">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </form>
        );
      case 3:
        return (
          <form className="forgot-form-step" onSubmit={this.handleStep3Submit}>
            <div className="forgot-form-content">
              <label>
                <b>Nhập mật khẩu mới:</b>
              </label>
              <div className="input-form">
                <input type={this.state.showNewPassword ? 'text' : 'password'} name="newPassword" value={newPassword} onChange={(event) => this.handleOnChangeInput(event, "newPassword")} placeholder="Nhập mật khẩu mới" required />
                <IonIcon icon={this.state.showNewPassword ? eyeOutline : eyeOffOutline} className="password-toggle-icon" onClick={() => this.toggleShowPassword('showNewPassword')} />
              </div>
              <label>
                <b>Nhập lại mật khẩu:</b>
              </label>
              <div className="input-form">
                <input type={this.state.showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={confirmPassword} onChange={(event) => this.handleOnChangeInput(event, "confirmPassword")} placeholder="Xác nhận mật khẩu" required />
                <IonIcon icon={this.state.showConfirmPassword ? eyeOutline : eyeOffOutline} className="password-toggle-icon" onClick={() => this.toggleShowPassword('showConfirmPassword')} />
              </div>
            </div>
            <div className="button-submit">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Hoàn tất'}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  }
  render() {
    const { currentStep, isLoading } = this.state;
    return (
      <div className="forgot-background">
        <ToastContainer />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="forgot-container">
            <div className="forgot-content">
              <div className='forgot-head'>
                <div
                  className="back"
                  onClick={() => {
                    this.props.navigate('/login');
                  }}>
                  <IonIcon icon={chevronBack}></IonIcon>
                </div>
                <div className='forgot-head-info'><h2>Quên Mật Khẩu</h2>
                </div>
                <div className='back2'></div>
              </div>

              <div className="forgot-status">
                <div className="forgot-step">
                  <div className={`forgot-step-email ${currentStep === 1 ? 'active' : ''}`}>
                    <div className="icon">1</div>
                    <div className="step-description">Nhập email</div>
                  </div>
                  <div className={`forgot-step-authentic ${currentStep === 2 ? 'active' : ''}`}>
                    <div className="icon">2</div>
                    <div className="step-description">Xác minh mã</div>
                  </div>
                  <div className={`forgot-step-password ${currentStep === 3 ? 'active' : ''}`}>
                    <div className="icon">3</div>
                    <div className="step-description">Đặt lại mật khẩu</div>
                  </div>
                </div>
              </div>
              {this.renderForm()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
