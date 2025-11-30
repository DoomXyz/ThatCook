import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import Select from 'react-select';

import { mailOutline, person, call, keyOutline, location, maleFemaleOutline, lockClosedOutline, informationCircleOutline, briefcaseOutline, pulseOutline, cubeOutline } from 'ionicons/icons';

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
      AccountName: '',
      Email: '',
      UserName: '',
      Phone: '',
      Address: '',
      Gender: '',
      AccountType: '',
      Bio: '',
      Specialization: '',
      WorkingStatus: '',
      codeGender: [],
      codeAccountType: [],
      codeWorkingStatus: [],
      loadedServiceInfo: [],
      selectedServices: [],
      disabledButtons: {
        confirmEdit: false,
      },
    };
  }
  async componentDidMount() {
    await this.handleLoadCode(['Gender', 'AccountType', 'WorkingStatus']);
    await this.handleGetServiceInfo();
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
    const { codeGender, codeAccountType, codeWorkingStatus } = this.state
    this.setState({
      AccountName: '',
      Email: '',
      UserName: '',
      Phone: '',
      Address: '',
      Gender: codeGender.length > 0 ? codeGender[0].Code : '',
      AccountType: codeAccountType.length > 0 ? codeAccountType[0].Code : '',
      Bio: '',
      Specialization: '',
      WorkingStatus: codeWorkingStatus.length > 0 ? codeWorkingStatus[0].Code : '',
      selectedServices: [],
    });
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
  loadAccountInfo = async (AccountID) => {
    try {
      const [accountResponse, vetResponse] = await Promise.all([
        handleGetAccountInfoApi(AccountID),
        handleGetVeterinarianInfoApi(AccountID)
      ]);
      if (accountResponse && accountResponse.errCode === 0) {
        const accountInfo = accountResponse.data;
        const { AccountID, AccountType, AccountName, Email, UserName, Phone, Address, Gender } = accountInfo
        const vetInfo = vetResponse && vetResponse.errCode === 0 ? vetResponse.data : null;
        this.setState({
          loadedAccountInfo: accountInfo,
          selectedAccountID: AccountID,
          AccountType,
          AccountName,
          Email,
          UserName,
          Phone,
          Address,
          Gender,
          Bio: vetInfo ? vetInfo.Bio || '' : '',
          Specialization: vetInfo ? vetInfo.Specialization || '' : '',
          WorkingStatus: vetInfo ? vetInfo.WorkingStatus || '' : '',
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
    this.setState({ disabledButtons: { ...this.state.disabledButtons, confirmEdit: true } })
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
          </div>,
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, confirmEdit: false } }) },
          }
        );
      });
    const isConfirmed = await confirmAction();
    if (isConfirmed) {
      const { selectedAccountID, AccountName, Email, Password, UserName, Phone, Address, Gender, AccountType, confirmPassword, Bio, Specialization, WorkingStatus, selectedServices } = this.state;
      if (Password !== confirmPassword) {
        toast.error('Mật khẩu không trùng khớp!');
        this.setState({ isLoading: false });
        return;
      }
      const userInfo = {
        AccountID: selectedAccountID,
        AccountName,
        Email,
        Password,
        UserName,
        Phone,
        Address,
        Gender,
        AccountType,
      };
      const isValidateAccountInput = await validateAccountInput(userInfo, "EDIT");
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
      this.props.handleEditAccountFromModal(userInfo);
    }
  };
  render() {
    const { isOpen } = this.props;
    const { loadedAccountInfo, Email, AccountType, UserName, Phone, AccountName, Gender, Address, Bio, Specialization, WorkingStatus,
      codeGender, codeAccountType, codeWorkingStatus, loadedServiceInfo, selectedServices, disabledButtons } = this.state;
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
              <input type="email" placeholder="" value={Email} disabled />
              <label>Email</label>
            </div>
            <div className="selectbox">
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
          </div>
          <div className="R2">
            <div className="inputbox-address">
              <IonIcon icon={location}></IonIcon>
              <input type="text" placeholder="" value={Address} onChange={(event) => this.handleOnChangeInput(event, 'Address')} />
              <label>Địa chỉ</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleEditAccount} disabled={disabledButtons.confirmEdit}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditAccountModal;