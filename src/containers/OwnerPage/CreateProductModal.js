import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';

import { closeOutline } from 'ionicons/icons';

import './CreateProductModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { getAllCodes, validateProductInput, validateProductDetailInput, uploadImages } from '../../utils/pakage';

class CreateProductModal extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      codeProductType: [],
      codeDetailStatus: [],
      codePetType: [],
      productname: '',
      producttype: '',
      pettype: [],
      productprice: '',
      productdescription: '',
      allImages: [],
      productDetailInfo: [],
      isUploading: false,
      isEditingDetail: null,
      isAddingDetail: false,
      disabledButtons: {
        saveProduct: false,
        addDetail: false,
        cancelDetail: false,
      },
    };
  }
  async componentDidMount() {
    await this.handleLoadCode(['ProductType', 'DetailStatus', 'PetType']);
  }
  async componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.resetState();
    }
  }
  componentWillUnmount() {
    this.state.allImages.forEach((img) => {
      if (img.Image && img.file) URL.revokeObjectURL(img.Image);
    });
  };
  handleLoadCode = async (codeTypes) => {
    try {
      const responses = await Promise.all(codeTypes.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      const hasDefault = ['ProductType'];
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
    const { codeProductType } = this.state
    this.setState({
      productname: '',
      producttype: codeProductType.length > 0 ? codeProductType[0].Code : '',
      pettype: [],
      productprice: '',
      productdescription: '',
      allImages: [],
      productDetailInfo: [],
      isUploading: false,
      isEditingDetail: null,
      isAddingDetail: false,
    });
  };
  toggle = async () => {
    this.resetState();
    this.props.toggleFromModal();
  };
  handleInputChange = (e, field) => {
    this.setState({ [field]: e.target.value });
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
      toast.error('Tối đa 5 hình ảnh!');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ảnh quá lớn, vui lòng chọn ảnh dưới 20MB!');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }
    const preview = URL.createObjectURL(file);
    this.setState((prevState) => ({
      allImages: [...prevState.allImages, { ImageID: Date.now(), Image: preview, file }],
    }));
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = null;
    }
  };
  handleRemoveImage = (imageID) => {
    this.setState((prevState) => ({
      allImages: prevState.allImages.filter((img) => img.ImageID !== imageID),
    }));
  };
  handleSaveProduct = async () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, saveProduct: true } });
    const { productname, producttype, productprice, allImages, productdescription, pettype, productDetailInfo } = this.state;
    const productInfo = {
      ProductName: productname,
      ProductType: producttype,
      ProductPrice: productprice,
      ProductDescription: productdescription,
      PetType: pettype,
      Image: allImages,
    };
    const isValidateProduct = await validateProductInput(productInfo);
    if (!isValidateProduct.valid) {
      toast.error(isValidateProduct.errMessage);
      return;
    }
    const isValidateDetails = await validateProductDetailInput(productDetailInfo);
    if (!isValidateDetails.valid) {
      toast.error(isValidateDetails.errMessage);
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
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, saveProduct: false } }); },
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
      const { allImages, productname, producttype, pettype, productprice, productdescription, productDetailInfo } = this.state;
      const uploadedImages = [];
      if (allImages.length > 0) {
        if (allImages.length > 5) {
          toast.error('Tối đa 5 hình ảnh!');
          this.setState({ isUploading: false });
          return;
        }
        const uploadResult = await uploadImages(allImages); // Sử dụng uploadImages từ utils/pakage
        if (!uploadResult.status) {
          toast.error(uploadResult.error);
          this.setState({ isUploading: false });
          return;
        }
        uploadedImages.push(...uploadResult.images);
      }
      if (uploadedImages.length === 0) {
        toast.error('Vui lòng thêm ít nhất 1 hình ảnh!');
        this.setState({ isUploading: false });
        return;
      }
      const productInfo = {
        ProductName: productname,
        ProductPrice: parseFloat(productprice).toFixed(2),
        ProductImage: uploadedImages[0].Image,
        ProductType: producttype,
        ProductDescription: productdescription,
        PetType: pettype,
        ProductDetail: productDetailInfo.map((item) => ({
          ProductDetailID: item.ProductDetailID,
          DetailName: item.DetailName,
          Stock: parseInt(item.Stock),
          SoldCount: 0,
          ExtraPrice: item.ExtraPrice ? parseFloat(item.ExtraPrice).toFixed(2) : '0.00',
          Promotion: item.Promotion ? parseFloat(item.Promotion).toFixed(2) : '0.00',
          DetailStatus: item.DetailStatus,
        })),
        Image: uploadedImages.slice(1),
      };
      await this.props.handleCreateProductFromModal(productInfo);
    } catch (e) {
      toast.error('Lỗi khi lưu sản phẩm!');
    } finally {
      this.setState({ isUploading: false });
    }
  };
  handleEditDetail = (index) => {
    if (this.state.isAddingDetail || this.state.isEditingDetail !== null) {
      toast.error('Vui lòng lưu hoặc hủy hành động hiện tại trước khi chỉnh sửa chi tiết khác!');
      return;
    }
    this.setState({ isEditingDetail: index, isAddingDetail: false });
  };
  handleAddDetail = () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, addDetail: true } });
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
            {
              autoClose: 2000,
              closeOnClick: false,
              onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, addDetail: false } }); },
            }
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
                productDetailInfo: [
                  ...prevState.productDetailInfo,
                  {
                    ProductDetailID: Date.now(),
                    DetailName: '',
                    Stock: '0',
                    ExtraPrice: '0',
                    Promotion: '0',
                    DetailStatus: 'AVAIL',
                  },
                ],
                isEditingDetail: prevState.productDetailInfo.length,
                isAddingDetail: true,
              }));
            }
          );
        }
      });
    } else {
      this.setState((prevState) => ({
        productDetailInfo: [
          ...prevState.productDetailInfo,
          {
            ProductDetailID: Date.now(),
            DetailName: '',
            Stock: '0',
            ExtraPrice: '0',
            Promotion: '0',
            DetailStatus: 'AVAIL',
          },
        ],
        isEditingDetail: prevState.productDetailInfo.length,
        isAddingDetail: true,
      }));
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, addDetail: false } });
  };
  handleCancelDetail = () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelDetail: true } });
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
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelDetail: false } }); },
          }
        );
      });
    confirmCancel().then((isConfirmed) => {
      if (isConfirmed) {
        this.setState((prevState) => {
          if (prevState.isAddingDetail && prevState.isEditingDetail === prevState.productDetailInfo.length - 1) {
            return {
              productDetailInfo: prevState.productDetailInfo.slice(0, -1),
              isEditingDetail: null,
              isAddingDetail: false,
            };
          }
          return {
            isEditingDetail: null,
            isAddingDetail: false,
          };
        });
      }
    });
  };
  handleDetailChange = (index, field, value) => {
    this.setState((prevState) => {
      const newDetails = [...prevState.productDetailInfo];
      newDetails[index] = { ...newDetails[index], [field]: value };
      if (field === 'Stock') {
        newDetails[index].DetailStatus = parseInt(value) > 0 ? newDetails[index].DetailStatus : 'OUT';
      }
      return { productDetailInfo: newDetails };
    });
  };
  handleSaveDetail = async (index) => {
    const isValidateInput = await validateProductDetailInput([this.state.productDetailInfo[index]]);
    if (!isValidateInput.valid) {
      toast.error(`${isValidateInput.errMessage} tại dòng ${index + 1}`);
      return;
    }
    this.setState({ isEditingDetail: null, isAddingDetail: false });
  };
  render() {
    const { isOpen } = this.props;
    const { productname, producttype, productprice, productdescription, allImages, codeProductType, codePetType, pettype, productDetailInfo, isEditingDetail, codeDetailStatus, isAddingDetail } = this.state;
    return (
      <Modal show={isOpen} onHide={this.toggle} centered backdrop="static" className="create-product-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thêm sản phẩm mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-content">
            <div className="modal-content-add-img">
              <p>Hình ảnh sản phẩm (tối thiểu 1):</p>
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
                    <input type="file" accept="image/*" onChange={this.handleAddImage} style={{ display: 'none' }} id="upload-image" ref={this.fileInputRef} />
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
                <select value={producttype} onChange={(e) => this.handleInputChange(e, 'producttype')}>
                  {codeProductType.map((type) => (
                    <option key={type.Code} value={type.Code}>
                      {type.CodeValueVI}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-content-add-pettype">
                <p>Loại thú cưng:</p>
                <div className="pettype-checkboxes ">
                  {codePetType.map((type) => (
                    <label key={type.Code} className="pettype-checkbox">
                      <input type="checkbox" value={type.Code} checked={pettype.includes(type.Code)} onChange={this.handlePetTypeChange} />
                      {type.CodeValueVI}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-content-add-main-price">
                <p>Giá cơ bản:</p>
                <div className="f">
                  <input type="number" placeholder="Nhập giá" value={isNaN(parseFloat(productprice)) ? '' : parseFloat(productprice)} onChange={(e) => this.handleInputChange(e, 'productprice')} />
                  <p>vnđ</p>
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
                    {productDetailInfo && productDetailInfo.length > 0 ? (
                      productDetailInfo.map((item, index) => (
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

export default CreateProductModal;
