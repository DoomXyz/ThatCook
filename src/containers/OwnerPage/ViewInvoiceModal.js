import React, { Component } from 'react';
import { toast } from 'react-toastify';

import './ViewInvoiceModal.scss';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { handleGetInvoiceDetailInfoApi, handleSendInvoiceEmailApi } from '../../services/invoiceServices';

import { getAllCodes, generateInvoicePDF } from '../../utils/pakage';

import logo from '../../assets/images/logo1.png';

class ViewInvoiceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedInvoiceDetails: null,
      codePaymentType: [],
      codeShippingMethod: [],
      codeShippingStatus: [],
      email: '',
    };
  }
  async componentDidMount() {
    await this.handleLoadCode(['PaymentType', 'ShippingMethod', 'ShippingStatus']);
  }
  async componentDidUpdate(prevProps) {
    const { selectedInvoiceID, isOpen } = this.props;
    if (isOpen && !prevProps.isOpen) {
      if (selectedInvoiceID) {
        this.resetState();
        await this.handleLoadInvoiceDetails(selectedInvoiceID);
      }
    }
  }
  handleLoadCode = async (codeTypes) => {
    try {
      const responses = await Promise.all(codeTypes.map((type) => getAllCodes(type)));
      const newState = { isLoading: false };
      codeTypes.forEach((type, index) => {
        const response = responses[index];
        if (!response.status || response.data.length === 0) {
          toast.error(`Không thể tải danh sách ${type}!`);
        }
        newState[`code${type}`] = response.data;
      });
      this.setState(newState);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Lỗi khi tải dữ liệu!');
      this.setState({ isLoading: false });
    }
  };
  resetState = () => {
    this.setState({
      email: '',
    });
  };
  toggle = () => {
    this.resetState();
    this.props.toggleFromModal();
  };
  handleLoadInvoiceDetails = async (invoiceid) => {
    try {
      const response = await handleGetInvoiceDetailInfoApi(invoiceid);
      if (response && response.errCode === 0) {
        this.setState({ loadedInvoiceDetails: response.data });
      } else {
        toast.error(response?.errMessage || 'Không thể tải thông tin hóa đơn!');
      }
    } catch (e) {
      console.error('Error loading invoice details:', e);
      toast.error('Lỗi khi tải thông tin hóa đơn: ' + e.message);
    }
  };
  getShippingFee = (shippingMethod) => {
    const method = this.state.codeShippingMethod.find((item) => item.Code === shippingMethod);
    return method ? parseFloat(method.ExtraValue) || 0 : 0;
  };
  handleGeneratePDF = (data) => {
    if (!data) {
      toast.error('Không có dữ liệu hóa đơn để tạo PDF!');
      return;
    }
    generateInvoicePDF(data);
  };
  handleSendEmail = async (billid) => {
    const { email } = this.state;
    if (!email) {
      toast.info('Hãy nhập Email để gửi hóa đơn!');
      return;
    }
    try {
      this.setState({ isLoading: true });
      const sendInfo = {
        billid,
        email,
      };
      const response = await handleSendInvoiceEmailApi(sendInfo);
      if (response && response.errCode === 0) {
        toast.success('Gửi email thành công!');
        this.setState({ actionPage: 0 });
      } else {
        toast.error(response?.errMessage || 'Gửi email thất bại!');
      }
    } catch (e) {
      console.log('Lỗi khi gửi email:', e);
      toast.error('Lỗi khi gửi email!');
    }
    this.setState({ isLoading: false });
  };

  render() {
    const { loadedInvoiceDetails, codePaymentType, codeShippingMethod, codeShippingStatus, email } = this.state;
    const { selectedInvoiceID } = this.props;

    return (
      <Modal show={this.props.isOpen} onHide={this.toggle} centered backdrop="static" className="view-invoice-modal">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết hóa đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                      <p>Mã hóa đơn: {selectedInvoiceID}</p>
                    </div>
                  </div>
                  <div className="view-invoice-modal-content-top-cusname">
                    <div className="f">
                      {' '}
                      <p>Khách hàng: {loadedInvoiceDetails.ReceiverName}</p>
                      <p>SĐT: {loadedInvoiceDetails.ReceiverPhone}</p>
                    </div>
                    <p>Địa chỉ: {loadedInvoiceDetails.ReceiverAddress}</p>
                  </div>
                  <div className="view-invoice-modal-content-top-status">
                    <p>Phương thức thanh toán: {codePaymentType.find((item) => item.Code === loadedInvoiceDetails.PaymentType)?.CodeValueVI || loadedInvoiceDetails.PaymentType}</p>
                    <p>Phương thức giao hàng: {codeShippingMethod.find((item) => item.Code === loadedInvoiceDetails.ShippingMethod)?.CodeValueVI || loadedInvoiceDetails.ShippingMethod}</p>
                    <p>Trạng thái giao hàng: {codeShippingStatus.find((item) => item.Code === loadedInvoiceDetails.ShippingStatus)?.CodeValueVI || loadedInvoiceDetails.ShippingStatus}</p>
                    {loadedInvoiceDetails.CancelReason !== null ? <p>Lí do hủy đơn hàng: {loadedInvoiceDetails.CancelReason}</p> : ''}
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
                      {loadedInvoiceDetails.DiscountAmount > 0 ? (
                        <tr>
                          <td colSpan="5">Giảm giá:</td>
                          <td className="cen">
                            -{parseFloat(loadedInvoiceDetails.DiscountAmount || 0).toLocaleString('vi-VN')}
                            <sup>đ</sup>
                          </td>
                        </tr>
                      ) : (
                        ''
                      )}
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
              </>
            ) : (
              <div className="error">Không tìm thấy thông tin hóa đơn.</div>
            )}
          </div>
          <div className="view-invoice-modal-footer">
            <div className="send-mail sb">
              <input type="text" value={email} placeholder="Hãy nhập email để gửi hóa đơn" onChange={(e) => this.setState({ email: e.target.value })} />
              <Button className="mail" variant="primary" onClick={() => this.handleSendEmail(loadedInvoiceDetails?.InvoiceID)}>
                Gửi qua mail
              </Button>
            </div>
            <div className="sb">
              {loadedInvoiceDetails && (
                <>
                  {loadedInvoiceDetails.ShippingStatus === 'PEND' && (
                    <Button
                      variant="danger"
                      onClick={() => {
                        this.props.handleSelectedCancelInvoice(loadedInvoiceDetails.InvoiceID);
                        this.handleLoadInvoiceDetails(selectedInvoiceID);
                      }}
                    >
                      Hủy hóa đơn
                    </Button>
                  )}
                  {loadedInvoiceDetails.PaymentStatus === 'PEND' && loadedInvoiceDetails.ShippingStatus !== 'CANCELED' && loadedInvoiceDetails.ShippingStatus !== 'PEND_CANCEL' && (
                    <Button
                      className="confirm-payment"
                      variant="primary"
                      onClick={async () => {
                        await this.props.handleConfirmPayment(loadedInvoiceDetails.InvoiceID);

                        await this.handleLoadInvoiceDetails(selectedInvoiceID);
                      }}
                      disabled={this.props.disabledButtons?.confirmPayment}
                    >
                      Xác nhận thanh toán
                    </Button>
                  )}

                  {loadedInvoiceDetails.PaymentStatus === 'PAID' && loadedInvoiceDetails.ShippingStatus !== 'CANCELED' && loadedInvoiceDetails.ShippingStatus !== 'DELI' && loadedInvoiceDetails.ShippingStatus !== 'PEND_CANCEL' && (
                    <Button
                      variant="primary"
                      onClick={async () => {
                        await this.props.handleConfirmDelivery(loadedInvoiceDetails.InvoiceID);
                        await this.handleLoadInvoiceDetails(selectedInvoiceID);
                      }}
                      disabled={this.props.disabledButtons?.confirmDelivery}
                    >
                      Xác nhận giao hàng
                    </Button>
                  )}

                  {loadedInvoiceDetails.ShippingStatus === 'PEND_CANCEL' && (
                    <>
                      <Button
                        variant="success"
                        onClick={async () => {
                          await this.props.handleAcceptCancelInvoice(loadedInvoiceDetails.InvoiceID);
                          await this.handleLoadInvoiceDetails(selectedInvoiceID);
                        }}
                        disabled={this.props.disabledButtons?.acceptCancelInvoice}
                      >
                        Chấp nhận hủy
                      </Button>
                      <Button
                        variant="warning"
                        onClick={async () => {
                          await this.props.handleDenyCancelInvoice(loadedInvoiceDetails.InvoiceID);
                          await this.handleLoadInvoiceDetails(selectedInvoiceID);
                        }}
                        disabled={this.props.disabledButtons?.denyCancelInvoice}
                      >
                        Từ chối hủy
                      </Button>
                    </>
                  )}
                </>
              )}
              <div></div>

              <Button className="pdf" variant="primary" onClick={() => this.handleGeneratePDF(loadedInvoiceDetails)}>
                Tải PDF
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    );
  }
}

export default ViewInvoiceModal;
