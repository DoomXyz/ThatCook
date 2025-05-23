import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import RobotoRegularFont from '../../assets/fonts/Roboto-Regular-normal.js';

import './Bill.scss';
import Spinner from '../../components/Spinner';
import Header from '../../components/HomeHeader';

import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline, refreshOutline, chevronBack } from 'ionicons/icons';

import { handleGetInvoiceDetailInfoApi, handleChangeInvoiceStatusApi } from '../../services/invoiceServices';
import { handleLoadAppointmentDetailsApi, handleChangeAppointmentStatusApi, handleGetAppointmentBillDetailApi } from '../../services/appointmentServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { clearBillSearchInfo } from '../../store/actions';

import CancelInvoiceModal from '../../components/CancelInvoiceModal';

import logo from '../../assets/images/logo1.png';
const tem = 'https://res.cloudinary.com/dqblg6ont/image/upload/v1748022960/moc-removebg-preview_l9hbp8.png'

class Bill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      actionPage: 0, // 0: tìm kiếm, 1: Product, 2: Appointment, 3: Appointment Bill
      selectedTab: 1, // 1: Product, 2: Appointment, 3: Appointment Bill
      searchValue: '',
      billid: '',
      billtype: 0,
      loadedInvoiceDetails: null,
      loadedAppointmentDetails: null,
      loadedAppointmentBillDetails: null,
      codePaymentType: [],
      codeShippingMethod: [],
      codeShippingStatus: [],
      codeAppointmentStatus: [],
      codePetType: [],
      codePetGender: [],
      isShowCancelInvoiceModal: false,
      selectedCancelInvoice: null,
    };
  }

  async componentDidMount() {
    try {
      await Promise.all([this.handleLoadCodePaymentType(), this.handleLoadCodeShippingMethod(), this.handleLoadCodeShippingStatus(), this.handleLoadCodeAppointmentStatus(), this.handleLoadCodePetType(), this.handleLoadCodePetGender()]);
      if (this.props.billInfo) {
        const { billid, billtype } = this.props.billInfo;
        this.setState({ billid, billtype, actionPage: billtype });
        const success = await this.handleLoadBillDetails(billid, billtype);
        if (success) {
          this.props.clearBillSearchInfo();
        }
      }
    } catch (e) {
      console.error('Error in componentDidMount:', e);
      toast.error('Lỗi khi tải dữ liệu từ trang trước!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    } finally {
      this.setState({ isLoading: false });
    }
  }
  handleLoadCodePaymentType = async () => {
    try {
      const codePaymentType = await handleGetAllCodesApi('PaymentType');
      if (!codePaymentType || codePaymentType.length === 0) {
        toast.error('Không thể tải danh sách phương thức thanh toán!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        return;
      }
      this.setState({ codePaymentType });
    } catch (e) {
      console.error('Error loading payment type code:', e);
      toast.error('Lỗi khi tải danh sách phương thức thanh toán!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    }
  };
  handleLoadCodeShippingMethod = async () => {
    try {
      const codeShippingMethod = await handleGetAllCodesApi('ShippingMethod');
      if (!codeShippingMethod || codeShippingMethod.length === 0) {
        toast.error('Không thể tải danh sách phương thức giao hàng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        return;
      }
      this.setState({ codeShippingMethod });
    } catch (e) {
      console.error('Error loading shipping method code:', e);
      toast.error('Lỗi khi tải danh sách phương thức giao hàng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    }
  };
  handleLoadCodeShippingStatus = async () => {
    try {
      const codeShippingStatus = await handleGetAllCodesApi('ShippingStatus');
      if (!codeShippingStatus || codeShippingStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái giao hàng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        return;
      }
      this.setState({ codeShippingStatus });
    } catch (e) {
      console.error('Error loading shipping status code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái giao hàng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    }
  };
  handleLoadCodeAppointmentStatus = async () => {
    try {
      const codeAppointmentStatus = await handleGetAllCodesApi('AppointmentStatus');
      if (!codeAppointmentStatus || codeAppointmentStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái lịch hẹn!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        return;
      }
      this.setState({ codeAppointmentStatus });
    } catch (e) {
      console.error('Error loading appointment status code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái lịch hẹn!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    }
  };
  handleLoadCodePetType = async () => {
    try {
      const codePetType = await handleGetAllCodesApi('PetType');
      if (!codePetType || codePetType.length === 0) {
        toast.error('Không thể tải danh sách loại thú cưng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        return;
      }
      this.setState({ codePetType });
    } catch (e) {
      console.error('Error loading pet type code:', e);
      toast.error('Lỗi khi tải danh sách loại thú cưng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    }
  };
  handleLoadCodePetGender = async () => {
    try {
      const codePetGender = await handleGetAllCodesApi('PetGender');
      if (!codePetGender || codePetGender.length === 0) {
        toast.error('Không thể tải danh sách giới tính thú cưng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        return;
      }
      this.setState({ codePetGender });
    } catch (e) {
      console.error('Error loading pet gender code:', e);
      toast.error('Lỗi khi tải danh sách giới tính thú cưng!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    }
  };
  loadBillData = async (id, type) => {
    try {
      switch (type) {
        case 1: // Product
          const invoiceResponse = await handleGetInvoiceDetailInfoApi(id);
          console.log('loaded invoice detail: ', invoiceResponse);
          if (invoiceResponse && invoiceResponse.errCode === 0) {
            return { success: true, data: invoiceResponse.data, stateKey: 'loadedInvoiceDetails' };
          }
          toast.error(invoiceResponse?.errMessage || 'Không tìm thấy hóa đơn!', { position: 'top-right', autoClose: 500, closeOnClick: true });
          return { success: false };
        case 2: // Appointment
          const appointmentResponse = await handleLoadAppointmentDetailsApi(id);
          console.log('loaded appointment detail: ', appointmentResponse);
          if (appointmentResponse && appointmentResponse.errCode === 0) {
            return { success: true, data: appointmentResponse.data, stateKey: 'loadedAppointmentDetails' };
          }
          toast.error(appointmentResponse?.errMessage || 'Không tìm thấy lịch hẹn!', { position: 'top-right', autoClose: 500, closeOnClick: true });
          return { success: false };
        case 3: // Hóa đơn Appointment
          const appointmentBillResponse = await handleGetAppointmentBillDetailApi(id);
          console.log('loaded appointmentbill detail: ', appointmentBillResponse);
          if (appointmentBillResponse && appointmentBillResponse.errCode === 0) {
            if (appointmentBillResponse.data.AppointmentBill) {
              return { success: true, data: appointmentBillResponse.data, stateKey: 'loadedAppointmentBillDetails' };
            }
            toast.error('Không tìm thấy hóa đơn lịch hẹn!', { position: 'top-right', autoClose: 500, closeOnClick: true });
            return { success: false };
          }
          toast.error(appointmentBillResponse?.errMessage || 'Không tìm thấy hóa đơn lịch hẹn!', { position: 'top-right', autoClose: 500, closeOnClick: true });
          return { success: false };
        default:
          toast.error('Loại hóa đơn không hợp lệ!', { position: 'top-right', autoClose: 500, closeOnClick: true });
          return { success: false };
      }
    } catch (e) {
      console.error('Error loading bill data:', e);
      toast.error('Lỗi khi tải thông tin!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      return { success: false };
    }
  };
  handleLoadBillDetails = async (billid, billtype) => {
    if (!billid || !billtype) {
      toast.error('Mã hóa đơn hoặc loại hóa đơn không hợp lệ!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      return false;
    }
    this.setState({ isLoading: true });
    const result = await this.loadBillData(billid, billtype);
    this.setState({ isLoading: false });
    if (result.success) {
      this.setState({ [result.stateKey]: result.data });
      return true;
    }
    return false;
  };
  handleSearch = async () => {
    const { searchValue, selectedTab } = this.state;
    if (!searchValue.trim()) {
      toast.info('Vui lòng nhập mã tương ứng để tìm kiếm!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      return;
    }
    this.setState({ isLoading: true });
    const result = await this.loadBillData(searchValue, selectedTab);
    this.setState({ isLoading: false });
    if (result.success) {
      this.setState({
        actionPage: selectedTab,
        [result.stateKey]: result.data,
        billid: searchValue,
        billtype: selectedTab,
      });
    }
  };
  handleClearSearch = () => {
    this.setState({ searchValue: '' });
  };
  handleTabChange = (tab) => {
    this.setState({ selectedTab: tab });
  };
  handleBackToSearch = () => {
    this.setState({
      actionPage: 0,
      selectedTab: 1,
      billid: '',
      billtype: 0,
    });
  };
  getShippingFee = (shippingMethod) => {
    const method = this.state.codeShippingMethod.find((item) => item.Code === shippingMethod);
    return method ? parseFloat(method.ExtraValue) || 0 : 0;
  };
  //Tải pdf và gửi email
  handleGeneratePDF = () => {
    const { loadedInvoiceDetails, codePaymentType, codeShippingMethod, codeShippingStatus } = this.state;
    if (!loadedInvoiceDetails) {
      toast.error('Không có dữ liệu hóa đơn để tạo PDF!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      return;
    }

    const doc = new jsPDF();

    let fontLoaded = false;
    try {
      doc.addFileToVFS('Roboto-Regular-normal.ttf', RobotoRegularFont);
      doc.addFont('Roboto-Regular-normal.ttf', 'Roboto-Regular', 'normal');
      doc.setFont('Roboto-Regular');
      fontLoaded = true;
    } catch (e) {
      console.error('Error loading custom font:', e);
      doc.setFont('Helvetica');
      fontLoaded = false;
    }

    doc.setFontSize(18);
    doc.text('MINCOW', 14, 20);
    doc.setFontSize(10);
    doc.text('Pet Accessories & Food', 14, 26);

    const address = '136 Huỳnh Văn Bánh, p. 11, quận Phú Nhuận, HCM';
    doc.text(address, 14, 34);

    const dateText = `Thời gian: ${loadedInvoiceDetails.CreatedAt
      ? new Date(loadedInvoiceDetails.CreatedAt).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      : 'N/A'
      }`;
    doc.text(dateText, 14, 42);
    doc.text(`Mã hóa đơn: ${this.state.billid}`, 150, 42, { align: 'right' });

    const customerText = `Khách hàng: ${loadedInvoiceDetails.ReceiverName || 'N/A'}\nSĐT: ${loadedInvoiceDetails.ReceiverPhone || 'N/A'}\nĐịa chỉ: ${loadedInvoiceDetails.ReceiverAddress || 'N/A'}`;
    doc.text(customerText, 14, 50);

    const statusText = `Phương thức thanh toán: ${codePaymentType.find((item) => item.Code === loadedInvoiceDetails.PaymentType)?.CodeValueVI || loadedInvoiceDetails.PaymentType || 'N/A'}\nPhương thức giao hàng: ${codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod || 'N/A'}\nTrạng thái giao hàng: ${codeShippingStatus.find((item) => item.Code === loadedInvoiceDetails.ShippingStatus)?.CodeValueVI || loadedInvoiceDetails.ShippingStatus || 'N/A'}`;
    doc.text(statusText, 14, 70);

    doc.setLineWidth(0.5);
    doc.line(14, 85, 196, 85);

    const tableData = (loadedInvoiceDetails.ProductList || []).map((item) => [item.ProductName || 'N/A', item.DetailName || 'N/A', `${parseFloat(item.ItemPrice || 0).toLocaleString('vi-VN')}đ`, item.ItemQuantity || 0, `${(parseFloat(item.ItemPrice || 0) * (item.ItemQuantity || 0)).toLocaleString('vi-VN')}đ`]);

    autoTable(doc, {
      startY: 90,
      head: [['Tên sản phẩm', 'Loại', 'Giá', 'Số lượng', 'Thành tiền']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: fontLoaded ? 'Roboto-Regular' : 'Helvetica',
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
        textColor: [0, 0, 0],
        halign: 'left',
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'normal',
        halign: 'center',
      },
      columnWidths: [60, 40, 25, 20, 25],
      columnStyles: {
        0: { halign: 'center', overflow: 'linebreak' },
        1: { halign: 'center', overflow: 'linebreak' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    let finalY = doc.lastAutoTable.finalY;

    doc.setLineWidth(0.5);
    doc.line(14, finalY + 2, 196, finalY + 2);

    doc.setFontSize(10);
    doc.text(`Tổng sản phẩm: ${loadedInvoiceDetails.TotalQuantity || 0}`, 14, finalY + 10);
    doc.text(`Tổng tiền hàng: ${parseFloat(loadedInvoiceDetails.TotalPrice || 0).toLocaleString('vi-VN')}đ`, 14, finalY + 16);
    doc.text(`Phí vận chuyển (${codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod || 'N/A'}): ${this.getShippingFee(loadedInvoiceDetails.ShippingMethod).toLocaleString('vi-VN')}đ`, 14, finalY + 22);
    doc.text(`Giảm giá: -${parseFloat(loadedInvoiceDetails.DiscountAmount || 0).toLocaleString('vi-VN')}đ`, 14, finalY + 28);
    doc.setFont(fontLoaded ? 'Roboto-Regular' : 'Helvetica', 'normal');
    doc.text(`Tổng thanh toán: ${parseFloat(loadedInvoiceDetails.TotalPayment || 0).toLocaleString('vi-VN')}đ`, 14, finalY + 34);

    doc.setLineWidth(0.5);
    doc.line(14, finalY + 38, 196, finalY + 38);

    const note1 = '*Lưu ý: giá thành tiền của sản phẩm đã bao gồm khuyến mãi (nếu có).';
    const note2 = 'Mọi thắc mắc xin liên hệ với bộ phận chăm sóc khách hàng (0901131141).';

    doc.setFontSize(9);
    const splitNote1 = doc.splitTextToSize(note1, 180);
    const splitNote2 = doc.splitTextToSize(note2, 180);

    doc.text(splitNote1, 14, finalY + 46);
    doc.text(splitNote2, 14, finalY + 54);

    doc.save(`HoaDon_${this.state.billid}.pdf`);
  };
  handleSendEmail = (billid) => {
    console.log(`Gửi email cho mã hóa đơn: ${billid}`);
    toast.info('Tính năng gửi email chưa được hỗ trợ!', { position: 'top-right', autoClose: 500, closeOnClick: true });
  };
  //Hàm thao tác của Product
  handleConfirmReceived = async (invoiceid) => {
    const confirmReceived = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận đã nhận hàng?</p>
            <button
              className="toast-confirm-btn"
              onClick={() => {
                resolve(true);
                toast.dismiss();
              }}
            >
              Có
            </button>
            <button
              className="toast-cancel-btn"
              onClick={() => {
                resolve(false);
                toast.dismiss();
              }}
            >
              Không
            </button>
          </div>,
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmReceived();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'DELI', '');
      if (response && response.errCode === 0) {
        toast.success('Xác nhận nhận hàng thành công!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        await this.handleLoadBillDetails(invoiceid, this.state.billtype);
      } else {
        toast.error(response?.errMessage || 'Xác nhận nhận hàng thất bại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      }
    } catch (e) {
      console.error('Error confirming received:', e);
      toast.error('Xảy ra lỗi khi xác nhận nhận hàng, vui lòng thử lại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    } finally {
      this.setState({ isLoading: false });
    }
  };
  handleContinueInvoice = async (invoiceid) => {
    const confirmContinue = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận tiếp tục đơn hàng?</p>
            <button
              className="toast-confirm-btn"
              onClick={() => {
                resolve(true);
                toast.dismiss();
              }}
            >
              Có
            </button>
            <button
              className="toast-cancel-btn"
              onClick={() => {
                resolve(false);
                toast.dismiss();
              }}
            >
              Không
            </button>
          </div>,
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmContinue();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'PEND', '');
      if (response && response.errCode === 0) {
        toast.success('Tiếp tục đơn hàng thành công!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        await this.handleLoadBillDetails(invoiceid, this.state.billtype);
      } else {
        toast.error(response?.errMessage || 'Tiếp tục đơn hàng thất bại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      }
    } catch (e) {
      console.error('Error continuing invoice:', e);
      toast.error('Xảy ra lỗi khi tiếp tục đơn hàng, vui lòng thử lại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    } finally {
      this.setState({ isLoading: false });
    }
  };
  handleSelectedCancelInvoice = (invoiceid) => {
    this.setState({
      selectedCancelInvoice: invoiceid,
      isShowCancelInvoiceModal: true,
    });
  };
  toggleCancelInvoiceModal = () => {
    this.setState({
      isShowCancelInvoiceModal: !this.state.isShowCancelInvoiceModal,
    });
  };
  handleCancelInvoiceFromModal = async (invoiceid, cancelreason) => {
    this.setState({ isLoading: true });
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'PEND_CANCEL', cancelreason);
      if (response && response.errCode === 0) {
        toast.success('Gửi yêu cầu hủy đơn hàng thành công!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        await this.handleLoadBillDetails(invoiceid, this.state.billtype);
        this.setState({
          isShowCancelInvoiceModal: false,
          selectedCancelInvoice: null,
        });
      } else {
        toast.error(response?.errMessage || 'Gửi yêu cầu hủy đơn hàng thất bại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      }
    } catch (e) {
      console.error('Error canceling invoice:', e);
      toast.error('Xảy ra lỗi khi gửi yêu cầu hủy đơn hàng, vui lòng thử lại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    } finally {
      this.setState({ isLoading: false });
    }
  };
  //Hàm thao tác của Appointment
  handleCancelAppointment = async (appointmentid) => {
    const confirmCancel = () =>
      new Promise((resolve) => {
        toast(
          <div>
            <p>Xác nhận hủy lịch hẹn?</p>
            <button
              className="toast-confirm-btn"
              onClick={() => {
                resolve(true);
                toast.dismiss();
              }}
            >
              Có
            </button>
            <button
              className="toast-cancel-btn"
              onClick={() => {
                resolve(false);
                toast.dismiss();
              }}
            >
              Không
            </button>
          </div>,
          { position: 'top-center', autoClose: 1000, closeOnClick: false }
        );
      });

    const isConfirmed = await confirmCancel();
    if (!isConfirmed) return;

    this.setState({ isLoading: true });
    try {
      const response = await handleChangeAppointmentStatusApi(appointmentid, 'CANCELED', this.state.loadedAppointmentDetails?.AccountID || '');
      if (response && response.errCode === 0) {
        toast.success('Hủy lịch hẹn thành công!', { position: 'top-right', autoClose: 500, closeOnClick: true });
        await this.handleLoadBillDetails(appointmentid, this.state.billtype);
      } else {
        toast.error(response?.errMessage || 'Hủy lịch hẹn thất bại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
      }
    } catch (e) {
      console.error('Error canceling appointment:', e);
      toast.error('Xảy ra lỗi khi hủy lịch hẹn, vui lòng thử lại!', { position: 'top-right', autoClose: 500, closeOnClick: true });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { isLoading, actionPage, searchValue, selectedTab, loadedInvoiceDetails, loadedAppointmentDetails, loadedAppointmentBillDetails, codePaymentType, codeShippingMethod, codeShippingStatus, codeAppointmentStatus, codePetType, codePetGender, isShowCancelInvoiceModal, selectedCancelInvoice, billid } = this.state;
    return (
      <>
        <ToastContainer />
        <Header navigate={this.props.navigate} userInfo={this.props.userInfo} />
        {isLoading ? (
          <Spinner />
        ) : (
          <div>
            {(() => {
              switch (actionPage) {
                case 0: // Tìm kiếm
                  return (
                    <div className="view-invoice-background">
                      <ToastContainer />
                      <div className="search-bill-container">
                        <div className="search-tabs">
                          <button className={selectedTab === 1 ? 'active' : ''} onClick={() => this.handleTabChange(1)}>
                            Hóa đơn sản phẩm
                          </button>
                          <button className={selectedTab === 2 ? 'active' : ''} onClick={() => this.handleTabChange(2)}>
                            Lịch khám
                          </button>
                          <button className={selectedTab === 3 ? 'active' : ''} onClick={() => this.handleTabChange(3)}>
                            Hóa đơn lịch khám
                          </button>
                        </div>
                        <div className="search-bar">
                          <input type="text" placeholder={`Nhập mã ${selectedTab === 1 ? 'hóa đơn' : selectedTab === 2 ? 'lịch hẹn' : 'hóa đơn lịch khám'}`} value={searchValue} onChange={(e) => this.setState({ searchValue: e.target.value })} />
                          {searchValue && (
                            <button className="clear-btn" onClick={this.handleClearSearch}>
                              x
                            </button>
                          )}
                          <button className="search-btn" onClick={this.handleSearch}>
                            Tìm kiếm
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                case 1: // Hóa đơn Product
                  return (
                    <div className="view-invoice-background">
                      <CancelInvoiceModal isOpen={isShowCancelInvoiceModal} toggleFromModal={this.toggleCancelInvoiceModal} selectedCancelInvoiceID={selectedCancelInvoice} handleCancelInvoiceFromModal={this.handleCancelInvoiceFromModal} />
                      <ToastContainer />
                      <div className="view-invoice-modal">
                        <div className="view-invoice-modal-content">
                          {loadedInvoiceDetails ? (
                            <>
                              <div className="view-invoice-modal-content-top">
                                <div className="view-invoice-modal-content-top-logo">
                                  <img src={logo} alt="Logo" />
                                </div>
                                <div className="view-invoice-modal-content-top-address">
                                  <p>136 Huỳnh Văn Bánh, p. 11, quận Phú Nhuận, HCM</p>
                                </div>
                                <div className="f">
                                  <div className="view-invoice-modal-content-top-time">
                                    <p>
                                      Thời gian:{' '}
                                      {loadedInvoiceDetails.CreatedAt
                                        ? new Date(loadedInvoiceDetails.CreatedAt).toLocaleString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit',
                                        })
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="view-invoice-modal-content-top-invoiceid">
                                    <p>Mã hóa đơn: {billid}</p>
                                  </div>
                                </div>
                                <div className="view-invoice-modal-content-top-cusname-1">
                                  <p>Khách hàng: {loadedInvoiceDetails.ReceiverName || 'N/A'}</p>
                                  <p>SĐT: {loadedInvoiceDetails.ReceiverPhone || 'N/A'}</p>
                                  <p>Địa chỉ: {loadedInvoiceDetails.ReceiverAddress || 'N/A'}</p>
                                </div>
                                <div className="view-invoice-modal-content-top-status">
                                  <p>Phương thức thanh toán: {codePaymentType.find((item) => item.Code === loadedInvoiceDetails.PaymentType)?.CodeValueVI || loadedInvoiceDetails.PaymentType || 'N/A'}</p>
                                  <p>Phương thức giao hàng: {codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod || 'N/A'}</p>
                                  <p>Trạng thái giao hàng: {codeShippingStatus.find((item) => item.Code === loadedInvoiceDetails.ShippingStatus)?.CodeValueVI || loadedInvoiceDetails.ShippingStatus || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="view-invoice-modal-content-mid">
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Hình ảnh</th>
                                      <th>Tên sản phẩm</th>
                                      <th>Loại</th>
                                      <th>Giá</th>
                                      <th>Số lượng</th>
                                      <th>Thành tiền</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(loadedInvoiceDetails.ProductList || []).length > 0 ? (
                                      loadedInvoiceDetails.ProductList.map((item, index) => (
                                        <tr key={index} className="view-invoice-modal-content-mid-item">
                                          <td>
                                            <img src={item.ProductImage || ''} alt={item.ProductName || 'Sản phẩm'} style={{ width: '50px', height: '50px' }} />
                                          </td>
                                          <td>{item.ProductName || 'N/A'}</td>
                                          <td>{item.DetailName || 'N/A'}</td>
                                          <td>
                                            {parseFloat(item.ItemPrice || 0).toLocaleString('vi-VN')}
                                            <sup>đ</sup>
                                          </td>
                                          <td>{item.ItemQuantity || 0}</td>
                                          <td>
                                            {(parseFloat(item.ItemPrice || 0) * (item.ItemQuantity || 0)).toLocaleString('vi-VN')}
                                            <sup>đ</sup>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="6">Không có sản phẩm nào.</td>
                                      </tr>
                                    )}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan="5">Tổng sản phẩm:</td>
                                      <td className="cen">{loadedInvoiceDetails.TotalQuantity || 0}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan="5">Tổng tiền hàng:</td>
                                      <td className="cen">
                                        {parseFloat(loadedInvoiceDetails.TotalPrice || 0).toLocaleString('vi-VN')}
                                        <sup>đ</sup>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan="5">Phí vận chuyển ({codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod || 'N/A'}):</td>
                                      <td className="cen">
                                        {this.getShippingFee(loadedInvoiceDetails.ShippingMethod).toLocaleString('vi-VN')}
                                        <sup>đ</sup>
                                      </td>
                                    </tr>
                                    {loadedInvoiceDetails.DiscountAmount > 0 ? (
                                      <tr>
                                        <td colSpan="5">Giảm giá:</td>
                                        <td className="cen">
                                          -{parseFloat(loadedInvoiceDetails.DiscountAmount || 0).toLocaleString('vi-VN')}
                                          <sup>đ</sup>
                                        </td>
                                      </tr>
                                    ) : null}
                                    <tr>
                                      <td colSpan="5">
                                        <b>Tổng thanh toán:</b>
                                      </td>
                                      <td className="cen">
                                        <b>
                                          {parseFloat(loadedInvoiceDetails.TotalPayment || 0).toLocaleString('vi-VN')}
                                          <sup>đ</sup>
                                        </b>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan="6">
                                        <p>
                                          <u>*Lưu ý:</u> Giá thành tiền của sản phẩm đã bao gồm khuyến mãi (nếu có).
                                          <br />
                                          Mọi thắc mắc xin liên hệ với bộ phận chăm sóc khách hàng <b>(0901131141)</b>.
                                        </p>
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              <div className="bill-actions">
                                {loadedInvoiceDetails.PaymentStatus === 'PEND' && loadedInvoiceDetails.ShippingStatus === 'PEND' && (
                                  <button className="cancel-order-btn" onClick={() => this.handleSelectedCancelInvoice(billid)} title="Hủy đơn hàng">
                                    <IonIcon icon={closeCircleOutline}></IonIcon> Hủy đơn hàng
                                  </button>
                                )}
                                {loadedInvoiceDetails.PaymentStatus === 'PAID' && loadedInvoiceDetails.ShippingStatus === 'PEND' && (
                                  <button className="received-order-btn" onClick={() => this.handleConfirmReceived(billid)} title="Xác nhận giao hàng">
                                    <IonIcon icon={checkmarkCircleOutline}></IonIcon> Xác nhận giao hàng
                                  </button>
                                )}
                                {(loadedInvoiceDetails.PaymentStatus === 'PEND' || loadedInvoiceDetails.PaymentStatus === 'PAID') && loadedInvoiceDetails.ShippingStatus === 'PEND_CANCEL' && (
                                  <button className="continue-order-btn" onClick={() => this.handleContinueInvoice(billid)} title="Tiếp tục đơn hàng">
                                    <IonIcon icon={refreshOutline}></IonIcon> Tiếp tục đơn hàng
                                  </button>
                                )}
                                <div className="f">
                                  <button onClick={this.handleGeneratePDF} className="pdf-btn">
                                    Tải PDF
                                  </button>
                                  <button onClick={() => this.handleSendEmail(billid)} className="email-btn">
                                    Gửi qua email
                                  </button>
                                  <button onClick={this.handleBackToSearch} className="back-btn">
                                    <IonIcon icon={chevronBack}></IonIcon> Quay về
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="error">Không tìm thấy thông tin hóa đơn.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                case 2: // Chi tiết lịch khám
                  return (
                    <div className="view-invoice-background">
                      <ToastContainer />
                      <div className="view-invoice-modal-app">
                        <div className="view-invoice-modal-content-app">
                          {loadedAppointmentDetails ? (
                            <>
                              <div className="view-invoice-modal-content-top-app">
                                <div className="sb bot">
                                  <div className="view-invoice-modal-content-top-logo-app">
                                    <img src={logo} alt="Logo" />
                                    <br />
                                    <b>Website Thương mại & Dịch vụ Dành cho thú cưng</b>
                                  </div>
                                  <div className="view-invoice-modal-content-top-address-app">
                                    <div className="date">
                                      <b>Ngày khám: </b>
                                      {loadedAppointmentDetails.AppointmentDate ? `${new Date(loadedAppointmentDetails.AppointmentDate).toLocaleDateString('vi-VN')} ${loadedAppointmentDetails.StartTime} - ${loadedAppointmentDetails.EndTime}` : 'N/A'}
                                    </div>
                                    <div>
                                      <p>
                                        <b>Địa chỉ: </b>136 Huỳnh Văn Bánh, p. 11, quận Phú Nhuận, HCM
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="sb mid-top">
                                  <h1>
                                    <b>*Thông tin đặt lịch:</b>
                                  </h1>
                                  <div className="bill-id f">
                                    <b>Mã lịch hẹn: </b>
                                    <p> {billid}</p>
                                  </div>
                                </div>
                                <div className="sb">
                                  <div className="view-invoice-modal-content-top-time-app">
                                    <p>
                                      <b>Thời gian đặt lịch:</b>
                                      {loadedAppointmentDetails.CreatedAt
                                        ? new Date(loadedAppointmentDetails.CreatedAt).toLocaleString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                        : 'N/A'}
                                    </p>
                                    <p>
                                      <b>Khách hàng:</b>
                                      {loadedAppointmentDetails.CustomerName || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Email:</b> {loadedAppointmentDetails.CustomerEmail || 'N/A'}
                                    </p>
                                    <p>
                                      <b>SĐT:</b> {loadedAppointmentDetails.CustomerPhone || 'N/A'}
                                    </p>
                                  </div>
                                  <div className="view-invoice-modal-content-top-invoiceid-app">
                                    <p>
                                      <b>Trạng thái:</b> {codeAppointmentStatus.find((item) => item.Code === loadedAppointmentDetails.AppointmentStatus)?.CodeValueVI || loadedAppointmentDetails.AppointmentStatus || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Dịch vụ:</b> {loadedAppointmentDetails.Service?.ServiceName || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Loại lịch hẹn:</b> {loadedAppointmentDetails.AppointmentType || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Bác sĩ:</b> {loadedAppointmentDetails.VeterinarianID ? 'Đã chỉ định' : 'Chưa chỉ định'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="view-invoice-modal-content-mid-app">
                                <h1>
                                  <b>*Thông tin thú cưng:</b>
                                </h1>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Thú cưng</th>
                                      <th>Loại</th>
                                      <th>Cân nặng</th>
                                      <th>Tuổi</th>
                                      <th>Giới tính</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="view-invoice-modal-content-mid-item-app">
                                      <td>{loadedAppointmentDetails.Pet?.PetName || 'N/A'}</td>
                                      <td>{codePetType.find((item) => item.Code === loadedAppointmentDetails.Pet?.PetType)?.CodeValueVI || loadedAppointmentDetails.Pet?.PetType || 'N/A'}</td>
                                      <td>{loadedAppointmentDetails.Pet?.PetWeight ? `${loadedAppointmentDetails.Pet.PetWeight} kg` : 'N/A'}</td>
                                      <td>{loadedAppointmentDetails.Pet?.Age ? `${loadedAppointmentDetails.Pet.Age} tuổi` : 'N/A'}</td>
                                      <td>{codePetGender.find((item) => item.Code === loadedAppointmentDetails.Pet?.PetGender)?.CodeValueVI || loadedAppointmentDetails.Pet?.PetGender || 'N/A'}</td>
                                    </tr>
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan="6">
                                        <b>Ghi chú:</b> <p>{loadedAppointmentDetails.Notes || 'Không có ghi chú'}</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan="6">
                                        <b>Hình ảnh:</b>
                                        <br />
                                        {loadedAppointmentDetails.Images && loadedAppointmentDetails.Images[0] ? <img src={loadedAppointmentDetails.Images[0].Image} alt="Hình ảnh lịch hẹn" style={{ maxWidth: '200px', margin: '5px' }} /> : <span>Không có hình ảnh</span>}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              <div className="bill-actions-app">
                                {loadedAppointmentDetails.AppointmentStatus === 'PEND' && (
                                  <button className="cancel-order-btn-app" onClick={() => this.handleCancelAppointment(loadedAppointmentDetails.AppointmentID)} title="Hủy lịch hẹn">
                                    <IonIcon icon={closeCircleOutline}></IonIcon> Hủy lịch hẹn
                                  </button>
                                )}
                                <div className="f">
                                  <button onClick={this.handleBackToSearch} className="back-btn-app">
                                    <IonIcon icon={chevronBack}></IonIcon> Quay về
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="error">Không tìm thấy thông tin lịch hẹn.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                case 3: // Hóa đơn Appointment
                  return (
                    <div className="view-invoice-background-appointment">
                      <ToastContainer />
                      <div className="view-invoice-modal-appointment">
                        <div className="view-invoice-modal-content-appointment">
                          {loadedAppointmentBillDetails && loadedAppointmentBillDetails.AppointmentBill ? (
                            <div>
                              <div className="view-invoice-modal-content-top-appointment">
                                <div className="f">
                                  <div className="view-invoice-modal-content-top-logo-appointment">
                                    <img src={logo} alt="Logo" />
                                  </div>
                                  <div className="view-invoice-modal-content-top-address-appointment">
                                    <b>Website Thương mại & Dịch vụ Dành cho thú cưng</b>
                                    <p>
                                      <b>Địa chỉ:</b>136 Huỳnh Văn Bánh, P. 11, Q. Phú Nhuận, Tp.HCM
                                    </p>
                                  </div>
                                </div>
                                <div className="time-appid f">
                                  <div className="view-invoice-modal-content-top-time-appointment">
                                    <p>
                                      <b>Thời gian:</b>
                                      {loadedAppointmentBillDetails.CreatedAt
                                        ? new Date(loadedAppointmentBillDetails.CreatedAt).toLocaleString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="view-invoice-modal-content-top-invoiceid-appointment">
                                    <div className="f">
                                      <b>Mã hóa đơn:</b> <p>{loadedAppointmentBillDetails.AppointmentBill.AppointmentBillID}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="sb">
                                  <div className="view-invoice-modal-content-top-cusname-1-appointment">
                                    <p>
                                      <b>Khách hàng:</b> {loadedAppointmentBillDetails.CustomerName || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Tên thú cưng:</b> {loadedAppointmentBillDetails.Pet?.PetName || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Loại thú cưng:</b> {loadedAppointmentBillDetails.Pet?.PetType || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Giới tính:</b> {loadedAppointmentBillDetails.Pet?.PetGender || 'N/A'}
                                    </p>
                                  </div>
                                  <div className="view-invoice-modal-content-top-status-appointment">
                                    <p>
                                      <b>Trạng thái:</b> {codeAppointmentStatus.find((item) => item.Code === loadedAppointmentBillDetails.AppointmentStatus)?.CodeValueVI || loadedAppointmentBillDetails.AppointmentStatus || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Dịch vụ:</b> {loadedAppointmentBillDetails.Service?.ServiceName || 'N/A'}
                                    </p>
                                    <p>
                                      <b>Bác sĩ:</b> {loadedAppointmentBillDetails.VeterinarianID ? 'Đã chỉ định' : 'Chưa chỉ định'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="view-invoice-modal-content-mid-appointment">
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Ngày khám</th>
                                      <th>Phí dịch vụ</th>
                                      <th>Phí dược phẩm</th>
                                      <th>Tổng thanh toán</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="view-invoice-modal-content-mid-item-appointment">
                                      <td>{loadedAppointmentBillDetails.AppointmentDate ? `${new Date(loadedAppointmentBillDetails.AppointmentDate).toLocaleDateString('vi-VN')} ${loadedAppointmentBillDetails.StartTime} - ${loadedAppointmentBillDetails.EndTime}` : 'N/A'}</td>
                                      <td>{loadedAppointmentBillDetails.AppointmentBill?.ServicePrice ? parseFloat(loadedAppointmentBillDetails.AppointmentBill.ServicePrice).toLocaleString('vi-VN') + ' vnđ' : 'N/A'}</td>
                                      <td>{loadedAppointmentBillDetails.AppointmentBill?.MedicalPrice ? parseFloat(loadedAppointmentBillDetails.AppointmentBill.MedicalPrice).toLocaleString('vi-VN') + ' vnđ' : 'N/A'}</td>
                                      <td>{loadedAppointmentBillDetails.AppointmentBill?.TotalPayment ? parseFloat(loadedAppointmentBillDetails.AppointmentBill.TotalPayment).toLocaleString('vi-VN') + ' vnđ' : 'N/A'}</td>
                                    </tr>
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan="4">
                                        <b>Ghi chú của bác sĩ:</b> <p>{loadedAppointmentBillDetails.AppointmentBill?.MedicalNotes || 'Không có ghi chú'}</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan="2">
                                        <b>Đơn thuốc:</b>
                                        <br />
                                        {loadedAppointmentBillDetails.AppointmentBill?.MedicalImage ? <img src={loadedAppointmentBillDetails.AppointmentBill.MedicalImage} alt="Hình ảnh hóa đơn" style={{ maxWidth: '200px', margin: '5px' }} /> : <span>Không có hình ảnh</span>}
                                      </td>
                                      <td colSpan="2">
                                        <img src={tem} />
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              <div className="bill-actions-appointment">
                                <button onClick={this.handleBackToSearch} className="back-btn-appointment">
                                  <IonIcon icon={chevronBack}></IonIcon> Quay về
                                </button>
                                <div>
                                  <button onClick={() => this.handleSendEmail(loadedAppointmentBillDetails.AppointmentBill.AppointmentBillID)} className="email-btn-appointment">
                                    Gửi qua email
                                  </button>
                                  <button onClick={() => console.log(`Tải PDF cho mã hóa đơn: ${loadedAppointmentBillDetails.AppointmentBill.AppointmentBillID}`)} className="pdf-btn-appointment">
                                    Tải PDF
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="error">Không tìm thấy thông tin hóa đơn.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })()}
          </div>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  billInfo: state.bill.billInfo,
});

const mapDispatchToProps = (dispatch) => ({
  clearBillSearchInfo: () => dispatch(clearBillSearchInfo()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Bill);
