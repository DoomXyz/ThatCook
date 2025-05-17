import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import { searchOutline } from 'ionicons/icons'; //chỉ import các icon cần dùng
import './VeterinarianSelectModal.scss';
import { handleGetVeterinarianInfoApi } from '../../services/accountServices';

import doctor from '../../assets/doctor-imgs/Anh-bac-si-Web_ThS.-BS.-DOAN-TRONG-NGHIA-.jpg';

class VeterinarianSelectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedVeterinarianInfo: [],
      isLoading: false,
    };
  }

  async componentDidMount() {}

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
          <Modal.Title>
            <p>Chọn Bác Sĩ Thú Y</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : (
            // <div className="veterinarian-select-table">
            //     <table className="table">
            //         <thead>
            //             <tr>
            //                 <th>Tên Bác Sĩ</th>
            //                 <th>Email</th>
            //                 <th>Số Điện Thoại</th>
            //                 <th>Action</th>
            //             </tr>
            //         </thead>
            //         <tbody>
            //             {loadedVeterinarianInfo.length > 0 ? (
            //                 loadedVeterinarianInfo.map((vet) => (
            //                     <tr key={vet.AccountID}>
            //                         <td>{vet.VeterinarianName}</td>
            //                         <td>{vet.Email}</td>
            //                         <td>{vet.Phone}</td>
            //                         <td>
            //                             <button className="select-btn" onClick={() => this.handleSelectVeterinarian(vet.AccountID)}>
            //                                 Chọn
            //                             </button>
            //                         </td>
            //                     </tr>
            //                 ))
            //             ) : (
            //                 <tr>
            //                     <td colSpan="4">Không có bác sĩ thú y nào.</td>
            //                 </tr>
            //             )}
            //         </tbody>
            //     </table>
            // </div>
            <div className="showdoctor-modal-body">
              <div className="showdoctor-content">
                <div className="showdoctor-content-top f  ">
                  <div className="showdoctor-content-top-search ">
                    <input type="text" placeholder="Tìm kiếm bác sĩ"></input>
                    <IonIcon icon={searchOutline}></IonIcon>
                  </div>
                  <div className="showdoctor-content-top-sort ">
                    <p>Sắp xếp:</p>
                    <select>
                      <option>Số lượt đặt lịch</option>
                      <option>A - Z</option>
                      <option>Z - A</option>
                    </select>
                  </div>
                  <div className="showdoctor-content-top-filter ">
                    <p>Chuyên ngành: </p>
                    <select>
                      <option>Số lượt đặt lịch</option>
                      <option>A - Z</option>
                      <option>Z - A</option>
                    </select>
                  </div>
                </div>
                <div className="showdoctor-content-mid ">
                  <div className="showdoctor-content-mid-list f">
                    <div className="showdoctor-content-mid-list-item ">
                      <div className="f">
                        <img src={doctor} />
                        <div>
                          <div>
                            <p>
                              Bác sĩ: <b>NGUYỄN VĂN A</b>
                            </p>
                            <p>
                              <b>Chuyên ngành:</b> Khoa tạo mạng mạc
                            </p>
                            <p>
                              <b>Số lượt đặt lịch:</b> 50
                            </p>
                            <p>
                              <b>Trạng thái:</b> Onl
                            </p>
                          </div>
                          <div>
                            <button>Chọn</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="showdoctor-content-mid-list-item ">
                      <div className="f">
                        <img src={doctor} />
                        <div>
                          <div>
                            <p>
                              Bác sĩ: <b>NGUYỄN VĂN A</b>
                            </p>
                            <p>
                              <b>Chuyên ngành:</b> Khoa tạo mạng mạc
                            </p>
                            <p>
                              <b>Số lượt đặt lịch:</b> 50
                            </p>
                            <p>
                              <b>Trạng thái:</b> Onl
                            </p>
                          </div>
                          <div>
                            <button>Chọn</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
