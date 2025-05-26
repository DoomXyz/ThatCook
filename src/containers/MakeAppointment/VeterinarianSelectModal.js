import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { IonIcon } from '@ionic/react';

import { searchOutline } from 'ionicons/icons';

import './VeterinarianSelectModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { handleLoadVeterinarianInfoApi } from '../../services/accountServices';
import { handleGetServiceInfoApi } from '../../services/serviceServices';

import { getAllCodes } from '../../utils/pakage';

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
      loadedServiceInfo: [],
      codeWorkingStatus: [],
    };
    this.debounceTimeout = null;
  }
  async componentDidUpdate(prevProps, prevState) {
    const { isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      await this.handleLoadVeterinarianInfo();
      await this.resetState();
    }
  }
  handleLoadCode = async (codeTypeFilter) => {
    try {
      const responses = await Promise.all(codeTypeFilter.map(type => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypeFilter.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
        newState[type.toLowerCase()] = response.data.length > 0 ? response.data[0].Code : '';
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  handleGetServiceInfo = async () => {
    try {
      const responseApi = await handleGetServiceInfoApi('ALL');
      const response = responseApi.data
      if (response.errCode === 0 && response.data && response.data.length > 0) {
        this.setState({
          loadedServiceInfo: response.data,
        });
      } else {
        toast.error('Không thể tải danh sách dịch vụ!');
      }
    } catch (e) {
      console.log('Error loading service info:', e);
      toast.error('Lỗi khi tải danh sách dịch vụ!');
    }
  };
  resetState = async () => {
    this.setState({
      searchValue: '',
      filterValue: 'ALL',
      sortValue: '0',
      totalPages: 1,
      currentPage: 1,
      tempCurrentPage: '1',
    });
    await this.handleLoadCode(['WorkingStatus']);
    await this.handleGetServiceInfo();
  };
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
  handleSearchChange = (event) => {
    const value = event.target.value;
    this.setState(
      {
        searchValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      }, () => {
        if (this.debounceTimeout) {
          clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(() => {
          this.handleLoadVeterinarianInfo();
        }, 500);
      }
    );
  };
  handleFilter = (value) => {
    this.setState(
      {
        filterValue: value,
        currentPage: 1,
        tempCurrentPage: '1',
      }, () => {
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
      }, () => {
        this.handleLoadVeterinarianInfo();
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
      }, () => {
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
      }, () => {
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
      }, () => {
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
  handleSelectVeterinarianFromModal = (veterinarianInfo) => {
    this.props.handleSelectVeterinarianFromModal(veterinarianInfo);
    this.props.toggleFromModal();
  };

  render() {
    const { isOpen, toggleFromModal } = this.props;
    const { loadedVeterinarianInfo, searchValue, sortValue, filterValue, loadedServiceInfo, codeWorkingStatus } = this.state;

    return (
      <Modal show={isOpen} onHide={toggleFromModal} centered backdrop="static" className="veterinarian-select-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <p>Chọn Bác Sĩ Thú Y</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                    {loadedServiceInfo &&
                      loadedServiceInfo.length > 0 &&
                      (console.log(loadedServiceInfo),
                        (
                          <optgroup label="Dịch vụ khám">
                            {loadedServiceInfo.map((service) => (
                              <option key={service.ServiceID} value={`service-${service.ServiceID}`}>
                                {service.ServiceName}
                              </option>
                            ))}
                          </optgroup>
                        ))}
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
                                <b>Chuyên khoa:</b> {item.Specialization}
                              </p>
                              <p>
                                <b>Số lượt đặt lịch:</b> {item.BookingCount || 0}
                              </p>
                              <p>
                                <b>Trạng thái:</b> {codeWorkingStatus.find((filterItem) => filterItem.Code === item.WorkingStatus)?.CodeValueVI || item.WorkingStatus}
                              </p>
                            </div>
                            <div>
                              <button className="btn btn-primary btn-sm" onClick={() => this.handleSelectVeterinarianFromModal(item)}>
                                Đặt lịch
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-see">Không tìm thấy bác sĩ</p>
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
