import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';

import { pencil, chevronForwardOutline, chevronBackOutline, closeCircleOutline } from 'ionicons/icons';

import './Doctor.scss'; // Import SCSS
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';

import { handleLogoutApi, handleChangeAccountInfoApi, handleChangeWorkingStatusApi, handleGetVeterinarianInfoApi } from '../../services/accountServices';
import { handleLoadScheduleApi, handleChangeScheduleStatusApi } from '../../services/scheduleServices';
import { handleLoadAppointmentsApi, handleChangeAppointmentStatusApi, handleLoadAppointmentDetailsApi } from '../../services/appointmentServices'
import { handleGetServiceInfoApi } from '../../services/serviceServices';

import { checkLoginStatus, getAllCodes } from '../../utils/pakage';
import { userLogin, userLogout, saveAppointmentForCheckout, saveTrackInfo } from '../../store/actions';

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Authentication & General
      actionPage: 1,
      fromForm: '',
      isLoading: true,
      isLoggedIn: false,
      accountInfo: null,
      // Codes
      codeWorkingStatus: [],
      codeAppointmentStatus: [],
      codeScheduleStatus: [],
      codeAppointmentType: [],
      codePetType: [],
      codePetGender: [],
      // Pagination
      currentPage: 1,
      tempCurrentPage: '1',
      limitAppointmentPerQuery: 5,
      totalPages: 1,
      // Filtering & Sorting
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      date1: '',
      date2: '',
      // VeterinarianInfo
      editField: null,
      originalValue: '',
      VeterinarianID: '',
      veterinarianname: '',
      WorkingStatus: '',
      Bio: '',
      Specialization: '',
      serviceList: [],
      // Data Lists
      loadedPendingAppointments: [],
      loadedSchedules: [],
      loadedCompleteAppointments: [],
      loadedAppointmentDetail: null,
      // Selections
      selectedAppointment: null,
      // Date management
      currentWeekStart: this.getStartOfWeek(),
      // DisableButton
      disabledButtons: {
        changeAppointment: false,
        changeSchedule: false,
        appointmentCheckout: false,
        viewBill: false,
      },
    };
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadCode(['WorkingStatus', 'AppointmentStatus', 'ScheduleStatus', 'AppointmentType', 'PetType', 'PetGender']);
    await this.handleGetServiceInfo();
    setTimeout(() => {
      this.handleLoadVeterinarianInfo();
      this.setState({ isLoading: false });
    }, 10);
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        this.handleLoadVeterinarianInfo();
      }, 10);
    }
  }
  //login
  handleIsLogin = async () => {
    try {
      this.setState({ isLoading: true });
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo && accountInfo.AccountType === 'V') {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          accountInfo,
          isLoggedIn: true,
          VeterinarianID: accountInfo.AccountID,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          accountInfo: null,
          isLoggedIn: false,
          VeterinarianID: '',
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
  handleLoadCode = async (codeTypes) => {
    try {
      this.setState({ isLoading: true });
      const responses = await Promise.all(codeTypes.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      const hasDefault = ['WorkingStatus'];
      codeTypes.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        if (hasDefault.includes(type)) {
          newState[type] = response.data.length > 0 ? response.data[0].Code : '';
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
        this.handleLoadVeterinarianInfo();
        break;
      case 2:
        this.handleLoadPendingAppointments();
        break;
      case 3:
        this.handleLoadSchedule();
        break;
      case 4:
        this.handleLoadCompleteAppointments();
        break;
      default:
        break;
    }
  };
  handleLoadVeterinarianInfo = async () => {
    try {
      const { VeterinarianID } = this.state
      const response = await handleGetVeterinarianInfoApi(VeterinarianID);
      if (response && response.errCode === 0) {
        const veterinarianInfo = response.data;
        this.setState({
          Specialization: veterinarianInfo.Specialization,
          WorkingStatus: veterinarianInfo.WorkingStatus,
          Bio: veterinarianInfo.Bio,
          servicesList: veterinarianInfo.services
        });
      }
    } catch (e) {
      console.log('Lỗi khi tải thông tin bác sĩ:', e);
      toast.error('Lỗi khi tải thông tin!');
    }
  };
  handleLoadPendingAppointments = async () => {
    const { VeterinarianID, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2 } = this.state;
    try {
      const response = await handleLoadAppointmentsApi(VeterinarianID, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2, "PEND");
      if (response && response.errCode === 0) {
        this.setState({
          loadedPendingAppointments: response.data,
          totalPages: Math.ceil(response.totalItems / limitAppointmentPerQuery),
        });
      } else {
        toast.error('Không thể tải danh sách lịch hẹn!');
      }
    } catch (e) {
      console.log('Lỗi khi tải lịch hẹn:', e);
      toast.error('Lỗi hệ thống khi tải danh sách!');
    }
  };
  handleLoadSchedule = async () => {
    const { VeterinarianID, currentWeekStart } = this.state;
    try {
      const startDate = currentWeekStart.toISOString().split('T')[0];
      const response = await handleLoadScheduleApi(VeterinarianID, startDate);
      if (response && response.errCode === 0) {
        this.setState({
          loadedSchedules: response.data,
        });
      } else {
        toast.error('Không thể tải lịch làm việc!');
      }
    } catch (e) {
      console.log('Lỗi khi tải lịch làm việc:', e);
      toast.error('Lỗi hệ thống khi tải lịch làm việc!');
    }
  };
  handleLoadCompleteAppointments = async () => {
    const { VeterinarianID, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2 } = this.state;
    try {
      const response = await handleLoadAppointmentsApi(VeterinarianID, currentPage, limitAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2, "COMP");
      if (response && response.errCode === 0) {
        this.setState({
          loadedCompleteAppointments: response.data,
          totalPages: Math.ceil(response.totalItems / limitAppointmentPerQuery),
        });
      } else {
        toast.error('Không thể tải danh sách lịch hẹn hoàn thành!');
      }
    } catch (e) {
      console.log('Lỗi khi tải lịch hẹn hoàn thành:', e);
      toast.error('Lỗi hệ thống khi tải danh sách!');
    }
  };
  handleLoadAppointmentDetails = async (AppointmentID) => {
    try {
      const response = await handleLoadAppointmentDetailsApi(AppointmentID);
      if (response && response.errCode === 0) {
        this.setState({ loadedAppointmentDetail: response.data, });
      } else {
        toast.error('Không thể tải chi tiết lịch hẹn!');
      }
    } catch (e) {
      console.log('Lỗi khi tải chi tiết lịch hẹn:', e);
      toast.error('Lỗi hệ thống khi tải chi tiết lịch hẹn!');
    }
    this.setState({ isLoading: false });
  };
  //VeterinarianInfo Management
  handleEditClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state[field], // Lưu giá trị ban đầu của trường
    });
  };
  handleVeterinarianInfoChange = (e) => {
    const { name, value } = e.target;
    const { editField, WorkingStatus } = this.state
    if (name === 'WorkingStatus' && editField !== 'WorkingStatus') {
      this.setState({
        editField: 'WorkingStatus',
        originalValue: WorkingStatus,
      });
    }
    this.setState({
      [name]: value,
    });
  };
  handleCancelVeterinarianInfoChange = async () => {
    this.setState({
      editField: null
    })
    await this.handleLoadVeterinarianInfo()
  }
  handleChangeVeterinarianInfo = async (e) => {
    e.preventDefault();
    const { editField, originalValue, VeterinarianID, Bio, Specialization, WorkingStatus, servicesList } = this.state;
    let updateInfo = {
      AccountID: VeterinarianID,
      AccountType: "V"
    };
    const formattedServicesList = servicesList.map(service => service.ServiceID);
    updateInfo.veterinarianInfo = {
      Bio,
      Specialization,
      WorkingStatus,
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
        toast.success('Cập nhật thông tin thành công!');
      } else {
        toast.error(response.errMessage);
        this.handleLoadVeterinarianInfo(updateInfo.AccountID);
      }
    }
    this.setState({ editField: null, originalValue: '' });
  };
  handleChangeWorkingStatus = async () => {
    const { WorkingStatus, VeterinarianID } = this.state;
    const newStatus = WorkingStatus === 'WORK' ? 'LEAVE' : 'WORK';
    try {
      const response = await handleChangeWorkingStatusApi(VeterinarianID, newStatus);
      if (response && response.errCode === 0) {
        this.setState({ WorkingStatus: newStatus });
      } else {
        toast.error('Lỗi khi cập nhật trạng thái!');
      }
    } catch (e) {
      console.log('Lỗi khi gọi API:', e);
      toast.error('Lỗi hệ thống khi cập nhật trạng thái!');
    }
  };
  //search filter sort
  handleSearchChange = (event, type) => {
    const value = event.target.value;
    this.setState(
      {
        searchValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        if (this.debounceTimeout) { clearTimeout(this.debounceTimeout); }
        this.debounceTimeout = setTimeout(() => {
          this.handleReloadData(type);
        }, 500)
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
        this.handleReloadData(type);
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
    this.setState({
      [dateField]: null
    }, () => {
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
      this.handleReloadData(type)
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
      }, () => {
        this.handleReloadData(type);
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
  //Appointment Management
  handleChangeAppointmentStatus = async (AppointmentID, status) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, changeAppointment: true } });
    const { VeterinarianID, WorkingStatus } = this.state;
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
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, changeAppointment: false } }); },
          }
        );
      });
    isConfirmed = await confirmAction();
    if (isConfirmed) {
      if (WorkingStatus === "WORK")
        try {
          const response = await handleChangeAppointmentStatusApi(AppointmentID, status, VeterinarianID);
          if (response && response.errCode === 0) {
            if (status === "CONF") {
              toast.success('Xác nhận lịch hẹn thành công!');
            } else {
              toast.success('Hủy lịch hẹn thành công!');
            }
            this.handleLoadPendingAppointments();
            this.setState({
              actionPage: 2,
            })
          }
        } catch (e) {
          console.log('Lỗi khi cập nhât lịch hẹn:', e);
          toast.error('Lỗi hệ thống khi cập nhật lịch hẹn!');
        }
      else {
        toast.info('Hãy bật trạng thái làm việc trước khi thao tác!');
      }
    }
  };
  //Schedule Management
  handleChangeScheduleStatus = async (ScheduleID, status) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, changeSchedule: true } });
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
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, changeSchedule: false } }); },
          }
        );
      });
    isConfirmed = await confirmAction();
    if (isConfirmed) {
      try {
        const response = await handleChangeScheduleStatusApi(ScheduleID, status);
        if (response && response.errCode === 0) {
          toast.success(`Cập nhật thành công!`);
          await this.handleLoadSchedule()
          this.setState({
            actionPage: 3
          })
        } else {
          toast.error(response.errMessage || 'Lỗi khi cập nhật lịch!');
        }
      } catch (e) {
        console.log('Lỗi khi cập nhật lịch:', e);
        toast.error('Lỗi hệ thống khi cập nhật!');
      }
    }
  };
  handleAppointmentCheckOut = (AppointmentID) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, appointmentCheckout: true } });
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận hoàn thành lịch hẹn?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, appointmentCheckout: false } }); },
          }
        );
      });
    confirmAction().then((isConfirmed) => {
      if (isConfirmed) {
        const { VeterinarianID } = this.state;
        const appointmentData = {
          VeterinarianID,
          AppointmentID,
        };
        this.props.saveAppointmentForCheckout(appointmentData);
        this.props.navigate('/appointmentcheckout');
      }
    });
  };
  //AppointmentBill Management
  handleViewBill = (BillID) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, viewBill: true } });
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận xem hóa đơn?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, viewBill: false } }); },
          }
        );
      });
    confirmAction().then((isConfirmed) => {
      if (isConfirmed) {
        this.props.saveTrackInfo({ BillID, BillType: 3 });
        this.props.navigate('/track');
      }
    });
  };
  //form controller
  handleFormHoSoBacSi = (e) => {
    e.preventDefault();
    const { VeterinarianID } = this.state
    this.setState(
      {
        actionPage: 1,
        editField: null,
        originalValue: '',
      }, () => {
        this.handleLoadVeterinarianInfo(VeterinarianID);
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
    this.setState(
      {
        actionPage: 3,
        currentWeekStart: this.getStartOfWeek()
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
  handleFormChiTietLichHen = (AppointmentID, type) => {
    this.setState(
      {
        actionPage: 5,
        selectedAppointment: AppointmentID,
        fromForm: type,
      },
      () => {
        this.handleLoadAppointmentDetails(AppointmentID);
      }
    );
  };
  //ultilities
  getStartOfWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startWeek = new Date(today);
    startWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return startWeek;
  }
  getDayOfWeek = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };
  formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
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
    const { actionPage, VeterinarianID, accountInfo, currentWeekStart, loadedPendingAppointments, loadedCompleteAppointments, loadedSchedules, loadedAppointmentDetail,
      editField, Bio, servicesList, Specialization, WorkingStatus, codeWorkingStatus, codeAppointmentStatus, codeScheduleStatus, codeAppointmentType, codePetType, codePetGender,
      serviceList, filterValue, sortValue, currentPage, tempCurrentPage, date1, date2, totalPages, fromForm, disabledButtons } = this.state;
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
          <form className="doctor-info-form" key="doctor-info-form" onSubmit={this.handleChangeVeterinarianInfo}>
            <div className='doctor-head'>
              <div className='doctor-head-left'>
                <h3>
                  <b>Thông tin của bác sĩ: {accountInfo?.UserName}</b>
                </h3>
              </div>
              <div className='doctor-head-right' >
                <div className="value-doctor-status" data-status={WorkingStatus}>
                  {codeWorkingStatus.find(status => status.Code === WorkingStatus)?.CodeValueVI || WorkingStatus}
                </div>
                <div className="descreption-doctor"> <label className="switch">
                  <input
                    type="checkbox"
                    checked={WorkingStatus === 'WORK'}
                    onChange={this.handleChangeWorkingStatus}
                  />
                  <span className="slider round"></span>
                </label>
                </div>
              </div>
            </div>
            <div className="doctor-info-form-content">
              <div className="doctor-info-tab">
                <div className="descreption-doctor">Dịch vụ thực hiện:
                </div>
                <div className="doctor-value-1">
                  {servicesList && servicesList.length > 0 ? (
                    <div className="service-list">
                      {servicesList.map((item, index) => (
                        <span className="doctor-value-sv" key={item.ServiceID}>
                          {item.ServiceName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="doctor-info-tab">
                <div className="descreption-doctor">Chuyên Khoa: </div>
                {editField === 'Specialization' ? <input type="text" name='Specialization' value={Specialization}
                  onChange={this.handleVeterinarianInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{Specialization}</div>}
                <button type="button" className="edit-button" onClick={() => this.handleEditClick('Specialization')}>
                  <IonIcon icon={pencil}></IonIcon>
                </button>
              </div>
              <div className="doctor-info-tab">
                <div className="descreption-doctor">Tiểu sử: </div>
                {editField === 'Bio' ? <input type="text" name='Bio' value={Bio} onChange={this.handleVeterinarianInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{Bio}</div>}
                <button type="button" className="edit-button" onClick={() => this.handleEditClick('Bio')}>
                  <IonIcon icon={pencil}></IonIcon>
                </button>
              </div>

              {this.state.editField !== null && (
                <div className='change-info'>
                  <div className="change-info-button-update" onSubmit={this.handleChangeVeterinarianInfo}>
                    <button> Cập nhật </button>
                  </div>
                  <div className="change-info-button-cancel" >
                    <button type='button' onClick={this.handleCancelVeterinarianInfoChange}> Hủy </button>
                  </div>
                </div>
              )}
            </div>

          </form>
        );
      case 2:
        return (
          <form className="wait-appointment-form" key="wait-appointment-form">
            <div className="wait-appointment-container">
              <h3>
                <b>Lịch khám cần xác nhận: </b>
              </h3>
              <div className="wait-appointment-filter">
                <div className="filter-left">
                  <div className="filter-sort">
                    <select value={filterValue} onChange={(e) => this.handleFilter(e.target.value, 2)}>
                      <option value="ALL">Tất cả</option>
                      <optgroup label="Theo lịch hẹn">
                        <option value="veterinarian-PUBLIC">Lịch hẹn công khai</option>
                        <option value="veterinarian-PRIVATE">Lịch hẹn của tôi</option>
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
                  <div className="filter-sort">
                    <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 2)}>
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
                        console.log('date1:', formattedDate);
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
                        onClick={() => this.resetDateFilter('date1', 2)}
                      >
                        <IonIcon icon={closeCircleOutline}></IonIcon>
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
                        onClick={() => this.resetDateFilter('date2', 2)}
                      >
                        <IonIcon icon={closeCircleOutline}></IonIcon>
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
                        }`}
                    ><div className="wait-appointment-object-head" >
                        <div className='title' onClick={() => this.handleFormChiTietLichHen(appointment.AppointmentID, 2)}><h4>{appointment.ServiceName}</h4></div>
                        <div className='wait-appointment-button'>
                          <button
                            type="button"
                            className='wait-appointment-button-accept'
                            onClick={() => this.handleChangeAppointmentStatus(appointment.AppointmentID, 'CONF')}
                            disabled={disabledButtons.changeAppointment}
                          >
                            Xác nhận
                          </button>
                          {appointment.VeterinarianID === VeterinarianID ?
                            <button
                              type="button"
                              className='wait-appointment-button-refuse'
                              onClick={() => this.handleChangeAppointmentStatus(appointment.AppointmentID, 'CANCELED')}
                              disabled={disabledButtons.changeAppointment}
                            >
                              Từ chối
                            </button>
                            : ""}
                        </div>
                      </div>
                      <div className="wait-appointment-object-center" onClick={() => this.handleFormChiTietLichHen(appointment.AppointmentID, 2)}>
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
                          <div className='wait-appointment-info'>
                            <div className="descreption-wait-appointment-day">Ngày : </div>
                            <div className="day-wait-appointment"> {new Date(appointment.AppointmentDate).toLocaleDateString('vi-VN')}</div>
                          </div>
                          <div className='wait-appointment-info'>
                            <div className="descreption-wait-appointment-day">Giờ: </div>
                            <div className="time-wait-appointment">{appointment.StartTime.slice(0, 5)} đến {appointment.EndTime.slice(0, 5)}</div>
                          </div>
                        </div>
                      </div>
                      <div className='wait-appointment-object-notes' onClick={() => this.handleFormChiTietLichHen(appointment.AppointmentID, 2)}>
                        <div className="descreption-wait-appointment">Ghi chú: </div>
                        <div className="note-wait-appointment">{appointment.Notes}</div>
                      </div>

                    </div>
                  ))
                ) : (
                  <p>Không có lịch hẹn nào.</p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button className="first" onClick={() => this.handlePageChange(1, 2)} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button className="prev" onClick={() => this.handlePrevPage(2)} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input
                      type="text"
                      value={tempCurrentPage}
                      onChange={(event) => this.handlePageInputChange(event)}
                      onKeyDown={(event) => this.handlePageKeyDown(event, 2)}
                      onBlur={() => this.handlePageInputBlur(2)}
                    />
                    <span>/ {totalPages}</span>
                    <button className="next" onClick={() => this.handleNextPage(2)} disabled={currentPage === totalPages}>
                      {'>'}
                    </button>
                    <button className="last" onClick={() => this.handlePageChange(totalPages, 2)} disabled={currentPage === totalPages}>
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
          <form className="doctor-celendar-form" key="doctor-celendar-form">
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
                          <div
                            key={schedule.ScheduleID}
                            className="calendar-object"
                            onClick={() => this.handleFormChiTietLichHen(schedule.AppointmentID, 3)}
                          > <div className='calendar-object-left'>
                              <div className="description-appointment">{schedule.ServiceName}</div>
                              <div className="description-appointment">{schedule.StartTime} đến {schedule.EndTime}</div>
                            </div>
                            <div className='calendar-object-center'>
                              <div className="description-appointment">Khách hàng: {schedule.CustomerName} | Tên thú cưng: {schedule.PetName}</div>
                            </div>
                            <div className='calendar-object-right'>
                              <span className="status-appointment" data-status={schedule.ScheduleStatus}>
                                {codeAppointmentType.find(status => status.Code === schedule.AppointmentType)?.CodeValueVI || schedule.AppointmentType}-
                                {codeScheduleStatus.find(status => status.Code === schedule.ScheduleStatus)?.CodeValueVI || schedule.ScheduleStatus}
                              </span>
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
          <form className="appointment-history-form" key="appointment-history-form">
            <div className="wait-appointment-container">
              <h3>
                <b>Lịch sử khám: </b>
              </h3>
              <div className="wait-appointment-filter">
                <div className="filter-left">
                  <div className="filter-sort">
                    <select value={filterValue} onChange={(e) => this.handleFilter(e.target.value, 4)}>
                      <option value="ALL">Tất cả</option>
                      <optgroup label="Theo dịch vụ">
                        {serviceList.map((service) => (
                          <option key={service.ServiceID} value={`service-${service.ServiceID}`}>
                            {service.ServiceName}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="filter-sort">
                    <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 4)}>
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
                          this.handleLoadCompleteAppointments();
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                    />
                    {date1 && (
                      <button
                        onClick={() => this.resetDateFilter('date1', 4)}
                      >
                        <IonIcon icon={closeCircleOutline}></IonIcon>
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
                          this.handleLoadCompleteAppointments();
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"

                    />
                    {date2 && (
                      <button
                        onClick={() => this.resetDateFilter('date2', 4)}
                      >
                        <IonIcon icon={closeCircleOutline}></IonIcon>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="wait-appointment-list">
                {loadedCompleteAppointments.length > 0 ? (
                  loadedCompleteAppointments.map((appointment) => (
                    <div
                      key={appointment.AppointmentID}
                      className="wait-appointment-object" onClick={() => this.handleFormChiTietLichHen(appointment.AppointmentID, 4)}
                    >
                      <div className="wait-appointment-object-head" >
                        <div className='title'><h4>{appointment.ServiceName}</h4></div>
                        <div className='wait-appointment-button'>

                        </div>
                      </div>
                      <div className="wait-appointment-object-center" >
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
                          <div className='wait-appointment-info'>
                            <div className="descreption-wait-appointment-day">Ngày: </div>
                            <div className="day-wait-appointment"> {new Date(appointment.AppointmentDate).toLocaleDateString('vi-VN')}</div>
                          </div>
                          <div className='wait-appointment-info'>
                            <div className="descreption-wait-appointment-day">Giờ: </div>
                            <div className="time-wait-appointment">{appointment.StartTime.slice(0, 5)} đến {appointment.EndTime.slice(0, 5)}</div>
                          </div>
                        </div>
                      </div>
                      <div className='wait-appointment-object-notes'>
                        <div className="descreption-wait-appointment">Ghi chú:</div>
                        <div className="note-wait-appointment">{appointment.Notes}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không có lịch hẹn nào.</p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button className="first" onClick={() => this.handlePageChange(1, 4)} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button className="prev" onClick={() => this.handlePrevPage(4)} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input
                      type="text"
                      value={tempCurrentPage}
                      onChange={(event) => this.handlePageInputChange(event)}
                      onKeyDown={(event) => this.handlePageKeyDown(event, 4)}
                      onBlur={() => this.handlePageInputBlur(4)}
                    />
                    <span>/ {totalPages}</span>
                    <button className="next" onClick={() => this.handleNextPage(4)} disabled={currentPage === totalPages}>
                      {'>'}
                    </button>
                    <button className="last" onClick={() => this.handlePageChange(totalPages, 4)} disabled={currentPage === totalPages}>
                      {'>>'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        );
      case 5:
        return (
          <form className="appointment-detail-form" key="appointment-detail-form">
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
                        {codePetType.find(PetType => PetType.Code === loadedAppointmentDetail.Pet.PetType)?.CodeValueVI || loadedAppointmentDetail.Pet.PetType}
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
                        {codePetGender.find(PetGender => PetGender.Code === loadedAppointmentDetail.Pet.PetGender)?.CodeValueVI || loadedAppointmentDetail.Pet.PetGender}
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
                      <div className="detail-item-fu">
                        <label>Lịch hẹn trước đó:</label>
                        <span>
                          {loadedAppointmentDetail.PrevAppointmentID}
                        </span>
                        <div className='appointment-vw-btn' onClick={() => this.handleFormChiTietLichHen(loadedAppointmentDetail.PrevAppointmentID, fromForm)}>Chọn để chuyển đến</div>
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
                  <div className="button-detail">
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
                          className="action-button-confirm-button"
                          onClick={() => this.handleChangeAppointmentStatus(loadedAppointmentDetail.AppointmentID, 'CONF')}
                          disabled={disabledButtons.changeAppointment}
                        >
                          Xác nhận
                        </button>
                        {loadedAppointmentDetail.VeterinarianID !== null && (
                          <button
                            type="button"
                            className="action-button-cancel-button"
                            onClick={() => this.handleChangeAppointmentStatus(loadedAppointmentDetail.AppointmentID, 'CANCELED')}
                            disabled={disabledButtons.changeAppointment}
                          >
                            Từ chối
                          </button>
                        )}
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
                          })() && (
                            <button
                              type="button"
                              className="action-button-complete-button"
                              onClick={() => this.handleAppointmentCheckOut(loadedAppointmentDetail.AppointmentID)}
                              disabled={disabledButtons.appointmentCheckout}
                            >
                              Hoàn thành
                            </button>
                          )}


                        {loadedAppointmentDetail.ScheduleID && loadedAppointmentDetail.ScheduleStatus === 'PEND' && (
                          <div>
                            <button
                              type="button"
                              className="action-button-complete-button"
                              onClick={() => this.handleAppointmentCheckOut(loadedAppointmentDetail.AppointmentID)}
                              disabled={disabledButtons.appointmentCheckout}
                            >
                              Hoàn thành
                            </button>
                            <button
                              type="button"
                              className="action-button-cancel-button"
                              onClick={() => this.handleChangeScheduleStatus(loadedAppointmentDetail.ScheduleID, 'CANCELED')}
                              disabled={disabledButtons.changeSchedule}
                            >
                              Hủy khám
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {fromForm === 4 && loadedAppointmentDetail.AppointmentBill && (
                      <button
                        type="button"
                        className="action-button-view-bill-button"
                        onClick={() => this.handleViewBill(loadedAppointmentDetail.AppointmentBill.AppointmentBillID)}
                        disabled={disabledButtons.viewBill}
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
          <div className="loading-container"><Spinner /></div>
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
  saveAppointmentForCheckout: (appointmentData) => dispatch(saveAppointmentForCheckout(appointmentData)),
  saveTrackInfo: (trackData) => dispatch(saveTrackInfo(trackData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);