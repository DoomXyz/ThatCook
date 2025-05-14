import React, { Component } from "react";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "./ViewInvoiceModal.scss";
import logo from "../../assets/images/logo1.png";
import { handleGetInvoiceDetailInfoApi } from "../../services/invoiceServices";
import { handleGetAllCodesApi } from "../../services/utilitiesServices";

class ViewInvoiceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedInvoiceDetails: null,
      codePaymentType: [],
      codeShippingMethod: [],
      codeShippingStatus: [],
    };
  }

  async componentDidMount() {
    await Promise.all([
      this.handleLoadCodePaymentType(),
      this.handleLoadCodeShippingMethod(),
      this.handleLoadCodeShippingStatus(),
    ]);
    if (this.props.selectedInvoiceID) {
      await this.handleLoadInvoiceDetails(this.props.selectedInvoiceID);
    }
    setTimeout(() => {
      console.log(this.state.loadedInvoiceDetails)
    })
  }

  async componentDidUpdate(prevProps) {
    if (
      this.props.isOpen &&
      prevProps.selectedInvoiceID !== this.props.selectedInvoiceID &&
      this.props.selectedInvoiceID
    ) {
      this.setState({ loadedInvoiceDetails: null });
      await this.handleLoadInvoiceDetails(this.props.selectedInvoiceID);
    }
  }

  handleLoadCodePaymentType = async () => {
    try {
      const codePaymentType = await handleGetAllCodesApi("PaymentType");
      if (!codePaymentType || codePaymentType.length === 0) {
        toast.error("Không thể tải danh sách phương thức thanh toán!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codePaymentType });
    } catch (e) {
      console.error("Error loading payment type code:", e);
      toast.error("Lỗi khi tải danh sách phương thức thanh toán!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadCodeShippingMethod = async () => {
    try {
      const codeShippingMethod = await handleGetAllCodesApi("ShippingMethod");
      if (!codeShippingMethod || codeShippingMethod.length === 0) {
        toast.error("Không thể tải danh sách phương thức giao hàng!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codeShippingMethod });
    } catch (e) {
      console.error("Error loading shipping method code:", e);
      toast.error("Lỗi khi tải danh sách phương thức giao hàng!", {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  handleLoadCodeShippingStatus = async () => {
    try {
      const codeShippingStatus = await handleGetAllCodesApi("ShippingStatus");
      if (!codeShippingStatus || codeShippingStatus.length === 0) {
        toast.error("Không thể tải danh sách trạng thái giao hàng!", {
          position: "top-right",
          autoClose: 500,
          closeOnClick: true,
        });
      }
      this.setState({ codeShippingStatus });
    } catch (e) {
      console.error("Error loading shipping status code:", e);
      toast.error("Lỗi khi tải danh sách trạng thái giao hàng!", {
        position: "top-right",
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
        toast.error(
          response?.errMessage || "Không thể tải thông tin hóa đơn!",
          {
            position: "top-right",
            autoClose: 500,
            closeOnClick: true,
          }
        );
      }
    } catch (e) {
      console.error("Error loading invoice details:", e);
      toast.error("Lỗi khi tải thông tin hóa đơn: " + e.message, {
        position: "top-right",
        autoClose: 500,
        closeOnClick: true,
      });
    }
  };

  toggle = () => {
    this.props.toggleFromModal();
  };

  handleSendEmail = () => {
    toast.info("Tính năng gửi email chưa được hỗ trợ!", {
      position: "top-right",
      autoClose: 500,
      closeOnClick: true,
    });
  };

  getShippingFee = (shippingMethod) => {
    const method = this.state.codeShippingMethod.find(
      (item) => item.Code === shippingMethod
    );
    return method ? parseFloat(method.ExtraValue) || 0 : 0;
  };

  render() {
    const {
      loadedInvoiceDetails,
      codePaymentType,
      codeShippingMethod,
      codeShippingStatus,
    } = this.state;
    const { selectedInvoiceID } = this.props;

    return (
      <Modal
        show={this.props.isOpen}
        onHide={this.toggle}
        centered
        backdrop="static"
        className="view-invoice-modal"
      >
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
                        Thời gian:{" "}
                        {loadedInvoiceDetails.CreatedAt
                          ? new Date(
                            loadedInvoiceDetails.CreatedAt
                          ).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="view-invoice-modal-content-top-invoiceid">
                      <p>Mã hóa đơn: {selectedInvoiceID}</p>
                    </div>
                  </div>
                  <div className="view-invoice-modal-content-top-cusname">
                    <p>Khách hàng: {loadedInvoiceDetails.ReceiverName}</p>
                    <p>SĐT: {loadedInvoiceDetails.ReceiverPhone}</p>
                    <p>Địa chỉ: {loadedInvoiceDetails.ReceiverAddress}</p>
                  </div>
                  <div className="view-invoice-modal-content-top-status">
                    <p>
                      Phương thức thanh toán:{" "}
                      {codePaymentType.find(
                        (item) => item.Code === loadedInvoiceDetails.PaymentType
                      )?.CodeValueVI || loadedInvoiceDetails.PaymentType}
                    </p>
                    <p>
                      Phương thức giao hàng:{" "}
                      {codeShippingMethod.find(
                        (item) =>
                          item.Code === loadedInvoiceDetails.ShippingMethod
                      )?.CodeValueVI || loadedInvoiceDetails.ShippingMethod}
                    </p>
                    <p>
                      Trạng thái giao hàng:{" "}
                      {codeShippingStatus.find(
                        (item) =>
                          item.Code === loadedInvoiceDetails.ShippingStatus
                      )?.CodeValueVI || loadedInvoiceDetails.ShippingStatus}
                    </p>
                    {loadedInvoiceDetails.CancelReason !== null ?
                      <p>
                        Lí do hủy đơn hàng:{" "}
                        {loadedInvoiceDetails.CancelReason}
                      </p> : ""}
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
                      {loadedInvoiceDetails.ProductList &&
                        loadedInvoiceDetails.ProductList.length > 0 ? (
                        loadedInvoiceDetails.ProductList.map((item, index) => (
                          <tr
                            key={index}
                            className="view-invoice-modal-content-mid-item"
                          >
                            <td>
                              <img
                                src={item.ProductImage || ""}
                                alt={item.ProductName}
                                style={{ width: "50px", height: "50px" }}
                              />
                            </td>
                            <td>{item.ProductName}</td>
                            <td>{item.DetailName}</td>
                            <td>
                              {parseFloat(item.ItemPrice).toLocaleString(
                                "vi-VN"
                              )}
                              <sup>đ</sup>
                            </td>
                            <td>{item.ItemQuantity}</td>
                            <td>
                              {(
                                parseFloat(item.ItemPrice) * item.ItemQuantity
                              ).toLocaleString("vi-VN")}
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
                        <td className="cen">
                          {loadedInvoiceDetails.TotalQuantity}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">Tổng tiền hàng:</td>
                        <td className="cen">
                          {parseFloat(
                            loadedInvoiceDetails.TotalPrice
                          ).toLocaleString("vi-VN")}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">
                          Phí vận chuyển (
                          {codeShippingMethod.find(
                            (item) =>
                              item.Code === loadedInvoiceDetails.ShippingMethod
                          )?.CodeValueVI || loadedInvoiceDetails.ShippingMethod}
                          ):
                        </td>
                        <td className="cen">
                          {this.getShippingFee(
                            loadedInvoiceDetails.ShippingMethod
                          ).toLocaleString("vi-VN")}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">Giảm giá:</td>
                        <td className="cen">
                          -{parseFloat(
                            loadedInvoiceDetails.DiscountAmount || 0
                          ).toLocaleString("vi-VN")}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">
                          <b>Tổng thanh toán:</b>
                        </td>
                        <td className="cen">
                          <b>
                            {parseFloat(
                              loadedInvoiceDetails.TotalPayment
                            ).toLocaleString("vi-VN")}
                            <sup>đ</sup>
                          </b>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="6">
                          <p>
                            <u>*Lưu ý:</u> Giá thành tiền của sản phẩm đã bao
                            gồm khuyến mãi (nếu có).
                            <br />
                            Mọi thắc mắc xin liên hệ với bộ phận chăm sóc khách
                            hàng <b>(0901131141)</b>.
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.toggle}>
            Đóng
          </Button>
          <Button variant="primary" onClick={this.handleSendEmail}>
            Gửi qua mail
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ViewInvoiceModal;