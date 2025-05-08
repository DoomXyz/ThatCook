import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { IonIcon } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import "./OwnerEditDetailModal.scss";

class OwnerEditDetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalChiTietSanPham: this.sanitizeChiTietSanPham(props.chiTietSanPham),
      errors: {},
    };
  }

  sanitizeChiTietSanPham = (chiTietSanPham) => {
    if (!Array.isArray(chiTietSanPham)) {
      return [];
    }
    if (chiTietSanPham.length === 0) {
      return [];
    }
    const sanitized = chiTietSanPham.map((item) => ({
      tenCTSP: item.tenCTSP || "",
      giaThem: item.giaThem !== undefined && item.giaThem !== "" ? String(item.giaThem) : "",
      soLuongTon: item.soLuongTon !== undefined && item.soLuongTon !== "" ? String(item.soLuongTon) : "0",
    }));
    return sanitized;
  };

  componentDidUpdate(prevProps) {
    if (this.props.isOpen) {
      const prevChiTiet = JSON.stringify(prevProps.chiTietSanPham);
      const currentChiTiet = JSON.stringify(this.props.chiTietSanPham);
      if (prevChiTiet !== currentChiTiet) {
        this.setState({
          modalChiTietSanPham: this.sanitizeChiTietSanPham(this.props.chiTietSanPham),
        });
      }
    }
  }

  handleChiTietChange = (index, field, value) => {
    this.setState((prevState) => {
      const newChiTiet = [...prevState.modalChiTietSanPham];
      newChiTiet[index] = { ...newChiTiet[index], [field]: value };
      return {
        modalChiTietSanPham: newChiTiet,
        errors: { ...prevState.errors, [`chiTiet_${index}_${field}`]: "" },
      };
    });
  };

  handleRemoveChiTiet = (index) => {
    this.setState((prevState) => ({
      modalChiTietSanPham: prevState.modalChiTietSanPham.filter((_, i) => i !== index),
    }));
  };

  checkValidateInput = () => {
    let errors = {};
    const { modalChiTietSanPham } = this.state;

    if (modalChiTietSanPham.length === 0) {
      errors.chiTietSanPham = "Vui lòng giữ ít nhất 1 chi tiết sản phẩm!";
    } else {
      modalChiTietSanPham.forEach((item, index) => {
        if (!item.tenCTSP) {
          errors[`chiTiet_${index}_tenCTSP`] = "Tên chi tiết không được để trống!";
        } else {
          const regex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;
          if (!regex.test(item.tenCTSP.trim())) {
            errors[`chiTiet_${index}_tenCTSP`] = "Tên chi tiết không hợp lệ!";
          }
        }
        if (item.soLuongTon === "" || item.soLuongTon === undefined) {
          errors[`chiTiet_${index}_soLuongTon`] = "Số lượng tồn không được để trống!";
        } else if (isNaN(item.soLuongTon) || parseInt(item.soLuongTon) < 0) {
          errors[`chiTiet_${index}_soLuongTon`] = "Số lượng tồn phải lớn hơn hoặc bằng 0!";
        }
        if (item.giaThem !== "" && item.giaThem !== undefined && (isNaN(item.giaThem) || parseFloat(item.giaThem) < 0)) {
          errors[`chiTiet_${index}_giaThem`] = "Giá thêm phải lớn hơn hoặc bằng 0!";
        }
      });
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  toggle = () => {
    this.props.toggleFromModal();
  };

  handleSave = () => {
    if (!this.checkValidateInput()) {
      Object.values(this.state.errors).forEach((error) => {
        if (error) toast.error(error);
      });
      return;
    }

    const sanitizedChiTiet = this.state.modalChiTietSanPham.map((item) => ({
      tenCTSP: item.tenCTSP.trim(),
      giaThem: item.giaThem ? parseFloat(item.giaThem) : null,
      soLuongTon: parseInt(item.soLuongTon),
    }));

    this.props.updateChiTietSanPham(sanitizedChiTiet);
    this.toggle();
  };

  render() {
    const { modalChiTietSanPham, errors } = this.state;

    return (
      <Modal
        key={`${this.props.isOpen}-${JSON.stringify(this.props.chiTietSanPham)}`}
        show={this.props.isOpen}
        onHide={this.toggle}
        centered
        backdrop="static"
        className="edit-detail-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Danh sách loại sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="edit-detail-modal-content">
            <table>
              <thead>
                <tr>
                  <th>Tên loại</th>
                  <th>Giá thêm</th>
                  <th>Kho</th>
                  <th></th>
                </tr>
              </thead>
              <tbody key={modalChiTietSanPham.length}>
                {modalChiTietSanPham.length > 0 ? (
                  modalChiTietSanPham.map((item, index) => (
                    <tr key={index} className="edit-detail-modal-content-item">
                      <td>
                        <input
                          type="text"
                          value={item.tenCTSP}
                          onChange={(e) => this.handleChiTietChange(index, "tenCTSP", e.target.value)}
                        />
                        <span className="error">{errors[`chiTiet_${index}_tenCTSP`]}</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.giaThem}
                          onChange={(e) => this.handleChiTietChange(index, "giaThem", e.target.value)}
                        />
                        <span className="error">{errors[`chiTiet_${index}_giaThem`]}</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.soLuongTon}
                          onChange={(e) => this.handleChiTietChange(index, "soLuongTon", e.target.value)}
                        />
                        <span className="error">{errors[`chiTiet_${index}_soLuongTon`]}</span>
                      </td>
                      <td>
                        <button onClick={() => this.handleRemoveChiTiet(index)}>
                          <IonIcon icon={closeOutline}></IonIcon>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">Chưa có chi tiết sản phẩm</td>
                  </tr>
                )}
              </tbody>
            </table>
            <span className="error">{errors.chiTietSanPham}</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.handleSave}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default OwnerEditDetailModal;