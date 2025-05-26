import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';
import Modal from 'react-bootstrap/Modal';

import { closeOutline } from 'ionicons/icons';

import './EditProductModal.scss';
import Button from 'react-bootstrap/Button';

import { handleGetProductInfoApi } from '../../services/productServices';
import { handleGetAllCodesApi, uploadImageToCloudinaryApi } from '../../services/utilitiesServices';

class EditProductModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedProductInfo: null,
      loadedProductDetailInfo: null,
      selectedProductID: null,
      codePetType: [],
      codeProductType: [],
      codeDetailStatus: [],
      productname: '',
      producttype: '',
      pettype: [],
      imagelist: [],
      productprice: '',
      productimage: '',
      productdescription: '',
      isUploading: false,
      allImages: [],
      isEditingDetail: null,
      isAddingDetail: false,
    };
  }

  async componentDidMount() {
    await Promise.all([this.handleLoadCodeProductType(), this.handleLoadCodePetType(), this.handleLoadCodeDetailStatus()]);
    const { selectedProductID } = this.props;
    if (selectedProductID) {
      await this.handleLoadProductInfo(selectedProductID);
    }
  }

  async componentDidUpdate(prevProps) {
    const { selectedProductID, isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      this.resetState();
      if (selectedProductID) {
        await this.handleLoadProductInfo(selectedProductID);
      }
    }
  }

  componentWillUnmount() {
    this.state.allImages.forEach((img) => {
      if (img.Image && img.file) URL.revokeObjectURL(img.Image);
    });
  }

  resetState = () => {
    this.setState({
      loadedProductInfo: null,
      loadedProductDetailInfo: null,
      selectedProductID: null,
      productname: '',
      producttype: '',
      pettype: [],
      imagelist: [],
      productprice: '',
      productimage: '',
      productdescription: '',
      isUploading: false,
      allImages: [],
      isEditingDetail: null,
      isAddingDetail: false,
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
        producttype: codeProductType.length > 0 ? codeProductType[0].Code : '',
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

  handleLoadCodeDetailStatus = async () => {
    try {
      const codeDetailStatus = await handleGetAllCodesApi('DetailStatus');
      if (!codeDetailStatus || codeDetailStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái chi tiết!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codeDetailStatus });
    } catch (e) {
      console.error('Error loading detail status code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái chi tiết!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadProductInfo = async (productid) => {
    try {
      const response = await handleGetProductInfoApi(productid);
      if (response && response.errCode === 0) {
        const productInfo = response.data;
        const allImages = [
          { ImageID: Date.now(), Image: productInfo.ProductImage, file: null },
          ...(productInfo.Image || []).map((img) => ({
            ImageID: img.ImageID,
            Image: img.Image,
            file: null,
          })),
        ];
        this.setState({
          loadedProductInfo: productInfo,
          selectedProductID: productInfo.ProductID,
          loadedProductDetailInfo: productInfo.ProductDetail || [],
          productname: productInfo.ProductName,
          producttype: productInfo.ProductType,
          pettype: productInfo.PetType || [],
          imagelist: productInfo.Image || [],
          productprice: productInfo.ProductPrice,
          productimage: productInfo.ProductImage,
          productdescription: productInfo.ProductDescription,
          allImages,
        });
      } else {
        this.resetState();
        toast.error('Tải sản phẩm thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error loading product:', e);
      this.resetState();
      toast.error('Lỗi khi tải sản phẩm!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  toggle = async () => {
    this.resetState();
    this.props.toggleFromModal();
  };

  handleInputChange = (e, field) => {
    this.setState({ [field]: e.target.value });
  };

  handleSelectChange = (e) => {
    this.setState({ producttype: e.target.value });
  };

  handlePetTypeChange = (e) => {
    const petType = e.target.value;
    const isChecked = e.target.checked;
    this.setState((prevState) => {
      const updatedPetTypes = isChecked ? [...prevState.pettype, petType] : prevState.pettype.filter((type) => type !== petType);
      return { pettype: updatedPetTypes };
    });
  };

  handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (this.state.allImages.length >= 5) {
      toast.error('Tối đa 5 hình ảnh!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
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
    this.setState((prevState) => ({
      allImages: [...prevState.allImages, { ImageID: Date.now(), Image: preview, file }],
    }));
  };

  handleRemoveImage = (imageID) => {
    this.setState((prevState) => ({
      allImages: prevState.allImages.filter((img) => img.ImageID !== imageID),
    }));
  };

  handleDetailChange = (index, field, value) => {
    this.setState((prevState) => {
      const newDetails = [...prevState.loadedProductDetailInfo];
      newDetails[index] = { ...newDetails[index], [field]: value };
      if (field === 'Stock') {
        newDetails[index].DetailStatus = parseInt(value) > 0 ? newDetails[index].DetailStatus : 'OUT';
      }
      return { loadedProductDetailInfo: newDetails };
    });
  };

  handleEditDetail = (index) => {
    if (this.state.isAddingDetail || this.state.isEditingDetail !== null) {
      toast.error('Vui lòng lưu hoặc hủy hành động hiện tại trước khi chỉnh sửa chi tiết khác!', {
        position: 'top-right',
        autoClose: 1000,
        closeOnClick: true,
      });
      return;
    }
    this.setState({ isEditingDetail: index, isAddingDetail: false });
  };
  handleSaveDetail = (index) => {
    const validation = this.checkValidateDetail(index);
    if (validation.errCode !== 0) {
      toast.error(validation.errMessage, {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    this.setState({ isEditingDetail: null, isAddingDetail: false });
  };

  handleAddDetail = () => {
    if (this.state.isAddingDetail || this.state.isEditingDetail !== null) {
      const confirmAddNew = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>
                {this.state.isAddingDetail
                  ? 'Bạn đang thêm chi tiết sản phẩm chưa lưu. Lưu hoặc hủy trước khi thêm chi tiết mới?'
                  : 'Bạn có thay đổi chi tiết sản phẩm chưa lưu. Hủy thay đổi và thêm chi tiết mới?'}
              </p>
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
            { position: 'top-center', autoClose: 2000, closeOnClick: false }
          );
        });

      confirmAddNew().then((isConfirmed) => {
        if (isConfirmed) {
          this.setState(
            {
              isEditingDetail: null,
              isAddingDetail: false,
            },
            () => {
              this.setState((prevState) => ({
                loadedProductDetailInfo: [
                  ...prevState.loadedProductDetailInfo,
                  {
                    ProductDetailID: Date.now(),
                    DetailName: '',
                    Stock: '0',
                    ExtraPrice: '0',
                    Promotion: '0',
                    DetailStatus: 'AVAIL',
                  },
                ],
                isEditingDetail: prevState.loadedProductDetailInfo.length,
                isAddingDetail: true,
              }));
            }
          );
        }
      });
    } else {
      this.setState((prevState) => ({
        loadedProductDetailInfo: [
          ...prevState.loadedProductDetailInfo,
          {
            ProductDetailID: Date.now(),
            DetailName: '',
            Stock: '0',
            ExtraPrice: '0',
            Promotion: '0',
            DetailStatus: 'AVAIL',
          },
        ],
        isEditingDetail: prevState.loadedProductDetailInfo.length,
        isAddingDetail: true,
      }));
    }
  };

  handleCancelDetail = () => {
    const confirmCancel = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>
              {this.state.isAddingDetail
                ? 'Bạn đang thêm chi tiết sản phẩm chưa lưu. Hủy chi tiết này?'
                : 'Bạn có thay đổi chi tiết sản phẩm chưa lưu. Hủy thay đổi?'}
            </p>
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
          { position: 'top-center', autoClose: 2000, closeOnClick: false }
        );
      });

    confirmCancel().then((isConfirmed) => {
      if (isConfirmed) {
        this.setState((prevState) => {
          if (prevState.isAddingDetail && prevState.isEditingDetail === prevState.loadedProductDetailInfo.length - 1) {
            return {
              loadedProductDetailInfo: prevState.loadedProductDetailInfo.slice(0, -1),
              isEditingDetail: null,
              isAddingDetail: false,
            };
          }
          return {
            isEditingDetail: null,
            isAddingDetail: false,
          };
        }, () => {
          // Tải lại thông tin sản phẩm để làm mới dữ liệu
          if (this.state.selectedProductID) {
            this.handleLoadProductInfo(this.state.selectedProductID);
          }
        });
      }
    });
  };

  checkValidateDetail = (index) => {
    const item = this.state.loadedProductDetailInfo[index];
    if (!item.DetailName)
      return {
        errCode: -1,
        errMessage: `Tên chi tiết tại dòng ${index + 1} không được để trống!`,
      };
    const regex = /^(?=.*[A-Za-zÀ-ỹ]).{2,100}$/;
    if (!regex.test(item.DetailName.trim()))
      return {
        errCode: -1,
        errMessage: `Tên chi tiết tại dòng ${index + 1} không hợp lệ!`,
      };
    if (item.Stock === '' || item.Stock === undefined)
      return {
        errCode: -1,
        errMessage: `Số lượng tồn tại dòng ${index + 1} không được để trống!`,
      };
    if (isNaN(item.Stock) || parseInt(item.Stock) < 0)
      return {
        errCode: -1,
        errMessage: `Số lượng tồn tại dòng ${index + 1} phải lớn hơn hoặc bằng 0!`,
      };
    if (parseInt(item.Stock) === 0 && item.DetailStatus === 'AVAIL')
      return {
        errCode: -1,
        errMessage: `Số lượng tồn tại dòng ${index + 1} bằng 0, không thể chọn trạng thái Còn hàng!`,
      };
    if (item.ExtraPrice !== '' && item.ExtraPrice !== undefined && (isNaN(item.ExtraPrice) || parseFloat(item.ExtraPrice) < 0)) {
      return {
        errCode: -1,
        errMessage: `Giá thêm tại dòng ${index + 1} phải lớn hơn hoặc bằng 0!`,
      };
    }
    if (item.Promotion !== '' && item.Promotion !== undefined && (isNaN(item.Promotion) || parseFloat(item.Promotion) < 0 || parseFloat(item.Promotion) > 100)) {
      return {
        errCode: -1,
        errMessage: `Khuyến mãi tại dòng ${index + 1} phải từ 0 đến 100%!`,
      };
    }
    if (!item.DetailStatus)
      return {
        errCode: -1,
        errMessage: `Trạng thái chi tiết tại dòng ${index + 1} không được để trống!`,
      };
    return { errCode: 0, errMessage: 'Kiểm tra thành công!' };
  };

  checkValidateProduct = () => {
    const { productname, producttype, productprice, allImages, productdescription, pettype, loadedProductDetailInfo } = this.state;

    if (!productname) return { errCode: -1, errMessage: 'Tên sản phẩm không được để trống!' };
    const nameRegex = /^(?=.*[A-Za-zÀ-ỹ]).{2,100}$/;
    if (!nameRegex.test(productname.trim())) return { errCode: -1, errMessage: 'Tên sản phẩm không hợp lệ!' };

    if (!producttype) return { errCode: -1, errMessage: 'Vui lòng chọn loại sản phẩm!' };

    if (!productprice) return { errCode: -1, errMessage: 'Giá bán không được để trống!' };
    if (isNaN(productprice) || parseFloat(productprice) <= 0) return { errCode: -1, errMessage: 'Giá bán phải lớn hơn 0!' };

    if (!productdescription) return { errCode: -1, errMessage: 'Mô tả sản phẩm không được để trống!' };

    if (allImages.length === 0) return { errCode: -1, errMessage: 'Vui lòng thêm ít nhất 1 hình ảnh!' };
    if (allImages.length > 5) return { errCode: -1, errMessage: 'Tối đa 5 hình ảnh!' };

    if (pettype.length === 0)
      return {
        errCode: -1,
        errMessage: 'Vui lòng chọn ít nhất một loại thú cưng!',
      };

    if (!loadedProductDetailInfo || loadedProductDetailInfo.length === 0)
      return {
        errCode: -1,
        errMessage: 'Vui lòng thêm ít nhất một chi tiết sản phẩm!',
      };

    for (let i = 0; i < loadedProductDetailInfo.length; i++) {
      const validation = this.checkValidateDetail(i);
      if (validation.errCode !== 0) return validation;
    }

    return { errCode: 0, errMessage: 'Kiểm tra thành công!' };
  };

  handleSaveProduct = async () => {
    const validation = this.checkValidateProduct();
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
            <p>Xác nhận lưu thông tin sản phẩm?</p>
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
      const { allImages, productname, producttype, pettype, productprice, productdescription, selectedProductID, loadedProductDetailInfo } = this.state;
      const uploadedImages = [];
      const failedImages = [];
      for (let img of allImages) {
        if (img.file) {
          try {
            const response = await uploadImageToCloudinaryApi(img.file);
            if (response.errCode === 0) {
              uploadedImages.push({
                ImageID: img.ImageID,
                Image: response.data.secure_url,
              });
            } else {
              failedImages.push(img.file.name);
            }
          } catch (e) {
            failedImages.push(img.file.name);
          }
        } else {
          uploadedImages.push({
            ImageID: img.ImageID,
            Image: img.Image,
          });
        }
      }

      if (failedImages.length > 0) {
        toast.error(`Không thể tải lên các ảnh: ${failedImages.join(', ')}`, {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }

      if (uploadedImages.length === 0) {
        toast.error('Vui lòng thêm ít nhất 1 hình ảnh!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }

      const productInfo = {
        ProductID: selectedProductID,
        ProductName: productname,
        ProductPrice: parseFloat(productprice).toFixed(2),
        ProductImage: uploadedImages[0].Image,
        ProductType: producttype,
        ProductDescription: productdescription,
        PetType: pettype,
        ProductDetail: loadedProductDetailInfo.map((item) => ({
          ProductDetailID: item.ProductDetailID,
          DetailName: item.DetailName,
          Stock: parseInt(item.Stock),
          SoldCount: item.SoldCount || 0,
          ExtraPrice: item.ExtraPrice ? parseFloat(item.ExtraPrice).toFixed(2) : '0.00',
          Promotion: item.Promotion ? parseFloat(item.Promotion).toFixed(2) : '0.00',
          DetailStatus: item.DetailStatus,
        })),
        Image: uploadedImages.slice(1),
      };
      await this.props.handleChangeProductFromModal(productInfo);
    } catch (e) {
      toast.error('Lỗi khi lưu sản phẩm!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    } finally {
      this.setState({ isUploading: false });
    }
  };

  render() {
    const { isOpen } = this.props;
    const { productname, producttype, productprice, productdescription, allImages, codeProductType, codePetType, pettype, loadedProductDetailInfo, isEditingDetail, codeDetailStatus, isAddingDetail } = this.state;

    return (
      <Modal show={isOpen} onHide={this.toggle} centered backdrop="static" className="create-product-modal">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-content">
            <div className="modal-content-add-img">
              <p>Hình ảnh sản phẩm (tối thiếu 1):</p>
              <div className="f">
                {allImages.map((img, index) => (
                  <div key={img.ImageID} className="modal-content-add-img-item f">
                    <img src={img.Image} alt={`Hình ảnh ${index === 0 ? 'chính' : 'phụ'}`} />
                    <button className="delete-img" onClick={() => this.handleRemoveImage(img.ImageID)}>
                      <IonIcon icon={closeOutline}></IonIcon>
                    </button>
                  </div>
                ))}
                {allImages.length < 5 && (
                  <div className="add-img">
                    <input type="file" accept="image/*" onChange={this.handleAddImage} style={{ display: 'none' }} id="upload-image" />
                    <label htmlFor="upload-image" className="add-img-label">
                      +
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-content-add-name">
              <p>Tên sản phẩm:</p>
              <input type="text" placeholder="Nhập tên sản phẩm" value={productname} onChange={(e) => this.handleInputChange(e, 'productname')} />
            </div>
            <div className="f">
              <div className="modal-content-add-category">
                <p>Loại sản phẩm:</p>
                <select value={producttype} onChange={this.handleSelectChange}>
                  {codeProductType.map((type) => (
                    <option key={type.Code} value={type.Code}>
                      {type.CodeValueVI}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-content-add-main-price">
                <p>Giá cơ bản:</p>
                <div className="f">
                  <input type="number" placeholder="Nhập giá" value={isNaN(parseFloat(productprice)) ? '' : parseFloat(productprice)} onChange={(e) => this.handleInputChange(e, 'productprice')} />
                  <p>vnđ</p>
                </div>
              </div>
              <div className="modal-content-add-pettype">
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
            <div className="modal-content-add-type-price">
              <p>Chi tiết sản phẩm (tối thiểu 1):</p>
              <div className="product-detail-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên chi tiết</th>
                      <th>Số lượng tồn kho</th>
                      <th>Giá thêm (vnđ)</th>
                      <th>Khuyến mãi (%)</th>
                      <th>Trạng thái</th>
                      <th>Chỉnh sửa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedProductDetailInfo && loadedProductDetailInfo.length > 0 ? (
                      loadedProductDetailInfo.map((item, index) => (
                        <tr key={item.ProductDetailID}>
                          <td>
                            {isEditingDetail === index ? (
                              <input
                                type="text"
                                value={item.DetailName}
                                onChange={(e) => this.handleDetailChange(index, 'DetailName', e.target.value)}
                              />
                            ) : (
                              item.DetailName
                            )}
                          </td>
                          <td>
                            {isEditingDetail === index ? (
                              <input
                                type="number"
                                value={item.Stock}
                                onChange={(e) => this.handleDetailChange(index, 'Stock', e.target.value)}
                              />
                            ) : (
                              item.Stock
                            )}
                          </td>
                          <td>
                            {isEditingDetail === index ? (
                              <input
                                type="number"
                                value={item.ExtraPrice ?? ''}
                                onChange={(e) => this.handleDetailChange(index, 'ExtraPrice', e.target.value)}
                              />
                            ) : (
                              parseFloat(item.ExtraPrice) || 0
                            )}
                          </td>
                          <td>
                            {isEditingDetail === index ? (
                              <input
                                type="number"
                                value={item.Promotion ?? ''}
                                onChange={(e) => this.handleDetailChange(index, 'Promotion', e.target.value)}
                              />
                            ) : (
                              parseFloat(item.Promotion) || 0
                            )}
                          </td>
                          <td>
                            {isEditingDetail === index ? (
                              <select
                                value={item.DetailStatus}
                                onChange={(e) => this.handleDetailChange(index, 'DetailStatus', e.target.value)}
                              >
                                {codeDetailStatus.map((status) => (
                                  <option key={status.Code} value={status.Code}>
                                    {status.CodeValueVI}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              codeDetailStatus.find((status) => status.Code === item.DetailStatus)?.CodeValueVI || 'Không xác định'
                            )}
                          </td>
                          <td>
                            {isEditingDetail === index ? (
                              <>
                                <button className="save-detail" onClick={() => this.handleSaveDetail(index)}>
                                  Lưu
                                </button>
                                <button className="cancel-detail" onClick={() => this.handleCancelDetail()}>
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <button
                                className="edit-detail"
                                onClick={() => this.handleEditDetail(index)}
                                disabled={isEditingDetail !== null || isAddingDetail}
                              >
                                Sửa
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>
                          Chưa có chi tiết sản phẩm
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                        <button
                          className={`add-detail-btn ${isAddingDetail ? 'cancel' : ''}`}
                          onClick={isAddingDetail ? this.handleCancelDetail : this.handleAddDetail}
                        >
                          {isAddingDetail ? 'Hủy' : 'Thêm'}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-content-add-info">
              <p>Mô tả sản phẩm:</p>
              <textarea placeholder="Nhập mô tả sản phẩm" value={productdescription} onChange={(e) => this.handleInputChange(e, 'productdescription')} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleSaveProduct}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditProductModal;
