import React, { Component } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import './Bill.scss';
import logo from '../../assets/images/logo1.png';
import Header from '../../components/HomeHeader';
import { handleGetInvoiceDetailInfoApi, handleChangeInvoiceStatusApi } from '../../services/invoiceServices';
import { handleGetAllCodesApi } from '../../services/utilitiesServices';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import RobotoRegularFont from '../../assets/fonts/Roboto-Regular-normal.js';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline, refreshOutline } from 'ionicons/icons';
import CancelInvoiceModal from '../../components/CancelInvoiceModal';

class BillClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedInvoiceDetails: null,
      codePaymentType: [],
      codeShippingMethod: [],
      codeShippingStatus: [],
      isShowCancelInvoiceModal: false,
      selectedCancelInvoice: null,
    };
  }

  async componentDidMount() {
    await Promise.all([this.handleLoadCodePaymentType(), this.handleLoadCodeShippingMethod(), this.handleLoadCodeShippingStatus()]);
    if (this.props.madonhang) {
      await this.handleLoadInvoiceDetails(this.props.madonhang);
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.madonhang !== this.props.madonhang && this.props.madonhang) {
      this.setState({ loadedInvoiceDetails: null });
      await this.handleLoadInvoiceDetails(this.props.madonhang);
    }
  }

  handleLoadCodePaymentType = async () => {
    try {
      const codePaymentType = await handleGetAllCodesApi('PaymentType');
      if (!codePaymentType || codePaymentType.length === 0) {
        toast.error('Không thể tải danh sách phương thức thanh toán!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codePaymentType });
    } catch (e) {
      console.error('Error loading payment type code:', e);
      toast.error('Lỗi khi tải danh sách phương thức thanh toán!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadCodeShippingMethod = async () => {
    try {
      const codeShippingMethod = await handleGetAllCodesApi('ShippingMethod');
      if (!codeShippingMethod || codeShippingMethod.length === 0) {
        toast.error('Không thể tải danh sách phương thức giao hàng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codeShippingMethod });
    } catch (e) {
      console.error('Error loading shipping method code:', e);
      toast.error('Lỗi khi tải danh sách phương thức giao hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadCodeShippingStatus = async () => {
    try {
      const codeShippingStatus = await handleGetAllCodesApi('ShippingStatus');
      if (!codeShippingStatus || codeShippingStatus.length === 0) {
        toast.error('Không thể tải danh sách trạng thái giao hàng!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codeShippingStatus });
    } catch (e) {
      console.error('Error loading shipping status code:', e);
      toast.error('Lỗi khi tải danh sách trạng thái giao hàng!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadInvoiceDetails = async (invoiceId) => {
    try {
      const response = await handleGetInvoiceDetailInfoApi(invoiceId);
      if (response && response.errCode === 0) {
        this.setState({ loadedInvoiceDetails: response.data });
      } else {
        toast.error(response?.errMessage || 'Không thể tải thông tin hóa đơn!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error loading invoice details:', e);
      toast.error('Lỗi khi tải thông tin hóa đơn: ' + e.message, {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  getShippingFee = (shippingMethod) => {
    const method = this.state.codeShippingMethod.find((item) => item.Code === shippingMethod);
    return method ? parseFloat(method.ExtraValue) || 0 : 0;
  };

  handleGeneratePDF = () => {
    const { loadedInvoiceDetails, codePaymentType, codeShippingMethod, codeShippingStatus } = this.state;
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

    const dateText = `Thời gian: ${
      loadedInvoiceDetails.CreatedAt
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
    doc.text(`Mã hóa đơn: ${this.props.madonhang}`, 150, 42, {
      align: 'right',
    });

    const customerText = `Khách hàng: ${loadedInvoiceDetails.ReceiverName}\nSĐT: ${loadedInvoiceDetails.ReceiverPhone}\nĐịa chỉ: ${loadedInvoiceDetails.ReceiverAddress}`;
    doc.text(customerText, 14, 50);

    const statusText = `Phương thức thanh toán: ${codePaymentType.find((item) => item.Code === loadedInvoiceDetails.PaymentType)?.CodeValueVI || loadedInvoiceDetails.PaymentType}\nPhương thức giao hàng: ${codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod}\nTrạng thái giao hàng: ${
      codeShippingStatus.find((item) => item.Code === loadedInvoiceDetails.ShippingStatus)?.CodeValueVI || loadedInvoiceDetails.ShippingStatus
    }`;
    doc.text(statusText, 14, 70);

    doc.setLineWidth(0.5);
    doc.line(14, 85, 196, 85);

    const tableData = loadedInvoiceDetails.ProductList.map((item) => [item.ProductName, item.DetailName, `${parseFloat(item.ItemPrice).toLocaleString('vi-VN')}đ`, item.ItemQuantity, `${(parseFloat(item.ItemPrice) * item.ItemQuantity).toLocaleString('vi-VN')}đ`]);

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
    doc.text(`Tổng sản phẩm: ${loadedInvoiceDetails.TotalQuantity}`, 14, finalY + 10);
    doc.text(`Tổng tiền hàng: ${parseFloat(loadedInvoiceDetails.TotalPrice).toLocaleString('vi-VN')}đ`, 14, finalY + 16);
    doc.text(`Phí vận chuyển (${codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod}): ${this.getShippingFee(loadedInvoiceDetails.ShippingMethod).toLocaleString('vi-VN')}đ`, 14, finalY + 22);
    doc.text(`Giảm giá: -${parseFloat(loadedInvoiceDetails.DiscountAmount || 0).toLocaleString('vi-VN')}đ`, 14, finalY + 28);
    doc.setFont(fontLoaded ? 'Roboto-Regular' : 'Helvetica', 'normal');
    doc.text(`Tổng thanh toán: ${parseFloat(loadedInvoiceDetails.TotalPayment).toLocaleString('vi-VN')}đ`, 14, finalY + 34);

    doc.setLineWidth(0.5);
    doc.line(14, finalY + 38, 196, finalY + 38);

    const note1 = '*Lưu ý: giá thành tiền của sản phẩm đã bao gồm khuyến mãi (nếu có).';
    const note2 = 'Mọi thắc mắc xin liên hệ với bộ phận chăm sóc khách hàng (0901131141).';

    doc.setFontSize(9);
    const splitNote1 = doc.splitTextToSize(note1, 180);
    const splitNote2 = doc.splitTextToSize(note2, 180);

    doc.text(splitNote1, 14, finalY + 46);
    doc.text(splitNote2, 14, finalY + 54);

    doc.save(`HoaDon_${this.props.madonhang}.pdf`);
  };

  handleSendEmail = () => {
    toast.info('Tính năng gửi email chưa được hỗ trợ!', {
      position: 'top-right',
      autoClose: 500,
      closeOnClick: true,
    });
  };

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

    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'DELI', '');
      if (response && response.errCode === 0) {
        toast.success('Xác nhận nhận hàng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceDetails(invoiceid);
      } else {
        toast.error(response?.errMessage || 'Xác nhận nhận hàng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error confirming received:', e);
      toast.error('Xảy ra lỗi khi xác nhận nhận hàng, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
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

    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'PEND', '');
      if (response && response.errCode === 0) {
        toast.success('Tiếp tục đơn hàng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceDetails(invoiceid);
      } else {
        toast.error(response?.errMessage || 'Tiếp tục đơn hàng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error continuing invoice:', e);
      toast.error('Xảy ra lỗi khi tiếp tục đơn hàng, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
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
    try {
      const response = await handleChangeInvoiceStatusApi(invoiceid, 'ShippingStatus', 'PEND_CANCEL', cancelreason);
      if (response && response.errCode === 0) {
        toast.success('Gửi yêu cầu hủy đơn hàng thành công!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
        await this.handleLoadInvoiceDetails(invoiceid);
        this.setState({
          isShowCancelInvoiceModal: false,
          selectedCancelInvoice: null,
        });
      } else {
        toast.error(response?.errMessage || 'Gửi yêu cầu hủy đơn hàng thất bại!', {
          position: 'top-right',
          autoClose: 500,
          closeOnClick: true,
        });
      }
    } catch (e) {
      console.error('Error canceling invoice:', e);
      toast.error('Xảy ra lỗi khi gửi yêu cầu hủy đơn hàng, vui lòng thử lại!', {
        position: 'top-right',
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  render() {
    const { loadedInvoiceDetails, codePaymentType, codeShippingMethod, codeShippingStatus, isShowCancelInvoiceModal, selectedCancelInvoice } = this.state;
    const { madonhang, cartItems, userInfo } = this.props;

    return (
      <div className="view-invoice-background">
        <Header navigate={this.props.navigate} cartItems={cartItems} userInfo={userInfo} />
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
                      <p>Mã hóa đơn: {madonhang}</p>
                    </div>
                  </div>
                  <div className="view-invoice-modal-content-top-cusname-1">
                    <p>Khách hàng: {loadedInvoiceDetails.ReceiverName}</p>
                    <p>SĐT: {loadedInvoiceDetails.ReceiverPhone}</p>
                    <p>Địa chỉ: {loadedInvoiceDetails.ReceiverAddress}</p>
                  </div>
                  <div className="view-invoice-modal-content-top-status">
                    <p>Phương thức thanh toán: {codePaymentType.find((item) => item.Code === loadedInvoiceDetails.PaymentType)?.CodeValueVI || loadedInvoiceDetails.PaymentType}</p>
                    <p>Phương thức giao hàng: {codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod}</p>
                    <p>Trạng thái giao hàng: {codeShippingStatus.find((item) => item.Code === loadedInvoiceDetails.ShippingStatus)?.CodeValueVI || loadedInvoiceDetails.ShippingStatus}</p>
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
                      {loadedInvoiceDetails.ProductList && loadedInvoiceDetails.ProductList.length > 0 ? (
                        loadedInvoiceDetails.ProductList.map((item, index) => (
                          <tr key={index} className="view-invoice-modal-content-mid-item">
                            <td>
                              <img src={item.ProductImage || ''} alt={item.ProductName} style={{ width: '50px', height: '50px' }} />
                            </td>
                            <td>{item.ProductName}</td>
                            <td>{item.DetailName}</td>
                            <td>
                              {parseFloat(item.ItemPrice).toLocaleString('vi-VN')}
                              <sup>đ</sup>
                            </td>
                            <td>{item.ItemQuantity}</td>
                            <td>
                              {(parseFloat(item.ItemPrice) * item.ItemQuantity).toLocaleString('vi-VN')}
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
                        <td className="cen">{loadedInvoiceDetails.TotalQuantity}</td>
                      </tr>
                      <tr>
                        <td colSpan="5">Tổng tiền hàng:</td>
                        <td className="cen">
                          {parseFloat(loadedInvoiceDetails.TotalPrice).toLocaleString('vi-VN')}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">
                          Phí vận chuyển ({codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod}
                          ):
                        </td>
                        <td className="cen">
                          {this.getShippingFee(loadedInvoiceDetails.ShippingMethod).toLocaleString('vi-VN')}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">Giảm giá:</td>
                        <td className="cen">
                          -{parseFloat(loadedInvoiceDetails.DiscountAmount || 0).toLocaleString('vi-VN')}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">
                          <b>Tổng thanh toán:</b>
                        </td>
                        <td className="cen">
                          <b>
                            {parseFloat(loadedInvoiceDetails.TotalPayment).toLocaleString('vi-VN')}
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
                    <button className="cancel-order-btn" onClick={() => this.handleSelectedCancelInvoice(madonhang)} title="Hủy đơn hàng">
                      <IonIcon icon={closeCircleOutline}></IonIcon> Hủy đơn hàng
                    </button>
                  )}
                  {loadedInvoiceDetails.PaymentStatus === 'PAID' && loadedInvoiceDetails.ShippingStatus === 'PEND' && (
                    <button className="received-order-btn" onClick={() => this.handleConfirmReceived(madonhang)} title="Xác nhận giao hàng">
                      <IonIcon icon={checkmarkCircleOutline}></IonIcon> Xác nhận giao hàng
                    </button>
                  )}
                  {(loadedInvoiceDetails.PaymentStatus === 'PEND' || loadedInvoiceDetails.PaymentStatus === 'PAID') && loadedInvoiceDetails.ShippingStatus === 'PEND_CANCEL' && (
                    <button className="continue-order-btn" onClick={() => this.handleContinueInvoice(madonhang)} title="Tiếp tục đơn hàng">
                      <IonIcon icon={refreshOutline}></IonIcon> Tiếp tục đơn hàng
                    </button>
                  )}
                  <div className="f">
                    <button onClick={this.handleGeneratePDF} className="pdf-btn">
                      Tải PDF
                    </button>
                    <button onClick={this.handleSendEmail} className="email-btn">
                      Gửi qua email
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
  }
}

const Bill = () => {
  const { madonhang } = useParams();
  const navigate = useNavigate();
  return <BillClass madonhang={madonhang} navigate={navigate} cartItems={[]} userInfo={null} />;
};

export default Bill;
