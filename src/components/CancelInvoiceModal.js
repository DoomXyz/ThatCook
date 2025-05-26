import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ToastContainer, toast } from 'react-toastify';
import './CancelInvoiceModal.scss';
import { handleGetAllCodesApi } from '../services/utilitiesServices';

class CancelInvoiceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codeCancelReason: [],
      selectedReason: '',
      customReason: '',
    };
  }

  async componentDidMount() {
    await this.handleLoadCodeCancelReason();
  }

  handleLoadCodeCancelReason = async () => {
    try {
      const codeCancelReason = await handleGetAllCodesApi('CancelReason');
      if (!codeCancelReason || codeCancelReason.length === 0) {
        toast.error('Không thể tải danh sách lý do hủy!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      // Sắp xếp để "OTHER" là cuối cùng
      const sortedReasons = codeCancelReason.sort((a, b) => {
        if (a.Code === 'OTHER') return 1;
        if (b.Code === 'OTHER') return -1;
        return 0;
      });
      this.setState({ codeCancelReason: sortedReasons });
    } catch (e) {
      console.error('Error loading cancel reason codes:', e);
      toast.error('Lỗi khi tải danh sách lý do hủy!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleReasonSelect = (e) => {
    this.setState({ selectedReason: e.target.value, customReason: '' });
  };

  handleCustomReasonChange = (e) => {
    this.setState({ customReason: e.target.value });
  };

  handleConfirm = async () => {
    const { selectedReason, customReason, codeCancelReason } = this.state;
    let cancelReason = '';
    if (selectedReason === 'OTHER') {
      if (!customReason.trim()) {
        toast.error('Vui lòng nhập lý do hủy đơn hàng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        return;
      }
      cancelReason = customReason;
    } else if (selectedReason) {
      const selectedCode = codeCancelReason.find((reason) => reason.Code === selectedReason);
      cancelReason = selectedCode ? selectedCode.CodeValueVI : '';
    } else {
      toast.error('Vui lòng chọn hoặc nhập lý do hủy đơn hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      return;
    }
    await this.props.handleCancelInvoiceFromModal(this.props.selectedCancelInvoiceID, cancelReason);
  };

  toggle = () => {
    this.setState({ selectedReason: '', customReason: '' });
    this.props.toggleFromModal();
  };

  render() {
    const { isOpen, selectedCancelInvoiceID } = this.props;
    const { codeCancelReason, selectedReason, customReason } = this.state;

    return (
      <Modal show={isOpen} onHide={this.toggle} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Hủy đơn hàng {selectedCancelInvoiceID ? `#${selectedCancelInvoiceID}` : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng chọn hoặc nhập lý do hủy đơn hàng:</p>
          <div className="reason-options">
            {codeCancelReason.map((reason, index) => (
              <label key={index} className="d-block mb-2">
                <input type="radio" name="reason" value={reason.Code} checked={selectedReason === reason.Code} onChange={this.handleReasonSelect} className="me-2" />
                {reason.CodeValueVI}
              </label>
            ))}
          </div>
          {selectedReason === 'OTHER' && <textarea placeholder="Nhập lý do hủy đơn hàng" value={customReason} onChange={this.handleCustomReasonChange} rows="4" className="form-control mt-3" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleConfirm}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CancelInvoiceModal;
