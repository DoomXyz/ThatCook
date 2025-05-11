import db from "../models/index.js";
import { Op } from "sequelize";

// Lấy thông tin đơn hàng dựa trên MADONHANG
let getOrderDetails = (madonhang) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!madonhang) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu mã đơn hàng!",
        });
        return;
      }
      // Lấy thông tin từ bảng DonHang
      const order = await db.DonHang.findOne({
        where: { MADONHANG: madonhang },
        raw: true,
      });
      if (!order) {
        resolve({
          errCode: 2,
          errMessage: "Không tìm thấy đơn hàng!",
        });
        return;
      }
      // Lấy chi tiết đơn hàng từ bảng ChiTietDonHang
      const orderDetails = await db.ChiTietDonHang.findAll({
        where: { MADONHANG: madonhang },
        raw: true,
      });

      // Kết hợp dữ liệu
      order.orderInfo = await Promise.all(
        orderDetails.map(async (item) => {
          const giamgia = await db.SanPham.findOne({
            where: { MASANPHAM: item.MASANPHAM },
            raw: true,
          });
          return {
            masanpham: item.MASANPHAM,
            mactsp: item.MACTSP,
            soluong: item.SoLuong,
            dongia: item.DonGia,
            khuyenmai: giamgia.KhuyenMai
              ? 1 - parseFloat(giamgia.KhuyenMai, 10) / 100
              : 1,
          };
        })
      );
      resolve({
        errCode: 0,
        errMessage: "Lấy thông tin đơn hàng thành công!",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Lấy danh sách hóa đơn
let loadHoaDon = (page, limit, search, date, sort) => {
  return new Promise(async (resolve, reject) => {
    try {
      const offset = (page - 1) * limit;
      let where = {};

      // Tìm kiếm theo SDTNhanHang
      if (search) {
        where.SDTNhanHang = { [Op.like]: `%${search}%` };
      }

      // Lọc theo ngày (bỏ qua giờ)
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0); // Đầu ngày
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); // Cuối ngày
        where.NgayLapDonHang = {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay,
        };
      }

      // Lấy danh sách hóa đơn
      const hoadon = await db.DonHang.findAll({
        where,
        attributes: [
          "MADONHANG",
          "NgayLapDonHang",
          "TenKhachHang",
          "SDTNhanHang", // Thêm SDTNhanHang vào attributes
          "TongTien",
          "PaymentStatus",
          "OrderStatus",
        ],
        include: [
          {
            model: db.AllCodes,
            as: "PaymentStatusData",
            attributes: ["Code", "Value"],
            where: { Type: "PaymentStatus" },
            required: false,
          },
          {
            model: db.AllCodes,
            as: "OrderStatusData",
            attributes: ["Code", "Value"],
            where: { Type: "OrderStatus" },
            required: false,
          },
        ],
        limit,
        offset,
        raw: true,
        nest: true,
      });

      // Tính tổng số lượng sản phẩm trong hóa đơn
      const chitiet = await db.ChiTietDonHang.findAll({
        attributes: [
          "MADONHANG",
          [db.Sequelize.fn("SUM", db.Sequelize.col("SoLuong")), "tongSoLuong"],
        ],
        group: ["MADONHANG"],
        raw: true,
      });

      const soluongMap = chitiet.reduce((map, item) => {
        map[item.MADONHANG] = parseInt(item.tongSoLuong) || 0;
        return map;
      }, {});

      // Ánh xạ dữ liệu
      let data = hoadon.map((item) => {
        const paymentStatusValue =
          item.PaymentStatusData &&
            item.PaymentStatusData.Code === item.PaymentStatus
            ? item.PaymentStatusData.Value
            : item.PaymentStatus || "N/A";

        const orderStatusValue =
          item.OrderStatusData && item.OrderStatusData.Code === item.OrderStatus
            ? item.OrderStatusData.Value
            : item.OrderStatus || "N/A";

        return {
          MADONHANG: item.MADONHANG,
          NgayLapDonHang: item.NgayLapDonHang,
          TenKhachHang: item.TenKhachHang,
          SDTNhanHang: item.SDTNhanHang, // Thêm SDTNhanHang vào dữ liệu trả về
          quantity: soluongMap[item.MADONHANG] || 0,
          TongTien: item.TongTien,
          PaymentStatus: paymentStatusValue,
          OrderStatus: orderStatusValue,
        };
      });

      switch (sort) {
        case "1": // Mới nhất
          data.sort(
            (a, b) => new Date(b.NgayLapDonHang) - new Date(a.NgayLapDonHang)
          );
          break;
        case "2": // Cũ nhất
          data.sort(
            (a, b) => new Date(a.NgayLapDonHang) - new Date(b.NgayLapDonHang)
          );
          break;
        case "3": // Tổng tiền tăng dần
          data.sort((a, b) => a.TongTien - b.TongTien);
          break;
        case "4": // Tổng tiền giảm dần
          data.sort((a, b) => b.TongTien - a.TongTien);
          break;
        case "5": // Số lượng tăng dần
          data.sort((a, b) => a.quantity - b.quantity);
          break;
        case "6": // Số lượng giảm dần
          data.sort((a, b) => b.quantity - a.quantity);
          break;
        case "7": // PaymentStatus (PEND -> PAID -> FAIL)
          data.sort((a, b) => {
            const order = [
              "Chờ thanh toán",
              "Đã thanh toán",
              "Thanh toán thất bại",
            ];
            return (
              order.indexOf(a.PaymentStatus) - order.indexOf(b.PaymentStatus)
            );
          });
          break;
        default:
          data.sort(
            (a, b) => new Date(b.NgayLapDonHang) - new Date(a.NgayLapDonHang)
          );
          break;
      }

      // Tính tổng số hóa đơn
      const totalItems = await db.DonHang.count({ where });

      resolve({
        errCode: 0,
        errMessage: "OK",
        data,
        totalItems,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getOrderDetails,
  loadHoaDon,
};
