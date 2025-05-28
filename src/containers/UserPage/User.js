import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';

import { eyeOutline, eyeOffOutline, chevronBackOutline, pencil } from 'ionicons/icons';

import './User.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';
import CancelInvoiceModal from '../../components/CancelInvoiceModal';

import { handleGetAccountInfoApi, handleLogoutApi, handleChangeAccountInfoApi, handleChangePasswordApi } from '../../services/accountServices';
import { handleGetAccountInvoiceInfoApi, handleGetInvoiceDetailInfoApi, handleChangeInvoiceStatusApi, handleSendInvoiceEmailApi } from '../../services/invoiceServices';
import { handleLoadAppointmentInfoApi, handleLoadAppointmentDetailsApi, handleChangeAppointmentStatusApi, handleGetAppointmentBillDetailApi } from '../../services/appointmentServices';
import { handleGetServiceInfoApi } from '../../services/serviceServices';
import { handleGetAccountPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi, handleRemovePetApi } from '../../services/petServices';

import { checkLoginStatus, getAllCodes, uploadImages, validatePetInput, generateInvoicePDF, generateAppointmentBillPDF } from '../../utils/pakage';
import { userLogin, userLogout } from '../../store/actions';

const defUserImage = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg';

class User extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      // Authentication & General
      actionPage: 1,
      isLoading: true,
      isLoggedIn: false,
      accountid: '',
      triggerLoadInformation: false,
      // Codes
      codeGender: [],
      codePaymentType: [],
      codeShippingMethod: [],
      codePaymentStatus: [],
      codeShippingStatus: [],
      codePetType: [],
      codePetGender: [],
      codeAppointmentStatus: [],
      codeAppointmentType: [],
      // Pagination
      currentPage: 1,
      tempCurrentPage: '1',
      limitInvoicePerQuery: 5,
      limitProductPerQuery: 7,
      limitAppointmentPerQuery: 5,
      totalPages: 1,
      // Filtering & Sorting
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      date1: '',
      date2: '',
      // Data Lists
      loadedInvoiceInfo: [],
      loadedInvoiceDetail: null,
      loadedAppointmentInfo: [],
      loadedAppointmentDetail: null,
      loadedAppointmentBillDetail: null,
      loadedPetInfo: [],
      serviceList: [],
      // AccountInfo
      editField: null, // Theo dõi trường đang chỉnh sửa (ví dụ: "username", "phone", ...)
      originalValue: '',
      imageInfo: null,
      userimage: '',
      accountname: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      email: '',
      isUploading: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      // Modals & Selections
      isShowCancelInvoiceModal: false,
      selectedCancelInvoice: null,
      selectedInvoiceID: null,
      selectedAppointment: null,
      // Pet Management
      isEditingPet: null,
      isAddingPet: false,
      limitPetCount: 3,
      // DisableButton
      disabledButtons: {
        confirmReceived: false,
        continueInvoice: false,
        cancelAppointment: false,
        cancelInvoice: false,
        savePet: false,
        deletePet: false,
        cancelPet: false,
        addPet: false,
      },
    };
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadCode(['Gender', 'PaymentType', 'ShippingMethod', 'PaymentStatus', 'ShippingStatus', 'PetType', 'PetGender', 'AppointmentStatus', 'AppointmentType']);
    await this.handleGetServiceInfo();
    setTimeout(() => {
      this.handleLoadAccountInfo();
      this.handleLoadInvoiceInfo();
      this.handleLoadPetInfo();
      this.handleLoadAppointmentInfo();
      this.setState({ isLoading: false });
    }, 10);
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        this.handleLoadAccountInfo();
        this.handleLoadInvoiceInfo();
        this.handleLoadPetInfo();
        this.handleLoadAppointmentInfo();
      }, 10);
    }
  }
  componentWillUnmount() {
    if (this.state.imageInfo?.Image && this.state.imageInfo?.file) {
      URL.revokeObjectURL(this.state.imageInfo.Image);
    }
  }
  //header action
  triggerLoadInformation = async () => {
    this.setState((prevState) => ({
      triggerLoadInformation: !prevState.triggerLoadInformation,
    }));
  };
  //login
  handleIsLogin = async () => {
    try {
      this.setState({ isLoading: true });
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          accountInfo,
          isLoggedIn: true,
          accountid: accountInfo.AccountID,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          accountInfo: null,
          isLoggedIn: false,
          accountid: '',
        });
        this.props.navigate('/login');
      }
    } catch (e) {
      this.props.navigate('/login');
    } finally {
      this.setState({ isLoading: false });
    }
  };
  //load filter/code
  handleLoadCode = async (codeTypeFilter) => {
    try {
      this.setState({ isLoading: true });
      const responses = await Promise.all(codeTypeFilter.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      const hasDefault = ['Gender'];
      codeTypeFilter.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        if (hasDefault.includes(type)) {
          newState[type.toLowerCase()] = response.data.length > 0 ? response.data[0].Code : '';
        }
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
        this.setState({ serviceList: [] });
        return;
      }
      this.setState({ serviceList: response.data });
    } catch (e) {
      toast.error('Lỗi khi tải danh sách dịch vụ!');
    }
  };
  //load data info
  handleReloadData = (type) => {
    switch (type) {
      case 1:
        this.handleLoadAccountInfo();
        break;
      case 2:
        this.handleLoadPetInfo();
        break;
      case 3:
        this.handleLoadInvoiceInfo();
        break;
      case 4:
        this.handleLoadAppointmentInfo();
        break;
      default:
        break;
    }
  };
  handleLoadAccountInfo = async () => {
    try {
      const { accountid } = this.state;
      const response = await handleGetAccountInfoApi(accountid);
      if (response && response.errCode === 0) {
        const accountInfo = response.data;
        this.setState({
          accountname: accountInfo.AccountName,
          email: accountInfo.Email,
          username: accountInfo.UserName,
          phone: accountInfo.Phone,
          address: accountInfo.Address,
          gender: accountInfo.Gender,
          userimage: accountInfo.UserImage,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải tài khoản:', e);
      toast.error('Lỗi khi tải tài khoản!');
    }
  };
  handleLoadPetInfo = async () => {
    try {
      const { accountid } = this.state;
      const response = await handleGetAccountPetInfoApi(accountid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedPetInfo: response.data || [],
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách thú cưng:', e);
      toast.error('Lỗi khi tải danh sách thú cưng!');
    }
  };
  handleLoadInvoiceInfo = async () => {
    try {
      const { accountid, limitInvoicePerQuery } = this.state;
      const response = await handleGetAccountInvoiceInfoApi(accountid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedInvoiceInfo: response.data,
          totalPages: Math.ceil(response.data.length / limitInvoicePerQuery),
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải thông tin đơn hàng:', e);
      toast.error('Lỗi khi tải thông tin đơn hàng!');
    }
  };
  handleLoadAppointmentInfo = async () => {
    const { accountid, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2 } = this.state;
    try {
      this.setState({ isLoading: true });
      const response = await handleLoadAppointmentInfoApi(accountid, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2);
      if (response && response.errCode === 0) {
        this.setState({
          loadedAppointmentInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitAppointmentPerQuery),
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách lịch hẹn:', e);
      toast.error('Lỗi khi tải danh sách lịch hẹn!');
    }
  };
  handleLoadAppointmentDetails = async (appointmentid) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleLoadAppointmentDetailsApi(appointmentid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedAppointmentDetail: response.data,
        });
      } else {
        toast.error(response?.errMessage || 'Không thể tải chi tiết lịch hẹn!');
      }
    } catch (e) {
      console.error('Lỗi khi tải chi tiết lịch hẹn:', e);
      toast.error('Lỗi khi tải chi tiết lịch hẹn!');
    }
    this.setState({ isLoading: false });
  };
  handleLoadInvoiceDetail = async (invoiceid) => {
    try {
      const response = await handleGetInvoiceDetailInfoApi(invoiceid);
      if (response && response.errCode === 0 && response.data) {
        return response.data;
      }
      toast.error(response.errMessage || 'Không tìm thấy đơn hàng!');
      return null;
    } catch (e) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', e);
      toast.error('Lỗi hệ thống khi tải chi tiết đơn hàng!');
      return null;
    }
  };
  handleLoadAppointmentBillDetail = async (appointmentid) => {
    try {
      const response = await handleLoadAppointmentDetailsApi(appointmentid);
      if (response && response.errCode === 0 && response.data) {
        const appointmentDetail = response.data;
        let billDetail = null;
        if (appointmentDetail.AppointmentStatus === 'COMP' && appointmentDetail.AppointmentBill) {
          const billResponse = await handleGetAppointmentBillDetailApi(appointmentDetail.AppointmentBill.AppointmentBillID);
          if (billResponse && billResponse.errCode === 0) {
            billDetail = billResponse.data;
          } else {
            toast.warn('Không tải được chi tiết hóa đơn lịch hẹn!');
          }
        }
        return { appointmentDetail, billDetail };
      }
      toast.error(response?.errMessage || 'Không tìm thấy lịch hẹn!');
      return null;
    } catch (e) {
      console.error('Lỗi khi tải chi tiết lịch hẹn:', e);
      toast.error('Lỗi hệ thống khi tải chi tiết lịch hẹn!');
      return null;
    }
  };
  //AccountInfo & Password Management
  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }
    const preview = URL.createObjectURL(file);
    this.setState({
      imageInfo: { ImageID: Date.now(), Image: preview, file },
    });
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = null;
    }
  };
  handleRemoveImage = () => {
    this.setState({ imageInfo: null })
  };
  handleEditClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state[field], // Lưu giá trị ban đầu của trường
    });
  };
  handleAccountInfoChange = (e) => {
    const { name, value } = e.target;
    const { editField, gender } = this.state
    if (name === 'gender' && editField !== 'gender') {
      this.setState({
        editField: 'gender',
        originalValue: gender, // Lưu giá trị ban đầu của gender
      });
    }
    this.setState({
      [name]: value,
    });
  };
  handleChangeAccountInfo = async (e) => {
    e.preventDefault();
    const { imageInfo, isUploading, editField, originalValue, accountid, accountname, username, phone, address, gender, email } = this.state;
    let updateInfo = {
      accountid: accountid,
      accountname: accountname,
      username: username,
      phone: phone,
      address: address,
      gender: gender,
      email: email,
    };
    let hasChanges = false;
    if (imageInfo) {
      if (isUploading) {
        toast.info('Đang tải ảnh, vui lòng chờ!');
        return;
      }
      this.setState({ isUploading: true, isLoading: true });
      try {
        const uploadResult = await uploadImages([imageInfo]); // Gửi mảng 1 phần tử
        if (!uploadResult.status) {
          toast.error(uploadResult.error || 'Tải ảnh thất bại!');
          return;
        }
        const uploadedImage = uploadResult.images[0];
        updateInfo.userimage = {
          public_id: uploadedImage.ImageID,
          secure_url: uploadedImage.Image,
          original_filename: imageInfo.file.name,
          format: imageInfo.file.type.split('/')[1],
          created_at: new Date().toISOString(),
        };
        hasChanges = true;
      } catch (e) {
        toast.error('Lỗi khi tải ảnh!');
        return;
      } finally {
        this.setState({ isUploading: false, isLoading: false });
      }
    }
    // Kiểm tra xem có thay đổi dữ liệu không
    if (editField) {
      const newValue = this.state[editField];
      if (originalValue !== newValue) {
        hasChanges = true;
      }
    }
    const accountName = updateInfo.accountname.trim();
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    if (!accountNameRegex.test(accountName)) {
      toast.error('Tên tài khoản không hợp lệ!');
      this.handleLoadAccountInfo(accountid);
      return;
    }
    const phoneNumber = updateInfo.phone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Số điện thoại không hợp lệ!');
      this.handleLoadAccountInfo(accountid);
      return;
    }
    if (hasChanges) {
      let response = await handleChangeAccountInfoApi(updateInfo);
      if (response && response.errCode === 0) {
        toast.success('Cập nhật thông tin thành công!');
      } else {
        toast.error(response.errMessage);
        this.handleLoadAccountInfo(accountid);
      }
    }
    await this.triggerLoadInformation();
    this.setState({ editField: null, originalValue: '' });
  };
  handleChangePasswordInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  toggleShowPassword = (field) => {
    this.setState((prevState) => ({
      [field]: !prevState[field],
    }));
  };
  handleChangePassword = async (e) => {
    e.preventDefault();
    const { accountid, oldPassword, newPassword, confirmPassword } = this.state;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận không khớp!');
      return;
    }
    const checkNewPassword = newPassword.trim();
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(checkNewPassword)) {
      toast.error('Mật khẩu mới không hợp lệ!');
      return;
    }
    try {
      this.setState({ isLoading: true });
      const response = await handleChangePasswordApi(accountid, oldPassword, newPassword);
      if (response && response.errCode === 0) {
        toast.success('Đổi mật khẩu thành công, hãy đăng nhập lại với mật khẩu mới');
        this.setState({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          handleLogoutApi();
          this.props.userLogout();
          this.setState({
            isLoggedIn: false,
            accountid: '',
          });
          this.props.navigate('/login');
        }, 1001);
      } else {
        toast.error(response.errMessage);
      }
    } catch (e) {
      toast.error('Đổi mật khẩu thất bại!');
    }
    this.setState({ isLoading: false });
  };
  //PetInfo Management
  handleEditPet = (index) => {
    const { isAddingPet, isEditingPet } = this.state
    if (isAddingPet || isEditingPet !== null) {
      toast.error('Vui lòng lưu hoặc hủy hành động hiện tại trước khi chỉnh sửa thú cưng khác!');
      return;
    }
    this.setState({ isEditingPet: index, isAddingPet: false });
  };
  handleAddPet = () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, addPet: true } });
    if (this.state.isAddingPet || this.state.isEditingPet !== null) {
      const confirmAddNew = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>{this.state.isAddingPet ? 'Bạn đang thêm thú cưng chưa lưu. Lưu hoặc hủy trước khi thêm thú cưng mới?' : 'Bạn có thay đổi thú cưng chưa lưu. Hủy thay đổi và thêm thú cưng mới?'}</p>
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
              onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, addPet: false } }); },
            }
          );
        });
      confirmAddNew().then((isConfirmed) => {
        if (isConfirmed) {
          this.setState(
            {
              isEditingPet: null,
              isAddingPet: false,
            },
            async () => {
              await this.handleLoadPetInfo(this.state.accountid);
              this.setState((prevState) => ({
                loadedPetInfo: [
                  {
                    PetID: `temp_${Date.now()}`,
                    PetName: '',
                    PetType: prevState.codePetType[0]?.Code || '',
                    PetGender: prevState.codePetGender[0]?.Code || '',
                    Age: '',
                    PetWeight: '',
                  },
                  ...prevState.loadedPetInfo,
                ],
                isEditingPet: 0,
                isAddingPet: true,
              }));
            }
          );
        }
      });
    } else {
      this.setState((prevState) => ({
        loadedPetInfo: [
          {
            PetID: `temp_${Date.now()}`,
            PetName: '',
            PetType: prevState.codePetType[0]?.Code || '',
            PetGender: prevState.codePetGender[0]?.Code || '',
            Age: '',
            PetWeight: '',
          },
          ...prevState.loadedPetInfo,
        ],
        isEditingPet: 0,
        isAddingPet: true,
      }));
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, addPet: false } });
  };
  handleCancelPet = () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelPet: true } });
    const confirmCancel = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>{this.state.isAddingPet ? 'Bạn đang thêm thú cưng chưa lưu. Hủy thú cưng này?' : 'Bạn có thay đổi thú cưng chưa lưu. Hủy thay đổi?'}</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelPet: false } }); },
          }
        );
      });
    confirmCancel().then((isConfirmed) => {
      if (isConfirmed) {
        this.setState(
          (prevState) => {
            if (prevState.isAddingPet && prevState.isEditingPet === 0) {
              return {
                loadedPetInfo: prevState.loadedPetInfo.slice(1),
                isEditingPet: null,
                isAddingPet: false,
              };
            }
            return {
              isEditingPet: null,
              isAddingPet: false,
            };
          },
          async () => {
            await this.handleLoadPetInfo(this.state.accountid);
          }
        );
      }
    });
  };
  handlePetChange = (index, field, value) => {
    this.setState((prevState) => {
      const newPets = [...prevState.loadedPetInfo];
      newPets[index] = { ...newPets[index], [field]: value };
      return { loadedPetInfo: newPets };
    });
  };
  handleSavePet = async (index) => {
    const { accountid, loadedPetInfo, isAddingPet } = this.state
    const pet = loadedPetInfo[index];
    const newPetInfo = {
      petname: pet.PetName.trim(),
      pettype: pet.PetType,
      petgender: pet.PetGender,
      petweight: parseFloat(pet.PetWeight),
      age: parseInt(pet.Age),
    };
    const isValidatePetInput = await validatePetInput(newPetInfo);
    if (!isValidatePetInput.valid) {
      toast.error(`${isValidatePetInput.errMessage} tại dòng ${index + 1}`);
      return;
    }
    this.setState({ isLoading: true });
    try {

      let response;
      if (isAddingPet) {
        response = await handleSavePetInfoApi(accountid, newPetInfo);
      } else {
        response = await handleChangePetInfoApi(pet.PetID, newPetInfo);
      }
      if (response && response.errCode === 0) {
        toast.success(isAddingPet ? 'Tạo thú cưng thành công!' : 'Cập nhật thú cưng thành công!');
        await this.handleLoadPetInfo(accountid);
        this.setState({
          isEditingPet: null,
          isAddingPet: false,
        });
      } else {
        toast.error(response?.errMessage || (isAddingPet ? 'Tạo thú cưng thất bại!' : 'Cập nhật thú cưng thất bại!'));
      }
    } catch (e) {
      console.error(isAddingPet ? 'Create Pet:' : 'Edit Pet:', e);
      toast.error(`Lỗi khi ${isAddingPet ? 'tạo' : 'cập nhật'} thú cưng, vui lòng thử lại!`);
    }
    this.setState({ isLoading: false });
  };
  handleDeletePet = async (petid) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, deletePet: true } });
    const confirmDelete = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Bạn có chắc muốn xóa thú cưng này?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, deletePet: false } }); },
          }
        );
      });
    const isConfirmed = await confirmDelete();
    if (isConfirmed) {
      this.setState({ isLoading: true });
      const response = await handleRemovePetApi(petid);
      if (response && response.errCode === 0) {
        toast.success('Xóa thú cưng thành công!');
        await this.handleLoadPetInfo(this.state.accountid);
      } else {
        toast.error('Xóa thú cưng thất bại!');
      }
    }
    this.setState({ isLoading: false });
  };
  //search, filter, sort
  handleSearchChange = (event, type) => {
    const value = event.target.value;
    this.setState(
      {
        searchValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          this.handleReloadData(type);
        }, 500);
      }
    );
  };
  handleFilter = (value, type) => {
    this.setState(
      {
        filterValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        this.handleReloadData(type)
      }
    );
  };
  handleSort = (value, type) => {
    this.setState(
      {
        sortValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        this.handleReloadData(type);
      }
    );
  };
  resetDateFilter = (dateField, type) => {
    this.setState(
      {
        [dateField]: '',
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        this.handleReloadData(type);
      }
    );
  };
  //pagination
  handlePageChange = (page, type) => {
    const { totalPages } = this.state;
    let newPage = page;
    if (isNaN(page) || page <= 0) {
      newPage = 1;
    } else if (page > totalPages) {
      newPage = totalPages;
    }
    this.setState({
      currentPage: newPage,
      tempCurrentPage: newPage.toString(),
    }, () => {
      this.handleReloadData(type);
    });
  };
  handlePrevPage = (type) => {
    this.setState(
      (prevState) => {
        const newPage = Math.max(1, prevState.currentPage - 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      }, () => {
        this.handleReloadData(type);
      }
    );
  };
  handleNextPage = (type) => {
    this.setState(
      (prevState) => {
        const newPage = Math.min(prevState.totalPages, prevState.currentPage + 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      },
      () => {
        this.handleReloadData(type);
      }
    );
  };
  handlePageInputBlur = (type) => {
    const { tempCurrentPage } = this.state;
    const page = parseInt(tempCurrentPage, 10);
    this.handlePageChange(page, type);
  };
  handlePageKeyDown = (event, type) => {
    if (event.key === 'Enter') {
      const { tempCurrentPage } = this.state;
      const page = parseInt(tempCurrentPage, 10);
      this.handlePageChange(page, type);
    }
  };
  //InvoiceAction Management
  handleConfirmReceived = async (invoiceid) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, confirmReceived: true } });
    const confirmReceived = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận đã nhận hàng?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, confirmReceived: false } }); },
          }
        );
      });
    const isConfirmed = await confirmReceived();
    if (!isConfirmed) return;
    this.setState({ isLoading: true });
    try {
      const type = 'ShippingStatus';
      const status = 'DELI';
      const response = await handleChangeInvoiceStatusApi(invoiceid, type, status, '');
      if (response && response.errCode === 0) {
        toast.success('Xác nhận nhận hàng thành công!');
        await this.handleLoadInvoiceInfo(this.state.accountid);
      } else {
        const errMessage = response?.errMessage || 'Xác nhận nhận hàng thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Error confirming received:', e);
      toast.error('Xảy ra lỗi khi xác nhận nhận hàng, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleContinueInvoice = async (invoiceid) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, continueInvoice: true } });
    const confirmContinue = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận tiếp tục đơn hàng?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, continueInvoice: false } }); },
          }
        );
      });
    const isConfirmed = await confirmContinue();
    if (!isConfirmed) return;
    this.setState({ isLoading: true });
    try {
      const type = 'ShippingStatus';
      const status = 'PEND';
      const response = await handleChangeInvoiceStatusApi(invoiceid, type, status, '');
      if (response && response.errCode === 0) {
        toast.success('Tiếp tục đơn hàng thành công!');
        await this.handleLoadInvoiceInfo(this.state.accountid);
      } else {
        const errMessage = response?.errMessage || 'Tiếp tục đơn hàng thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Error continuing invoice:', e);
      toast.error('Xảy ra lỗi khi tiếp tục đơn hàng, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  //AppointmentAction Management
  handleCancelAppointment = async (appointmentid) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelAppointment: true } });
    const confirmCancel = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Bạn có muốn hủy lịch hẹn này?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelAppointment: false } }); },
          }
        );
      });
    const isConfirmed = await confirmCancel();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeAppointmentStatusApi(appointmentid, 'CANCELED', null);
      if (response && response.errCode === 0) {
        toast.success('Hủy lịch hẹn thành công!');
        this.handleLoadAppointmentInfo(this.state.accountid);
      } else {
        toast.error(response?.errMessage || 'Hủy lịch hẹn thất bại!');
      }
    } catch (e) {
      console.error('Lỗi khi hủy lịch hẹn:', e);
      toast.error('Xảy ra lỗi khi hủy lịch hẹn, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  //form controller
  handleFormHoSoNguoiDung = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 1, editField: null, currentPage: 1, tempCurrentPage: '1' });
  };
  handleFormLichSuDonHang = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 2, selectedInvoiceID: null, currentPage: 1, tempCurrentPage: '1' });
  };
  handleFormDatLich = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 5, currentPage: 1, tempCurrentPage: '1' });
  };
  handleFormThuCung = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 7, currentPage: 1, tempCurrentPage: '1' });
  };
  handleFromThemThuCung = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 8, currentPage: 1, tempCurrentPage: '1' });
  };
  handleFormDoiMatKhau = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 3, currentPage: 1, tempCurrentPage: '1' });
  };
  handleFormChiTietDonHang = async (invoiceid) => {
    if (this.state.selectedInvoiceID === invoiceid && this.state.loadedInvoiceDetail) {
      this.setState({ actionPage: 4 });
      return;
    }
    this.setState({ isLoading: true });
    const invoiceDetail = await this.handleLoadInvoiceDetail(invoiceid);
    if (invoiceDetail) {
      this.setState({
        actionPage: 4,
        selectedInvoiceID: invoiceid,
        loadedInvoiceDetail: invoiceDetail,
        totalPages: Math.ceil((invoiceDetail.ProductList?.length || 0) / this.state.limitProductPerQuery),
        currentPage: 1,
        tempCurrentPage: '1',
      });
    } else {
      this.setState({ actionPage: 2 });
    }
    this.setState({ isLoading: false });
  };
  handleFormChiTietLichKham = async (appointmentid) => {
    if (this.state.selectedAppointmentID === appointmentid && this.state.loadedAppointmentDetail) {
      this.setState({ actionPage: this.state.loadedAppointmentDetail.AppointmentStatus === 'COMP' && this.state.loadedAppointmentDetail.AppointmentBill ? 9 : 6 });
      return;
    }
    this.setState({ isLoading: true, loadedAppointmentBillDetail: null });
    const result = await this.handleLoadAppointmentBillDetail(appointmentid);
    if (result) {
      this.setState({
        actionPage: result.appointmentDetail.AppointmentStatus === 'COMP' && result.appointmentDetail.AppointmentBill ? 9 : 6,
        selectedAppointmentID: appointmentid,
        loadedAppointmentDetail: result.appointmentDetail,
        loadedAppointmentBillDetail: result.billDetail,
      });
    } else {
      this.setState({ actionPage: 5 });
    }
    this.setState({ isLoading: false });
  };
  //Utilities
  getDayOfWeek = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };
  //CancelInvoice Modal
  handleSelectedCancelInvoice = (invoiceid) => {
    this.setState({
      selectedCancelInvoice: invoiceid,
      isShowCancelInvoiceModal: true,
    });
  };
  toggleCancelInvoiceModal = () => {
    this.setState({
      isShowCancelInvoiceModal: !this.state.isShowCancelInvoiceModal,
    });
  };
  handleCancelInvoiceFromModal = async (invoiceid, cancelreason) => {
    this.setState({ isLoading: true });
    try {
      const type = 'ShippingStatus';
      const status = 'PEND_CANCEL';
      const response = await handleChangeInvoiceStatusApi(invoiceid, type, status, cancelreason);
      if (response && response.errCode === 0) {
        toast.success('Gửi yêu cầu hủy đơn hàng thành công!');
        await this.handleLoadInvoiceInfo(this.state.accountid);
        this.setState({
          isShowCancelInvoiceModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Gửi yêu cầu hủy đơn hàng thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Edit:', e);
      toast.error('Xảy ra lỗi khi gửi yêu cầu hủy đơn hàng, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  //Hyper Utilities
  handleGeneratePDF = (data, type) => {
    if (!data) {
      toast.error('Không có dữ liệu hóa đơn để tạo PDF!');
      return;
    }
    switch (type) {
      case 1:
        generateInvoicePDF(data);
        break
      case 3:
        generateAppointmentBillPDF(data);
        break;
      default:
        break
    }
  };
  handleSendEmail = async (billid, type) => {
    const { email } = this.state;
    if (!email) {
      toast.info('Hãy nhập Email để gửi hóa đơn!')
      return
    }
    try {
      this.setState({ isLoading: true })
      const sendInfo = {
        billid,
        email,
      }
      let response
      switch (type) {
        case 1: response = await handleSendInvoiceEmailApi(sendInfo);
          break;
        default:
          break;
      }
      if (response && response.errCode === 0) {
        toast.success('Gửi email thành công!');
        this.setState({ actionPage: 0 })
      } else {
        toast.error(response?.errMessage || 'Gửi email thất bại!');
      }
    } catch (e) {
      console.log('Lỗi khi gửi email:', e);
      toast.error('Lỗi khi gửi email!');
    } finally {
      this.handleFormChiTietDonHang(this.state.selectedInvoiceID)
      this.setState({ isLoading: false })
    }
  };

  renderForm() {
    const {
      userimage,
      imageInfo,
      actionPage,
      accountname,
      username,
      phone,
      address,
      gender,
      email,
      codeGender,
      loadedInvoiceInfo,
      editField,
      codePaymentType,
      codeShippingMethod,
      codePaymentStatus,
      codeShippingStatus,
      oldPassword,
      newPassword,
      confirmPassword,
      searchValue,
      loadedPetInfo,
      codePetType,
      codePetGender,
      isEditingPet,
      limitPetCount,
      loadedAppointmentDetail,
      codeAppointmentStatus,
      codeAppointmentType,
      selectedInvoiceID,
      loadedInvoiceDetail,
      limitProductPerQuery,
      loadedAppointmentInfo,
      limitAppointmentPerQuery,
      totalPages,
      filterValue,
      sortValue,
      date1,
      date2,
      serviceList,
      limitInvoicePerQuery,
      loadedAppointmentBillDetail,
      currentPage,
      tempCurrentPage,
      showOldPassword,
      showNewPassword,
      showConfirmPassword,
      isAddingPet,
      disabledButtons
    } = this.state;
    switch (actionPage) {
      case 1:
        return (
          <form className="user-info-form" onSubmit={this.handleChangeAccountInfo}>
            <h3>
              <b>Thông tin người dùng:</b>
            </h3>
            <div className="user-info-form-content">
              <div className="user-content-left">
                <div className="user-info-tab">
                  <div className="descreption-user">Email:</div>
                  <div className="value-user email">{email}</div>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Tên tài khoản:</div>
                  {editField === 'accountname' ? <input type="text" name="accountname" value={accountname} onChange={this.handleAccountInfoChange} className="value-user-input" /> : <div className="value-user">{accountname}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('accountname')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Họ và tên:</div>
                  {editField === 'username' ? <input type="text" name="username" value={username} onChange={this.handleAccountInfoChange} className="value-user-input" /> : <div className="value-user">{username}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('username')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Số điện thoại: </div>
                  {editField === 'phone' ? <input type="text" name="phone" value={phone} onChange={this.handleAccountInfoChange} className="value-user-input" /> : <div className="value-user">{phone}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('phone')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Địa chỉ:</div>
                  {editField === 'address' ? <input type="text" name="address" value={address} onChange={this.handleAccountInfoChange} className="value-user-input" /> : <div className="value-user">{address}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('address')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="user-info-tab">
                  <div className="descreption-user">Giới tính:</div>
                  <div className="value-user gender-radio-group">
                    {codeGender.map((item) => (
                      <label key={item.Code} className="gender-radio">
                        <input type="radio" name="gender" value={item.Code} checked={gender === item.Code} onChange={this.handleAccountInfoChange} />
                        {item.CodeValueVI}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="change-info-button" onSubmit={this.handleChangeAccountInfo}>
                  <button> Cập nhật </button>
                </div>
              </div>
              <div className="user-content-right">
                <div className="user-content-right-img-content">
                  <div className="user-content-img-description">Ảnh đại diện</div>
                  <div className="user-content-img-info" style={{ position: 'relative' }}>
                    {imageInfo ? (
                      <img src={imageInfo.Image} alt="Ảnh đại diện" />
                    ) : userimage ? (
                      <img src={userimage} alt="Ảnh đại diện" />
                    ) : (
                      <img src={defUserImage} alt="Ảnh đại diện" />
                    )}
                    {imageInfo && (
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={this.handleRemoveImage}
                      >
                        X
                      </button>
                    )}
                  </div>
                </div>
                <div className="user-content-img-button">
                  <input type="file" accept="image/*" id="upload-avatar" ref={this.fileInputRef} onChange={this.handleAddImage} />
                </div>
              </div>
            </div>
          </form>
        );
      case 2:
        const startInvoiceIndex = (currentPage - 1) * limitInvoicePerQuery;
        const endInvoiceIndex = startInvoiceIndex + limitInvoicePerQuery;
        const paginatedInvoiceInfo = loadedInvoiceInfo.slice(startInvoiceIndex, endInvoiceIndex);
        return (
          <form className="user-cart-form">
            <h3>
              <b>Lịch sử đơn hàng:</b>
            </h3>
            <div className="user-cart-form-content">
              <div className="order-list">
                {loadedInvoiceInfo.length > 0 ? (
                  paginatedInvoiceInfo.map((invoice, index) => (
                    <div key={index} className={`order-list-object ${actionPage === 4 ? 'active' : ''}`} onClick={() => this.handleFormChiTietDonHang(invoice.InvoiceID)}>
                      <div className="order-list-object-top">
                        <div className="oder-list-descreption-left">
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Mã đơn hàng:</b>
                            </div>
                            <div className="value-oder">{invoice.InvoiceID}</div>
                          </div>
                          <div className="order-info-tab">
                            <div className="descreption-order">
                              <b>Ngày mua hàng:</b>
                            </div>
                            <div className="value-oder">{new Date(invoice.CreatedAt).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>
                        <div className="oder-list-descreption-right">
                          {invoice.CanceledAt ? (
                            <div className="order-info-tab">
                              <div className="descreption-order">
                                <b>Ngày hủy:</b>
                              </div>
                              <div className="value-oder">{new Date(invoice.CanceledAt).toLocaleDateString('vi-VN')}</div>
                            </div>
                          ) : (
                            <div>
                              <div className="order-info-tab">
                                <div className="descreption-order">
                                  <b>Tình trạng thanh toán:</b>
                                </div>
                                <div
                                  className="value-oder"
                                  style={{
                                    color: invoice.PaymentStatus === 'PEND' ? '#FFA500' : invoice.PaymentStatus === 'PAID' ? '#008000' : invoice.PaymentStatus === 'FAIL' ? '#FF0000' : 'inherit',
                                  }}
                                >
                                  {codePaymentStatus?.find((method) => method.Code === invoice.PaymentStatus)?.CodeValueVI || 'Không xác định'}
                                </div>
                              </div>
                              <div className="order-info-tab">
                                <div className="descreption-order">
                                  <b>Tình trạng giao hàng:</b>
                                </div>
                                <div
                                  className="value-oder"
                                  style={{
                                    color: invoice.ShippingStatus === 'PEND' ? '#FFA500' : invoice.ShippingStatus === 'DELI' ? '#008000' : invoice.ShippingStatus === 'PEND_CANCEL' ? '#FF4500' : invoice.ShippingStatus === 'CANCELED' ? '#FF0000' : 'inherit',
                                  }}
                                >
                                  {codeShippingStatus?.find((method) => method.Code === invoice.ShippingStatus)?.CodeValueVI || 'Không xác định'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="order-list-object-center">
                        <div className="order-list-object-item">
                          <div className="order-list-object-item-left">
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>Tên người nhận hàng:</b>
                              </div>
                              <div className="value-item">{invoice.ReceiverName}</div>
                            </div>
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>SĐT nhận hàng:</b>
                              </div>
                              <div className="value-item">{invoice.ReceiverPhone}</div>
                            </div>
                            <div className="item-info-tab">
                              <div className="descreption-item">
                                <b>Địa chỉ nhận hàng:</b>
                              </div>
                              <div className="value-item">{invoice.ReceiverAddress}</div>
                            </div>
                          </div>
                          <div className="order-list-object-item-center">
                            <div className="item-info-tab">
                              <div className="descreption-item">Số lượng mặt hàng:</div>
                              <div className="value-item">
                                <b>{invoice.TotalQuantity}</b>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="order-list-object-bot">
                        {invoice.CanceledAt === null && (
                          <div className="oder-list-object-price">
                            <div className="price-item">
                              <div className="label">Tổng tiền hàng:</div>
                              <div className="value">
                                <b>
                                  {parseFloat(invoice.TotalPayment).toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  })}
                                </b>
                              </div>
                            </div>
                            {invoice.PaymentStatus === 'PEND' && invoice.ShippingStatus === 'PEND' && (
                              <button
                                type="button"
                                className="cancel-order-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleSelectedCancelInvoice(invoice.InvoiceID);
                                }}
                                disabled={disabledButtons.cancelInvoice}
                              >
                                Hủy đơn hàng
                              </button>
                            )}
                            {invoice.PaymentStatus === 'PAID' && invoice.ShippingStatus === 'PEND' && (
                              <button
                                type="button"
                                className="received-order-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleConfirmReceived(invoice.InvoiceID);
                                }}
                                disabled={disabledButtons.confirmReceived}
                              >
                                Xác nhận giao hàng
                              </button>
                            )}
                            {(invoice.PaymentStatus === 'PEND' || invoice.PaymentStatus === 'PAID') && invoice.ShippingStatus === 'PEND_CANCEL' && (
                              <button
                                type="button"
                                className="continue-order-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.handleContinueInvoice(invoice.InvoiceID);
                                }}
                              >
                                Tiếp tục đơn hàng
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có đơn hàng nào.</p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button type='button' className="first" onClick={() => this.handlePageChange(1, 3)} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button type='button' className="prev" onClick={() => this.handlePrevPage(3)} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 3)} onBlur={() => this.handlePageInputBlur(3)} />
                    <span className="total-pages">/ {totalPages}</span>
                    <button type='button' className="next" onClick={() => this.handleNextPage(3)} disabled={currentPage === totalPages}>
                      {'>'}
                    </button>
                    <button type='button' className="last" onClick={() => this.handlePageChange(totalPages, 3)} disabled={currentPage === totalPages}>
                      {'>>'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        );
      case 3:
        return (
          <form className="user-change-pw-form" onSubmit={this.handleChangePassword}>
            <h3>
              <b>Đổi mật khẩu:</b>
            </h3>
            <div className="user-change-pw-form-content">
              <label>Mật khẩu cũ:</label>
              <div className="user-change-pw-form-content-input">
                <input type={showOldPassword ? 'text' : 'password'} name="oldPassword" value={oldPassword} onChange={this.handleChangePasswordInputChange} placeholder="Nhập mật khẩu cũ" required />
                <IonIcon icon={showOldPassword ? eyeOutline : eyeOffOutline} className="password-toggle-icon" onClick={() => this.toggleShowPassword('showOldPassword')} />
              </div>
              <label>Mật khẩu mới:</label>
              <div className="user-change-pw-form-content-input">
                <input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={newPassword} onChange={this.handleChangePasswordInputChange} placeholder="Nhập mật khẩu mới" required />
                <IonIcon icon={showNewPassword ? eyeOutline : eyeOffOutline} className="password-toggle-icon" onClick={() => this.toggleShowPassword('showNewPassword')} />
              </div>
              <label>Xác nhận mật khẩu mới:</label>
              <div className="user-change-pw-form-content-input">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={confirmPassword} onChange={this.handleChangePasswordInputChange} placeholder="Xác nhận mật khẩu" required />
                <IonIcon icon={showConfirmPassword ? eyeOutline : eyeOffOutline} className="password-toggle-icon" onClick={() => this.toggleShowPassword('showConfirmPassword')} />
              </div>
            </div>
            <div className="button-submit">
              <button type="submit">Cập nhật</button>
            </div>
          </form>
        );
      case 4:
        const startProductIndex = (currentPage - 1) * limitProductPerQuery;
        const endProductIndex = startProductIndex + limitProductPerQuery;
        const paginatedProductList = loadedInvoiceDetail?.ProductList?.slice(startProductIndex, endProductIndex) || [];
        if (!loadedInvoiceDetail) {
          return (
            <div>
              <div className="back" onClick={this.handleFormLichSuDonHang}>
                <IonIcon icon={chevronBackOutline}></IonIcon>
                <h5>
                  <b>Trở lại</b>
                </h5>
              </div>
              <p>Không thể tải chi tiết đơn hàng. Vui lòng thử lại!</p>
            </div>
          );
        }
        return (
          <form className="user-cart-form-info">
            <div className="user-cart-form-info-top">
              <div className="user-cart-form-info-left">
                <div className="back" onClick={this.handleFormLichSuDonHang}>
                  <IonIcon icon={chevronBackOutline}></IonIcon>
                  <h5>
                    <b>Trở lại</b>
                  </h5>
                </div>
              </div>
              <div className="user-cart-form-info-right">
                <div className="order-info-tab">
                  <div className="mdh">
                    <h5>Mã đơn hàng: </h5>
                  </div>
                  <div className="ctmd">
                    <h5>{selectedInvoiceID || 'N/A'}</h5>
                  </div>
                </div>
                <div className="tt">
                  <h5
                    style={{
                      color: loadedInvoiceDetail?.ShippingStatus === 'DELI' ? 'green' : 'inherit',
                    }}
                  >
                    {codeShippingStatus?.find((status) => status.Code === loadedInvoiceDetail?.ShippingStatus)?.CodeValueVI || 'N/A'}
                  </h5>
                </div>
              </div>
            </div>
            <div className="user-cart-form-info-address">
              <div className="user-info-tab">
                <div className="descreption-user">Tên người nhận hàng:</div>
                <div className="value-user">{loadedInvoiceDetail?.ReceiverName || 'N/A'}</div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">SĐT nhận hàng:</div>
                <div className="value-user">{loadedInvoiceDetail?.ReceiverPhone || 'N/A'}</div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">Địa chỉ nhận hàng:</div>
                <div className="value-user">{loadedInvoiceDetail?.ReceiverAddress || 'N/A'}</div>
              </div>
            </div>
            <div className="user-cart-form-info-list-item">
              {loadedInvoiceDetail?.ProductList?.length > 0 ? (
                paginatedProductList.map((item, index) => (
                  <div key={index} className="user-cart-form-info-list-item-row">
                    <div className="user-cart-form-info-list-item-left">
                      <div className="img-product">
                        {item?.ProductImage && (
                          <img src={item.ProductImage} alt="Product" style={{ width: '100px', height: '100px' }} />
                        )}
                      </div>
                    </div>
                    <div className="user-cart-form-info-list-item-center">
                      <div className="item-info-tab">
                        <div className="descreption-item">Sản phẩm:</div>
                        <div className="value-item">{item?.ProductName || 'N/A'}</div>
                      </div>
                      <div className="item-info-tab">
                        <div className="descreption-item">Loại:</div>
                        <div className="value-item">{item?.DetailName || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="user-cart-form-info-list-item-right">
                      <div className="item-info-tab">
                        <div className="descreption-item">Số lượng:</div>
                        <div className="value-item">
                          <b>{item?.ItemQuantity || 'N/A'}</b>
                        </div>
                      </div>
                      <div className="item-info-tab">
                        <div className="descreption-item">Đơn giá:</div>
                        <div className="value-item">
                          {item?.ItemPrice
                            ? item.ItemPrice.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có sản phẩm trong đơn hàng.</p>
              )}
            </div>
            {totalPages > 1 && (
              <div className="page-content">
                <div className="page-content-item">
                  <button className="first" type='button' onClick={() => this.handlePageChange(1, 0)} disabled={currentPage === 1}>
                    {'<<'}
                  </button>
                  <button className="prev" type='button' onClick={() => this.handlePrevPage(0)} disabled={currentPage === 1}>
                    {'<'}
                  </button>
                  <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 0)} onBlur={() => this.handlePageInputBlur(5)} />
                  <span className="total-pages">/ {totalPages}</span>
                  <button className="next" type='button' onClick={() => this.handleNextPage(0)} disabled={currentPage === totalPages}>
                    {'>'}
                  </button>
                  <button className="last" type='button' onClick={() => this.handlePageChange(totalPages, 0)} disabled={currentPage === totalPages}>
                    {'>>'}
                  </button>
                </div>
              </div>
            )}
            <div className="user-cart-form-info-table-price">
              <div className="price-item">
                <div className="label">Tổng sản phẩm</div>
                <div className="value">{loadedInvoiceDetail?.TotalQuantity || 0}</div>
              </div>
              <div className="price-item">
                <div className="label">Tổng tiền hàng</div>
                <div className="value">
                  {parseFloat(loadedInvoiceDetail?.TotalPrice).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }) || '0 ₫'}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phí vận chuyển</div>
                <div className="value">
                  {(() => {
                    const shipping = codeShippingMethod?.find((method) => method.Code === loadedInvoiceDetail?.ShippingMethod);
                    return shipping
                      ? parseFloat(shipping.ExtraValue).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })
                      : '0 ₫';
                  })()}
                </div>
              </div>
              {parseFloat(loadedInvoiceDetail?.DiscountAmount) > 0 && (
                <div className="price-item">
                  <div className="label">Giảm giá từ coupon</div>
                  <div className="value">
                    -
                    {parseFloat(loadedInvoiceDetail?.DiscountAmount).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }) || '0 ₫'}
                  </div>
                </div>
              )}
              <div className="price-item">
                <div className="label">Tổng thanh toán</div>
                <div className="value">
                  {parseFloat(loadedInvoiceDetail?.TotalPayment).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }) || '0 ₫'}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phương thức thanh toán</div>
                <div className="value">
                  {(() => {
                    const payment = codePaymentType?.find((method) => method.Code === loadedInvoiceDetail?.PaymentType);
                    return payment ? payment.CodeValueVI : 'N/A';
                  })()}
                </div>
              </div>
              <div className="price-item">
                <div className="label">Phương thức vận chuyển</div>
                <div className="value">
                  {(() => {
                    const shipping = codeShippingMethod?.find((method) => method.Code === loadedInvoiceDetail?.ShippingMethod);
                    return shipping ? shipping.CodeValueVI : 'N/A';
                  })()}
                </div>
              </div>
              <div className="price-item">
                <div className="value">
                  <button type='button' onClick={() => this.handleGeneratePDF(loadedInvoiceDetail, 1)} className="pdf-btn">
                    Tải PDF
                  </button>
                  <button type='button' onClick={() => this.handleSendEmail(selectedInvoiceID, 1)} className="email-btn">
                    Gửi hóa đơn về Email
                  </button>
                </div>
              </div>
            </div>
          </form>
        );
      case 5:
        const startAppointmentIndex = (currentPage - 1) * limitAppointmentPerQuery;
        const endAppointmentIndex = startAppointmentIndex + limitAppointmentPerQuery;
        const paginatedAppointmentInfo = loadedAppointmentInfo.slice(startAppointmentIndex, endAppointmentIndex);
        return (
          <form className="user-appointment-form">
            <div className="f">
              <h3>
                <b>Lịch Khám:</b>
              </h3>

              <div className="appointment-filter">
                <select value={filterValue} onChange={(e) => this.handleFilter(e.target.value, 4)}>
                  <option value="ALL">Tất cả</option>
                  <optgroup label="Theo trạng thái">
                    {codeAppointmentStatus.map((status) => (
                      <option key={status.Code} value={`status-${status.Code}`}>
                        {status.CodeValueVI}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Theo dịch vụ">
                    {serviceList.map((service) => (
                      <option key={service.ServiceID} value={`service-${service.ServiceID}`}>
                        {service.ServiceName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="appointment-sort">
                <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 4)}>
                  <option value="0">Mặc định</option>
                  <option value="1">Mới nhất</option>
                  <option value="2">Cũ nhất</option>
                </select>
              </div>
              <div className="appointment-search">
                <input type="text" placeholder="Nhập tên dịch vụ hoặc thú cưng" value={searchValue} onChange={(event) => this.handleSearchChange(event, 4)} />
              </div>
              <div className="appointment-date-filter ">
                <div className="f">
                  <div>
                    <DatePicker
                      selected={date1 ? new Date(date1 + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                        this.setState({ date1: formattedDate }, () => {
                          this.handleFilter('ALL', 4);
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                      isClearable
                    />
                    {date1 && (
                      <button type='button'
                        onClick={() => this.resetDateFilter('date1', 4)}
                        style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        x
                      </button>
                    )}
                  </div>
                  <p>-</p>
                  <div>
                    <DatePicker
                      selected={date2 ? new Date(date2 + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                        this.setState({ date2: formattedDate }, () => {
                          this.handleFilter('ALL', 4);
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                      isClearable
                    />
                    {date2 && (
                      <button
                        type='button'
                        onClick={() => this.resetDateFilter('date2', 4)} // Thêm type
                        style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="user-appointment-form-content">
              <div className="appointment-list">
                {paginatedAppointmentInfo.length > 0 ? (
                  paginatedAppointmentInfo.map((appointment) => (
                    <div key={appointment.AppointmentID} className={`appointment-list-item ${actionPage === 6 ? 'active' : ''}`} onClick={() => this.handleFormChiTietLichKham(appointment.AppointmentID)}>
                      <div className="appointment-list-item-top-1">
                        <b>
                          Ngày Khám: {this.getDayOfWeek(new Date(appointment.AppointmentDate))}, {new Date(appointment.AppointmentDate).toLocaleDateString('vi-VN')} {appointment.StartTime.slice(0, 5)}-{appointment.EndTime.slice(0, 5)}
                        </b>
                      </div>
                      <div className="appointment-list-item-top">
                        <div>
                          <p>
                            <b>Mã lịch khám:</b> {appointment.AppointmentID}
                          </p>
                        </div>
                        <div>
                          <p>
                            <b>Tình trạng lịch:</b> {codeAppointmentStatus?.find((status) => status.Code === appointment.AppointmentStatus)?.CodeValueVI || appointment.AppointmentStatus}
                          </p>
                        </div>
                      </div>
                      <div className="appointment-list-item-mid">
                        <p>
                          <b>Tên khách hàng:</b> {appointment.CustomerName}
                        </p>
                        <p>
                          <b>Tên thú cưng:</b> {appointment.PetName}
                        </p>
                        <p>
                          <b>Tên dịch vụ:</b> {appointment.ServiceName}
                        </p>
                      </div>
                      <div className="appointment-list-item-bottom">
                        {appointment.AppointmentStatus === 'PEND' && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              this.handleCancelAppointment(appointment.AppointmentID);
                            }}
                            disabled={disabledButtons.cancelAppointment}
                          >
                            Hủy đặt lịch
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có lịch khám nào.</p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button type='button' className="first" onClick={() => this.handlePageChange(1, 4)} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button type='button' className="prev" onClick={() => this.handlePrevPage(4)} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 4)} onBlur={() => this.handlePageInputBlur(4)} />
                    <span className="total-pages">/ {totalPages}</span>
                    <button type='button' className="next" onClick={() => this.handleNextPage(4)} disabled={currentPage === totalPages}>
                      {'>'}
                    </button>
                    <button type='button' className="last" onClick={() => this.handlePageChange(totalPages, 4)} disabled={currentPage === totalPages}>
                      {'>>'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        );
      case 6:
        if (!loadedAppointmentDetail) {
          return (
            <div>
              <div className="back" onClick={this.handleFormDatLich}>
                <IonIcon icon={chevronBackOutline}></IonIcon>
                <h5>
                  <b>Trở lại</b>
                </h5>
              </div>
              <p>Không thể tải chi tiết lịch khám. Vui lòng thử lại!</p>
            </div>
          );
        }
        return (
          <form className="user-appointment-form-detail-2 ">
            <div className="user-appointment-form-detail-top-2">
              <div className="user-appointment-form-detail-left-2">
                <div className="back" onClick={this.handleFormDatLich}>
                  <IonIcon icon={chevronBackOutline}></IonIcon>
                  <h5>
                    <b>Trở lại</b>
                  </h5>
                </div>
              </div>
              <div className="user-appointment-form-detail-right-2">
                <div className="appointment-detail-tab-2">
                  <div className="mlk">
                    <h5>Mã lịch khám:</h5>
                  </div>
                  <div className="ctmd">
                    <h5>{loadedAppointmentDetail.AppointmentID}</h5>
                  </div>
                </div>
                <div className="tt">
                  <h5 style={{ color: loadedAppointmentDetail.AppointmentStatus === 'PEND' ? '#FFA500' : 'inherit' }}>{codeAppointmentStatus?.find((status) => status.Code === loadedAppointmentDetail.AppointmentStatus)?.CodeValueVI || loadedAppointmentDetail.AppointmentStatus}</h5>
                </div>
              </div>
            </div>
            <div className="user-appointment-form-detail-mid-2-2">
              <div className="user-appointment-form-detail-mid-2-left-2 sb">
                <div className="f">
                  <b>Ngày khám:</b>
                  <p style={{ fontWeight: 'bold' }}>
                    {this.getDayOfWeek(new Date(loadedAppointmentDetail.AppointmentDate))}, {new Date(loadedAppointmentDetail.AppointmentDate).toLocaleDateString('vi-VN')} {loadedAppointmentDetail.StartTime} đến {loadedAppointmentDetail.EndTime}
                  </p>
                </div>
                {loadedAppointmentDetail.PrevAppointmentID && (
                  <div className="f">
                    <b>Lịch hẹn trước:</b>
                    <p>
                      <a href="#" onClick={() => this.handleFormChiTietLichKham(loadedAppointmentDetail.PrevAppointmentID)}>
                        {loadedAppointmentDetail.PrevAppointmentID}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="user-appointment-form-detail-mid-1-2">
              <div className="user-appointment-form-detail-mid-1-2-info sb">
                <div className="user-appointment-form-detail-mid-1-left-info-2">
                  <div className="f">
                    <b>Tên khách hàng:</b> <p>{loadedAppointmentDetail.CustomerName}</p>
                  </div>
                  <div className="f">
                    <b>Tên thú cưng:</b> <p>{loadedAppointmentDetail.Pet.PetName}</p>
                  </div>
                  <div className="f">
                    <b>Loại thú cưng:</b> <p>{codePetType.find((type) => type.Code === loadedAppointmentDetail.Pet.PetType)?.CodeValueVI || loadedAppointmentDetail.Pet.PetType}</p>
                  </div>
                  <div className="f">
                    <b>Giới tính:</b> <p>{codePetGender.find((gender) => gender.Code === loadedAppointmentDetail.Pet.PetGender)?.CodeValueVI || loadedAppointmentDetail.Pet.PetGender}</p>
                  </div>
                </div>
                <div className="user-appointment-form-detail-mid-1-right-info-2">
                  <div className="f">
                    <b>Dịch vụ:</b> <p>{loadedAppointmentDetail.Service.ServiceName}</p>
                  </div>
                  <div className="f">
                    <b>Bác sĩ:</b> <p>{loadedAppointmentDetail.VeterinarianID ? 'Đã chỉ định' : 'Chưa chỉ định'}</p>
                  </div>
                  <div className="f">
                    <b>Loại lịch hẹn:</b> <p>{codeAppointmentType.find((type) => type.Code === loadedAppointmentDetail.AppointmentType)?.CodeValueVI || loadedAppointmentDetail.AppointmentType}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="user-appointment-form-detail-mid-2-center-2">
              <div className="user-appointment-form-detail-mid-2-center-2-content sb">
                <div>
                  <div>
                    <b>Hình ảnh đính kèm:</b>
                    <br />
                    {loadedAppointmentDetail.Images?.length > 0 ? (
                      <div className="image-gallery">
                        {loadedAppointmentDetail.Images.slice(0, 3).map((img) => (
                          <img key={img.ImageID} src={img.Image} alt="Hình ảnh lịch hẹn" style={{ maxWidth: '100px', margin: '5px' }} />
                        ))}
                      </div>
                    ) : (
                      <p>Không có hình ảnh</p>
                    )}
                  </div>
                  {loadedAppointmentDetail.AppointmentStatus === 'PEND' && (
                    <div className="user-appointment-form-detail-bottom">
                      <button
                        className="cancel-app"
                        type="button"
                        onClick={() => this.handleCancelAppointment(loadedAppointmentDetail.AppointmentID)}
                        disabled={disabledButtons.cancelAppointment}
                      >
                        Hủy đặt lịch
                      </button>
                    </div>
                  )}
                </div>
                <div className="notes">
                  <b>Ghi chú:</b> <p>{loadedAppointmentDetail.Notes || 'Không có ghi chú'}</p>
                </div>
              </div>
            </div>
          </form>
        );
      case 7:
        return (
          <form className="user-pet-form">
            <div className="user-pet-form-top">
              <h3>
                <b>Thông tin thú cưng:</b>
              </h3>
              {loadedPetInfo.length < limitPetCount && (
                <button
                  type="button"
                  onClick={this.handleAddPet}
                  disabled={disabledButtons.addPet}
                >
                  Thêm thú cưng
                </button>
              )}
            </div>
            <div className="user-pet-form-content">
              <div className="user-pet-form-content-list">
                {loadedPetInfo.length > 0 ? (
                  loadedPetInfo.map((pet, index) => (
                    <div key={pet.PetID} className="user-pet-form-content-list-item f sb">
                      <div className="f">
                        <div className="user-pet-form-content-list-item-top-1 ">
                          {isEditingPet === index ? (
                            <input className="petname" type="text" value={pet.PetName} onChange={(e) => this.handlePetChange(index, 'PetName', e.target.value)} placeholder="Tên thú cưng" />
                          ) : (
                            <div className="f">
                              <b>Tên thú cưng: </b>
                              {pet.PetName}
                            </div>
                          )}
                        </div>
                        <div className="petype f">
                          <b>Giống:</b>
                          {isEditingPet === index ? (
                            <select value={pet.PetType} onChange={(e) => this.handlePetChange(index, 'PetType', e.target.value)}>
                              {codePetType.map((type) => (
                                <option key={type.Code} value={type.Code}>
                                  {type.CodeValueVI}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p>{codePetType.find((type) => type.Code === pet.PetType)?.CodeValueVI || pet.PetType}</p>
                          )}
                        </div>
                        <div className="petweight f">
                          <b>Cân nặng (kg):</b>
                          {isEditingPet === index ? <input type="number" value={pet.PetWeight} onChange={(e) => this.handlePetChange(index, 'PetWeight', e.target.value)} placeholder="Cân nặng" /> : <p>{pet.PetWeight}</p>}
                        </div>
                        <div className="petold f">
                          <b>Tuổi (Tháng):</b>
                          {isEditingPet === index ? <input type="number" value={pet.Age} onChange={(e) => this.handlePetChange(index, 'Age', e.target.value)} placeholder="Tuổi" /> : <p>{pet.Age}</p>}
                        </div>
                        <div className="petgender f">
                          <b>Giới tính:</b>
                          {isEditingPet === index ? (
                            <select value={pet.PetGender} onChange={(e) => this.handlePetChange(index, 'PetGender', e.target.value)}>
                              {codePetGender.map((gender) => (
                                <option key={gender.Code} value={gender.Code}>
                                  {gender.CodeValueVI}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p>{codePetGender.find((gender) => gender.Code === pet.PetGender)?.CodeValueVI || pet.PetGender}</p>
                          )}
                        </div>
                      </div>
                      <div className="f">
                        {isEditingPet === index ? (
                          <>
                            <button
                              type="button"
                              className="save-pet"
                              onClick={() => this.handleSavePet(index)}
                              disabled={this.state.disabledButtons.savePet}
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              className="cancel-pet"
                              onClick={this.handleCancelPet}
                              disabled={disabledButtons.cancelPet}
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="edit-pet" onClick={() => this.handleEditPet(index)} disabled={isEditingPet !== null || isAddingPet}>
                              <IonIcon icon={pencil}></IonIcon>
                            </button>
                            <button
                              type="button"
                              className="delete-pet"
                              onClick={() => this.handleDeletePet(pet.PetID)}
                              disabled={this.state.disabledButtons.deletePet}
                            >
                              <b>X</b>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có thú cưng nào.</p>
                )}
              </div>
            </div>
          </form>
        );
      case 8:
        return (
          <form className="user-add-pet-form">
            <div className="user-add-pet-form-top">
              <h3>
                <b>Thêm thú cưng:</b>
              </h3>
              <button type='button' onClick={this.handleFormThuCung}>Hủy</button>
            </div>
            <div className="user-add-pet-form-content">
              <div>
                <input type="text" placeholder="Hãy nhập tên thú cưng" value={loadedPetInfo[0]?.PetName || ''} onChange={(e) => this.handlePetChange(0, 'PetName', e.target.value)} />
                <select value={loadedPetInfo[0]?.PetGender || codePetGender[0]?.Code} onChange={(e) => this.handlePetChange(0, 'PetGender', e.target.value)}>
                  {codePetGender.map((gender) => (
                    <option key={gender.Code} value={gender.Code}>
                      {gender.CodeValueVI}
                    </option>
                  ))}
                </select>
                <input type="number" placeholder="Hãy nhập cân nặng" value={loadedPetInfo[0]?.PetWeight || ''} onChange={(e) => this.handlePetChange(0, 'PetWeight', e.target.value)} />
                <input type="number" placeholder="Hãy nhập tuổi" value={loadedPetInfo[0]?.Age || ''} onChange={(e) => this.handlePetChange(0, 'Age', e.target.value)} />
                <select value={loadedPetInfo[0]?.PetType || codePetType[0]?.Code} onChange={(e) => this.handlePetChange(0, 'PetType', e.target.value)}>
                  {codePetType.map((type) => (
                    <option key={type.Code} value={type.Code}>
                      {type.CodeValueVI}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type='button'
                onClick={() => this.handleSavePet(0)}
                disabled={disabledButtons.savePet}
              >
                Thêm
              </button>
            </div>
          </form>
        );
      case 9:
        if (!loadedAppointmentBillDetail) {
          return (
            <div>
              <div className="back" onClick={this.handleFormDatLich}>
                <IonIcon icon={chevronBackOutline}></IonIcon>
                <h5>
                  <b>Trở lại</b>
                </h5>
              </div>
              <p>Không thể tải chi tiết hóa đơn lịch khám. Vui lòng thử lại!</p>
            </div>
          );
        }
        return (
          <form className="user-appointment-form-detail">
            <div className="user-appointment-form-detail-top">
              <div className="user-appointment-form-detail-left">
                <div className="back" onClick={this.handleFormDatLich}>
                  <IonIcon icon={chevronBackOutline}></IonIcon>
                  <h5>
                    <b>Trở lại</b>
                  </h5>
                </div>
              </div>
              <div className="user-appointment-form-detail-right">
                <div className="appointment-detail-tab">
                  <div className="mlk">
                    <h5>Mã hóa đơn:</h5>
                  </div>
                  <div className="ctmd">
                    <h5>{loadedAppointmentBillDetail.AppointmentBill.AppointmentBillID}</h5>
                  </div>
                </div>
                <div className="tt">
                  <h5 style={{ color: '#008000' }}>{codeAppointmentStatus?.find((status) => status.Code === loadedAppointmentBillDetail.AppointmentStatus)?.CodeValueVI || loadedAppointmentBillDetail.AppointmentStatus}</h5>
                </div>
              </div>
            </div>
            <div className="user-appointment-form-detail-mid-1">
              <h4>*Thông tin khách hàng:</h4>
              <div className="sb">
                <div className="user-appointment-form-detail-mid-1-left-info">
                  <div className="f">
                    <b>Tên khách hàng:</b> <p>{loadedAppointmentBillDetail.CustomerName}</p>
                  </div>
                  <div className="f">
                    <b>Tên thú cưng:</b> <p>{loadedAppointmentBillDetail.Pet.PetName}</p>
                  </div>
                  <div className="f">
                    <b>Loại thú cưng:</b> <p>{codePetType.find((type) => type.Code === loadedAppointmentBillDetail.Pet.PetType)?.CodeValueVI || 'N/A'}</p>
                  </div>
                  <div className="f">
                    <b>Giới tính:</b> <p>{codePetGender.find((gender) => gender.Code === loadedAppointmentBillDetail.Pet.PetGender)?.CodeValueVI || 'N/A'}</p>
                  </div>
                </div>
                <div className="user-appointment-form-detail-mid-1-right-info">
                  <div className="f">
                    <b>Dịch vụ:</b> <p>{loadedAppointmentBillDetail.Service.ServiceName}</p>
                  </div>
                  <div className="f">
                    <b>Bác sĩ:</b> <p>{loadedAppointmentBillDetail.VeterinarianName || 'Chưa chỉ định'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="user-appointment-form-detail-mid-2">
              <h4>*Thông tin hóa đơn:</h4>
              <div className="sb">
                <div className="user-appointment-form-detail-mid-2-left">
                  <div className="f">
                    <b>Ngày khám:</b>
                    <p>
                      {this.getDayOfWeek(new Date(loadedAppointmentBillDetail.AppointmentDate))}, {new Date(loadedAppointmentBillDetail.AppointmentDate).toLocaleDateString('vi-VN')} {loadedAppointmentBillDetail.StartTime} đến {loadedAppointmentBillDetail.EndTime}
                    </p>
                  </div>
                  <div className="f">
                    <b>Phí dịch vụ:</b>
                    <p>{parseFloat(loadedAppointmentBillDetail.AppointmentBill.ServicePrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                  </div>
                  <div className="f">
                    <b>Phí dược phẩm:</b>
                    <p>{parseFloat(loadedAppointmentBillDetail.AppointmentBill.MedicalPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                  </div>
                  <div className="f">
                    <b>Tổng thanh toán:</b>
                    <p style={{ fontSize: '18px', color: '#d32f2f' }}>{parseFloat(loadedAppointmentBillDetail.AppointmentBill.TotalPayment).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                  </div >
                  <div className="user-appointment-form-detail-bottom">
                    <button type="button" onClick={() => this.handleGeneratePDF(loadedAppointmentBillDetail, 3)} className="pdf-btn">
                      Tải PDF
                    </button>
                    <button type="button" onClick={() => this.handleSendEmail(loadedAppointmentBillDetail.AppointmentBill.AppointmentBillID, 3)} className="email-btn">
                      Gửi qua email
                    </button>
                  </div>
                </div>
                <div className="user-appointment-form-detail-mid-2-center-label">
                  <b>*Ghi chú của bác sĩ:</b>
                  <br />
                  <label>{loadedAppointmentBillDetail.AppointmentBill.MedicalNotes || 'Không có ghi chú'}</label>
                </div>
                <div className="user-appointment-form-detail-mid-2-right">{loadedAppointmentBillDetail.AppointmentBill.MedicalImage ? <img src={loadedAppointmentBillDetail.AppointmentBill.MedicalImage} alt="Hóa đơn" style={{ maxWidth: '200px' }} /> : <p>Không có hình ảnh hóa đơn</p>}</div>
              </div>
            </div>
          </form>
        );
      default:
        return null;
    }
  }
  render() {
    const { actionPage, isLoading, isShowCancelInvoiceModal, selectedCancelInvoice, accountInfo } = this.state;
    return (
      <div className="user-page">
        <Header navigate={this.props.navigate} userInfo={this.props.userInfo} triggerLoadInformation={this.state.triggerLoadInformation} />
        <CancelInvoiceModal isOpen={isShowCancelInvoiceModal} toggleFromModal={this.toggleCancelInvoiceModal} selectedCancelInvoiceID={selectedCancelInvoice} handleCancelInvoiceFromModal={this.handleCancelInvoiceFromModal} />
        <ToastContainer
          autoClose={500}
          newestOnTop={true}
          closeOnClick={false}
          pauseOnFocusLoss={false}
          draggable={true}
          transition={Slide}
          limit={1}
        />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="user-container">
            <div className="user-action-form">
              <div className={`user-action-info ${actionPage === 1 ? 'active' : ''}`} onClick={this.handleFormHoSoNguoiDung}>
                Hồ sơ người dùng
              </div>
              {accountInfo?.AccountType !== "V" && (
                <div className={`user-action-pet ${actionPage === 7 ? 'active' : ''}${actionPage === 6 ? 'active' : ''}`} onClick={this.handleFormThuCung}>
                  Thông tin thú cưng
                </div>
              )}
              <div className={`user-action-cart ${actionPage === 2 ? 'active' : ''}${actionPage === 4 ? 'active' : ''}`} onClick={this.handleFormLichSuDonHang}>
                Lịch sử đơn hàng
              </div>
              {accountInfo?.AccountType !== "V" && (
                <div className={`user-action-apointment ${actionPage === 5 ? 'active' : ''}${actionPage === 9 ? 'active' : ''}`} onClick={this.handleFormDatLich}>
                  Lịch Khám
                </div>
              )}
              <div className={`user-action-change-pw ${actionPage === 3 ? 'active' : ''}`} onClick={this.handleFormDoiMatKhau}>
                Đổi mật khẩu
              </div>
            </div>
            <div className="user-form">{this.renderForm()}</div>
          </div>
        )}
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});
const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(User);