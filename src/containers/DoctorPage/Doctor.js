import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';

import { chevronBack, pencil, eyeOutline, eyeOffOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';

import './Doctor.scss'; // Import SCSS

import { handleGetAccountInfoApi, handleLogoutApi, handleChangeAccountInfoApi, handleChangePasswordApi } from '../../services/accountServices';
import { uploadImageToCloudinaryApi, handleGetAllCodesApi } from '../../services/utilitiesServices';

import { userLogin, userLogout } from '../../store/actions';
import { checkLoginStatus } from '../../utils/pakage';

import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      actionPage: 1,
      editField: null, // Theo dõi trường đang chỉnh sửa (ví dụ: "username", "phone", ...)
      originalValue: '',
      userimage: null,
      accountid: '',
      accountname: '',
      username: '',
      phone: '',
      address: '',
      gender: '',
      email: '',
      actionPage: 1,
      codeGender: [],
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
    this.handlePreviceUserImage = this.handlePreviceUserImage.bind(this);
    this.handleUploadUserImage = this.handleUploadUserImage.bind(this);
    this.handleUpdateAccountInfo = this.handleUpdateAccountInfo.bind(this);
  }

  async componentDidMount() {
    await this.handleLoadCodeGender();
    await this.handleIsLogin();
    if (this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        const { accountid } = this.state;
        this.loadAccountInfo(accountid);
        this.setState({ isLoading: false });
      }, 10);
      setTimeout(() => {
        console.log(this.state);
      }, 100);
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        this.loadAccountInfo();
      }, 10);
    }
  }
  componentWillUnmount() {
    if (this.state.userimage && this.state.fileToUpload) {
      URL.revokeObjectURL(this.state.userimage);
    }
  }
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
  handleLoadCodeGender = async () => {
    try {
      const codeGender = await handleGetAllCodesApi('Gender');
      if (!codeGender || codeGender.length === 0) {
        toast.error('Không thể tải danh sách giới tính!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeGender,
        gender: codeGender.length > 0 ? codeGender[0].Code : '',
      });
    } catch (e) {
      console.log('Error loading gender code:', e);
      toast.error('Lỗi khi tải danh sách giới tính!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  triggerLoadInformation = () => {
    this.setState((prevState) => ({
      triggerLoadInformation: !prevState.triggerLoadInformation,
    }));
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
  handleEditClick = (field) => {
    this.setState({
      editField: field,
      originalValue: this.state[field], // Lưu giá trị ban đầu của trường
    });
  };
  handlePreviceUserImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File info:', file.name, file.size, file.type);
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
      const previewUrl = URL.createObjectURL(file);
      console.log('Preview URL:', previewUrl);
      this.setState({
        userimage: previewUrl,
        fileToUpload: file,
      });
    } else {
      console.log('Không có file được chọn!');
    }
  };
  handleUploadUserImage = async () => {
    const { fileToUpload } = this.state;
    if (!fileToUpload) {
      toast.error('Vui lòng chọn ảnh trước!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    try {
      console.log('Gửi yêu cầu upload ảnh lên Cloudinary:', fileToUpload.name, fileToUpload.size);
      const response = await uploadImageToCloudinaryApi(fileToUpload);
      console.log('Kết quả upload từ Cloudinary:', response);
      if (response && response.errCode === 0) {
        const { secure_url } = response.data;
        this.setState({
          userimage: secure_url,
          fileToUpload: null,
        });
        return response.data;
      } else {
        console.error('Lỗi từ Cloudinary:', response.errMessage, response);
        toast.error(response.errMessage || 'Tải ảnh lên Cloudinary thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (error) {
      console.error('Chi tiết lỗi khi tải ảnh:', error.message);
      toast.error(error.message || 'Lỗi kết nối, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleUpdateAccountInfo = async (e) => {
    e.preventDefault();
    const { fileToUpload, isUploading, editField, originalValue, accountid, accountname, username, phone, address, gender, email } = this.state;
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
    // Xử lý upload ảnh nếu có fileToUpload
    if (fileToUpload) {
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
        const imageData = await this.handleUploadUserImage();
        if (imageData) {
          const userIMG = {
            public_id: imageData.public_id,
            secure_url: imageData.secure_url,
            original_filename: imageData.original_filename,
            format: imageData.format,
            created_at: imageData.created_at,
          };
          // Cập nhật anhdaidien trong updateInfo thành userIMG
          updateInfo.userimage = userIMG;
          hasChanges = true; // Có upload ảnh, đánh dấu là có thay đổi
        }
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
  handleFormHoSoNguoiDung = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 1 });
  };

  handleFormLichXacNhan = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 2 });
  };

  handleFormLichKham = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 3 });
  };

  handleFormLichSuKham = (e) => {
    e.preventDefault();
    this.setState({ actionPage: 4 });
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
    const { actionPage, appointments, currentWeekStart, selectedAppointment, doctorimage, accountname, doctorname, phone, address, gender, email, codeGender, editField } = this.state;

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

    switch (actionPage) {
      case 1:
        return (
          <form className="doctor-info-form" onSubmit={this.handleUpdateAccountInfo}>
            <h3>
              <b>Thông tin người dùng:</b>
            </h3>
            <div className="doctor-info-tab">
              <div className="descreption-doctor">button tang thai </div>
            </div>
            <div className="doctor-info-form-content">
              <div className="doctor-content-left">
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Email:</div>
                  <div className="value-doctor email">{email}</div>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Tên tài khoản:</div>
                  {editField === 'accountname' ? <input type="text" name="accountname" value={accountname} onChange={this.handleAccountInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{accountname}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('accountname')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Họ và tên:</div>
                  {editField === 'doctorname' ? <input type="text" name="doctorname" value={doctorname} onChange={this.handleAccountInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{doctorname}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('doctorname')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Số điện thoại: </div>
                  {editField === 'phone' ? <input type="text" name="phone" value={phone} onChange={this.handleAccountInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{phone}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('phone')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Địa chỉ:</div>
                  {editField === 'address' ? <input type="text" name="address" value={address} onChange={this.handleAccountInfoChange} className="value-doctor-input" /> : <div className="value-doctor">{address}</div>}
                  <button type="button" className="edit-button" onClick={() => this.handleEditClick('address')}>
                    <IonIcon icon={pencil}></IonIcon>
                  </button>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">Giới tính:</div>
                  <div className="value-doctor gender-radio-group">
                    {codeGender.map((item) => (
                      <label key={item.Code} className="gender-radio">
                        <input type="radio" name="gender" value={item.Code} checked={gender === item.Code} onChange={this.handleAccountInfoChange} />
                        {item.CodeValueVI}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">tieu su</div>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">chuyen khoa </div>
                </div>
                <div className="doctor-info-tab">
                  <div className="descreption-doctor">dich vu </div>
                </div>
                <div className="change-info-button" onSubmit={this.handleUpdateAccountInfo}>
                  <button> Cập nhật </button>
                </div>
              </div>
              <div className="doctor-content-right">
                <div className="doctor-content-right-img-content">
                  <div className="doctor-content-img-description">Ảnh đại diện</div>
                  <div className="doctor-content-img-info">
                    <img className="doctor-content-img-info" src={doctorimage} alt="" />
                  </div>
                </div>
                <div className="doctor-content-img-button">
                  <input type="file" accept="image/*" id="upload-avatar" onChange={this.handlePrevicedoctorImage} />
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
              <div className="wait-appointment-list">
                {appointments
                  .filter((appointment) => appointment.status === 'Chờ xác nhận')
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

                      <div className="wait-appointment-button">
                        {appointment.status === 'Chờ xác nhận' && (
                          <>
                            <button type="button" onClick={() => this.handleConfirm(appointment.id)} className="wait-appointment-button-accept">
                              Xác nhận
                            </button>
                            <button type="button" onClick={() => this.handleReject(appointment.id)} className="wait-appointment-button-refuse">
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
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
    const { actionPage, selectedAppointment } = this.state;
    return (
      <div className="doctor-page">
        <Header navigate={this.props.navigate} userInfo={this.props.userInfo} triggerLoadInformation={this.state.triggerLoadInformation} />
        <ToastContainer />
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
