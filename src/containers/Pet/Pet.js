import React, { Component } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react';
import QRCode from 'qrcode';
import { buildOutline, trashBinOutline, closeCircleOutline, checkmarkCircleOutline, qrCodeOutline, arrowBackOutline } from 'ionicons/icons';
import { ethers } from 'ethers';
import './Pet.scss';
import Spinner from '../../components/Spinner';
import { handleGetAccountInfoApi, handleLogoutApi } from '../../services/accountServices';
import { handleGetAccountPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi, handleRemovePetApi, handleGetPetInfoApi } from '../../services/petServices';
import { uploadImageToCloudinaryApi } from '../../services/utilitiesServices';
import { checkLoginStatus, getAllCodes, uploadImages, validatePetInput } from '../../utils/pakage';
import { userLogin, userLogout } from '../../store/actions';

const defPetImage = 'https://res.cloudinary.com/dcwpbdmvx/image/upload/v1748457706/z6649336972368_9714d5c9935f99b35708504f5a5eb8ab_jzvmnx.jpg';

class Pet extends Component {
  constructor(props) {
    super(props);
    this.fileInputRefs = {}; // To store refs for each pet's file input
    this.state = {
      // Authentication & General
      isLoading: true,
      isLoggedIn: false,
      AccountID: '',
      // Codes
      codePetType: [],
      codePetGender: [],
      // Data Lists
      loadedPetInfo: [],
      // Pet Management
      showAddForm: false,
      isEditingPet: null,
      limitPetCount: 3,
      // Image Management per pet
      petImages: {}, // { petIndex: { Image: preview, file } }
      // DisableButton
      disabledButtons: {
        savePet: false,
        deletePet: false,
        cancelPet: false,
        addPet: false,
      },
    };
  }

  async componentDidMount() {
    await this.handleIsLogin();
    await this.handleLoadCode(['PetType', 'PetGender']);
    setTimeout(() => {
      this.handleLoadPetInfo();
      this.setState({ isLoading: false });
    }, 10);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.handleIsLogin();
      setTimeout(() => {
        this.handleLoadPetInfo();
      }, 10);
    }
  }

  componentWillUnmount() {
    // Revoke object URLs for previews
    Object.values(this.state.petImages).forEach((img) => {
      if (img && img.Image) URL.revokeObjectURL(img.Image);
    });
  }

  //login
  handleIsLogin = async () => {
    try {
      this.setState({ isLoading: true });
      const { status, accountInfo } = await checkLoginStatus();
      if (status && accountInfo) {
        if (!this.props.userInfo) {
          this.props.userLogin(accountInfo);
        }
        this.setState({
          accountInfo,
          isLoggedIn: true,
          AccountID: accountInfo.AccountID,
        });
      } else {
        await handleLogoutApi();
        this.props.userLogout();
        this.setState({
          accountInfo: null,
          isLoggedIn: false,
          AccountID: '',
        });
        this.props.navigate('/login');
      }
    } catch (e) {
      this.props.navigate('/login');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  //load filter/code
  handleLoadCode = async (codeTypeFilter) => {
    try {
      this.setState({ isLoading: true });
      const responses = await Promise.all(codeTypeFilter.map((type) => getAllCodes(type)));
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

  //connect metamask
  connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        this.setState((prevState) => ({
          AccountID: prevState.AccountID || account,
        }));
        return signer;
      } catch (e) {
        toast.error('Vui lòng kết nối với MetaMask!');
        return null;
      }
    } else {
      toast.error('MetaMask chưa được cài đặt!');
      return null;
    }
  };

  handleLoadPetInfo = async () => {
    try {
      const { AccountID } = this.state;
      const response = await handleGetAccountPetInfoApi(AccountID);
      if (response && response.errCode === 0) {
        this.setState({
          loadedPetInfo: response.data || [],
        });
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách thú cưng:', e);
      toast.error('Lỗi khi tải danh sách thú cưng!');
    }
  };

  // Image handling
  handleAddImage = (index, e) => {
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
    this.setState((prevState) => ({
      petImages: {
        ...prevState.petImages,
        [index]: { Image: preview, file },
      },
    }));
    if (this.fileInputRefs[index]) {
      this.fileInputRefs[index].value = null;
    }
  };

  handleRemoveImage = (index) => {
    this.setState((prevState) => {
      const newPetImages = { ...prevState.petImages };
      if (newPetImages[index] && newPetImages[index].Image) {
        URL.revokeObjectURL(newPetImages[index].Image);
      }
      delete newPetImages[index];
      const newPets = [...prevState.loadedPetInfo];
      newPets[index] = { ...newPets[index], PetImage: defPetImage };
      return { petImages: newPetImages, loadedPetInfo: newPets };
    });
  };

  //PetInfo Management
  handleEditPet = (index) => {
    const { showAddForm, isEditingPet } = this.state;
    if (showAddForm || isEditingPet !== null) {
      toast.error('Vui lòng lưu hoặc hủy hành động hiện tại trước khi chỉnh sửa thú cưng khác!');
      return;
    }
    this.setState({ isEditingPet: index, showAddForm: false });
  };

  handleAddPet = () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, addPet: true } });
    if (this.state.showAddForm || this.state.isEditingPet !== null) {
      const confirmAddNew = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>{this.state.showAddForm ? 'Bạn đang thêm thú cưng chưa lưu. Lưu hoặc hủy trước khi thêm thú cưng mới?' : 'Bạn có thay đổi thú cưng chưa lưu. Hủy thay đổi và thêm thú cưng mới?'}</p>
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
              onClose: () => {
                this.setState({ disabledButtons: { ...this.state.disabledButtons, addPet: false } });
              },
            }
          );
        });
      confirmAddNew().then((isConfirmed) => {
        if (isConfirmed) {
          this.setState(
            {
              isEditingPet: null,
              showAddForm: false,
            },
            async () => {
              await this.handleLoadPetInfo(this.state.AccountID);
              this.setState((prevState) => ({
                loadedPetInfo: [
                  {
                    PetID: `temp_${Date.now()}`,
                    PetName: '',
                    PetType: prevState.codePetType[0]?.Code || '',
                    PetGender: prevState.codePetGender[0]?.Code || '',
                    Age: '',
                    PetWeight: '',
                    PetImage: defPetImage,
                  },
                  ...prevState.loadedPetInfo,
                ],
                isEditingPet: 0,
                showAddForm: true,
              }));
            }
          );
        }
      });
    } else {
      this.setState((prevState) => ({
        loadedPetInfo: [
          {
            PetID: `temp_${Date.now()}`,
            PetName: '',
            PetType: prevState.codePetType[0]?.Code || '',
            PetGender: prevState.codePetGender[0]?.Code || '',
            Age: '',
            PetWeight: '',
            PetImage: defPetImage,
          },
          ...prevState.loadedPetInfo,
        ],
        isEditingPet: 0,
        showAddForm: true,
      }));
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, addPet: false } });
  };

  handleCancelPet = () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelPet: true } });
    const confirmCancel = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>{this.state.showAddForm ? 'Bạn đang thêm thú cưng chưa lưu. Hủy thú cưng này?' : 'Bạn có thay đổi thú cưng chưa lưu. Hủy thay đổi?'}</p>
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
            onClose: () => {
              this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelPet: false } });
            },
          }
        );
      });
    confirmCancel().then((isConfirmed) => {
      if (isConfirmed) {
        this.setState(
          (prevState) => {
            if (prevState.showAddForm && prevState.isEditingPet === 0) {
              return {
                loadedPetInfo: prevState.loadedPetInfo.slice(1),
                isEditingPet: null,
                showAddForm: false,
              };
            }
            return {
              isEditingPet: null,
              showAddForm: false,
            };
          },
          async () => {
            await this.handleLoadPetInfo(this.state.AccountID);
          }
        );
      }
    });
  };

  handlePetChange = (index, field, value) => {
    this.setState((prevState) => {
      const newPets = [...prevState.loadedPetInfo];
      newPets[index] = { ...newPets[index], [field]: value };
      return { loadedPetInfo: newPets };
    });
  };

  handleSavePet = async (index) => {
    const { AccountID, loadedPetInfo, showAddForm, petImages } = this.state;
    const pet = loadedPetInfo[index];
    let petImageUrl = pet.PetImage || defPetImage;

    // Upload image if exists
    const imageInfo = petImages[index];
    if (imageInfo) {
      this.setState({ isLoading: true });
      try {
        const uploadResult = await uploadImages([imageInfo]);
        if (!uploadResult.status) {
          toast.error(uploadResult.error || 'Tải ảnh thất bại!');
          return;
        }
        const uploadedImage = uploadResult.images[0];
        petImageUrl = uploadedImage.Image;
      } catch (e) {
        toast.error('Lỗi khi tải ảnh!');
        return;
      } finally {
        this.setState({ isLoading: false });
      }
    }

    const newPetInfo = {
      PetName: pet.PetName.trim(),
      PetType: pet.PetType,
      PetGender: pet.PetGender,
      PetWeight: parseFloat(pet.PetWeight),
      Age: parseInt(pet.Age),
      PetImage: petImageUrl,
    };
    const isValidatePetInput = await validatePetInput(newPetInfo);
    if (!isValidatePetInput.valid) {
      toast.error(`${isValidatePetInput.errMessage}`);
      return;
    }
    this.setState({ isLoading: true });
    try {
      const signer = await this.connectMetaMask();
      if (signer) {
        let response;
        if (showAddForm) {
          response = await handleSavePetInfoApi(newPetInfo, signer);
        } else {
          response = await handleChangePetInfoApi(pet.PetID, newPetInfo, signer);
        }
        if (response && response.errCode === 0) {
          toast.success(showAddForm ? 'Tạo thú cưng thành công!' : 'Cập nhật thú cưng thành công!');
          await this.handleLoadPetInfo(AccountID);
          this.setState({ isEditingPet: null, showAddForm: false });
        } else {
          toast.error(response.errMessage || (showAddForm ? 'Tạo thú cưng thất bại!' : 'Cập nhật thú cưng thất bại!'));
        }
      } else {
        toast.error('Không thể kết nối MetaMask!');
      }
    } catch (e) {
      console.error(showAddForm ? 'Create Pet:' : 'Edit Pet:', e);
      toast.error(`Lỗi khi ${showAddForm ? 'tạo' : 'cập nhật'} thú cưng, vui lòng thử lại!`);
    }
    this.setState({ isLoading: false });
  };

  handleDeletePet = async (PetID) => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, deletePet: true } });
    const confirmDelete = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Bạn có chắc muốn xóa thú cưng này?</p>
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
          { autoClose: 2000, closeOnClick: false, onClose: () => this.setState({ disabledButtons: { ...this.state.disabledButtons, deletePet: false } }) }
        );
      });
    const isConfirmed = await confirmDelete();
    if (isConfirmed) {
      this.setState({ isLoading: true });
      try {
        const signer = await this.connectMetaMask();
        if (signer) {
          const response = await handleRemovePetApi(PetID, signer);
          if (response && response.errCode === 0) {
            toast.success('Xóa thú cưng thành công!');
            await this.handleLoadPetInfo(this.state.AccountID);
          } else {
            toast.error(response.errMessage || 'Xóa thú cưng thất bại!');
          }
        } else {
          toast.error('Không thể kết nối MetaMask!');
        }
      } catch (e) {
        console.error('Delete Pet:', e);
        toast.error('Lỗi khi xóa thú cưng, vui lòng thử lại!');
      }
    }
    this.setState({ isLoading: false });
  };

  printPetQRCode = async (PetID) => {
    try {
      const petResponse = await handleGetPetInfoApi(this.state.AccountID, PetID);
      const accountResponse = await handleGetAccountInfoApi(this.state.AccountID);
      if (petResponse && accountResponse && petResponse.errCode === 0 && accountResponse.errCode === 0) {
        const { Age, PetGender, PetImage, PetName, PetType, PetWeight } = petResponse.data;
        const { UserName, Phone } = accountResponse.data;
        const qrData = {
          UserName,
          Phone,
          Age,
          PetGender,
          PetImage,
          PetName,
          PetType,
          PetWeight,
        };
        // Create image with canvas
        const createPetInfoImage = async () => {
          return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 550;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, 380, 530); // Adjusted height
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            const petNameWidth = ctx.measureText(qrData.PetName).width;
            ctx.fillText(qrData.PetName, (canvas.width - petNameWidth) / 2, 50);
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = qrData.PetImage;
            img.onload = () => {
              ctx.drawImage(img, 50, 80, 300, 300);
              ctx.font = '16px Arial';
              ctx.fillText(`Chủ sở hữu: ${qrData.UserName}`, 50, 410);
              ctx.fillText(`SĐT: ${qrData.Phone}`, 50, 430);
              ctx.font = '14px Arial';
              ctx.fillText(`Giống: ${qrData.PetType}`, 50, 460);
              ctx.fillText(`${qrData.Age} tháng tuổi`, 50, 480);
              const genderText = this.state.codePetGender.find((gender) => gender.Code === qrData.PetGender)?.CodeValueVI || qrData.PetGender;
              ctx.fillText(`Giới tính: ${genderText}`, 220, 460);
              ctx.fillText(`Cân nặng: ${qrData.PetWeight / 10} kg`, 220, 480);
              canvas.toBlob((blob) => {
                const file = new File([blob], `pet_info_${PetID}.png`, { type: 'image/png' });
                resolve(file);
              }, 'image/png');
            };
            img.onerror = () => {
              console.error('Lỗi tải ảnh thú cưng');
              resolve(null);
            };
          });
        };
        const imageFile = await createPetInfoImage();
        if (!imageFile) {
          console.error('Không thể tạo hình ảnh');
          return;
        }
        const uploadResult = await uploadImageToCloudinaryApi(imageFile);
        if (uploadResult.errCode === 0) {
          const imageUrl = uploadResult.data.secure_url;
          const qrCodeDataUrl = await QRCode.toDataURL(imageUrl, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H',
          });
          const downloadLink = document.createElement('a');
          downloadLink.href = qrCodeDataUrl;
          downloadLink.download = `PetQR_${PetID}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } else {
          console.error('Tải ảnh thất bại:', uploadResult.errMessage);
        }
      } else {
        console.error('Lỗi lấy thông tin');
      }
    } catch (error) {
      console.error('Lỗi tạo QR code:', error);
    }
  };

  handleGoBack = () => {
    this.props.navigate('/home');
  };

  render() {
    const { isLoading, loadedPetInfo, codePetType, codePetGender, isEditingPet, limitPetCount, showAddForm, disabledButtons, petImages } = this.state;

    return (
      <div className="pet-page">
        <ToastContainer autoClose={500} newestOnTop={true} closeOnClick={false} pauseOnFocusLoss={false} draggable={true} transition={Slide} limit={1} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="pet-container">
            <div className="pet-header">
              <div onClick={this.handleGoBack}>
                <IonIcon icon={arrowBackOutline}></IonIcon>
                <b>Trở lại</b>
              </div>
              {loadedPetInfo.length < limitPetCount && (
                <button onClick={this.handleAddPet} disabled={disabledButtons.addPet}>
                  <b>+</b>
                </button>
              )}
            </div>
            <div className="pet-main-content">
              {showAddForm && (
                <div className="f">
                  <div className="pet-main-content-add f">
                    <div className="pet-main-content-add-img">
                      {petImages[0] ? (
                        <div style={{ position: 'relative' }}>
                          <img src={petImages[0].Image} alt="Pet" />
                          <div className="pet-main-content-pet-img-del">
                            <button onClick={() => this.handleRemoveImage(0)}>
                              <b>x</b>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => this.fileInputRefs[0].click()}>
                          <b>+</b>
                        </button>
                      )}
                      <input type="file" accept="image/*" style={{ display: 'none' }} ref={(ref) => (this.fileInputRefs[0] = ref)} onChange={(e) => this.handleAddImage(0, e)} />
                    </div>
                    <div className="pet-main-content-add-info f">
                      <div className="pet-main-content-add-info-name">
                        <b>Tên Thú Cưng: </b>
                        <br />
                        <input type="text" value={loadedPetInfo[0]?.PetName || ''} onChange={(e) => this.handlePetChange(0, 'PetName', e.target.value)} />
                      </div>
                      <div>
                        <b>Giống: </b>
                        <br />
                        <select value={loadedPetInfo[0]?.PetType || ''} onChange={(e) => this.handlePetChange(0, 'PetType', e.target.value)}>
                          {codePetType.map((type) => (
                            <option key={type.Code} value={type.Code}>
                              {type.CodeValueVI}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <b>Cân nặng (kg): </b>
                        <br />
                        <input type="number" value={loadedPetInfo[0]?.PetWeight || ''} onChange={(e) => this.handlePetChange(0, 'PetWeight', e.target.value)} />
                      </div>
                      <div>
                        <b>Tuổi (Tháng): </b>
                        <br />
                        <input type="number" value={loadedPetInfo[0]?.Age || ''} onChange={(e) => this.handlePetChange(0, 'Age', e.target.value)} />
                      </div>
                      <div className="pet-main-content-add-info-gender">
                        <b>Giới tính: </b>
                        <br />
                        <select value={loadedPetInfo[0]?.PetGender || ''} onChange={(e) => this.handlePetChange(0, 'PetGender', e.target.value)}>
                          {codePetGender.map((gender) => (
                            <option key={gender.Code} value={gender.Code}>
                              {gender.CodeValueVI}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pet-main-content-add-button-list">
                    <button className="pet-main-content-confirm-button" onClick={() => this.handleSavePet(0)} disabled={disabledButtons.savePet}>
                      <IonIcon icon={checkmarkCircleOutline}></IonIcon>
                      <b>Xác nhận</b>
                    </button>
                    <br />
                    <button className="pet-main-content-cancel-button" onClick={this.handleCancelPet} disabled={disabledButtons.cancelPet}>
                      <IonIcon icon={closeCircleOutline}></IonIcon>
                      <b>Hủy</b>
                    </button>
                  </div>
                </div>
              )}
              <div className="pet-main-content-pet-list">
                {loadedPetInfo.map((pet, index) =>
                  showAddForm && index === 0 ? null : (
                    <div key={pet.PetID} className="f">
                      <div className="pet-main-content f">
                        <div className="pet-main-content-pet-info">
                          {isEditingPet === index ? (
                            <>
                              <div className="f">
                                <div className="pet-main-content-pet-info-name">
                                  <b>Tên Thú Cưng: </b>
                                  <br />
                                  <input type="text" value={pet.PetName} onChange={(e) => this.handlePetChange(index, 'PetName', e.target.value)} />
                                </div>
                                <div>
                                  <b>Cân nặng (kg): </b>
                                  <br />
                                  <input type="number" value={pet.PetWeight} onChange={(e) => this.handlePetChange(index, 'PetWeight', e.target.value)} />
                                </div>
                              </div>
                              <div className="f">
                                <div>
                                  <b>Tuổi (Tháng): </b>
                                  <br />
                                  <input type="number" value={pet.Age} onChange={(e) => this.handlePetChange(index, 'Age', e.target.value)} />
                                </div>
                                <div>
                                  <b>Giống: </b>
                                  <br />
                                  <select value={pet.PetType} onChange={(e) => this.handlePetChange(index, 'PetType', e.target.value)}>
                                    {codePetType.map((type) => (
                                      <option key={type.Code} value={type.Code}>
                                        {type.CodeValueVI}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="pet-main-content-pet-info-gender">
                                  <b>Giới tính: </b>
                                  <br />
                                  <select value={pet.PetGender} onChange={(e) => this.handlePetChange(index, 'PetGender', e.target.value)}>
                                    {codePetGender.map((gender) => (
                                      <option key={gender.Code} value={gender.Code}>
                                        {gender.CodeValueVI}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="f">
                                <div className="pet-main-content-pet-info-name">
                                  <b>Tên Thú Cưng: </b>
                                  <br />
                                  <p>{pet.PetName}</p>
                                </div>
                                <div>
                                  <b>Cân nặng (kg): </b>
                                  <br />
                                  <p>{pet.PetWeight} kg</p>
                                </div>
                              </div>
                              <div className="f">
                                <div>
                                  <b>Tuổi (Tháng): </b>
                                  <br />
                                  <p>{pet.Age} tháng</p>
                                </div>
                                <div>
                                  <b>Giống: </b>
                                  <br />
                                  <p>{codePetType.find((type) => type.Code === pet.PetType)?.CodeValueVI || pet.PetType}</p>
                                </div>
                                <div className="pet-main-content-pet-info-gender">
                                  <b>Giới tính: </b>
                                  <br />
                                  <p>{codePetGender.find((gender) => gender.Code === pet.PetGender)?.CodeValueVI || pet.PetGender}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="pet-main-content-pet-img">
                          {isEditingPet === index ? (
                            <>
                              {petImages[index] || (pet.PetImage && pet.PetImage !== defPetImage) ? (
                                <div style={{ position: 'relative' }}>
                                  <img src={petImages[index] ? petImages[index].Image : pet.PetImage} alt="Pet" />
                                  <div className="pet-main-content-pet-img-del">
                                    <button onClick={() => this.handleRemoveImage(index)}>
                                      <b>x</b>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => this.fileInputRefs[index].click()}>
                                  <b>+</b>
                                </button>
                              )}
                              <input type="file" accept="image/*" style={{ display: 'none' }} ref={(ref) => (this.fileInputRefs[index] = ref)} onChange={(e) => this.handleAddImage(index, e)} />
                            </>
                          ) : (
                            <img src={petImages[index] ? petImages[index].Image : pet.PetImage || defPetImage} alt="Pet" />
                          )}
                          {/* <button className="pet-main-content-pet-img-qr" onClick={() => this.printPetQRCode(pet.PetID)}>
                            <IonIcon icon={qrCodeOutline}></IonIcon>
                          </button> */}
                        </div>
                      </div>
                      <div className="pet-main-content-pet-button-list">
                        {isEditingPet === index ? (
                          <>
                            <button className="pet-main-content-save-button" onClick={() => this.handleSavePet(index)} disabled={disabledButtons.savePet}>
                              <IonIcon icon={checkmarkCircleOutline}></IonIcon>
                              <b>Lưu</b>
                            </button>
                            <br />
                            <button className="pet-main-content-cancel-edit-button" onClick={this.handleCancelPet} disabled={disabledButtons.cancelPet}>
                              <IonIcon icon={closeCircleOutline}></IonIcon>
                              <b>Hủy</b>
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="pet-main-content-edit-button" onClick={() => this.handleEditPet(index)} disabled={isEditingPet !== null || showAddForm}>
                              <IonIcon icon={buildOutline}></IonIcon>
                              <b>Sửa</b>
                            </button>
                            <br />
                            <button className="pet-main-content-delete-button" onClick={() => this.handleDeletePet(pet.PetID)} disabled={disabledButtons.deletePet}>
                              <IonIcon icon={trashBinOutline}></IonIcon>
                              <b>Xóa </b>
                            </button>
                            <button className="pet-main-content-qr-button" onClick={() => this.printPetQRCode(pet.PetID)}>
                              <IonIcon icon={qrCodeOutline}></IonIcon>
                              <b>Lấy QR </b>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Pet);
