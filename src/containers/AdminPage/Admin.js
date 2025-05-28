import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import Select from 'react-select';

import { pencil, addOutline, logOutOutline, lockClosed, lockOpenOutline, searchOutline, homeOutline } from 'ionicons/icons'; //chỉ import các icon cần dùng

import './Admin.scss';
import Spinner from '../../components/Spinner';
import CreateAccountModal from './CreateAccountModal';
import EditAccountModal from './EditAccountModal';

import { handleLoadAccountInfoApi, handleRegisterApi, handleChangeAccountInfoApi, handleLogoutApi, handleChangeAccountStatusApi } from '../../services/accountServices';
import { handleLoadServiceInfoApi, handleCreateServiceApi, handleChangeServiceInfoApi, handleChangeServiceStatusApi } from '../../services/serviceServices'
import { handleGetAllCodesApi, handleLoadAllCodesInfoApi, handleCreateCodeApi, handleChangeCodeApi } from '../../services/utilitiesServices';

import { getAllCodes, checkLoginStatus, validateCodeInput, validateServiceInput } from '../../utils/pakage';
import { userLogin, userLogout } from '../../store/actions';

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Authentication & General
      actionPage: 1,
      isLoading: true,
      isLoggedIn: false,
      accountInfo: null,
      // Codes
      codeGender: [],
      codeAccountType: [],
      codeAccountStatus: [],
      codeServiceStatus: [],
      codeTypeFilter: [],
      // Pagination
      currentPage: 1,
      tempCurrentPage: '1',
      limitAccountPerQuery: 10,
      limitCodePerQuery: 10,
      limitServicePerQuery: 5,
      totalPages: 1,
      // Filtering & Sorting
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      // Data Lists
      loadedAccountInfo: [],
      loadedCodeInfo: [],
      loadedServiceInfo: [],
      // Modals & Selections
      isShowCreateAccountModal: false,
      isShowEditAccountModal: false,
      selectedAccount: null,
      selectedCode: null,
      // Code Management
      isEditingCode: null,
      isAddingCode: false,
      // Service Management
      isEditingService: null,
      isAddingService: false,
      // DisableButton
      disabledButtons: {
        logout: false,
        changeStatus: false,
        addItem: false,
        saveItem: false,
      },
    };
    this.debounceTimeout = null;
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadAccountInfo();
    await this.handleLoadCode(['Gender', 'AccountType', 'AccountStatus', 'ServiceStatus']);
    await this.handleLoadCodeTypeFilter();
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.actionPage !== this.state.actionPage) {
      this.handleReloadData(this.state.actionPage)
    }
  }
  //login logout
  handleIsLogin = async () => {
    try {
      this.setState({ isLoading: true });
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo && accountInfo.AccountType === 'A') {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          accountInfo,
          isLoggedIn: true,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          accountInfo: null,
          isLoggedIn: false,
        });
        this.props.navigate('/login');
      }
    } catch (e) {
      this.props.navigate('/login');
    } finally {
      this.setState({ isLoading: false });
    }
  };
  handleLogout = async () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, logout: true } })
    const confirmAction = () =>
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
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, logout: false } }) },
          }
        );
      });
    const isConfirmed = await confirmAction();
    if (isConfirmed) {
      try {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          isLoggedIn: false,
          accountInfo: null,
        });
        toast.success('Đăng xuất thành công!');
        this.props.navigate('/login')
      } catch (e) {
        console.log(e);
        toast.error('Đăng xuất thất bại. Vui lòng thử lại!');
      }
    }
  };
  //load filter/code
  handleLoadCode = async (codeTypeFilter) => {
    try {
      this.setState({ isLoading: true });
      const responses = await Promise.all(codeTypeFilter.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypeFilter.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  handleLoadCodeTypeFilter = async () => {
    try {
      const response = await handleGetAllCodesApi('ALL');
      if (response && response.length !== 0) {
        this.setState({ codeTypeFilter: response });
      } else {
        toast.error('Không thể tải danh sách Type!');
      }
    } catch (e) {
      console.log('Error loading code types:', e);
      toast.error('Lỗi khi tải danh sách Type!');
    }
  };
  //load data info
  handleReloadData = (type) => {
    switch (type) {
      case 1:
        this.handleLoadAccountInfo();
        break;
      case 2:
        this.handleLoadAllCodesInfo();
        break;
      case 3:
        this.handleLoadServiceInfo();
        break;
      default:
        break;
    }
  };
  handleLoadAccountInfo = async () => {
    const { currentPage, limitAccountPerQuery, searchValue, filterValue, sortValue } = this.state;
    try {
      const response = await handleLoadAccountInfoApi(currentPage, limitAccountPerQuery, searchValue, filterValue, sortValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedAccountInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitAccountPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading accountinfo:', e);
      toast.error('Lỗi khi load danh sách sản phẩm!');
    }
  };
  handleLoadAllCodesInfo = async () => {
    const { currentPage, limitCodePerQuery, searchValue, filterValue, sortValue } = this.state;
    try {
      let response = await handleLoadAllCodesInfoApi(currentPage, limitCodePerQuery, searchValue, filterValue, sortValue);
      if (response && response.data.errCode === 0) {
        this.setState({
          loadedCodeInfo: response.data.data,
          totalPages: Math.ceil(response.data.totalItems / limitCodePerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading code info:', e);
      toast.error('Lỗi khi load danh sách AllCodes!');
    }
  };
  handleLoadServiceInfo = async () => {
    const { currentPage, limitServicePerQuery, searchValue, filterValue, sortValue } = this.state;
    try {
      let responseApi = await handleLoadServiceInfoApi(currentPage, limitServicePerQuery, searchValue, filterValue, sortValue);
      const response = responseApi.data
      if (response && response.errCode === 0) {
        this.setState({
          loadedServiceInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitServicePerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading service info:', e);
      toast.error('Lỗi khi load danh sách dịch vụ!');
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
      }, () => {
        this.handleReloadData(type);
      }
    );
  };
  handleResetFilter = (type) => {
    this.setState(
      {
        currentPage: 1,
        tempCurrentPage: '1',
        searchValue: '',
        filterValue: 'ALL',
        sortValue: '0',
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
  //form action
  handleChangeAccountStatus = async (userInfo) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, changeStatus: true } })
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>{`Bạn có muốn ${userInfo.AccountStatus === 'ACT' ? 'khóa' : 'mở khóa'} tài khoản ${userInfo.UserName} không?`}</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, changeStatus: false } }) },
          }
        );
      });
    let isConfirmed = await confirmAction();
    if (isConfirmed) {
      this.setState({ isLoading: true });
      if (userInfo.AccountType === 'A') {
        toast.info('Không thể khóa tài khoản quản trị viên!');
      } else {
        const newStatus = userInfo.AccountStatus === 'ACT' ? 'DIS' : 'ACT';
        try {
          const response = await handleChangeAccountStatusApi(userInfo.AccountID, newStatus);
          if (response) {
            toast.success(response.errMessage);
            await this.handleLoadAccountInfo();
          }
        } catch (e) {
          console.log('Error changing accountstatus:', e);
          toast.error('Lỗi khi thay đổi trạng thái tài khoản!');
        }
      }
    }
    await this.handleLoadAccountInfo();
    this.setState({ isLoading: false });
  };
  handleChangeServiceStatus = async (serviceInfo) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, changeStatus: true } })
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>{`Bạn có muốn ${serviceInfo.ServiceStatus === 'VALID' ? 'vô hiệu hóa' : 'kích hoạt'} dịch vụ ${serviceInfo.ServiceName} không?`}</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, changeStatus: false } }) },
          }
        );
      });
    let isConfirmed = await confirmAction();
    if (isConfirmed) {
      this.setState({ isLoading: true });
      const newStatus = serviceInfo.ServiceStatus === 'VALID' ? 'INVALID' : 'VALID';
      try {
        const responseApi = await handleChangeServiceStatusApi(serviceInfo.ServiceID, newStatus);
        const response = responseApi.data
        if (response && response.errCode === 0) {
          toast.success(response.errMessage);
          await this.handleLoadServiceInfo();
        }
      } catch (e) {
        console.log('Error changing service status:', e);
        toast.error('Lỗi khi thay đổi trạng thái dịch vụ!');
      }
      await this.handleLoadServiceInfo();
      this.setState({ isLoading: false });
    }
  };
  //toggle modal
  toggleCreateUserModal = () => {
    this.setState({
      isShowCreateAccountModal: !this.state.isShowCreateAccountModal,
    });
  };
  toggleEditAccountModal = () => {
    this.setState({
      isShowEditAccountModal: !this.state.isShowEditAccountModal,
    });
  };
  //modal input
  handleSelectedAccount = (accountid) => {
    this.setState({
      selectedAccount: accountid,
      isShowEditAccountModal: true,
    });
  };
  //modal action
  handleCreateAccountFromModal = async (userInfo) => {
    this.setState({ isLoading: true, });
    try {
      const response = await handleRegisterApi(userInfo);
      if (response && response.errCode === 0) {
        toast.success('Tạo người dùng thành công!');
        await this.handleLoadAccountInfo();
        this.setState({
          isShowCreateAccountModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Đăng ký tài khoản thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Register:', e);
      toast.error('Xảy ra lỗi khi đăng ký, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleEditAccountFromModal = async (userInfo) => {
    this.setState({
      isLoading: true,
    });
    try {
      const response = await handleChangeAccountInfoApi(userInfo);
      if (response && response.errCode === 0) {
        toast.success('Chỉnh sửa thông tin người dùng thành công!');
        await this.handleLoadAccountInfo();
        this.setState({
          isShowEditAccountModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Chỉnh sửa thông tin người dùng thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Edit:', e);
      toast.error('Xảy ra lỗi khi chỉnh sửa, vui lòng thử lại!');
    }
    this.setState({
      isLoading: false,
    });
  };
  //on table change action (service)
  handleEditService = (index) => {
    this.setState({ isEditingService: index, isAddingService: false });
  };
  handleAddService = () => {
    if (this.state.isAddingService || this.state.isEditingService !== null) {
      this.setState({ disabledButtons: { ...this.state.disabledButtons, addItem: true } });
      const confirmAction = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>{this.state.isAddingService ? 'Bạn đang thêm dịch vụ mới chưa lưu. Lưu hoặc hủy trước khi thêm dịch vụ mới?' : 'Bạn có thay đổi chưa lưu. Hủy thay đổi và thêm dịch vụ mới?'}</p>
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
              onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, addItem: false } }); },
            }
          );
        });
      confirmAction().then((isConfirmed) => {
        if (isConfirmed) {
          this.setState(
            {
              isEditingService: null,
              isAddingService: false,
            },
            async () => {
              await this.handleLoadServiceInfo();
              this.setState((prevState) => ({
                loadedServiceInfo: [
                  {
                    ServiceID: Date.now(),
                    ServiceName: '',
                    Price: '',
                    Duration: '',
                    Description: '',
                    ServiceStatus: 'VALID',
                  },
                  ...prevState.loadedServiceInfo,
                ],
                isEditingService: 0,
                isAddingService: true,
              }));
            }
          );
        }
      });
    } else {
      this.setState((prevState) => ({
        loadedServiceInfo: [
          {
            ServiceID: Date.now(),
            ServiceName: '',
            Price: '',
            Duration: '',
            Description: '',
            ServiceStatus: 'VALID',
          },
          ...prevState.loadedServiceInfo,
        ],
        isEditingService: 0,
        isAddingService: true,
      }));
    }
  };
  handleCancelService = () => {
    this.setState(
      {
        isEditingService: null,
        isAddingService: false,
      },
      async () => {
        await this.handleLoadServiceInfo();
      }
    );
  };
  handleServiceChange = (index, field, value) => {
    this.setState((prevState) => {
      const newServices = [...prevState.loadedServiceInfo];
      newServices[index] = { ...newServices[index], [field]: value };
      return { loadedServiceInfo: newServices };
    });
  };
  handleSaveService = async (index) => {
    const isValidateInput = validateServiceInput(this.state.loadedServiceInfo[index]);
    if (!isValidateInput.valid) {
      toast.error(`${isValidateInput.errMessage} tại dòng ${index + 1}`);
      return;
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, saveItem: true } });
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận lưu thông tin dịch vụ?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, saveItem: false } }); },
          }
        );
      });
    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;
    this.setState({ isLoading: true });
    try {
      const serviceInfo = {
        ServiceID: this.state.loadedServiceInfo[index].ServiceID,
        ServiceName: this.state.loadedServiceInfo[index].ServiceName.trim(),
        Price: parseFloat(this.state.loadedServiceInfo[index].Price).toFixed(2),
        Duration: parseInt(this.state.loadedServiceInfo[index].Duration),
        Description: this.state.loadedServiceInfo[index].Description ? this.state.loadedServiceInfo[index].Description.trim() : null,
      };
      let apiResponse;
      if (this.state.isAddingService) {
        apiResponse = await handleCreateServiceApi(serviceInfo);
      } else {
        apiResponse = await handleChangeServiceInfoApi(serviceInfo);
      }
      const response = apiResponse.data;
      if (response && response.errCode === 0) {
        toast.success(this.state.isAddingService ? 'Tạo dịch vụ thành công!' : 'Chỉnh sửa dịch vụ thành công!');
        await this.handleLoadServiceInfo();
        this.setState({
          isEditingService: null,
          isAddingService: false,
        });
      } else {
        const errMessage = response?.errMessage || (this.state.isAddingService ? 'Tạo dịch vụ thất bại!' : 'Chỉnh sửa dịch vụ thất bại!');
        toast.error(errMessage);
      }
    } catch (e) {
      console.error(this.state.isAddingService ? 'Create Service:' : 'Edit Service:', e);
      toast.error(`Xảy ra lỗi khi ${this.state.isAddingService ? 'tạo' : 'chỉnh sửa'} dịch vụ, vui lòng thử lại!`);
    }
    this.setState({ isLoading: false });
  };
  //on table change action (code)
  handleEditCode = (index) => {
    this.setState({ isEditingCode: index, isAddingCode: false });
  };
  handleAddCode = () => {
    if (this.state.isAddingCode || this.state.isEditingCode !== null) {
      this.setState({ disabledButtons: { ...this.state.disabledButtons, addItem: true } });
      const confirmAction = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>{this.state.isAddingCode ? 'Bạn đang thêm mã mới chưa lưu. Lưu hoặc hủy trước khi thêm mã mới?' : 'Bạn có thay đổi chưa lưu. Hủy thay đổi và thêm mã mới?'}</p>
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
              onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, addItem: false } }); },
            }
          );
        });

      confirmAction().then((isConfirmed) => {
        if (isConfirmed) {
          this.setState(
            {
              isEditingCode: null,
              isAddingCode: false,
            },
            async () => {
              await this.handleLoadAllCodesInfo();
              this.setState((prevState) => ({
                loadedCodeInfo: [
                  {
                    CodeID: Date.now(),
                    Type: '',
                    Code: '',
                    CodeValueVI: '',
                    ExtraValue: '',
                  },
                  ...prevState.loadedCodeInfo,
                ],
                isEditingCode: 0,
                isAddingCode: true,
              }));
            }
          );
        }
      });
    } else {
      this.setState((prevState) => ({
        loadedCodeInfo: [
          {
            CodeID: Date.now(),
            Type: '',
            Code: '',
            CodeValueVI: '',
            ExtraValue: '',
          },
          ...prevState.loadedCodeInfo,
        ],
        isEditingCode: 0,
        isAddingCode: true,
      }));
    }
  };
  handleCancelCode = () => {
    this.setState(
      {
        isEditingCode: null,
        isAddingCode: false,
      },
      async () => {
        await this.handleLoadAllCodesInfo();
      }
    );
  };
  handleCodeChange = (index, field, value) => {
    this.setState((prevState) => {
      const newCodes = [...prevState.loadedCodeInfo];
      newCodes[index] = { ...newCodes[index], [field]: value };
      return { loadedCodeInfo: newCodes };
    });
  };
  handleSaveCode = async (index) => {
    const isValidateInput = validateCodeInput(this.state.loadedCodeInfo[index]);
    if (!isValidateInput.valid) {
      toast.error(`${isValidateInput.errMessage} tại dòng ${index + 1}`);
      return;
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, saveItem: true } });
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận lưu thông tin AllCodes?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, saveItem: false } }); },
          }
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const codeInfo = {
        CodeID: this.state.loadedCodeInfo[index].CodeID,
        Type: this.state.loadedCodeInfo[index].Type.trim(),
        Code: this.state.loadedCodeInfo[index].Code.trim(),
        CodeValueVI: this.state.loadedCodeInfo[index].CodeValueVI.trim(),
        ExtraValue: this.state.loadedCodeInfo[index].ExtraValue ? parseFloat(this.state.loadedCodeInfo[index].ExtraValue).toFixed(2) : null,
      };

      let apiResponse;
      if (this.state.isAddingCode) {
        apiResponse = await handleCreateCodeApi(codeInfo);
      } else {
        apiResponse = await handleChangeCodeApi(codeInfo);
      }
      const response = apiResponse.data;
      if (response && response.errCode === 0) {
        toast.success(this.state.isAddingCode ? 'Tạo AllCodes thành công!' : 'Chỉnh sửa AllCodes thành công!');
        await this.handleLoadAllCodesInfo();
        this.setState({
          isEditingCode: null,
          isAddingCode: false,
        });
      } else {
        const errMessage = response?.errMessage || (this.state.isAddingCode ? 'Tạo AllCodes thất bại!' : 'Chỉnh sửa AllCodes thất bại!');
        toast.error(errMessage);
      }
    } catch (e) {
      console.error(this.state.isAddingCode ? 'Create AllCodes:' : 'Edit AllCodes:', e);
      toast.error(`Xảy ra lỗi khi ${this.state.isAddingCode ? 'tạo' : 'chỉnh sửa'} AllCodes, vui lòng thử lại!`);
    }
    this.setState({ isLoading: false });
  };
  //form controller
  handleFormAccountManagement = (e) => {
    e.preventDefault();
    this.setState(
      {
        actionPage: 1,
        currentPage: 1,
        tempCurrentPage: '1',
        searchValue: '',
        filterValue: 'ALL',
        sortValue: '0',
        isEditingCode: null,
        isAddingCode: false,
        isEditingService: null,
        isAddingService: false,
      }, async () => {
        await this.handleLoadAccountInfo();
      }
    );
  };
  handleFormCodeManagement = (e) => {
    e.preventDefault();
    this.setState(
      {
        actionPage: 2,
        currentPage: 1,
        tempCurrentPage: '1',
        searchValue: '',
        filterValue: 'ALL',
        sortValue: '0',
        isEditingCode: null,
        isAddingCode: false,
        isEditingService: null,
        isAddingService: false,
      }, async () => {
        await this.handleLoadAllCodesInfo();
      }
    );
  };
  handleFormServiceManagement = (e) => {
    e.preventDefault();
    this.setState(
      {
        actionPage: 3,
        currentPage: 1,
        tempCurrentPage: '1',
        searchValue: '',
        filterValue: 'ALL',
        sortValue: '0',
        isEditingCode: null,
        isAddingCode: false,
        isEditingService: null,
        isAddingService: false,
      }, async () => {
        await this.handleLoadServiceInfo();
      }
    );
  };
  renderSection = () => {
    const { actionPage, searchValue, filterValue, sortValue, currentPage, tempCurrentPage, totalPages,
      codeGender, codeAccountType, codeAccountStatus, codeServiceStatus, codeTypeFilter,
      loadedAccountInfo, loadedCodeInfo, loadedServiceInfo,
      isEditingCode, isAddingCode, isEditingService, isAddingService, disabledButtons,
      limitCodePerQuery, limitServicePerQuery } = this.state;
    switch (actionPage) {
      case 1:
        return (
          <div>
            <div className="admin-search">
              <div className="admin-search-left">
                <div className="admin-search-box">
                  <div className="inputbox">
                    <input type="text" placeholder="Tìm kiếm theo tên người dùng, email hoặc SĐT" value={searchValue} onChange={(event) => this.handleSearchChange(event, 1)} />
                    <div className="btn-search">
                      <IonIcon icon={searchOutline} className="search-icon"></IonIcon>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-search-right">
                <button onClick={() => this.handleResetFilter(1)}>Reset</button>
                <div className="alo">
                  <label>Lọc:</label>
                  <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 1)}>
                    <option value="ALL">Mặc định (Tất cả)</option>
                    <optgroup label="Theo Quyền Hạn">
                      {codeAccountType.map((item) => (
                        <option key={item.Code} value={`accounttype-${item.Code}`}>
                          {item.CodeValueVI}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Theo Giới Tính">
                      {codeGender.map((item) => (
                        <option key={item.Code} value={`gender-${item.Code}`}>
                          {item.CodeValueVI}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Theo Trạng Thái">
                      {codeAccountStatus.map((item) => (
                        <option key={item.Code} value={`accountstatus-${item.Code}`}>
                          {item.CodeValueVI}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="alo">
                  <label>Sắp Xếp:</label>
                  <select value={sortValue} onChange={(event) => this.handleSort(event.target.value, 1)} className="select-2">
                    <option value="0">Mặc định</option>
                    <option value="1">Tên (A-Z)</option>
                    <option value="2">Tên (Z-A)</option>
                    <option value="3">Thời gian tạo mới nhất</option>
                    <option value="4">Thời gian tạo cũ nhất</option>
                  </select>
                </div>
              </div>
              <div className="btn-addTK" onClick={() => this.toggleCreateUserModal()}>
                <button>
                  TẠO TÀI KHOẢN <IonIcon icon={addOutline}></IonIcon>
                </button>
              </div>
            </div>
            <div className="admin-list">
              <div className="users-table">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Mã tài khoản</th>
                      <th>Email</th>
                      <th>Họ tên người dùng</th>
                      <th>Giới tính</th>
                      <th>SĐT</th>
                      <th>Địa chỉ</th>
                      <th>Quyền Hạn</th>
                      <th>Trạng Thái</th>
                      <th>Thời gian tạo</th>
                      <th></th>
                    </tr>
                    {loadedAccountInfo.length > 0 ? (
                      loadedAccountInfo.map((item) => (
                        <tr key={item.AccountID} className={item.AccountStatus === 'ACT' ? 'status-act' : 'status-dis'}>
                          <td>
                            <p>{item.AccountID}</p>
                          </td>
                          <td>{item.Email}</td>
                          <td>{item.UserName}</td>
                          <td>{codeGender.find((filterItem) => filterItem.Code === item.Gender)?.CodeValueVI || item.Gender}</td>
                          <td>{item.Phone}</td>
                          <td>{item.Address}</td>
                          <td>{codeAccountType.find((filterItem) => filterItem.Code === item.AccountType)?.CodeValueVI || item.AccountType}</td>
                          <td>{codeAccountStatus.find((filterItem) => filterItem.Code === item.AccountStatus)?.CodeValueVI || item.AccountStatus}</td>
                          <td>{new Date(item.CreatedAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <button className="btn-edit" onClick={() => this.handleSelectedAccount(item.AccountID)}>
                              <IonIcon icon={pencil}></IonIcon>
                            </button>
                            <button className="btn-lock" onClick={() => this.handleChangeAccountStatus(item)} disabled={disabledButtons.changeStatus}>
                              <IonIcon icon={item.AccountStatus === 'ACT' ? lockClosed : lockOpenOutline}></IonIcon>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" style={{ textAlign: 'center' }}>
                          Không tìm thấy tài khoản phù hợp
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button className="first" onClick={() => this.handlePageChange(1, 1)} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button className="prev" onClick={() => this.handlePrevPage(1)} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 2)} onBlur={() => this.handlePageInputBlur(1)} />
                    <span className="total-pages">/ {totalPages}</span>
                    <button className="next" onClick={() => this.handleNextPage(1)} disabled={currentPage === totalPages}>
                      {'>'}
                    </button>
                    <button className="last" onClick={() => this.handlePageChange(totalPages, 1)} disabled={currentPage === totalPages}>
                      {'>>'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="admin-search">
              <div className="admin-search-left">
                <div className="admin-search-box">
                  <div className="inputbox">
                    <input type="text" placeholder="Tìm kiếm theo Type, Code và CodeValue" value={searchValue} onChange={(event) => this.handleSearchChange(event, 2)} />
                    <div className="btn-search">
                      <IonIcon icon={searchOutline} className="search-icon"></IonIcon>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-search-right">
                <button onClick={() => this.handleResetFilter(2)}>Reset</button>
                <div className="alo">
                  <label>Lọc:</label>
                  <Select
                    className="type-filter-select"
                    options={[
                      { value: 'ALL', label: 'Tất cả' },
                      ...codeTypeFilter.map((type) => ({
                        value: `type-${type.Type}`,
                        label: type.Type,
                      })),
                    ]}
                    value={filterValue === 'ALL' ? { value: 'ALL', label: 'Tất cả' } : codeTypeFilter.find((type) => `type-${type.Type}` === filterValue) ? { value: filterValue, label: codeTypeFilter.find((type) => `type-${type.Type}` === filterValue).Type } : null}
                    onChange={(selectedOption) => this.handleFilter(selectedOption ? selectedOption.value : 'ALL', 2)}
                    placeholder="Chọn loại"
                    isClearable
                    isSearchable
                  />
                </div>
              </div>
              <div className="btn-addAC">
                <button style={{ display: actionPage === 2 ? 'block' : 'none' }} onClick={() => this.handleAddCode()} className="btn-addAC" disabled={disabledButtons.addItem}>
                  THÊM MÃ MỚI <IonIcon icon={addOutline}></IonIcon>
                </button>
              </div>
            </div>
            <div className="admin-list">
              <div className="codes-table">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>STT</th>
                      <th>Tham chiếu</th>
                      <th>Mã</th>
                      <th>Tên gọi</th>
                      <th>Giá trị bổ sung</th>
                      <th></th>
                    </tr>
                    {loadedCodeInfo.length > 0 ? (
                      loadedCodeInfo.map((item, index) => (
                        <tr key={item.CodeID}>
                          <td>{(currentPage - 1) * limitCodePerQuery + index + 1}</td>
                          <td>{isEditingCode === index ? <input type="text" value={item.Type} onChange={(e) => this.handleCodeChange(index, 'Type', e.target.value)} disabled={!isAddingCode} /> : item.Type}</td>
                          <td>{isEditingCode === index ? <input type="text" value={item.Code} onChange={(e) => this.handleCodeChange(index, 'Code', e.target.value)} disabled={!isAddingCode} /> : item.Code}</td>
                          <td>{isEditingCode === index ? <input type="text" value={item.CodeValueVI} onChange={(e) => this.handleCodeChange(index, 'CodeValueVI', e.target.value)} /> : item.CodeValueVI}</td>
                          <td>{isEditingCode === index ? <input type="number" value={item.ExtraValue ?? ''} onChange={(e) => this.handleCodeChange(index, 'ExtraValue', e.target.value)} /> : item.ExtraValue ? parseFloat(item.ExtraValue).toFixed(2) : ''}</td>
                          <td>
                            {isEditingCode === index ? (
                              <>
                                <button className="save-code" onClick={() => this.handleSaveCode(index)} disabled={disabledButtons.saveItem}>
                                  Lưu
                                </button>
                                <button className="cancel-code" onClick={() => this.handleCancelCode()}>
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <button className="btn-edit" onClick={() => this.handleEditCode(index)} disabled={isEditingCode !== null || isAddingCode}>
                                <IonIcon icon={pencil}></IonIcon>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>
                          Không tìm thấy AllCodes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                    <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 2)} onBlur={() => this.handlePageInputBlur(2)} />
                    <span className="total-pages">/ {totalPages}</span>
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
          </div>
        );
      case 3:
        return (
          <div>
            <div className="admin-search">
              <div className="admin-search-left">
                <div className="admin-search-box">
                  <div className="inputbox">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên dịch vụ hoặc mô tả"
                      value={searchValue}
                      onChange={(event) => this.handleSearchChange(event, 3)}
                    />
                    <div className="btn-search">
                      <IonIcon icon={searchOutline} className="search-icon"></IonIcon>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-search-right">
                <button onClick={() => this.handleResetFilter(3)}>Reset</button>
                <div className="alo">
                  <label>Lọc:</label>
                  <select
                    value={filterValue}
                    onChange={(event) => this.handleFilter(event.target.value, 3)}
                  >
                    <option value="ALL">Tất cả</option>
                    <optgroup label="Theo Giá">
                      <option value="price-LOW">Dưới 100,000 VNĐ</option>
                      <option value="price-MED">100,000 - 500,000 VNĐ</option>
                      <option value="price-HIGH">Trên 500,000 VNĐ</option>
                    </optgroup>
                    <optgroup label="Theo Thời Gian">
                      <option value="duration-SHORT">Dưới 30 phút</option>
                      <option value="duration-MED">30 - 60 phút</option>
                      <option value="duration-LONG">Trên 60 phút</option>
                    </optgroup>
                    <optgroup label="Theo Trạng Thái">
                      {codeServiceStatus.map((status) => (
                        <option key={status.Code} value={`status-${status.Code}`}>
                          {status.CodeValueVI}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="alo">
                  <label>Sắp Xếp:</label>
                  <select
                    value={sortValue}
                    onChange={(event) => this.handleSort(event.target.value, 3)}
                    className="select-2"
                  >
                    <option value="0">Mặc định</option>
                    <option value="1">Tên (A-Z)</option>
                    <option value="2">Tên (Z-A)</option>
                    <option value="3">Giá (Thấp-Cao)</option>
                    <option value="4">Giá (Cao-Thấp)</option>
                    <option value="5">Thời gian (Ngắn-Dài)</option>
                    <option value="6">Thời gian (Dài-Ngắn)</option>
                  </select>
                </div>
              </div>
              <div className="btn-addAC">
                <button
                  style={{ display: actionPage === 3 ? 'block' : 'none' }}
                  onClick={() => this.handleAddService()}
                  className="btn-addAC"
                  disabled={disabledButtons.addItem}
                >
                  THÊM DỊCH VỤ MỚI <IonIcon icon={addOutline}></IonIcon>
                </button>
              </div>
            </div>
            <div className="admin-list">
              <div className="services-table">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>STT</th>
                      <th>Tên dịch vụ</th>
                      <th>Giá (vnđ)</th>
                      <th>Thời gian (phút)</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                    {loadedServiceInfo.length > 0 ? (
                      loadedServiceInfo.map((item, index) => (
                        <tr key={item.ServiceID} className={item.ServiceStatus === 'VALID' ? 'status-act' : 'status-dis'}>
                          <td>{(currentPage - 1) * limitServicePerQuery + index + 1}</td>
                          <td>
                            {isEditingService === index ? (
                              <input
                                type="text"
                                value={item.ServiceName}
                                onChange={(e) => this.handleServiceChange(index, 'ServiceName', e.target.value)}
                              />
                            ) : (
                              item.ServiceName
                            )}
                          </td>
                          <td>
                            {isEditingService === index ? (
                              <input
                                type="number"
                                value={item.Price}
                                onChange={(e) => this.handleServiceChange(index, 'Price', e.target.value)}
                              />
                            ) : (
                              parseFloat(item.Price).toLocaleString('vi-VN')
                            )}
                          </td>
                          <td>
                            {isEditingService === index ? (
                              <input
                                type="number"
                                value={item.Duration}
                                onChange={(e) => this.handleServiceChange(index, 'Duration', e.target.value)}
                              />
                            ) : (
                              item.Duration
                            )}
                          </td>
                          <td>
                            {isEditingService === index ? (
                              <input
                                type="text"
                                value={item.Description ?? ''}
                                onChange={(e) => this.handleServiceChange(index, 'Description', e.target.value)}
                              />
                            ) : (
                              item.Description || 'Không có mô tả'
                            )}
                          </td>
                          <td>
                            {codeServiceStatus.find((status) => status.Code === item.ServiceStatus)?.CodeValueVI ||
                              item.ServiceStatus}
                          </td>
                          <td>
                            {isEditingService === index ? (
                              <>
                                <button className="save-code" onClick={() => this.handleSaveService(index)} disabled={disabledButtons.saveItem}>
                                  Lưu
                                </button>
                                <button className="cancel-code" onClick={() => this.handleCancelService()}>
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn-edit"
                                  onClick={() => this.handleEditService(index)}
                                  disabled={isEditingService !== null || isAddingService}
                                >
                                  <IonIcon icon={pencil}></IonIcon>
                                </button>
                                <button
                                  className="btn-lock"
                                  onClick={() => this.handleChangeServiceStatus(item)}
                                  disabled={isEditingService !== null || isAddingService || disabledButtons.changeStatus}
                                >
                                  <IonIcon icon={item.ServiceStatus === 'VALID' ? lockClosed : lockOpenOutline}></IonIcon>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center' }}>
                          Không tìm thấy dịch vụ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button
                      className="first"
                      onClick={() => this.handlePageChange(1, 3)}
                      disabled={currentPage === 1}
                    >
                      {'<<'}
                    </button>
                    <button
                      className="prev"
                      onClick={() => this.handlePrevPage(3)}
                      disabled={currentPage === 1}
                    >
                      {'<'}
                    </button>
                    <input
                      type="text"
                      value={tempCurrentPage}
                      onChange={(event) => this.handlePageInputChange(event)}
                      onKeyDown={(event) => this.handlePageKeyDown(event, 3)}
                      onBlur={() => this.handlePageInputBlur(3)}
                    />
                    <span className="total-pages">/ {totalPages}</span>
                    <button
                      className="next"
                      onClick={() => this.handleNextPage(3)}
                      disabled={currentPage === totalPages}
                    >
                      {'>'}
                    </button>
                    <button
                      className="last"
                      onClick={() => this.handlePageChange(totalPages, 3)}
                      disabled={currentPage === totalPages}
                    >
                      {'>>'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  render() {
    const { actionPage, isLoading, isShowCreateAccountModal, isShowEditAccountModal, selectedAccount, disabledButtons } = this.state;
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
          <div>
            <div className="admin-action">
              <div className="admin-action-left">
                <div className="btn-Home" onClick={() => this.props.navigate('/home')}>
                  <IonIcon icon={homeOutline}></IonIcon>
                </div>
              </div>
              <div>
                <h1>TRANG QUẢN TRỊ</h1>
              </div>
              <div className="admin-action-right">
                <div className="btn-logoutTK" onClick={this.handleLogout}>
                  <button disabled={disabledButtons.logout}>
                    ĐĂNG XUẤT <IonIcon icon={logOutOutline}></IonIcon>
                  </button>
                </div>
              </div>
            </div>
            <div className="admin-top-content">
              <div className="admin-top-content-menu f">
                <li>
                  <a onClick={this.handleFormAccountManagement} className={actionPage === 1 ? 'active' : ''}>
                    THÔNG TIN TÀI KHOẢN
                  </a>
                </li>
                <li>
                  <a onClick={this.handleFormCodeManagement} className={actionPage === 2 ? 'active' : ''}>
                    THÔNG TIN MÃ
                  </a>
                </li>
                <li>
                  <a onClick={this.handleFormServiceManagement} className={actionPage === 3 ? 'active' : ''}>
                    THÔNG TIN DỊCH VỤ
                  </a>
                </li>
              </div>
            </div>
            <div className="admin-center">
              <div className="admin-mid-content">{this.renderSection()}</div>
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
