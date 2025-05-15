import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './VeterinarianSelectModal.scss';
import { handleGetVeterinarianInfoApi } from '../../services/accountServices';

class VeterinarianSelectModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadedVeterinarianInfo: [],
            isLoading: false,
        };
    }

    async componentDidMount() {
    }

    async componentDidUpdate(prevProps) {
        if (this.props.isOpen && !prevProps.isOpen) {
        }
    }

    handleSelectVeterinarian = (vetID) => {
        this.props.handleSelectVeterinarianFromModal(vetID);
    };

    render() {
        const { isOpen } = this.props;
        const { loadedVeterinarianInfo, isLoading } = this.state;

        return (
            <Modal show={isOpen} onHide={this.props.toggleFromModal} centered backdrop="static" className="veterinarian-select-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Chọn Bác Sĩ Thú Y</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <p>Đang tải...</p>
                    ) : (
                        <div className="veterinarian-select-table">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tên Bác Sĩ</th>
                                        <th>Email</th>
                                        <th>Số Điện Thoại</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadedVeterinarianInfo.length > 0 ? (
                                        loadedVeterinarianInfo.map((vet) => (
                                            <tr key={vet.AccountID}>
                                                <td>{vet.VeterinarianName}</td>
                                                <td>{vet.Email}</td>
                                                <td>{vet.Phone}</td>
                                                <td>
                                                    <button className="select-btn" onClick={() => this.handleSelectVeterinarian(vet.AccountID)}>
                                                        Chọn
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">Không có bác sĩ thú y nào.</td>
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

export default VeterinarianSelectModal;