import React, { Component } from 'react';
import { toast } from 'react-toastify';

import './PetSelectModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { handleGetAccountPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi, handleRemovePetApi } from '../../services/petServices';

import { getAllCodes, validatePetInput } from '../../utils/pakage'

class PetSelectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedPetInfo: [],
      accountid: '',
      codePetGender: [],
      codePetType: [],
      isEditingPet: null,
      isAddingPet: false,
      limitPetCount: 3,
      disabledButtons: {
        addPet: false,
        savePet: false,
        cancelPet: false,
        deletePet: false,
      },
    };
  }
  async componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      await this.handleLoadPetInfo();
      this.setState({ accountid: this.props.accountID || '' }, this.handleLoadPetInfo);
    }
  }
  handleLoadCode = async (codeTypes) => {
    try {
      const responses = await Promise.all(codeTypes.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypes.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        newState[type.toLowerCase()] = response.data.length > 0 ? response.data[0].Code : '';
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  resetState = async () => {
    this.setState({
      isEditingPet: null,
      isAddingPet: false,
    });
    await this.handleLoadCode(['PetType', 'PetGender']);
  };
  handleEditPet = (index) => {
    if (this.state.isAddingPet || this.state.isEditingPet !== null) {
      toast.error('Vui lòng lưu hoặc hủy hành động hiện tại trước khi chỉnh sửa thú cưng khác!');
      return;
    }
    this.setState({ isEditingPet: index, isAddingPet: false });
  };
  handleAddPet = () => {
    if (this.state.isAddingPet || this.state.isEditingPet !== null) {
      const confirmAddNew = () =>
        new Promise((resolve) => {
          toast(
            <div>
              <p>{this.state.isAddingPet ? 'Bạn đang thêm thú cưng chưa lưu. Lưu hoặc hủy trước khi thêm thú cưng mới?' : 'Bạn có thay đổi thú cưng chưa lưu. Hủy thay đổi và thêm thú cưng mới?'}</p>
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
            }
          );
        });
      confirmAddNew().then((isConfirmed) => {
        if (isConfirmed) {
          this.setState(
            {
              isEditingPet: null,
              isAddingPet: false,
            },
            async () => {
              await this.handleLoadPetInfo();
              this.setState((prevState) => ({
                loadedPetInfo: [
                  {
                    PetID: `temp_${Date.now()}`,
                    PetName: '',
                    PetType: prevState.codePetType[0]?.Code || '',
                    PetGender: prevState.codePetGender[0]?.Code || '',
                    Age: '',
                    PetWeight: '',
                  },
                  ...prevState.loadedPetInfo,
                ],
                isEditingPet: 0,
                isAddingPet: true,
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
          },
          ...prevState.loadedPetInfo,
        ],
        isEditingPet: 0,
        isAddingPet: true,
      }));
    }
  };
  handleCancelPet = () => {
    this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelPet: true } });
    const confirmCancel = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>{this.state.isAddingPet ? 'Bạn đang thêm thú cưng chưa lưu. Hủy thú cưng này?' : 'Bạn có thay đổi thú cưng chưa lưu. Hủy thay đổi?'}</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, cancelPet: false } }); },
          }
        );
      });

    confirmCancel().then((isConfirmed) => {
      if (isConfirmed) {
        this.setState(
          (prevState) => {
            if (prevState.isAddingPet && prevState.isEditingPet === 0) {
              return {
                loadedPetInfo: prevState.loadedPetInfo.slice(1),
                isEditingPet: null,
                isAddingPet: false,
              };
            }
            return {
              isEditingPet: null,
              isAddingPet: false,
            };
          },
          async () => {
            await this.handleLoadPetInfo();
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
    const petInfo = this.state.loadedPetInfo[index]
    const newPetInfo = {
      petname: petInfo.PetName,
      pettype: petInfo.PetType,
      petgender: petInfo.PetGender,
      petweight: petInfo.PetWeight,
      age: petInfo.Age
    }
    const isValidatePetInput = await validatePetInput(newPetInfo);
    if (!isValidatePetInput.valid) {
      toast.error(`${isValidatePetInput.errMessage} tại dòng ${index + 1}`);
      return;
    }
    this.setState({ disabledButtons: { ...this.state.disabledButtons, savePet: true } });
    const confirmSave = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận lưu thông tin thú cưng?</p>
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
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, savePet: false } }); },
          }
        );
      });

    const isConfirmed = await confirmSave();
    if (!isConfirmed) return;

    try {
      const pet = this.state.loadedPetInfo[index];
      const petInfo = {
        petname: pet.PetName.trim(),
        pettype: pet.PetType,
        petgender: pet.PetGender,
        age: parseInt(pet.Age),
        petweight: parseFloat(pet.PetWeight),
      };
      let response;
      if (this.state.isAddingPet) {
        response = await handleSavePetInfoApi(this.state.accountid, petInfo);
      } else {
        response = await handleChangePetInfoApi(pet.PetID, petInfo);
      }

      if (response && response.errCode === 0) {
        toast.success(this.state.isAddingPet ? 'Tạo thú cưng thành công!' : 'Cập nhật thú cưng thành công!');
        await this.handleLoadPetInfo();
        this.setState({
          isEditingPet: null,
          isAddingPet: false,
        });
        this.props.onPetListChange();
      } else {
        toast.error(response?.errMessage || (this.state.isAddingPet ? 'Tạo thú cưng thất bại!' : 'Cập nhật thú cưng thất bại!'));
      }
    } catch (e) {
      console.error(this.state.isAddingPet ? 'Create Pet:' : 'Edit Pet:', e);
      toast.error(`Lỗi khi ${this.state.isAddingPet ? 'tạo' : 'cập nhật'} thú cưng, vui lòng thử lại!`);
    }
  };
  handleDeletePet = async (petid) => {
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
          {
            autoClose: 2000,
            closeOnClick: false,
            onClose: () => { this.setState({ disabledButtons: { ...this.state.disabledButtons, deletePet: false } }); },
          }
        );
      });

    const isConfirmed = await confirmDelete();
    if (isConfirmed) {
      try {
        const response = await handleRemovePetApi(petid);
        if (response && response.errCode === 0) {
          toast.success('Xóa thú cưng thành công!');
          await this.handleLoadPetInfo();
          this.props.onPetListChange();
        } else {
          toast.error(response?.errMessage || 'Xóa thú cưng thất bại!');
        }
      } catch (e) {
        console.error('Error deleting pet:', e);
        toast.error('Lỗi khi xóa thú cưng, vui lòng thử lại!');
      }
    }
  };
  handleLoadPetInfo = async () => {
    const { accountid } = this.state;
    try {
      const response = await handleGetAccountPetInfoApi(accountid);
      if (response && response.errCode === 0) {
        this.setState({
          loadedPetInfo: response.data || [],
        });
      }
    } catch (e) {
      toast.error('Lỗi khi tải danh sách thú cưng!');
      this.setState({ loadedPetInfo: [] });
    }
  };
  handleSelectPet = (petID) => {
    this.props.handleSelectPetFromModal(petID);
    this.resetState();
    this.props.toggleFromModal();
  };
  render() {
    const { isOpen, toggleFromModal } = this.props;
    const { loadedPetInfo, codePetType, codePetGender, isEditingPet, isAddingPet, limitPetCount, disabledButtons } = this.state;
    return (
      <Modal
        show={isOpen}
        onHide={() => {
          this.resetState();
          toggleFromModal();
        }}
        centered
        backdrop="static"
        className="pet-select-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p>Chọn Thú Cưng</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadedPetInfo.length < limitPetCount && !isAddingPet && isEditingPet === null && (
            <div className="pet-select-add">
              <button className="btn btn-success btn-sm" onClick={this.handleAddPet}>
                Thêm Thú Cưng
              </button>
            </div>
          )}
          <div className="pet-select-table">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Tên Thú Cưng</th>
                  <th>Loại</th>
                  <th>Giới Tính</th>
                  <th>Tuổi (tháng)</th>
                  <th>Cân Nặng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loadedPetInfo.length > 0 ? (
                  loadedPetInfo.map((pet, index) => (
                    <tr key={pet.PetID}>
                      <td>{isEditingPet === index ? <input type="text" value={pet.PetName} onChange={(e) => this.handlePetChange(index, 'PetName', e.target.value)} /> : pet.PetName}</td>
                      <td>
                        {isEditingPet === index ? (
                          <select value={pet.PetType} onChange={(e) => this.handlePetChange(index, 'PetType', e.target.value)}>
                            {codePetType.map((type) => (
                              <option key={type.Code} value={type.Code}>
                                {type.CodeValueVI}
                              </option>
                            ))}
                          </select>
                        ) : (
                          codePetType.find((type) => type.Code === pet.PetType)?.CodeValueVI || pet.PetType
                        )}
                      </td>
                      <td>
                        {isEditingPet === index ? (
                          <select value={pet.PetGender} onChange={(e) => this.handlePetChange(index, 'PetGender', e.target.value)}>
                            {codePetGender.map((gender) => (
                              <option key={gender.Code} value={gender.Code}>
                                {gender.CodeValueVI}
                              </option>
                            ))}
                          </select>
                        ) : (
                          codePetGender.find((gender) => gender.Code === pet.PetGender)?.CodeValueVI || pet.PetGender
                        )}
                      </td>
                      <td>{isEditingPet === index ? <input type="number" value={pet.Age} onChange={(e) => this.handlePetChange(index, 'Age', e.target.value)} /> : pet.Age}</td>
                      <td>{isEditingPet === index ? <input type="number" value={pet.PetWeight} onChange={(e) => this.handlePetChange(index, 'PetWeight', e.target.value)} /> : `${pet.PetWeight} kg`}</td>
                      <td>
                        {isEditingPet === index ? (
                          <>
                            <button className="btn btn-primary btn-sm pet-save-btn" onClick={() => this.handleSavePet(index)} disabled={disabledButtons.savePet}>
                              Lưu
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => this.handleCancelPet()} disabled={disabledButtons.cancelPet}>
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => this.handleSelectPet(pet.PetID)}>
                              Chọn
                            </button>
                            <button className="btn btn-warning btn-sm" onClick={() => this.handleEditPet(index)} disabled={isEditingPet !== null || isAddingPet}>
                              Sửa
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => this.handleDeletePet(pet.PetID)} disabled={isEditingPet !== null || isAddingPet || disabledButtons.deletePet}>
                              Xóa
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Không có thú cưng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              this.resetState();
              toggleFromModal();
            }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default PetSelectModal;
