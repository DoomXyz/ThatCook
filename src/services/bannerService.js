import db from "../models/index";
import { Op } from "sequelize";
import { checkBannerStatus } from "./utilitiesService";

let updateHideBanner = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const updated = await db.Banner.update(
                { BannerStatus: "HIDE" },
                {
                    where: {
                        BannerStatus: "SHOW",
                        HiddenAt: {
                            [Op.not]: null,
                            [Op.lte]: new Date()
                        }
                    }
                }
            );
            resolve({
                errCode: 0,
                errMessage: "Cập nhật trạng thái banner thành công!",
                data: { updatedCount: updated[0] }
            });
        } catch (e) {
            console.log("Error in updateHideBanner: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi cập nhật trạng thái banner: ${e.message}`,
                data: null
            });
        }
    });
}

let getBannerInfo = (productid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productid) {
                resolve({
                    errCode: -1,
                    errMessage: "Thiếu tham số!",
                    data: null
                });
                return;
            }
            await updateHideBanner();
            let data = null;
            if (productid === "ALL") {
                data = await db.Banner.findAll({
                    where: {
                        BannerStatus: "SHOW"
                    },
                    attributes: { exclude: ['CreatedAt', 'HiddenAt', 'BannerStatus'] }
                });
            } else {
                data = await db.Banner.findOne({
                    where: {
                        ProductID: productid,
                        BannerStatus: "SHOW"
                    },
                    attributes: { exclude: ['CreatedAt', 'HiddenAt', 'BannerStatus'] },
                    raw: true,
                });
            }
            resolve({
                errCode: data ? 0 : 2,
                errMessage: data ? "Lấy thông tin banner thành công!" : "Thông tin banner không tồn tại!",
                data: data || (productid === "ALL" ? [] : null)
            });
        } catch (e) {
            console.log("Error in getBannerInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy thông tin banner: ${e.message}`,
                data: null
            });
        }
    });
}

let loadBannerInfo = (page, limit, search, filter, sort, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!page || !limit || page < 1 || limit < 1) {
                resolve({
                    errCode: -1,
                    errMessage: "Tham số page hoặc limit không hợp lệ!",
                    data: null
                });
                return;
            }
            if (filter !== "ALL" && !filter.includes("-")) {
                resolve({
                    errCode: 1,
                    errMessage: "Tham số filter không hợp lệ!",
                    data: null
                });
                return;
            }
            if (sort && !["0", "1", "2", "3", "4"].includes(sort)) {
                resolve({
                    errCode: 1,
                    errMessage: "Tham số sort không hợp lệ!",
                    data: null
                });
                return;
            }
            await updateHideBanner();
            const offset = (page - 1) * limit;
            let where = {};
            let order = [];

            // Tìm kiếm theo ProductName
            if (search) {
                const products = await db.Product.findAll({
                    where: { ProductName: { [Op.like]: `%${search}%` } },
                    attributes: ["ProductID"],
                    raw: true
                });
                const productIds = products.map(p => p.ProductID);
                if (productIds.length === 0) {
                    resolve({
                        errCode: 0,
                        errMessage: "Không tìm thấy banner nào!",
                        data: [],
                        totalItems: 0
                    });
                    return;
                }
                where.ProductID = { [Op.in]: productIds };
            }

            // Lọc theo ngày (banner hoạt động trong ngày)
            if (date) {
                const startOfDay = new Date(date);
                if (isNaN(startOfDay.getTime())) {
                    resolve({
                        errCode: 1,
                        errMessage: "Tham số date không hợp lệ!",
                        data: null
                    });
                    return;
                }
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                where.CreatedAt = { [Op.lte]: endOfDay };
                where[Op.or] = [
                    { HiddenAt: { [Op.gte]: startOfDay } },
                    { HiddenAt: null }
                ];
            }

            // Lọc theo filter
            if (filter !== "ALL") {
                const [field, value] = filter.split("-");
                if (field === "bannerstatus") {
                    const validBannerStatus = await checkBannerStatus(value);
                    if (!validBannerStatus) {
                        resolve({
                            errCode: 1,
                            errMessage: "Trạng thái banner không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.BannerStatus = value;
                }
            }

            // Sắp xếp
            switch (sort) {
                case "1": // Thời gian tạo mới nhất
                    order.push(["CreatedAt", "DESC"]);
                    break;
                case "2": // Thời gian tạo cũ nhất
                    order.push(["CreatedAt", "ASC"]);
                    break;
                case "3": // Thời gian hết hạn gần nhất
                    order.push([db.sequelize.literal('HiddenAt IS NULL'), "ASC"]);
                    order.push(["HiddenAt", "ASC"]);
                    break;
                case "4": // Thời gian hết hạn trễ nhất
                    order.push([db.sequelize.literal('HiddenAt IS NULL'), "DESC"]);
                    order.push(["HiddenAt", "DESC"]);
                    break;
                default: // Mặc định
                    break;
            }

            // Lấy danh sách banner
            const { count, rows } = await db.Banner.findAndCountAll({
                where,
                attributes: [
                    "BannerID",
                    "BannerImage",
                    "CreatedAt",
                    "HiddenAt",
                    "BannerStatus",
                    "ProductID"
                ],
                limit,
                offset,
                order,
                raw: true
            });
            // Lấy ProductName và ProductImage
            const productIds = [...new Set(rows.map(item => item.ProductID))];
            const products = await db.Product.findAll({
                where: { ProductID: { [Op.in]: productIds } },
                attributes: ["ProductID", "ProductName", "ProductImage"],
                raw: true
            });
            const productMap = products.reduce((map, item) => {
                map[item.ProductID] = {
                    ProductName: item.ProductName,
                    ProductImage: item.ProductImage
                };
                return map;
            }, {});

            // Chuẩn hóa dữ liệu
            const data = rows.map(item => ({
                BannerID: item.BannerID,
                BannerImage: item.BannerImage,
                CreatedAt: item.CreatedAt,
                HiddenAt: item.HiddenAt,
                BannerStatus: item.BannerStatus,
                ProductID: item.ProductID,
                ProductName: productMap[item.ProductID]?.ProductName || "N/A",
                ProductImage: productMap[item.ProductID]?.ProductImage || null
            }));
            resolve({
                errCode: 0,
                errMessage: "Lấy danh sách banner thành công!",
                data,
                totalItems: count
            });
        } catch (e) {
            console.log("Error in loadBannerInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy danh sách banner: ${e.message}`,
                data: null
            });
        }
    });
};

module.exports = {
    getBannerInfo,
    loadBannerInfo,
};