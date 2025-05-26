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
      accountname: '',
      email: '',
      password: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      accounttype: '',
      confirmPassword: '',
      bio: '',
      specialization: '',
      workingstatus: '',
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
      await this.resetState();
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
  resetState = async () => {
    const { codeGender, codeAccountType, codeWorkingStatus } = this.state
    this.setState({
      accountname: '',
      email: '',
      password: '',
      username: '',
      phone: '',
      address: '',
      gender: codeGender.length > 0 ? codeGender[0].Code : '',
      accounttype: codeAccountType.length > 0 ? codeAccountType[0].Code : '',
      confirmPassword: '',
      bio: '',
      specialization: '',
      workingstatus: codeWorkingStatus.length > 0 ? codeWorkingStatus[0].Code : '',
      isTogglePassword1: false,
      isTogglePassword2: false,
      selectedServices: [],
    });
  };
  toggle = async () => {
    await this.resetState();
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
    const { accountname, email, password, username, phone, address, gender, accounttype, confirmPassword, bio, specialization, workingstatus, selectedServices } = this.state;
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không trùng khớp!');
      this.setState({ isLoading: false });
      return;
    }
    const userInfo = {
      accountname,
      email,
      password,
      username,
      phone,
      address,
      gender,
      accounttype,
    };
    const isValidateAccountInput = await validateAccountInput(userInfo, "REG");
    if (!isValidateAccountInput.valid) {
      toast.error(isValidateAccountInput.errMessage);
      this.setState({ isLoading: false });
      return;
    }
    if (accounttype === 'V') {
      userInfo.veterinarianInfo = {
        bio: bio || null,
        specialization: specialization || null,
        workingstatus: workingstatus || null,
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
    const { accountname, email, password, username, phone, address, gender, accounttype, confirmPassword, bio, specialization, workingstatus,
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
              <input type="email" placeholder="" value={email} onChange={(event) => this.handleOnChangeInput(event, 'email')} />
              <label>Email</label>
            </div>
            <div className="selectbox">
              <label>Phân quyền</label>
              <select value={accounttype} onChange={(event) => this.handleOnChangeInput(event, 'accounttype')}>
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
          {accounttype === 'V' && (
            <div className="R2 veterinarian-info">
              <div className="f">
                <div className="inputbox-2">
                  <IonIcon icon={briefcaseOutline}></IonIcon>
                  <input type="text" placeholder="" value={specialization} onChange={(event) => this.handleOnChangeInput(event, 'specialization')} />
                  <label>Chuyên khoa</label>
                </div>
                <div className="selectbox">
                  <label>Trạng thái làm việc</label>
                  <select value={workingstatus} onChange={(event) => this.handleOnChangeInput(event, 'workingstatus')}>
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
                <textarea placeholder="" value={bio} onChange={(event) => this.handleOnChangeInput(event, 'bio')} className={bio ? 'filled' : ''} />
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
              <input type="text" placeholder="" value={username} onChange={(event) => this.handleOnChangeInput(event, 'username')} />
              <label>Họ Tên</label>
            </div>
            <div className="inputbox">
              <IonIcon icon={call}></IonIcon>
              <input type="tel" placeholder="" value={phone} onChange={(event) => this.handleOnChangeInput(event, 'phone')} />
              <label>Số điện thoại</label>
            </div>
          </div>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={keyOutline}></IonIcon>
              <input type="text" placeholder="" value={accountname} onChange={(event) => this.handleOnChangeInput(event, 'accountname')} />
              <label>Tên tài khoản</label>
            </div>
            <div className="inputbox">
              <div className="toggle-password">
                <IonIcon icon={isTogglePassword1 ? eyeOutline : eyeOffOutline} onClick={() => this.handleTogglePassword(1)}></IonIcon>
              </div>
              <input type={isTogglePassword1 ? 'text' : 'password'} placeholder="" value={password} onChange={(event) => this.handleOnChangeInput(event, 'password')} />
              <label>Mật khẩu</label>
            </div>
          </div>
          <div className="R1">
            <div className="selectbox">
              <label>Giới tính</label>
              <select value={gender} onChange={(event) => this.handleOnChangeInput(event, 'gender')}>
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
              <input className="address" type="text" placeholder="" value={address} onChange={(event) => this.handleOnChangeInput(event, 'address')} />
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