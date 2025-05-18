import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './PetSelectModal.scss';
import { handleGetAccountPetInfoApi } from '../../services/petServices';

class PetSelectModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadedPetInfo: [],
            isLoading: false,
            accountid: this.props.accountid || '',
        };
    }

    async componentDidUpdate(prevProps) {
        if (this.props.isOpen && !prevProps.isOpen) {
            await this.loadPetInfo();
        }
        if (this.props.accountid !== prevProps.accountid) {
            this.setState({ accountid: this.props.accountid || '' }, this.loadPetInfo);
        }
    }

    loadPetInfo = async () => {
        const { accountid } = this.state;
        if (!accountid) {
            toast.error('Thiếu mã tài khoản để tải danh sách thú cưng!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
            return;
        }
        try {
            this.setState({ isLoading: true });
            const response = await handleGetAccountPetInfoApi(accountid);
            if (response && response.errCode === 0) {
                this.setState({
                    loadedPetInfo: response.data || [],
                    isLoading: false,
                });
            } else {
                toast.error(response?.errMessage || 'Không thể tải danh sách thú cưng!', {
                    position: 'top-right',
                    autoClose: 500,
                    closeOnClick: true,
                });
                this.setState({ loadedPetInfo: [], isLoading: false });
            }
        } catch (e) {
            toast.error('Lỗi khi tải danh sách thú cưng!', {
                position: 'top-right',
                autoClose: 500,
                closeOnClick: true,
            });
            this.setState({ loadedPetInfo: [], isLoading: false });
        }
    };

    handleSelectPet = (petID) => {
        this.props.handleSelectPetFromModal(petID);
        this.props.toggleFromModal();
    };

    render() {
        const { isOpen, toggleFromModal } = this.props;
        const { loadedPetInfo, isLoading } = this.state;

        return (
            <Modal show={isOpen} onHide={toggleFromModal} centered backdrop="static" className="pet-select-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Chọn Thú Cưng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <p className="text-center">Đang tải...</p>
                    ) : (
                        <div className="pet-select-table">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Tên Thú Cưng</th>
                                        <th>Loại</th>
                                        <th>Giới Tính</th>
                                        <th>Tuổi</th>
                                        <th>Cân Nặng</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadedPetInfo.length > 0 ? (
                                        loadedPetInfo.map((pet) => (
                                            <tr key={pet.PetID}>
                                                <td>{pet.PetName}</td>
                                                <td>{pet.PetType}</td>
                                                <td>{pet.PetGender}</td>
                                                <td>{pet.Age}</td>
                                                <td>{pet.PetWeight} kg</td>
                                                <td>
                                                    <button className="btn btn-primary btn-sm" onClick={() => this.handleSelectPet(pet.PetID)}>
                                                        Chọn
                                                    </button>
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
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleFromModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default PetSelectModal;