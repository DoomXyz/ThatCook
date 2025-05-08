import { where } from "sequelize";
import db from "../models/index";

let updGioHang = (mataikhoan, giohangInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!mataikhoan || !giohangInfo) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters"
                });
            }
            const masanpham = giohangInfo[0].masanpham;
            const mactsp = giohangInfo[0].mactsp;
            const soluong = giohangInfo[0].soluong;
            let isExistProduct = await db.ChiTietGioHang.findOne({
                where: {
                    MATAIKHOAN: mataikhoan,
                    MASANPHAM: masanpham,
                    MACTSP: mactsp,
                },
                raw: false
            })
            if (isExistProduct) {
                isExistProduct.SoLuong = soluong;
                await isExistProduct.save();
            } else {
                resolve({
                    errCode: 0,
                    errMessage: "Update fail!",
                });
            }
            resolve({
                errCode: 0,
                errMessage: "Update success!",
            });
        } catch (e) {
            reject(e);
        }
    });
}

let delGioHang = (mataikhoan) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!mataikhoan) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters',
                });
            }
            let isExistAccount = await db.ChiTietGioHang.findOne({
                attributes: ['MATAIKHOAN'],
                where: { MATAIKHOAN: mataikhoan },
                raw: true,
            })
            if (isExistAccount) {
                await db.ChiTietGioHang.destroy({
                    where: { MATAIKHOAN: mataikhoan }
                })
                resolve({
                    errCode: 0,
                    errMessage: 'Delete success!',
                });
            } else {
                resolve({
                    errCode: 0,
                    errMessage: 'Delete fail!',
                });
            }

        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    updGioHang,
    delGioHang,
};