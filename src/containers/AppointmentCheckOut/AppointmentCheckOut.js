import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon

import { closeOutline } from 'ionicons/icons'; //chỉ import các icon cần dùng

import './AppointmentCheckOut.scss'; //import scss
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';

import { handleLoadAppointmentDetailsApi, handleCreateAppointmentBillApi } from '../../services/appointmentServices';

import { saveFuAppointmentInfo, clearAppointmentCheckout, saveTrackInfo } from '../../store/actions';
import { uploadImages } from '../../utils/pakage';

class AppointmentCheckOut extends Component {
    constructor(props) {
        super(props);
        this.fileInputRef = React.createRef();
        this.state = {
            veterinarianid: '',
            appointmentid: '',
            image: null,
            isLoading: true,
            isUploading: false,
            loadedAppointmentDetail: null,
            medicalNotes: '',
            medicalPrice: '',
            totalPayment: '',
        };
    }
    async componentDidMount() {
        if (this.props.appointmentCheckout) {
            const { veterinarianid, appointmentid } = this.props.appointmentCheckout.appointmentData;
            this.setState({
                veterinarianid,
                appointmentid,
            });
            await this.handleLoadAppointmentDetails(appointmentid);
        } else {
            this.props.navigate('/home');
        }
    }
    componentWillUnmount() {
        if (this.state.image?.Image && this.state.image?.file) {
            URL.revokeObjectURL(this.state.image.Image);
        }
    }
    handleLoadAppointmentDetails = async (appointmentid) => {
        this.setState({ isLoading: true });
        try {
            const response = await handleLoadAppointmentDetailsApi(appointmentid);
            if (response && response.errCode === 0) {
                this.setState({
                    loadedAppointmentDetail: response.data,
                    totalPayment: parseFloat(response.data.Service.Price || 0),
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
        if (this.state.image?.Image) {
            URL.revokeObjectURL(this.state.image.Image);
        }
        const preview = URL.createObjectURL(file);
        this.setState({
            image: { ImageID: Date.now(), Image: preview, file },
        });
        if (this.fileInputRef.current) {
            this.fileInputRef.current.value = null;
        }
    };
    handleRemoveImage = () => {
        if (this.state.image?.Image) {
            URL.revokeObjectURL(this.state.image.Image);
        }
        this.setState({ image: null });
    };
    handleOnChangeInput = (event, type) => {
        let value = event.target.value;
        if (type === 'medicalPrice' && value && isNaN(value)) return; // Ngăn nhập chữ
        let copyState = { ...this.state, [type]: value };
        if (type === 'medicalPrice') {
            copyState.medicalPrice = parseFloat(value || 0);
        }
        copyState.totalPayment = this.handleCalculateTotalPayment(copyState.medicalPrice);
        this.setState(copyState);
    };
    handleCalculateTotalPayment = (medicalPrice) => {
        const servicePrice = parseFloat(this.state.loadedAppointmentDetail?.Service?.Price || 0);
        return servicePrice + medicalPrice;
    };
    checkValidateInput = () => {
        const { veterinarianid, appointmentid, medicalPrice, medicalNotes } = this.state;
        const { Service } = this.state.loadedAppointmentDetail || {};
        if (!veterinarianid || !appointmentid || !Service || medicalPrice === '' || medicalPrice === undefined) {
            return {
                errCode: -1,
                errMessage: 'Thiếu thông tin hóa đơn!',
            };
        }
        const servicePrice = parseFloat(Service.Price || 0);
        if (servicePrice <= 0) {
            return {
                errCode: -1,
                errMessage: 'Giá dịch vụ không hợp lệ!',
            };
        }
        const medicalPriceValue = parseFloat(medicalPrice || 0);
        if (isNaN(medicalPriceValue) || medicalPriceValue < 0) {
            return {
                errCode: -1,
                errMessage: 'Giá thuốc không hợp lệ!',
            };
        }
        if (medicalNotes) {
            const notesCheck = medicalNotes.trim();
            if (!notesCheck || notesCheck.length > 65535) {
                return {
                    errCode: 1,
                    errMessage: 'Ghi chú y tế không hợp lệ hoặc vượt quá giới hạn ký tự!',
                };
            }
        }
        return { errCode: 0, errMessage: 'Kiểm tra thông tin hoàn tất!' };
    };
    handleCreateAppointmentBill = async () => {
        try {
            this.setState({ isLoading: true });
            const { veterinarianid, medicalNotes, medicalPrice, loadedAppointmentDetail, image, isUploading } = this.state;
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
            let medicalImage = null;
            if (image) {
                this.setState({ isUploading: true });
                const uploadResult = await uploadImages([{ file: image.file }]);
                if (!uploadResult.status) {
                    toast.error(uploadResult.error, {
                        position: 'top-right',
                        autoClose: 500,
                        closeOnClick: true,
                    });
                    this.setState({ isUploading: false });
                    return;
                }
                medicalImage = uploadResult.images[0].Image;
            }
            const appointmentBillInfo = {
                veterinarianid,
                appointmentid: loadedAppointmentDetail.AppointmentID,
                serviceprice: loadedAppointmentDetail.Service.Price,
                medicalprice: medicalPrice,
                medicalimage: medicalImage,
                medicalnotes: medicalNotes,
            };
            const response = await handleCreateAppointmentBillApi(appointmentBillInfo);
            if (response && response.errCode === 0) {
                toast.success(
                    <div>
                        Hoàn tất thanh đoán!
                        <div style={{ marginTop: '10px' }}>
                            <button
                                onClick={() => {
                                    this.props.saveFuAppointmentInfo({ appointmentid: response.data.AppointmentID });
                                    this.props.clearAppointmentCheckout();
                                    this.props.navigate('/makeappointment');
                                }}
                                style={{
                                    marginRight: '10px',
                                    color: 'blue',
                                    textDecoration: 'underline',
                                    background: 'none',
                                    border: 'none',
                                }}
                            >
                                Tạo lịch tái khám
                            </button>
                            <button
                                onClick={() => {
                                    this.props.saveTrackInfo({ billid: response.data.AppointmentBillID, billtype: 3 });
                                    this.props.clearAppointmentCheckout();
                                    this.props.navigate('/track');
                                }}
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                    background: 'none',
                                    border: 'none',
                                }}
                            >
                                Xem hóa đơn
                            </button>
                        </div>
                    </div>,
                    {
                        autoClose: 2000,
                        closeOnClick: false,
                        onClose: () => {
                            this.props.clearAppointmentCheckout();
                            this.props.navigate('/user/veterinarian');
                        },
                    }
                );
            } else {
                this.setState({ isLoading: false });
                toast.error(response.errMessage, {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
            }
        } catch (e) {
            this.setState({ isLoading: false });
            toast.error(`Lỗi khi tải ảnh: ${e.message}`, {
                position: 'top-right',
                autoClose: 1000,
                closeOnClick: true,
            });
        }
    };
    render() {
        const { isLoading, image, isUploading, loadedAppointmentDetail } = this.state;
        if (!loadedAppointmentDetail) {
            return <Spinner />;
        }
        const { CustomerName, CustomerEmail, CustomerPhone, Pet, Service } = loadedAppointmentDetail;
        return (
            <div className="appointment-check-out-body">
                <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} />
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
                    <div className="appointment-check-out-content">
                        <div className="appointment-check-out-content-top">
                            <h1>Thông Tin Thanh Toán</h1>
                        </div>
                        <div className="f">
                            <div className="appointment-check-out-content-left ">
                                <div className="appointment-check-out-content-left-cus-info">
                                    <h1>*Thông tin khách hàng:</h1>
                                    <div className="f">
                                        <p>Tên khách hàng:</p> <label>{CustomerName}</label>
                                    </div>
                                    <br />
                                    <div className="f">
                                        <p>Email:</p> <label>{CustomerEmail}</label>
                                    </div>

                                    <br />
                                    <div className="f">
                                        <p>Số điện thoại: </p>
                                        <label>{CustomerPhone}</label>
                                    </div>

                                    <br />
                                    <div className="f">
                                        <p>Tên thú cưng:</p>
                                        <label>{Pet.PetName}</label>
                                    </div>
                                </div>
                                <div className="appointment-check-out-content-left-service-medicine-total">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Dịch vụ</th>
                                                <th colSpan={2}>Giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{Service.ServiceName}</td>
                                                <td>{parseFloat(Service.Price).toLocaleString('vi-VN')}</td>
                                                <td>vnđ</td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td>Tiền thuốc</td>
                                                <td>
                                                    <input type="text" placeholder="Nhập phí thuốc" value={this.state.medicalPrice} onChange={(e) => this.handleOnChangeInput(e, 'medicalPrice')} />
                                                </td>
                                                <td>vnđ</td>
                                            </tr>
                                            <tr>
                                                <td>TỔNG CỘNG</td>
                                                <td>{this.state.totalPayment.toLocaleString('vi-VN')}</td>
                                                <td>vnđ</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            <div className="appointment-check-out-content-right">
                                <div className="appointment-check-out-content-right-img-item f">
                                    {image && (
                                        <div className="image-container">
                                            <img src={image.Image} alt="Hình ảnh" />
                                            <button className="delete-img" onClick={this.handleRemoveImage} disabled={isUploading}>
                                                <IonIcon icon={closeOutline}></IonIcon>
                                            </button>
                                        </div>
                                    )}
                                    {!image && (
                                        <div className="add-img">
                                            <input type="file" accept="image/*" onChange={this.handleAddImage} style={{ display: 'none' }} id="upload-image" disabled={isUploading} ref={this.fileInputRef} />
                                            <label htmlFor="upload-image" className="add-img-label">
                                                +
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="appointment-check-out-content-right-notes">
                                    <p>*Thêm ghi chú nếu có</p>
                                    <div className="appointment-check-out-content-right-notes-item">
                                        <textarea value={this.state.medicalNotes} onChange={(e) => this.handleOnChangeInput(e, 'medicalNotes')} placeholder="Nhập ghi chú y tế"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="appointment-check-out-content-bottom">
                            <button onClick={this.handleCreateAppointmentBill} disabled={isUploading}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    appointmentCheckout: state.appointment.appointmentCheckout,
});

const mapDispatchToProps = (dispatch) => ({
    saveFuAppointmentInfo: (fuAppointmentInfo) => dispatch(saveFuAppointmentInfo(fuAppointmentInfo)),
    clearAppointmentCheckout: () => dispatch(clearAppointmentCheckout()),
    saveTrackInfo: (trackData) => dispatch(saveTrackInfo(trackData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppointmentCheckOut);