import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import DatePicker from 'react-datepicker';
import { ToastContainer, toast } from 'react-toastify';
import { closeOutline } from 'ionicons/icons';
import './MakeAppointment.scss'; //import scss
import Header from '../../components/HomeHeader';
import Spinner from '../../components/Spinner';
import Footer from '../../components/HomeFooter';
import { handleGetAccountInfoApi, handleLogoutApi, handleGetVeterinarianServicesApi } from '../../services/accountServices';
import { handleCreateAppointmentApi, handleGetAvailableTimesApi, handleGetServiceInfoApi } from '../../services/appointmentServices';
import { handleGetAccountPetInfoApi, handleGetPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi } from '../../services/petServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { checkLoginStatus, uploadImages } from '../../utils/pakage';

import PetSelectModal from './PetSelectModal';
import VeterinarianSelectModal from './VeterinarianSelectModal';

class MakeAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      accountInfo: null,
      guestID: '',
      loadedPetList: [],
      customername: '',
      customerphone: '',
      customeremail: '',
      petname: '',
      pettype: '',
      age: '',
      petgender: '',
      petweight: '',
      appointmentDateTime: null,
      selectedVeterinarianID: '',
      selectedServiceID: '',
      selectedPetID: '',
      starttime: '',
      notes: '',
      codePetType: [],
      codeService: [],
      codePetGender: [],
      loadedWorkingTime: [],
      imageInfo: [],
      isLoading: true,
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
    await this.handleLoadCodePetType();
    await this.handleLoadCodePetGender();
    await this.handleLoadCodeService();
    setTimeout(() => {
      this.handleLoadAppointmentInfo();
      this.setState({ isLoading: false });
    }, 10);
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
        this.setState({
          accountInfo: null,
          isLoggedIn: false,
          guestID: '',
        });
      }
    } catch (e) {
      console.log('Token not found!');
    }
    this.setState({
      isLoading: false,
    });
  };
  handleLoadAccountInfo = async (accountid) => {
    try {
      const response = await handleGetAccountInfoApi(accountid);
      if (response || response.errCode === 0) {
        this.setState({
          accountInfo: response.data,
        });
      } else {
        toast.error('Không thể tải thông tin người dùng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      toast.error('Lỗi khi tải người dùng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
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
        toast.error('Lỗi khi tải danh sách thú cưng của người dùng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        customername: accountInfo.UserName,
        customerphone: accountInfo.Phone,
        customeremail: accountInfo.Email,
      });
    }
  };
  handleLoadCodePetType = async () => {
    try {
      const codePetType = await handleGetAllCodesApi('PetType');
      if (!codePetType || codePetType.length === 0) {
        toast.error('Không thể tải danh sách loại thú cưng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePetType,
        pettype: codePetType.length > 0 ? codePetType[0].Code : '',
      });
    } catch (e) {
      toast.error('Không thể tải danh sách loại thú cưng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodePetGender = async () => {
    try {
      const codePetGender = await handleGetAllCodesApi('PetGender');
      if (!codePetGender || codePetGender.length === 0) {
        toast.error('Không thể tải danh sách giới tính!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePetGender,
        petgender: codePetGender.length > 0 ? codePetGender[0].Code : '',
      });
    } catch (e) {
      toast.error('Không thể tải danh sách giới tính!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodeService = async () => {
    try {
      const response = await handleGetServiceInfoApi('ALL');
      if (response.errCode !== 0 || !response.data || response.data.length === 0) {
        toast.error(response.errMessage || 'Không thể tải danh sách dịch vụ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({
          codeService: [],
          originalServiceList: [],
          selectedServiceID: '',
        });
        return;
      }
      this.setState({
        codeService: response.data,
        originalServiceList: response.data,
        selectedServiceID: response.data.length > 0 ? response.data[0].ServiceID : '',
      });
    } catch (e) {
      toast.error('Lỗi khi tải danh sách dịch vụ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleSavePetInfo = async () => {
    const { loadedPetList, isLoggedIn, accountInfo, guestID, petname, pettype, petgender, age, petweight } = this.state;
    const newPetInfo = {
      petname,
      pettype,
      petgender,
      age: age ? parseInt(age) : 0,
      petweight: petweight ? parseFloat(petweight) : 0,
    };
    if (!newPetInfo.petname || !newPetInfo.age || !newPetInfo.petweight) {
      toast.error('Thông tin thú cưng không được để trống!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    const petName = newPetInfo.petname.trim();
    const petNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!petNameRegex.test(petName)) {
      toast.error('Tên thú cưng không hợp lệ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    try {
      let accountid = isLoggedIn ? accountInfo.AccountID : guestID || null;
      if (isLoggedIn && loadedPetList.length > 0) {
        const isValidPetInfo = loadedPetList.find(
          (item) =>
            item.PetName === newPetInfo.petname &&
            item.PetType === newPetInfo.pettype &&
            item.PetGender === newPetInfo.petgender &&
            item.Age === newPetInfo.age &&
            parseFloat(item.PetWeight) === newPetInfo.petweight
        );
        if (isValidPetInfo) {
          toast.info('Đã chọn thú cưng trong danh sách!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
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
              toast.success('Cập nhật thông tin thú cưng thành công!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
              });
              this.setState({ selectedPetID: existingPet.PetID });
            } else {
              toast.error(updatePetInfo.errMessage || 'Cập nhật thông tin thú cưng thất bại!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
              });
            }
            return;
          }
        }
      }
      const response = await handleSavePetInfoApi(accountid, newPetInfo);
      if (response && response.errCode === 0) {
        toast.success('Lưu thông tin thú cưng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
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
        toast.error(response.errMessage || 'Lưu thông tin thú cưng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log(e);
      toast.error('Lỗi khi lưu thông tin thú cưng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
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
          this.setState({ availableTimes: [], starttime: '' });
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
        this.setState({ availableTimes: [], starttime: '' });
      }
    });
  };
  handleLoadAvailableTimes = async () => {
    try {
      const { appointmentDateTime, selectedVeterinarianID, selectedServiceID } = this.state;
      if (!appointmentDateTime || !selectedServiceID) {
        this.setState({ availableTimes: [], starttime: '' });
        return;
      }
      const formattedDate = appointmentDateTime.toISOString().split('T')[0];
      const vetID = selectedVeterinarianID || 'ALL';
      const response = await handleGetAvailableTimesApi(formattedDate, vetID, selectedServiceID);
      console.log(response);
      if (response.errCode === 0) {
        this.setState({ availableTimes: response.data, starttime: response.data[0] || '' });
      } else {
        toast.error(response.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({ availableTimes: [], starttime: '' });
      }
    } catch (e) {
      toast.error('Lỗi khi tải khung giờ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      this.setState({ availableTimes: [], starttime: '' });
    }
  };
  checkValidateInput = () => {
    const { customername, customeremail, customerphone, appointmentDateTime, starttime, notes, selectedServiceID, selectedPetID } = this.state;

    if (!customername || !customeremail || !customerphone || !appointmentDateTime || !starttime || !selectedServiceID || !selectedPetID) {
      return {
        errCode: -1,
        errMessage: 'Thiếu thông tin đặt lịch!',
      };
    }

    const customerNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!customerNameRegex.test(customername.trim())) return { errCode: 1, errMessage: 'Tên khách hàng sai định dạng (2-50 ký tự, chữ, số, khoảng trắng)!' };

    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customeremail.trim())) return { errCode: 1, errMessage: 'Email sai định dạng!' };

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerphone.trim())) return { errCode: 1, errMessage: 'Số điện thoại không hợp lệ!' };

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(starttime)) return { errCode: 1, errMessage: 'Giờ hẹn không hợp lệ (định dạng HH:mm)!' };
    const dateCheck = new Date(appointmentDateTime);
    if (isNaN(dateCheck.getTime())) return { errCode: 1, errMessage: 'Ngày hẹn không hợp lệ!' };
    const [hours, minutes] = starttime.split(':').map(Number);
    dateCheck.setHours(hours, minutes, 0, 0);
    const now = new Date();
    if (dateCheck <= now) return { errCode: 1, errMessage: 'Thời gian hẹn phải trong tương lai!' };

    if (notes) {
      const notesCheck = notes.trim();
      if (!notesCheck || notesCheck.length > 65535) { return { errCode: 1, errMessage: 'Mô tả tình trạng không hợp lệ hoặc vượt quá giới hạn ký tự!' }; }
    }

    return { errCode: 0, errMessage: 'Kiểm tra thông tin hoàn tất!' };
  };
  handleSubmitAppointment = async () => {
    try {
      this.setState({ isLoading: true });
      const { customername, customerphone, customeremail, appointmentDateTime, selectedVeterinarianID, selectedServiceID,
        starttime, notes, selectedPetID, allImages, isUploading, guestID, accountInfo, isLoggedIn } = this.state;
      const isValidateInput = this.checkValidateInput();
      if (isValidateInput.errCode !== 0) {
        toast.error(isValidateInput.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({ isLoading: false });
        return;
      }
      if (isUploading) {
        toast.info('Đang tải ảnh, vui lòng chờ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({ isLoading: false });
        return;
      }
      let uploadedImages = [];
      if (allImages.length > 0) {
        if (allImages.length > 3) {
          toast.error('Tối đa 3 hình ảnh!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          this.setState({ isLoading: false });
          return;
        }
        this.setState({ isUploading: true });
        const uploadResult = await uploadImages(allImages);
        if (!uploadResult.status) {
          toast.error(uploadResult.error, {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          this.setState({ isLoading: false, isUploading: false });
          return;
        }
        uploadedImages = uploadResult.images;
      }
      const appointmentdate = appointmentDateTime ? appointmentDateTime.toISOString().split('T')[0] : '';
      const response = await handleCreateAppointmentApi({
        customername,
        customeremail,
        customerphone,
        appointmentdate,
        starttime,
        notes,
        accountid: isLoggedIn ? accountInfo.AccountID : guestID,
        veterinarianid: selectedVeterinarianID || null,
        serviceid: selectedServiceID,
        petid: selectedPetID,
        imageInfo: uploadedImages,
        type: 'FIRST',
      });
      console.log("respone: ", response)
      if (response && response.errCode === 0) {
        this.setState({
          createdAppointmentID: response.data.AppointmentID
        })
        toast.success('Đặt lịch thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      } else {
        toast.error(response.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Error in handleSubmitAppointment:', e);
      toast.error(`Lỗi khi đặt lịch khám: ${e.message}`, {
        position: 'top-right',
        autoClose: 1000,
        closeOnClick: true,
      });
    } finally {
      this.setState({ isLoading: false, isUploading: false });
    }
  };
  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (this.state.allImages.length >= 3) {
      toast.error('Tối đa 3 hình ảnh!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    const preview = URL.createObjectURL(file);
    this.setState((prevState) => ({
      allImages: [...prevState.allImages, { ImageID: Date.now(), Image: preview, file }],
    }));
  };

  handleRemoveImage = (imageID) => {
    this.setState((prevState) => ({
      allImages: prevState.allImages.filter((img) => img.ImageID !== imageID),
    }));
  };

  togglePetSelectModal = () => {
    this.setState({ isShowPetSelectModal: !this.state.isShowPetSelectModal });
  };

  toggleVeterinarianSelectModal = () => {
    this.setState({ isShowVeterinarianSelectModal: !this.state.isShowVeterinarianSelectModal });
  };

  handleSelectPetFromModal = async (petID) => {
    try {
      const response = await handleGetPetInfoApi(petID);
      if (response && response.errCode === 0) {
        this.setState({
          selectedPetID: petID,
          petname: response.data.PetName,
          pettype: response.data.PetType,
          petgender: response.data.PetGender,
          age: response.data.Age.toString(),
          petweight: response.data.PetWeight.toString(),
        });
      } else {
        toast.error(response.errMessage || 'Không thể tải thông tin thú cưng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      toast.error('Lỗi khi tải thông tin thú cưng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleSelectVeterinarianFromModal = async (vetID) => {
    this.setState({ selectedVeterinarianID: vetID }, async () => {
      if (vetID) {
        try {
          const response = await handleGetVeterinarianServicesApi(vetID);
          if (response.errCode === 0 && response.data && response.data.length > 0) {
            this.setState({
              codeService: response.data,
              selectedServiceID: response.data[0]?.ServiceID || '',
            });
          } else {
            toast.error('Bác sĩ này không có dịch vụ nào!', {
              position: 'top-right',
              autoClose: 500,
              closeOnClick: true,
            });
            this.setState({
              codeService: [],
              selectedServiceID: '',
            });
          }
        } catch (e) {
          toast.error('Lỗi khi tải dịch vụ của bác sĩ!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          this.setState({
            codeService: [],
            selectedServiceID: '',
          });
        }
      } else {
        // Khi không chọn bác sĩ, khôi phục danh sách dịch vụ gốc
        this.setState({
          codeService: this.state.originalServiceList,
          selectedServiceID: this.state.originalServiceList[0]?.ServiceID || '',
        });
      }
      // Load lại khung giờ
      const { appointmentDateTime, selectedServiceID } = this.state;
      if (appointmentDateTime && selectedServiceID) {
        await this.handleLoadAvailableTimes();
      } else {
        this.setState({ availableTimes: [], starttime: '' });
      }
    });
  };
  render() {
    const { isLoading, isLoggedIn, accountInfo, codePetType, codePetGender, petgender, pettype, customername, customerphone, customeremail, petname, age, petweight, appointmentDateTime, selectedServiceID, codeService, starttime, availableTimes, notes, allImages, isShowPetSelectModal, isShowVeterinarianSelectModal, selectedPetID, selectedVeterinarianID, loadedPetList } = this.state;
    return (
      <div className="makeappointment-body">
        <ToastContainer />
        <PetSelectModal isOpen={isShowPetSelectModal} toggleFromModal={this.togglePetSelectModal} accountID={isLoggedIn ? accountInfo.AccountID : null} handleSelectPetFromModal={this.handleSelectPetFromModal} />
        <VeterinarianSelectModal isOpen={isShowVeterinarianSelectModal} toggleFromModal={this.toggleVeterinarianSelectModal} handleSelectVeterinarianFromModal={this.handleSelectVeterinarianFromModal} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} />
            <div className="makeappointment-content">
              <h1>Thông tin đặt lịch</h1>
              <div className="makeappointment-content-user-info">
                <b>*Thông tin Khách hàng</b>
                <input type="text" placeholder="Hãy nhhập tên khách hàng" value={customername} onChange={(event) => this.handleOnChangeInput(event, 'customername')} />
                <input type="text" placeholder="Hãy nhập số điện thoại" value={customerphone} onChange={(event) => this.handleOnChangeInput(event, 'customerphone')} />
                <input type="text" placeholder="Hãy nhập email" value={customeremail} onChange={(event) => this.handleOnChangeInput(event, 'customeremail')} />
              </div>
              {isLoggedIn && loadedPetList.length > 0 ? (
                <div className="makeappointment-content-pet">
                  <button onClick={this.togglePetSelectModal}>Xem danh sách thú cưng</button>
                </div>
              ) : (
                ''
              )}
              <div className="makeappointment-content-pet-info">
                <b>*Thông tin Thú cưng</b>
                <input type="text" placeholder="Hãy nhập Tên thú cưng" value={petname} onChange={(event) => this.handleOnChangeInput(event, 'petname')} />
                <div className="f">
                  <p>Loại: </p>
                  <select value={pettype} onChange={(event) => this.handleOnChangeInput(event, 'pettype')}>
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
                  <select value={petgender} onChange={(event) => this.handleOnChangeInput(event, 'petgender')}>
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
                <div className="f">
                  <input type="text" placeholder="Hãy nhập Tuổi" value={age} onChange={(event) => this.handleOnChangeInput(event, 'age')} />
                  <input type="text" placeholder="Hãy nhập Cân nặng" value={petweight} onChange={(event) => this.handleOnChangeInput(event, 'petweight')} />
                </div>
              </div>
              {(!isLoggedIn || (isLoggedIn && loadedPetList.length === 0)) && (
                <div className="makeappointment-save-petinfo-button">
                  <button onClick={this.handleSavePetInfo}>Lưu</button>
                </div>
              )}
              <div className="makeappointment-content-doctor">
                <div className="f">
                  <button onClick={this.toggleVeterinarianSelectModal}>Chọn bác sĩ</button>
                  {!selectedVeterinarianID ? (<p>*Không bắt buộc</p>) : selectedVeterinarianID}
                </div>
              </div>
              <div className="makeappointment-content-date">
                <div className="f">
                  <DatePicker selected={appointmentDateTime ? new Date(appointmentDateTime.getTime() - appointmentDateTime.getTimezoneOffset() * 60000) : null} onChange={this.handleOnChangeDateInput} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" className="date-picker" />
                </div>
              </div>
              <div className="f">
                <div className="makeappointment-content-service">
                  <p>
                    <b>*Dịch vụ</b>
                  </p>
                  <select value={selectedServiceID} onChange={(event) => this.handleOnChangeInput(event, 'selectedServiceID')}>
                    {codeService.length > 0 ? (
                      codeService.map((item) => (
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
                  <select value={starttime} onChange={(event) => this.handleOnChangeInput(event, 'starttime')}>
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
              <textarea placeholder="Mô tả tình trạng thú cưng" value={notes} onChange={(event) => this.handleOnChangeInput(event, 'notes')} />
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
                      <input type="file" accept="image/*" onChange={this.handleAddImage} style={{ display: 'none' }} id="upload-image" />
                      <label htmlFor="upload-image" className="add-img-label">
                        +
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <button className="makeapp" onClick={this.handleSubmitAppointment} disabled={isLoading}>
                Gửi yêu cầu
              </button>
            </div>
            <Footer />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(MakeAppointment);
