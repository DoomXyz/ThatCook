import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IonIcon } from "@ionic/react";
import { trashOutline, saveOutline } from "ionicons/icons";
import { toast } from "react-toastify";
import OwnerEditDetailModal from "./OwnerEditDetailModal";
import "./EditProductModal.scss";
import { handleGetProductDetailsByMASANPHAM, handleUpdateProduct } from "../../services/productServices";
import { handleGetAllCodesApi, uploadImageToCloudinaryApi, } from "../../services/utilitiesServices";

class EditProductModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowEditDetailModal: false,
      loadedProductInfo: null,
      loadedProductDetailInfo: null,
      selectedProductID: null,
      codePetType: [],
      codeProductType: [],
      productname: "",
      producttype: "",
      pettype: [],
      productprice: "",
      productimage: "",
      productdescription: "",

      masanpham: "",
      tenSanPham: "",
      productType: "",
      giaBan: "",
      khuyenMai: "",
      moTa: "",
      hinhAnh: [], // [{ id: number, url: string, public_id: string | null, file: File | null }]
      chiTietSanPham: [], // [{ tenCTSP: string, giaThem: string, soLuongTon: string, mactsp: number }]
      tempChiTiet: { tenCTSP: "", giaThem: "", soLuongTon: "" },
      productTypes: [], // Danh sách ProductType từ AllCodes
      errors: {},
      isUploading: false,
    };
  }

  async componentDidMount() {
    try {
      // Load danh mục sản phẩm
      const productTypes = await handleGetAllCodesApi("ProductType");
      this.setState({ productTypes });
    } catch (e) {
      toast.error("Không thể tải danh mục sản phẩm!");
    }
  }

  async componentDidUpdate(prevProps) {
    // Load dữ liệu sản phẩm khi modal mở hoặc product thay đổi
    if (
      this.props.isOpen &&
      (!prevProps.isOpen || prevProps.product?.MASANPHAM !== this.props.product?.MASANPHAM)
    ) {
      await this.loadProductDetails();
    }
  }

  componentWillUnmount() {
    // Thu hồi URL preview của ảnh
    this.state.hinhAnh.forEach((img) => {
      if (img.url && img.file) URL.revokeObjectURL(img.url);
    });
  }

  loadProductDetails = async () => {
    const { product } = this.props;
    if (!product?.MASANPHAM) return;

    try {
      const response = await handleGetProductDetailsByMASANPHAM(product.MASANPHAM);
      if (response.errCode === 0) {
        const { SanPham, ChiTietSanPham, ChiTietHinhAnh } = response.data;

        // Chuẩn bị dữ liệu hình ảnh
        const hinhAnh = [
          {
            id: Date.now(),
            url: SanPham.HinhAnh,
            public_id: null, // Không có public_id vì lấy từ DB
            file: null,
          },
          ...ChiTietHinhAnh.map((img, index) => ({
            id: Date.now() + index + 1,
            url: img.HinhAnh,
            public_id: null,
            file: null,
          })),
        ];

        // Chuẩn bị chi tiết sản phẩm
        const chiTietSanPham = ChiTietSanPham.map((item) => ({
          mactsp: item.MACTSP,
          tenCTSP: item.TenCTSP,
          giaThem: item.GiaThem ? String(item.GiaThem) : "",
          soLuongTon: String(item.SoLuongTon),
        }));

        this.setState({
          masanpham: SanPham.MASANPHAM,
          tenSanPham: SanPham.TenSanPham,
          productType: product.ProductType || this.state.productTypes[0]?.Code || "",
          giaBan: String(SanPham.GiaBan),
          khuyenMai: SanPham.KhuyenMai ? String(SanPham.KhuyenMai) : "",
          moTa: SanPham.MoTa || "",
          hinhAnh,
          chiTietSanPham,
          errors: {},
        });
      } else {
        toast.error("Không thể tải thông tin sản phẩm!");
      }
    } catch (e) {
      toast.error("Lỗi khi tải thông tin sản phẩm!");
    }
  };

  resetState = () => {
    this.setState({
      masanpham: "",
      tenSanPham: "",
      productType: this.state.productTypes[0]?.Code || "",
      giaBan: "",
      khuyenMai: "",
      moTa: "",
      hinhAnh: [],
      chiTietSanPham: [],
      tempChiTiet: { tenCTSP: "", giaThem: "", soLuongTon: "" },
      errors: {},
      isUploading: false,
    });
  };

  toggle = () => {
    this.resetState();
    this.props.toggleFromModal();
  };

  toggleEditDetailModal = () => {
    this.setState((prevState) => ({
      isShowEditDetailModal: !prevState.isShowEditDetailModal,
    }));
  };

  handleInputChange = (e, field) => {
    this.setState({
      [field]: e.target.value,
      errors: { ...this.state.errors, [field]: "" },
    });
  };

  handleSelectChange = (e) => {
    this.setState({
      productType: e.target.value,
      errors: { ...this.state.errors, productType: "" },
    });
  };

  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!");
      return;
    }
    const preview = URL.createObjectURL(file);
    this.setState((prevState) => ({
      hinhAnh: [...prevState.hinhAnh, { id: Date.now(), file, url: preview, public_id: null }],
      errors: { ...prevState.errors, hinhAnh: "" },
    }));
  };

  handleRemoveImage = (id) => {
    this.setState((prevState) => ({
      hinhAnh: prevState.hinhAnh.filter((img) => img.id !== id),
    }));
  };

  handleChiTietChange = (e, field) => {
    this.setState({
      tempChiTiet: { ...this.state.tempChiTiet, [field]: e.target.value },
      errors: { ...this.state.errors, [`tempChiTiet_${field}`]: "" },
    });
  };

  handleSaveChiTiet = () => {
    const { tempChiTiet } = this.state;
    let errors = {};

    if (!tempChiTiet.tenCTSP) {
      errors.tempChiTiet_tenCTSP = "Tên chi tiết không được để trống!";
    } else {
      const regex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;
      if (!regex.test(tempChiTiet.tenCTSP.trim())) {
        errors.tempChiTiet_tenCTSP = "Tên chi tiết không hợp lệ!";
      }
    }

    if (tempChiTiet.soLuongTon === "" || tempChiTiet.soLuongTon === undefined) {
      errors.tempChiTiet_soLuongTon = "Số lượng tồn không được để trống!";
    } else if (isNaN(tempChiTiet.soLuongTon) || parseInt(tempChiTiet.soLuongTon) < 0) {
      errors.tempChiTiet_soLuongTon = "Số lượng tồn phải lớn hơn hoặc bằng 0!";
    }

    if (
      tempChiTiet.giaThem &&
      (isNaN(tempChiTiet.giaThem) || parseFloat(tempChiTiet.giaThem) < 0)
    ) {
      errors.tempChiTiet_giaThem = "Giá thêm phải lớn hơn hoặc bằng 0!";
    }

    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    const newChiTiet = {
      mactsp: Date.now(), // Tạo ID tạm thời cho chi tiết mới
      tenCTSP: tempChiTiet.tenCTSP.trim(),
      giaThem: tempChiTiet.giaThem ? tempChiTiet.giaThem : "",
      soLuongTon: tempChiTiet.soLuongTon,
    };

    this.setState((prevState) => ({
      chiTietSanPham: [...prevState.chiTietSanPham, newChiTiet],
      tempChiTiet: { tenCTSP: "", giaThem: "", soLuongTon: "" },
      errors: { ...prevState.errors, chiTietSanPham: "" },
    }));
  };

  updateChiTietSanPham = (newChiTietSanPham) => {
    this.setState({ chiTietSanPham: newChiTietSanPham });
  };

  checkValidateInput = () => {
    let errors = {};
    const { tenSanPham, productType, giaBan, khuyenMai, hinhAnh, chiTietSanPham } = this.state;

    if (!tenSanPham) {
      errors.tenSanPham = "Tên sản phẩm không được để trống!";
    } else {
      const regex = /^[A-Za-zÀ-ỹ0-9\s]{2,100}$/;
      if (!regex.test(tenSanPham.trim())) {
        errors.tenSanPham = "Tên sản phẩm không hợp lệ!";
      }
    }

    if (!productType) {
      errors.productType = "Vui lòng chọn danh mục!";
    }

    if (!giaBan) {
      errors.giaBan = "Giá bán không được để trống!";
    } else if (isNaN(giaBan) || parseFloat(giaBan) <= 0) {
      errors.giaBan = "Giá bán phải lớn hơn 0!";
    }

    if (
      khuyenMai &&
      (isNaN(khuyenMai) || parseFloat(khuyenMai) < 0 || parseFloat(khuyenMai) > 100)
    ) {
      errors.khuyenMai = "Khuyến mãi phải từ 0 đến 100%!";
    }

    if (hinhAnh.length === 0) {
      errors.hinhAnh = "Vui lòng thêm ít nhất 1 hình ảnh!";
    } else if (hinhAnh.length > 5) {
      errors.hinhAnh = "Tối đa 5 hình ảnh!";
    }

    if (chiTietSanPham.length === 0) {
      errors.chiTietSanPham = "Vui lòng thêm ít nhất 1 chi tiết sản phẩm!";
    } else {
      chiTietSanPham.forEach((item, index) => {
        if (!item.tenCTSP) {
          errors[`chiTietSanPham_${index}_tenCTSP`] = "Tên chi tiết không được để trống!";
        } else {
          const regex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;
          if (!regex.test(item.tenCTSP.trim())) {
            errors[`chiTietSanPham_${index}_tenCTSP`] = "Tên chi tiết không hợp lệ!";
          }
        }
        if (item.soLuongTon === "" || item.soLuongTon === undefined) {
          errors[`chiTietSanPham_${index}_soLuongTon`] = "Số lượng tồn không được để trống!";
        } else if (isNaN(item.soLuongTon) || parseInt(item.soLuongTon) < 0) {
          errors[`chiTietSanPham_${index}_soLuongTon`] = "Số lượng tồn phải lớn hơn hoặc bằng 0!";
        }
        if (
          item.giaThem &&
          (isNaN(item.giaThem) || parseFloat(item.giaThem) < 0)
        ) {
          errors[`chiTietSanPham_${index}_giaThem`] = "Giá thêm phải lớn hơn hoặc bằng 0!";
        }
      });
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleSaveProduct = async () => {
    if (!this.checkValidateInput()) {
      Object.values(this.state.errors).forEach((error) => {
        if (error) toast.error(error);
      });
      return;
    }

    const confirmSave = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Bạn có chắc muốn lưu sản phẩm này không?</p>
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
          { autoClose: 3000, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmSave();
    if (!isConfirmed) return;

    if (this.state.isUploading) {
      toast.info("Đang tải ảnh, vui lòng chờ!");
      return;
    }

    this.setState({ isUploading: true });
    try {
      const { hinhAnh, chiTietSanPham, masanpham, tenSanPham, productType, giaBan, khuyenMai, moTa } =
        this.state;

      // Upload ảnh mới (nếu có)
      const uploadedImages = [];
      const failedImages = [];
      for (let img of hinhAnh) {
        if (img.file) {
          try {
            const response = await uploadImageToCloudinaryApi(img.file);
            if (response.errCode === 0) {
              uploadedImages.push({
                public_id: response.data.public_id,
                secure_url: response.data.secure_url,
                original_filename: response.data.original_filename,
                format: response.data.format,
                created_at: response.data.created_at,
              });
            } else {
              failedImages.push(img.file.name);
            }
          } catch (e) {
            failedImages.push(img.file.name);
          }
        } else {
          uploadedImages.push({
            secure_url: img.url,
            public_id: img.public_id || null,
          });
        }
      }

      if (failedImages.length > 0) {
        toast.error(`Không thể tải lên các ảnh: ${failedImages.join(", ")}`);
      }

      if (uploadedImages.length === 0) {
        toast.error("Không có ảnh nào được tải lên thành công!");
        return;
      }

      const productInfo = {
        masanpham,
        tensanpham: tenSanPham,
        producttype: productType,
        giaban: parseFloat(giaBan),
        khuyenmai: khuyenMai ? parseFloat(khuyenMai) : null,
        mota: moTa || null,
        hinhanh: uploadedImages[0],
        chitiethinhanh: uploadedImages.slice(1),
        chitietsanpham: chiTietSanPham.map((item) => ({
          mactsp: item.mactsp,
          tenctsp: item.tenCTSP,
          giathem: item.giaThem ? parseFloat(item.giaThem) : null,
          soluongton: parseInt(item.soLuongTon),
        })),
      };

      // Gọi hàm handleSaveProduct từ props
      await this.props.handleSaveProduct(productInfo);

      // Reset state và đóng modal
      this.resetState();
    } catch (e) {
      toast.error("Lỗi khi chuẩn bị dữ liệu!");
    } finally {
      this.setState({ isUploading: false });
    }
  };

  render() {
    const {
      isShowEditDetailModal,
      tenSanPham,
      productType,
      giaBan,
      khuyenMai,
      moTa,
      hinhAnh,
      tempChiTiet,
      chiTietSanPham,
      productTypes,
      errors,
    } = this.state;

    return (
      <>
        <Modal
          show={this.props.isOpen}
          onHide={this.toggle}
          centered
          backdrop="static"
          className="create-product-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa sản phẩm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-content">
              <div className="modal-content-add-img">
                <p>Thêm hình ảnh:</p>
                <div className="f">
                  {hinhAnh.map((img) => (
                    <div key={img.id} className="modal-content-add-img-item f">
                      <img src={img.url} alt="Sản phẩm" />
                      <button
                        className="delete-img"
                        onClick={() => this.handleRemoveImage(img.id)}
                      >
                        <IonIcon icon={trashOutline}></IonIcon>
                      </button>
                    </div>
                  ))}
                  {hinhAnh.length < 5 && (
                    <div className="add-img">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={this.handleAddImage}
                        style={{ display: "none" }}
                        id="upload-image"
                      />
                      <label htmlFor="upload-image" className="add-img-label">
                        +
                      </label>
                    </div>
                  )}
                </div>
                <span className="error">{errors.hinhAnh}</span>
              </div>
              <div className="modal-content-add-name">
                <p>Tên sản phẩm:</p>
                <input
                  type="text"
                  placeholder="Hãy nhập tên sản phẩm"
                  value={tenSanPham}
                  onChange={(e) => this.handleInputChange(e, "tenSanPham")}
                />
                <span className="error">{errors.tenSanPham}</span>
              </div>
              <div className="f">
                <div className="modal-content-add-category">
                  <p>Danh mục:</p>
                  <select value={productType} onChange={this.handleSelectChange}>
                    {productTypes.map((type) => (
                      <option key={type.Code} value={type.Code}>
                        {type.Value}
                      </option>
                    ))}
                  </select>
                  <span className="error">{errors.productType}</span>
                </div>
                <div className="modal-content-add-main-price">
                  <p>Giá bán:</p>
                  <div className="f">
                    <input
                      type="number"
                      placeholder="Nhập giá"
                      value={giaBan}
                      onChange={(e) => this.handleInputChange(e, "giaBan")}
                    />
                    <p>vnđ</p>
                  </div>
                  <span className="error">{errors.giaBan}</span>
                </div>
                <div className="modal-content-add-sale">
                  <p>Khuyến mãi:</p>
                  <div className="f">
                    <input
                      type="number"
                      placeholder="Nhập khuyến mãi"
                      value={khuyenMai}
                      onChange={(e) => this.handleInputChange(e, "khuyenMai")}
                    />
                    <p>%</p>
                  </div>
                  <span className="error">{errors.khuyenMai}</span>
                </div>
              </div>
              <div className="modal-content-add-type-price">
                <p>Chi tiết sản phẩm (tối thiểu 1):</p>
                <div className="modal-content-add-type-price-stock-item">
                  <input
                    type="text"
                    placeholder="Hãy nhập loại"
                    value={tempChiTiet.tenCTSP}
                    onChange={(e) => this.handleChiTietChange(e, "tenCTSP")}
                  />
                  <input
                    type="number"
                    placeholder="Hãy nhập giá thêm"
                    value={tempChiTiet.giaThem}
                    onChange={(e) => this.handleChiTietChange(e, "giaThem")}
                  />
                  <input
                    type="number"
                    placeholder="Hãy nhập slt"
                    value={tempChiTiet.soLuongTon}
                    onChange={(e) => this.handleChiTietChange(e, "soLuongTon")}
                  />
                  <button onClick={this.handleSaveChiTiet}>
                    <IonIcon icon={saveOutline}></IonIcon>
                  </button>
                </div>
                {chiTietSanPham.length > 0 ? (
                  <b className="add-detail">{chiTietSanPham.length} chi tiết đã được thêm</b>
                ) : (
                  <b className="add-detail">Hiện chưa có chi tiết</b>
                )}
                <span className="error">{errors.chiTietSanPham}</span>
              </div>
              <div className="modal-content-add-info">
                <p>Thêm thông tin sản phẩm:</p>
                <textarea
                  placeholder="Hãy nhập thông tin sản phẩm"
                  value={moTa}
                  onChange={(e) => this.handleInputChange(e, "moTa")}
                />
                <span className="error">{errors.moTa}</span>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.toggleEditDetailModal}>
              Xem chi tiết sản phẩm
            </Button>
            <Button variant="primary" onClick={this.handleSaveProduct}>
              Lưu
            </Button>
          </Modal.Footer>
        </Modal>

        <OwnerEditDetailModal
          key={`${isShowEditDetailModal}-${JSON.stringify(chiTietSanPham)}`}
          isOpen={isShowEditDetailModal}
          toggleFromModal={this.toggleEditDetailModal}
          chiTietSanPham={chiTietSanPham}
          updateChiTietSanPham={this.updateChiTietSanPham}
        />
      </>
    );
  }
}

export default EditProductModal;