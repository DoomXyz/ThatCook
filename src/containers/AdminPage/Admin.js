import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react"; //import thư viện icon

import { pencil, addOutline, logOutOutline, lockClosed, searchOutline, homeOutline, } from "ionicons/icons"; //chỉ import các icon cần dùng

import "./Admin.scss";
import Spinner from '../../components/Spinner';

import { handleLoadAccountInfoApi, handleRegisterApi, handleChangeAccountInfoApi, handleLogoutApi, handleChangeAccountStatusApi } from "../../services/accountServices";
import { handleGetAllCodesApi } from "../../services/utilitiesServices"

import { checkLoginStatus } from '../../utils/pakage';
import { userLogin, userLogout } from "../../store/actions";

import CreateAccountModal from "./CreateAccountModal";
import EditAccountModal from "./EditAccountModal";

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      isLoading: true,
      accountInfo: null,
      codeGender: [],
      codeAccountType: [],
      codeAccountStatus: [],
      loadedAccountInfo: [],
      selectedAccount: null,
      currentPage: 1,
      tempCurrentPage: "1",
      limitAccountPerQuery: 10,
      searchValue: "",
      filterValue: "ALL",
      sortValue: "0",
      totalPages: 1,
      isShowCreateAccountModal: false,
      isShowEditAccountModal: false,
    };
    this.debounceTimeout = null;
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadGender();
    await this.handleLoadAccountType();
    await this.handleLoadAccountStatus();
    await this.handleLoadAccountInfo();
  }
  handleLoadGender = async () => {
    try {
      const codeGender = await handleGetAllCodesApi('Gender');
      if (!codeGender || codeGender.length === 0) {
        toast.error("Không thể tải danh sách giới tính!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeGender,
      });
    } catch (e) {
      console.log("Error loading gender code:", e);
      toast.error("Lỗi khi tải danh sách giới tính!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleLoadAccountType = async () => {
    try {
      const codeAccountType = await handleGetAllCodesApi('AccountType');
      if (!codeAccountType || codeAccountType.length === 0) {
        toast.error("Không thể tải danh sách quyền hạn!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeAccountType,
      });
    } catch (e) {
      console.log("Error loading accounttype code:", e);
      toast.error("Lỗi khi tải danh sách quyền hạn!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleLoadAccountStatus = async () => {
    try {
      const codeAccountStatus = await handleGetAllCodesApi('AccountStatus');
      if (!codeAccountStatus || codeAccountStatus.length === 0) {
        toast.error("Không thể tải trạng thái tài khoản!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeAccountStatus,
      });
    } catch (e) {
      console.log("Error loading accountstatus code:", e);
      toast.error("Lỗi khi tải trạng thái tài khoản!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleIsLogin = async () => {
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo && accountInfo.AccountType === "A") {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          accountInfo,
          isLoggedIn: true,
        })
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          accountInfo: null,
          isLoggedIn: false,
        })
        this.props.navigate("/login")
      }
    } catch (e) {
      this.props.navigate("/login");
      console.log("Token not found!")
    }
    this.setState({
      isLoading: false
    })
  };

  handleLoadAccountInfo = async () => {
    const { currentPage, limitAccountPerQuery, searchValue, filterValue, sortValue } = this.state
    try {
      const response = await handleLoadAccountInfoApi(currentPage, limitAccountPerQuery, searchValue, filterValue, sortValue)
      if (response && response.errCode === 0) {
        this.setState((prevState) => ({
          loadedAccountInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitAccountPerQuery),
          currentPage: Math.min(prevState.currentPage, prevState.totalPages),
          tempCurrentPage: Math.min(prevState.currentPage, prevState.totalPages)
        }));
      }
    } catch (e) {
      console.log("Error loading accountinfo:", e);
      toast.error("Lỗi khi load danh sách sản phẩm!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  }
  handleFilterAccount = (value) => {
    this.setState({
      filterValue: value,
      currentPage: 1
    }, () => {
      this.handleLoadAccountInfo();
    });
  };
  handleSortAccount = (value) => {
    this.setState({
      sortValue: value,
      currentPage: 1
    }, () => {
      this.handleLoadAccountInfo();
    });
  };
  handleSearchChange = (event) => {
    const value = event.target.value;
    this.setState({
      searchValue: value,
      currentPage: 1
    }, () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        this.handleLoadAccountInfo();
      }, 500);
    });
  };
  handleClearSearch = () => {
    this.setState({
      searchValue: "",
      currentPage: 1
    }, () => {
      this.handleLoadAccountInfo();
    }
    );
  };
  //ẩn hiện modal tạo tài khoản
  toggleCreateUserModal = () => {
    this.setState({
      isShowCreateAccountModal: !this.state.isShowCreateAccountModal,
    });
  };
  //ẩn hiện modal chỉnh sửa tài khoản
  toggleEditAccountModal = () => {
    this.setState({
      isShowEditAccountModal: !this.state.isShowEditAccountModal,
    });
  };
  handleSelectedAccount = (accountid) => {
    this.setState({
      selectedAccount: accountid,
      isShowEditAccountModal: true,
    });
  };
  //tạo tài khoản từ thông tin truyền từ modal về
  handleCreateAccountFromModal = async (userInfo) => {
    this.setState({
      isLoading: true
    })
    try {
      const response = await handleRegisterApi(userInfo);
      if (response && response.errCode === 0) {
        toast.success("Tạo người dùng thành công!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
        await this.handleLoadAccountInfo();
        this.setState({
          isShowCreateAccountModal: false,
        })
      } else {
        const errMessage = response?.errMessage || "Đăng ký tài khoản thất bại!";
        toast.error(errMessage, {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
      }
    } catch (e) {
      console.error("Register:", e);
      toast.error("Xảy ra lỗi khi đăng ký, vui lòng thử lại!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true
      });
    }
    this.setState({
      isLoading: false
    })
  };
  //sửa user qua thông tin từ modal
  handleEditAccountFromModal = async (userInfo) => {
    this.setState({
      isLoading: true
    })
    try {
      const response = await handleChangeAccountInfoApi(userInfo);
      if (response && response.errCode === 0) {
        toast.success("Chỉnh sửa thông tin người dùng thành công!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
        await this.handleLoadAccountInfo();
        this.setState({
          isShowEditAccountModal: false,
        })
      } else {
        const errMessage = response?.errMessage || "Chỉnh sửa thông tin người dùng thất bại!";
        toast.error(errMessage, {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
      }
    } catch (e) {
      console.error("Edit:", e);
      toast.error("Xảy ra lỗi khi chỉnh sửa, vui lòng thử lại!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true
      });
    }
    this.setState({
      isLoading: false
    })
  };
  handleChangeAccountStatus = async (userInfo) => {
    const confirmChange = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>{`Bạn có muốn ${userInfo.AccountStatus === "ACT" ? "khóa" : "mở khóa"
              } tài khoản ${userInfo.UserName} không?`}</p>
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
          { position: "top-right", autoClose: 1000, closeOnClick: false }
        );
      });
    let isConfirmed = await confirmChange();
    if (isConfirmed) {
      this.setState({ isLoading: true })
      if (userInfo.AccountType === "A") {
        toast.info("Không thể khóa tài khoản quản trị viên!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      } else {
        const newStatus = userInfo.AccountStatus === "ACT" ? "DIS" : "ACT"
        try {
          const response = await handleChangeAccountStatusApi(userInfo.AccountID, newStatus)
          if (response) {
            toast.success(response.errMessage, {
              position: "top-right",
              autoClose: 500,
              closeOnClick: true
            });
          }
        } catch (e) {
          console.log("Error changing accountstatus:", e);
          toast.error("Lỗi khi thay đổi trạng thái tài khoản!", {
            position: "top-right",
            autoClose: 500,
            closeOnClick: true,
          });
        }
      }
    }
    await this.handleLoadAccountInfo();
    this.setState({ isLoading: false })
  };

  handleLogout = async () => {
    const confirmLogout = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận đăng xuất?</p>
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
          { autoClose: 1000, closeOnClick: false }
        );
      });
    const isConfirmed = await confirmLogout();
    if (isConfirmed) {
      try {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          isLoggedIn: false,
          accountInfo: null,
        })
        this.props.navigate("/home");
        toast.success("Đăng xuất thành công!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
      } catch (e) {
        console.log(e)
        toast.error("Đăng xuất thất bại. Vui lòng thử lại!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true
        });
      }
    }
  };

  handlePageChange = (page) => {
    this.setState({
      isLoading: true,
    })
    const { totalPages } = this.state;
    let newPage = page;
    // Xử lý giá trị không hợp lệ
    if (isNaN(page) || page <= 0) {
      newPage = 1; // Nếu nhập chữ, ký tự, hoặc số không hợp lệ, về trang 1
    } else if (page > totalPages) {
      newPage = totalPages; // Nếu nhập số lớn hơn totalPages, đặt thành totalPages
    }
    this.setState({
      isLoading: false,
      currentPage: newPage,
      tempCurrentPage: newPage.toString()
    }, () => {
      this.handleLoadAccountInfo();
    });
  };

  handlePrevPage = () => {
    this.setState((prevState) => {
      const newPage = Math.max(1, prevState.currentPage - 1);
      return {
        currentPage: newPage,
        tempCurrentPage: newPage.toString()
      };
    }, () => {
      this.handleLoadAccountInfo();
    });
  };

  handleNextPage = () => {
    this.setState((prevState) => {
      const newPage = Math.min(prevState.totalPages, prevState.currentPage + 1);
      return {
        currentPage: newPage,
        tempCurrentPage: newPage.toString()
      };
    }, () => {
      this.handleLoadAccountInfo();
    });
  };

  handlePageInputChange = (event) => {
    const value = event.target.value;
    this.setState({ tempCurrentPage: value });
  };

  handlePageInputBlur = () => {
    const { tempCurrentPage } = this.state;
    const page = parseInt(tempCurrentPage, 10);
    this.handlePageChange(page)
  };

  handlePageKeyDown = (event) => {
    if (event.key === "Enter") {
      const { tempCurrentPage } = this.state;
      const page = parseInt(tempCurrentPage, 10);
      this.handlePageChange(page);
    }
  };
  getGenderValue = (code) => {
    const gender = this.state.codeGender.find(item => item.Code === code);
    return gender ? gender.CodeValueVI : code;
  };

  getAccountTypeValue = (code) => {
    const accountType = this.state.codeAccountType.find(item => item.Code === code);
    return accountType ? accountType.CodeValueVI : code;
  };

  getAccountStatusValue = (code) => {
    const accountStatus = this.state.codeAccountStatus.find(item => item.Code === code);
    return accountStatus ? accountStatus.CodeValueVI : code;
  };

  render() {
    const { isLoading, loadedAccountInfo, searchValue, filterValue, sortValue, currentPage, totalPages, codeGender, codeAccountType, codeAccountStatus,
      isShowCreateAccountModal, isShowEditAccountModal, selectedAccount, tempCurrentPage } = this.state;
    console.log(codeGender, codeAccountType, codeAccountStatus)
    return (
      <div className="admin-container">
        <CreateAccountModal
          isOpen={isShowCreateAccountModal}
          toggleFromModal={this.toggleCreateUserModal}
          handleCreateAccountFromModal={this.handleCreateAccountFromModal}
        />
        <EditAccountModal
          isOpen={isShowEditAccountModal}
          toggleFromModal={this.toggleEditAccountModal}
          selectedAccountID={selectedAccount}
          handleEditAccountFromModal={this.handleEditAccountFromModal}
        />
        <ToastContainer />
        {isLoading ? <Spinner /> : (
          <div>
            <div className="admin-action">
              <div className="admin-action-left">
                <div
                  className="btn-Home"
                  onClick={() => {
                    this.props.navigate("/home");
                  }}
                >
                  <IonIcon icon={homeOutline}></IonIcon>
                </div>
                <div
                  className="btn-addTK"
                  onClick={() => this.toggleCreateUserModal()}
                >
                  <button>
                    THÊM TÀI KHOẢN <IonIcon icon={addOutline}></IonIcon>
                  </button>
                </div>
              </div>
              <div>
                <h1>THÔNG TIN NGƯỜI DÙNG</h1>
              </div>
              <div className="admin-action-right">
                <div className="btn-logoutTK" onClick={this.handleLogout}>
                  <button>
                    ĐĂNG XUẤT<IonIcon icon={logOutOutline}></IonIcon>
                  </button>
                </div>
              </div>
            </div>
            <div className="admin-search">
              <div className="admin-search-left">
                <div className="admin-search-box">
                  <div className="inputbox">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, email, SĐT"
                      value={searchValue}
                      onChange={this.handleSearchChange}
                    />
                    <div className="btn-search">
                      <IonIcon
                        icon={searchOutline}
                        className="search-icon"
                      ></IonIcon>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-search-right">
                <div>
                  <label>Lọc:</label>
                  <select
                    value={filterValue}
                    onChange={(event) => this.handleFilterAccount(event.target.value)}
                  >
                    <option value="ALL">Mặc định (Tất cả)</option>
                    <optgroup label="Theo Quyền Hạn">
                      <option value="accounttype-A">Admin</option>
                      <option value="accounttype-O">Chủ cửa hàng</option>
                      <option value="accounttype-V">Bác sĩ thú y</option>
                      <option value="accounttype-C">Khách hàng</option>
                    </optgroup>
                    <optgroup label="Theo Giới Tính">
                      <option value="gender-M">Nam</option>
                      <option value="gender-F">Nữ</option>
                      <option value="gender-O">Khác</option>
                    </optgroup>
                    <optgroup label="Theo Trạng Thái">
                      <option value="accountstatus-ACT">Hoạt động</option>
                      <option value="accountstatus-DIS">Không hoạt động</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label>Sắp Xếp:</label>
                  <select
                    value={sortValue}
                    onChange={(event) => this.handleSortAccount(event.target.value)}
                  >
                    <option value="0">Mặc định</option>
                    <option value="1">A-Z</option>
                    <option value="2">Z-A</option>
                    <option value="3">Theo Quyền Hạn</option>
                    <option value="4">Theo Trạng Thái</option>
                    <option value="5">Theo Giới tính</option>
                    <option value="6">Thời gian tạo mới nhất </option>
                    <option value="7">Thời gian tạo cũ nhất </option>
                  </select>
                </div>
              </div>
            </div>
            <div className="admin-list">
              <div className="users-table">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Mã TK</th>
                      <th>Email</th>
                      <th>Tên TK</th>
                      <th>Họ tên người dùng</th>
                      <th>Giới tính</th>
                      <th>SĐT</th>
                      <th>Địa chỉ</th>
                      <th>Quyền Hạn</th>
                      <th>Trạng Thái</th>
                      <th>Thời gian tạo</th>
                      <th>Action</th>
                    </tr>
                    {loadedAccountInfo.length > 0 ? (
                      loadedAccountInfo.map((item) => (
                        <tr
                          key={item.AccountID}
                          className={
                            item.AccountStatus === "ACT"
                              ? "status-act"
                              : "status-dis"
                          }
                        >
                          <td>
                            <p>{item.AccountID}</p>
                          </td>
                          <td>{item.Email}</td>
                          <td>{item.AccountName}</td>
                          <td>{item.UserName}</td>
                          <td>{this.getGenderValue(item.Gender)}</td>
                          <td>{item.Phone}</td>
                          <td>{item.Address}</td>
                          <td>{this.getAccountTypeValue(item.AccountType)}</td>
                          <td>{this.getAccountStatusValue(item.AccountStatus)}</td>
                          <td>
                            {new Date(item.CreatedAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td>
                            <button
                              className="btn-edit"
                              onClick={() => this.handleSelectedAccount(item.AccountID)}
                            >
                              <IonIcon icon={pencil}></IonIcon>
                            </button>
                            <button
                              className="btn-lock"
                              onClick={() => this.handleChangeAccountStatus(item)}
                            >
                              <IonIcon icon={lockClosed}></IonIcon>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" style={{ textAlign: "center" }}>
                          Không tìm thấy người dùng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button className="first"
                      onClick={this.handleFirstPage}
                      disabled={currentPage === 1}
                    >
                      {"<<"}
                    </button>
                    <button className="prev"
                      onClick={this.handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      {"<"}
                    </button>
                    <input
                      type="text"
                      value={tempCurrentPage}
                      onChange={this.handlePageInputChange}
                      onKeyDown={this.handlePageKeyDown}
                      onBlur={this.handlePageInputBlur}
                    />
                    <span className="total-pages">/ {totalPages}</span>
                    <button className="next"
                      onClick={this.handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      {">"}
                    </button>
                    <button className="last"
                      onClick={this.handleLastPage}
                      disabled={currentPage === totalPages}
                    >
                      {">>"}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
export default connect(mapStateToProps, mapDispatchToProps)(Admin);
