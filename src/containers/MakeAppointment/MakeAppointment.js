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
import { handleCreateAppointmentApi, handleGetAvailableTimesApi, handleGetServiceInfoApi } from '../../services/appointmentServices';
import { handleGetAllCodesApi, uploadImageToCloudinaryApi } from '../../services/utilitiesServices';
import test from '../../assets/productha/hinhtest3.jpg';
import PetSelectModal from './PetSelectModal';
import VeterinarianSelectModal from './VeterinarianSelectModal';

class MakeAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customername: '',
      customerphone: '',
      customeremail: '',
      petname: '',
      pettype: '',
      age: '',
      petgender: '',
      petweight: '',
      appointmentDateTime: null,
      selectedDoctorID: '',
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
    };
  }
  async componentDidMount() {
    await this.handleLoadCodePetType();
    await this.handleLoadCodePetGender();
    await this.handleLoadCodeService();
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 10);
  }

  componentWillUnmount() {
    this.state.allImages.forEach((img) => {
      if (img.Image && img.file) URL.revokeObjectURL(img.Image);
    });
  }

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
      this.setState({ codePetGender });
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
          selectedServiceID: '',
        });
        return;
      }
      this.setState({
        codeService: response.data,
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
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({ ...copyState }, () => {
      if (['selectedDoctorID', 'selectedServiceID'].includes(type)) {
        const { appointmentDateTime, selectedServiceID } = this.state;
        if (appointmentDateTime && selectedServiceID) {
          this.handleLoadAvailableTimes();
        } else {
          this.setState({ availableTimes: [], starttime: '' });
        }
      }
    });
  };
  handleOnChangeDateInput = (date) => {
    this.setState({ appointmentDateTime: date }, () => {
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
      const { appointmentDateTime, selectedDoctorID, selectedServiceID } = this.state;
      if (!appointmentDateTime || !selectedServiceID) {
        this.setState({ availableTimes: [], starttime: '' });
        return;
      }
      const formattedDate = appointmentDateTime.toISOString().split('T')[0];
      const vetID = selectedDoctorID || 'ALL';
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
  handleSubmitAppointment = async () => {
    try {
      this.setState({ isLoading: true });
      const { customername, customerphone, customeremail, petname, pettype, petgender, age, petweight, appointmentDateTime, selectedDoctorID, selectedServiceID, starttime, notes, selectedPetID, allImages, isUploading } = this.state;

      if (isUploading) {
        toast.info('Đang tải ảnh, vui lòng chờ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }

      const uploadedImages = [];
      if (allImages.length > 0) {
        this.setState({ isUploading: true });
        for (let img of allImages) {
          if (img.file) {
            try {
              const response = await uploadImageToCloudinaryApi(img.file);
              if (response.errCode === 0) {
                uploadedImages.push({
                  ImageID: img.ImageID,
                  Image: response.data.secure_url,
                });
              } else {
                toast.error(`Không thể tải ảnh ${img.file.name}!`, {
                  position: 'top-right',
                  autoClose: 500,
                  closeOnClick: true,
                });
              }
            } catch (e) {
              toast.error(`Lỗi khi tải ảnh ${img.file.name}!`, {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
              });
            }
          } else {
            uploadedImages.push({
              ImageID: img.ImageID,
              Image: img.Image,
            });
          }
        }
      }

      const appointmentdate = appointmentDateTime ? appointmentDateTime.toISOString().split('T')[0] : '';
      const response = await handleCreateAppointmentApi({
        customername,
        customerphone,
        customeremail,
        petname,
        pettype,
        petgender,
        age,
        petweight,
        appointmentdate,
        starttime,
        notes,
        accountid: this.props.userInfo?.AccountID || null,
        veterinarianid: selectedDoctorID,
        serviceid: selectedServiceID,
        petid: selectedPetID,
        imageInfo: uploadedImages, // Include uploaded images
      });

      if (response.errCode === 0) {
        toast.success('Đặt lịch thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({ allImages: [] }); // Clear images after success
        this.props.navigate('/home');
      } else {
        toast.error(response.errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      toast.error('Lỗi khi đặt lịch!', {
        position: 'top-right',
        autoClose: 500,
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

  handleSelectPetFromModal = (petID) => {
    console.log('Selected Pet ID:', petID);
    this.setState({ selectedPetID: petID });
  };

  handleSelectVeterinarianFromModal = (vetID) => {
    console.log('Selected Veterinarian ID:', vetID);
    this.setState({ selectedDoctorID: vetID });
  };
  render() {
    const { isLoading, codePetType, codePetGender, petgender, pettype, customername, customerphone, customeremail, petname, age, petweight, appointmentDateTime, selectedServiceID, codeService, starttime, availableTimes, notes, allImages, isShowPetSelectModal, isShowVeterinarianSelectModal, selectedPetID, selectedDoctorID } = this.state;
    return (
      <div className="makeappointment-body">
        <ToastContainer />
        <PetSelectModal isOpen={isShowPetSelectModal} toggleFromModal={this.togglePetSelectModal} handleSelectPetFromModal={this.handleSelectPetFromModal} />
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
                <input type="text" placeholder="Hãy nhập Họ và Tên" value={customername} onChange={(event) => this.handleOnChangeInput(event, 'customername')} />
                <input type="text" placeholder="Hãy nhập Số điện thoại" value={customerphone} onChange={(event) => this.handleOnChangeInput(event, 'customerphone')} />
                <input type="text" placeholder="Hãy nhập Email" value={customeremail} onChange={(event) => this.handleOnChangeInput(event, 'customeremail')} />
              </div>
              <div className="makeappointment-content-pet">
                <button onClick={this.togglePetSelectModal}>Xem danh sách thú cưng</button>
                {selectedPetID && <p>Thú cưng đã chọn: {selectedPetID}</p>}
              </div>
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
              <div className="makeappointment-content-doctor">
                <div className="f">
                  <button onClick={this.toggleVeterinarianSelectModal}>Chọn bác sĩ</button>
                  <p>*Không bắt buộc</p>
                  {selectedDoctorID && <p>Bác sĩ đã chọn: {selectedDoctorID}</p>}
                </div>
              </div>
              <div className="makeappointment-content-date">
                <div className="f">
                  <DatePicker selected={appointmentDateTime} onChange={this.handleOnChangeDateInput} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" className="date-picker" />
                  <button onClick={() => this.handleOnChangeDateInput(null)}>Reset</button>
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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(MakeAppointment);
