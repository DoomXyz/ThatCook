import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './PetSelectModal.scss';
import { handleGetAccountPetInfoApi, handleSavePetInfoApi, handleChangePetInfoApi, handleRemovePetApi } from '../../services/petServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';

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
        };
    }

    async componentDidMount() {
        await Promise.all([this.handleLoadCodePetType(), this.handleLoadCodePetGender()]);
    }
    async componentDidUpdate(prevProps) {
        if (this.props.isOpen && !prevProps.isOpen) {
            await this.handleLoadPetInfo();
            this.setState({ accountid: this.props.accountID || '' }, this.handleLoadPetInfo);
        }
    }

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
    handleLoadCodePetGender = async () => {
        try {
            const codePetGender = await handleGetAllCodesApi('PetGender');
            if (!codePetGender || codePetGender.length === 0) {
                toast.error('Không thể tải danh sách giới tính thú cưng!', {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
            }
            this.setState({ codePetGender });
        } catch (e) {
            console.error('Error loading pet gender code:', e);
            toast.error('Lỗi khi tải danh sách giới tính thú cưng!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
        }
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
                        { position: 'top-center', autoClose: 2000, closeOnClick: false }
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
    handleEditPet = (index) => {
        if (this.state.isAddingPet || this.state.isEditingPet !== null) {
            toast.error('Vui lòng lưu hoặc hủy hành động hiện tại trước khi chỉnh sửa thú cưng khác!', {
                position: 'top-right',
                autoClose: 1000,
                closeOnClick: true,
            });
            return;
        }
        this.setState({ isEditingPet: index, isAddingPet: false });
    };
    handleDeletePet = async (petid) => {
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
                    { position: 'top-center', autoClose: 1000, closeOnClick: false }
                );
            });

        const isConfirmed = await confirmDelete();
        if (isConfirmed) {
            try {
                const response = await handleRemovePetApi(petid);
                if (response && response.errCode === 0) {
                    toast.success('Xóa thú cưng thành công!', {
                        position: 'top-right',
                        autoClose: 500,
                        closeOnClick: true,
                    });
                    await this.handleLoadPetInfo();
                } else {
                    toast.error(response?.errMessage || 'Xóa thú cưng thất bại!', {
                        position: 'top-right',
                        autoClose: 500,
                        closeOnClick: true,
                    });
                }
            } catch (e) {
                console.error('Error deleting pet:', e);
                toast.error('Lỗi khi xóa thú cưng, vui lòng thử lại!', {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
            }
        }
    };
    handleSavePet = async (index) => {
        const validation = this.checkValidatePet(index);
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
                    { position: 'top-center', autoClose: 1000, closeOnClick: false }
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
                toast.success(this.state.isAddingPet ? 'Tạo thú cưng thành công!' : 'Cập nhật thú cưng thành công!', {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
                await this.handleLoadPetInfo();
                this.setState({
                    isEditingPet: null,
                    isAddingPet: false,
                });
            } else {
                toast.error(response?.errMessage || (this.state.isAddingPet ? 'Tạo thú cưng thất bại!' : 'Cập nhật thú cưng thất bại!'), {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
            }
        } catch (e) {
            console.error(this.state.isAddingPet ? 'Create Pet:' : 'Edit Pet:', e);
            toast.error(`Lỗi khi ${this.state.isAddingPet ? 'tạo' : 'cập nhật'} thú cưng, vui lòng thử lại!`, {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
        }
    };

    handlePetChange = (index, field, value) => {
        this.setState((prevState) => {
            const newPets = [...prevState.loadedPetInfo];
            newPets[index] = { ...newPets[index], [field]: value };
            return { loadedPetInfo: newPets };
        });
    };

    checkValidatePet = (index) => {
        const item = this.state.loadedPetInfo[index];
        if (!item.PetName) return { errCode: -1, errMessage: `Tên thú cưng tại dòng ${index + 1} không được để trống!` };
        const petNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
        if (!petNameRegex.test(item.PetName.trim())) return { errCode: -1, errMessage: `Tên thú cưng tại dòng ${index + 1} không hợp lệ (2-50 ký tự)!` };
        if (!item.PetType) return { errCode: -1, errMessage: `Loại thú cưng tại dòng ${index + 1} không được để trống!` };
        if (!item.PetGender) return { errCode: -1, errMessage: `Giới tính thú cưng tại dòng ${index + 1} không được để trống!` };
        if (!item.Age || isNaN(item.Age) || parseInt(item.Age) < 0 || parseInt(item.Age) > 999) return { errCode: -1, errMessage: `Tuổi thú cưng tại dòng ${index + 1} không hợp lệ (0-999)!` };
        if (!item.PetWeight || isNaN(item.PetWeight) || parseFloat(item.PetWeight) <= 0 || parseFloat(item.PetWeight) > 999.99) return { errCode: -1, errMessage: `Cân nặng thú cưng tại dòng ${index + 1} không hợp lệ (0.01-999.99)!` };
        return { errCode: 0, errMessage: 'Kiểm tra thành công!' };
    };



    handleCancelPet = () => {
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
                    { position: 'top-center', autoClose: 2000, closeOnClick: false }
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
            toast.error('Lỗi khi tải danh sách thú cưng!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
            this.setState({ loadedPetInfo: [] });
        }
    };

    resetState = () => {
        this.setState({
            isEditingPet: null,
            isAddingPet: false,
        });
    };

    handleSelectPet = (petID) => {
        this.props.handleSelectPetFromModal(petID);
        this.resetState();
        this.props.toggleFromModal();
    };

    render() {
        const { isOpen, toggleFromModal } = this.props;
        const { loadedPetInfo, codePetType, codePetGender, isEditingPet, isAddingPet, limitPetCount } = this.state;

        return (
            <Modal show={isOpen}
                onHide={() => {
                    this.resetState();
                    toggleFromModal();
                }}
                centered backdrop="static"
                className="pet-select-modal">
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
                                    <th>Action</th>
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
                                                        <button className="btn btn-primary btn-sm pet-save-btn" onClick={() => this.handleSavePet(index)}>
                                                            Lưu
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => this.handleCancelPet()}>
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
                                                        <button className="btn btn-danger btn-sm" onClick={() => this.handleDeletePet(pet.PetID)} disabled={isEditingPet !== null || isAddingPet}>
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
                    <Button variant="secondary"
                        onClick={() => {
                            this.resetState();
                            toggleFromModal();
                        }}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default PetSelectModal;