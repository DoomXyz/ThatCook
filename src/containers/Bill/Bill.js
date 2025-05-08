import React, { Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Bill.scss";
import { handleGetOrderDetails } from "../../services/billService";
import logo from "../../assets/images/logo1.png";
import Header from "../../components/HomeHeader";
import {
  handleGetProductInfoApi,
  handleGetProductDetailInfoApi,
} from "../../services/productServices";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Import custom font
import RobotoRegularFont from "../../assets/fonts/Roboto-Regular-normal.js"; // Adjust path as needed

class BillClass extends Component {
  state = {
    orderDetails: null,
    error: null,
    productNames: {},
    detailNames: {},
  };

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

  componentDidMount() {
    console.log("madonhang from props:", this.props.madonhang);
    this.loadOrderDetails();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.madonhang !== this.props.madonhang) {
      console.log("madonhang from props:", this.props.madonhang);
      this.loadOrderDetails();
    }
  }

  loadOrderDetails = async () => {
    const madonhang = this.props.madonhang;

    if (!madonhang) {
      this.setState({ error: "Không tìm thấy mã đơn hàng!" });
      setTimeout(() => {
        this.props.navigate("/home");
      }, 2000);
      return;
    }

    try {
      const response = await handleGetOrderDetails(madonhang);
      console.log("handleGetOrderDetails response:", response);

      if (response && response.errCode === 0) {
        const orderDetails = response.data;
        this.setState({ orderDetails });

        const productNames = {};
        const detailNames = {};

        for (const item of orderDetails.orderInfo) {
          const productResponse = await handleGetProductInfoApi(item.masanpham);
          if (productResponse && productResponse.errCode === 0) {
            productNames[item.masanpham] = productResponse.data.TenSanPham;
          } else {
            productNames[item.masanpham] = item.masanpham;
          }

          const detailResponse = await handleGetProductDetailInfoApi(
            item.masanpham,
            item.mactsp
          );
          if (detailResponse && detailResponse.errCode === 0) {
            detailNames[item.mactsp] = detailResponse.data.TenCTSP;
          } else {
            detailNames[item.mactsp] = item.mactsp;
          }
        }

        this.setState({ productNames, detailNames });
      } else {
        this.setState({
          error: response?.errMessage || "Không thể tải thông tin đơn hàng!",
        });
        setTimeout(() => {
          this.props.navigate("/home");
        }, 2000);
      }
    } catch (e) {
      console.error("Error loading order details:", e);
      this.setState({
        error:
          e.response?.data?.errMessage ||
          "Lỗi khi tải thông tin đơn hàng, vui lòng thử lại!",
      });
      setTimeout(() => {
        this.props.navigate("/home");
      }, 2000);
    }
  };

  handleGeneratePDF = async () => {
    const { orderDetails, productNames, detailNames } = this.state;

    // Tạo instance của jsPDF
    const doc = new jsPDF();

    // Thêm font tùy chỉnh/img/logo1.png (Roboto-Regular) với kiểm tra lỗi
    let fontLoaded = false;
    try {
      doc.addFileToVFS("Roboto-Regular-normal.ttf", RobotoRegularFont);
      doc.addFont("Roboto-Regular-normal.ttf", "Roboto-Regular", "normal");
      doc.setFont("Roboto-Regular"); // Sử dụng font Roboto-Regular
      fontLoaded = true;
    } catch (e) {
      console.error("Error loading custom font:", e);
      // Fallback to default font if custom font fails
      doc.setFont("Helvetica");
      fontLoaded = false;
    }

    // Thêm tiêu đề
    doc.setFontSize(18);
    doc.text("MINCOW", 14, 20);
    doc.setFontSize(10);
    doc.text("Pet Accessories & Food", 14, 26);

    // Thêm địa chỉ
    const address = "136 Huỳnh Văn Bánh, p. 11, quận Phú Nhuận, HCM";
    doc.text(address, 14, 34);

    // Thêm thông tin thời gian và mã hóa đơn
    const dateText = `Thời gian: ${new Date(
      orderDetails.NgayLapDonHang
    ).toLocaleString()}`;
    doc.text(dateText, 14, 42);
    doc.text(`Mã hóa đơn: ${orderDetails.MADONHANG}`, 150, 42, {
      align: "right",
    });

    // Thêm thông tin khách hàng
    const customerText = `Khách hàng: ${orderDetails.TenKhachHang}`;
    doc.text(customerText, 14, 50);

    // Thêm đường kẻ ngang
    doc.setLineWidth(0.5);
    doc.line(14, 55, 196, 55);

    // Chuẩn bị dữ liệu bảng
    const tableData = orderDetails.orderInfo.map((item) => [
      productNames[item.masanpham] || item.masanpham,
      detailNames[item.mactsp] || item.mactsp,
      `${item.dongia.toLocaleString()}đ`,
      item.soluong,
      `${(item.soluong * item.dongia).toLocaleString()}đ`,
    ]);

    // Sử dụng autoTable để tạo bảng với tùy chỉnh ngắt dòng
    autoTable(doc, {
      startY: 60,
      head: [["Tên sản phẩm", "Loại", "Giá", "Số lượng", "Thành tiền"]],
      body: tableData,
      theme: "grid",
      styles: {
        font: fontLoaded ? "Roboto-Regular" : "Helvetica", // Sử dụng font tùy chỉnh hoặc fallback
        fontSize: 9,
        cellPadding: 2,
        overflow: "linebreak", // Ngắt dòng tự động
        textColor: [0, 0, 0],
        halign: "left",
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: "normal",
        halign: "center",
        // Header font style is normal (not bold)
      },
      columnWidths: [60, 40, 25, 20, 25], // Định nghĩa chiều rộng cho từng cột
      columnStyles: {
        0: { halign: "center", overflow: "linebreak" }, // Tên sản phẩm
        1: { halign: "center", overflow: "linebreak" }, // Loại
        2: { halign: "center" }, // Giá
        3: { halign: "center" }, // Số lượng
        4: { halign: "center" }, // Thành tiền
      },
      margin: { left: 14, right: 14 },
    });

    // Tính toán vị trí Y sau bảng
    let finalY = doc.lastAutoTable.finalY;

    // Thêm đường kẻ ngang dưới bảng
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 2, 196, finalY + 2);

    // Thêm thông tin tổng
    const totalItems = orderDetails.orderInfo.reduce(
      (sum, item) => sum + item.soluong,
      0
    );
    const totalPrice = orderDetails.orderInfo
      .reduce((sum, item) => sum + item.soluong * item.dongia, 0)
      .toLocaleString();
    const shippingFee = this.getShippingFee().toLocaleString();
    const totalPayment = orderDetails.TongTien.toLocaleString();

    doc.setFontSize(10);
    doc.text(`Tổng sản phẩm: ${totalItems}`, 14, finalY + 10);
    doc.text(`Tổng tiền hàng: ${totalPrice}đ`, 14, finalY + 16);
    doc.text(`Phí vận chuyển (FAST): ${shippingFee}đ`, 14, finalY + 22);
    // Removed bold style for "Tổng thanh toán"
    doc.setFont(fontLoaded ? "Roboto-Regular" : "Helvetica", "normal");
    doc.text(`Tổng thanh toán: ${totalPayment}đ`, 14, finalY + 28);

    // Thêm đường kẻ ngang trước ghi chú
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 32, 196, finalY + 32);

    // Thêm ghi chú với ngắt dòng
    const note1 =
      "*Lưu ý: giá thành tiền của sản phẩm đã bao gồm khuyến mãi (nếu có).";
    const note2 =
      "Mọi thắc mắc xin liên hệ với bộ phận chăm sóc khách hàng (0901131141).";

    doc.setFontSize(9);
    const splitNote1 = doc.splitTextToSize(note1, 180);
    const splitNote2 = doc.splitTextToSize(note2, 180);

    doc.text(splitNote1, 14, finalY + 40);
    doc.text(splitNote2, 14, finalY + 48);

    // Tải xuống PDF
    doc.save(`HoaDon_${orderDetails.MADONHANG}.pdf`);
  };

  handleSendEmail = () => {
    toast.info("Tính năng chưa có!", {
      autoClose: 2000,
      closeOnClick: true,
    });
  };

  render() {
    const { orderDetails, error, productNames, detailNames } = this.state;

    return (
      <div className="view-invoice-background">
        <div className="view-invoice-modal">
          <div className="view-invoice-modal-content">
            <Header
              navigate={this.props.navigate}
              cartItems={this.props.cartItems}
              userInfo={this.props.userInfo}
            />
            {error ? (
              <div className="error">
                {error}
                <p>Đang chuyển hướng về trang chủ...</p>
              </div>
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
                        {new Date(orderDetails.NgayLapDonHang).toLocaleString()}
                      </p>
                    </div>
                    <div className="view-invoice-modal-content-top-invoiceid">
                      <p>Mã hoá đơn: {orderDetails.MADONHANG}</p>
                    </div>
                  </div>
                  <div className="view-invoice-modal-content-top-cusname">
                    <p>Khách hàng: {orderDetails.TenKhachHang}</p>
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
                      {orderDetails.orderInfo.map((item, index) => (
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
                      ))}
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
                        <td colSpan="4">Phí vận chuyển (FAST):</td>
                        <td className="cen">
                          {(
                            orderDetails.TongTien -
                            orderDetails.orderInfo.reduce(
                              (sum, item) => sum + item.soluong * item.dongia,
                              0
                            )
                          ).toLocaleString()}
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
                <div className="bill-actions">
                  {/* <button
                    onClick={this.handleCancelOrder}
                    className="cancel-btn"
                  >
                    Hủy đơn hàng
                  </button> */}
                  <button onClick={this.handleGeneratePDF} className="pdf-btn">
                    Tải PDF
                  </button>
                  {/* <button onClick={this.handleSendEmail} className="email-btn">
                      Gửi qua email
                    </button> */}
                </div>
              </>
            ) : (
              <div className="loading">Đang tải...</div>
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

  return <BillClass madonhang={madonhang} navigate={navigate} />;
};

export default Bill;
