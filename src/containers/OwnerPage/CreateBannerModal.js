import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import { closeOutline } from 'ionicons/icons';

import './CreateBannerModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { handleLoadFilteredProductInfoApi } from '../../services/productServices';

import { getAllCodes, uploadImages, validateBannerInput } from '../../utils/pakage';

class CreateBannerModal extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      codeProductType: [],
      codePetType: [],
      codeBannerStatus: [],
      imageInfo: null,
      HiddenAt: null,
      BannerStatus: '',
      ProductID: '',
      ProductName: '',
      ProductType: 'ALL',
      PetType: [],
      isUploading: false,
      loadedProductInfo: [],
      disabledButtons: {
        createBanner: false,
      },
    };
    this.debounceTimeout = null;
  }
  async componentDidMount() {
    await this.handleLoadCode(['ProductType', 'PetType', 'BannerStatus']);
  }
  async componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.resetState();
      await this.handleLoadFilteredProductInfo();
    }
  }
  componentWillUnmount() {
    if (this.state.imageInfo?.Image) {
      URL.revokeObjectURL(this.state.imageInfo.Image);
    }
  }
  handleLoadCode = async (codeTypes) => {
    try {
      const responses = await Promise.all(codeTypes.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      const hasDefault = ['BannerStatus'];
      codeTypes.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        if (hasDefault.includes(type)) {
          newState[type] = response.data.length > 0 ? response.data[0].Code : '';
        }
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  resetState = () => {
    const { codeBannerStatus } = this.state
    this.setState({
      imageInfo: null,
      HiddenAt: null,
      BannerStatus: codeBannerStatus.length > 0 ? codeBannerStatus[0].Code : '',
      ProductID: '',
      ProductName: '',
      ProductType: 'ALL',
      PetType: [],
      isUploading: false,
      loadedProductInfo: [],
    });
  };
  toggle = () => {
    this.resetState();
    this.props.toggleFromModal();
  };
  handleLoadFilteredProductInfo = async () => {
    try {
      const { ProductType, PetType } = this.state;
      const response = await handleLoadFilteredProductInfoApi(ProductType, JSON.stringify(PetType), '');
      if (response && response.errCode === 0) {
        this.setState({ loadedProductInfo: response.data });
      } else {
        toast.error('Tải danh sách sản phẩm thất bại!');
      }
    } catch (e) {
      console.error('Error loading products:', e);
      toast.error('Lỗi khi tải danh sách sản phẩm!');
    }
  };
  handleSelectChange = (e, field) => {
    this.setState({ [field]: e.target.value }, () => {
      if (field === 'ProductType') {
        this.handleLoadFilteredProductInfo();
      }
    });
  };
  handlePetTypeChange = (e) => {
    const petType = e.target.value;
    const isChecked = e.target.checked;
    this.setState(
      (prevState) => {
        const updatedPetTypes = isChecked ? [...prevState.PetType, petType] : prevState.PetType.filter((type) => type !== petType);
        return { PetType: updatedPetTypes };
      },
      () => this.handleLoadFilteredProductInfo()
    );
  };
  handleProductChange = (selectedOption) => {
    this.setState({
      ProductID: selectedOption ? selectedOption.value : '',
      ProductName: selectedOption ? selectedOption.label : '',
    });
  };
  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }
    const preview = URL.createObjectURL(file);
    this.setState({
      imageInfo: { ImageID: Date.now(), Image: preview, file },
    });
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = null;
    }
  };
  handleRemoveImage = () => {
    this.setState({
      imageInfo: null,
    });
  };
  handleCreateBanner = async () => {
    const { imageInfo, HiddenAt, BannerStatus } = this.state;
    const bannerInfo = {
      BannerImage: imageInfo?.Image,
      HiddenAt: HiddenAt ? HiddenAt.toISOString().split('T')[0] : null,
      BannerStatus,
    };
    const isValidateInput = await validateBannerInput(bannerInfo);
    if (!isValidateInput.valid) {
      toast.error(isValidateInput.errMessage);
      return;
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, createBanner: true } });
    const confirmSave = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận tạo banner mới?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, createBanner: false } }); },
          }
        );
      });
    const isConfirmed = await confirmSave();
    if (!isConfirmed) return;
    if (this.state.isUploading) {
      toast.info('Đang tải ảnh, vui lòng chờ!');
      return;
    }
    this.setState({ isUploading: true });
    try {
      let BannerImage = null;
      if (this.state.imageInfo) {
        const uploadResult = await uploadImages([this.state.imageInfo]);
        if (!uploadResult.status) {
          toast.error(uploadResult.error || 'Tải ảnh thất bại!');
          return;
        }
        BannerImage = uploadResult.images[0].Image;
      }
      const bannerInfo = {
        BannerImage,
        HiddenAt: this.state.HiddenAt ? this.state.HiddenAt.toISOString().split('T')[0] : null,
        BannerStatus: this.state.BannerStatus,
        ProductID: this.state.ProductID,
      };
      await this.props.handleCreateBannerFromModal(bannerInfo);
    } catch (e) {
      console.error('Lỗi khi tạo banner:', e);
      toast.error('Lỗi khi tạo banner!');
    } finally {
      this.setState({ isUploading: false });
    }
  };
  render() {
    const { codeBannerStatus, codePetType, codeProductType, imageInfo, HiddenAt, BannerStatus, ProductType, PetType, loadedProductInfo, ProductID, ProductName, disabledButtons } = this.state;

    const productOptions = loadedProductInfo.map((product) => ({
      value: product.ProductID,
      label: product.ProductName,
    }));

    return (
      <Modal show={this.props.isOpen} onHide={this.toggle} centered backdrop="static" className="create-banner-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Banner Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-content">
            <div className="modal-content-add-img">
              <p>Hình ảnh banner (tối đa 1):</p>
              <div className="f">
                {imageInfo?.Image && (
                  <div className="modal-content-add-img-item f">
                    <img src={imageInfo.Image} alt="Banner" />
                    <button className="delete-img" onClick={this.handleRemoveImage}>
                      <IonIcon icon={closeOutline}></IonIcon>
                    </button>
                  </div>
                )}
                {!imageInfo && (
                  <div className="add-img">
                    <input type="file" accept="image/*" onChange={this.handleAddImage} style={{ display: 'none' }} id="upload-image" ref={this.fileInputRef} />
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
                  <select value={ProductType} onChange={(e) => this.handleSelectChange(e, 'ProductType')}>
                    <option value="ALL">Tất cả</option>
                    {codeProductType.map((type) => (
                      <option key={type.Code} value={type.Code}>
                        {type.CodeValueVI}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-content-add-PetType f">
                  <p>Loại thú cưng:</p>
                  <div className="PetType-checkboxes f">
                    {codePetType.map((type) => (
                      <label key={type.Code} className="PetType-checkbox f">
                        <input type="checkbox" className="custom-checkbox" value={type.Code} checked={PetType.includes(type.Code)} onChange={this.handlePetTypeChange} />
                        <p>{type.CodeValueVI}</p>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-content-add-product-select">
                <p>Sản phẩm:</p>
                <Select className="product-select" options={productOptions} value={ProductID ? { value: ProductID, label: ProductName } : null} onChange={this.handleProductChange} placeholder="Chọn sản phẩm" isClearable />
              </div>
            </div>
            <div className="modal-content-add-dates">
              <p>Ngày ẩn (tùy chọn):</p>
              <DatePicker
                selected={HiddenAt}
                onChange={(date) => this.setState({ HiddenAt: date })}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="date-picker"
              />
            </div>
            <div className="modal-content-add-status">
              <p>Trạng thái banner:</p>
              <select value={BannerStatus} onChange={(e) => this.handleSelectChange(e, 'BannerStatus')}>
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
          <Button variant="primary" onClick={this.handleCreateBanner} disabled={disabledButtons.createBanner}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateBannerModal;
