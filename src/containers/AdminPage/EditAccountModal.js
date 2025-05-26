import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import Select from 'react-select';

import { mailOutline, person, call, keyOutline, location, maleFemaleOutline, peopleCircleOutline, informationCircleOutline, idCardOutline, invertModeOutline } from 'ionicons/icons';

import './EditAccountModal.scss';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { handleGetServiceInfoApi } from '../../services/serviceServices';
import { handleGetAccountInfoApi, handleGetVeterinarianInfoApi } from '../../services/accountServices';

import { getAllCodes, validateVeterinarianInput, validateAccountInput } from '../../utils/pakage'

class EditAccountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedAccountInfo: null,
      selectedAccountID: null,
      accountname: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      accounttype: '',
      bio: '',
      specialization: '',
      workingstatus: '',
      codeGender: [],
      codeAccountType: [],
      codeWorkingStatus: [],
      loadedServiceInfo: [],
      selectedServices: [],
    };
  }
  async componentDidMount() {
    const { selectedAccountID } = this.props;
    if (selectedAccountID) {
      this.loadAccountInfo(selectedAccountID);
    }
    await this.resetState();
  }
  async componentDidUpdate(prevProps, prevState) {
    const { selectedAccountID, isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      await this.resetState();
      if (selectedAccountID) {
        this.loadAccountInfo(selectedAccountID);
      }
    }
  }
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
    this.setState({
      accountname: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      accounttype: '',
      bio: '',
      specialization: '',
      workingstatus: '',
      selectedServices: [],
    });
    await this.handleLoadCode(['Gender', 'AccountType', 'WorkingStatus']);
    await this.handleGetServiceInfo();
  };
  toggle = async () => {
    await this.resetState();
    this.props.toggleFromModal();
  };
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };
  loadAccountInfo = async (accountid) => {
    try {
      const [accountResponse, vetResponse] = await Promise.all([
        handleGetAccountInfoApi(accountid),
        handleGetVeterinarianInfoApi(accountid)
      ]);
      if (accountResponse && accountResponse.errCode === 0) {
        const accountInfo = accountResponse.data;
        const vetInfo = vetResponse && vetResponse.errCode === 0 ? vetResponse.data : null;
        this.setState({
          loadedAccountInfo: accountInfo,
          selectedAccountID: accountInfo.AccountID,
          accounttype: accountInfo.AccountType,
          accountname: accountInfo.AccountName,
          email: accountInfo.Email,
          username: accountInfo.UserName,
          phone: accountInfo.Phone,
          address: accountInfo.Address,
          gender: accountInfo.Gender,
          bio: vetInfo ? vetInfo.Bio || '' : '',
          specialization: vetInfo ? vetInfo.Specialization || '' : '',
          workingstatus: vetInfo ? vetInfo.WorkingStatus || '' : '',
          selectedServices: vetResponse && vetResponse.errCode === 0 && vetResponse.data.services ? vetResponse.data.services.map((service) => service.ServiceID) : [],
        });
      } else {
        this.resetState();
        toast.error('Tải tài khoản thất bại!');
      }
    } catch (e) {
      this.resetState();
      toast.error('Lỗi khi tải tài khoản!');
    }
  };
  handleServiceChange = (selectedOptions) => {
    const selectedServiceIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    this.setState({ selectedServices: selectedServiceIds });
  };
  handleEditAccount = async () => {
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận sửa chỉnh sửa thông tin người dùng?</p>
            <button
              className="toast-confirm-btn"
              onClick={() => {
                resolve(true);
                toast.dismiss();
              }}
            >
              Có
            </button>
            <button
              className="toast-cancel-btn"
              onClick={() => {
                resolve(false);
                toast.dismiss();
              }}
            >
              Không
            </button>
          </div>
        );
      });
    const isConfirmed = await confirmAction();
    if (isConfirmed) {
      const { selectedAccountID, accountname, email, password, username, phone, address, gender, accounttype, confirmPassword, bio, specialization, workingstatus, selectedServices } = this.state;
      if (password !== confirmPassword) {
        toast.error('Mật khẩu không trùng khớp!');
        this.setState({ isLoading: false });
        return;
      }
      const userInfo = {
        accountid: selectedAccountID,
        accountname,
        email,
        password,
        username,
        phone,
        address,
        gender,
        accounttype,
      };
      const isValidateAccountInput = await validateAccountInput(userInfo, "EDIT");
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
      this.props.handleEditAccountFromModal(userInfo);
    }
  };
  render() {
    const { isOpen } = this.props;
    const { loadedAccountInfo, email, accounttype, username, phone, accountname, gender, address, bio, specialization, workingstatus,
      codeGender, codeAccountType, codeWorkingStatus, loadedServiceInfo, selectedServices } = this.state;
    if (!loadedAccountInfo) {
      return (
        <Modal show={isOpen} onHide={this.toggle} className="edit-user-modal" centered backdrop="static">
          <Modal.Body>Đang tải thông tin tài khoản.</Modal.Body>
        </Modal>
      );
    }
    return (
      <Modal show={this.props.isOpen} onHide={this.toggle} className="edit-user-modal" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="R1">
            <div className="inputbox">
              <IonIcon icon={mailOutline}></IonIcon>
              <input type="email" placeholder="" value={email} disabled />
              <label>Email</label>
            </div>
            <div className="selectbox">
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
              <IonIcon icon={peopleCircleOutline}></IonIcon>
            </div>
          </div>
          {accounttype === 'V' && (
            <div className="R2 veterinarian-info">
              <div className="f">
                <div className="inputbox-2">
                  <IonIcon icon={idCardOutline}></IonIcon>
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
                  <IonIcon icon={invertModeOutline}></IonIcon>
                </div>
              </div>
              <div className="inputbox-1">
                <IonIcon icon={informationCircleOutline}></IonIcon>
                <textarea placeholder="" value={bio} onChange={(event) => this.handleOnChangeInput(event, 'bio')} className={bio ? 'filled' : ''} />
                <label>Tiểu sử</label>
              </div>
              <div className="selectbox-service">
                <label>Dịch vụ thực hiện</label>
                <Select
                  isMulti
                  options={loadedServiceInfo.map((service) => ({
                    value: service.ServiceID,
                    label: service.ServiceName,
                  }))}
                  value={loadedServiceInfo
                    .filter((service) => selectedServices.includes(service.ServiceID))
                    .map((service) => ({
                      value: service.ServiceID,
                      label: service.ServiceName,
                    }))}
                  onChange={this.handleServiceChange}
                  placeholder="Chọn dịch vụ..."
                  className="service-select"
                  classNamePrefix="select"
                />
                <IonIcon icon={invertModeOutline}></IonIcon>
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
          </div>
          <div className="R2">
            <div className="inputbox-address">
              <IonIcon icon={location}></IonIcon>
              <input type="text" placeholder="" value={address} onChange={(event) => this.handleOnChangeInput(event, 'address')} />
              <label>Địa chỉ</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleEditAccount}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditAccountModal;