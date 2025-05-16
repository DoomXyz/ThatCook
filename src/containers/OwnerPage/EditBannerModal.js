import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import { trashOutline } from 'ionicons/icons';

import './EditBannerModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { handleLoadFilteredProductInfoApi } from '../../services/productServices';
import { handleGetBannerInfoApi } from '../../services/bannerServices';
import { handleGetAllCodesApi, uploadImageToCloudinaryApi } from '../../services/utilitiesServices';

import bannertest from '../../assets/bannerimgs/1.webp';

class EditBannerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedBannerInfo: null,
      selectedBannerID: null,
      codeBannerStatus: [],
      codeProductType: [],
      codePetType: [],
      bannerimage: '',
      hiddenat: null,
      bannerstatus: '',
      productid: '',
      productname: '',
      producttype: 'ALL',
      pettype: [],
      isUploading: false,
      imageFile: null,
      imagePreview: null,
      loadedProductInfo: [],
    };
    this.debounceTimeout = null;
  }

  async componentDidMount() {
    await Promise.all([this.handleLoadCodeProductType(), this.handleLoadCodePetType(), this.handleLoadCodeBannerStatus()]);
    const { selectedBannerID } = this.props;
    if (selectedBannerID) {
      await this.handleLoadBannerInfo(selectedBannerID);
    }
  }

  async componentDidUpdate(prevProps) {
    const { selectedBannerID, isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      this.resetState();
      if (selectedBannerID) {
        await this.handleLoadBannerInfo(selectedBannerID);
      }
    }
  }

  componentWillUnmount() {
    if (this.state.imagePreview) {
      URL.revokeObjectURL(this.state.imagePreview);
    }
  }

  resetState = () => {
    this.setState({
      loadedBannerInfo: null,
      selectedBannerID: null,
      bannerimage: '',
      hiddenat: null,
      bannerstatus: '',
      productid: '',
      productname: '',
      producttype: 'ALL',
      pettype: [],
      isUploading: false,
      imageFile: null,
      imagePreview: null,
      loadedProductInfo: [],
    });
  };

  handleLoadCodeProductType = async () => {
    try {
      const codeProductType = await handleGetAllCodesApi('ProductType');
      if (!codeProductType || codeProductType.length === 0) {
        toast.error('Không thể tải danh sách loại sản phẩm!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeProductType,
        producttype: 'ALL',
      });
    } catch (e) {
      console.error('Error loading product type code:', e);
      toast.error('Lỗi khi tải danh sách loại sản phẩm!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadCodePetType = async () => {
    try {
      const codePetType = await handleGetAllCodesApi('PetType');
      if (!codePetType || codePetType.length === 0) {
        toast.error('Không thể tải danh sách loại thú cưng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codePetType });
    } catch (e) {
      console.error('Error loading pet type code:', e);
      toast.error('Lỗi khi tải danh sách loại thú cưng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadCodeBannerStatus = async () => {
    try {
      const codeBannerStatus = await handleGetAllCodesApi('BannerStatus');
      if (!codeBannerStatus || codeBannerStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái banner!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeBannerStatus,
        bannerstatus: codeBannerStatus.length > 0 ? codeBannerStatus[0].Code : '',
      });
    } catch (e) {
      console.error('Error loading banner status code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái banner!', {
        position: 'top-right',
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
          hiddenat: banner.HiddenAt ? new Date(banner.HiddenAt) : null,
          bannerstatus: banner.BannerStatus,
          productid: banner.ProductID,
          productname: banner.ProductName || '',
          producttype: banner.ProductType || 'ALL',
          pettype: banner.PetTypes || [],
          imagePreview: banner.BannerImage,
        });
      } else {
        this.resetState();
        toast.error('Tải thông tin banner thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error loading banner info:', e);
      this.resetState();
      toast.error('Lỗi khi tải thông tin banner!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadFilteredProductInfo = async () => {
    try {
      const { producttype, pettype, searchValue } = this.state;
      const response = await handleLoadFilteredProductInfoApi(producttype, JSON.stringify(pettype), searchValue);
      if (response && response.errCode === 0) {
        this.setState({ loadedProductInfo: response.data });
      } else {
        toast.error('Tải danh sách sản phẩm thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error loading products:', e);
      toast.error('Lỗi khi tải danh sách sản phẩm!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleSelectChange = (e, field) => {
    this.setState({ [field]: e.target.value }, () => {
      if (field === 'producttype') {
        this.handleLoadFilteredProductInfo(this.state.searchValue);
      }
    });
  };

  handlePetTypeChange = (e) => {
    const petType = e.target.value;
    const isChecked = e.target.checked;
    this.setState(
      (prevState) => {
        const updatedPetTypes = isChecked ? [...prevState.pettype, petType] : prevState.pettype.filter((type) => type !== petType);
        return { pettype: updatedPetTypes };
      },
      () => this.handleLoadFilteredProductInfo(this.state.searchValue)
    );
  };

  handleProductChange = (selectedOption) => {
    this.setState({
      productid: selectedOption ? selectedOption.value : '',
      productname: selectedOption ? selectedOption.label : '',
    });
  };

  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!', {
        position: 'top-right',
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
      return { errCode: -1, errMessage: 'Vui lòng thêm hình ảnh banner!' };
    }
    if (!bannerstatus) {
      return { errCode: -1, errMessage: 'Trạng thái banner không được để trống!' };
    }
    if (!productid) {
      return { errCode: -1, errMessage: 'Vui lòng chọn sản phẩm!' };
    }
    return { errCode: 0, errMessage: 'Kiểm tra thành công!' };
  };

  handleSaveBanner = async () => {
    const validation = this.checkValidateInput();
    if (validation.errCode !== 0) {
      toast.error(validation.errMessage, {
        position: 'top-right',
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
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmSave();
    if (!isConfirmed) return;

    if (this.state.isUploading) {
      toast.info('Đang tải ảnh, vui lòng chờ!', {
        position: 'top-right',
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
          toast.error('Tải ảnh banner thất bại!', {
            position: 'top-right',
            autoClose: 500,
            closeOnClick: true,
          });
          return;
        }
      }

      const bannerInfo = {
        BannerID: this.state.selectedBannerID,
        BannerImage: bannerImage,
        HiddenAt: this.state.hiddenat ? this.state.hiddenat.toISOString().split('T')[0] : null,
        BannerStatus: this.state.bannerstatus,
        ProductID: this.state.productid,
      };

      await this.props.handleChangeBannerFromModal(bannerInfo);
    } catch (e) {
      console.error('Lỗi khi lưu banner:', e);
      toast.error('Lỗi khi lưu banner!', {
        position: 'top-right',
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
    const { isOpen, codeBannerStatus, codePetType, codeProductType, imagePreview, createdat, hiddenat, bannerstatus, producttype, pettype, searchValue, loadedProductInfo, productid, productname } = this.state;
    const productOptions = loadedProductInfo.map((product) => ({
      value: product.ProductID,
      label: product.ProductName,
    }));
    return (
      <Modal show={this.props.isOpen} onHide={this.toggle} centered backdrop="static" className="edit-banner-modal">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-content">
            <div className="modal-content-edit-img">
              <p>Hình ảnh banner (tối đa 1):</p>
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
                    <input type="file" accept="image/*" onChange={this.handleAddImage} style={{ display: 'none' }} id="upload-image" />
                    <label htmlFor="upload-image" className="add-img-label">
                      <p>+</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-content-add-product">
              <div className="f">
                <div className="modal-content-add-category f">
                  <p>Loại sản phẩm:</p>
                  <select value={producttype} onChange={(e) => this.handleSelectChange(e, 'producttype')}>
                    <option value="ALL">Tất cả</option>
                    {codeProductType.map((type) => (
                      <option key={type.Code} value={type.Code}>
                        {type.CodeValueVI}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-content-add-pettype f">
                  <p>Loại thú cưng:</p>
                  <div className="pettype-checkboxes f">
                    {codePetType.map((type) => (
                      <label key={type.Code} className="pettype-checkbox f">
                        <input type="checkbox" className="custom-checkbox" value={type.Code} checked={pettype.includes(type.Code)} onChange={this.handlePetTypeChange} />
                        <p>{type.CodeValueVI}</p>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-content-add-product-select">
                <p>Sản phẩm:</p>
                <Select className="product-select" options={productOptions} value={productid ? { value: productid, label: productname } : null} onChange={this.handleProductChange} placeholder="Chọn sản phẩm" isClearable />
              </div>
            </div>
            <div className="modal-content-add-dates">
              <p>Ngày ẩn (tùy chọn):</p>
              <DatePicker
                selected={hiddenat}
                onChange={(date) => {
                  const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                  this.setState({ hiddenat: formattedDate });
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="date-picker"
                isClearable
              />
            </div>
            <div className="modal-content-add-status">
              <p>Trạng thái banner:</p>
              <select value={bannerstatus} onChange={(e) => this.handleSelectChange(e, 'bannerstatus')}>
                {codeBannerStatus.map((status) => (
                  <option key={status.Code} value={status.Code}>
                    {status.CodeValueVI}
                  </option>
                ))}
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
