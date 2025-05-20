import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';

import Spinner from '../../components/Spinner';
import DatePicker from 'react-datepicker';

import { chevronBack, pencil, eyeOutline, eyeOffOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';

import './Doctor.scss'; // Import SCSS

import { handleLogoutApi, handleChangeAccountInfoApi, handleChangeWorkingStatusApi, handleGetVeterinarianInfoApi } from '../../services/accountServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { handleLoadPendingAppointmentsApi, handleChangeAppointmentStatusApi } from '../../services/appointmentServices'

import { userLogin, userLogout } from '../../store/actions';
import { checkLoginStatus } from '../../utils/pakage';

import Header from '../../components/HomeHeader';

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      accountInfo: null,
      workingstatus: '',
      bio: '',
      specialization: '',
      actionPage: 1,
      editField: null,
      servicesList: [],
      originalValue: '',
      codeWorkingStatus: [],
      loadedPendingAppointments: [],
      currentPage: 1,
      tempCurrentPage: '1',
      limitPendingAppointmentPerQuery: 3,
      totalPendingAppointmentPages: 1,
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      date1: '',
      date2: '',
      selectedAppointment: null,

      currentWeekStart: new Date('2025-05-12'),
      selectedAppointment: null, // Lưu lịch khám được chọn
      appointments: [
        {
          id: 1,
          petName: 'Miu',
          ownerName: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          time: '2025-05-12 09:00',
          service: 'Khám sức khỏe tổng quát',
          status: 'Chờ xác nhận',
          note: 'Thú cưng hơi mệt, cần kiểm tra kỹ',
        },
        {
          id: 9,
          petName: 'Miuuu',
          ownerName: 'Nguyễn Văn M',
          email: 'nguyenvanm@example.com',
          time: '2025-05-16 09:00',
          service: 'Khám sức khỏe tổng quát',
          status: 'Chờ xác nhận',
          note: '',
        },
        {
          id: 2,
          petName: 'Bông',
          ownerName: 'Trần Thị B',
          email: 'tranthib@example.com',
          time: '2025-05-12 10:30',
          service: 'Tiêm phòng',
          status: 'Đã xác nhận',
          note: 'Tiêm nhắc lại',
        },
        {
          id: 3,
          petName: 'Rex',
          ownerName: 'Lê Văn C',
          email: 'levanc@example.com',
          time: '2025-05-13 14:00',
          service: 'Cắt tỉa lông',
          status: 'Đã xác nhận',
          note: 'Cắt ngắn lông đuôi',
        },
        {
          id: 4,
          petName: 'Luna',
          ownerName: ' Ascendant: true',
          email: 'phamthid@example.com',
          time: '2025-05-14 15:00',
          service: 'Kiểm tra răng miệng',
          status: 'Đã xác nhận',
          note: '',
        },
        {
          id: 5,
          petName: 'Kiki',
          ownerName: 'Hoàng Văn E',
          email: 'hoangvane@example.com',
          time: '2025-05-16 09:00',
          service: 'Lập trình Web',
          status: 'Đã xác nhận',
          note: 'Học lập trình React',
        },
        {
          id: 6,
          petName: 'Milo',
          ownerName: 'Nguyễn Thị F',
          email: 'nguyenthif@example.com',
          time: '2025-05-17 09:00',
          service: 'Khám sức khỏe',
          status: 'Đã xác nhận',
          note: '',
        },
        {
          id: 7,
          petName: 'Bông 22',
          ownerName: 'Trần Thị B',
          email: 'tranthib@example.com',
          time: '2025-05-12 9:30',
          service: 'Tiêm phòng',
          status: 'Đã hoàn thành',
          note: 'Tiêm phòng dại',
        },
      ],
    };
  }

  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadCodeWorkingStatus();
    if (this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        const { accountInfo } = this.state;
        this.loadVeterinarianInfo(accountInfo.AccountID);
        this.setState({ isLoading: false });
      }, 10);
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        const { accountInfo } = this.state;
        this.loadVeterinarianInfo(accountInfo.AccountID);
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
          accountInfo: accountInfo,
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
  handleLoadCodeWorkingStatus = async () => {
    try {
      const codeWorkingStatuds = await handleGetAllCodesApi('WorkingStatus');
      if (!codeWorkingStatuds || codeWorkingStatuds.length === 0) {
        toast.error('Không thể tải danh sách trạng thái!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeWorkingStatuds,
        workingstatus: codeWorkingStatuds.length > 0 ? codeWorkingStatuds[0].Code : '',
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
    console.log(name, "cach", value)
  };
  handleChangeInfoClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state[field], // Lưu giá trị ban đầu của trường
    });
  };
  loadVeterinarianInfo = async (accountid) => {
    try {
      const response = await handleGetVeterinarianInfoApi(accountid);
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
      console.log('Lỗi khi tải tài khoản:', e);
      toast.error('Lỗi khi tải tài khoản!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleChangeVeterinarianInfo = async (e) => {
    e.preventDefault();
    const { editField, originalValue, accountInfo, bio, specialization, workingstatus, servicesList } = this.state;
    let updateInfo = {
      accountid: accountInfo.AccountID,
      accounttype: accountInfo.AccountType
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
    const { workingstatus, isLoggedIn, accountInfo } = this.state;
    const newStatus = workingstatus === 'WORK' ? 'LEAVE' : 'WORK';
    const accountID = isLoggedIn ? accountInfo.AccountID : null;
    if (!accountID) {
      toast.error('Lỗi không xác nhận được mã tài khoản!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    try {
      const response = await handleChangeWorkingStatusApi(accountID, newStatus);
      if (response && response.errCode === 0) {
        this.setState({ workingstatus: newStatus });
        toast.success('Cập nhật trạng thái thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
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
  handleLoadPendingAppointments = async () => {
    const {
      currentPage,
      limitPendingAppointmentPerQuery,
      searchValue,
      filterValue,
      sortValue,
      date1,
      date2,
      isLoggedIn,
      accountInfo
    } = this.state;
    const accountID = isLoggedIn ? accountInfo.AccountID : null;
    if (!accountID) {
      toast.error('Lỗi không xác nhận được mã tài khoản!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    this.setState({ isLoading: true });
    try {
      const response = await handleLoadPendingAppointmentsApi(accountID, currentPage, limitPendingAppointmentPerQuery, searchValue, filterValue, sortValue, date1, date2);
      if (response && response.errCode === 0) {

        this.setState({
          loadedPendingAppointments: response.data,
          totalPendingAppointmentPages: Math.ceil(response.totalItems / limitPendingAppointmentPerQuery),
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
  handleChangeAppointmentStatus = async (appointmentid, code) => {
    const { isLoggedIn, accountInfo, workingstatus } = this.state;
    const accountID = isLoggedIn ? accountInfo.AccountID : null;
    if (!accountID) {
      toast.error('Lỗi không xác nhận được mã tài khoản!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    let isConfirmed = false;
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận {code === "CONF" ? "xác nhận" : "hủy"} lịch hẹn?</p>
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
    if (isConfirmed && workingstatus === "ACTIVE") {
      try {
        const response = await handleChangeAppointmentStatusApi(appointmentid, code, accountID);
        if (response && response.errCode === 0) {
          if (code === "CONF") {
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
        } else {
          toast.error('Lỗi khi cập nhật lịch hẹn!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
        }
      } catch (e) {
        console.log('Lỗi khi cập nhât lịch hẹn:', e);
        toast.error('Lỗi hệ thống khi cập nhật lịch hẹn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } else {
      toast.info('Hãy bật trạng thái làm việc trước khi thao tác!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      })
    }
  };
  resetDateFilter = (dateField) => {
    this.setState({ [dateField]: null }, () => {
      this.handleLoadPendingAppointments();
    });
  };
  handleFormHoSoNguoiDung = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 1 }, () => {
      this.loadVeterinarianInfo();
    });
  };

  handleFormLichXacNhan = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 2 }, () => {
      this.handleLoadPendingAppointments();
    });
  };
  handleFormLichKham = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 3 });
  };

  handleFormLichSuKham = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 4 });
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

  handlePageChange = (page) => {
    const { totalPendingAppointmentPages } = this.state;
    let newPage = page;
    if (isNaN(page) || page <= 0) newPage = 1;
    else if (page > totalPendingAppointmentPages) newPage = totalPendingAppointmentPages;
    this.setState(
      { currentPage: newPage, tempCurrentPage: newPage.toString() },
      () => this.handleLoadPendingAppointments()
    );
  };

  handlePrevPage = () => {
    this.setState(
      (prevState) => {
        const newPage = Math.max(1, prevState.currentPage - 1);
        return { currentPage: newPage, tempCurrentPage: newPage.toString() };
      },
      () => this.handleLoadPendingAppointments()
    );
  };

  handleNextPage = () => {
    this.setState(
      (prevState) => {
        const newPage = Math.min(prevState.totalPendingAppointmentPages, prevState.currentPage + 1);
        return { currentPage: newPage, tempCurrentPage: newPage.toString() };
      },
      () => this.handleLoadPendingAppointments()
    );
  };

  handlePageInputBlur = () => {
    const { tempCurrentPage } = this.state;
    const page = parseInt(tempCurrentPage, 10);
    this.handlePageChange(page);
  };

  handlePageKeyDown = (event) => {
    if (event.key === 'Enter') {
      const { tempCurrentPage } = this.state;
      const page = parseInt(tempCurrentPage, 10);
      this.handlePageChange(page);
    }
  };

  handleConfirm = (id) => {
    this.setState((prevState) => ({
      appointments: prevState.appointments.map((appointment) => (appointment.id === id ? { ...appointment, status: 'Đã xác nhận' } : appointment)),
    }));
  };

  handleReject = (id) => {
    this.setState((prevState) => ({
      appointments: prevState.appointments.map((appointment) => (appointment.id === id ? { ...appointment, status: 'Đã từ chối' } : appointment)),
    }));
  };

  // Chuyển tuần trước
  handlePreviousWeek = () => {
    this.setState((prevState) => {
      const newWeekStart = new Date(prevState.currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      return { currentWeekStart: newWeekStart };
    });
  };

  // Chuyển tuần sau
  handleNextWeek = () => {
    this.setState((prevState) => {
      const newWeekStart = new Date(prevState.currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      return { currentWeekStart: newWeekStart };
    });
  };

  // Định dạng ngày
  formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Lấy thứ trong tuần (Thứ 2, Thứ 3, ...)
  getDayOfWeek = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };
  // Thêm sự kiện nhấp để xem chi tiết lịch khám
  handleViewDetails = (appointment) => {
    this.setState({
      actionPage: 5,
      selectedAppointment: appointment,
    });
  };
  handleViewAppointment = (appointment) => {
    this.setState({
      actionPage: 6,
      selectedAppointment: appointment,
    });
  };

  renderForm() {
    const { actionPage, appointments, currentWeekStart, selectedAppointment, editField,
      isLoggedIn, accountInfo, bio, servicesList, specialization, workingstatus,
    } = this.state;
    // Lọc và sắp xếp lịch khám đã xác nhận
    const confirmedAppointments = appointments.filter((appointment) => appointment.status === 'Đã xác nhận').sort((a, b) => new Date(a.time) - new Date(b.time));

    // Tính ngày kết thúc tuần
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Nhóm lịch khám theo ngày trong tuần hiện tại
    const groupedAppointments = {};
    const daysInWeek = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      const dayString = this.formatDate(day).slice(0, 10); // Chỉ lấy phần ngày (dd/mm/yyyy)
      daysInWeek.push({ date: day, dayString });
      groupedAppointments[dayString] = [];
    }

    confirmedAppointments.forEach((appointment) => {
      const appointmentDate = this.formatDate(new Date(appointment.time)).slice(0, 10);
      if (groupedAppointments[appointmentDate]) {
        groupedAppointments[appointmentDate].push(appointment);
      }
    });

    // Kiểm tra xem tuần có lịch khám nào không
    const hasAppointmentsInWeek = daysInWeek.some(({ dayString }) => groupedAppointments[dayString].length > 0);
    const { searchValue, filterValue, sortValue, loadedPendingAppointments, currentPage, tempCurrentPage, totalPendingAppointmentPages, date1, date2 } = this.state
    switch (actionPage) {
      case 1:
        return (
          <form className="doctor-info-form" onSubmit={this.handleChangeVeterinarianInfo}>
            <h3>
              <b>Thông tin người dùng:</b>
            </h3>
            <div className="doctor-info-tab">
              <div className="descreption-doctor">Trạng thái làm việc:</div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={workingstatus === 'WORK'}
                  onChange={this.handleChangeWorkingStatus}
                />
                <span className="slider round"></span>
              </label>
              <div className="value-doctor">
                {workingstatus === 'WORK' ? 'Đang làm việc' : 'Tạm nghỉ'}
              </div>
            </div>
            <div className="doctor-info-form-content">
              <div className="doctor-content-left">
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Họ và tên:</div>
                  <div className="doctor-value">{isLoggedIn ? accountInfo.UserName : ''}</div>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Dịch vụ: </div>
                  {servicesList && servicesList.length > 0 ? servicesList.map((item) => (<div className="doctor-value" key={item.ServiceID}> {item.ServiceName} </div>)) : ""}
                  <div className="doctor-value"></div>
                </div>
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
              <div className="filter-sort">
                <select value={filterValue} onChange={(e) => this.handleFilter(e.target.value)}>
                  <option value="ALL">Tất cả</option>
                  <option value="veterinarian-PUBLIC">Lịch hẹn công khai</option>
                  <option value="veterinarian-PRIVATE">Lịch hẹn của tôi</option>
                </select>
                <select value={sortValue} onChange={(e) => this.handleSort(e.target.value)}>
                  <option value="0">Mặc định</option>
                  <option value="1">Mới nhất</option>
                  <option value="2">Cũ nhất</option>
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
                <label>Ngày kết thúc:</label>
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
              <div className="wait-appointment-list">
                {loadedPendingAppointments.length > 0 ? (
                  loadedPendingAppointments.map((appointment) => (
                    <div key={appointment.AppointmentID} className="appointment-item">
                      <div onClick={() => this.handleViewDetails(appointment)}>
                        <p>Tên thú cưng: {appointment.PetName}</p>
                        <p>Chủ: {appointment.CustomerName}</p>
                        <p>Dịch vụ: {appointment.ServiceName}</p>
                        <p>
                          Ngày: {new Date(appointment.AppointmentDate).toLocaleDateString('vi-VN')} -{' '}
                          {appointment.StartTime.slice(0, 5)}
                        </p>
                      </div>
                      <button type="button" onClick={() => this.handleChangeAppointmentStatus(appointment.AppointmentID, "CONF")}>
                        Xác nhận
                      </button>
                      <button type="button" onClick={() => this.handleChangeAppointmentStatus(appointment.AppointmentID, "CANCELED")}>
                        Từ chối
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Không có lịch hẹn nào.</p>
                )}
              </div>
              {totalPendingAppointmentPages > 1 && (
                <div className="pagination">
                  <button onClick={() => this.handlePageChange(1)} disabled={currentPage === 1}>
                    {'<<'}
                  </button>
                  <button onClick={this.handlePrevPage} disabled={currentPage === 1}>
                    {'<'}
                  </button>
                  <input
                    type="text"
                    value={tempCurrentPage}
                    onChange={(e) => this.setState({ tempCurrentPage: e.target.value })}
                    onKeyDown={this.handlePageKeyDown}
                    onBlur={this.handlePageInputBlur}
                  />
                  <span>/ {totalPendingAppointmentPages}</span>
                  <button onClick={this.handleNextPage} disabled={currentPage === totalPendingAppointmentPages}>
                    {'>'}
                  </button>
                  <button onClick={() => this.handlePageChange(totalPendingAppointmentPages)} disabled={currentPage === totalPendingAppointmentPages}>
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
                <b>Lich Kham : </b>
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
                {hasAppointmentsInWeek ? (
                  daysInWeek.map(({ date, dayString }) => {
                    const dayAppointments = groupedAppointments[dayString];
                    // Chỉ hiển thị ngày nếu có lịch khám
                    if (dayAppointments.length === 0) return null;
                    return (
                      <div key={dayString} className="celendar-day-info">
                        <h3>
                          {this.getDayOfWeek(date)}, {dayString}
                        </h3>
                        {dayAppointments.map((appointment) => (
                          <div key={appointment.id} className="calendar-object"
                            onClick={() => this.handleViewDetails(appointment)} // Thêm sự kiện nhấp
                            style={{ cursor: 'pointer' }}>
                            <div className="description-appointment">Thoi gian: {appointment.time.slice(11, 16)}</div>
                            <div className="description-appointment">{appointment.service}</div>
                            <div className="description-appointment">
                              Chủ: {appointment.ownerName} | Thú cưng: {appointment.petName}
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
          </form>
        );
      case 4:
        return (<form className="appointment-history-form">
          <div className="wait-appointment-container">
            <h3>
              <b>Lịch khám cần xác nhận: </b>
            </h3>
            <div className="wait-appointment-list">
              {appointments
                .filter((appointment) => appointment.status === 'Đã hoàn thành')
                .map((appointment) => (
                  <div key={appointment.id} className="wait-appointment-object">
                    <div
                      className="wait-appointment-info"
                      onClick={() => this.handleViewDetails(appointment)} // Thêm sự kiện nhấp
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="wait-appointment-left">
                        <h3 className="wait-appointment-descrpiton">{appointment.petName}</h3>
                        <div className="wait-appointment-descrpiton">Chủ: {appointment.ownerName}</div>
                        <div className="wait-appointment-descrpiton">Dịch vụ: {appointment.service}</div>
                      </div>
                      <div className="wait-appointment-right">
                        <div className="wait-appointment-descrpiton">Ngay kham: {appointment.time}</div>
                        <div className="wait-appointment-descrpiton">Gio kham: {appointment.time}</div>
                        <div className="wait-appointment-descrpiton">Trạng thái: {appointment.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
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
              {selectedAppointment && (
                <div className="appointment-detail-content">
                  <div className="detail-item">
                    <label>Tên khách hàng:</label>
                    <span>{selectedAppointment.ownerName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedAppointment.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tên thú cưng:</label>
                    <span>{selectedAppointment.petName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Dịch vụ:</label>
                    <span>{selectedAppointment.service}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày khám:</label>
                    <span>{selectedAppointment.time}</span>
                  </div>
                  <div className="detail-item">
                    <label>Gio khám:</label>
                    <span>{selectedAppointment.time}</span>
                  </div>
                  <div className="detail-item">
                    <label>Hinh anh:</label>
                    <span>{selectedAppointment.time}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ghi chú:</label>
                    <span>{selectedAppointment.note || 'Không có ghi chú'}</span>
                  </div>
                  <div className="wait-appointment-button">
                    {selectedAppointment.status === 'Chờ xác nhận' ? (
                      <>
                        <button
                          type="button"
                          className="back-button"
                          onClick={() => this.setState({ actionPage: 2 })}
                        >
                          Quay lại
                        </button>
                        <button
                          type="button"
                          className="handleClickCheckOut"
                          onClick={() => this.handleConfirm(selectedAppointment.id)}
                        >
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          className="handleClickCheckOut"
                          onClick={() => this.handleReject(selectedAppointment.id)}
                        >
                          Từ chối
                        </button>
                      </>
                    ) : selectedAppointment.status === 'Đã xác nhận' ? (
                      <div className="appointment-actions">
                        <button
                          type="button"
                          className="back-button"
                          onClick={() => this.setState({ actionPage: 3 })}
                        >
                          Quay lại
                        </button>
                        <button
                          type="button"
                          className="action-button complete-button"
                          onClick={() => this.handleComplete(selectedAppointment.id)}
                        >
                          Hoàn thành
                        </button>
                      </div>
                    ) : (
                      <div className="appointment-actions">
                        <button
                          type="button"
                          className="back-button"
                          onClick={() => this.setState({ actionPage: 4 })}
                        >
                          Quay lại
                        </button>
                      </div>
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
    const { actionPage, selectedAppointment, isLoading } = this.state;
    return (
      <div className="doctor-page">
        <Header navigate={this.props.navigate} userInfo={this.props.userInfo} />
        <ToastContainer />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="doctor-container">
            <div className="doctor-action-form">
              <div className={`doctor-action-info ${actionPage === 1 ? 'active' : ''}`} onClick={this.handleFormHoSoNguoiDung}>
                Hồ sơ bác sĩ
              </div>
              <div className={`doctor-action-wait-appointment ${actionPage === 2 ? 'active' : ''} || ${actionPage === 5 && selectedAppointment.status === 'Chờ xác nhận' ? 'active' : ''}`} onClick={this.handleFormLichXacNhan}>
                Lịch cần xác nhận
              </div>
              <div className={`doctor-action-celendar ${actionPage === 3 ? 'active' : ''} || ${actionPage === 5 && selectedAppointment.status === 'Đã xác nhận' ? 'active' : ''}`} onClick={this.handleFormLichKham}>
                Lịch khám
              </div>
              <div className={`doctor-action-history-appointment ${actionPage === 4 ? 'active' : ''} || ${actionPage === 5 && selectedAppointment.status === 'Đã hoàn thành' ? 'active' : ''}`} onClick={this.handleFormLichSuKham}>
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
});
const mapDispatchToProps = (dispatch) => ({
  userLogin: (userInfo) => dispatch(userLogin(userInfo)),
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);