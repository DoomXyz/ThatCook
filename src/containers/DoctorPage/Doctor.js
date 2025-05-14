import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import { chevronBack, pencil, eyeOutline, eyeOffOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import './Doctor.scss'; // Import SCSS
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actionPage: 1,
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
          status: 'Đã xác nhận',
          note: 'Tiêm phòng dại',
        },
      ],
    };
  }

  async componentDidMount() {}

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

  renderForm() {
    const { actionPage, appointments, currentWeekStart, selectedAppointment } = this.state;

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
        return <form className="doctor-info-form">Hồ sơ bác sĩ</form>;
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
                          <div className="wait-appointment-descrpiton">Thời gian: {appointment.time}</div>
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
                          <div key={appointment.id} className="calendar-object">
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
        return <form className="appointment-history-form">Lịch sử khám</form>;
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
                    <label>Ghi chú:</label>
                    <span>{selectedAppointment.note || 'Không có ghi chú'}</span>
                  </div>
                  <button type="button" className="back-button" onClick={() => this.setState({ actionPage: 2 })}>
                    Quay lại
                  </button>
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
    const { actionPage } = this.state;
    return (
      <div className="doctor-page">
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} />
        <div className="doctor-container">
          <div className="doctor-action-form">
            <div className={`doctor-action-info ${actionPage === 1 ? 'active' : ''}`} onClick={this.handleFormHoSoNguoiDung}>
              Hồ sơ bác sĩ
            </div>
            <div className={`doctor-action-wait-appointment ${actionPage === 2 ? 'active' : ''} || ${actionPage === 5 ? 'active' : ''}`} onClick={this.handleFormLichXacNhan}>
              Lịch cần xác nhận
            </div>
            <div className={`doctor-action-celendar ${actionPage === 3 ? 'active' : ''}`} onClick={this.handleFormLichKham}>
              Lịch khám
            </div>
            <div className={`doctor-action-history-appointment ${actionPage === 4 ? 'active' : ''}`} onClick={this.handleFormLichSuKham}>
              Lịch sử khám
            </div>
          </div>
          <div className="doctor-form">{this.renderForm()}</div>
        </div>
      </div>
    );
  }
}

export default connect()(Doctor);
