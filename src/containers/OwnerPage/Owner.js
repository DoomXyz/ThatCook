import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';

import { pencil, searchOutline, add, homeOutline, cashOutline, banOutline, refreshOutline, closeCircleOutline, checkmarkCircleOutline, logOutOutline } from 'ionicons/icons';

import './Owner.scss';
import Spinner from '../../components/Spinner';
import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';
import ViewInvoiceModal from './ViewInvoiceModal';
import CancelInvoiceModal from '../../components/CancelInvoiceModal';
import CreateBannerModal from './CreateBannerModal';
import EditBannerModal from './EditBannerModal';
import CreateCouponModal from './CreateCouponModal.js';

import { handleLogoutApi } from '../../services/accountServices';
import { handleLoadProductInfoApi, handleCreateProductApi, handleChangeProductInfoApi } from '../../services/productServices';
import { handleLoadBannerInfoApi, handleCreateBannerApi, handleChangeBannerInfoApi } from '../../services/bannerServices';
import { handleLoadInvoiceInfoApi, handleChangeInvoiceStatusApi } from '../../services/invoiceServices';
import { handleCreateCouponApi, handleLoadCouponInfoApi } from '../../services/couponServices';

import { getAllCodes, checkLoginStatus } from '../../utils/pakage';
import { userLogin, userLogout } from '../../store/actions';

class Owner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Authentication & General
      actionPage: 1,
      isLoading: true,
      isLoggedIn: false,
      accountInfo: null,
      // Codes
      codeProductType: [],
      codePetType: [],
      codeDiscountType: [],
      codePaymentStatus: [],
      codeShippingStatus: [],
      codeBannerStatus: [],
      codeCouponStatus: [],
      // Pagination
      currentPage: 1,
      tempCurrentPage: '1',
      limitProductPerQuery: 10,
      limitInvoicePerQuery: 10,
      limitBannerPerQuery: 5,
      limitCouponPerQuery: 10,
      totalPages: 1,
      // Filtering & Sorting
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      dateFilterValue: '',
      // Data Lists
      loadedProductInfo: [],
      loadedInvoiceInfo: [],
      loadedBannerInfo: [],
      loadedCouponInfo: [],
      // Modals & Selections
      isShowCreateProductModal: false,
      isShowEditProductModal: false,
      isShowViewInvoiceModal: false,
      isShowCancelInvoiceModal: false,
      isShowCreateBannerModal: false,
      isShowEditBannerModal: false,
      isShowCreateCouponModal: false,
      selectedProduct: null,
      selectedBanner: null,
      selectedInvoice: null,
      selectedCancelInvoice: null,
      selectedCoupon: null,
      // Coupon Management
      isEditingCoupon: null,
      isAddingCoupon: false,
      // DisableButton
      disabledButtons: {
        logout: false,
      },
    };
    this.debounceTimeout = null;
  }
  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadProductInfo();
    await this.handleLoadCode(['ProductType', 'PetType', 'DiscountType', 'PaymentStatus', 'ShippingStatus', 'BannerStatus', 'CouponStatus']);
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.actionPage !== this.state.actionPage) {
      this.handleReloadData(this.state.actionPage)
    }
  }
  //login logout
  handleIsLogin = async () => {
    try {
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo && accountInfo.AccountType === 'O') {
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
    }
    this.setState({
      isLoading: false,
    });
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
  //load code
  handleLoadCode = async (codeTypeFilter) => {
    try {
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
  //load data info
  handleReloadData = (type) => {
    switch (type) {
      case 1:
        this.handleLoadProductInfo();
        break;
      case 2:
        this.handleLoadInvoiceInfo();
        break;
      case 3:
        this.handleLoadBannerInfo();
        break;
      case 4:
        this.handleLoadCouponInfo();
        break;
      default:
        break;
    }
  };
  handleLoadProductInfo = async () => {
    const { currentPage, limitProductPerQuery, searchValue, filterValue, sortValue } = this.state;
    try {
      const response = await handleLoadProductInfoApi(currentPage, limitProductPerQuery, searchValue, filterValue, sortValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedProductInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitProductPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading invoiceinfo:', e);
      toast.error('Lỗi khi load danh sách sản phẩm!');
    }
  };
  handleLoadInvoiceInfo = async () => {
    const { currentPage, limitInvoicePerQuery, searchValue, filterValue, sortValue, dateFilterValue } = this.state;
    try {
      const response = await handleLoadInvoiceInfoApi(currentPage, limitInvoicePerQuery, searchValue, filterValue, sortValue, dateFilterValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedInvoiceInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitInvoicePerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading invoiceinfo:', e);
      toast.error('Lỗi khi load danh sách đơn hàng!');
    }
  };
  handleLoadBannerInfo = async () => {
    const { currentPage, limitBannerPerQuery, searchValue, filterValue, sortValue, dateFilterValue } = this.state;
    try {
      const response = await handleLoadBannerInfoApi(currentPage, limitBannerPerQuery, searchValue, filterValue, sortValue, dateFilterValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedBannerInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitBannerPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading bannerinfo:', e);
      toast.error('Lỗi khi load danh sách banner!');
    }
  };
  handleLoadCouponInfo = async () => {
    const { currentPage, limitCouponPerQuery, searchValue, filterValue, sortValue, dateFilterValue } = this.state;
    try {
      const response = await handleLoadCouponInfoApi(currentPage, limitCouponPerQuery, searchValue, filterValue, sortValue, dateFilterValue);
      if (response && response.data.errCode === 0) {
        this.setState({
          loadedCouponInfo: response.data.data,
          totalPages: Math.ceil(response.data.totalItems / limitCouponPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading couponinfo:', e);
      toast.error('Lỗi khi load danh sách coupon!');
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
        dateFilterValue: '',
      }, () => {
        this.handleReloadData(type);
      }
    );
  };
  //pagination
  handlePageChange = (page, type) => {
    this.setState({
      isLoading: true,
    });
    const { totalPages } = this.state;
    let newPage = page;
    if (isNaN(page) || page <= 0) {
      newPage = 1;
    } else if (page > totalPages) {
      newPage = totalPages;
    }
    this.setState({
      isLoading: false,
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
  handleConfirmPayment = async (invoiceid) => {
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận hóa đơn đã thanh toán?</p>
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
          </div>
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'PaymentStatus', 'PAID', '');
      if (response && response.errCode === 0) {
        toast.success('Xác nhận thanh toán thành công!');
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Xác nhận thanh toán thất bại!');
      }
    } catch (e) {
      console.error('Error confirming payment:', e);
      toast.error('Lỗi khi xác nhận thanh toán, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleConfirmDelivery = async (invoiceid) => {
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận hóa đơn đã giao hàng?</p>
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
          </div>
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'DELI', '');
      if (response && response.errCode === 0) {
        toast.success('Xác nhận giao hàng thành công!');
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Xác nhận giao hàng thất bại!');
      }
    } catch (e) {
      console.error('Error confirming delivery:', e);
      toast.error('Lỗi khi xác nhận giao hàng, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleAcceptCancelInvoice = async (invoiceid) => {
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận hủy hóa đơn?</p>
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
          </div>
        );
      });
    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'CANCELED', '');
      if (response && response.errCode === 0) {
        toast.success('Hủy hóa đơn thành công!');
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Hủy hóa đơn thất bại!');
      }
    } catch (e) {
      console.error('Error canceling invoice:', e);
      toast.error('Lỗi khi hủy hóa đơn, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleDenyCancelInvoice = async (invoiceid) => {
    const confirmAction = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Từ chối yêu cầu hủy và tiếp tục hóa đơn?</p>
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
          </div>
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'PEND', '');
      if (response && response.errCode === 0) {
        toast.success('Tiếp tục hóa đơn thành công!');
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Tiếp tục hóa đơn thất bại!');
      }
    } catch (e) {
      console.error('Error denying cancel invoice:', e);
      toast.error('Lỗi khi tiếp tục hóa đơn, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  //toggle modal
  toggleCreateProductModal = () => {
    this.setState({
      isShowCreateProductModal: !this.state.isShowCreateProductModal,
    });
  };
  toggleEditProductModal = () => {
    this.setState({
      isShowEditProductModal: !this.state.isShowEditProductModal,
    });
  };
  toggleCreateBannerModal = () => {
    this.setState({
      isShowCreateBannerModal: !this.state.isShowCreateBannerModal,
    });
  };
  toggleEditBannerModal = () => {
    this.setState({
      isShowEditBannerModal: !this.state.isShowEditBannerModal,
    });
  };
  toggleViewInvoiceModal = () => {
    this.setState({
      isShowViewInvoiceModal: !this.state.isShowViewInvoiceModal,
    });
  };
  toggleCancelInvoiceModal = () => {
    this.setState({
      isShowCancelInvoiceModal: !this.state.isShowCancelInvoiceModal,
    });
  };
  toggleCreateCouponModal = () => {
    this.setState({
      isShowCreateCouponModal: !this.state.isShowCreateCouponModal,
    });
  };
  //modal input
  handleSelectedProduct = (productid) => {
    this.setState({
      selectedProduct: productid,
      isShowEditProductModal: true,
    });
  };
  handleSelectedInvoice = (invoiceid) => {
    this.setState({
      selectedInvoice: invoiceid,
      isShowViewInvoiceModal: true,
    });
  };
  handleSelectedCancelInvoice = (invoiceid) => {
    this.setState({
      selectedCancelInvoice: invoiceid,
      isShowCancelInvoiceModal: true,
    });
  };
  handleSelectedBanner = (bannerid) => {
    this.setState({
      selectedBanner: bannerid,
      isShowEditBannerModal: true,
    });
  };
  //modal action
  handleCreateProductFromModal = async (productInfo) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleCreateProductApi(productInfo);
      if (response && response.errCode === 0) {
        toast.success('Thêm sản phẩm mới thành công!');
        await this.handleLoadProductInfo();
        this.setState({
          isShowCreateProductModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Thêm sản phẩm mới thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Create Product:', e);
      toast.error('Xảy ra lỗi khi thêm sản phẩm mới, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleChangeProductFromModal = async (productInfo) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleChangeProductInfoApi(productInfo);
      if (response && response.errCode === 0) {
        toast.success('Chỉnh sửa thông tin sản phẩm thành công!');
        await this.handleLoadProductInfo();
        this.setState({
          isShowEditProductModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Chỉnh sửa thông tin sản phẩm thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Edit:', e);
      toast.error('Xảy ra lỗi khi chỉnh sửa, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleCreateBannerFromModal = async (bannerInfo) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleCreateBannerApi(bannerInfo);
      if (response && response.errCode === 0) {
        toast.success('Thêm banner mới thành công!');
        await this.handleLoadBannerInfo();
        this.setState({
          isShowCreateBannerModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Thêm banner mới thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Create Banner:', e);
      toast.error('Xảy ra lỗi khi thêm banner mới, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleChangeBannerFromModal = async (bannerInfo) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleChangeBannerInfoApi(bannerInfo);
      if (response && response.errCode === 0) {
        toast.success('Chỉnh sửa thông tin banner thành công!');
        await this.handleLoadBannerInfo();
        this.setState({
          isShowEditBannerModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Chỉnh sửa thông tin banner thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Edit:', e);
      toast.error('Xảy ra lỗi khi chỉnh sửa, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleCancelInvoiceFromModal = async (invoiceid, cancelreason) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'CANCELED', cancelreason);
      if (response && response.errCode === 0) {
        toast.success('Hủy hóa đơn thành công!');
        await this.handleLoadInvoiceInfo();
        this.setState({
          isShowCancelInvoiceModal: false,
          selectedCancelInvoice: null,
        });
      } else {
        toast.error(response?.errMessage || 'Hủy hóa đơn thất bại!');
      }
    } catch (e) {
      console.error('Error canceling invoice:', e);
      toast.error('Lỗi khi hủy hóa đơn, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  handleCreateCouponFromModal = async (couponInfo) => {
    this.setState({ isLoading: true });
    try {
      const responseApi = await handleCreateCouponApi(couponInfo);
      const response = responseApi.data;
      if (response && response.errCode === 0) {
        toast.success('Thêm coupon mới thành công!');
        await this.handleLoadCouponInfo();
        this.setState({
          isShowCreateCouponModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Thêm coupon mới thất bại!';
        toast.error(errMessage);
      }
    } catch (e) {
      console.error('Create Coupon:', e);
      toast.error('Xảy ra lỗi khi thêm coupon mới, vui lòng thử lại!');
    }
    this.setState({ isLoading: false });
  };
  //on table change action (coupon)
  handleEditCoupon = (index) => {
    this.setState({ isEditingCoupon: index, isAddingCoupon: false });
  };
  //form controller
  handleFormDanhSachSanPham = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 1,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      dateFilterValue: '',
    }, async () => {
      await this.handleLoadProductInfo();
    });
  };
  handleFormDanhSachDonHang = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 2,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      dateFilterValue: '',
    }, async () => {
      await this.handleLoadInvoiceInfo();
    });
  };
  handleFormDanhSachBanner = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 3,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      dateFilterValue: '',
    }, async () => {
      await this.handleLoadBannerInfo();
    });
  };
  handleFormDanhSachCoupon = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 4,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      dateFilterValue: '',
    }, async () => {
      await this.handleLoadCouponInfo();
    });
  };
  render() {
    const {
      loadedProductInfo,
      codeProductType,
      codePetType,
      loadedInvoiceInfo,
      codePaymentStatus,
      codeShippingStatus,
      loadedBannerInfo,
      codeBannerStatus,
      loadedCouponInfo,
      codeCouponStatus,
      codeDiscountType,
      isLoading,
      actionPage,
      searchValue,
      sortValue,
      filterValue,
      dateFilterValue,
      currentPage,
      tempCurrentPage,
      totalPages,
      isShowCreateProductModal,
      isShowEditProductModal,
      isShowCreateBannerModal,
      isShowEditBannerModal,
      isShowViewInvoiceModal,
      isShowCancelInvoiceModal,
      isShowCreateCouponModal,
      selectedProduct,
      selectedBanner,
      selectedInvoice,
      selectedCancelInvoice,
      disabledButtons
    } = this.state;
    const renderSection = () => {
      switch (actionPage) {
        case 1:
          return (
            <div>
              <button style={{ display: actionPage === 1 ? 'block' : 'none' }} onClick={() => this.toggleCreateProductModal()} className="add-product">
                THÊM SẢN PHẨM <IonIcon icon={add}></IonIcon>
              </button>
              <div className="f">
                <div className="owner-mid-content-left">
                  <div className="owner-mid-content-left-search-product">
                    <p>Tìm kiếm:</p>
                    <input type="text" placeholder="Nhập tên sản phẩm" value={searchValue} onChange={(event) => this.handleSearchChange(event, 1)} />
                    <IonIcon icon={searchOutline}></IonIcon>
                  </div>
                  <div className="f">
                    <div className="owner-mid-content-left-product-filter">
                      <label>Lọc sản phẩm:</label>
                      <br />
                      <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 1)}>
                        <option value="ALL">Tất cả</option>
                        <option value="PROMOTION">Sản phẩm có khuyến mãi</option>
                        {codeProductType && codeProductType.length > 0 && (
                          <optgroup label="Loại sản phẩm">
                            {codeProductType.map((item) => (
                              <option key={`producttype-${item.Code}`} value={`producttype-${item.Code}`}>
                                {item.CodeValueVI}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {codePetType && codePetType.length > 0 && (
                          <optgroup label="Sản phẩm cho thú cưng">
                            {codePetType.map((item) => (
                              <option key={`pettype-${item.Code}`} value={`pettype-${item.Code}`}>
                                {item.CodeValueVI}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                    <div className="owner-mid-content-left-product-sort">
                      <label>Sắp xếp:</label>
                      <br />
                      <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 1)}>
                        <option value="0">Mặc định</option>
                        <option value="1">Bán chạy</option>
                        <option value="2">Giá bán tăng dần</option>
                        <option value="3">Giá bán giảm dần</option>
                        <option value="4">Hàng mới về</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="owner-mid-content-right">
                  <div className="owner-mid-content-right-list-product">
                    <table>
                      <thead>
                        <tr>
                          <th>Mã sản phẩm</th>
                          <th>Loại sản phẩm</th>
                          <th>Tên sản phẩm</th>
                          <th>Hình ảnh</th>
                          <th>Đơn Giá</th>
                          <th>Tổng tồn Kho</th>
                          <th>Tổng bán ra</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadedProductInfo.length > 0 ? (
                          loadedProductInfo.map((item) => {
                            return (
                              <tr key={item.ProductID} className="owner-mid-content-right-list-product-item">
                                <td>{item.ProductID}</td>
                                <td>{codeProductType.find((filterItem) => filterItem.Code === item.ProductType)?.CodeValueVI || item.ProductType}</td>
                                <td>{item.ProductName}</td>
                                <td>
                                  <img src={item.ProductImage || ''} alt={item.ProductName} style={{ width: '50px', height: '50px' }} />
                                </td>
                                <td>{parseFloat(item.ProductPrice).toLocaleString('vi-VN')} vnđ</td>
                                <td>{item.TotalStock || 0}</td>
                                <td>{item.TotalSold || 0}</td>
                                <td className="f" onClick={(e) => e.stopPropagation()}>
                                  <button className="btn-edit" onClick={() => this.handleSelectedProduct(item.ProductID)}>
                                    <IonIcon icon={pencil}></IonIcon>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="8">Không tìm thấy sản phẩm phù hợp.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="page-content">
                        <div className="page-content-item">
                          <button className="first" onClick={() => this.handlePageChange(1, 1)} disabled={currentPage === 1}>
                            {'<<'}
                          </button>
                          <button className="prev" onClick={() => this.handlePrevPage(1)} disabled={currentPage === 1}>
                            {'<'}
                          </button>
                          <input
                            type="text"
                            value={tempCurrentPage}
                            onChange={(event) => this.handlePageInputChange(event)}
                            onKeyDown={(event) => this.handlePageKeyDown(event, 1)}
                            onBlur={() => this.handlePageInputBlur(1)}
                          />
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
              </div>
            </div>
          );
        case 2:
          return (
            <div>
              <div className="f">
                <div className="owner-mid-content-left-search-invoice" style={{ display: actionPage === 2 ? 'flex' : 'none' }}>
                  <p>Tìm kiếm:</p>
                  <input type="text" placeholder="Tìm kiếm tên hoặc số điện thoại nhận hàng..." value={searchValue} onChange={(event) => this.handleSearchChange(event, 2)} />
                  <IonIcon icon={searchOutline}></IonIcon>
                </div>
                <div style={{ display: actionPage === 2 ? 'flex' : 'none' }} className="owner-mid-content-left-invoice-sort-filter">
                  <div className="owner-mid-content-left-invoice-filter">
                    <label>Lọc hóa đơn:</label>
                    <br />
                    <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 2)}>
                      <option value="ALL">Tất cả</option>
                      {codePaymentStatus && codePaymentStatus.length > 0 && (
                        <optgroup label="Tình trạng thanh toán">
                          {codePaymentStatus.map((item) => (
                            <option key={`paymentstatus-${item.Code}`} value={`paymentstatus-${item.Code}`}>
                              {item.CodeValueVI}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {codeShippingStatus && codeShippingStatus.length > 0 && (
                        <optgroup label="Tình trạng giao hàng">
                          {codeShippingStatus.map((item) => (
                            <option key={`shippingstatus-${item.Code}`} value={`shippingstatus-${item.Code}`}>
                              {item.CodeValueVI}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Tổng thanh toán">
                        <option value="totalpayment-0">500.000 - 1.000.000 VNĐ</option>
                        <option value="totalpayment-1">1.000.000 - 1.500.000 VNĐ</option>
                        <option value="totalpayment-2">1.500.000 - 2.000.000 VNĐ</option>
                        <option value="totalpayment-3">Trên 2.000.000 VNĐ</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="owner-mid-content-left-invoice-sort">
                    <label>Sắp xếp:</label>
                    <br />
                    <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 2)}>
                      <option value="0">Mặc định</option>
                      <option value="1">Mới nhất</option>
                      <option value="2">Cũ nhất</option>
                      <option value="3">Tổng giá trị tăng dần</option>
                      <option value="4">Tổng giá trị giảm dần</option>
                      <option value="5">Số lượng tăng dần</option>
                      <option value="6">Số lượng giảm dần</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: actionPage === 2 ? 'block' : 'none' }} className="owner-mid-content-left-invoice-date ">
                  <label>Ngày hóa đơn:</label>
                  <br />
                  <div className="f">
                    <DatePicker
                      selected={dateFilterValue ? new Date(dateFilterValue + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                        this.setState({ dateFilterValue: formattedDate }, () => {
                          if (this.state.actionPage === 2) {
                            this.handleLoadInvoiceInfo();
                          }
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                      isClearable
                    />
                    <button style={{ marginLeft: '10px' }} onClick={() => this.handleResetFilter(2)}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <div className="owner-mid-content-right-list-invoice">
                <table>
                  <thead>
                    <tr>
                      <th>Mã hóa đơn</th>
                      <th>Thời gian tạo</th>
                      <th>Người nhận hàng</th>
                      <th>SĐT nhận hàng</th>
                      <th>Số lượng mặt hàng</th>
                      <th>Tổng thanh toán</th>
                      <th>Tình trạng thanh toán</th>
                      <th>Tình trạng giao hàng</th>
                      <th>Đã hủy lúc</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedInvoiceInfo.length > 0 ? (
                      loadedInvoiceInfo.map((item) => (
                        <tr
                          key={item.InvoiceID}
                          className="owner-mid-content-right-list-invoice-item"
                          onClick={() => {
                            this.handleSelectedInvoice(item.InvoiceID);
                          }}
                        >
                          <td>{item.InvoiceID}</td>
                          <td>{item.CreatedAt ? new Date(item.CreatedAt).toLocaleString('vi-VN') : 'N/A'}</td>
                          <td>{item.ReceiverName}</td>
                          <td>{item.ReceiverPhone}</td>
                          <td>{item.TotalQuantity}</td>
                          <td className="f">
                            <p>{parseFloat(item.TotalPayment).toLocaleString('vi-VN')} vnđ</p>
                          </td>
                          <td>{codePaymentStatus.find((filterItem) => filterItem.Code === item.PaymentStatus)?.CodeValueVI || item.PaymentStatus}</td>
                          <td>{codeShippingStatus.find((filterItem) => filterItem.Code === item.ShippingStatus)?.CodeValueVI || item.ShippingStatus}</td>
                          <td>{item.CanceledAt ? new Date(item.CanceledAt).toLocaleString('vi-VN') : ''}</td>
                          <td className="f" onClick={(e) => e.stopPropagation()}>
                            {item.PaymentStatus === 'PEND' && item.ShippingStatus !== 'CANCELED' && item.ShippingStatus !== 'PEND_CANCEL' && (
                              <button className="btn-confirm-payment" onClick={() => this.handleConfirmPayment(item.InvoiceID)} title="Xác nhận thanh toán">
                                <IonIcon icon={cashOutline}></IonIcon>
                              </button>
                            )}
                            {item.PaymentStatus === 'PAID' && item.ShippingStatus !== 'CANCELED' && item.ShippingStatus !== 'PEND_CANCEL' && (
                              <button className="btn-confirm-delivery" onClick={() => this.handleConfirmDelivery(item.InvoiceID)} title="Xác nhận giao hàng">
                                <IonIcon icon={checkmarkCircleOutline}></IonIcon>
                              </button>
                            )}
                            {item.ShippingStatus === 'PEND' && (
                              <button className="btn-cancel" onClick={() => this.handleSelectedCancelInvoice(item.InvoiceID)} title="Hủy hóa đơn">
                                <IonIcon icon={closeCircleOutline}></IonIcon>
                              </button>
                            )}
                            {item.ShippingStatus === 'PEND_CANCEL' && (
                              <div>
                                <button className="btn-accept-cancel" onClick={() => this.handleAcceptCancelInvoice(item.InvoiceID)} title="Chấp nhận hủy">
                                  <IonIcon icon={banOutline}></IonIcon>
                                </button>
                                <button className="btn-deny-cancel" onClick={() => this.handleDenyCancelInvoice(item.InvoiceID)} title="Từ chối hủy">
                                  <IonIcon icon={refreshOutline}></IonIcon>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10">Không tìm thấy hóa đơn nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
              <button style={{ display: actionPage === 3 ? 'block' : 'none' }} onClick={() => this.toggleCreateBannerModal()} className="add-banner">
                THÊM BANNER <IonIcon icon={add}></IonIcon>
              </button>
              <div className="f">
                <div className="owner-mid-content-search-banner" style={{ display: actionPage === 3 ? 'flex' : 'none' }}>
                  <p>Tìm kiếm:</p>
                  <input type="text" placeholder="Nhập tên sản phẩm..." value={searchValue} onChange={(event) => this.handleSearchChange(event, 3)} />
                  <IonIcon icon={searchOutline}></IonIcon>
                </div>
                <div style={{ display: actionPage === 3 ? 'flex' : 'none' }} className="owner-mid-content-banner-filter-sort f">
                  <div className="owner-mid-content-banner-filter">
                    <label>Lọc banner:</label>
                    <br />
                    <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 3)}>
                      <option value="ALL">Tất cả</option>
                      {codeBannerStatus && codeBannerStatus.length > 0 && (
                        <optgroup label="Trạng thái">
                          {codeBannerStatus.map((item) => (
                            <option key={`bannerstatus-${item.Code}`} value={`bannerstatus-${item.Code}`}>
                              {item.CodeValueVI}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  <div className="owner-mid-content-banner-sort">
                    <label>Sắp xếp:</label>
                    <br />
                    <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 3)}>
                      <option value="0">Mặc định</option>
                      <option value="1">Mới nhất</option>
                      <option value="2">Cũ nhất</option>
                      <option value="3">Hết hạn gần nhất</option>
                      <option value="4">Hết hạn trễ nhất</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: actionPage === 3 ? 'block' : 'none' }} className="owner-mid-content-banner-date">
                  <label>Banner hoạt động trong ngày:</label>
                  <br />
                  <div className="f">
                    <DatePicker
                      selected={dateFilterValue ? new Date(dateFilterValue + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                        this.setState({ dateFilterValue: formattedDate }, () => {
                          if (this.state.actionPage === 3) {
                            this.handleLoadBannerInfo();
                          }
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                      isClearable
                    />
                    <button style={{ marginLeft: '10px' }} onClick={() => this.handleResetFilter(3)}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="owner-mid-content-mid-list-img">
                <table>
                  <thead>
                    <tr>
                      <th>Hình ảnh banner</th>
                      <th>Mã sản phẩm</th>
                      <th>Tên sản phẩm</th>
                      <th>Hình ảnh sản phẩm</th>
                      <th>Trạng thái</th>
                      <th>Thời gian tạo</th>
                      <th>Thời gian ẩn</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedBannerInfo.length > 0 ? (
                      loadedBannerInfo.map((item) => (
                        <tr key={item.BannerID} className="owner-mid-content-right-list-banner-item">
                          <td>
                            <img src={item.BannerImage || ''} alt="Banner" />
                          </td>
                          <td>{item.ProductID}</td>
                          <td>{item.ProductName}</td>
                          <td>
                            <img src={item.ProductImage || ''} alt="Sản phẩm" style={{ width: '50px', height: '50px' }} />
                          </td>
                          <td>{codeBannerStatus.find((filterItem) => filterItem.Code === item.BannerStatus)?.CodeValueVI || item.BannerStatus}</td>
                          <td>
                            {item.CreatedAt
                              ? new Date(item.CreatedAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              : 'N/A'}
                          </td>
                          <td>
                            {item.HiddenAt
                              ? new Date(item.HiddenAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              : 'Vô thời hạn'}
                          </td>
                          <td className="f" onClick={(e) => e.stopPropagation()}>
                            <button className="btn-edit" onClick={() => this.handleSelectedBanner(item.BannerID)}>
                              <IonIcon icon={pencil}></IonIcon>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9">Không tìm thấy banner nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="page-content">
                    <div className="page-content-item">
                      <button className="first" onClick={() => this.handlePageChange(1, 3)} disabled={currentPage === 1}>
                        {'<<'}
                      </button>
                      <button className="prev" onClick={() => this.handlePrevPage(3)} disabled={currentPage === 1}>
                        {'<'}
                      </button>
                      <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 3)} onBlur={() => this.handlePageInputBlur(3)} />
                      <span className="total-pages">/ {totalPages}</span>
                      <button className="next" onClick={() => this.handleNextPage(3)} disabled={currentPage === totalPages}>
                        {'>'}
                      </button>
                      <button className="last" onClick={() => this.handlePageChange(totalPages, 3)} disabled={currentPage === totalPages}>
                        {'>>'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        case 4:
          return (
            <div>
              <button style={{ display: actionPage === 4 ? 'block' : 'none' }} onClick={() => this.toggleCreateCouponModal()} className="add-coupon">
                THÊM COUPON <IonIcon icon={add}></IonIcon>
              </button>
              <div className="f">
                <div className="owner-mid-content-search-coupon" style={{ display: actionPage === 4 ? 'flex' : 'none' }}>
                  <p>Tìm kiếm:</p>
                  <input type="text" placeholder="Nhập mã coupon" value={searchValue} onChange={(event) => this.handleSearchChange(event, 4)} />
                  <IonIcon icon={searchOutline}></IonIcon>
                </div>
                <div style={{ display: actionPage === 4 ? 'flex' : 'none' }} className="owner-mid-content-coupon-filter-sort f">
                  <div className="owner-mid-content-coupon-filter">
                    <label>Lọc Coupon:</label>
                    <br />
                    <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 4)}>
                      <option value="ALL">Tất cả</option>
                      {codeCouponStatus && codeCouponStatus.length > 0 && (
                        <optgroup label="Trạng thái">
                          {codeCouponStatus.map((item) => (
                            <option key={`couponstatus-${item.Code}`} value={`couponstatus-${item.Code}`}>
                              {item.CodeValueVI}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {codeDiscountType && codeDiscountType.length > 0 && (
                        <optgroup label="Loại giảm giá">
                          {codeDiscountType.map((item) => (
                            <option key={`discounttype-${item.Code}`} value={`discounttype-${item.Code}`}>
                              {item.CodeValueVI}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Giảm giá tối đa">
                        <option value="maxdiscountfixed-0">0 - 20.000 VNĐ</option>
                        <option value="maxdiscountfixed-1">20.000 - 50.000 VNĐ</option>
                        <option value="maxdiscountfixed-2">50.000 - 100.000 VNĐ</option>
                        <option value="maxdiscountfixed-3">Trên 100.000 VNĐ</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="owner-mid-content-coupon-sort">
                    <label>Sắp xếp:</label>
                    <br />
                    <select value={sortValue} onChange={(e) => this.handleSort(e.target.value, 4)}>
                      <option value="0">Mặc định</option>
                      <option value="1">Mới nhất</option>
                      <option value="2">Cũ nhất</option>
                      <option value="3">Hạn sử dụng xa nhất</option>
                      <option value="4">Hết sử dụng gần nhất</option>
                      <option value="5">Giảm giá ít nhất</option>
                      <option value="6">Giảm giá nhiều nhất</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: actionPage === 4 ? 'block' : 'none' }} className="owner-mid-content-coupon-date">
                  <label>Coupon còn hiệu lực trong ngày:</label>
                  <br />
                  <div className="f">
                    <DatePicker
                      selected={dateFilterValue ? new Date(dateFilterValue + 'T00:00:00') : null}
                      onChange={(date) => {
                        const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                        this.setState({ dateFilterValue: formattedDate }, () => {
                          if (this.state.actionPage === 4) {
                            this.handleLoadCouponInfo();
                          }
                        });
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-picker"
                      isClearable
                    />
                    <button style={{ marginLeft: '10px' }} onClick={() => this.handleResetFilter(4)}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="owner-mid-content-mid-list-coupon">
                <table>
                  <thead>
                    <tr>
                      <th>Mã giảm giá</th>
                      <th>Giá trị giảm</th>
                      <th>Giảm tối đa</th>
                      <th>Mua tối thiểu</th>
                      <th>Mô tả</th>
                      <th>Loại giảm giá</th>
                      <th>Trạng thái</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày hết hạn</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedCouponInfo.length > 0 ? (
                      loadedCouponInfo.map((item, index) => (
                        <tr key={item.CouponID} className="owner-mid-content-right-list-coupon-item">
                          <td>{item.CouponCode}</td>
                          <td>
                            {parseFloat(item.DiscountValue).toLocaleString('vi-VN')}
                            {item.DiscountType === 'PERC' ? '%' : 'vnđ'}
                          </td>
                          <td>{parseFloat(item.MaxDiscount).toLocaleString('vi-VN')}vnđ</td>
                          <td>{parseFloat(item.MinOrderValue) > 0 ? parseFloat(item.MinOrderValue).toLocaleString('vi-VN') + 'vnđ' : 'Không yêu cầu'}</td>
                          <td>{item.CouponDescription || 'N/A'}</td>
                          <td>{codeDiscountType.find((filterItem) => filterItem.Code === item.DiscountType)?.CodeValueVI || item.DiscountType}</td>
                          <td>{codeCouponStatus.find((filterItem) => filterItem.Code === item.CouponStatus)?.CodeValueVI || item.CouponStatus}</td>
                          <td>
                            {item.StartDate
                              ? new Date(item.StartDate).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              : 'N/A'}
                          </td>
                          <td>
                            {item.EndDate
                              ? new Date(item.EndDate).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                              : 'Vô thời hạn'}
                          </td>
                          <td className="f" onClick={(e) => e.stopPropagation()}>
                            <button className="btn-edit" onClick={() => this.handleEditCoupon(index)}>
                              <IonIcon icon={pencil}></IonIcon>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10">Không tìm thấy coupon nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="page-content">
                    <div className="page-content-item">
                      <button className="first" onClick={() => this.handlePageChange(1, 4)} disabled={currentPage === 1}>
                        {'<<'}
                      </button>
                      <button className="prev" onClick={() => this.handlePrevPage(4)} disabled={currentPage === 1}>
                        {'<'}
                      </button>
                      <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 4)} onBlur={() => this.handlePageInputBlur(4)} />
                      <span className="total-pages">/ {totalPages}</span>
                      <button className="next" onClick={() => this.handleNextPage(4)} disabled={currentPage === totalPages}>
                        {'>'}
                      </button>
                      <button className="last" onClick={() => this.handlePageChange(totalPages, 4)} disabled={currentPage === totalPages}>
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

    return (
      <div className="owner-body">
        <CreateProductModal isOpen={isShowCreateProductModal} toggleFromModal={this.toggleCreateProductModal} handleCreateProductFromModal={this.handleCreateProductFromModal} />
        <EditProductModal isOpen={isShowEditProductModal} toggleFromModal={this.toggleEditProductModal} selectedProductID={selectedProduct} handleChangeProductFromModal={this.handleChangeProductFromModal} />
        <CreateBannerModal isOpen={isShowCreateBannerModal} toggleFromModal={this.toggleCreateBannerModal} handleCreateBannerFromModal={this.handleCreateBannerFromModal} />
        <EditBannerModal isOpen={isShowEditBannerModal} toggleFromModal={this.toggleEditBannerModal} selectedBannerID={selectedBanner} handleChangeBannerFromModal={this.handleChangeBannerFromModal} />
        <ViewInvoiceModal isOpen={isShowViewInvoiceModal} toggleFromModal={this.toggleViewInvoiceModal} selectedInvoiceID={selectedInvoice} />
        <CancelInvoiceModal isOpen={isShowCancelInvoiceModal} toggleFromModal={this.toggleCancelInvoiceModal} selectedCancelInvoiceID={selectedCancelInvoice} handleCancelInvoiceFromModal={this.handleCancelInvoiceFromModal} />
        <CreateCouponModal isOpen={isShowCreateCouponModal} toggleFromModal={this.toggleCreateCouponModal} handleCreateCouponFromModal={this.handleCreateCouponFromModal} />
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
          <div className="container">
            <div className="f">
              <h1 className="name">Trang chủ cửa hàng</h1>
              <button className="home-button" onClick={() => this.props.navigate('/home')}>
                <IonIcon icon={homeOutline}></IonIcon>
                <b>Quay về cửa hàng</b>
              </button>
              <button className='logout-button' onClick={this.handleLogout} disabled={disabledButtons.logout}>
                ĐĂNG XUẤT <IonIcon icon={logOutOutline}></IonIcon>
              </button>
            </div>
            <div className="owner-top-content">
              <div className="owner-top-content-menu f">
                <li>
                  <a onClick={this.handleFormDanhSachSanPham} className={actionPage === 1 ? 'active' : ''}>
                    SẢN PHẨM
                  </a>
                </li>
                <li>
                  <a onClick={this.handleFormDanhSachDonHang} className={actionPage === 2 ? 'active' : ''}>
                    HÓA ĐƠN
                  </a>
                </li>
                <li>
                  <a onClick={this.handleFormDanhSachBanner} className={actionPage === 3 ? 'active' : ''}>
                    BANNER
                  </a>
                </li>
                <li>
                  <a onClick={this.handleFormDanhSachCoupon} className={actionPage === 4 ? 'active' : ''}>
                    COUPON
                  </a>
                </li>
              </div>
            </div>
            <div className="owner-mid-content f">{renderSection()}</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Owner);
