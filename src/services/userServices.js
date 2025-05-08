import axios from "../axios";

//converted
const handleRegisterApi = (userInfo) => {
  return axios.post("/api/register", userInfo);
}
const handleLoginApi = (accountname, password, rememberLogin) => {
  return axios.post("/api/login", { accountname, password, rememberLogin });
};
const handleVerifyTokenApi = () => {
  return axios.get("/api/verify-token");
}
const handleLogoutApi = () => {
  return axios.get("/api/logout");
}
const handleGetAccountInfoApi = (accountid) => {
  return axios.get(`/api/get-accountinfo?accountid=${accountid}`)
}

const handleLoadAccountInfoApi = (page, limit, search, filter, sort) => {
  return axios.get(`/api/load-accountinfo?page=${page}&limit=${limit}&search=${search}&filter=${filter}&sort=${sort}`);
};

const handleChangeAccountStatusApi = (accountid, accountstatus) => {
  return axios.put("/api/change-accountstatus", { accountid, accountstatus })
}
//non converted


//truyền trang, giới hạn, nội dung tìm kiếm, nội dung lọc và nội dung sắp xếp xuống backend
const getAllTaiKhoan = ({ page, limit, search, filter, sort }) => {
  return axios.get(`/api/get-alltaikhoan?page=${page}&limit=${limit}&search=${search || ''}&filter=${filter || 'ALL'}&sort=${sort || '0'}`);
};
const handleEditTaiKhoan = (userInfo) => {
  return axios.put("/api/edit-taikhoan", userInfo);
};

//cách truyền tham số nhưng khác cái trên
const deleteTaiKhoan = (id) => { //disabled
  return axios.delete("/api/delete-taikhoan", {
    data: {
      matk: id,
    },
  });
};

const handleGetThongTinThanhToan = (mataikhoan) => {
  return axios.get(`/api/get-thongtin-thanhtoan?mataikhoan=${mataikhoan}`);
};

const handleChangePassword = (mataikhoan, password, newpassword) => {
  return axios.put("/api/change-password", { mataikhoan, password, newpassword })
}

export {
  handleRegisterApi,
  handleLoginApi,
  handleVerifyTokenApi,
  handleLogoutApi,
  handleGetAccountInfoApi,
  handleLoadAccountInfoApi,
  handleChangeAccountStatusApi,

  getAllTaiKhoan,
  handleEditTaiKhoan,
  deleteTaiKhoan,
  handleGetThongTinThanhToan,
  handleChangePassword,
};