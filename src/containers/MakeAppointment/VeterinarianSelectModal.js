import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { IonIcon } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import './VeterinarianSelectModal.scss';
import { handleLoadVeterinarianInfoApi } from '../../services/accountServices';
import { handleGetServiceInfoApi } from '../../services/appointmentServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import doctor from '../../assets/doctor-imgs/Anh-bac-si-Web_ThS.-BS.-DOAN-TRONG-NGHIA-.jpg';

class VeterinarianSelectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedVeterinarianInfo: [],
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      totalPages: 1,
      currentPage: 1,
      tempCurrentPage: '1',
      limitItemPerQuery: 100,
      totalPages: 1,
      loadedServiceFilterValue: [],
      codeWorkingStatus: [],
    };
    this.debounceTimeout = null;
  }

  async componentDidMount() { }

  async componentDidUpdate(prevProps) {
    const { isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      await this.handleLoadVeterinarianInfo();
      await this.handleLoadServiceFilterValue();
      await this.handleLoadWorkingStatus();
    }
  }

  handleLoadVeterinarianInfo = async () => {
    const { currentPage, limitItemPerQuery, searchValue, filterValue, sortValue } = this.state;

    try {
      const response = await handleLoadVeterinarianInfoApi(currentPage, limitItemPerQuery, searchValue, filterValue, sortValue);
      console.log(response);
      if (response && response.errCode === 0) {
        this.setState({
          loadedVeterinarianInfo: response.data,
          totalPages: Math.ceil(response.totalItems / limitItemPerQuery),
        });
      }
    } catch (e) {
      console.log('Error loading veterinarianinfo:', e);
      toast.error('Lỗi khi load danh sách bác sĩ thú y!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadServiceFilterValue = async () => {
    try {
      const loadedFilterValue = await handleGetServiceInfoApi('ALL');
      if (!loadedFilterValue || loadedFilterValue.length === 0) {
        toast.error('Không thể tải danh sách lọc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        loadedServiceFilterValue: loadedFilterValue.data,
      });
    } catch (e) {
      console.log('Error loading service list:', e);
      toast.error('Lỗi khi tải danh sách lọc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadWorkingStatus = async () => {
    try {
      const codeWorkingStatus = await handleGetAllCodesApi('WorkingStatus');
      if (!codeWorkingStatus || codeWorkingStatus.length === 0) {
        toast.error('Không thể tải trạng thái làm việc!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({
        codeWorkingStatus,
      });
    } catch (e) {
      console.log('Error loading workingstatus code:', e);
      toast.error('Lỗi khi tải trạng thái làm việc!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleFilter = (value) => {
    this.setState(
      {
        filterValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        this.handleLoadVeterinarianInfo();
      }
    );
  };

  handleSort = (value) => {
    this.setState(
      {
        sortValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        this.handleLoadVeterinarianInfo();
      }
    );
  };

  handleSearchChange = (event) => {
    const value = event.target.value;
    this.setState(
      {
        searchValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      },
      () => {
        if (this.debounceTimeout) {
          clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(() => {
          this.handleLoadVeterinarianInfo();
        }, 500);
      }
    );
  };

  handlePageChange = (page) => {
    const { totalPages } = this.state;
    let newPage = page;
    // Xử lý giá trị không hợp lệ
    if (isNaN(page) || page <= 0) {
      newPage = 1; // Nếu nhập chữ, ký tự, hoặc số không hợp lệ, về trang 1
    } else if (page > totalPages) {
      newPage = totalPages; // Nếu nhập số lớn hơn totalPages, đặt thành totalPages
    }
    this.setState(
      {
        currentPage: newPage,
        tempCurrentPage: newPage.toString(),
      },
      () => {
        this.handleLoadVeterinarianInfo();
      }
    );
  };

  handlePrevPage = () => {
    this.setState(
      (prevState) => {
        const newPage = Math.max(1, prevState.currentPage - 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      },
      () => {
        this.handleLoadVeterinarianInfo();
      }
    );
  };

  handleNextPage = () => {
    this.setState(
      (prevState) => {
        const newPage = Math.min(prevState.totalPages, prevState.currentPage + 1);
        return {
          currentPage: newPage,
          tempCurrentPage: newPage.toString(),
        };
      },
      () => {
        this.handleLoadVeterinarianInfo();
      }
    );
  };

  handlePageInputChange = (event) => {
    const value = event.target.value;
    this.setState({ tempCurrentPage: value });
  };

  handlePageInputBlur = () => {
    const { tempCurrentPage } = this.state;
    const page = parseInt(tempCurrentPage, 10);
    this.handlePageChange(page);
  };

  handlePageKeyDown = (event) => {
    if (event.key === 'Enter') {
      const { tempCurrentPage } = this.state;
      const page = parseInt(tempCurrentPage, 10);
      this.handlePageChange(page);
    }
  };

  getAccountStatusValue = (code) => { };

  handleSelectVeterinarianFromModal = (veterinarianID) => {
    this.props.handleSelectVeterinarianFromModal(veterinarianID);
    this.props.toggleFromModal();
  };

  render() {
    const { isOpen, toggleFromModal } = this.props;
    const { loadedVeterinarianInfo, searchValue, sortValue, filterValue, currentPage, tempCurrentPage, totalPages, loadedServiceFilterValue, codeWorkingStatus } = this.state;

    return (
      <Modal show={isOpen} onHide={toggleFromModal} centered backdrop="static" className="veterinarian-select-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <p>Chọn Bác Sĩ Thú Y</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <div className="veterinarian-select-table">
            <div className="showdoctor-content-top f">
              <div className="showdoctor-content-top-search">
                <input type="text" placeholder="Nhập tên bác sĩ" value={searchValue} onChange={(event) => this.handleSearchChange(event)} />
                <IonIcon icon={searchOutline}></IonIcon>
              </div>
              <div className="showdoctor-content-top-filter">
                <p>Lọc:</p>
                <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 1)}>
                  <option value="ALL">Tất cả</option>
                  {loadedServiceFilterValue && loadedServiceFilterValue.length > 0 && (
                    <optgroup label="Dịch vụ khám">
                      {loadedServiceFilterValue.map((item) => (
                        <option key={item.ServiceID} value={item.ServiceID}>
                          {item.ServiceName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="showdoctor-content-top-sort">
                <p>Sắp xếp:</p>
                <select value={sortValue} onChange={(e) => this.handleSort(e.target.value)}>
                  <option value="0">Mặc định</option>
                  <option value="1">Số lượt đặt lịch</option>
                  <option value="2">Tên A-Z</option>
                  <option value="3">Tên Z-A</option>
                </select>
              </div>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Tên Bác Sĩ</th>
                    <th>Chuyên Khoa</th>
                    <th>Số Lượt Đặt Lịch</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadedVeterinarianInfo.length > 0 ? (
                    loadedVeterinarianInfo.map((item) => (
                      <tr key={item.AccountID}>
                        <td>{item.UserName}</td>
                        <td>{item.Specialization}</td>
                        <td>{item.BookingCount || 0}</td>
                        <td>{codeWorkingStatus.find((filterItem) => filterItem.Code === item.WorkingStatus)?.CodeValueVI || item.WorkingStatus}</td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => this.handleSelectVeterinarianFromModal(item.AccountID)}>
                            Chọn
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Không có bác sĩ thú y nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="page-content">
                  <div className="page-content-item">
                    <button className="first" onClick={() => this.handlePageChange(1)} disabled={currentPage === 1}>
                      {'<<'}
                    </button>
                    <button className="prev" onClick={this.handlePrevPage} disabled={currentPage === 1}>
                      {'<'}
                    </button>
                    <input type="text" value={tempCurrentPage} onChange={this.handlePageInputChange} onKeyDown={this.handlePageKeyDown} onBlur={this.handlePageInputBlur} />
                    <span className="total-pages">/ {totalPages}</span>
                    <button className="next" onClick={this.handleNextPage} disabled={currentPage === totalPages}>
                      {'>'}
                    </button>
                    <button className="last" onClick={() => this.handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                      {'>>'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div> */}

          <div className="showdoctor-modal-body">
            <div className="showdoctor-content">
              <div className="showdoctor-content-top f  ">
                <div className="showdoctor-content-top-search">
                  <input type="text" placeholder="Nhập tên bác sĩ" value={searchValue} onChange={(event) => this.handleSearchChange(event)} />
                  <IonIcon icon={searchOutline}></IonIcon>
                </div>
                <div className="showdoctor-content-top-sort">
                  <p>Sắp xếp:</p>
                  <select value={sortValue} onChange={(e) => this.handleSort(e.target.value)}>
                    <option value="0">Mặc định</option>
                    <option value="1">Số lượt đặt lịch</option>
                    <option value="2">Tên A-Z</option>
                    <option value="3">Tên Z-A</option>
                  </select>
                </div>
                <div className="showdoctor-content-top-filter">
                  <p>Lọc:</p>
                  <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 1)}>
                    <option value="ALL">Tất cả</option>
                    {loadedServiceFilterValue && loadedServiceFilterValue.length > 0 && (
                      <optgroup label="Dịch vụ khám">
                        {loadedServiceFilterValue.map((item) => (
                          <option key={item.ServiceID} value={item.ServiceID}>
                            {item.ServiceName}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
              <div className="showdoctor-content-mid showdoctor-con">
                <div className="showdoctor-content-mid-list">
                  {loadedVeterinarianInfo.length > 0 ? (
                    loadedVeterinarianInfo.map((item) => (
                      <div className="showdoctor-content-mid-list-item " key={item.AccountID}>
                        <div className="f">
                          <img src={item.UserImage} />
                          <div>
                            <div>
                              <p>
                                Bác sĩ: <b>{item.UserName}</b>
                              </p>
                              <p>
                                <b>Chuyên ngành:</b> {item.Specialization}
                              </p>
                              <p>
                                <b>Số lượt đặt lịch:</b> {item.BookingCount || 0}
                              </p>
                              <p>
                                <b>Trạng thái:</b> {codeWorkingStatus.find((filterItem) => filterItem.Code === item.WorkingStatus)?.CodeValueVI || item.WorkingStatus}
                              </p>
                            </div>
                            <div>
                              <button className="btn btn-primary btn-sm" onClick={() => this.handleSelectVeterinarianFromModal(item.AccountID)}>
                                Đặt lịch
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>khoog co bs nào</p>
                  )}
                </div>
              </div>
            </div>
          </div>
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

export default VeterinarianSelectModal;