import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import {} from "ionicons/icons"; //chỉ import các icon cần dùng
import "./OwnerCreateBannerModal.scss";
import bannertest from "../../assets/bannerimgs/1.webp";

class OwnerCreateBannerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  toggle = () => {
    this.props.toggleFromModal();
  };

  render() {
    return (
      <Modal
        show={this.props.isOpen}
        onHide={this.toggle}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm hình ảnh Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="create-banner-modal">
            <div className="modal-content">
              <div className="modal-content-add-img">
                <p>Thêm hình ảnh:</p>
                <img src={bannertest} />
                <button>+</button>
              </div>
              <div className="modal-content-add-source">
                <p>Thêm mã sản phẩm:</p>
                <input type="text" placeholder="Hãy nhập mã sản phẩm" />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.toggle}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default OwnerCreateBannerModal;
