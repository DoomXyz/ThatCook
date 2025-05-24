import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';

import Spinner from '../../components/Spinner';
import DatePicker from 'react-datepicker';

import { pencil, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';

import './Doctor.scss'; // Import SCSS

import { handleLogoutApi, handleChangeAccountInfoApi, handleChangeWorkingStatusApi, handleGetVeterinarianInfoApi } from '../../services/accountServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { handleLoadScheduleApi, handleChangeScheduleStatusApi } from '../../services/scheduleServices';
import { handleLoadAppointmentsApi, handleChangeAppointmentStatusApi, handleLoadAppointmentDetailsApi, handleGetServiceInfoApi } from '../../services/appointmentServices'

import { userLogin, userLogout, saveAppointmentForCheckout } from '../../store/actions';
import { checkLoginStatus } from '../../utils/pakage';

import Header from '../../components/HomeHeader';

class Doctor extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startWeek = new Date(today);
    startWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      veterinarianid: '',
      veterinarianname: '',
      workingstatus: '',
      bio: '',
      specialization: '',
      actionPage: 1,
      editField: null,
      servicesList: [],
      originalValue: '',
      codeWorkingStatus: [],
      codeAppointmentStatus: [],
      codeScheduleStatus: [],
      codeAppointmentType: [],
      codePetType: [],
      codePetGender: [],
      serviceList: [],
      loadedPendingAppointments: [],
      loadedCompleteAppointments: [],
      loadedSchedules: [],
      currentPage: 1,
      tempCurrentPage: '1',
      limitAppointmentPerQuery: 5,
      totalAppointmentPages: 1,
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      date1: '',
      date2: '',
      selectedAppointment: null,
      loadedAppointmentDetail: null,
      fromForm: '',
      currentWeekStart: startWeek,
    };
  }
  async componentDidMount() {
    await Promise.all([
      this.handleIsLogin(),
      this.handleLoadCodeWorkingStatus(),
      this.handleLoadCodeAppointmentStatus(),
      this.handleLoadCodeScheduleStatus(),
      this.handleLoadCodeAppointmentType(),
      this.handleLoadCodePetType(),
      this.handleLoadCodePetGender(),
      this.handleLoadServiceInfo(),
    ]);
    if (this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        const { veterinarianid } = this.state;
        this.loadVeterinarianInfo(veterinarianid);
      }, 10);
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        const { veterinarianid } = this.state;
        this.loadVeterinarianInfo(veterinarianid);
      }, 10);
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
          veterinarianid: accountInfo.AccountID,
          veterinarianname: accountInfo.UserName,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          isLoggedIn: false,
          veterinarianid: '',
          veterinarianname: '',
        });
        this.props.navigate('/login');
      }
    } catch (e) {
      this.props.navigate('/login');
      console.log('Token not found!');
    }
  };
  handleLoadCodeWorkingStatus = async () => {
    try {
      const codeWorkingStatus = await handleGetAllCodesApi('WorkingStatus');
      if (!codeWorkingStatus || codeWorkingStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeWorkingStatus,
        workingstatus: codeWorkingStatus.length > 0 ? codeWorkingStatus[0].Code : '',
      });
    } catch (e) {
      console.log('Error loading workingstatus code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodeAppointmentStatus = async () => {
    try {
      const codeAppointmentStatus = await handleGetAllCodesApi('AppointmentStatus');
      if (!codeAppointmentStatus || codeAppointmentStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeAppointmentStatus,
      });
    } catch (e) {
      console.log('Error loading appointmentstatus code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodeScheduleStatus = async () => {
    try {
      const codeScheduleStatus = await handleGetAllCodesApi('ScheduleStatus');
      if (!codeScheduleStatus || codeScheduleStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeScheduleStatus,
      });
    } catch (e) {
      console.log('Error loading schedulestatus code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodeAppointmentType = async () => {
    try {
      const codeAppointmentType = await handleGetAllCodesApi('AppointmentType');
      if (!codeAppointmentType || codeAppointmentType.length === 0) {
        toast.error('Không thể tải danh sách trạng thái!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeAppointmentType,
      });
    } catch (e) {
      console.log('Error loading appointmenttype code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
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
      });
    } catch (e) {
      console.log('Error loading pettype code:', e);
      toast.error('Lỗi khi tải danh sách loại thú cưng!', {
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
        toast.error('Không thể tải danh sách giới tính thú cưng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePetGender,
      });
    } catch (e) {
      console.log('Error loading petgender code:', e);
      toast.error('Lỗi khi tải danh sách giới tính thú cưng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadServiceInfo = async () => {
    try {
      const response = await handleGetServiceInfoApi('ALL');
      if (response.errCode !== 0 || !response.data || response.data.length === 0) {
        toast.error(response.errMessage || 'Không thể tải danh sách dịch vụ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({
          serviceList: [],
        });
        return;
      }
      this.setState({
        serviceList: response.data,
      });
    } catch (e) {
      toast.error('Lỗi khi tải danh sách dịch vụ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleVeterinarianInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === 'workingstatus' && this.state.editField !== 'workingstatus') {
      this.setState({
        editField: 'workingstatus',
        originalValue: this.state.workingstatus,
      });
    }
    this.setState({
      [name]: value,
    });
  };
  handleChangeInfoClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state[field], // Lưu giá trị ban đầu của trường
    });
  };
  handleChangeVeterinarianInfo = async (e) => {
    e.preventDefault();
    const { editField, originalValue, veterinarianid, bio, specialization, workingstatus, servicesList } = this.state;
    let updateInfo = {
      accountid: veterinarianid,
      accounttype: "V"
    };
    const formattedServicesList = servicesList.map(service => service.ServiceID);
    updateInfo.veterinarianInfo = {
      bio: bio,
      specialization: specialization,
      workingstatus: workingstatus,
      selectedServicesList: formattedServicesList
    };
    let hasChanges = false;
    // Kiểm tra xem có thay đổi dữ liệu không
    if (editField) {
      const newValue = this.state[editField];
      if (originalValue !== newValue) {
        hasChanges = true;
      }
    }
    if (hasChanges) {
      let response = await handleChangeAccountInfoApi(updateInfo);
      if (response && response.errCode === 0) {
        toast.success('Cập nhật thông tin thành công!', {
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
        this.loadVeterinarianInfo(updateInfo.accountid);
      }
    }
    this.setState({ editField: null, originalValue: '' });
  };
  handleChangeWorkingStatus = async () => {
    const { workingstatus, veterinarianid } = this.state;
    const newStatus = workingstatus === 'WORK' ? 'LEAVE' : 'WORK';
    try {
      const response = await handleChangeWorkingStatusApi(veterinarianid, newStatus);
      if (response && response.errCode === 0) {
        this.setState({ workingstatus: newStatus });
      } else {
        toast.error('Lỗi khi cập nhật trạng thái!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi gọi API:', e);
      toast.error('Lỗi hệ thống khi cập nhật trạng thái!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  loadVeterinarianInfo = async (veterinarianid) => {
    try {
      this.setState({ isLoading: true });
      const response = await handleGetVeterinarianInfoApi(veterinarianid);
      if (response && response.errCode === 0) {
        const veterinarianInfo = response.data;
        this.setState({
          specialization: veterinarianInfo.Specialization,
          workingstatus: veterinarianInfo.WorkingStatus,
          bio: veterinarianInfo.Bio,
          servicesList: veterinarianInfo.services
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải thông tin bác sĩ:', e);
      toast.error('Lỗi khi tải thông tin!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleLoadPendingAppointments = async () => {
    const {
      veterinarianid,
      currentPage,
      limitAppointmentPerQuery,
      searchValue,
      filterValue,
      sortValue,
      date1,
      date2,
    } = this.state;
    this.setState({ isLoading: true });
    try {
      const response = await handleLoadAppointmentsApi(veterinarianid, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2, "PEND");
      if (response && response.errCode === 0) {
        this.setState({
          loadedPendingAppointments: response.data,
          totalAppointmentPages: Math.ceil(response.totalItems / limitAppointmentPerQuery),
        });
      } else {
        toast.error('Không thể tải danh sách lịch hẹn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải lịch hẹn:', e);
      toast.error('Lỗi hệ thống khi tải danh sách!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleLoadCompleteAppointments = async () => {
    const {
      veterinarianid,
      currentPage,
      limitAppointmentPerQuery,
      searchValue,
      filterValue,
      sortValue,
      date1,
      date2,
    } = this.state;
    this.setState({ isLoading: true });
    try {
      const response = await handleLoadAppointmentsApi(
        veterinarianid,
        currentPage,
        limitAppointmentPerQuery,
        searchValue,
        filterValue,
        sortValue,
        date1,
        date2,
        "COMP",
      );
      if (response && response.errCode === 0) {
        this.setState({
          loadedCompleteAppointments: response.data,
          totalAppointmentPages: Math.ceil(response.totalItems / limitAppointmentPerQuery),
        });
      } else {
        toast.error('Không thể tải danh sách lịch hẹn hoàn thành!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải lịch hẹn hoàn thành:', e);
      toast.error('Lỗi hệ thống khi tải danh sách!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleLoadSchedule = async () => {
    const { veterinarianid, currentWeekStart } = this.state;
    this.setState({ isLoading: true });
    try {
      const startDate = currentWeekStart.toISOString().split('T')[0];
      const response = await handleLoadScheduleApi(veterinarianid, startDate);
      if (response && response.errCode === 0) {
        this.setState({
          loadedSchedules: response.data,
        });
      } else {
        toast.error('Không thể tải lịch làm việc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải lịch làm việc:', e);
      toast.error('Lỗi hệ thống khi tải lịch làm việc!', {
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
        toast.error('Không thể tải chi tiết lịch hẹn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải chi tiết lịch hẹn:', e);
      toast.error('Lỗi hệ thống khi tải chi tiết lịch hẹn!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleChangeAppointmentStatus = async (appointmentid, status) => {
    const { veterinarianid, workingstatus } = this.state;
    let isConfirmed = false;
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Bạn có muốn {status === 'CONF' ? 'xác nhận' : 'hủy bỏ'} lịch hẹn này?</p>
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false, onClose: () => resolve(false) }
        );
      });
    isConfirmed = await confirmAction();
    if (isConfirmed) {
      if (workingstatus === "WORK")
        try {
          const response = await handleChangeAppointmentStatusApi(appointmentid, status, veterinarianid);
          if (response && response.errCode === 0) {
            if (status === "CONF") {
              toast.success('Xác nhận lịch hẹn thành công!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
              });
            } else {
              toast.success('Hủy lịch hẹn thành công!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
              });
            }
            this.handleLoadPendingAppointments();
            this.setState({
              actionPage: 2,
            })
          }
        } catch (e) {
          console.log('Lỗi khi cập nhât lịch hẹn:', e);
          toast.error('Lỗi hệ thống khi cập nhật lịch hẹn!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        }
      else {
        toast.info('Hãy bật trạng thái làm việc trước khi thao tác!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        })
      }
    }
  };
  handleChangeScheduleStatus = async (scheduleid, status) => {
    let isConfirmed = false;
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Bạn có muốn hủy bỏ lịch hẹn này?</p>
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false, onClose: () => resolve(false) }
        );
      });
    isConfirmed = await confirmAction();
    if (isConfirmed) {
      try {
        const response = await handleChangeScheduleStatusApi(scheduleid, status);
        if (response && response.errCode === 0) {
          toast.success(`Cập nhật thành công!`, {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          await this.handleLoadSchedule()
          this.setState({
            actionPage: 3
          })
        } else {
          toast.error(response.errMessage || 'Lỗi khi cập nhật lịch!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        }
      } catch (e) {
        console.log('Lỗi khi cập nhật lịch:', e);
        toast.error('Lỗi hệ thống khi cập nhật!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    }
  };
  handleViewBill = (billid) => {
    console.log(`View AppointmentBill ID: ${billid}`);
  };
  handleAppointmentCheckOut = (appointmentid) => {
    const { veterinarianid } = this.state
    const appointmentData = {
      veterinarianid,
      appointmentid,
    };
    this.props.saveAppointmentForCheckout(appointmentData);
    this.props.navigate('/appointmentcheckout');
  }
  resetDateFilter = (dateField) => {
    this.setState({ [dateField]: null }, () => {
      this.handleLoadPendingAppointments();
    });
  };
  handleFormHoSoBacSi = (e) => {
    e.preventDefault();
    const { veterinarianid } = this.state
    this.setState(
      {
        actionPage: 1,
        editField: null,
        originalValue: '',
      }, () => {
        this.loadVeterinarianInfo(veterinarianid);
      }
    );
  };
  handleFormXacNhanLichKham = (e) => {
    e.preventDefault();
    this.setState(
      {
        actionPage: 2,
        searchValue: '',
        filterValue: 'ALL',
        sortValue: '0',
        date1: '',
        date2: '',
        currentPage: 1,
        tempCurrentPage: '1',
      }, () => {
        this.handleLoadPendingAppointments();
      }
    );
  };
  handleFormLichKham = (e) => {
    e.preventDefault();
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startWeek = new Date(today);
    startWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    this.setState(
      {
        actionPage: 3,
        currentWeekStart: startWeek,
      },
      () => {
        this.handleLoadSchedule();
      }
    );
  };
  handleFormLichSuKham = (e) => {
    e.preventDefault();
    this.setState(
      {
        actionPage: 4,
        searchValue: '',
        filterValue: 'ALL',
        sortValue: '0',
        date1: '',
        date2: '',
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        this.handleLoadCompleteAppointments();
      }
    );
  };
  handleFormChiTietLichHen = (appointmentid, type) => {
    this.setState(
      {
        actionPage: 5,
        selectedAppointment: appointmentid,
        fromForm: type,
      },
      () => {
        this.handleLoadAppointmentDetails(this.state.selectedAppointment);
      }
    );
  };
  handleSearchChange = (event) => {
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
          this.handleLoadPendingAppointments();
        }, 500);
      }
    );
  };
  handleFilter = (value) => {
    this.setState(
      {
        filterValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => this.handleLoadPendingAppointments()
    );
  };
  handleSort = (value) => {
    this.setState(
      {
        sortValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => this.handleLoadPendingAppointments()
    );
  };
  handlePageChange = (page, type) => {
    const { totalAppointmentPages } = this.state;
    let newPage = page;
    let totalPages;
    switch (type) {
      case 2:
        totalPages = totalAppointmentPages;
        break;
      default:
        totalPages = 1;
    }
    if (isNaN(page) || page <= 0) newPage = 1;
    else if (page > totalPages) newPage = totalPages;
    this.setState(
      { currentPage: newPage, tempCurrentPage: newPage.toString() },
      () => {
        switch (type) {
          case 2:
            this.handleLoadPendingAppointments()
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
          isLoading: true,
        };
      },
      () => {
        switch (type) {
          case 2:
            this.handleLoadPendingAppointments();
            break;
          default:
            break;
        }
        this.setState({ isLoading: false });
      }
    );
  };
  handleNextPage = (type) => {
    this.setState(
      (prevState) => {
        let totalPages;
        switch (type) {
          case 2:
            totalPages = prevState.totalAppointmentPages;
            break;
          default:
            totalPages = 1;
        }
        const newPage = Math.min(totalPages, prevState.currentPage + 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
          isLoading: true,
        };
      },
      () => {
        switch (type) {
          case 2:
            this.handleLoadPendingAppointments();
            break;
          default:
            break;
        }
        this.setState({ isLoading: false });
      }
    );
  };
  handlePageInputChange = (event) => {
    const value = event.target.value;
    this.setState({ tempCurrentPage: value });
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
  formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  getDayOfWeek = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };
  handlePreviousWeek = () => {
    this.setState(
      (prevState) => {
        const newWeekStart = new Date(prevState.currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() - 7);
        return { currentWeekStart: newWeekStart };
      },
      () => this.handleLoadSchedule()
    );
  };
  handleNextWeek = () => {
    this.setState(
      (prevState) => {
        const newWeekStart = new Date(prevState.currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + 7);
        return { currentWeekStart: newWeekStart };
      },
      () => this.handleLoadSchedule()
    );
  };
  renderForm() {
    const { actionPage, veterinarianid, veterinarianname, currentWeekStart, loadedPendingAppointments, loadedCompleteAppointments, loadedSchedules, loadedAppointmentDetail,
      editField, bio, servicesList, specialization, workingstatus, codeWorkingStatus, codeAppointmentStatus, codeScheduleStatus, codeAppointmentType, codePetType, codePetGender,
      serviceList, filterValue, sortValue, currentPage, tempCurrentPage, date1, date2, totalAppointmentPages, fromForm } = this.state;

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const groupedSchedules = {};
    const daysInWeek = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      const dayString = this.formatDate(day).slice(0, 10);
      daysInWeek.push({ date: day, dayString });
      groupedSchedules[dayString] = [];
    }
    loadedSchedules.forEach((schedule) => {
      const scheduleDate = this.formatDate(new Date(schedule.Date)).slice(0, 10);
      if (groupedSchedules[scheduleDate]) {
        groupedSchedules[scheduleDate].push(schedule);
      }
    });
    const hasSchedulesInWeek = daysInWeek.some(({ dayString }) => groupedSchedules[dayString].length > 0);
    switch (actionPage) {
      case 1:
        return (
          <form className="doctor-info-form" onSubmit={this.handleChangeVeterinarianInfo}>
            <div className='doctor-head'>
              <div className='doctor-head-left'>
                <h3>
                  <b>Thông tin bác sĩ:</b>
                </h3>
              </div>
              <div className='doctor-head-right'>

                <div className="value-doctor">
                  {codeWorkingStatus.find(status => status.Code === workingstatus)?.CodeValueVI || workingstatus}
                </div>
                <div className="descreption-doctor"> <label className="switch">
                  <input
                    type="checkbox"
                    checked={workingstatus === 'WORK'}
                    onChange={this.handleChangeWorkingStatus}
                  />
                  <span className="slider round"></span>
                </label>
                </div>
              </div>
            </div>

            <div className="doctor-info-form-content">
              <div className="doctor-info-tab">
                <div className="descreption-doctor">Họ tên:</div>
                <div className="doctor-value">{veterinarianname}</div>
              </div>
              <div className="doctor-info-tab">
                <div className="descreption-doctor">Dịch vụ thực hiện: </div>
                {servicesList && servicesList.length > 0 ? servicesList.map((item) => (<div className="doctor-value-sv" key={item.ServiceID}> {item.ServiceName} </div>)) : ""}</div>
              <div className="doctor-info-tab">
                <div className="descreption-doctor">Chuyên Khoa: </div>
                {editField === 'specialization' ? <input type="text" name='specialization' value={specialization}
                  onChange={this.handleVeterinarianInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{specialization}</div>}
                <button type="button" className="edit-button" onClick={() => this.handleChangeInfoClick('specialization')}>
                  <IonIcon icon={pencil}></IonIcon>
                </button>
              </div>
              <div className="doctor-info-tab">
                <div className="descreption-doctor">Tiểu sử: </div>
                {editField === 'bio' ? <input type="text" name='bio' value={bio} onChange={this.handleVeterinarianInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{bio}</div>}
                <button type="button" className="edit-button" onClick={() => this.handleChangeInfoClick('bio')}>
                  <IonIcon icon={pencil}></IonIcon>
                </button>
              </div>
              <div className="change-info-button" onSubmit={this.handleChangeVeterinarianInfo}>
                <button> Cập nhật </button>
              </div>
            </div>

          </form>
        );
      case 2:
        return (
          <form className="wait-appointment-form">
            <div className="wait-appointment-container">
              <h3>
                <b>Lịch khám cần xác nhận: </b>
              </h3>
              <div className="wait-appointment-filter">
                <div className="filter-left">
                  <div className="filter-sort">
                    <select value={filterValue} onChange={(e) => this.handleFilter(e.target.value)}>
                      <option value="ALL">Tất cả</option>
                      <optgroup label="Theo lịch hẹn">
                        <option value="veterinarian-PUBLIC">Lịch hẹn công khai</option>
                        <option value="veterinarian-PRIVATE">Lịch hẹn của tôi</option>
                      </optgroup>
                      <optgroup label="Theo dịch vụ">
                        {this.state.serviceList.map((service) => (
                          <option key={service.ServiceID} value={`service-${service.ServiceID}`}>
                            {service.ServiceName}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="filter-sort">
                    <select value={sortValue} onChange={(e) => this.handleSort(e.target.value)}>
                      <option value="0">Mặc định</option>
                      <option value="1">Lịch hẹn mới nhất</option>
                      <option value="2">Lịch hẹn cũ nhất</option>
                    </select>
                  </div>
                </div>

                <div className="filter-right">
                  <div className="date-filter">
                    <label>Ngày:</label>
                    <DatePicker
                      selected={date1 ? new Date(date1 + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date
                          ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
                          : '';
                        this.setState({ date1: formattedDate }, () => {
                          this.handleLoadPendingAppointments();
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                    />
                    {date1 && (
                      <button
                        onClick={() => this.resetDateFilter('date1')}
                        style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        x
                      </button>
                    )}
                  </div>

                  <div className="date-filter">
                    <label>đến</label>
                    <DatePicker
                      selected={date2 ? new Date(date2 + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date
                          ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
                          : '';
                        this.setState({ date2: formattedDate }, () => {
                          this.handleLoadPendingAppointments();
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                    />
                    {date2 && (
                      <button
                        onClick={() => this.resetDateFilter('date2')}
                        style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        x
                      </button>
                    )}

                  </div>
                </div>
              </div>
              <div className="wait-appointment-list">
                {loadedPendingAppointments.length > 0 ? (
                  loadedPendingAppointments.map((appointment) => (
                    <div
                      key={appointment.AppointmentID}
                      className={`wait-appointment-object ${appointment.VeterinarianID ? 'vet-specific' : 'public-appointment'
                        }`} onClick={() => this.handleFormChiTietLichHen(appointment.AppointmentID, 2)}
                    > <h4>{appointment.ServiceName}</h4>
                      <div className="wait-appointment-object-head" >
                        <div className="wait-appointment-object-left" >
                          <div className='wait-appointment-info'>
                            <div className="descreption-wait-appointment">Khách hàng: </div>
                            <div className="value-wait-appointment">{appointment.CustomerName}</div>
                          </div>
                          <div className='wait-appointment-info'>
                            <div className="descreption-wait-appointment">Tên thú cưng: </div>
                            <div className="value-wait-appointment">{appointment.PetName}</div>
                          </div>
                        </div>
                        <div className="wait-appointment-object-right" >
                          <div className="day-wait-appointment"> {new Date(appointment.AppointmentDate).toLocaleDateString('vi-VN')}</div>
                          <div className="time-wait-appointment">{appointment.StartTime.slice(0, 5)} đến {appointment.EndTime.slice(0, 5)}</div>
                        </div>
                      </div>
                      <div className='wait-appointment-object-notes'>
                        <div className="descreption-wait-appointment">Ghi chú: </div>
                        <div className="value-wait-appointment">{appointment.Notes}</div>
                      </div>
                      <div className='wait-appointment-button'>
                        <button
                          type="button"
                          className='wait-appointment-button-accept'
                          onClick={() => this.handleChangeAppointmentStatus(appointment.AppointmentID, 'CONF')}
                        >
                          Xác nhận
                        </button>
                        {appointment.VeterinarianID === veterinarianid ?
                          <button
                            type="button"
                            className='wait-appointment-button-refuse'
                            onClick={() => this.handleChangeAppointmentStatus(appointment.AppointmentID, 'CANCELED')}
                          >
                            Từ chối
                          </button>
                          : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có lịch hẹn nào.</p>
                )}
              </div>
              {totalAppointmentPages > 1 && (
                <div className="pagination">
                  <button onClick={() => this.handlePageChange(1, 2)} disabled={currentPage === 1}>
                    {'<<'}
                  </button>
                  <button onClick={() => this.handlePrevPage(2)} disabled={currentPage === 1}>
                    {'<'}
                  </button>
                  <input
                    type="text"
                    value={tempCurrentPage}
                    onChange={(event) => this.handlePageInputChange(event)}
                    onKeyDown={(event) => this.handlePageKeyDown(event, 2)}
                    onBlur={() => this.handlePageInputBlur(2)}
                  />
                  <span>/ {totalAppointmentPages}</span>
                  <button onClick={() => this.handleNextPage(2)} disabled={currentPage === totalAppointmentPages}>
                    {'>'}
                  </button>
                  <button onClick={() => this.handlePageChange(totalAppointmentPages, 2)} disabled={currentPage === totalAppointmentPages}>
                    {'>>'}
                  </button>
                </div>
              )}
            </div>
          </form>
        );
      case 3:
        return (
          <form className="doctor-celendar-form">
            <div className="calendar-container">
              <h3>
                <b>Lịch khám: </b>
              </h3>
              <div className="celendar-button">
                <button type="button" onClick={this.handlePreviousWeek} className="celendar-button-left">
                  <IonIcon icon={chevronBackOutline} className="text-2xl" />
                </button>
                <h2 className="celendar-real">
                  {this.formatDate(currentWeekStart)} đến {this.formatDate(weekEnd)}
                </h2>
                <button type="button" onClick={this.handleNextWeek} className="celendar-button-right">
                  <IonIcon icon={chevronForwardOutline} className="text-2xl" />
                </button>
              </div>
              <div className="calendar-list">
                {hasSchedulesInWeek ? (
                  daysInWeek.map(({ date, dayString }) => {
                    const daySchedules = groupedSchedules[dayString];
                    // Chỉ hiển thị ngày nếu có lịch khám
                    if (daySchedules.length === 0) return null;
                    return (
                      <div key={dayString} className="celendar-day-info">
                        <h3>
                          {this.getDayOfWeek(date)}, {dayString}
                        </h3>
                        {daySchedules.map((schedule) => (
                          < div
                            key={schedule.ScheduleID}
                            className="calendar-object"
                            onClick={() => this.handleFormChiTietLichHen(schedule.AppointmentID, 3)}
                          >
                            <div className="description-appointment">
                              Thời gian: {schedule.StartTime} đến {schedule.EndTime}
                            </div>
                            <div className="description-appointment">Dịch vụ: {schedule.ServiceName}</div>
                            <div className="description-appointment">
                              Khách hàng: {schedule.CustomerName} | Tên thú cưng: {schedule.PetName}
                            </div>
                            <div className="description-appointment">
                              Trạng thái lịch hẹn: {codeAppointmentType.find(status => status.Code === schedule.AppointmentType)?.CodeValueVI || schedule.AppointmentType} -
                              {codeScheduleStatus.find(status => status.Code === schedule.ScheduleStatus)?.CodeValueVI || schedule.ScheduleStatus}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                ) : (
                  <div className="description-non">Không có lịch khám trong tuần này</div>
                )}
              </div>
            </div>
          </form >
        );
      case 4:
        return (
          <form className="appointment-history-form">
            <div className="wait-appointment-container">
              <h3>
                <b>Lịch sử khám: </b>
              </h3>
              <div className='filter-sort'>
                <select value={filterValue} onChange={(e) => this.handleFilter(e.target.value)}>
                  <option value="ALL">Tất cả</option>
                  <optgroup label="Theo lịch hẹn">
                    <option value="veterinarian-PUBLIC">Lịch hẹn công khai</option>
                    <option value="veterinarian-PRIVATE">Lịch hẹn của tôi</option>
                  </optgroup>
                  <optgroup label="Theo dịch vụ">
                    {this.state.serviceList.map((service) => (
                      <option key={service.ServiceID} value={`service-${service.ServiceID}`}>
                        {service.ServiceName}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <select value={sortValue} onChange={(e) => this.handleSort(e.target.value)}>
                  <option value="0">Mặc định</option>
                  <option value="1">Lịch hẹn mới nhất</option>
                  <option value="2">Lịch hẹn cũ nhất</option>
                </select>
              </div>
              <div className="date-filter">
                <label>Ngày bắt đầu:</label>
                <DatePicker
                  selected={date1 ? new Date(date1 + 'T00:00:00') : null}
                  onChange={(date) => {
                    const formattedDate = date
                      ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
                      : '';
                    this.setState({ date1: formattedDate }, () => {
                      this.handleLoadCompleteAppointments();
                    });
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="date-picker"
                />
                {date1 && (
                  <button
                    onClick={() => this.resetDateFilter('date1')}
                    style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    x
                  </button>
                )}
                <label>Ngày kết thúc:</label>
                <DatePicker
                  selected={date2 ? new Date(date2 + 'T00:00:00') : null}
                  onChange={(date) => {
                    const formattedDate = date
                      ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
                      : '';
                    this.setState({ date2: formattedDate }, () => {
                      this.handleLoadCompleteAppointments();
                    });
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="date-picker"
                />
                {date2 && (
                  <button
                    onClick={() => this.resetDateFilter('date2')}
                    style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    x
                  </button>
                )}
              </div>
              <div className="wait-appointment-list">
                {loadedCompleteAppointments.length > 0 ? (
                  loadedCompleteAppointments.map((appointment) => (
                    <div
                      key={appointment.AppointmentID}
                      className="wait-appointment-object"
                    >
                      <div
                        className="wait-appointment-info"
                        onClick={() => this.handleFormChiTietLichHen(appointment.AppointmentID, 4)}
                      >
                        <div className="wait-appointment-left">
                          <div className="wait-appointment-descrpiton">Khách hàng: {appointment.CustomerName}</div>
                          <h3 className="wait-appointment-descrpiton">Tên thú cưng: {appointment.PetName}</h3>
                          <div className="wait-appointment-descrpiton">Dịch vụ: {appointment.ServiceName}</div>
                        </div>
                        <div className="wait-appointment-right">
                          <div className="wait-appointment-descrpiton">
                            Ngày khám: {new Date(appointment.AppointmentDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="wait-appointment-descrpiton">
                            Giờ khám: {appointment.StartTime} - {appointment.EndTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có lịch sử lịch hẹn nào.</p>
                )}
              </div>
              {totalAppointmentPages > 1 && (
                <div className="pagination">
                  <button onClick={() => this.handlePageChange(1, 4)} disabled={currentPage === 1}>
                    {'<<'}
                  </button>
                  <button onClick={() => this.handlePrevPage(4)} disabled={currentPage === 1}>
                    {'<'}
                  </button>
                  <input
                    type="text"
                    value={tempCurrentPage}
                    onChange={(event) => this.handlePageInputChange(event)}
                    onKeyDown={(event) => this.handlePageKeyDown(event, 4)}
                    onBlur={() => this.handlePageInputBlur(4)}
                  />
                  <span>/ {totalAppointmentPages}</span>
                  <button onClick={() => this.handleNextPage(4)} disabled={currentPage === totalAppointmentPages}>
                    {'>'}
                  </button>
                  <button onClick={() => this.handlePageChange(totalAppointmentPages, 4)} disabled={currentPage === totalAppointmentPages}>
                    {'>>'}
                  </button>
                </div>
              )}
            </div>
          </form>
        );
      case 5:
        return (
          <form className="appointment-detail-form">
            <div className="appointment-detail-container">
              <h3>
                <b>Chi tiết lịch khám</b>
              </h3>
              {loadedAppointmentDetail && (
                <div className="appointment-detail-content">
                  <div className="detail-section">
                    <h4>Thông tin khách hàng</h4>
                    <div className="detail-item">
                      <label>Tên khách hàng:</label>
                      <span>{loadedAppointmentDetail.CustomerName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{loadedAppointmentDetail.CustomerEmail}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{loadedAppointmentDetail.CustomerPhone}</span>
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4>Thông tin thú cưng</h4>
                    <div className="detail-item">
                      <label>Tên thú cưng:</label>
                      <span>{loadedAppointmentDetail.Pet.PetName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Loại thú cưng:</label>
                      <span>
                        {codePetType.find(pettype => pettype.Code === loadedAppointmentDetail.Pet.PetType)?.CodeValueVI || loadedAppointmentDetail.Pet.PetType}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Cân nặng:</label>
                      <span>{loadedAppointmentDetail.Pet.PetWeight} kg</span>
                    </div>
                    <div className="detail-item">
                      <label>Tuổi:</label>
                      <span>{loadedAppointmentDetail.Pet.Age} tháng</span>
                    </div>
                    <div className="detail-item">
                      <label>Giới tính:</label>
                      <span>
                        {codePetGender.find(petgender => petgender.Code === loadedAppointmentDetail.Pet.PetGender)?.CodeValueVI || loadedAppointmentDetail.Pet.PetGender}
                      </span>
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4>Thông tin lịch hẹn</h4>
                    <div className="detail-item">
                      <label>Mã lịch hẹn:</label>
                      <span>{loadedAppointmentDetail.AppointmentID}</span>
                    </div>
                    <div className="detail-item">
                      <label>Dịch vụ:</label>
                      <span>{loadedAppointmentDetail.Service.ServiceName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Ngày khám:</label>
                      <span>{new Date(loadedAppointmentDetail.AppointmentDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Giờ khám:</label>
                      <span>{loadedAppointmentDetail.StartTime} - {loadedAppointmentDetail.EndTime}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái lịch hẹn:</label>
                      <span>
                        {codeAppointmentStatus.find(status => status.Code === loadedAppointmentDetail.AppointmentStatus)?.CodeValueVI || loadedAppointmentDetail.AppointmentStatus}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Loại lịch hẹn:</label>
                      <span>
                        {codeAppointmentType.find(type => type.Code === loadedAppointmentDetail.AppointmentType)?.CodeValueVI || loadedAppointmentDetail.AppointmentType}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Ghi chú:</label>
                      <span>{loadedAppointmentDetail.Notes}</span>
                    </div>
                    {loadedAppointmentDetail.PrevAppointmentID && (
                      <div className="detail-item">
                        <label>Lịch hẹn trước đó:</label>
                        <span
                          onClick={() => this.handleFormChiTietLichHen(loadedAppointmentDetail.PrevAppointmentID, fromForm)}
                        >
                          {loadedAppointmentDetail.PrevAppointmentID} Chọn để chuyển đến
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="detail-section">
                    <h4>Hình ảnh</h4>
                    {loadedAppointmentDetail.Images.length > 0 ? (
                      loadedAppointmentDetail.Images.map(image => (
                        <img
                          key={image.ImageID}
                          src={image.Image}
                          alt="Hình ảnh lịch hẹn"
                          style={{ maxWidth: '200px', margin: '5px' }}
                        />
                      ))
                    ) : (
                      <p>Không có hình ảnh</p>
                    )}
                  </div>
                  {loadedAppointmentDetail.AppointmentBill && (
                    <div className="detail-section">
                      <h4>Thông tin hóa đơn</h4>
                      <div className="detail-item">
                        <label>Mã hóa đơn:</label>
                        <span>{loadedAppointmentDetail.AppointmentBill.AppointmentBillID}</span>
                      </div>
                      <div className="detail-item">
                        <label>Tổng thanh toán:</label>
                        <span>{loadedAppointmentDetail.AppointmentBill.TotalPayment} VNĐ</span>
                      </div>
                    </div>
                  )}
                  <div className="wait-appointment-button">
                    <button
                      type="button"
                      className="back-button"
                      onClick={() => this.setState({ actionPage: fromForm })}
                    >
                      Quay lại
                    </button>
                    {fromForm === 2 && loadedAppointmentDetail.AppointmentStatus === 'PEND' && (
                      <>
                        <button
                          type="button"
                          className="action-button confirm-button"
                          onClick={() => this.handleChangeAppointmentStatus(loadedAppointmentDetail.AppointmentID, 'CONF')}
                        >
                          Xác nhận
                        </button>
                        {loadedAppointmentDetail.VeterinarianID !== null ? (
                          <button
                            type="button"
                            className="action-button cancel-button"
                            onClick={() => this.handleChangeAppointmentStatus(loadedAppointmentDetail.AppointmentID, 'CANCELED')}
                          >
                            Từ chối
                          </button>
                        ) : ""}
                      </>
                    )}
                    {fromForm === 3 && (
                      <>
                        {
                          loadedAppointmentDetail.ScheduleID &&
                            loadedAppointmentDetail.ScheduleStatus === 'PEND' &&
                            (() => {
                              const today = new Date();
                              const appointmentDay = new Date(loadedAppointmentDetail.AppointmentDate);
                              return (
                                today.getFullYear() === appointmentDay.getFullYear() &&
                                today.getMonth() === appointmentDay.getMonth() &&
                                today.getDate() === appointmentDay.getDate()
                              );
                            })() ? (
                            <button
                              type="button"
                              className="action-button complete-button"
                              onClick={() => this.handleAppointmentCheckOut(loadedAppointmentDetail.AppointmentID)}
                            >
                              Hoàn thành
                            </button>
                          ) : ""
                        }

                        {loadedAppointmentDetail.ScheduleID && loadedAppointmentDetail.ScheduleStatus === 'PEND' ? (
                          <button
                            type="button"
                            className="action-button cancel-button"
                            onClick={() => this.handleChangeScheduleStatus(loadedAppointmentDetail.ScheduleID, 'CANCELED')}
                          >
                            Hủy khám
                          </button>
                        ) : ""}
                      </>
                    )}
                    {fromForm === 4 && loadedAppointmentDetail.AppointmentBill && (
                      <button
                        type="button"
                        className="action-button view-bill-button"
                        onClick={() => this.handleViewBill(loadedAppointmentDetail.AppointmentBill.AppointmentBillID)}
                      >
                        Xem hóa đơn khám
                      </button>
                    )}
                    {fromForm === 4 && loadedAppointmentDetail.AppointmentBill && (
                      <button
                        type="button"
                        className="action-button view-bill-button"
                        onClick={() => this.handleViewBill(loadedAppointmentDetail.AppointmentBill.AppointmentBillID)}
                      >
                        Xem hóa đơn khám
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        );
      default:
        return null;
    }
  }

  render() {
    const { actionPage, isLoading, fromForm } = this.state;
    return (
      <div className="doctor-page">
        <Header navigate={this.props.navigate} userInfo={this.props.userInfo} />
        <ToastContainer />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="doctor-container">
            <div className="doctor-action-form">
              <div
                className={`doctor-action-info ${actionPage === 1 || (actionPage === 5 && fromForm === 1) ? 'active' : ''}`}
                onClick={this.handleFormHoSoBacSi}
              >
                Hồ sơ bác sĩ
              </div>
              <div
                className={`doctor-action-wait-appointment ${actionPage === 2 || (actionPage === 5 && fromForm === 2) ? 'active' : ''}`}
                onClick={this.handleFormXacNhanLichKham}
              >
                Xác nhận lịch khám
              </div>
              <div
                className={`doctor-action-celendar ${actionPage === 3 || (actionPage === 5 && fromForm === 3) ? 'active' : ''}`}
                onClick={this.handleFormLichKham}
              >
                Lịch khám
              </div>
              <div
                className={`doctor-action-history-appointment ${actionPage === 4 || (actionPage === 5 && fromForm === 4) ? 'active' : ''}`}
                onClick={this.handleFormLichSuKham}
              >
                Lịch sử khám
              </div>
            </div>
            <div className="doctor-form">{this.renderForm()}</div>
          </div>
        )}
      </div>
    );
  }

}
const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  appointmentCheckout: state.appointment.appointmentCheckout,
});
const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
  saveAppointmentForCheckout: (appointmentData) => dispatch(saveAppointmentForCheckout(appointmentData))
});

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);