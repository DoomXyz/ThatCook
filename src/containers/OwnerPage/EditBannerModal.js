import React, { Component } from "react";
import { toast } from "react-toastify";
import { IonIcon } from "@ionic/react";

import { trashOutline } from "ionicons/icons";

import "./EditBannerModal.scss";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { handleLoadFilteredProductInfoApi } from "../../services/productServices";
import { handleGetBannerInfoApi } from "../../services/bannerServices"
import { handleGetAllCodesApi, uploadImageToCloudinaryApi } from "../../services/utilitiesServices";

class EditBannerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedBannerInfo: null,
      selectedBannerID: null,
      codeBannerStatus: [],
      codeProductType: [],
      codePetType: [],
      bannerimage: "",
      createdat: "",
      hiddenat: "",
      bannerstatus: "",
      productid: "",
      productname: "",
      producttype: "ALL",
      pettype: [],
      isUploading: false,
      imageFile: null,
      imagePreview: null,
      searchValue: "",
    };
    this.debounceTimeout = null;
  }

  async componentDidMount() {
    // await Promise.all([
    //   this.handleLoadCodeProductType(),
    //   this.handleLoadCodePetType(),
    //   this.handleLoadCodeBannerStatus(),
    // ]);
    const { selectedBannerID } = this.props;
    // if (selectedBannerID) {
    //   await this.handleLoadBannerInfo(selectedBannerID);
    // }
    setTimeout(() => {
      console.log(selectedBannerID)
    }, 10)
  }

  async componentDidUpdate(prevProps) {
    const { selectedBannerID, isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      this.resetState();
      // if (selectedBannerID) {
      //   await this.handleLoadBannerInfo(selectedBannerID);
      // }
      console.log("reset: ", selectedBannerID)
    }
  }

  componentWillUnmount() {
    if (this.state.imagePreview && this.state.imageFile) {
      URL.revokeObjectURL(this.state.imagePreview);
    }
  }

  resetState = () => {
    this.setState({
      loadedBannerInfo: null,
      selectedBannerID: null,
      bannerimage: "",
      createdat: "",
      hiddenat: "",
      bannerstatus: this.state.codeBannerStatus.length > 0 ? this.state.codeBannerStatus[0].Code : "",
      productid: "",
      productname: "",
      producttype: "ALL",
      pettype: [],
      isUploading: false,
      imageFile: null,
      imagePreview: null,
      searchValue: "",
    });
  };

  handleLoadCodeProductType = async () => {
    try {
      const codeProductType = await handleGetAllCodesApi("ProductType");
      if (!codeProductType || codeProductType.length === 0) {
        toast.error("Không thể tải danh sách loại sản phẩm!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeProductType,
        producttype: "ALL",
      });
    } catch (e) {
      console.error("Error loading product type code:", e);
      toast.error("Lỗi khi tải danh sách loại sản phẩm!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

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
      this.setState({ codePetType });
    } catch (e) {
      console.error("Error loading pet type code:", e);
      toast.error("Lỗi khi tải danh sách loại thú cưng!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadCodeBannerStatus = async () => {
    try {
      const codeBannerStatus = await handleGetAllCodesApi("BannerStatus");
      if (!codeBannerStatus || codeBannerStatus.length === 0) {
        toast.error("Không thể tải danh sách trạng thái banner!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeBannerStatus,
        bannerstatus: codeBannerStatus.length > 0 ? codeBannerStatus[0].Code : "",
      });
    } catch (e) {
      console.error("Error loading banner status code:", e);
      toast.error("Lỗi khi tải danh sách trạng thái banner!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadBannerInfo = async (bannerid) => {
    try {
      const response = await handleGetBannerInfoApi(bannerid);
      if (response && response.errCode === 0) {
        const banner = response.data;
        this.setState({
          loadedBannerInfo: banner,
          selectedBannerID: banner.BannerID,
          bannerimage: banner.BannerImage,
          createdat: banner.CreatedAt ? new Date(banner.CreatedAt).toISOString().split("T")[0] : "",
          hiddenat: banner.HiddenAt ? new Date(banner.HiddenAt).toISOString().split("T")[0] : "",
          bannerstatus: banner.BannerStatus,
          productid: banner.ProductID,
          productname: banner.ProductName || "",
          producttype: banner.ProductType || "ALL",
          pettype: banner.PetTypes || [],
          imagePreview: banner.BannerImage,
        }, () => this.handleLoadFilteredProductInfo());
      } else {
        this.resetState();
        toast.error("Tải thông tin banner thất bại!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error("Error loading banner info:", e);
      this.resetState();
      toast.error("Lỗi khi tải thông tin banner!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadFilteredProductInfo = async (searchQuery = "") => {
    try {
      const { producttype, pettype } = this.state;
      const response = await handleLoadFilteredProductInfoApi(
        producttype,
        pettype.length > 0 ? pettype : ["ALL"],
        searchQuery
      );
      if (response && response.errCode === 0) {
        this.setState({ loadedProductInfo: response.data });
      } else {
        toast.error("Tải danh sách sản phẩm thất bại!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error("Error loading products:", e);
      toast.error("Lỗi khi tải danh sách sản phẩm!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleInputChange = (e, field) => {
    this.setState({ [field]: e.target.value });
  };

  handleSelectChange = (e, field) => {
    this.setState({ [field]: e.target.value }, () => {
      if (field === "producttype" || field === "pettype") {
        this.handleLoadFilteredProductInfo(this.state.searchValue);
      }
    });
  };

  handlePetTypeChange = (e) => {
    const petType = e.target.value;
    const isChecked = e.target.checked;
    this.setState((prevState) => {
      const updatedPetTypes = isChecked
        ? [...prevState.pettype, petType]
        : prevState.pettype.filter((type) => type !== petType);
      return { pettype: updatedPetTypes };
    }, () => this.handleLoadFilteredProductInfo(this.state.searchValue));
  };

  handleSearchChange = (e) => {
    const value = e.target.value;
    this.setState({ searchValue: value }, () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        this.handleLoadFilteredProductInfo(this.state.searchValue);
      }, 500);
    });
  };

  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    const preview = URL.createObjectURL(file);
    this.setState({
      imageFile: file,
      imagePreview: preview,
      bannerimage: null,
    });
  };

  handleRemoveImage = () => {
    this.setState({
      imageFile: null,
      imagePreview: null,
      bannerimage: null,
    });
  };

  checkValidateInput = () => {
    const { bannerimage, imageFile, createdat, bannerstatus, productid } = this.state;
    if (!bannerimage && !imageFile) {
      return { errCode: -1, errMessage: "Vui lòng thêm hình ảnh banner!" };
    }
    if (!createdat) {
      return { errCode: -1, errMessage: "Ngày tạo không được để trống!" };
    }
    if (!bannerstatus) {
      return { errCode: -1, errMessage: "Trạng thái banner không được để trống!" };
    }
    if (!productid) {
      return { errCode: -1, errMessage: "Vui lòng chọn sản phẩm!" };
    }
    return { errCode: 0, errMessage: "Kiểm tra thành công!" };
  };

  handleSaveBanner = async () => {
    const validation = this.checkValidateInput();
    if (validation.errCode !== 0) {
      toast.error(validation.errMessage, {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }

    const confirmSave = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận lưu thông tin banner?</p>
            <button className="toast-confirm-btn" onClick={() => { resolve(true); toast.dismiss(); }}>
              Có
            </button>
            <button className="toast-cancel-btn" onClick={() => { resolve(false); toast.dismiss(); }}>
              Không
            </button>
          </div>,
          { position: "top-center", autoClose: 1000, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmSave();
    if (!isConfirmed) return;

    if (this.state.isUploading) {
      toast.info("Đang tải ảnh, vui lòng chờ!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }

    this.setState({ isUploading: true });
    try {
      let bannerImage = this.state.bannerimage;
      if (this.state.imageFile) {
        const response = await uploadImageToCloudinaryApi(this.state.imageFile);
        if (response.errCode === 0) {
          bannerImage = response.data.secure_url;
        } else {
          toast.error("Tải ảnh banner thất bại!", {
            position: "top-right",
            autoClose: 500,
            closeOnClick: true,
          });
          return;
        }
      }

      const bannerInfo = {
        BannerID: this.state.selectedBannerID,
        BannerImage: bannerImage,
        CreatedAt: this.state.createdat,
        HiddenAt: this.state.hiddenat || null,
        BannerStatus: this.state.bannerstatus,
        ProductID: this.state.productid,
      };

      const response = this.state.selectedBannerID
        ? await this.props.handleEditBannerFromModal(bannerInfo)
        : await this.props.handleCreateBannerFromModal(bannerInfo);

      if (response && response.errCode === 0) {
        toast.success(this.state.selectedBannerID ? "Cập nhật banner thành công!" : "Tạo banner thành công!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
        this.toggle();
      } else {
        toast.error(response?.errMessage || "Lỗi khi lưu banner!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error("Error saving banner:", e);
      toast.error("Lỗi khi lưu banner!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    } finally {
      this.setState({ isUploading: false });
    }
  };


  toggle = () => {
    this.props.toggleFromModal();
  };

  render() {
    const {
      isOpen,
      selectedBannerID,
      codeBannerStatus,
      codeProductType,
      codePetType,
      loadedProductInfo,
      bannerimage,
      createdat,
      hiddenat,
      bannerstatus,
      productid,
      productname,
      producttype,
      pettype,
      isUploading,
      imageFile,
      imagePreview,
      searchValue,
    } = this.state;

    return (
      <Modal
        show={isOpen}
        onHide={this.toggle}
        centered
        backdrop="static"
        className="edit-banner-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedBannerID ? "Chỉnh sửa Banner" : "Tạo Banner Mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-content">
            <div className="modal-content-edit-img">
              <p>Hình ảnh banner:</p>
              <div className="f">
                {imagePreview && (
                  <div className="modal-content-edit-img-item f">
                    <img src={imagePreview} alt="Banner" />
                    <button className="delete-img" onClick={this.handleRemoveImage}>
                      <IonIcon icon={trashOutline}></IonIcon>
                    </button>
                  </div>
                )}
                {!imagePreview && (
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
            </div>
            <div className="modal-content-edit-date">
              <p>Ngày tạo:</p>
              <input
                type="date"
                value={createdat}
                onChange={(e) => this.handleInputChange(e, "createdat")}
              />
            </div>
            <div className="modal-content-edit-date">
              <p>Ngày ẩn:</p>
              <input
                type="date"
                value={hiddenat}
                onChange={(e) => this.handleInputChange(e, "hiddenat")}
              />
            </div>
            <div className="modal-content-edit-status">
              <p>Trạng thái:</p>
              <select
                value={bannerstatus}
                onChange={(e) => this.handleSelectChange(e, "bannerstatus")}
              >
                {codeBannerStatus.map((status) => (
                  <option key={status.Code} value={status.Code}>
                    {status.CodeValueVI}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-content-edit-filter">
              <p>Lọc sản phẩm:</p>
              <div className="f">
                <select
                  value={producttype}
                  onChange={(e) => this.handleSelectChange(e, "producttype")}
                >
                  <option value="ALL">Tất cả loại sản phẩm</option>
                  {codeProductType.map((type) => (
                    <option key={type.Code} value={type.Code}>
                      {type.CodeValueVI}
                    </option>
                  ))}
                </select>
                <div className="pettype-checkboxes">
                  {codePetType.map((type) => (
                    <label key={type.Code} className="pettype-checkbox">
                      <input
                        type="checkbox"
                        value={type.Code}
                        checked={pettype.includes(type.Code)}
                        onChange={this.handlePetTypeChange}
                      />
                      {type.CodeValueVI}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-content-edit-source">
              <p>Sản phẩm:</p>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm"
                value={searchValue}
                onChange={this.handleSearchChange}
                className="search-product-input"
              />
              <select
                value={productid}
                onChange={(e) => this.handleSelectChange(e, "productid")}
              >
                <option value="">Chọn sản phẩm</option>
                {loadedProductInfo && loadedProductInfo.length > 0 ? (
                  loadedProductInfo.map((product) => (
                    <option key={product.ProductID} value={product.ProductID}>
                      {product.ProductName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có sản phẩm</option>
                )}
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleSaveBanner}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditBannerModal;