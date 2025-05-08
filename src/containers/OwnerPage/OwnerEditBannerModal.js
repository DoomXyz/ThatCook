import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IonIcon } from "@ionic/react"; //import thư viện icon
import { trashOutline } from "ionicons/icons"; //chỉ import các icon cần dùng
import "./OwnerEditBannerModal.scss";
import bannertest from "../../assets/bannerimgs/1.webp";

class OwnerEditBannerModal extends Component {
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
          <Modal.Title>Thông tin Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="edit-banner-modal">
              <div className="modal-content">
                <div className="modal-content-edit-img">
                  <p>Hình ảnh:</p>
                  <div className="f">
                    <div className="modal-content-edit-img-item">
                      <img src={bannertest} />
                      <button className="delete-img">
                        {" "}
                        <IonIcon icon={trashOutline}></IonIcon>
                      </button>
                    </div>
                    <button className="add-img">+</button>
                  </div>
                </div>
                <div className="modal-content-edit-source">
                  <p>Mã sản phẩm:</p>
                  <input type="text" />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.toggle}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default OwnerEditBannerModal;
