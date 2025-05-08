import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import "./OwnerViewInvoiceModal.scss";
import logo from "../../assets/images/logo1.png";
import {
  handleGetOrderDetails,
} from "../../services/billService";
import {
  handleGetProductInfoApi,
  handleGetProductDetailInfoApi,
} from "../../services/productServices";

class OwnerViewInvoiceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderDetails: null,
      productNames: {}, // Lưu TenSanPham theo MASANPHAM
      detailNames: {}, // Lưu TenCTSP theo MACTSP
      error: null,
      loading: true,
    };
  }

  componentDidMount() {
    if (this.props.hoadon && this.props.hoadon.MADONHANG) {
      this.loadOrderDetails(this.props.hoadon.MADONHANG);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.hoadon?.MADONHANG !== this.props.hoadon?.MADONHANG &&
      this.props.hoadon?.MADONHANG
    ) {
      this.loadOrderDetails(this.props.hoadon.MADONHANG);
    }
  }

  getShippingFee = () => {
    const { orderDetails } = this.state;
    const deliveryMethod = orderDetails?.deliveryMethod?.Code || "FAST";
    switch (deliveryMethod) {
      case "FAST":
        return 21000;
      case "ECO":
        return 15000;
      case "EXPRESS":
        return 40000;
      default:
        return 21000;
    }
  };

  loadOrderDetails = async (madonhang) => {
    this.setState({ loading: true, error: null });
    try {
      const response = await handleGetOrderDetails(madonhang);
      console.log("handleGetOrderDetails response:", response);

      if (response && response.errCode === 0) {
        const orderDetails = response.data;
        this.setState({ orderDetails });

        // Lấy tên sản phẩm và tên chi tiết sản phẩm
        const productNames = {};
        const detailNames = {};

        for (const item of orderDetails.orderInfo) {
          // Gọi API lấy TenSanPham
          const productResponse = await handleGetProductInfoApi(item.masanpham);
          if (productResponse && productResponse.errCode === 0) {
            productNames[item.masanpham] = productResponse.data.TenSanPham;
          } else {
            productNames[item.masanpham] = item.masanpham; // Fallback
          }

          // Gọi API lấy TenCTSP
          const detailResponse = await handleGetProductDetailInfoApi(
            item.masanpham,
            item.mactsp
          );
          if (detailResponse && detailResponse.errCode === 0) {
            detailNames[item.mactsp] = detailResponse.data.TenCTSP;
          } else {
            detailNames[item.mactsp] = item.mactsp; // Fallback
          }
        }

        this.setState({ productNames, detailNames, loading: false });
      } else {
        this.setState({
          error: response?.errMessage || "Không thể tải thông tin hóa đơn!",
          loading: false,
        });
        toast.error("Không thể tải thông tin hóa đơn!");
      }
    } catch (e) {
      console.error("Error loading order details:", e);
      this.setState({
        error: "Lỗi khi tải thông tin hóa đơn, vui lòng thử lại!",
        loading: false,
      });
      toast.error("Lỗi khi tải thông tin hóa đơn!");
    }
  };

  toggle = () => {
    this.props.toggleFromModal();
  };

  handleSendEmail = () => {
    toast.info("Tính năng chưa có!", {
      autoClose: 2000,
      closeOnClick: true,
    });
  };

  render() {
    const { orderDetails, productNames, detailNames, error, loading } = this.state;

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
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : orderDetails ? (
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
                        {orderDetails.NgayLapDonHang
                          ? new Date(orderDetails.NgayLapDonHang).toLocaleString(
                            "vi-VN"
                          )
                          : "N/A"}
                      </p>
                    </div>
                    <div className="view-invoice-modal-content-top-invoiceid">
                      <p>Mã hóa đơn: {orderDetails.MADONHANG}</p>
                    </div>
                  </div>
                  <div className="view-invoice-modal-content-top-cusname">
                    <p>Khách hàng: {orderDetails.TenKhachHang || "N/A"}</p>
                  </div>
                </div>
                <div className="view-invoice-modal-content-mid">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <th>Loại</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.orderInfo && orderDetails.orderInfo.length > 0 ? (
                        orderDetails.orderInfo.map((item, index) => (
                          <tr
                            key={index}
                            className="view-invoice-modal-content-mid-item"
                          >
                            <td>
                              {productNames[item.masanpham] || item.masanpham}
                            </td>
                            <td>{detailNames[item.mactsp] || item.mactsp}</td>
                            <td>
                              {item.dongia.toLocaleString()}
                              <sup>đ</sup>
                            </td>
                            <td>{item.soluong}</td>
                            <td>
                              {(item.soluong * item.dongia).toLocaleString()}
                              <sup>đ</sup>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">Không có sản phẩm nào.</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4">Tổng sản phẩm:</td>
                        <td className="cen">
                          {orderDetails.orderInfo.reduce(
                            (sum, item) => sum + item.soluong,
                            0
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4">Tổng tiền hàng:</td>
                        <td className="cen">
                          {orderDetails.orderInfo
                            .reduce(
                              (sum, item) => sum + item.soluong * item.dongia,
                              0
                            )
                            .toLocaleString()}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4">
                          Phí vận chuyển (
                          {orderDetails?.deliveryMethod?.Code === "FAST"
                            ? "Giao hàng chuyển phát nhanh"
                            : orderDetails?.deliveryMethod?.Code === "ECO"
                              ? "Giao hàng tiết kiệm"
                              : "Giao hàng hỏa tốc"}
                          ):
                        </td>
                        <td className="cen">
                          {this.getShippingFee().toLocaleString()}
                          <sup>đ</sup>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4">
                          <b>Tổng thanh toán:</b>
                        </td>
                        <td className="cen">
                          <b>
                            {orderDetails.TongTien.toLocaleString()}
                            <sup>đ</sup>
                          </b>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5">
                          <p>
                            <u>*Lưu ý:</u> giá thành tiền của sản phẩm đã bao
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
          {/* <Button variant="primary" onClick={this.handleSendEmail}>
            Gửi qua mail
          </Button> */}
        </Modal.Footer>
      </Modal>
    );
  }
}

export default OwnerViewInvoiceModal;