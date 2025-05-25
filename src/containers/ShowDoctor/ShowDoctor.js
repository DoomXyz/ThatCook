import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { IonIcon } from '@ionic/react'; //import thư viện icon
import { searchOutline } from 'ionicons/icons'; //chỉ import các icon cần dùng
import './ShowDoctor.scss'; //import scss
import Header from '../../components/HomeHeader';
import Footer from '../../components/HomeFooter';
import { handleLoadVeterinarianInfoApi } from '../../services/accountServices';
import { handleGetServiceInfoApi } from '../../services/serviceServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { savePreselectInfo, clearPreselectInfo } from '../../store/actions';

class ShowDoctor extends Component {
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
      limitItemPerQuery: 9,
      totalPages: 1,
      loadedServiceFilterValue: [],
      codeWorkingStatus: [],
    };
    this.debounceTimeout = null;
  }
  async componentDidMount() {
    await this.handleLoadVeterinarianInfo();
    await this.handleLoadServiceFilterValue();
    await this.handleLoadWorkingStatus();
  }
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
      const response = await handleGetServiceInfoApi('ALL');
      const loadedFilterValue = response.data;
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
  handlePreSelectVeterinarian = (accountID) => {
    const { loadedVeterinarianInfo } = this.state;
    const selectedVet = loadedVeterinarianInfo.find((item) => item.AccountID === accountID);
    if (selectedVet) {
      this.props.savePreselectInfo('Veterinarian', accountID);
      this.props.navigate('/makeappointment');
    } else {
      toast.error('Không tìm thấy thông tin bác sĩ!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };
  render() {
    const { loadedVeterinarianInfo, searchValue, sortValue, filterValue, currentPage, tempCurrentPage, totalPages, loadedServiceFilterValue, codeWorkingStatus } = this.state;
    return (
      <div className="showdoctor-body">
        <Header navigate={this.props.navigate} cartItems={this.props.cartItems} userInfo={this.props.userInfo} triggerCountCartItem={this.state.triggerCountCartItem} />
        <div className="showdoctor-content">
          <h1>Danh sách bác sĩ</h1>
          <div className="showdoctor-content-top f  ">
            <div className="showdoctor-content-top-search ">
              <input type="text" placeholder="Nhập tên bác sĩ" value={searchValue} onChange={(event) => this.handleSearchChange(event)} />
              <IonIcon icon={searchOutline}></IonIcon>
            </div>
            <div className="showdoctor-content-top-sort f">
              <p>Sắp xếp:</p>
              <select value={sortValue} onChange={(e) => this.handleSort(e.target.value)}>
                <option value="0">Mặc định</option>
                <option value="1">Số lượt đặt lịch</option>
                <option value="2">Tên A-Z</option>
                <option value="3">Tên Z-A</option>
              </select>
            </div>
            <div className="showdoctor-content-top-filter f">
              <p>Lọc: </p>
              <select value={filterValue} onChange={(event) => this.handleFilter(event.target.value, 1)}>
                <option value="ALL">Tất cả</option>
                {loadedServiceFilterValue && loadedServiceFilterValue.length > 0 && (
                  <optgroup label="Dịch vụ khám">
                    {loadedServiceFilterValue.map((service) => (
                      <option key={service.ServiceID} value={`service-${service.ServiceID}`}>
                        {service.ServiceName}
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
                      <img src={item.UserImage} alt="Doctor" />
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
                          <button className="btn btn-primary btn-sm" onClick={() => this.handlePreSelectVeterinarian(item.AccountID)}>
                            Đặt lịch
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-see">Không có bác sĩ nào</p>
              )}
            </div>
          </div>
        </div>
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
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  cartItems: state.cart.cartItems,
});

const mapDispatchToProps = (dispatch) => ({
  savePreselectInfo: (type, id) => dispatch(savePreselectInfo(type, id)),
  clearPreselectInfo: () => dispatch(clearPreselectInfo()),
});
export default connect(mapStateToProps, mapDispatchToProps)(ShowDoctor);
