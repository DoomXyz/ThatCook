import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';

import { pencil, searchOutline, add, homeOutline, cashOutline, banOutline, refreshOutline, closeCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

import './Owner.scss';
import Spinner from '../../components/Spinner';

import { handleLogoutApi } from '../../services/accountServices';
import { handleLoadProductInfoApi, handleCreateProductApi, handleChangeProductInfoApi } from '../../services/productServices';
import { handleLoadBannerInfoApi, handleCreateBannerApi, handleChangeBannerInfoApi } from '../../services/bannerServices';
import { handleLoadInvoiceInfoApi, handleChangeInvoiceStatusApi } from '../../services/invoiceServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { handleCreateCouponApi, handleLoadCouponInfoApi } from '../../services/couponServices';

import { checkLoginStatus } from '../../utils/pakage';
import { userLogin, userLogout } from '../../store/actions';

import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';
import ViewInvoiceModal from './ViewInvoiceModal';
import CreateBannerModal from './CreateBannerModal';
import CreateCouponModal from './CreateCouponModal.js';
import EditBannerModal from './EditBannerModal';
import CancelInvoiceModal from '../../components/CancelInvoiceModal';

import { set } from 'lodash';

class Owner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowEditBannerModal: false,
      isShowCreateBannerModal: false,
      isShowCreateProductModal: false,
      isShowEditProductModal: false,
      isShowViewInvoiceModal: false,
      isShowCancelInvoiceModal: false,
      isShowCreateCouponModal: false,
      accountInfo: null,
      isLoggedIn: false,
      isLoading: true,
      loadedProductTypeFilterValue: [],
      loadedPetTypeFilterValue: [],
      loadedPaymentStatusFilterValue: [],
      loadedShippingStatusFilterValue: [],
      loadedBannerStatusFilterValue: [],
      loadedCouponStatusFilterValue: [],
      loadedDiscountTypeFilterValue: [],
      actionPage: 1,
      currentPage: 1,
      tempCurrentPage: '1',
      limitProductPerQuery: 10,
      limitInvoicePerQuery: 10,
      limitCouponPerQuery: 10,
      limitBannerPerQuery: 5,
      searchValue: '',
      dateFilterValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      totalProductPages: 1,
      totalInvoicePages: 1,
      totalBannerPages: 1,
      totalCouponPages: 1,
      loadedProductInfo: [],
      loadedInvoiceInfo: [],
      loadedBannerInfo: [],
      loadedCouponInfo: [],
      selectedProduct: null,
      selectedBanner: null,
      selectedInvoice: null,
      selectedCoupon: null,
      selectedCancelInvoice: null,
    };
    this.debounceTimeout = null;
  }

  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadProductInfo();
    await this.handleLoadProductTypeFilterValue();
    await this.handleLoadPetTypeFilterValue();
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.actionPage !== this.state.actionPage) {
      const { actionPage, loadedProductTypeFilterValue, loadedPetTypeFilterValue, loadedPaymentStatusFilterValue, loadedShippingStatusFilterValue, loadedBannerStatusFilterValue, loadedCouponStatusFilterValue, loadedDiscountTypeFilterValue } = this.state;
      switch (this.state.actionPage) {
        case 1:
          if (actionPage === 1) {
            this.handleLoadProductInfo();
          }
          if (loadedProductTypeFilterValue.length === 0) {
            await this.handleLoadProductTypeFilterValue();
          }
          if (loadedPetTypeFilterValue.length === 0) {
            await this.handleLoadPetTypeFilterValue();
          }
          break;
        case 2:
          if (actionPage === 2) {
            this.handleLoadInvoiceInfo();
          }
          if (loadedPaymentStatusFilterValue.length === 0) {
            await this.handleLoadPaymentStatusFilterValue();
          }
          if (loadedShippingStatusFilterValue.length === 0) {
            await this.handleLoadShippingStatusFilterValue();
          }
          break;
        case 3:
          if (actionPage === 3) {
            this.handleLoadBannerInfo();
          }
          if (loadedBannerStatusFilterValue.length === 0) {
            await this.handleLoadBannerStatusFilterValue();
          }
          break;
        case 4:
          if (actionPage === 4) {
            this.handleLoadCouponInfo();
          }
          if (loadedCouponStatusFilterValue.length === 0) {
            await this.handleLoadCouponStatusFilterValue();
          }
          if (loadedDiscountTypeFilterValue.length === 0) {
            await this.handleLoadDiscountTypeFilterValue();
          }
          break;
        default:
          break;
      }
    }
  }
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
      console.log('Token not found!');
    }
    this.setState({
      isLoading: false,
    });
  };
  handleLoadProductInfo = async () => {
    const { currentPage, limitProductPerQuery, searchValue, filterValue, sortValue } = this.state;
    try {
      const response = await handleLoadProductInfoApi(currentPage, limitProductPerQuery, searchValue, filterValue, sortValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedProductInfo: response.data,
          totalProductPages: Math.ceil(response.totalItems / limitProductPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading invoiceinfo:', e);
      toast.error('Lỗi khi load danh sách sản phẩm!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadProductTypeFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('ProductType');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedProductTypeFilterValue: loadedFilterValue,
      });
    } catch (e) {
      console.log('Error loading pettype code:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadPetTypeFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('PetType');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedPetTypeFilterValue: loadedFilterValue,
      });
    } catch (e) {
      console.log('Error loading pettype code:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadInvoiceInfo = async () => {
    const { currentPage, limitInvoicePerQuery, searchValue, filterValue, sortValue, dateFilterValue } = this.state;
    try {
      const response = await handleLoadInvoiceInfoApi(currentPage, limitInvoicePerQuery, searchValue, filterValue, sortValue, dateFilterValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedInvoiceInfo: response.data,
          totalInvoicePages: Math.ceil(response.totalItems / limitInvoicePerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading invoiceinfo:', e);
      toast.error('Lỗi khi load danh sách đơn hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadPaymentStatusFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('PaymentStatus');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedPaymentStatusFilterValue: loadedFilterValue,
      });
    } catch (e) {
      console.log('Error loading paymentstatus code:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadShippingStatusFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('ShippingStatus');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedShippingStatusFilterValue: loadedFilterValue,
      });
    } catch (e) {
      console.log('Error loading shippingstatus code:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadBannerInfo = async () => {
    const { currentPage, limitBannerPerQuery, searchValue, filterValue, sortValue, dateFilterValue } = this.state;
    try {
      const response = await handleLoadBannerInfoApi(currentPage, limitBannerPerQuery, searchValue, filterValue, sortValue, dateFilterValue);
      if (response && response.errCode === 0) {
        this.setState({
          loadedBannerInfo: response.data,
          totalBannerPages: Math.ceil(response.totalItems / limitBannerPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading bannerinfo:', e);
      toast.error('Lỗi khi load danh sách banner!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCouponInfo = async () => {
    const { currentPage, limitCouponPerQuery, searchValue, filterValue, sortValue, dateFilterValue } = this.state;
    try {
      const response = await handleLoadCouponInfoApi(currentPage, limitCouponPerQuery, searchValue, filterValue, sortValue, dateFilterValue);
      console.log(response);
      if (response && response.data.errCode === 0) {
        this.setState({
          loadedCouponInfo: response.data.data,
          totalCouponPages: Math.ceil(response.data.totalItems / limitCouponPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading couponinfo:', e);
      toast.error('Lỗi khi load danh sách coupon!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadBannerStatusFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('BannerStatus');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedBannerStatusFilterValue: loadedFilterValue,
      });
    } catch (e) {
      console.log('Error loading bannerstatus code:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadCouponStatusFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('CouponStatus');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedCouponStatusFilterValue: loadedFilterValue,
      });
    } catch (e) {
      console.log('Error loading couponstatus code:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleLoadDiscountTypeFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetAllCodesApi('DiscountType');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedDiscountTypeFilterValue: loadedFilterValue,
      });
    } catch (e) {
      console.log('Error loading discounttype code:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  handleSearchChange = (event, type) => {
    const value = event.target.value;
    this.setState(
      {
        searchValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        if (this.debounceTimeout) {
          clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(() => {
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
        }, 500);
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
      }
    );
  };
  handleSort = (value, type) => {
    this.setState(
      {
        sortValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
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
      }
    );
  };
  handleResetFilter = () => {
    this.setState(
      {
        currentPage: 1,
        tempCurrentPage: '1',
        searchValue: '',
        dateFilterValue: '',
        filterValue: 'ALL',
        sortValue: '0',
      },
      () => {
        switch (this.state.actionPage) {
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
      }
    );
  };
  handlePageChange = (page, type) => {
    this.setState({
      isLoading: true,
    });
    const { totalProductPages, totalInvoicePages, totalBannerPages, totalCouponPages } = this.state;
    let totalPages;
    switch (type) {
      case 1:
        totalPages = totalProductPages;
        break;
      case 2:
        totalPages = totalInvoicePages;
        break;
      case 3:
        totalPages = totalBannerPages;
        break;
      case 4:
        totalPages = totalCouponPages;
        break;
      default:
        totalPages = 1;
    }
    let newPage = page;
    if (isNaN(page) || page <= 0) {
      newPage = 1;
    } else if (page > totalPages) {
      newPage = totalPages;
    }
    this.setState(
      {
        isLoading: false,
        currentPage: newPage,
        tempCurrentPage: newPage.toString(),
      },
      () => {
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
      }
    );
  };
  handlePrevPage = (type) => {
    this.setState(
      (prevState) => {
        const newPage = Math.max(1, prevState.currentPage - 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      },
      () => {
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
      }
    );
  };
  handleNextPage = (type) => {
    this.setState(
      (prevState) => {
        const newPage = Math.min(type === 1 ? prevState.totalProductPages : type === 2 ? prevState.totalInvoicePages : type === 3 ? prevState.totalBannerPages : prevState.totalCouponPages, prevState.currentPage + 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      },
      () => {
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
  handleSelectedProduct = (productid) => {
    this.setState({
      selectedProduct: productid,
      isShowEditProductModal: true,
    });
  };
  handleSelectedBanner = (bannerid) => {
    this.setState({
      selectedBanner: bannerid,
      isShowEditBannerModal: true,
    });
  };
  handleSelectedInvoice = (invoiceid) => {
    this.setState({
      selectedInvoice: invoiceid,
      isShowViewInvoiceModal: true,
    });
  };
  handleSelectedCoupon = (couponid) => {
    console.log(couponid)
  };
  handleSelectedCancelInvoice = (invoiceid) => {
    this.setState({
      selectedCancelInvoice: invoiceid,
      isShowCancelInvoiceModal: true,
    });
  };
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
  handleCreateProductFromModal = async (productInfo) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleCreateProductApi(productInfo);
      if (response && response.errCode === 0) {
        toast.success('Thêm sản phẩm mới thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadProductInfo();
        this.setState({
          isShowCreateProductModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Thêm sản phẩm mới thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Create Product:', e);
      toast.error('Xảy ra lỗi khi thêm sản phẩm mới, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleChangeProductFromModal = async (productInfo) => {
    this.setState({ isLoading: true });
    try {
      console.log(productInfo);
      const response = await handleChangeProductInfoApi(productInfo);
      if (response && response.errCode === 0) {
        toast.success('Chỉnh sửa thông tin sản phẩm thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadProductInfo();
        this.setState({
          isShowEditProductModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Chỉnh sửa thông tin sản phẩm thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Edit:', e);
      toast.error('Xảy ra lỗi khi chỉnh sửa, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleCreateBannerFromModal = async (bannerInfo) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleCreateBannerApi(bannerInfo);
      if (response && response.errCode === 0) {
        toast.success('Thêm banner mới thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadBannerInfo();
        this.setState({
          isShowCreateBannerModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Thêm banner mới thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Create Banner:', e);
      toast.error('Xảy ra lỗi khi thêm banner mới, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleChangeBannerFromModal = async (bannerInfo) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleChangeBannerInfoApi(bannerInfo);
      if (response && response.errCode === 0) {
        toast.success('Chỉnh sửa thông tin banner thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadBannerInfo();
        this.setState({
          isShowEditBannerModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Chỉnh sửa thông tin banner thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Edit:', e);
      toast.error('Xảy ra lỗi khi chỉnh sửa, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleCancelInvoiceFromModal = async (invoiceid, cancelreason) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'CANCELED', cancelreason);
      if (response && response.errCode === 0) {
        toast.success('Hủy hóa đơn thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceInfo();
        this.setState({
          isShowCancelInvoiceModal: false,
          selectedCancelInvoice: null,
        });
      } else {
        toast.error(response?.errMessage || 'Hủy hóa đơn thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error canceling invoice:', e);
      toast.error('Lỗi khi hủy hóa đơn, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleCreateCouponFromModal = async (couponInfo) => {
    this.setState({ isLoading: true });
    try {
      const responseApi = await handleCreateCouponApi(couponInfo);
      const response = responseApi.data;
      if (response && response.errCode === 0) {
        toast.success('Thêm coupon mới thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadCouponInfo();
        this.setState({
          isShowCreateCouponModal: false,
        });
      } else {
        const errMessage = response?.errMessage || 'Thêm coupon mới thất bại!';
        toast.error(errMessage, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Create Coupon:', e);
      toast.error('Xảy ra lỗi khi thêm coupon mới, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };
  handleFormDanhSachSanPham = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 1,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      dateFilterValue: '',
      filterValue: 'ALL',
      sortValue: '0',
    });
  };
  handleFormDanhSachDonHang = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 2,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      dateFilterValue: '',
      filterValue: 'ALL',
      sortValue: '0',
    });
  };
  handleFormDanhSachBanner = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 3,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      dateFilterValue: '',
      filterValue: 'ALL',
      sortValue: '0',
    });
  };
  handleFormDanhSachCoupon = (e) => {
    e.preventDefault();
    this.setState({
      actionPage: 4,
      currentPage: 1,
      tempCurrentPage: '1',
      searchValue: '',
      dateFilterValue: '',
      filterValue: 'ALL',
      sortValue: '0',
    });
  };
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
          </div>,
          { position: 'top-center', autoClose: 500, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'PaymentStatus', 'PAID', '');
      if (response && response.errCode === 0) {
        toast.success('Xác nhận thanh toán thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Xác nhận thanh toán thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error confirming payment:', e);
      toast.error('Lỗi khi xác nhận thanh toán, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
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
          </div>,
          { position: 'top-center', autoClose: 500, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'DELI', '');
      if (response && response.errCode === 0) {
        toast.success('Xác nhận giao hàng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Xác nhận giao hàng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error confirming delivery:', e);
      toast.error('Lỗi khi xác nhận giao hàng, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
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
          </div>,
          { position: 'top-center', autoClose: 500, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'CANCELED', '');
      if (response && response.errCode === 0) {
        toast.success('Hủy hóa đơn thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Hủy hóa đơn thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error canceling invoice:', e);
      toast.error('Lỗi khi hủy hóa đơn, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
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
          </div>,
          { position: 'top-center', autoClose: 500, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmAction();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'PEND', '');
      if (response && response.errCode === 0) {
        toast.success('Tiếp tục hóa đơn thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceInfo();
      } else {
        toast.error(response?.errMessage || 'Tiếp tục hóa đơn thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error denying cancel invoice:', e);
      toast.error('Lỗi khi tiếp tục hóa đơn, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
    this.setState({ isLoading: false });
  };

  render() {
    const {
      loadedProductInfo,
      loadedProductTypeFilterValue,
      loadedPetTypeFilterValue,
      loadedInvoiceInfo,
      loadedPaymentStatusFilterValue,
      loadedShippingStatusFilterValue,
      loadedBannerInfo,
      loadedBannerStatusFilterValue,
      loadedCouponInfo,
      loadedCouponStatusFilterValue,
      loadedDiscountTypeFilterValue,
      isLoading,
      actionPage,
      searchValue,
      sortValue,
      filterValue,
      dateFilterValue,
      currentPage,
      tempCurrentPage,
      totalProductPages,
      totalInvoicePages,
      totalBannerPages,
      totalCouponPages,
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
                        {loadedProductTypeFilterValue && loadedProductTypeFilterValue.length > 0 && (
                          <optgroup label="Loại sản phẩm">
                            {loadedProductTypeFilterValue.map((item) => (
                              <option key={`producttype-${item.Code}`} value={`producttype-${item.Code}`}>
                                {item.CodeValueVI}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {loadedPetTypeFilterValue && loadedPetTypeFilterValue.length > 0 && (
                          <optgroup label="Sản phẩm cho thú cưng">
                            {loadedPetTypeFilterValue.map((item) => (
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
                                <td>{loadedProductTypeFilterValue.find((filterItem) => filterItem.Code === item.ProductType)?.CodeValueVI || item.ProductType}</td>
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
                    {totalProductPages > 1 && (
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
                          <span className="total-pages">/ {totalProductPages}</span>
                          <button className="next" onClick={() => this.handleNextPage(1)} disabled={currentPage === totalProductPages}>
                            {'>'}
                          </button>
                          <button className="last" onClick={() => this.handlePageChange(totalProductPages, 1)} disabled={currentPage === totalProductPages}>
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
                      {loadedPaymentStatusFilterValue && loadedPaymentStatusFilterValue.length > 0 && (
                        <optgroup label="Tình trạng thanh toán">
                          {loadedPaymentStatusFilterValue.map((item) => (
                            <option key={`paymentstatus-${item.Code}`} value={`paymentstatus-${item.Code}`}>
                              {item.CodeValueVI}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {loadedShippingStatusFilterValue && loadedShippingStatusFilterValue.length > 0 && (
                        <optgroup label="Tình trạng giao hàng">
                          {loadedShippingStatusFilterValue.map((item) => (
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
                    />
                    <button style={{ marginLeft: '10px' }} onClick={this.handleResetFilter}>
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
                          <td>{loadedPaymentStatusFilterValue.find((filterItem) => filterItem.Code === item.PaymentStatus)?.CodeValueVI || item.PaymentStatus}</td>
                          <td>{loadedShippingStatusFilterValue.find((filterItem) => filterItem.Code === item.ShippingStatus)?.CodeValueVI || item.ShippingStatus}</td>
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
                {totalInvoicePages > 1 && (
                  <div className="page-content">
                    <div className="page-content-item">
                      <button className="first" onClick={() => this.handlePageChange(1, 2)} disabled={currentPage === 1}>
                        {'<<'}
                      </button>
                      <button className="prev" onClick={() => this.handlePrevPage(2)} disabled={currentPage === 1}>
                        {'<'}
                      </button>
                      <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 2)} onBlur={() => this.handlePageInputBlur(2)} />
                      <span className="total-pages">/ {totalInvoicePages}</span>
                      <button className="next" onClick={() => this.handleNextPage(2)} disabled={currentPage === totalInvoicePages}>
                        {'>'}
                      </button>
                      <button className="last" onClick={() => this.handlePageChange(totalInvoicePages, 2)} disabled={currentPage === totalInvoicePages}>
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
                      {loadedBannerStatusFilterValue && loadedBannerStatusFilterValue.length > 0 && (
                        <optgroup label="Trạng thái">
                          {loadedBannerStatusFilterValue.map((item) => (
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
                    />
                    <button style={{ marginLeft: '10px' }} onClick={this.handleResetFilter}>
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
                          <td>{loadedBannerStatusFilterValue.find((filterItem) => filterItem.Code === item.BannerStatus)?.CodeValueVI || item.BannerStatus}</td>
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
                {totalBannerPages > 1 && (
                  <div className="page-content">
                    <div className="page-content-item">
                      <button className="first" onClick={() => this.handlePageChange(1, 3)} disabled={currentPage === 1}>
                        {'<<'}
                      </button>
                      <button className="prev" onClick={() => this.handlePrevPage(3)} disabled={currentPage === 1}>
                        {'<'}
                      </button>
                      <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 3)} onBlur={() => this.handlePageInputBlur(3)} />
                      <span className="total-pages">/ {totalBannerPages}</span>
                      <button className="next" onClick={() => this.handleNextPage(3)} disabled={currentPage === totalBannerPages}>
                        {'>'}
                      </button>
                      <button className="last" onClick={() => this.handlePageChange(totalBannerPages, 3)} disabled={currentPage === totalBannerPages}>
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
                      {loadedCouponStatusFilterValue && loadedCouponStatusFilterValue.length > 0 && (
                        <optgroup label="Trạng thái">
                          {loadedCouponStatusFilterValue.map((item) => (
                            <option key={`couponstatus-${item.Code}`} value={`couponstatus-${item.Code}`}>
                              {item.CodeValueVI}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {loadedDiscountTypeFilterValue && loadedDiscountTypeFilterValue.length > 0 && (
                        <optgroup label="Loại giảm giá">
                          {loadedDiscountTypeFilterValue.map((item) => (
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
                    />
                    <button style={{ marginLeft: '10px' }} onClick={this.handleResetFilter}>
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
                      loadedCouponInfo.map((item) => (
                        <tr key={item.CouponID} className="owner-mid-content-right-list-coupon-item">
                          <td>{item.CouponCode}</td>
                          <td>
                            {parseFloat(item.DiscountValue).toLocaleString('vi-VN')}
                            {item.DiscountType === 'PERC' ? '%' : 'vnđ'}
                          </td>
                          <td>{parseFloat(item.MaxDiscount).toLocaleString('vi-VN')}vnđ</td>
                          <td>{parseFloat(item.MinOrderValue) > 0 ? parseFloat(item.MinOrderValue).toLocaleString('vi-VN') + 'vnđ' : 'Không yêu cầu'}</td>
                          <td>{item.CouponDescription || 'N/A'}</td>
                          <td>{loadedDiscountTypeFilterValue.find((filterItem) => filterItem.Code === item.DiscountType)?.CodeValueVI || item.DiscountType}</td>
                          <td>{loadedCouponStatusFilterValue.find((filterItem) => filterItem.Code === item.CouponStatus)?.CodeValueVI || item.CouponStatus}</td>
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
                            <button className="btn-edit" onClick={() => this.handleSelectedCoupon(item.CouponID)}>
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
                {totalCouponPages > 1 && (
                  <div className="page-content">
                    <div className="page-content-item">
                      <button className="first" onClick={() => this.handlePageChange(1, 4)} disabled={currentPage === 1}>
                        {'<<'}
                      </button>
                      <button className="prev" onClick={() => this.handlePrevPage(4)} disabled={currentPage === 1}>
                        {'<'}
                      </button>
                      <input type="text" value={tempCurrentPage} onChange={(event) => this.handlePageInputChange(event)} onKeyDown={(event) => this.handlePageKeyDown(event, 4)} onBlur={() => this.handlePageInputBlur(4)} />
                      <span className="total-pages">/ {totalCouponPages}</span>
                      <button className="next" onClick={() => this.handleNextPage(4)} disabled={currentPage === totalCouponPages}>
                        {'>'}
                      </button>
                      <button className="last" onClick={() => this.handlePageChange(totalCouponPages, 4)} disabled={currentPage === totalCouponPages}>
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
        <ToastContainer />
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
