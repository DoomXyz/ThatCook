// import React, { Component } from 'react';
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from '../containers/Login/Login';
import AdminPage from '../containers/AdminPage/Admin';
import Register from '../containers/Register/Register';
import Home from '../containers/Home/Home';
import UserPage from '../containers/UserPage/User';
import CheckOut from '../containers/CheckOut/CheckOut';
import ForgotPassword from '../containers/UserUtilities/ForgotPassword';
import Cart from '../containers/Cart/Cart';
import Bill from '../containers/Track/Track';
import OwnerPage from '../containers/OwnerPage/Owner';
import MainPage from '../containers/MainPage/MainPage';
import HomeAppointment from '../containers/HomeAppointment/HomeAppointment';
import MakeAppointment from '../containers/MakeAppointment/MakeAppointment';
import ShowDoctor from '../containers/ShowDoctor/ShowDoctor';
import GenHealthCheck from '../containers/GenHealthCheck/GenHealthCheck';
import Vaccination from '../containers/Vaccination/Vaccination';
import Surgery from '../containers/Surgery/Surgery';
import Test from '../containers/Test/Test';
import DoctorPage from '../containers/DoctorPage/Doctor';
import AppointmentCheckOut from '../containers/AppointmentCheckOut/AppointmentCheckOut';
// class AppRoutes extends Component {
//     render() {
//         const { navigate } = this.props; // Nhận navigate từ props
//         return (
//             <Routes>
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/user" element={<UserPage />} />
//             </Routes>
//         );
//     }
// }
//bên trên là viết theo class còn bên dưới là chuyển sang function để phù hợp với react-dom6
const AppRoutes = () => {
  const navigate = useNavigate(); // Lấy navigate từ hook
  return (
    //navigate bên trái là tên tự đặt, nếu đổi thành nav thì bên Login.js hay chỗ nào dùng
    //phải đổi từ this.props.navigate('/...') sang this.props.nav('/...')
    <Routes>
      <Route path="/" element={<MainPage navigate={navigate} />} />
      <Route path="/login" element={<Login navigate={navigate} />} />
      <Route path="/register" element={<Register navigate={navigate} />} />
      <Route path="/home" element={<Home navigate={navigate} />} />

      <Route path="/user/admin" element={<AdminPage navigate={navigate} />} />

      <Route path="/cart" element={<Cart navigate={navigate} />} />
      <Route path="/checkout" element={<CheckOut navigate={navigate} />} />
      <Route path="/track" element={<Bill navigate={navigate} />} />
      <Route path="/user/veterinarian" element={<DoctorPage navigate={navigate} />} />
      <Route path="/forgotpassword" element={<ForgotPassword navigate={navigate} />} />
      <Route path="/user/customer" element={<UserPage navigate={navigate} />} />
      <Route path="/user/owner" element={<OwnerPage navigate={navigate} />} />
      <Route path="/homeappointment" element={<HomeAppointment navigate={navigate} />} />
      <Route path="/makeappointment" element={<MakeAppointment navigate={navigate} />} />
      <Route path="/showdoctor" element={<ShowDoctor navigate={navigate} />} />
      <Route path="/appointmentcheckout" element={<AppointmentCheckOut navigate={navigate} />} />
      <Route path="/service/genhealthcheck" element={<GenHealthCheck navigate={navigate} />} />
      <Route path="/service/vaccination" element={<Vaccination navigate={navigate} />} />
      <Route path="/service/surgery" element={<Surgery navigate={navigate} />} />
      <Route path="/service/test" element={<Test navigate={navigate} />} />
    </Routes>
  );
};

export default AppRoutes;
