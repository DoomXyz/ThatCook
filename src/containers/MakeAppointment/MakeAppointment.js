import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import DatePicker from 'react-datepicker';
import Chat from '../../components/Chat';
import { closeOutline } from 'ionicons/icons';

import './MakeAppointment.scss'; //import scss
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';
import PetSelectModal from './PetSelectModal';
import VeterinarianSelectModal from './VeterinarianSelectModal';

import { handleGetAccountInfoApi, handleLogoutApi, handleGetVeterinarianInfoApi, handleGetVeterinarianServicesApi } from '../../services/accountServices';
import { handleCreateAppointmentApi, handleGetAvailableTimesApi, handleLoadAppointmentDetailsApi } from '../../services/appointmentServices';
import { handleGetServiceInfoApi } from '../../services/serviceServices';

import { handleGetAccountPetInfoApi, handleGetPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi } from '../../services/petServices';

import { checkLoginStatus, getAllCodes, uploadImages, validatePetInput, validateAppointmentInput } from '../../utils/pakage';
import { clearFuAppointmentInfo, saveTrackInfo, userLogin, userLogout, clearPreselectInfo, addNotification, clearNotification } from '../../store/actions';

const defUserImage = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg';

class MakeAppointment extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      accountInfo: null,
      Type: 'FIRST',
      PrevAppointmentID: null,
      fuaAccountID: '',
      guestID: '',
      loadedPetList: [],
      CustomerName: '',
      CustomerPhone: '',
      CustomerEmail: '',
      PetName: '',
      PetType: '',
      Age: '',
      PetGender: '',
      PetWeight: '',
      appointmentDateTime: null,
      selectedVeterinarianInfo: '',
      selectedServiceID: '',
      selectedPetID: '',
      StartTime: '',
      Notes: '',
      codePetType: [],
      codePetGender: [],
      loadedServiceInfo: [],
      loadedWorkingTime: [],
      imageInfo: [],
      availableTimes: [],
      allImages: [],
      isUploading: false,
      isShowPetSelectModal: false,
      isShowVeterinarianSelectModal: false,
      createdAppointmentID: '',
      originalServiceList: [],
    };
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadCode(['PetGender', 'PetType']);
    await this.handleGetServiceInfo();
    setTimeout(() => {
      this.handleMountAppointmentType();
    }, 100);
  }
  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
    }
  }
  componentWillUnmount() {
    this.state.allImages.forEach((img) => {
      if (img.Image && img.file) URL.revokeObjectURL(img.Image);
    });
  }
  handleIsLogin = async () => {
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        await this.handleLoadAccountInfo(accountInfo.AccountID);
        this.setState({
          isLoggedIn: true,
          guestID: '',
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.props.addNotification('Hãy đăng nhập hoặc đăng ký để sử dụng dịch vụ!');
        setTimeout(() => {
          this.props.navigate('/login');
        }, 100);
      }
    } catch (e) {
      this.props.navigate('/home');
    }
    this.setState({
      isLoading: false,
    });
  };
  handleMountAppointmentType = async () => {
    if (!this.props.fuAppointmentInfo && this.state.accountInfo?.AccountType === 'V') {
      this.props.navigate('/user/veterinarian');
    } else if (this.props.fuAppointmentInfo) {
      this.setState(
        {
          Type: 'FOLLOW_UP',
          PrevAppointmentID: this.props.fuAppointmentInfo.AppointmentID,
        },
        async () => {
          await this.handleLoadFollowUpAppointmentInfo();
        }
      );
    } else {
      this.setState({ Type: 'FIRST' }, async () => {
        this.handleLoadAppointmentInfo();
        if (this.props.appointmentPreselect) {
          if (this.props.appointmentPreselect.Type === 'Veterinarian') {
            const vetID = this.props.appointmentPreselect.selectedID;
            try {
              const vetResponse = await handleGetVeterinarianInfoApi(vetID);
              if (vetResponse.errCode === 0 && vetResponse.data) {
                this.setState(
                  {
                    selectedVeterinarianInfo: {
                      AccountID: vetID,
                      UserName: vetResponse.data.UserName,
                      UserImage: vetResponse.data.UserImage || defUserImage,
                      Specialization: vetResponse.data.Specialization,
                    },
                  },
                  async () => {
                    try {
                      const serviceResponse = await handleGetVeterinarianServicesApi(vetID);
                      if (serviceResponse.errCode === 0 && serviceResponse.data && serviceResponse.data.length > 0) {
                        this.setState({
                          loadedServiceInfo: serviceResponse.data,
                          selectedServiceID: serviceResponse.data[0]?.ServiceID || '',
                        });
                      } else {
                        toast.error('Bác sĩ này không có dịch vụ nào!');
                        this.setState({
                          loadedServiceInfo: [],
                          selectedServiceID: '',
                        });
                      }
                    } catch (e) {
                      toast.error('Lỗi khi tải dịch vụ của bác sĩ!');
                    }
                  }
                );
              } else {
                toast.error('Không thể tải thông tin bác sĩ!');
              }
            } catch (e) {
              toast.error('Lỗi khi tải thông tin bác sĩ!');
            }
          } else if (this.props.appointmentPreselect.Type === 'Service') {
            this.setState({
              selectedServiceID: this.props.appointmentPreselect.selectedID,
            });
          }
          this.props.clearPreselectInfo();
        }
      });
    }
    this.setState({ isLoading: false });
  };
  handleLoadAccountInfo = async (AccountID) => {
    try {
      const response = await handleGetAccountInfoApi(AccountID);
      if (response || response.errCode === 0) {
        this.setState({
          accountInfo: response.data,
        });
      } else {
        toast.error('Không thể tải thông tin người dùng!');
      }
    } catch (e) {
      toast.error('Lỗi khi tải người dùng!');
    }
  };
  handleLoadCode = async (codeTypeFilter) => {
    try {
      const responses = await Promise.all(codeTypeFilter.map((type) => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypeFilter.forEach((type, index) => {
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
      const response = responseApi.data;
      if (response.errCode !== 0 || !response.data || response.data.length === 0) {
        toast.error(response.errMessage || 'Không thể tải danh sách dịch vụ!');
        this.setState({
          loadedServiceInfo: [],
          originalServiceList: [],
          selectedServiceID: '',
        });
        return;
      }
      this.setState({
        loadedServiceInfo: response.data,
        originalServiceList: response.data,
        selectedServiceID: response.data.length > 0 ? response.data[0].ServiceID : '',
      });
    } catch (e) {
      toast.error('Lỗi khi tải danh sách dịch vụ!');
    }
  };
  handleLoadAppointmentInfo = async () => {
    const { isLoggedIn, accountInfo } = this.state;
    if (isLoggedIn) {
      try {
        const response = await handleGetAccountPetInfoApi(accountInfo.AccountID);
        if (response && response.errCode === 0) {
          this.setState({
            loadedPetList: response.data,
          });
        }
      } catch (e) {
        toast.error('Lỗi khi tải danh sách thú cưng của người dùng!');
      }
      this.setState({
        CustomerName: accountInfo.UserName,
        CustomerPhone: accountInfo.Phone,
        CustomerEmail: accountInfo.Email,
      });
    }
  };
  handleLoadFollowUpAppointmentInfo = async () => {
    const { PrevAppointmentID } = this.state;
    try {
      const response = await handleLoadAppointmentDetailsApi(PrevAppointmentID);
      if (response && response.errCode === 0) {
        const data = response.data;
        this.setState({
          selectedPetID: data.Pet.PetID,
          PetName: data.Pet.PetName,
          PetType: data.Pet.PetType,
          PetGender: data.Pet.PetGender,
          Age: data.Pet.Age.toString(),
          PetWeight: data.Pet.PetWeight.toString(),
          selectedVeterinarianInfo: data.Veterinarian
            ? {
              AccountID: data.VeterinarianID,
              UserName: data.Veterinarian.UserName,
              Specialization: data.Veterinarian.Specialization,
              UserImage: data.Veterinarian.UserImage,
            }
            : {},
          fuaAccountID: data.AccountID,
          CustomerName: data.CustomerName,
          CustomerPhone: data.CustomerPhone,
          CustomerEmail: data.CustomerEmail,
        });
      } else {
        toast.error(response?.errMessage || 'Không thể tải thông tin lịch hẹn trước!');
        this.setState({ Type: 'FIRST', PrevAppointmentID: null });
        this.props.clearFuAppointmentInfo();
      }
    } catch (e) {
      console.log('Error loading follow-up appointment info:', e);
      toast.error('Lỗi khi tải thông tin lịch hẹn trước!');
      this.setState({ Type: 'FIRST', PrevAppointmentID: null });
      this.props.clearFuAppointmentInfo();
    }
  };
  handleCancelFollowUp = async () => {
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận hủy tái khám?</p>
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
      this.props.clearFuAppointmentInfo();
      this.props.navigate('/user/veterinarian');
    }
  };
  handleSavePetInfo = async () => {
    const { loadedPetList, isLoggedIn, accountInfo, guestID, PetName, PetType, PetGender, Age, PetWeight } = this.state;
    const newPetInfo = {
      PetName,
      PetType,
      PetGender,
      PetWeight: PetWeight ? parseFloat(PetWeight) : 0,
      Age: Age ? parseInt(Age) : 0,
    };
    const isValidatePetInput = await validatePetInput(newPetInfo);
    if (!isValidatePetInput.valid) {
      toast.error(isValidatePetInput.errMessage);
      this.setState({ isLoading: false });
      return;
    }
    try {
      let AccountID = isLoggedIn ? accountInfo.AccountID : guestID || null;
      if (isLoggedIn && loadedPetList.length > 0) {
        const isValidPetInfo = loadedPetList.find((item) => item.PetName === newPetInfo.PetName && item.PetType === newPetInfo.PetType && item.PetGender === newPetInfo.PetGender && item.Age === newPetInfo.Age && parseFloat(item.PetWeight) === newPetInfo.PetWeight);
        if (isValidPetInfo) {
          toast.info('Đã chọn thú cưng trong danh sách!');
          this.setState({ selectedPetID: isValidPetInfo.PetID });
          return;
        }
      }
      if (!isLoggedIn && guestID) {
        const response = await handleGetAccountPetInfoApi(guestID);
        if (response && response.errCode === 0) {
          const guestPetInfo = Array.isArray(response.data) ? response.data : [response.data];
          const existingPet = guestPetInfo[0];
          if (existingPet) {
            const updatePetInfo = await handleChangePetInfoApi(existingPet.PetID, newPetInfo);
            if (updatePetInfo && updatePetInfo.errCode === 0) {
              toast.success('Cập nhật thông tin thú cưng thành công!');
              this.setState({ selectedPetID: existingPet.PetID });
            } else {
              toast.error(updatePetInfo.errMessage || 'Cập nhật thông tin thú cưng thất bại!');
            }
            return;
          }
        }
      }
      const response = await handleSavePetInfoApi(AccountID, newPetInfo);
      if (response && response.errCode === 0) {
        toast.success('Lưu thông tin thú cưng thành công!');
        this.setState({
          selectedPetID: response.data.PetID,
          guestID: response.data.guestID || guestID,
        });
        if (isLoggedIn) {
          const petResponse = await handleGetAccountPetInfoApi(accountInfo.AccountID);
          if (petResponse && petResponse.errCode === 0) {
            this.setState({
              loadedPetList: petResponse.data,
            });
          }
        }
      } else {
        toast.error(response.errMessage || 'Lưu thông tin thú cưng thất bại!');
      }
    } catch (e) {
      console.log(e);
      toast.error('Lỗi khi lưu thông tin thú cưng!');
    }
  };
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({ ...copyState }, async () => {
      if (type === 'selectedServiceID') {
        const { appointmentDateTime, selectedServiceID } = this.state;
        if (appointmentDateTime && selectedServiceID) {
          await this.handleLoadAvailableTimes();
        } else {
          this.setState({ availableTimes: [], StartTime: '' });
        }
      }
    });
  };
  handleOnChangeDateInput = (date) => {
    const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000) : null;
    this.setState({ appointmentDateTime: formattedDate }, () => {
      const { appointmentDateTime, selectedServiceID } = this.state;
      if (appointmentDateTime && selectedServiceID) {
        this.handleLoadAvailableTimes();
      } else {
        this.setState({ availableTimes: [], StartTime: '' });
      }
    });
  };
  handleLoadAvailableTimes = async () => {
    try {
      const { appointmentDateTime, selectedVeterinarianInfo, selectedServiceID } = this.state;
      if (!appointmentDateTime || !selectedServiceID) {
        this.setState({ availableTimes: [], StartTime: '' });
        return;
      }
      const formattedDate = appointmentDateTime.toISOString().split('T')[0];
      const vetID = selectedVeterinarianInfo !== null ? selectedVeterinarianInfo.AccountID : 'ALL';
      const response = await handleGetAvailableTimesApi(formattedDate, vetID, selectedServiceID);
      if (response.errCode === 0) {
        this.setState({ availableTimes: response.data, StartTime: response.data[0] || '' });
      } else {
        toast.error(response.errMessage);
        this.setState({ availableTimes: [], StartTime: '' });
      }
    } catch (e) {
      console.log(e);
      toast.error('Lỗi khi tải khung giờ!');
      this.setState({ availableTimes: [], StartTime: '' });
    }
  };
  handleSubmitAppointment = async () => {
    try {
      this.setState({ isLoading: true });
      const { CustomerName, CustomerPhone, CustomerEmail, appointmentDateTime, selectedVeterinarianInfo, fuaAccountID, selectedServiceID, StartTime, Notes, Type, PrevAppointmentID, selectedPetID, allImages, isUploading, guestID, accountInfo, isLoggedIn } = this.state;
      const appointmentInfo = {
        CustomerName,
        CustomerEmail,
        CustomerPhone,
        AppointmentDate: appointmentDateTime,
        StartTime,
        Notes,
        ServiceID: selectedServiceID,
        PetID: selectedPetID,
      };
      const isValidateInput = await validateAppointmentInput(appointmentInfo);
      if (!isValidateInput.valid) {
        toast.error(isValidateInput.errMessage);
        this.setState({ isLoading: false });
        return;
      }
      if (isUploading) {
        toast.info('Đang tải ảnh, vui lòng chờ!');
        this.setState({ isLoading: false });
        return;
      }
      let uploadedImages = [];
      if (allImages.length > 0) {
        if (allImages.length > 3) {
          toast.error('Tối đa 3 hình ảnh!');
          this.setState({ isLoading: false });
          return;
        }
        this.setState({ isUploading: true });
        const uploadResult = await uploadImages(allImages);
        if (!uploadResult.status) {
          toast.error(uploadResult.error);
          this.setState({ isLoading: false, isUploading: false });
          return;
        }
        uploadedImages = uploadResult.images;
      }
      const AppointmentDate = appointmentDateTime ? appointmentDateTime.toISOString().split('T')[0] : '';
      const response = await handleCreateAppointmentApi({
        CustomerName,
        CustomerEmail,
        CustomerPhone,
        AppointmentDate,
        StartTime,
        Notes,
        AccountID: isLoggedIn && Type === 'FIRST' ? accountInfo.AccountID : Type !== 'FIRST' ? fuaAccountID : guestID,
        VeterinarianID: selectedVeterinarianInfo.AccountID || null,
        ServiceID: selectedServiceID,
        PetID: selectedPetID,
        imageInfo: uploadedImages,
        Type,
        PrevAppointmentID,
      });
      console.log(response)
      if (response && response.errCode === 0) {
        this.setState({
          createdAppointmentID: response.data.AppointmentID,
        });
        toast.success('Đặt lịch thành công!');
        this.props.clearFuAppointmentInfo();
        this.props.saveTrackInfo({ BillID: response.data.AppointmentID, BillType: 2 });
        this.props.navigate('/track');
      } else {
        toast.error(response.errMessage);
      }
    } catch (e) {
      console.log('Error in handleSubmitAppointment:', e);
      toast.error(`Lỗi khi đặt lịch khám: ${e.message}`);
    } finally {
      this.setState({ isLoading: false, isUploading: false });
    }
  };
  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (this.state.allImages.length >= 3) {
      toast.error('Tối đa 3 hình ảnh!');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }
    const preview = URL.createObjectURL(file);
    this.setState((prevState) => ({
      allImages: [...prevState.allImages, { ImageID: Date.now(), Image: preview, file }],
    }));
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = null;
    }
  };
  handleRemoveImage = (ImageID) => {
    this.setState((prevState) => ({
      allImages: prevState.allImages.filter((img) => img.ImageID !== ImageID),
    }));
  };
  handleUnSelectVeterinarian = async () => {
    this.setState({
      selectedVeterinarianInfo: null,
    }, async () => {
      await this.handleLoadAvailableTimes();
    });
  };
  togglePetSelectModal = () => {
    this.setState({ isShowPetSelectModal: !this.state.isShowPetSelectModal });
  };
  toggleVeterinarianSelectModal = () => {
    this.setState({ isShowVeterinarianSelectModal: !this.state.isShowVeterinarianSelectModal });
  };
  handlePetListChange = async () => {
    try {
      const { accountInfo, selectedPetID } = this.state;
      const response = await handleGetAccountPetInfoApi(accountInfo.AccountID);
      if (response && response.errCode === 0) {
        const newPetList = response.data;
        const selectedPet = newPetList.find((pet) => pet.PetID === selectedPetID);
        this.setState({
          loadedPetList: newPetList,
          ...(selectedPet
            ? {
              PetName: selectedPet.PetName,
              PetType: selectedPet.PetType,
              PetGender: selectedPet.PetGender,
              Age: selectedPet.Age.toString(),
              PetWeight: selectedPet.PetWeight.toString(),
            }
            : {
              PetName: '',
              PetType: this.state.codePetType[0].Code || '',
              PetGender: this.state.codePetGender[0].Code || '',
              Age: '',
              PetWeight: '',
            }),
        });
      } else {
        toast.error('Không thể tải danh sách thú cưng!');
      }
    } catch (e) {
      toast.error('Lỗi khi tải danh sách thú cưng của người dùng!');
    }
  };
  handleSelectPetFromModal = async (PetID) => {
    try {
      const { accountInfo } = this.state
      const response = await handleGetPetInfoApi(accountInfo.AccountID, PetID);
      if (response && response.errCode === 0) {
        this.setState({
          selectedPetID: PetID,
          PetName: response.data.PetName,
          PetType: response.data.PetType,
          PetGender: response.data.PetGender,
          Age: response.data.Age.toString(),
          PetWeight: response.data.PetWeight.toString(),
        });
      } else {
        toast.error(response.errMessage || 'Không thể tải thông tin thú cưng!');
      }
    } catch (e) {
      toast.error('Lỗi khi tải thông tin thú cưng!');
    }
  };
  handleSelectVeterinarianFromModal = async (veterinarianInfo) => {
    this.setState({ selectedVeterinarianInfo: veterinarianInfo }, async () => {
      if (veterinarianInfo.AccountID) {
        try {
          const response = await handleGetVeterinarianServicesApi(veterinarianInfo.AccountID);
          if (response.errCode === 0 && response.data && response.data.length > 0) {
            this.setState({
              loadedServiceInfo: response.data,
              selectedServiceID: response.data[0]?.ServiceID || '',
            });
          } else {
            toast.error('Bác sĩ này không có dịch vụ nào!');
            this.setState({
              loadedServiceInfo: [],
              selectedServiceID: '',
            });
          }
        } catch (e) {
          toast.error('Lỗi khi tải dịch vụ của bác sĩ!');
          this.setState({
            loadedServiceInfo: [],
            selectedServiceID: '',
          });
        }
      } else {
        // Khi không chọn bác sĩ, khôi phục danh sách dịch vụ gốc
        this.setState({
          loadedServiceInfo: this.state.originalServiceList,
          selectedServiceID: this.state.originalServiceList[0]?.ServiceID || '',
        });
      }
      // Load lại khung giờ
      const { appointmentDateTime, selectedServiceID } = this.state;
      if (appointmentDateTime && selectedServiceID) {
        await this.handleLoadAvailableTimes();
      } else {
        this.setState({ availableTimes: [], StartTime: '' });
      }
    });
  };
  render() {
    const { isLoading, isLoggedIn, accountInfo, codePetType, codePetGender, PetGender, PetType, CustomerName, CustomerPhone, CustomerEmail, PetName, Age, PetWeight, appointmentDateTime, selectedServiceID, loadedServiceInfo, StartTime, availableTimes, Notes, allImages, selectedPetID, isShowPetSelectModal, isShowVeterinarianSelectModal, selectedVeterinarianInfo, loadedPetList, Type } = this.state;
    return (
      <div className="makeappointment-body">
        <ToastContainer autoClose={500} newestOnTop={true} closeOnClick={false} pauseOnFocusLoss={false} draggable={true} transition={Slide} limit={1} />
        <PetSelectModal isOpen={isShowPetSelectModal} toggleFromModal={this.togglePetSelectModal} AccountID={isLoggedIn ? accountInfo.AccountID : null} handleSelectPetFromModal={this.handleSelectPetFromModal} onPetListChange={this.handlePetListChange} />
        <VeterinarianSelectModal isOpen={isShowVeterinarianSelectModal} toggleFromModal={this.toggleVeterinarianSelectModal} handleSelectVeterinarianFromModal={this.handleSelectVeterinarianFromModal} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} />
            <div className="makeappointment-content">
              <h1>{Type === 'FOLLOW_UP' ? 'Đặt lịch tái khám' : 'Thông tin đặt lịch'}</h1>
              <div className="makeappointment-content-user-info">
                <b>*Thông tin Khách hàng</b>
                <input type="text" placeholder="Hãy nhập tên khách hàng" value={CustomerName} onChange={(event) => this.handleOnChangeInput(event, 'CustomerName')} />
                <input type="text" placeholder="Hãy nhập số điện thoại" value={CustomerPhone} onChange={(event) => this.handleOnChangeInput(event, 'CustomerPhone')} />
                <input type="text" placeholder="Hãy nhập email" value={CustomerEmail} onChange={(event) => this.handleOnChangeInput(event, 'CustomerEmail')} />
              </div>
              {isLoggedIn && loadedPetList.length > 0 && Type !== 'FOLLOW_UP' && (
                <div className="makeappointment-content-pet">
                  <button onClick={this.togglePetSelectModal}>Chọn thú cưng</button>
                </div>
              )}
              {selectedPetID !== '' || Type === 'FOLLOW_UP' ? (
                <div className="makeappointment-content-pet-info">
                  <b>*Thông tin Thú cưng</b>
                  <p>Tên thú cưng:</p>
                  <br />
                  <input type="text" placeholder="Hãy nhập Tên thú cưng" value={PetName} onChange={(event) => this.handleOnChangeInput(event, 'PetName')} disabled={(isLoggedIn && loadedPetList.length > 0) || Type === 'FOLLOW_UP'} />
                  <div className="f">
                    <p>Loại: </p>
                    <select value={PetType} onChange={(event) => this.handleOnChangeInput(event, 'PetType')} disabled={(isLoggedIn && loadedPetList.length > 0) || Type === 'FOLLOW_UP'}>
                      {codePetType.length > 0 ? (
                        codePetType.map((item) => (
                          <option key={item.Code} value={item.Code}>
                            {item.CodeValueVI}
                          </option>
                        ))
                      ) : (
                        <option value="">Không có dữ liệu loại thú cưng</option>
                      )}
                    </select>
                    <p>Giới tính:</p>
                    <select value={PetGender} onChange={(event) => this.handleOnChangeInput(event, 'PetGender')} disabled={(isLoggedIn && loadedPetList.length > 0) || Type === 'FOLLOW_UP'}>
                      {codePetGender.length > 0 ? (
                        codePetGender.map((item) => (
                          <option key={item.Code} value={item.Code}>
                            {item.CodeValueVI}
                          </option>
                        ))
                      ) : (
                        <option value="">Không có dữ liệu giới tính</option>
                      )}
                    </select>
                  </div>
                  <div className="old-weight f">
                    <div>
                      <p>Tháng tuổi:</p>
                      <br />
                      <input type="text" placeholder="Hãy nhập Tuổi" value={Age} onChange={(event) => this.handleOnChangeInput(event, 'Age')} disabled={(isLoggedIn && loadedPetList.length > 0) || Type === 'FOLLOW_UP'}></input>
                    </div>
                    <div>
                      <p>Cân nặng (kg):</p>
                      <br />
                      <input type="text" placeholder="Hãy nhập Cân nặng" value={PetWeight} onChange={(event) => this.handleOnChangeInput(event, 'PetWeight')} disabled={(isLoggedIn && loadedPetList.length > 0) || Type === 'FOLLOW_UP'} />
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ marginLeft: '5rem' }}>
                  <u>Chưa có thú cưng được chọn</u>
                </p>
              )}
              {isLoggedIn && loadedPetList.length === 0 ?
                (
                  <p style={{ marginLeft: '5rem' }}>
                    <u>Hãy đăng ký thú cưng của bạn<button onClick={() => this.props.navigate('/user/customer')}>Tại đây</button></u>
                  </p>
                ) :
                (<p></p>)
              }
              {/* {(!isLoggedIn || (isLoggedIn && loadedPetList.length === 0)) && Type !== 'FOLLOW_UP' && (
                <div className="makeappointment-save-petinfo-button">
                  <button onClick={this.handleSavePetInfo}>Lưu</button>
                  <div className="stra"></div>
                </div>
              )} */}
              <b className="doctor-info">*Thông tin đặt lịch</b>
              <div className="makeappointment-content-doctor">
                <div className="f">
                  {Type !== 'FOLLOW_UP' && <button onClick={this.toggleVeterinarianSelectModal}>Chọn bác sĩ</button>}
                  <div className="doctor-info-display">
                    {selectedVeterinarianInfo && selectedVeterinarianInfo.AccountID ? (
                      <div className="doctor-details f">
                        <div className="doctor-image">
                          <img src={selectedVeterinarianInfo.UserImage || defUserImage} alt="Ảnh bác sĩ" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                        </div>
                        <div className="doctor-text">
                          <p>
                            <b>Tên bác sĩ:</b> {selectedVeterinarianInfo.UserName}
                          </p>
                          <p>
                            <b>Chuyên khoa:</b> {selectedVeterinarianInfo.Specialization}
                          </p>
                        </div>
                        {Type !== 'FOLLOW_UP' && (
                          <button className="cancel-doctor-btn" onClick={this.handleUnSelectVeterinarian}>
                            X
                          </button>
                        )}
                      </div>
                    ) : (
                      <p>Chưa chọn bác sĩ</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="f">
                <div className="makeappointment-content-date">
                  <p>
                    <b>*Ngày khám:</b>
                  </p>
                  <div>
                    <DatePicker selected={appointmentDateTime ? new Date(appointmentDateTime.getTime() - appointmentDateTime.getTimezoneOffset() * 60000) : null} onChange={this.handleOnChangeDateInput} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" className="date-picker" />
                  </div>
                </div>

                <div className="makeappointment-content-service">
                  <p>
                    <b>*Dịch vụ</b>
                  </p>
                  <select value={selectedServiceID} onChange={(event) => this.handleOnChangeInput(event, 'selectedServiceID')}>
                    {loadedServiceInfo.length > 0 ? (
                      loadedServiceInfo.map((item) => (
                        <option key={item.ServiceID} value={item.ServiceID}>
                          {item.ServiceName}
                        </option>
                      ))
                    ) : (
                      <option value="">Không có dữ liệu dịch vụ</option>
                    )}
                  </select>
                </div>
                <div className="makeappointment-content-time">
                  <p>
                    <b>*Khung giờ</b>
                  </p>
                  <select value={StartTime} onChange={(event) => this.handleOnChangeInput(event, 'StartTime')}>
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))
                    ) : (
                      <option value="">Chưa có giờ</option>
                    )}
                  </select>
                </div>
              </div>
              <textarea placeholder="Mô tả tình trạng thú cưng (nếu có)" value={Notes} onChange={(event) => this.handleOnChangeInput(event, 'Notes')} />
              <div className="makeappointment-content-petimgs">
                <p>
                  <b>*Thêm hình ảnh (tối đa 3 ảnh):</b>
                </p>
                <div className="makeappointment-content-petimgs-block f">
                  {allImages.map((img, index) => (
                    <div key={img.ImageID} className="makeappointment-content-petimgs-item ">
                      <img src={img.Image} alt={`Hình ảnh ${index + 1}`} />
                      <button className="delete-img" onClick={() => this.handleRemoveImage(img.ImageID)}>
                        <IonIcon icon={closeOutline}></IonIcon>
                      </button>
                    </div>
                  ))}
                  {allImages.length < 3 && (
                    <div className="add-img">
                      <input type="file" accept="image/*" onChange={this.handleAddImage} style={{ display: 'none' }} id="upload-image" ref={this.fileInputRef} />
                      <label htmlFor="upload-image" className="add-img-label">
                        +
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="makeappointment-actions sb">
                {Type === 'FOLLOW_UP' && (
                  <button className="cancel-follow-up" onClick={this.handleCancelFollowUp}>
                    Hủy tái khám
                  </button>
                )}
                <div></div>
                <button className="makeapp" onClick={this.handleSubmitAppointment} disabled={isLoading}>
                  Gửi yêu cầu
                </button>
              </div>
            </div>
            <Chat />
            <Footer />
          </div>
        )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  fuAppointmentInfo: state.appointment.fuAppointmentInfo,
  appointmentPreselect: state.preselect.appointmentPreselect,
});
const mapDispatchToProps = (dispatch) => ({
  clearFuAppointmentInfo: () => dispatch(clearFuAppointmentInfo()),
  saveTrackInfo: (trackData) => dispatch(saveTrackInfo(trackData)),
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  clearPreselectInfo: () => dispatch(clearPreselectInfo()),
  addNotification: (message) => dispatch(addNotification(message)),
  clearNotification: () => dispatch(clearNotification()),
});
export default connect(mapStateToProps, mapDispatchToProps)(MakeAppointment);
