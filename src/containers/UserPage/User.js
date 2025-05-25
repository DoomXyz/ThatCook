import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';

import { eyeOutline, eyeOffOutline, chevronBack, pencil } from 'ionicons/icons';

import './User.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

import { handleGetAccountInfoApi, handleLogoutApi, handleChangeAccountInfoApi, handleChangePasswordApi } from '../../services/accountServices';
import { handleGetAccountInvoiceInfoApi, handleGetInvoiceDetailInfoApi, handleChangeInvoiceStatusApi } from '../../services/invoiceServices';
import { handleLoadAppointmentInfoApi, handleLoadAppointmentDetailsApi, handleChangeAppointmentStatusApi, handleGetAppointmentBillDetailApi } from '../../services/appointmentServices';
import { handleGetServiceInfoApi } from '../../services/serviceServices';

import { handleGetAccountPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi, handleRemovePetApi } from '../../services/petServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';

import { userLogin, userLogout } from '../../store/actions';
import { checkLoginStatus, uploadImages } from '../../utils/pakage';

import CancelInvoiceModal from '../../components/CancelInvoiceModal';

const defUserImage = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg';

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Authentication & General
      isLoading: true,
      isLoggedIn: false,
      accountid: '',
      triggerLoadInformation: false,
      // User Info
      actionPage: 1,
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

      // Password Change
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,

      // Data Lists
      loadedInvoiceInfo: [],
      loadedInvoiceDetail: null,
      loadedAppointmentInfo: [],
      loadedAppointmentDetail: null,
      loadedAppointmentBillDetail: null,
      loadedPetInfo: [],
      serviceList: [],

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
      totalInvoicePages: 1,
      limitProductPerQuery: 7,
      totalProductPages: 1,
      limitAppointmentPerQuery: 5,
      totalAppointmentPages: 1,

      // Filtering & Sorting
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      date1: '',
      date2: '',

      // Modals & Selections
      isShowCancelInvoiceModal: false,
      selectedCancelInvoice: null,
      selectedInvoiceID: null,
      selectedAppointment: null,

      // Pet Management
      isEditingPet: null,
      isAddingPet: false,
      limitPetCount: 3,
    };
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await Promise.all([this.handleLoadAllCodes(), this.handleLoadServiceInfo()]);
    if (this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        const { accountid } = this.state;
        this.loadAccountInfo(accountid);
        this.loadInvoiceInfo(accountid);
        this.loadPetInfo(accountid);
        this.loadAppointmentInfo(accountid);
        this.setState({ isLoading: false });
      }, 10);
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        this.loadAccountInfo();
        this.loadInvoiceInfo();
      }, 10);
    }
  }
  componentWillUnmount() {
    if (this.state.imageInfo?.Image && this.state.imageInfo?.file) {
      URL.revokeObjectURL(this.state.imageInfo.Image);
    }
  }
  handleIsLogin = async () => {
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          isLoggedIn: true,
          accountid: accountInfo.AccountID,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          isLoggedIn: false,
          accountid: '',
        });
        this.props.navigate('/login');
      }
    } catch (e) {
      this.props.navigate('/login');
      console.log('Token not found!');
    }
  };
  triggerLoadInformation = () => {
    this.setState((prevState) => ({
      triggerLoadInformation: !prevState.triggerLoadInformation,
    }));
  };
  handleLoadAllCodes = async () => {
    try {
      const codeTypes = ['Gender', 'PaymentType', 'ShippingMethod', 'PaymentStatus', 'ShippingStatus', 'PetType', 'PetGender', 'AppointmentStatus', 'AppointmentType'];
      const responses = await Promise.all(codeTypes.map((type) => handleGetAllCodesApi(type)));
      const codeData = {
        codeGender: [],
        codePaymentType: [],
        codeShippingMethod: [],
        codePaymentStatus: [],
        codeShippingStatus: [],
        codePetType: [],
        codePetGender: [],
        codeAppointmentStatus: [],
        codeAppointmentType: [],
      };
      responses.forEach((response, index) => {
        const type = codeTypes[index];
        if (response && response.length > 0) {
          codeData[`code${type}`] = response;
        } else {
          toast.error(`Không thể tải danh sách ${type.toLowerCase()}!`, {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        }
      });
      this.setState({
        ...codeData,
        gender: codeData.codeGender.length > 0 ? codeData.codeGender[0].Code : '',
      });
    } catch (e) {
      console.error('Error loading codes:', e);
      toast.error('Lỗi khi tải danh sách mã!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadServiceInfo = async () => {
    try {
      const responseApi = await handleGetServiceInfoApi('ALL');
      const response = responseApi.data;
      if (response.errCode !== 0 || !response.data || response.data.length === 0) {
        toast.error(response.errMessage || 'Không thể tải danh sách dịch vụ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({ serviceList: [] });
        return;
      }
      this.setState({ serviceList: response.data });
    } catch (e) {
      toast.error('Lỗi khi tải danh sách dịch vụ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  loadAccountInfo = async (accountid) => {
    try {
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
      } else {
        toast.error('Bạn đã được đăng xuất!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải tài khoản:', e);
      toast.error('Lỗi khi tải tài khoản!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  loadPetInfo = async (accountid) => {
    try {
      const response = await handleGetAccountPetInfoApi(accountid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedPetInfo: response.data || [],
        });
      } else {
        toast.error('Không thể tải danh sách thú cưng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách thú cưng:', e);
      toast.error('Lỗi khi tải danh sách thú cưng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  loadInvoiceInfo = async (accountid) => {
    try {
      const response = await handleGetAccountInvoiceInfoApi(accountid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedInvoiceInfo: response.data,
          totalInvoicePages: Math.ceil(response.data.length / this.state.limitInvoicePerQuery),
        });
      } else {
        toast.error('Tải thông tin đơn hàng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải thông tin đơn hàng:', e);
      toast.error('Lỗi khi tải thông tin đơn hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  loadAppointmentInfo = async (accountid) => {
    const { currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2 } = this.state;
    try {
      this.setState({ isLoading: true });
      const response = await handleLoadAppointmentInfoApi(accountid, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2);
      if (response && response.errCode === 0) {
        this.setState({
          loadedAppointmentInfo: response.data,
          totalAppointmentPages: Math.ceil(response.totalItems / limitAppointmentPerQuery),
        });
      } else {
        toast.error(response?.errMessage || 'Không thể tải danh sách lịch hẹn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách lịch hẹn:', e);
      toast.error('Lỗi khi tải danh sách lịch hẹn!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
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
        toast.error(response?.errMessage || 'Không thể tải chi tiết lịch hẹn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải chi tiết lịch hẹn:', e);
      toast.error('Lỗi khi tải chi tiết lịch hẹn!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleLoadAppointmentBillDetail = async (appointmentbillid) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleGetAppointmentBillDetailApi(appointmentbillid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedAppointmentBillDetail: response.data,
        });
      } else {
        toast.error(response?.errMessage || 'Không thể tải chi tiết hóa đơn lịch hẹn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải chi tiết hóa đơn lịch hẹn:', e);
      toast.error('Lỗi khi tải chi tiết hóa đơn lịch hẹn!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };

  handleUpdateAccountInfo = async (e) => {
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
        toast.info('Đang tải ảnh, vui lòng chờ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }
      this.setState({ isUploading: true, isLoading: true });
      try {
        const uploadResult = await uploadImages([imageInfo]); // Gửi mảng 1 phần tử
        if (!uploadResult.status) {
          toast.error(uploadResult.error || 'Tải ảnh thất bại!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
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
        toast.error('Lỗi khi tải ảnh!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
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
      toast.error('Tên tài khoản không hợp lệ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      this.loadAccountInfo(accountid);
      return;
    }
    const phoneNumber = updateInfo.phone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Số điện thoại không hợp lệ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      this.loadAccountInfo(accountid);
      return;
    }
    if (hasChanges) {
      let response = await handleChangeAccountInfoApi(updateInfo);
      if (response && response.errCode === 0) {
        toast.success('Cập nhật thông tin thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.triggerLoadInformation();
      } else {
        toast.error(response.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.loadAccountInfo(accountid);
      }
    }
    this.setState({ editField: null, originalValue: '' });
  };
  handleChangePassword = async (e) => {
    e.preventDefault();
    const { accountid, oldPassword, newPassword, confirmPassword } = this.state;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận không khớp!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    const checkNewPassword = newPassword.trim();
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(checkNewPassword)) {
      toast.error('Mật khẩu mới không hợp lệ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    try {
      this.setState({ isLoading: true });
      const response = await handleChangePasswordApi(accountid, oldPassword, newPassword);
      if (response && response.errCode === 0) {
        toast.success('Đổi mật khẩu thành công, hãy đăng nhập lại với mật khẩu mới', {
          position: 'top-right',
          autoClose: 1000,
          closeOnClick: true,
        });
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
        toast.error(response.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      toast.error('Đổi mật khẩu thất bại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleConfirmReceived = async (invoiceid) => {
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
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
        toast.success('Xác nhận nhận hàng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.loadInvoiceInfo(this.state.accountid);
      } else {
        const errMessage = response?.errMessage || 'Xác nhận nhận hàng thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error confirming received:', e);
      toast.error('Xảy ra lỗi khi xác nhận nhận hàng, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleContinueInvoice = async (invoiceid) => {
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
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
        toast.success('Tiếp tục đơn hàng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.loadInvoiceInfo(this.state.accountid);
      } else {
        const errMessage = response?.errMessage || 'Tiếp tục đơn hàng thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error continuing invoice:', e);
      toast.error('Xảy ra lỗi khi tiếp tục đơn hàng, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleCancelAppointment = async (appointmentid) => {
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });
    const isConfirmed = await confirmCancel();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeAppointmentStatusApi(appointmentid, 'CANCELED', null);
      if (response && response.errCode === 0) {
        toast.success('Hủy lịch hẹn thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.loadAppointmentInfo(this.state.accountid);
      } else {
        toast.error(response?.errMessage || 'Hủy lịch hẹn thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Lỗi khi hủy lịch hẹn:', e);
      toast.error('Xảy ra lỗi khi hủy lịch hẹn, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleSavePet = async (index) => {
    const validation = this.checkValidatePet(index);
    if (validation.errCode !== 0) {
      toast.error(validation.errMessage, {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    this.setState({ isLoading: true });
    try {
      const pet = this.state.loadedPetInfo[index];
      const petInfo = {
        petname: pet.PetName.trim(),
        pettype: pet.PetType,
        petgender: pet.PetGender,
        age: parseInt(pet.Age),
        petweight: parseFloat(pet.PetWeight),
      };
      let response;
      if (this.state.isAddingPet) {
        response = await handleSavePetInfoApi(this.state.accountid, petInfo);
      } else {
        response = await handleChangePetInfoApi(pet.PetID, petInfo);
      }

      if (response && response.errCode === 0) {
        toast.success(this.state.isAddingPet ? 'Tạo thú cưng thành công!' : 'Cập nhật thú cưng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.loadPetInfo(this.state.accountid);
        this.setState({
          isEditingPet: null,
          isAddingPet: false,
        });
      } else {
        toast.error(response?.errMessage || (this.state.isAddingPet ? 'Tạo thú cưng thất bại!' : 'Cập nhật thú cưng thất bại!'), {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error(this.state.isAddingPet ? 'Create Pet:' : 'Edit Pet:', e);
      toast.error(`Lỗi khi ${this.state.isAddingPet ? 'tạo' : 'cập nhật'} thú cưng, vui lòng thử lại!`, {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleDeletePet = async (petid) => {
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });
    const isConfirmed = await confirmDelete();
    if (isConfirmed) {
      this.setState({ isLoading: true });
      const response = await handleRemovePetApi(petid);
      if (response && response.errCode === 0) {
        toast.success('Xóa thú cưng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.loadPetInfo(this.state.accountid);
      } else {
        toast.error('Xóa thú cưng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ isLoading: false });
    }
  };

  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
    this.setState({
      imageInfo: { ImageID: Date.now(), Image: preview, file },
    });
  };
  handleEditClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state[field], // Lưu giá trị ban đầu của trường
    });
  };
  handleAccountInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gender' && this.state.editField !== 'gender') {
      this.setState({
        editField: 'gender',
        originalValue: this.state.gender, // Lưu giá trị ban đầu của gender
      });
    }
    this.setState({
      [name]: value,
    });
  };
  handleChangePasswordInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  toggleShowPassword = (field) => {
    this.setState((prevState) => ({
      [field]: !prevState[field],
    }));
  };

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
          switch (type) {
            case 'appointment':
              this.loadAppointmentInfo(this.state.accountid);
              break;
            default:
              break;
          }
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
        switch (type) {
          case 'appointment':
            this.loadAppointmentInfo(this.state.accountid);
            break;
          default:
            break;
        }
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
        switch (type) {
          case 'appointment':
            this.loadAppointmentInfo(this.state.accountid);
            break;
          default:
            break;
        }
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
        switch (type) {
          case 'appointment':
            this.loadAppointmentInfo(this.state.accountid);
            break;
          default:
            break;
        }
      }
    );
  };
  handlePageChange = (page, type) => {
    this.setState({ isLoading: true });
    const { totalInvoicePages, totalProductPages, totalAppointmentPages } = this.state;
    let totalPages;
    let limitPerQuery;
    switch (type) {
      case 'invoice':
        totalPages = totalInvoicePages;
        limitPerQuery = this.state.limitInvoicePerQuery;
        break;
      case 'product':
        totalPages = totalProductPages;
        limitPerQuery = this.state.limitProductPerQuery;
        break;
      case 'appointment':
        totalPages = totalAppointmentPages;
        limitPerQuery = this.state.limitAppointmentPerQuery;
        break;
      default:
        totalPages = 1;
        limitPerQuery = 10;
    }
    let newPage = page;
    if (isNaN(page) || page <= 0) {
      newPage = 1;
    } else if (page > totalPages) {
      newPage = totalPages;
    }
    this.setState(
      {
        isLoading: false,
        currentPage: newPage,
        tempCurrentPage: newPage.toString(),
      },
      () => {
        switch (type) {
          case 'invoice':
            this.loadInvoiceInfo(this.state.accountid);
            break;
          case 'appointment':
            this.loadAppointmentInfo(this.state.accountid);
            break;
          default:
            break;
        }
      }
    );
  };
  handlePrevPage = (type) => {
    this.setState(
      (prevState) => {
        const newPage = Math.max(1, prevState.currentPage - 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      },
      () => {
        switch (type) {
          case 'invoice':
            this.loadInvoiceInfo(this.state.accountid);
            break;
          case 'appointment':
            this.loadAppointmentInfo(this.state.accountid);
            break;
          default:
            break;
        }
      }
    );
  };
  handleNextPage = (type) => {
    this.setState(
      (prevState) => {
        const newPage = Math.min(type === 'invoice' ? prevState.totalInvoicePages : type === 'product' ? prevState.totalProductPages : prevState.totalAppointmentPages, prevState.currentPage + 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      },
      () => {
        switch (type) {
          case 'invoice':
            this.loadInvoiceInfo(this.state.accountid);
            break;
          case 'appointment':
            this.loadAppointmentInfo(this.state.accountid);
            break;
          default:
            break;
        }
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
  getDayOfWeek = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };
  checkValidatePet = (index) => {
    const item = this.state.loadedPetInfo[index];
    if (!item.PetName) return { errCode: -1, errMessage: `Tên thú cưng không được để trống!` };
    const petNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!petNameRegex.test(item.PetName.trim())) return { errCode: -1, errMessage: `Tên thú cưng không hợp lệ (2-50 ký tự)!` };
    if (!item.PetType) return { errCode: -1, errMessage: `Loại thú cưng không được để trống!` };
    if (!item.PetGender) return { errCode: -1, errMessage: `Giới tính thú cưng không được để trống!` };
    if (!item.Age || isNaN(item.Age) || parseInt(item.Age) < 0 || parseInt(item.Age) > 999) return { errCode: -1, errMessage: `Tuổi thú cưng không hợp lệ (0-999)!` };
    if (!item.PetWeight || isNaN(item.PetWeight) || parseFloat(item.PetWeight) <= 0 || parseFloat(item.PetWeight) > 999.99) return { errCode: -1, errMessage: `Cân nặng thú cưng không hợp lệ (0.01-999.99)!` };
    return { errCode: 0, errMessage: 'Kiểm tra thành công!' };
  };
  handleAddPet = () => {
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
            { position: 'top-center', autoClose: 2000, closeOnClick: false }
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
              await this.loadPetInfo(this.state.accountid);
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
  };
  handleEditPet = (index) => {
    if (this.state.isAddingPet || this.state.isEditingPet !== null) {
      toast.error('Vui lòng lưu hoặc hủy hành động hiện tại trước khi chỉnh sửa thú cưng khác!', {
        position: 'top-right',
        autoClose: 1000,
        closeOnClick: true,
      });
      return;
    }
    this.setState({ isEditingPet: index, isAddingPet: false });
  };
  handlePetChange = (index, field, value) => {
    this.setState((prevState) => {
      const newPets = [...prevState.loadedPetInfo];
      newPets[index] = { ...newPets[index], [field]: value };
      return { loadedPetInfo: newPets };
    });
  };
  handleCancelPet = () => {
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
          { position: 'top-center', autoClose: 2000, closeOnClick: false }
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
            await this.loadPetInfo(this.state.accountid);
          }
        );
      }
    });
  };

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
    try {
      const response = await handleGetInvoiceDetailInfoApi(invoiceid);
      if (response && response.errCode === 0) {
        this.setState({
          actionPage: 4,
          selectedInvoiceID: invoiceid,
          loadedInvoiceDetail: response.data,
          totalProductPages: Math.ceil(response.data.ProductList.length / this.state.limitProductPerQuery),
          currentPage: 1,
          tempCurrentPage: '1',
        });
      } else {
        toast.error(response.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      this.setState({
        actionPage: 4,
        selectedInvoiceID: invoiceid,
        loadedInvoiceDetail: null,
        currentPage: 1,
        tempCurrentPage: '1',
      });
      toast.error('Lỗi khi lấy chi tiết đơn hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleFormChiTietLichKham = async (appointmentid) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleLoadAppointmentDetailsApi(appointmentid);
      if (response && response.errCode === 0) {
        if (response.data.AppointmentStatus === 'COMP' && response.data.AppointmentBill) {
          // Lịch hẹn đã khám, gọi API lấy chi tiết hóa đơn
          await this.handleLoadAppointmentBillDetail(response.data.AppointmentBill.AppointmentBillID);
          this.setState({
            actionPage: 9, // Chuyển sang case 9 cho lịch hẹn đã khám
            selectedAppointmentID: appointmentid,
            loadedAppointmentDetail: response.data,
          });
        } else {
          // Lịch hẹn chưa khám
          this.setState({
            actionPage: 6, // Chuyển sang case 6 cho lịch hẹn chưa khám
            selectedAppointmentID: appointmentid,
            loadedAppointmentDetail: response.data,
            loadedAppointmentBillDetail: null, // Xóa dữ liệu hóa đơn nếu có
          });
        }
      } else {
        toast.error(response?.errMessage || 'Không thể tải chi tiết lịch hẹn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải chi tiết lịch hẹn:', e);
      toast.error('Lỗi khi tải chi tiết lịch hẹn!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };

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
        toast.success('Gửi yêu cầu hủy đơn hàng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.loadInvoiceInfo(this.state.accountid);
        this.setState({
          isShowCancelInvoiceModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Gửi yêu cầu hủy đơn hàng thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Edit:', e);
      toast.error('Xảy ra lỗi khi gửi yêu cầu hủy đơn hàng, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };

  handleSendEmail = (billid) => {
    toast.info('Tính năng gửi email chưa được hỗ trợ!', {
      position: 'top-right',
      autoClose: 500,
      closeOnClick: true,
    });
  };

  handleGeneratePDF = () => {
    toast.info('Tính năng tải PDF đang phát triển!', {
      position: 'top-right',
      autoClose: 500,
      closeOnClick: true,
    });
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
      totalProductPages,
      loadedAppointmentInfo,
      limitAppointmentPerQuery,
      totalAppointmentPages,
      filterValue,
      sortValue,
      date1,
      date2,
      serviceList,
      limitInvoicePerQuery,
      totalInvoicePages,
      loadedAppointmentBillDetail,
      currentPage,
      tempCurrentPage,
      showOldPassword,
      showNewPassword,
      showConfirmPassword,
      isAddingPet,
    } = this.state;
    switch (actionPage) {
      case 1:
        return (
          <form className="user-info-form" onSubmit={this.handleUpdateAccountInfo}>
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
                <div className="change-info-button" onSubmit={this.handleUpdateAccountInfo}>
                  <button> Cập nhật </button>
                </div>
              </div>
              <div className="user-content-right">
                <div className="user-content-right-img-content">
                  <div className="user-content-img-description">Ảnh đại diện</div>
                  <div className="user-content-img-info">{imageInfo ? <img src={imageInfo.Image} alt="Ảnh đại diện" /> : <img src={userimage || defUserImage} alt="Ảnh đại diện" />}</div>
                </div>
                <div className="user-content-img-button">
                  <input type="file" accept="image/*" id="upload-avatar" onChange={this.handleAddImage} />
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
              {totalInvoicePages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button className="first" onClick={() => this.handlePageChange(1, 'invoice')} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button className="prev" onClick={() => this.handlePrevPage('invoice')} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 'invoice')} onBlur={() => this.handlePageInputBlur('invoice')} />
                    <span className="total-pages">/ {totalInvoicePages}</span>
                    <button className="next" onClick={() => this.handleNextPage('invoice')} disabled={currentPage === totalInvoicePages}>
                      {'>'}
                    </button>
                    <button className="last" onClick={() => this.handlePageChange(totalInvoicePages, 'invoice')} disabled={currentPage === totalInvoicePages}>
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
                <IonIcon icon={chevronBack}></IonIcon>
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
                  <IonIcon icon={chevronBack}></IonIcon>
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
                <div className="descreption-user">Địa chỉ nhận hàng:</div>
                <div className="value-user">{loadedInvoiceDetail?.ReceiverAddress || 'N/A'}</div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">Tên người nhận hàng:</div>
                <div className="value-user">{loadedInvoiceDetail?.ReceiverName || 'N/A'}</div>
              </div>
              <div className="user-info-tab">
                <div className="descreption-user">SĐT nhận hàng:</div>
                <div className="value-user">{loadedInvoiceDetail?.ReceiverPhone || 'N/A'}</div>
              </div>
            </div>
            <div className="user-cart-form-info-list-item">
              {loadedInvoiceDetail?.ProductList?.length > 0 ? (
                paginatedProductList.map((item, index) => (
                  <div key={index} className="user-cart-form-info-list-item-row">
                    <div className="user-cart-form-info-list-item-left">
                      <div className="img-product">
                        <img src={item?.ProductImage || ''} alt="Product" style={{ width: '100px', height: '100px' }} />
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
            {totalProductPages > 1 && (
              <div className="page-content">
                <div className="page-content-item">
                  <button className="first" onClick={() => this.handlePageChange(1, 'product')} disabled={currentPage === 1}>
                    {'<<'}
                  </button>
                  <button className="prev" onClick={() => this.handlePrevPage('product')} disabled={currentPage === 1}>
                    {'<'}
                  </button>
                  <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 'product')} onBlur={() => this.handlePageInputBlur('product')} />
                  <span className="total-pages">/ {totalProductPages}</span>
                  <button className="next" onClick={() => this.handleNextPage('product')} disabled={currentPage === totalProductPages}>
                    {'>'}
                  </button>
                  <button className="last" onClick={() => this.handlePageChange(totalProductPages, 'product')} disabled={currentPage === totalProductPages}>
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
                <select value={filterValue} onChange={(e) => this.handleFilter(e.target.value, 'appointment')}>
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
                <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 'appointment')}>
                  <option value="0">Mặc định</option>
                  <option value="1">Mới nhất</option>
                  <option value="2">Cũ nhất</option>
                </select>
              </div>
              <div className="appointment-search">
                <input type="text" placeholder="Nhập tên dịch vụ hoặc thú cưng" value={searchValue} onChange={(event) => this.handleSearchChange(event, 'appointment')} />
              </div>
              <div className="appointment-date-filter ">
                <div className="f">
                  <div>
                    <DatePicker
                      selected={date1 ? new Date(date1 + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                        this.setState({ date1: formattedDate }, () => {
                          this.handleFilter('ALL', 'appointment');
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                    />
                    {date1 && (
                      <button onClick={() => this.resetDateFilter('date1', 'appointment')} style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
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
                          this.handleFilter('ALL', 'appointment');
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                    />
                    {date2 && (
                      <button
                        onClick={() => this.resetDateFilter('date2', 'appointment')} // Thêm type
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
                            onClick={(e) => {
                              e.stopPropagation();
                              this.handleCancelAppointment(appointment.AppointmentID);
                            }}
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
              {totalAppointmentPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button className="first" onClick={() => this.handlePageChange(1, 'appointment')} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button className="prev" onClick={() => this.handlePrevPage('appointment')} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 'appointment')} onBlur={() => this.handlePageInputBlur('appointment')} />
                    <span className="total-pages">/ {totalAppointmentPages}</span>
                    <button className="next" onClick={() => this.handleNextPage('appointment')} disabled={currentPage === totalAppointmentPages}>
                      {'>'}
                    </button>
                    <button className="last" onClick={() => this.handlePageChange(totalAppointmentPages, 'appointment')} disabled={currentPage === totalAppointmentPages}>
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
                <IonIcon icon={chevronBack}></IonIcon>
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
                  <IonIcon icon={chevronBack}></IonIcon>
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
                      <button className="cancel-app" type="button" onClick={() => this.handleCancelAppointment(loadedAppointmentDetail.AppointmentID)}>
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
                <button type="button" onClick={this.handleAddPet}>
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
                        <div className="user-pet-form-content-list-item-top-1">{isEditingPet === index ? <input className="petname" type="text" value={pet.PetName} onChange={(e) => this.handlePetChange(index, 'PetName', e.target.value)} placeholder="Tên thú cưng" /> : <b>Tên thú cưng: {pet.PetName}</b>}</div>
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
                            <button type="button" className="save-pet" onClick={() => this.handleSavePet(index)}>
                              Lưu
                            </button>
                            <button type="button" className="cancel-pet" onClick={this.handleCancelPet}>
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="edit-pet" onClick={() => this.handleEditPet(index)} disabled={isEditingPet !== null || isAddingPet}>
                              <IonIcon icon={pencil}></IonIcon>
                            </button>
                            <button type="button" className="delete-pet" onClick={() => this.handleDeletePet(pet.PetID)}>
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
              <button onClick={this.handleFormThuCung}>Hủy</button>
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
              <button onClick={() => this.handleSavePet(0)}>Thêm</button>
            </div>
          </form>
        );
      case 9:
        if (!loadedAppointmentBillDetail) {
          return (
            <div>
              <div className="back" onClick={this.handleFormDatLich}>
                <IonIcon icon={chevronBack}></IonIcon>
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
                  <IonIcon icon={chevronBack}></IonIcon>
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
              <h4>*Thông tin khách hàng</h4>
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
              <h4>*Thông tin hóa đơn</h4>
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
                  </div>
                  <div className="user-appointment-form-detail-bottom">
                    <button type="button" onClick={() => this.handleSendEmail(loadedAppointmentBillDetail.AppointmentBill.AppointmentBillID)} className="email-btn">
                      Gửi qua email
                    </button>
                    <button type="button" onClick={() => this.handleGeneratePDF()} className="pdf-btn">
                      Tải PDF
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
    const { actionPage, isLoading, isShowCancelInvoiceModal, selectedCancelInvoice } = this.state;
    return (
      <div className="user-page">
        <Header navigate={this.props.navigate} userInfo={this.props.userInfo} triggerLoadInformation={this.state.triggerLoadInformation} />
        <CancelInvoiceModal isOpen={isShowCancelInvoiceModal} toggleFromModal={this.toggleCancelInvoiceModal} selectedCancelInvoiceID={selectedCancelInvoice} handleCancelInvoiceFromModal={this.handleCancelInvoiceFromModal} />
        <ToastContainer />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="user-container">
            <div className="user-action-form">
              <div className={`user-action-info ${actionPage === 1 ? 'active' : ''}`} onClick={this.handleFormHoSoNguoiDung}>
                Hồ sơ người dùng
              </div>
              <div className={`user-action-pet ${actionPage === 7 ? 'active' : ''}||${actionPage === 6 ? 'active' : ''}`} onClick={this.handleFormThuCung}>
                Thông tin thú cưng
              </div>
              <div className={`user-action-cart ${actionPage === 2 ? 'active' : ''}||${actionPage === 4 ? 'active' : ''}`} onClick={this.handleFormLichSuDonHang}>
                Lịch sử đơn hàng
              </div>
              <div className={`user-action-apointment ${actionPage === 5 ? 'active' : ''}|| ${actionPage === 6 ? 'active' : ''}`} onClick={this.handleFormDatLich}>
                Lịch Khám
              </div>{' '}
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
