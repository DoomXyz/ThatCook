import React, { Component } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { IonIcon } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import './VeterinarianSelectModal.scss';
import { loadVeterinarianInfoApi } from '../../services/accountServices';

class VeterinarianSelectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedVeterinarianInfo: [],
      isLoading: false,
      searchTerm: '',
      sortOption: '0',
      filterSpecialization: 'ALL',
      currentPage: 1,
      tempCurrentPage: '1',
      limitPerPage: 10,
      totalPages: 1,
      specializations: [],
    };
    this.debounceTimeout = null;
  }

  async componentDidMount() {
    if (this.props.isOpen) {
      await this.loadVeterinarianInfo();
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      await this.loadVeterinarianInfo();
    }
  }

  loadVeterinarianInfo = async () => {
    const { searchTerm, sortOption, filterSpecialization, currentPage, limitPerPage } = this.state;
    try {
      this.setState({ isLoading: true });
      const response = await loadVeterinarianInfoApi(currentPage, limitPerPage, searchTerm, filterSpecialization, sortOption);
      if (response && response.errCode === 0) {
        const specializations = [...new Set(response.data.map(vet => vet.Specialization))].filter(spec => spec);
        this.setState({
          loadedVeterinarianInfo: response.data || [],
          totalPages: Math.ceil(response.totalItems / limitPerPage) || 1,
          specializations,
          isLoading: false,
        });
      } else {
        toast.error(response?.errMessage || 'Không thể tải danh sách bác sĩ!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        this.setState({
          loadedVeterinarianInfo: [],
          totalPages: 1,
          isLoading: false,
        });
      }
    } catch (e) {
      toast.error('Lỗi khi tải danh sách bác sĩ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
      this.setState({
        loadedVeterinarianInfo: [],
        totalPages: 1,
        isLoading: false,
      });
    }
  };

  handleSearch = (event) => {
    const searchTerm = event.target.value;
    this.setState({ searchTerm, currentPage: 1, tempCurrentPage: '1' }, () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        this.loadVeterinarianInfo();
      }, 500);
    });
  };

  handleSort = (event) => {
    this.setState({ sortOption: event.target.value, currentPage: 1, tempCurrentPage: '1' }, this.loadVeterinarianInfo);
  };

  handleFilter = (event) => {
    this.setState({ filterSpecialization: event.target.value, currentPage: 1, tempCurrentPage: '1' }, this.loadVeterinarianInfo);
  };

  handlePageChange = (page) => {
    if (page < 1 || page > this.state.totalPages) return;
    this.setState({ currentPage: page, tempCurrentPage: page.toString() }, this.loadVeterinarianInfo);
  };

  handlePrevPage = () => {
    this.setState(
      (prevState) => ({
        currentPage: Math.max(1, prevState.currentPage - 1),
        tempCurrentPage: Math.max(1, prevState.currentPage - 1).toString(),
      }),
      this.loadVeterinarianInfo
    );
  };

  handleNextPage = () => {
    this.setState(
      (prevState) => ({
        currentPage: Math.min(prevState.totalPages, prevState.currentPage + 1),
        tempCurrentPage: Math.min(prevState.totalPages, prevState.currentPage + 1).toString(),
      }),
      this.loadVeterinarianInfo
    );
  };

  handlePageInputChange = (event) => {
    this.setState({ tempCurrentPage: event.target.value });
  };

  handlePageInputBlur = () => {
    const { tempCurrentPage, totalPages } = this.state;
    const page = parseInt(tempCurrentPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      this.handlePageChange(page);
    } else {
      this.setState({ tempCurrentPage: this.state.currentPage.toString() });
    }
  };

  handlePageKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.handlePageInputBlur();
    }
  };

  handleSelectVeterinarian = (vetID) => {
    this.props.handleSelectVeterinarianFromModal(vetID);
    this.props.toggleFromModal();
  };

  render() {
    const { isOpen, toggleFromModal } = this.props;
    const { loadedVeterinarianInfo, isLoading, searchTerm, sortOption, filterSpecialization, currentPage, tempCurrentPage, totalPages, specializations } = this.state;

    return (
      <Modal show={isOpen} onHide={toggleFromModal} centered backdrop="static" className="veterinarian-select-modal">
        <Modal.Header closeButton>
          <Modal.Title>Chọn Bác Sĩ Thú Y</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <p className="text-center">Đang tải...</p>
          ) : (
            <div className="veterinarian-select-table">
              <div className="showdoctor-content-top f">
                <div className="showdoctor-content-top-search">
                  <input
                    type="text"
                    placeholder="Tìm kiếm bác sĩ"
                    value={searchTerm}
                    onChange={this.handleSearch}
                  />
                  <IonIcon icon={searchOutline}></IonIcon>
                </div>
                <div className="showdoctor-content-top-sort">
                  <p>Sắp xếp:</p>
                  <select value={sortOption} onChange={this.handleSort}>
                    <option value="0">Mặc định</option>
                    <option value="1">Số lượt đặt lịch</option>
                    <option value="2">Tên A-Z</option>
                  </select>
                </div>
                <div className="showdoctor-content-top-filter">
                  <p>Chuyên ngành:</p>
                  <select value={filterSpecialization} onChange={this.handleFilter}>
                    <option value="ALL">Tất cả</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Tên Bác Sĩ</th>
                    <th>Chuyên Ngành</th>
                    <th>Số Lượt Đặt Lịch</th>
                    <th>Trạng Thái</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadedVeterinarianInfo.length > 0 ? (
                    loadedVeterinarianInfo.map((vet) => (
                      <tr key={vet.AccountID}>
                        <td>{vet.UserName}</td>
                        <td>{vet.Specialization}</td>
                        <td>{vet.BookingCount || 0}</td>
                        <td>{vet.WorkingStatus === 'ONLINE' ? 'Online' : 'Offline'}</td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => this.handleSelectVeterinarian(vet.AccountID)}>
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
                    <button
                      className="first"
                      onClick={() => this.handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      {'<<'}
                    </button>
                    <button
                      className="prev"
                      onClick={this.handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      {'<'}
                    </button>
                    <input
                      type="text"
                      value={tempCurrentPage}
                      onChange={this.handlePageInputChange}
                      onKeyDown={this.handlePageKeyDown}
                      onBlur={this.handlePageInputBlur}
                    />
                    <span className="total-pages">/ {totalPages}</span>
                    <button
                      className="next"
                      onClick={this.handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      {'>'}
                    </button>
                    <button
                      className="last"
                      onClick={() => this.handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      {'>>'}
                    </button>
                  </div>
                </div>
              )}
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

export default VeterinarianSelectModal;