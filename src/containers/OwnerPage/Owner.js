import React, { Component } from "react";
import DatePicker from "react-datepicker";
import { connect } from "react-redux";
import { IonIcon } from "@ionic/react";
import {
  buildOutline,
  closeCircleOutline,
  searchOutline,
  add,
  trashOutline,
  closeOutline,
  checkmarkOutline,
  homeOutline,
} from "ionicons/icons";
import debounce from "lodash/debounce";
import { ToastContainer, toast } from "react-toastify";
import "./Owner.scss";
import OwnerCreateProductModal from "./OwnerCreateProductModal";
import OwnerEditProductModal from "./OwnerEditProductModal";
import OwnerCreateBannerModal from "./OwnerCreateBannerModal";
import OwnerEditBannerModal from "./OwnerEditBannerModal";
import OwnerViewInvoiceModal from "./OwnerViewInvoiceModal";

import {
  handleLoadProductInfoApi,
  handleCreateProduct,
  handleXoaProduct,
  handleUpdateProduct,
} from "../../services/productServices";
import {
  handleGetAllCodesApi,
  handleLoadBanner,
} from "../../services/utilitiesServices";
import {
  handleLoginApi,
  handleLogoutApi,
  handleVerifyTokenApi,
} from "../../services/accountServices";
import { handleLoadHoaDon } from "../../services/billService";
import hinhtest from "../../assets/productha/hinhtest.jpg";
import bannertest from "../../assets/bannerimgs/1.webp";
import { userLogout } from "../../store/actions";

class Owner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowEditBannerModal: false,
      isShowCreateBannerModal: false,
      isShowCreateProductModal: false,
      isShowEditProductModal: false,
      isShowViewInvoiceModal: false,

      activeSection: "products",
      productPage: 1,
      invoicePage: 1,
      imagePage: 1,
      invoiceDate: "",
      itemsPerPageProducts: 7,
      itemsPerPageInvoices: 10,
      itemsPerPageImages: 10,
      totalProductItems: 0,
      totalInvoiceItems: 0,
      totalImageItems: 0,
      arrSanPham: [],
      arrHoaDon: [],
      arrBanner: [],
      searchQuery: "",
      tempSearchQuery: "",
      sortOrder: "0",
      filters: { selectedFilter: "ALL" },
      filterValue: [],
      selectedProduct: null,
      selectedInvoice: null,
    };
    this.handleSearchDebounced = debounce(this.performSearch, 500);
  }

  handleCheckSession = async () => {
    try {
      let response = await handleVerifyTokenApi();
      if (response && response.errCode === 0) {
        if (response.data.AccountType !== "O") {
          toast.error("Bạn không có quyền truy cập trang Owner!");
          this.props.navigate("/login");
        }
      } else {
        toast.error(response.errMessage || "Phiên đăng nhập không hợp lệ!");
        await handleLogoutApi();
        this.props.userLogout();
        this.props.navigate("/login");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi xác thực phiên đăng nhập!");
      this.props.navigate("/login");
    }
  };

  async componentDidMount() {
    await this.handleCheckSession();
    if (this.state.activeSection === "products") {
      await this.loadAllSanPham();
      await this.handleLoadFilterValue();
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.activeSection !== this.state.activeSection) {
      if (this.state.activeSection === "products") {
        await this.loadAllSanPham();
        if (this.state.filterValue.length === 0) {
          await this.handleLoadFilterValue();
        }
      } else if (this.state.activeSection === "invoices") {
        await this.loadAllHoaDon();
      } else if (this.state.activeSection === "images") {
        await this.loadAllBanner();
      }
    }
  }

  handleSectionChange = (section) => {
    this.setState({
      activeSection: section,
      searchQuery: "",
      tempSearchQuery: "",
      sortOrder: "0",
      invoiceDate: "",
      productPage: 1,
      invoicePage: 1,
      imagePage: 1,
    });
  };

  handleDateChange = (e) => {
    this.setState({ invoiceDate: e.target.value }, () => {
      if (this.state.activeSection === "invoices") {
        this.loadAllHoaDon();
      }
    });
  };

  handleLoadFilterValue = async () => {
    try {
      let filterMap = await handleGetAllCodesApi("ProductType");
      const updatedFilterMap = [...filterMap];
      this.setState({ filterValue: updatedFilterMap });
    } catch (e) {
      console.log("Lỗi load filter:", e);
    }
  };

  handleResetFilters = () => {
    this.setState(
      {
        tempSearchQuery: "",
        searchQuery: "",
        invoiceDate: "",
        invoicePage: 1,
        imagePage: 1,
        sortOrder: "0",
        arrBanner: [],
      },
      () => {
        if (this.state.activeSection === "invoices") {
          this.loadAllHoaDon();
        } else if (this.state.activeSection === "images") {
          this.loadAllBanner();
        }
      }
    );
  };

  loadAllBanner = async () => {
    const { imagePage, itemsPerPageImages, searchQuery, sortOrder } =
      this.state;
    try {
      let response = await handleLoadBanner({
        page: imagePage,
        limit: itemsPerPageImages,
        search: searchQuery,
        sort: sortOrder,
      });
      if (response && response.data && response.data.errCode === 0) {
        this.setState({
          arrBanner: response.data.data || [],
          totalImageItems: response.data.totalItems || 0,
        });
      } else {
        toast.error("Không thể tải banner!");
        this.setState({
          arrBanner: [],
          totalImageItems: 0,
        });
      }
    } catch (e) {
      toast.error("Đã xảy ra lỗi khi tải banner!");
      this.setState({
        arrBanner: [],
        totalImageItems: 0,
      });
    }
  };

  loadAllSanPham = async () => {
    const {
      productPage,
      itemsPerPageProducts,
      searchQuery,
      filters,
      sortOrder,
    } = this.state;
    try {
      let response = await handleLoadProductInfoApi({
        page: productPage,
        limit: itemsPerPageProducts,
        search: searchQuery,
        filter: filters.selectedFilter,
        sort: sortOrder,
      });
      if (response && response.errCode === 0) {
        this.setState({
          arrSanPham: response.data,
          totalProductItems: response.totalItems,
        });
      } else {
        toast.error("Không thể tải sản phẩm!");
      }
    } catch (e) {
      toast.error("Đã xảy ra lỗi khi tải sản phẩm!");
    }
  };

  loadAllHoaDon = async () => {
    const {
      invoicePage,
      itemsPerPageInvoices,
      searchQuery,
      sortOrder,
      invoiceDate,
    } = this.state;
    try {
      let response = await handleLoadHoaDon({
        page: invoicePage,
        limit: itemsPerPageInvoices,
        search: searchQuery,
        date: invoiceDate,
        sort: sortOrder,
      });
      if (response && response.errCode === 0) {
        this.setState({
          arrHoaDon: response.data || [],
          totalInvoiceItems: response.totalItems || 0,
        });
      } else {
        toast.error("Không thể tải hóa đơn!");
        this.setState({
          arrHoaDon: [],
          totalInvoiceItems: 0,
        });
      }
    } catch (e) {
      toast.error("Đã xảy ra lỗi khi tải hóa đơn!");
      this.setState({
        arrHoaDon: [],
        totalInvoiceItems: 0,
      });
    }
  };

  performSearch = () => {
    this.setState(
      (prevState) => ({
        searchQuery: prevState.tempSearchQuery,
        productPage: 1,
        invoicePage: 1,
        imagePage: 1,
      }),
      () => {
        if (this.state.activeSection === "products") {
          this.loadAllSanPham();
        } else if (this.state.activeSection === "invoices") {
          this.loadAllHoaDon();
        } else if (this.state.activeSection === "images") {
          this.loadAllBanner();
        }
      }
    );
  };

  handleSearchChange = (e) => {
    const query = e.target.value;
    this.setState({ tempSearchQuery: query }, () => {
      this.handleSearchDebounced();
    });
  };

  handleFilterProduct = (filterValue) => {
    this.setState(
      {
        filters: {
          selectedFilter: filterValue,
          hasPromotion: filterValue === "PROMOTION",
        },
        productPage: 1,
      },
      () => this.loadAllSanPham()
    );
  };

  handleSortProduct = (sortValue) => {
    this.setState({ sortOrder: sortValue, productPage: 1 }, () => {
      this.loadAllSanPham();
    });
  };

  handleSortInvoice = (sortValue) => {
    this.setState({ sortOrder: sortValue, invoicePage: 1 }, () => {
      this.loadAllHoaDon();
    });
  };

  handleProductPageChange = (page) => {
    const totalPages = Math.ceil(
      this.state.totalProductItems / this.state.itemsPerPageProducts
    );
    if (page >= 1 && page <= totalPages) {
      this.setState({ productPage: page }, () => this.loadAllSanPham());
    }
  };

  handleInvoicePageChange = (page) => {
    const totalPages = Math.ceil(
      this.state.totalInvoiceItems / this.state.itemsPerPageInvoices
    );
    if (page >= 1 && page <= totalPages) {
      this.setState({ invoicePage: page }, () => {
        this.loadAllHoaDon();
      });
    } else {
      console.log("Page out of range:", page);
    }
  };

  handleImagePageChange = (page) => {
    const totalPages = Math.ceil(
      this.state.totalImageItems / this.state.itemsPerPageImages
    );
    if (page >= 1 && page <= totalPages) {
      this.setState({ imagePage: page }, () => this.loadAllBanner());
    } else {
      console.log("Page out of range:", page);
    }
  };

  handleSortBanner = (sortValue) => {
    this.setState({ sortOrder: sortValue, imagePage: 1 }, () => {
      this.loadAllBanner();
    });
  };

  handlePageInput = (e, type) => {
    const page = parseInt(e.target.value, 10);
    if (isNaN(page)) return;
    if (type === "products") {
      this.handleProductPageChange(page);
    } else if (type === "invoices") {
      this.handleInvoicePageChange(page);
    } else if (type === "images") {
      this.handleImagePageChange(page);
    }
  };

  toggleImageStatus = (id) => {
    this.setState((prevState) => ({
      arrBanner: prevState.arrBanner.map((item) =>
        item.ID === id ? { ...item, isActive: !item.isActive } : item
      ),
    }));
  };

  toggleCreateProductModal = () => {
    this.setState({
      isShowCreateProductModal: !this.state.isShowCreateProductModal,
    });
  };

  toggleEditProductModal = (product = null) => {
    this.setState({
      isShowEditProductModal: !this.state.isShowEditProductModal,
      selectedProduct: product,
    });
    if (product) {
      console.log("MASANPHAM:", product.MASANPHAM);
    }
  };

  toggleCreateBannerModal = () => {
    this.setState({
      isShowCreateBannerModal: !this.state.isShowCreateBannerModal,
    });
  };

  toggleEditBannerModal = (banner = null) => {
    this.setState((prev) => ({
      ...prev,
      isShowEditBannerModal: !prev.isShowEditBannerModal,
    }));
    if (banner) {
      console.log("Banner ID:", banner.ID);
    }
  };

  toggleViewInvoiceModal = (hoadon = null) => {
    this.setState({
      isShowViewInvoiceModal: !this.state.isShowViewInvoiceModal,
      selectedInvoice: hoadon, // Lưu hoặc reset giống selectedProduct
    });
    if (hoadon) {
      console.log("MADONHANG:", hoadon.MADONHANG);
    }
  };
  createNewProduct = async (productInfo) => {
    try {
      const response = await handleCreateProduct(productInfo);
      console.log(response);
      if (response && response.errCode === 0) {
        await this.loadAllSanPham();
        this.setState({ isShowCreateProductModal: false });
        toast.success("Tạo sản phẩm thành công!");
      } else {
        const errMessage =
          response && response.errMessage
            ? response.errMessage
            : "Lỗi không xác định từ server!";
        toast.error(errMessage);
      }
    } catch (e) {
      console.error("Lỗi chi tiết khi gọi API:", e);
      console.error("Phản hồi lỗi từ server (nếu có):", e.response);
      const errMessage =
        e.response && e.response && e.response.errMessage
          ? e.response.errMessage
          : e.message || "Lỗi kết nối hoặc server không phản hồi!";
      toast.error(errMessage);
    }
  };

  handleSaveProduct = async (productInfo) => {
    try {
      const response = await handleUpdateProduct(productInfo);
      if (response && response.errCode === 0) {
        await this.loadAllSanPham(); // Tải lại danh sách sản phẩm
        this.setState({ isShowEditProductModal: false }); // Đóng modal
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        const errMessage =
          response && response.errMessage
            ? response.errMessage
            : "Lỗi không xác định từ server!";
        toast.error(errMessage);
      }
    } catch (e) {
      console.error("Lỗi chi tiết khi gọi API:", e);
      const errMessage =
        e.response && e.response.data && e.response.data.errMessage
          ? e.response.data.errMessage
          : e.message || "Lỗi kết nối hoặc server không phản hồi!";
      toast.error(errMessage);
    }
  };
  deleteSanPham = async (masanpham) => {
    try {
      const response = await handleXoaProduct(masanpham);
      if (response && response.errCode === 0) {
        toast.success("Xóa sản phẩm thành công!");
        await this.loadAllSanPham();
      } else {
        toast.error(response.errMessage);
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const {
      invoiceDate,
      activeSection,
      productPage,
      invoicePage,
      arrBanner,
      imagePage,
      itemsPerPageProducts,
      itemsPerPageInvoices,
      itemsPerPageImages,
      totalProductItems,
      totalInvoiceItems,
      totalImageItems,
      arrSanPham,
      arrHoaDon,
      tempSearchQuery,
      filters,
      sortOrder,
      filterValue,
      isShowCreateProductModal,
      isShowEditProductModal,
      isShowCreateBannerModal,
      isShowEditBannerModal,
      isShowViewInvoiceModal,
    } = this.state;

    const startIndexProducts = (productPage - 1) * itemsPerPageProducts;
    const endIndexProducts = startIndexProducts + itemsPerPageProducts;
    const totalProductPages = Math.ceil(
      totalProductItems / itemsPerPageProducts
    );

    const startIndexInvoices = (invoicePage - 1) * itemsPerPageInvoices;
    const endIndexInvoices = startIndexInvoices + itemsPerPageInvoices;
    const totalInvoicePages = Math.ceil(
      totalInvoiceItems / itemsPerPageInvoices
    );

    const startIndexImages = (imagePage - 1) * itemsPerPageImages;
    const endIndexImages = startIndexImages + itemsPerPageImages;
    const totalImagePages = Math.ceil(totalImageItems / itemsPerPageImages);

    return (
      <div className="owner-body">
        <ToastContainer />
        <OwnerCreateProductModal
          isOpen={isShowCreateProductModal}
          toggleFromModal={this.toggleCreateProductModal}
          createNewProduct={this.createNewProduct}
        />
        <OwnerEditProductModal
          isOpen={isShowEditProductModal}
          toggleFromModal={this.toggleEditProductModal}
          product={this.state.selectedProduct}
          handleSaveProduct={this.handleSaveProduct}
        />
        <OwnerCreateBannerModal
          isOpen={isShowCreateBannerModal}
          toggleFromModal={this.toggleCreateBannerModal}
        />
        <OwnerEditBannerModal
          isOpen={isShowEditBannerModal}
          toggleFromModal={this.toggleEditBannerModal}
        />
        <OwnerViewInvoiceModal
          isOpen={isShowViewInvoiceModal}
          toggleFromModal={this.toggleViewInvoiceModal}
          hoadon={this.state.selectedInvoice}
        />

        <div className="container">
          <div className="f">
            <h1 className="name">Trang chủ cửa hàng</h1>
            <button
              className="home-button"
              onClick={() => this.props.navigate("/home")}
            >
              <IonIcon icon={homeOutline}></IonIcon>
              <b>Quay về cửa hàng</b>
            </button>
          </div>

          <div className="owner-top-content">
            <div className="owner-top-content-menu f">
              <li>
                <a
                  onClick={() => this.handleSectionChange("products")}
                  className={activeSection === "products" ? "active" : ""}
                >
                  SẢN PHẨM
                </a>
              </li>
              <li>
                <a
                  onClick={() => this.handleSectionChange("invoices")}
                  className={activeSection === "invoices" ? "active" : ""}
                >
                  HÓA ĐƠN
                </a>
              </li>
              {/* <li>
                <a
                  onClick={() => this.handleSectionChange("images")}
                  className={activeSection === "images" ? "active" : ""}
                >
                  BANNER
                </a>
              </li> */}
              <li>
                <button
                  style={{
                    display: activeSection === "products" ? "block" : "none",
                  }}
                  onClick={() => this.toggleCreateProductModal()}
                >
                  THÊM SẢN PHẨM <IonIcon icon={add}></IonIcon>
                </button>
                <button
                  style={{
                    display: activeSection === "images" ? "block" : "none",
                  }}
                  onClick={() => this.toggleCreateBannerModal()}
                >
                  THÊM HÌNH ẢNH <IonIcon icon={add}></IonIcon>
                </button>
              </li>
            </div>
          </div>
          <div className="add f">
            <div
              className="owner-top-content-search-banner"
              style={{
                display: activeSection === "images" ? "flex" : "none",
              }}
            >
              <b>TÌM KIẾM: </b>
              <input
                type="text"
                placeholder="Hãy nhập tên sản phẩm..."
                value={tempSearchQuery}
                onChange={this.handleSearchChange}
              />
              <IonIcon icon={searchOutline}></IonIcon>
            </div>
            <div
              style={{
                display: activeSection === "images" ? "flex" : "none",
              }}
              className="owner-mid-content-left-image-sort"
            >
              <label>Sắp xếp:</label>
              <br />
              <select
                value={sortOrder}
                onChange={(e) => this.handleSortBanner(e.target.value)}
              >
                <option value="0">Mới nhất</option>
                <option value="1">Cũ nhất</option>
              </select>
            </div>
            <div
              className="owner-mid-content-left-search-invoice"
              style={{
                display: activeSection === "invoices" ? "flex" : "none",
              }}
            >
              <b>TÌM KIẾM: </b>
              <input
                type="text"
                placeholder="Tìm kiếm số điện thoại nhận hàng..."
                value={tempSearchQuery}
                onChange={this.handleSearchChange}
              />
              <IonIcon icon={searchOutline}></IonIcon>
            </div>
            <div
              style={{
                display: activeSection === "invoices" ? "flex" : "none",
              }}
              className="owner-mid-content-left-invoice-sort"
            >
              <label>Sắp xếp:</label>
              <br />
              <select
                value={sortOrder}
                onChange={(e) => this.handleSortInvoice(e.target.value)}
              >
                <option value="0">Mặc định</option>
                <option value="1">Mới nhất</option>
                <option value="2">Cũ nhất</option>
                <option value="3">Tổng giá trị tăng dần</option>
                <option value="4">Tổng giá trị giảm dần</option>
                <option value="5">Số lượng tăng dần</option>
                <option value="6">Số lượng giảm dần</option>
                <option value="7">Tình trạng thanh toán</option>
              </select>
            </div>
            <div
              style={{
                display: activeSection === "invoices" ? "block" : "none",
              }}
              className="owner-mid-content-left-invoice-date"
            >
              <div className="f">
                <label>Ngày hóa đơn:</label>
                <DatePicker
                  selected={invoiceDate ? new Date(invoiceDate) : null}
                  onChange={(date) => {
                    const formattedDate = date
                      ? date.toISOString().split("T")[0]
                      : "";
                    this.setState({ invoiceDate: formattedDate }, () => {
                      if (this.state.activeSection === "invoices") {
                        this.loadAllHoaDon();
                      }
                    });
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="date-picker"
                />
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={this.handleResetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div className="owner-mid-content f">
            <div
              className="owner-mid-content-mid-list-img"
              style={{
                display: activeSection === "images" ? "block" : "none",
              }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Hiển thị</th>
                    <th>Hình ảnh Banner</th>
                    <th>Mã sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Hình ảnh sản phẩm</th>
                    <th>Thời gian tạo</th>
                    <th>Thời gian ẩn</th>
                    <th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {arrBanner && arrBanner.length > 0 ? (
                    arrBanner.map((item) => (
                      <tr
                        key={item.ID}
                        className="owner-mid-content-mid-list-img-item"
                        onClick={() => this.toggleEditBannerModal(item)} // Truyền item vào toggleEditBannerModal
                      >
                        <td>
                          {item.isActive ? (
                            <button
                              className="active"
                              onClick={() => this.toggleImageStatus(item.ID)}
                            >
                              <IonIcon icon={checkmarkOutline}></IonIcon>
                            </button>
                          ) : (
                            <button
                              className="unactive"
                              onClick={() => this.toggleImageStatus(item.ID)}
                            >
                              <IonIcon icon={closeOutline}></IonIcon>
                            </button>
                          )}
                        </td>
                        <td>
                          <img src={item.HinhAnh || bannertest} alt="Banner" />
                        </td>
                        <td>{item.MASANPHAM || "N/A"}</td>
                        <td>{item.TenSanPham || "N/A"}</td>
                        <td>
                          <img
                            src={item.HinhAnhSanPham || hinhtest}
                            alt="Sản phẩm"
                          />
                        </td>
                        <td>
                          {item.ThoiGianTao
                            ? new Date(item.ThoiGianTao).toLocaleString("vi-VN")
                            : "N/A"}
                        </td>
                        <td>
                          {item.ThoiGianAn
                            ? new Date(item.ThoiGianAn).toLocaleString("vi-VN")
                            : "N/A"}
                        </td>
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <button>
                            <IonIcon icon={closeCircleOutline}></IonIcon>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">Không tìm thấy banner nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pages f">
                <button
                  className="first"
                  onClick={() => this.handleImagePageChange(1)}
                  disabled={imagePage === 1}
                >
                  {"<<"}
                </button>
                <button
                  className="prev"
                  onClick={() => this.handleImagePageChange(imagePage - 1)}
                  disabled={imagePage === 1}
                >
                  {"<"}
                </button>
                <input
                  type="text"
                  value={imagePage}
                  onChange={(e) => this.handlePageInput(e, "images")}
                />
                <span className="total-pages">/ {totalImagePages}</span>
                <button
                  className="next"
                  onClick={() => this.handleImagePageChange(imagePage + 1)}
                  disabled={
                    imagePage === totalImagePages || totalImagePages === 0
                  }
                >
                  {">"}
                </button>
                <button
                  className="last"
                  onClick={() => this.handleImagePageChange(totalImagePages)}
                  disabled={
                    imagePage === totalImagePages || totalImagePages === 0
                  }
                >
                  {">>"}
                </button>
              </div>
            </div>
            <div
              className="owner-mid-content-right-list-invoice"
              style={{
                display: activeSection === "invoices" ? "block" : "none",
              }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Mã hóa đơn</th>
                    <th>Thời gian tạo</th>
                    <th>Tên khách hàng</th>
                    <th>SĐT khách hàng</th>
                    <th>SL</th>
                    <th>Tổng tiền</th>
                    <th>PaymentStatus</th>
                    <th>OrderStatus</th>
                  </tr>
                </thead>
                <tbody>
                  {arrHoaDon.length > 0 ? (
                    arrHoaDon.map((item, index) => (
                      <tr
                        key={item.MADONHANG}
                        className="owner-mid-content-right-list-invoice-item"
                        onClick={() => {
                          console.log(
                            "Opening invoice modal for MADONHANG:",
                            item.MADONHANG
                          ); // Thêm log giống toggleEditProductModal
                          this.toggleViewInvoiceModal(item);
                        }}
                      >
                        <td>{item.MADONHANG}</td>
                        <td>
                          {item.NgayLapDonHang
                            ? new Date(item.NgayLapDonHang).toLocaleString(
                              "vi-VN"
                            )
                            : "N/A"}
                        </td>
                        <td>{item.TenKhachHang || "N/A"}</td>
                        <td>{item.SDTNhanHang || "N/A"}</td>
                        <td>{item.quantity || 0}</td>
                        <td className="f">
                          <p>
                            {item.TongTien
                              ? parseFloat(item.TongTien).toLocaleString(
                                "vi-VN"
                              )
                              : 0}{" "}
                            vnđ
                          </p>
                        </td>
                        <td>{item.PaymentStatus || "N/A"}</td>
                        <td>{item.OrderStatus || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">Không tìm thấy hóa đơn nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pages f">
                <button
                  className="first"
                  onClick={() => this.handleInvoicePageChange(1)}
                  disabled={invoicePage === 1}
                >
                  {"<<"}
                </button>
                <button
                  className="prev"
                  onClick={() => this.handleInvoicePageChange(invoicePage - 1)}
                  disabled={invoicePage === 1}
                >
                  {"<"}
                </button>
                <input
                  type="text"
                  value={invoicePage}
                  onChange={(e) => this.handlePageInput(e, "invoices")}
                />
                <span className="total-pages">/ {totalInvoicePages}</span>
                <button
                  className="next"
                  onClick={() => this.handleInvoicePageChange(invoicePage + 1)}
                  disabled={
                    invoicePage === totalInvoicePages || totalInvoicePages === 0
                  }
                >
                  {">"}
                </button>
                <button
                  className="last"
                  onClick={() =>
                    this.handleInvoicePageChange(totalInvoicePages)
                  }
                  disabled={
                    invoicePage === totalInvoicePages || totalInvoicePages === 0
                  }
                >
                  {">>"}
                </button>
              </div>
            </div>
            <div className="owner-mid-content-left">
              <div
                className="owner-mid-content-left-search-product"
                style={{
                  display: activeSection === "products" ? "block" : "none",
                }}
              >
                <p>Tìm kiếm:</p>
                <input
                  type="text"
                  placeholder="Tìm kiếm tên sản phẩm..."
                  value={tempSearchQuery}
                  onChange={this.handleSearchChange}
                />
                <IonIcon icon={searchOutline}></IonIcon>
              </div>

              <div className="f">
                <div
                  style={{
                    display: activeSection === "products" ? "block" : "none",
                  }}
                  className="owner-mid-content-left-product-filter"
                >
                  <label>Lọc sản phẩm:</label>
                  <br />
                  <select
                    value={filters.selectedFilter}
                    onChange={(e) => this.handleFilterProduct(e.target.value)}
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="PROMOTION">Khuyến mãi</option>
                    {filterValue.map((item) => (
                      <option key={item.Code} value={item.Code}>
                        {item.Value}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: activeSection === "products" ? "block" : "none",
                  }}
                  className="owner-mid-content-left-product-sort"
                >
                  <label>Sắp xếp:</label>
                  <br />
                  <select
                    value={sortOrder}
                    onChange={(e) => this.handleSortProduct(e.target.value)}
                  >
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
              <div
                className="owner-mid-content-right-list-product"
                style={{
                  display: activeSection === "products" ? "block" : "none",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Mã sản phẩm</th>
                      <th>Tên sản phẩm</th>
                      <th>Hình ảnh</th>
                      <th>Danh mục</th>
                      <th>Giá</th>
                      <th>Kho</th>
                      <th>KM</th>
                      <th>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrSanPham.length > 0 ? (
                      arrSanPham.map((item) => {
                        const productTypeValue =
                          filterValue.find(
                            (filterItem) => filterItem.Code === item.ProductType
                          )?.Value || item.ProductType;
                        return (
                          <tr
                            key={item.MASANPHAM}
                            className="owner-mid-content-right-list-product-item"
                            onClick={() => this.toggleEditProductModal(item)}
                          >
                            <td>{item.MASANPHAM}</td>
                            <td>{item.TenSanPham}</td>
                            <td>
                              <img
                                src={item.HinhAnh || hinhtest}
                                alt={item.TenSanPham}
                              />
                            </td>
                            <td>{productTypeValue}</td>
                            <td className="f">
                              <p>
                                {parseFloat(item.GiaBan).toLocaleString(
                                  "vi-VN"
                                )}
                              </p>
                              <p>vnđ</p>
                            </td>
                            <td>{item.SoLuongTon || 0}</td>
                            <td>
                              {item.KhuyenMai ? `${item.KhuyenMai}%` : "0"}
                            </td>
                            <td
                              className="f"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  this.deleteSanPham(item.MASANPHAM)
                                }
                              >
                                <IonIcon icon={closeCircleOutline}></IonIcon>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8">Không tìm thấy sản phẩm nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="pages f">
                  <button
                    className="first"
                    onClick={() => this.handleProductPageChange(1)}
                    disabled={productPage === 1}
                  >
                    {"<<"}
                  </button>
                  <button
                    className="prev"
                    onClick={() =>
                      this.handleProductPageChange(productPage - 1)
                    }
                    disabled={productPage === 1}
                  >
                    {"<"}
                  </button>
                  <input
                    type="text"
                    value={productPage}
                    onChange={(e) => this.handlePageInput(e, "products")}
                  />
                  <span className="total-pages">/ {totalProductPages}</span>
                  <button
                    className="next"
                    onClick={() =>
                      this.handleProductPageChange(productPage + 1)
                    }
                    disabled={productPage === totalProductPages}
                  >
                    {">"}
                  </button>
                  <button
                    className="last"
                    onClick={() =>
                      this.handleProductPageChange(totalProductPages)
                    }
                    disabled={productPage === totalProductPages}
                  >
                    {">>"}
                  </button>
                </div>
              </div>
              {/* HÓA ĐƠN */}

              {/* BANNER */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = (dispatch) => ({
  userLogout: () => dispatch(userLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Owner);
