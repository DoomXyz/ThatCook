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
import { handleGetAccountInfoApi, handleLogoutApi, handleGetVeterinarianInfoApi, handleGetVeterinarianServicesApi } from '../../services/accountServices';
import { handleCreateAppointmentApi, handleGetAvailableTimesApi, handleLoadAppointmentDetailsApi } from '../../services/appointmentServices';
import { handleGetServiceInfoApi } from '../../services/serviceServices';

import { handleGetAccountPetInfoApi, handleGetPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi } from '../../services/petServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { checkLoginStatus, uploadImages } from '../../utils/pakage';

import { clearFuAppointmentInfo, saveBillSearchInfo, userLogin, userLogout, clearPreselectInfo } from '../../store/actions';

import PetSelectModal from './PetSelectModal';
import VeterinarianSelectModal from './VeterinarianSelectModal';

const defUserImage = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg';

class MakeAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'FIRST',
      prevAppointmentID: null,
      isLoggedIn: false,
      accountInfo: null,
      fuaAccountID: '',
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
      selectedVeterinarianInfo: '',
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
      if (!this.props.fuAppointmentInfo && this.state.accountInfo?.AccountType === 'V') {
        this.props.navigate('/user/veterinarian');
      } else if (this.props.fuAppointmentInfo) {
        this.setState(
          {
            type: 'FOLLOW_UP',
            prevAppointmentID: this.props.fuAppointmentInfo.appointmentid,
          },
          () => {
            this.handleLoadFollowUpAppointmentInfo();
          }
        );
      } else {
        this.setState({ type: 'FIRST' }, async () => {
          this.handleLoadAppointmentInfo();
          if (this.props.appointmentPreselect) {
            if (this.props.appointmentPreselect.type === 'Veterinarian') {
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
                            codeService: serviceResponse.data,
                            selectedServiceID: serviceResponse.data[0]?.ServiceID || '',
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
                      }
                    }
                  );
                } else {
                  toast.error('Không thể tải thông tin bác sĩ!', {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                  });
                }
              } catch (e) {
                toast.error('Lỗi khi tải thông tin bác sĩ!', {
                  position: 'top-right',
                  autoClose: 500,
                  closeOnClick: true,
                });
              }
            } else if (this.props.appointmentPreselect.type === 'Service') {
              const serviceID = this.props.appointmentPreselect.selectedID;
              try {
                const response = await handleGetServiceInfoApi(serviceID);
                if (response.errCode === 0 && response.data) {
                  this.setState({
                    selectedServiceID: serviceID,
                    codeService: [response.data], // Giới hạn dropdown chỉ hiển thị dịch vụ đã chọn
                    originalServiceList: [response.data],
                  });
                } else {
                  toast.error('Không thể tải thông tin dịch vụ!', {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                  });
                  this.setState({
                    selectedServiceID: '',
                  });
                }
              } catch (e) {
                toast.error('Lỗi khi tải thông tin dịch vụ!', {
                  position: 'top-right',
                  autoClose: 500,
                  closeOnClick: true,
                });
              }
            }
            this.props.clearPreselectInfo();
          }
        });
      }
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
  handleLoadFollowUpAppointmentInfo = async () => {
    const { prevAppointmentID } = this.state;
    try {
      const response = await handleLoadAppointmentDetailsApi(prevAppointmentID);
      if (response && response.errCode === 0) {
        const data = response.data;
        this.setState({
          selectedPetID: data.Pet.PetID,
          petname: data.Pet.PetName,
          pettype: data.Pet.PetType,
          petgender: data.Pet.PetGender,
          age: data.Pet.Age.toString(),
          petweight: data.Pet.PetWeight.toString(),
          selectedVeterinarianInfo: data.Veterinarian
            ? {
                AccountID: data.VeterinarianID,
                UserName: data.Veterinarian.UserName,
                Specialization: data.Veterinarian.Specialization,
                UserImage: data.Veterinarian.UserImage,
              }
            : {},
          FuAccountID: data.AccountID,
          customername: data.CustomerName,
          customerphone: data.CustomerPhone,
          customeremail: data.CustomerEmail,
        });
      } else {
        toast.error(response?.errMessage || 'Không thể tải thông tin lịch hẹn trước!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({ type: 'FIRST', prevAppointmentID: null });
        this.props.clearFuAppointmentInfo();
      }
    } catch (e) {
      console.log('Error loading follow-up appointment info:', e);
      toast.error('Lỗi khi tải thông tin lịch hẹn trước!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      this.setState({ type: 'FIRST', prevAppointmentID: null });
      this.props.clearFuAppointmentInfo();
    }
  };
  handleCancelFollowUp = async () => {
    const confirmCancel = () =>
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
          </div>,
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmCancel();
    if (isConfirmed) {
      this.props.clearFuAppointmentInfo();
      this.props.navigate('/user/veterinarian');
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
      const responseApi = await handleGetServiceInfoApi('ALL');
      const response = responseApi.data;
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
        const isValidPetInfo = loadedPetList.find((item) => item.PetName === newPetInfo.petname && item.PetType === newPetInfo.pettype && item.PetGender === newPetInfo.petgender && item.Age === newPetInfo.age && parseFloat(item.PetWeight) === newPetInfo.petweight);
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
      const { appointmentDateTime, selectedVeterinarianInfo, selectedServiceID } = this.state;
      if (!appointmentDateTime || !selectedServiceID) {
        this.setState({ availableTimes: [], starttime: '' });
        return;
      }
      const formattedDate = appointmentDateTime.toISOString().split('T')[0];
      const vetID = selectedVeterinarianInfo.AccountID || 'ALL';
      const response = await handleGetAvailableTimesApi(formattedDate, vetID, selectedServiceID);
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
      if (!notesCheck || notesCheck.length > 65535) {
        return { errCode: 1, errMessage: 'Mô tả tình trạng không hợp lệ hoặc vượt quá giới hạn ký tự!' };
      }
    }

    return { errCode: 0, errMessage: 'Kiểm tra thông tin hoàn tất!' };
  };
  handleSubmitAppointment = async () => {
    try {
      this.setState({ isLoading: true });
      const { customername, customerphone, customeremail, appointmentDateTime, selectedVeterinarianInfo, fuaAccountID, selectedServiceID, starttime, notes, type, prevAppointmentID, selectedPetID, allImages, isUploading, guestID, accountInfo, isLoggedIn } = this.state;
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
        accountid: isLoggedIn && type === 'FIRST' ? accountInfo.AccountID : type !== 'FIRST' ? fuaAccountID : guestID,
        veterinarianid: selectedVeterinarianInfo.AccountID || null,
        serviceid: selectedServiceID,
        petid: selectedPetID,
        imageInfo: uploadedImages,
        type,
        prevappointmentid: prevAppointmentID,
      });
      if (response && response.errCode === 0) {
        this.setState({
          createdAppointmentID: response.data.AppointmentID,
        });
        toast.success('Đặt lịch thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.props.clearFuAppointmentInfo();
        this.props.saveBillSearchInfo({ billid: response.data.AppointmentID, billtype: 2 });
        this.props.navigate('/bill');
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
                petname: selectedPet.PetName,
                pettype: selectedPet.PetType,
                petgender: selectedPet.PetGender,
                age: selectedPet.Age.toString(),
                petweight: selectedPet.PetWeight.toString(),
              }
            : {
                petname: '',
                pettype: this.state.codePetType[0].Code || '',
                petgender: this.state.codePetGender[0].Code || '',
                age: '',
                petweight: '',
              }),
        });
      } else {
        toast.error('Không thể tải danh sách thú cưng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      toast.error('Lỗi khi tải danh sách thú cưng của người dùng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
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

  handleSelectVeterinarianFromModal = async (veterinarianInfo) => {
    this.setState({ selectedVeterinarianInfo: veterinarianInfo }, async () => {
      if (veterinarianInfo.AccountID) {
        try {
          const response = await handleGetVeterinarianServicesApi(veterinarianInfo.AccountID);
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
    const { isLoading, isLoggedIn, accountInfo, codePetType, codePetGender, petgender, pettype, customername, customerphone, customeremail, petname, age, petweight, appointmentDateTime, selectedServiceID, codeService, starttime, availableTimes, notes, allImages, selectedPetID, isShowPetSelectModal, isShowVeterinarianSelectModal, selectedVeterinarianInfo, loadedPetList, type } = this.state;
    return (
      <div className="makeappointment-body">
        <ToastContainer />
        <PetSelectModal isOpen={isShowPetSelectModal} toggleFromModal={this.togglePetSelectModal} accountID={isLoggedIn ? accountInfo.AccountID : null} handleSelectPetFromModal={this.handleSelectPetFromModal} onPetListChange={this.handlePetListChange} />
        <VeterinarianSelectModal isOpen={isShowVeterinarianSelectModal} toggleFromModal={this.toggleVeterinarianSelectModal} handleSelectVeterinarianFromModal={this.handleSelectVeterinarianFromModal} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} />
            <div className="makeappointment-content">
              <h1>{type === 'FOLLOW_UP' ? 'Đặt lịch tái khám' : 'Thông tin đặt lịch'}</h1>
              <div className="makeappointment-content-user-info">
                <b>*Thông tin Khách hàng</b>
                <input type="text" placeholder="Hãy nhhập tên khách hàng" value={customername} onChange={(event) => this.handleOnChangeInput(event, 'customername')} />
                <input type="text" placeholder="Hãy nhập số điện thoại" value={customerphone} onChange={(event) => this.handleOnChangeInput(event, 'customerphone')} />
                <input type="text" placeholder="Hãy nhập email" value={customeremail} onChange={(event) => this.handleOnChangeInput(event, 'customeremail')} />
              </div>
              {isLoggedIn && loadedPetList.length > 0 && type !== 'FOLLOW_UP' && (
                <div className="makeappointment-content-pet">
                  <button onClick={this.togglePetSelectModal}>Chọn thú cưng</button>
                </div>
              )}
              {!isLoggedIn || loadedPetList.length === 0 || selectedPetID !== '' || type === 'FOLLOW_UP' ? (
                <div className="makeappointment-content-pet-info">
                  <b>*Thông tin Thú cưng</b>
                  <input type="text" placeholder="Hãy nhập Tên thú cưng" value={petname} onChange={(event) => this.handleOnChangeInput(event, 'petname')} disabled={(isLoggedIn && loadedPetList.length > 0) || type === 'FOLLOW_UP'} />
                  <div className="f">
                    <p>Loại: </p>
                    <select value={pettype} onChange={(event) => this.handleOnChangeInput(event, 'pettype')} disabled={(isLoggedIn && loadedPetList.length > 0) || type === 'FOLLOW_UP'}>
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
                    <select value={petgender} onChange={(event) => this.handleOnChangeInput(event, 'petgender')} disabled={(isLoggedIn && loadedPetList.length > 0) || type === 'FOLLOW_UP'}>
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
                    <input type="text" placeholder="Hãy nhập Tuổi" value={age} onChange={(event) => this.handleOnChangeInput(event, 'age')} disabled={(isLoggedIn && loadedPetList.length > 0) || type === 'FOLLOW_UP'} />
                    <input type="text" placeholder="Hãy nhập Cân nặng" value={petweight} onChange={(event) => this.handleOnChangeInput(event, 'petweight')} disabled={(isLoggedIn && loadedPetList.length > 0) || type === 'FOLLOW_UP'} />
                  </div>
                </div>
              ) : (
                <p style={{ marginLeft: '5rem' }}>
                  <u>*Chưa chọn thú cưng</u>
                </p>
              )}
              {(!isLoggedIn || (isLoggedIn && loadedPetList.length === 0)) && type !== 'FOLLOW_UP' && (
                <div className="makeappointment-save-petinfo-button">
                  <button onClick={this.handleSavePetInfo}>Lưu</button>
                  <div className="stra"></div>
                </div>
              )}
              <b className="doctor-info">*Thông tin đặt lịch</b>
              <div className="makeappointment-content-doctor">
                <div className="f">
                  {type !== 'FOLLOW_UP' && <button onClick={this.toggleVeterinarianSelectModal}>Chọn bác sĩ</button>}
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
                        <button className="cancel-doctor-btn">X</button>
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
              <textarea placeholder="Mô tả tình trạng thú cưng (nếu có)" value={notes} onChange={(event) => this.handleOnChangeInput(event, 'notes')} />
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
              <div className="makeappointment-actions sb">
                {type === 'FOLLOW_UP' && (
                  <button className="cancel-follow-up" onClick={this.handleCancelFollowUp}>
                    Hủy tái khám
                  </button>
                )}
                <button className="makeapp" onClick={this.handleSubmitAppointment} disabled={isLoading}>
                  Gửi yêu cầu
                </button>
              </div>
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
  fuAppointmentInfo: state.appointment.fuAppointmentInfo,
  appointmentPreselect: state.preselect.appointmentPreselect,
});
const mapDispatchToProps = (dispatch) => ({
  clearFuAppointmentInfo: () => dispatch(clearFuAppointmentInfo()),
  saveBillSearchInfo: (billData) => dispatch(saveBillSearchInfo(billData)),
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  clearPreselectInfo: () => dispatch(clearPreselectInfo()),
});
export default connect(mapStateToProps, mapDispatchToProps)(MakeAppointment);
