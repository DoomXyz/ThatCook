import React, { Component } from "react";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import { ToastContainer, toast } from "react-toastify";
import {} from "ionicons/icons"; //chỉ import các icon cần dùng
import "./MakeAppointment.scss"; //import scss
import Header from "../../components/HomeHeader";
import Footer from "../../components/HomeFooter";
import { handleCreateAppointmentApi } from "../../services/appointmentServices";
import {
  handleGetAllCodesApi,
  uploadImageToCloudinaryApi,
} from "../../services/utilitiesServices";

import test from "../../assets/productha/hinhtest3.jpg";
import { set } from "lodash";
import { type } from "@testing-library/user-event/dist/type";

class MakeAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customername: "",
      customerphone: "",
      customeremail: "",
      petname: "",
      pettype: "",
      age: "",
      petgender: "",
      petweight: "",
      appointmentdate: "",
      selectedDoctorID: "",
      selectedServiceID: "",
      selectedPetID: "",
      starttime: "",
      notes: "",
      codePetType: [],
      codeService: [],
      codePetGender: [],
      loadedWorkingTime: [],
      imageInfo: [],
      isLoading: true,
    };
  }
  async componentDidMount() {
    await this.handleLoadCodePetType();
    await this.handleLoadCodePetGender();
    setTimeout(() => {
      console.log(this.state.codePetType);
      console.log(this.state.codePetGender);
    }, 10);
  }
  componentDidUpdate() {
    setTimeout(() => {
      console.log(this.state.petgender);
      console.log(this.state.pettype);
    }, 10);
  }

  handleLoadCodePetType = async () => {
    try {
      const codePetType = await handleGetAllCodesApi("PetType");
      if (!codePetType || codePetType.length === 0) {
        toast.error("Không thể tải danh sách loại thú cưng!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codePetType,
        pettype: codePetType.length > 0 ? codePetType[0].Code : "",
      });
    } catch (e) {
      toast.error("Không thể tải danh sách loại thú cưng!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCodePetGender = async () => {
    try {
      const codePetGender = await handleGetAllCodesApi("PetGender");
      if (!codePetGender || codePetGender.length === 0) {
        toast.error("Không thể tải danh sách giới tính!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codePetGender });
    } catch (e) {
      toast.error("Không thể tải danh sách giới tính!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleOnChangeInput = (event, type) => {
    let copyState = { ...this.state };
    copyState[type] = event.target.value;
    this.setState({
      ...copyState,
    });
  };

  render() {
    const { codePetType, codePetGender, petgender, pettype } = this.state;
    return (
      <div className="makeappointment-body">
        <Header
          navigate={this.props.navigate}
          cartItems={this.props.cartItems}
          userInfo={this.props.userInfo}
          triggerCountCartItem={this.state.triggerCountCartItem}
        />
        <div className="makeappointment-content">
          {" "}
          <h1>Thông tin đặt lịch</h1>
          <div className="makeappointment-content-user-info">
            <b>*Thông tin Khách hàng</b>
            <input type="text" placeholder="Hãy nhập Họ và Tên"></input>
            <input type="text" placeholder="Hãy nhập Số điện thoại"></input>
            <input type="text" placeholder="Hãy nhập Email"></input>
          </div>
          <div className="makeappointment-content-pet">
            <button>Xem danh sách thú cưng</button>
          </div>
          <div className="makeappointment-content-pet-info">
            <b>*Thông tin Thú cưng</b>

            <input type="text" placeholder="Hãy nhập Tên thú cưng"></input>
            <div className="f">
              <select
                value={pettype}
                onChange={(event) => this.handleOnChangeInput(event, "pettype")}
              >
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
              <input type="text" placeholder="Hãy nhập Tuổi"></input>
            </div>

            <div className="f">
              <select
                value={petgender}
                onChange={(event) =>
                  this.handleOnChangeInput(event, "petgender")
                }
              >
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
              <input type="text" placeholder="Hãy nhập Cân nặng"></input>
            </div>
          </div>
          <div className="makeappointment-content-doctor">
            <div className="f">
              <button>Chọn bác sĩ</button>
              <p>*Không bắt buộc</p>
            </div>
          </div>
          <div className="makeappointment-content-date">
            <div className="f">
              <button>Chọn lịch</button>
              <button>Reset</button>
            </div>
          </div>
          <div className="f">
            <div className="makeappointment-content-service">
              <p>
                <b>*Dịch vụ</b>
              </p>
              <select>
                <option>1234234234</option>
              </select>
            </div>
            <div className="makeappointment-content-time">
              <p>
                <b>*Khung giờ</b>
              </p>
              <select>
                <option>1223422344</option>
              </select>
            </div>
          </div>
          <textarea placeholder="Mô tả tình trạng thú cưng"></textarea>
          <div className="makeappointment-content-petimgs">
            <p>
              <b>*Thêm hình ảnh ( tối đa 4 )</b>
            </p>
            <div className="makeappointment-content-petimgs-block">
              <div className="makeappointment-content-petimgs-item">
                <img src={test} />
                <button>X</button>
              </div>

              <button className="add">+</button>
            </div>
          </div>
          <button className="makeapp">Gửi yêu cầu</button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(MakeAppointment);
