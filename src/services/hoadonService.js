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

export default {
  getOrderDetails,
};
