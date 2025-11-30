import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import Select from 'react-select';

import { mailOutline, eyeOffOutline, lockClosedOutline, eyeOutline, person, call, location, maleFemaleOutline, keyOutline, informationCircleOutline, briefcaseOutline, pulseOutline, cubeOutline } from 'ionicons/icons';

import './CreateAccountModal.scss';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { handleGetServiceInfoApi } from '../../services/serviceServices';

import { getAllCodes, validateAccountInput, validateVeterinarianInput } from '../../utils/pakage'

class CreateAccountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AccountName: '',
      Email: '',
      Password: '',
      UserName: '',
      Phone: '',
      Address: '',
      Gender: '',
      AccountType: '',
      confirmPassword: '',
      Bio: '',
      Specialization: '',
      WorkingStatus: '',
      isTogglePassword1: false,
      isTogglePassword2: false,
      codeGender: [],
      codeAccountType: [],
      codeWorkingStatus: [],
      loadedServiceInfo: [],
      selectedServices: [],
    };
  }
  async componentDidMount() {
    await this.handleLoadCode(['Gender', 'AccountType', 'WorkingStatus']);
    await this.handleGetServiceInfo();
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.resetState();
    }
  };
  handleLoadCode = async (codeTypes) => {
    try {
      const responses = await Promise.all(codeTypes.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypes.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        newState[type.toLowerCase()] = response.data.length > 0 ? response.data[0].Code : '';
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  handleGetServiceInfo = async () => {
    try {
      const responseApi = await handleGetServiceInfoApi('ALL');
      const response = responseApi.data
      if (response.errCode === 0 && response.data && response.data.length > 0) {
        this.setState({
          loadedServiceInfo: response.data,
        });
      } else {
        toast.error('Không thể tải danh sách dịch vụ!');
      }
    } catch (e) {
      console.log('Error loading service info:', e);
      toast.error('Lỗi khi tải danh sách dịch vụ!');
    }
  };
  resetState = () => {
    const { codeGender, codeAccountType, codeWorkingStatus } = this.state
    this.setState({
      AccountName: '',
      Email: '',
      Password: '',
      UserName: '',
      Phone: '',
      Address: '',
      Gender: codeGender.length > 0 ? codeGender[0].Code : '',
      AccountType: codeAccountType.length > 0 ? codeAccountType[0].Code : '',
      confirmPassword: '',
      Bio: '',
      Specialization: '',
      WorkingStatus: codeWorkingStatus.length > 0 ? codeWorkingStatus[0].Code : '',
      isTogglePassword1: false,
      isTogglePassword2: false,
      selectedServices: [],
    });
  };
  toggle = async () => {
    this.resetState();
    this.props.toggleFromModal();
  };
  handleTogglePassword = (type) => {
    let value;
    switch (type) {
      case 1: value = 'isTogglePassword1';
        break;
      case 2: value = 'isTogglePassword2';
        break;
      default: break;
    }
    this.setState((prevState) => ({ [value]: !prevState[value] }));
  }
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };
  handleServiceChange = (selectedOptions) => {
    const selectedServiceIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    this.setState({ selectedServices: selectedServiceIds });
  };
  handleCreateAccount = async () => {
    const { AccountName, Email, Password, UserName, Phone, Address, Gender, AccountType, confirmPassword, Bio, Specialization, WorkingStatus, selectedServices } = this.state;
    if (Password !== confirmPassword) {
      toast.error('Mật khẩu không trùng khớp!');
      this.setState({ isLoading: false });
      return;
    }
    const userInfo = {
      AccountName,
      Email,
      Password,
      UserName,
      Phone,
      Address,
      Gender,
      AccountType,
    };
    const isValidateAccountInput = await validateAccountInput(userInfo, "REG");
    if (!isValidateAccountInput.valid) {
      toast.error(isValidateAccountInput.errMessage);
      this.setState({ isLoading: false });
      return;
    }
    if (AccountType === 'V') {
      userInfo.veterinarianInfo = {
        Bio: Bio || null,
        Specialization: Specialization || null,
        WorkingStatus: WorkingStatus || null,
        selectedServicesList: selectedServices,
      };
      const isValidateVeterinarianInput = await validateVeterinarianInput(userInfo.veterinarianInfo);
      if (!isValidateVeterinarianInput.valid) {
        toast.error(isValidateVeterinarianInput.errMessage);
        this.setState({ isLoading: false });
        return;
      }
    }
    this.props.handleCreateAccountFromModal(userInfo);
  };
  render() {
    const { isOpen } = this.props;
    const { AccountName, Email, Password, UserName, Phone, Address, Gender, AccountType, confirmPassword, Bio, Specialization, WorkingStatus,
      isTogglePassword1, isTogglePassword2, selectedServices,
      codeGender, codeAccountType, codeWorkingStatus, loadedServiceInfo } = this.state;
    const serviceOptions = loadedServiceInfo.map((service) => ({
      value: service.ServiceID,
      label: service.ServiceName,
    }));
    return (
      <Modal show={isOpen} onHide={this.toggle} className="create-user-modal" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Tạo tài khoản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={mailOutline}></IonIcon>
              <input type="email" placeholder="" value={Email} onChange={(event) => this.handleOnChangeInput(event, 'Email')} />
              <label>Email</label>
            </div>
            <div className="selectbox">
              <label>Phân quyền</label>
              <select value={AccountType} onChange={(event) => this.handleOnChangeInput(event, 'AccountType')}>
                {codeAccountType.length > 0 ? (
                  codeAccountType.map((item) => (
                    <option key={item.Code} value={item.Code}>
                      {item.CodeValueVI}
                    </option>
                  ))
                ) : (
                  <option value="">Không có dữ liệu phân quyền</option>
                )}
              </select>
              <IonIcon icon={lockClosedOutline}></IonIcon>
            </div>
          </div>
          {AccountType === 'V' && (
            <div className="R2 veterinarian-info">
              <div className="f">
                <div className="inputbox-2">
                  <IonIcon icon={briefcaseOutline}></IonIcon>
                  <input type="text" placeholder="" value={Specialization} onChange={(event) => this.handleOnChangeInput(event, 'Specialization')} />
                  <label>Chuyên khoa</label>
                </div>
                <div className="selectbox">
                  <label>Trạng thái làm việc</label>
                  <select value={WorkingStatus} onChange={(event) => this.handleOnChangeInput(event, 'WorkingStatus')}>
                    {codeWorkingStatus.length > 0 ? (
                      codeWorkingStatus.map((item) => (
                        <option key={item.Code} value={item.Code}>
                          {item.CodeValueVI}
                        </option>
                      ))
                    ) : (
                      <option value="">Không có dữ liệu trạng thái</option>
                    )}
                  </select>
                  <IonIcon icon={pulseOutline}></IonIcon>
                </div>
              </div>
              <div className="inputbox-1">
                <IonIcon icon={informationCircleOutline}></IonIcon>
                <textarea placeholder="" value={Bio} onChange={(event) => this.handleOnChangeInput(event, 'Bio')} className={Bio ? 'filled' : ''} />
                <label>Tiểu sử</label>
              </div>
              <div className="selectbox-service">
                <label>Dịch vụ thực hiện</label>
                <Select isMulti options={serviceOptions} value={serviceOptions.filter((option) => selectedServices.includes(option.value))} onChange={this.handleServiceChange} placeholder="Chọn dịch vụ..." className="service-select" classNamePrefix="select" />
                <IonIcon icon={cubeOutline}></IonIcon>
              </div>
            </div>
          )}
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={person}></IonIcon>
              <input type="text" placeholder="" value={UserName} onChange={(event) => this.handleOnChangeInput(event, 'UserName')} />
              <label>Họ Tên</label>
            </div>
            <div className="inputbox">
              <IonIcon icon={call}></IonIcon>
              <input type="tel" placeholder="" value={Phone} onChange={(event) => this.handleOnChangeInput(event, 'Phone')} />
              <label>Số điện thoại</label>
            </div>
          </div>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={keyOutline}></IonIcon>
              <input type="text" placeholder="" value={AccountName} onChange={(event) => this.handleOnChangeInput(event, 'AccountName')} />
              <label>Tên tài khoản</label>
            </div>
            <div className="inputbox">
              <div className="toggle-password">
                <IonIcon icon={isTogglePassword1 ? eyeOutline : eyeOffOutline} onClick={() => this.handleTogglePassword(1)}></IonIcon>
              </div>
              <input type={isTogglePassword1 ? 'text' : 'password'} placeholder="" value={Password} onChange={(event) => this.handleOnChangeInput(event, 'Password')} />
              <label>Mật khẩu</label>
            </div>
          </div>
          <div className="R1">
            <div className="selectbox">
              <label>Giới tính</label>
              <select value={Gender} onChange={(event) => this.handleOnChangeInput(event, 'Gender')}>
                {codeGender.length > 0 ? (
                  codeGender.map((item) => (
                    <option key={item.Code} value={item.Code}>
                      {item.CodeValueVI}
                    </option>
                  ))
                ) : (
                  <option value="">Không có dữ liệu giới tính</option>
                )}
              </select>
              <IonIcon icon={maleFemaleOutline}></IonIcon>
            </div>
            <div className="inputbox">
              <div className="toggle-password">
                <IonIcon icon={isTogglePassword2 ? eyeOutline : eyeOffOutline} onClick={() => this.handleTogglePassword(2)}></IonIcon>
              </div>
              <input type={isTogglePassword2 ? 'text' : 'password'} placeholder="" value={confirmPassword} onChange={(event) => this.handleOnChangeInput(event, 'confirmPassword')} />
              <label>Xác nhận mật khẩu</label>
            </div>
          </div>
          <div className="R2">
            <div className="inputbox-address">
              <IonIcon icon={location}></IonIcon>
              <input className="address" type="text" placeholder="" value={Address} onChange={(event) => this.handleOnChangeInput(event, 'Address')} />
              <label>Địa chỉ</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleCreateAccount}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateAccountModal;