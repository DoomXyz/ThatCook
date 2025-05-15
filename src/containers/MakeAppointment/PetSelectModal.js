import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './PetSelectModal.scss';

class PetSelectModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadedPetInfo: [],
            isLoading: false,
        };
    }

    async componentDidMount() {
    }

    async componentDidUpdate(prevProps) {
        if (this.props.isOpen && !prevProps.isOpen) {
        }
    }

    handleSelectPet = (petID) => {
        this.props.handleSelectPetFromModal(petID);
    };

    render() {
        const { isOpen } = this.props;
        const { loadedPetInfo, isLoading } = this.state;

        return (
            <Modal show={isOpen} onHide={this.props.toggleFromModal} centered backdrop="static" className="pet-select-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Chọn Thú Cưng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <p>Đang tải...</p>
                    ) : (
                        <div className="pet-select-table">
                            <table className="table">
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
                                                <td>{pet.Weight} kg</td>
                                                <td>
                                                    <button className="select-btn" onClick={() => this.handleSelectPet(pet.PetID)}>
                                                        Chọn
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">Không có thú cưng nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.toggleFromModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default PetSelectModal;