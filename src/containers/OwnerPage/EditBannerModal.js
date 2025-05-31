import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import { closeOutline } from 'ionicons/icons';

import './EditBannerModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { handleLoadFilteredProductInfoApi } from '../../services/productServices';
import { handleGetBannerInfoApi } from '../../services/bannerServices';

import { getAllCodes, uploadImages, validateBannerInput } from '../../utils/pakage';

class EditBannerModal extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      loadedBannerInfo: null,
      selectedBannerID: null,
      codeProductType: [],
      codePetType: [],
      codeBannerStatus: [],
      imageInfo: null,
      hiddenat: null,
      bannerstatus: '',
      productid: '',
      productname: '',
      producttype: 'ALL',
      pettype: [],
      isUploading: false,
      loadedProductInfo: [],
      disabledButtons: {
        saveBanner: false,
      },
    };
    this.debounceTimeout = null;
  }
  async componentDidMount() {
    await this.handleLoadCode(['ProductType', 'PetType', 'BannerStatus']);
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
          newState[type.toLowerCase()] = response.data.length > 0 ? response.data[0].Code : '';
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
      hiddenat: null,
      bannerstatus: codeBannerStatus.length > 0 ? codeBannerStatus[0].Code : '',
      productid: '',
      productname: '',
      producttype: 'ALL',
      pettype: [],
      isUploading: false,
      loadedProductInfo: [],
    });
  };
  toggle = () => {
    this.resetState();
    this.props.toggleFromModal();
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
          imageInfo: { ImageID: Date.now(), Image: banner.BannerImage },
        });
      } else {
        this.resetState();
        toast.error('Tải thông tin banner thất bại!');
      }
    } catch (e) {
      console.error('Error loading banner info:', e);
      this.resetState();
      toast.error('Lỗi khi tải thông tin banner!');
    }
  };
  handleLoadFilteredProductInfo = async () => {
    try {
      const { producttype, pettype, searchValue } = this.state;
      const response = await handleLoadFilteredProductInfoApi(producttype, JSON.stringify(pettype), searchValue);
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
  handleSaveBanner = async () => {
    const { imageInfo, hiddenat, bannerstatus } = this.state;
    const bannerInfo = {
      BannerImage: imageInfo?.Image,
      HiddenAt: hiddenat ? hiddenat.toISOString().split('T')[0] : null,
      BannerStatus: bannerstatus,
    };
    const isValidateInput = await validateBannerInput(bannerInfo);
    if (!isValidateInput.valid) {
      toast.error(isValidateInput.errMessage);
      return;
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, saveBanner: true } });
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
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, saveBanner: false } }); },
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
      let bannerImage = this.state.bannerimage;
      if (this.state.imageInfo?.file) {
        const uploadResult = await uploadImages([this.state.imageInfo]);
        if (!uploadResult.status) {
          toast.error(uploadResult.error || 'Tải ảnh thất bại!');
          return;
        }
        bannerImage = uploadResult.images[0].Image;
      } else if (this.state.imageInfo) {
        bannerImage = this.state.imageInfo.Image;
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
      toast.error('Lỗi khi lưu banner!');
    } finally {
      this.setState({ isUploading: false });
    }
  };

  render() {
    const { codeBannerStatus, codePetType, codeProductType, imageInfo, hiddenat, bannerstatus, producttype, pettype, loadedProductInfo, productid, productname, disabledButtons } = this.state;
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
              <p>Hình ảnh banner:</p>
              <div className="f">
                {imageInfo?.Image && (
                  <div className="modal-content-edit-img-item f">
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
              Tìm kiếm
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
                onChange={(date) => this.setState({ hiddenat: date })}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="date-picker"
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
          <Button variant="primary" onClick={this.handleSaveBanner} disabled={disabledButtons.saveBanner}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditBannerModal;
