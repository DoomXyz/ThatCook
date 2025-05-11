import db from "../models/index";
import { and, Op } from "sequelize";
import { checkProductType } from "./utilitiesService";

let updateOutOfStock = (productid) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Xây dựng điều kiện truy vấn
            let where = { Stock: 0 };
            if (productid) {
                where.ProductID = productid;
            }

            // Cập nhật DetailStatus thành 'OUT' cho các ProductDetail có Stock = 0
            const updated = await db.ProductDetail.update(
                { DetailStatus: 'OUT' },
                {
                    where,
                    returning: true
                }
            );

            resolve({
                errCode: 0,
                errMessage: "Cập nhật trạng thái chi tiết sản phẩm thành công!",
                data: {
                    updatedCount: updated[0] // Số bản ghi được cập nhật
                }
            });
        } catch (e) {
            console.log("Error in updateOutOfStock: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi cập nhật trạng thái chi tiết sản phẩm: ${e.message}`,
                data: null
            });
        }
    });
};

let loadProductInfo = (page, limit, search, filter, sort) => {
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
            if (filter !== "ALL" && filter !== "PROMOTION" && !filter.includes("-")) {
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
            //Cho db refresh trước khi gọi
            await updateOutOfStock();
            const offset = (page - 1) * limit;
            let where = {};
            let order = [];

            // Tìm kiếm theo ProductName
            if (search) {
                where[Op.or] = [{ ProductName: { [Op.like]: `%${search}%` } }];
            }

            // Lọc theo ProductType hoặc PetType
            if (filter !== "ALL" && filter !== "PROMOTION") {
                const [field, value] = filter.split("-");
                if (field === "producttype") {
                    const validProductType = await checkProductType(value);
                    if (!validProductType) {
                        resolve({
                            errCode: 1,
                            errMessage: "Loại sản phẩm không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.ProductType = value;
                } else if (field === "pettype") {
                    const products = await db.ProductPetType.findAll({
                        where: { PetType: value },
                        attributes: ["ProductID"],
                        raw: true
                    });
                    const productIds = products.map(p => p.ProductID);
                    if (productIds.length === 0) {
                        resolve({
                            errCode: 0,
                            errMessage: "Không tìm thấy sản phẩm nào!",
                            data: [],
                            totalItems: 0
                        });
                        return;
                    }
                    where.ProductID = { [Op.in]: productIds };
                }
            }

            // Lọc sản phẩm có khuyến mãi (Promotion > 0 trong ProductDetail)
            if (filter === "PROMOTION") {
                const detail = await db.ProductDetail.findAll({
                    where: { Promotion: { [Op.gt]: 0 } },
                    attributes: ["ProductID"],
                    raw: true
                });
                const productIds = [...new Set(detail.map(d => d.ProductID))];
                if (productIds.length === 0) {
                    resolve({
                        errCode: 0,
                        errMessage: "Không tìm thấy sản phẩm khuyến mãi!",
                        data: [],
                        totalItems: 0
                    });
                    return;
                }
                where.ProductID = { [Op.in]: productIds };
            }

            // Lọc sản phẩm có ít nhất một ProductDetail hợp lệ
            const validProducts = await db.ProductDetail.findAll({
                where: {
                    Stock: { [Op.gt]: 0 },
                },
                attributes: ["ProductID"],
                raw: true
            });
            const validProductIds = [...new Set(validProducts.map(p => p.ProductID))];
            if (validProductIds.length > 0) {
                where.ProductID = { [Op.in]: validProductIds };
            } else {
                resolve({
                    errCode: 0,
                    errMessage: "Không tìm thấy sản phẩm nào có chi tiết hợp lệ!",
                    data: [],
                    totalItems: 0
                });
                return;
            }

            // Sắp xếp
            switch (sort) {
                case "1": // Bán chạy (tổng SoldCount trong ProductDetail)
                    order.push([
                        db.sequelize.literal(`(SELECT SUM(SoldCount) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`),
                        "DESC"
                    ]);
                    break;
                case "2": // Giá tăng dần (giá của ProductPrice)
                    order.push(["ProductPrice", "ASC"]);
                    break;
                case "3": // Giá giảm dần
                    order.push(["ProductPrice", "DESC"]);
                    break;
                case "4": // Hàng mới (MAX(CreatedAt) trong ProductDetail)
                    order.push([
                        db.sequelize.literal(`(SELECT MAX(CreatedAt) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`),
                        "DESC"
                    ]);
                    break;
                default:
                    break;
            }

            // Lấy danh sách sản phẩm
            const { count, rows } = await db.Product.findAndCountAll({
                where,
                attributes: [
                    "ProductID",
                    "ProductName",
                    "ProductType",
                    "ProductPrice",
                    "ProductImage"
                ],
                limit,
                offset,
                order,
                raw: true
            });

            const productIds = rows.map(p => p.ProductID);
            const stockData = await db.ProductDetail.findAll({
                where: {
                    ProductID: { [Op.in]: productIds },
                    Stock: { [Op.gt]: 0 }
                },
                attributes: [
                    "ProductID",
                    [db.sequelize.fn('SUM', db.sequelize.col('Stock')), 'TotalStock']
                ],
                group: ['ProductID'],
                raw: true
            });
            const stockMap = stockData.reduce((map, item) => {
                map[item.ProductID] = {
                    TotalStock: parseInt(item.TotalStock)
                };
                return map;
            }, {});

            const soldData = await db.ProductDetail.findAll({
                where: {
                    ProductID: { [Op.in]: productIds },
                    SoldCount: { [Op.gt]: 0 }
                },
                attributes: [
                    "ProductID",
                    [db.sequelize.fn('SUM', db.sequelize.col('SoldCount')), 'TotalSold']
                ],
                group: ['ProductID'],
                raw: true
            });
            const soldMap = soldData.reduce((map, item) => {
                map[item.ProductID] = {
                    TotalSold: parseInt(item.TotalSold)
                };
                return map;
            }, {});

            // Kết hợp dữ liệu
            const data = rows.map(item => {
                const stockInfo = stockMap[item.ProductID];
                if (!stockInfo) return null;
                const soldInfo = soldMap[item.ProductID];
                if (!soldInfo) return null;
                return {
                    ProductID: item.ProductID,
                    ProductName: item.ProductName,
                    ProductType: item.ProductType,
                    ProductPrice: parseFloat(item.ProductPrice),
                    ProductImage: item.ProductImage,
                    TotalStock: stockInfo.TotalStock,
                    TotalSold: soldInfo.TotalSold
                };
            }).filter(item => item !== null);
            const totalItems = count;
            resolve({
                errCode: 0,
                errMessage: "Lấy danh sách sản phẩm thành công!",
                data,
                totalItems
            });
        } catch (e) {
            console.log("Error in loadProductInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy danh sách sản phẩm: ${e.message}`,
                data: null
            });
        }
    });
};

let getProductInfo = (productid) => {
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
            await updateOutOfStock();
            let data = null;
            if (productid === "ALL") {
                // Lấy tất cả sản phẩm
                const products = await db.Product.findAll({
                    attributes: [
                        "ProductID",
                        "ProductName",
                        "ProductPrice",
                        "ProductImage",
                        "ProductType",
                        "ProductDescription"
                    ],
                    raw: true
                });
                // Lấy dữ liệu liên quan cho từng sản phẩm
                data = await Promise.all(products.map(async (product) => {
                    const petType = await db.ProductPetType.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["PetType"],
                        raw: true
                    });
                    const detail = await db.ProductDetail.findAll({
                        where: {
                            ProductID: product.ProductID,
                        },
                        attributes: [
                            "ProductDetailID",
                            "DetailName",
                            "Stock",
                            "SoldCount",
                            "ExtraPrice",
                            "Promotion",
                            "DetailStatus"
                        ],
                        raw: true
                    });
                    const image = await db.Image.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["ImageID", "Image"],
                        raw: true
                    });

                    return {
                        ProductID: product.ProductID,
                        ProductName: product.ProductName,
                        ProductPrice: product.ProductPrice,
                        ProductImage: product.ProductImage,
                        ProductType: product.ProductType,
                        ProductDescription: product.ProductDescription,
                        PetTypes: petType.map(pt => pt.PetType),
                        ProductDetails: detail,
                        Images: image
                    };
                }));
            } else {
                // Lấy thông tin sản phẩm cụ thể
                const product = await db.Product.findOne({
                    where: { ProductID: productid },
                    attributes: [
                        "ProductID",
                        "ProductName",
                        "ProductPrice",
                        "ProductImage",
                        "ProductType",
                        "ProductDescription"
                    ],
                    raw: true
                });

                if (product) {
                    // Lấy dữ liệu liên quan
                    const petType = await db.ProductPetType.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["PetType"],
                        raw: true
                    });
                    const detail = await db.ProductDetail.findAll({
                        where: {
                            ProductID: product.ProductID,
                        },
                        attributes: [
                            "ProductDetailID",
                            "DetailName",
                            "Stock",
                            "SoldCount",
                            "ExtraPrice",
                            "Promotion",
                            "DetailStatus"
                        ],
                        raw: true
                    });
                    const image = await db.Image.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["ImageID", "Image"],
                        raw: true
                    });

                    data = {
                        ProductID: product.ProductID,
                        ProductName: product.ProductName,
                        ProductPrice: product.ProductPrice,
                        ProductImage: product.ProductImage,
                        ProductType: product.ProductType,
                        ProductDescription: product.ProductDescription,
                        PetType: petType.map(pt => pt.PetType),
                        ProductDetail: detail,
                        Image: image
                    };
                }

                resolve({
                    errCode: data ? 0 : 2,
                    errMessage: data ? "Lấy thông tin sản phẩm thành công!" : "Sản phẩm không tồn tại!",
                    data: data || (productid === "ALL" ? [] : null)
                });
            }
        } catch (e) {
            console.log("Error in getProductInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy thông tin sản phẩm: ${e.message}`,
                data: null
            });
        }
    });
};

let loadSaleProductInfo = (page, limit, search, filter, sort) => {
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
            if (filter !== "ALL" && filter !== "PROMOTION" && !filter.includes("-")) {
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
            //Cho db refresh trước khi gọi
            await updateOutOfStock();
            const offset = (page - 1) * limit;
            let where = {};
            let order = [];

            // Tìm kiếm theo ProductName
            if (search) {
                where[Op.or] = [{ ProductName: { [Op.like]: `%${search}%` } }];
            }

            // Lọc theo ProductType hoặc PetType
            if (filter !== "ALL" && filter !== "PROMOTION") {
                const [field, value] = filter.split("-");
                if (field === "producttype") {
                    const validProductType = await checkProductType(value);
                    if (!validProductType) {
                        resolve({
                            errCode: 1,
                            errMessage: "Loại sản phẩm không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.ProductType = value;
                } else if (field === "pettype") {
                    const products = await db.ProductPetType.findAll({
                        where: { PetType: value },
                        attributes: ["ProductID"],
                        raw: true
                    });
                    const productIds = products.map(p => p.ProductID);
                    if (productIds.length === 0) {
                        resolve({
                            errCode: 0,
                            errMessage: "Không tìm thấy sản phẩm nào!",
                            data: [],
                            totalItems: 0
                        });
                        return;
                    }
                    where.ProductID = { [Op.in]: productIds };
                }
            }

            // Lọc sản phẩm có khuyến mãi (Promotion > 0 trong ProductDetail)
            if (filter === "PROMOTION") {
                const detail = await db.ProductDetail.findAll({
                    where: { Promotion: { [Op.gt]: 0 } },
                    attributes: ["ProductID"],
                    raw: true
                });
                const productIds = [...new Set(detail.map(d => d.ProductID))];
                if (productIds.length === 0) {
                    resolve({
                        errCode: 0,
                        errMessage: "Không tìm thấy sản phẩm khuyến mãi!",
                        data: [],
                        totalItems: 0
                    });
                    return;
                }
                where.ProductID = { [Op.in]: productIds };
            }

            // Lọc sản phẩm có ít nhất một ProductDetail hợp lệ
            const validProducts = await db.ProductDetail.findAll({
                where: {
                    Stock: { [Op.gt]: 0 },
                    DetailStatus: 'AVAIL'
                },
                attributes: ["ProductID"],
                raw: true
            });
            const validProductIds = [...new Set(validProducts.map(p => p.ProductID))];
            if (validProductIds.length > 0) {
                where.ProductID = { [Op.in]: validProductIds };
            } else {
                resolve({
                    errCode: 0,
                    errMessage: "Không tìm thấy sản phẩm nào có chi tiết hợp lệ!",
                    data: [],
                    totalItems: 0
                });
                return;
            }

            // Sắp xếp
            switch (sort) {
                case "1": // Bán chạy (tổng SoldCount trong ProductDetail)
                    order.push([
                        db.sequelize.literal(`(SELECT SUM(SoldCount) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`),
                        "DESC"
                    ]);
                    break;
                case "2": // Giá tăng dần (giá của ProductDetail mặc định)
                    order.push([
                        db.sequelize.literal(`(
                            SELECT (ProductPrice + ExtraPrice) * (1 - Promotion / 100)
                            FROM ProductDetail
                            WHERE ProductDetail.ProductID = Product.ProductID
                            AND ProductDetail.Stock > 0
                            AND ProductDetail.DetailStatus = 'AVAIL'
                            ORDER BY ProductDetailID ASC
                            LIMIT 1
                        )`),
                        "ASC"
                    ]);
                    break;
                case "3": // Giá giảm dần
                    order.push([
                        db.sequelize.literal(`(
                            SELECT (ProductPrice + ExtraPrice) * (1 - Promotion / 100)
                            FROM ProductDetail
                            WHERE ProductDetail.ProductID = Product.ProductID
                            AND ProductDetail.Stock > 0
                            AND ProductDetail.DetailStatus = 'AVAIL'
                            ORDER BY ProductDetailID ASC
                            LIMIT 1
                        )`),
                        "DESC"
                    ]);
                    break;
                case "4": // Hàng mới (MAX(CreatedAt) trong ProductDetail)
                    order.push([
                        db.sequelize.literal(`(SELECT MAX(CreatedAt) FROM ProductDetail WHERE ProductDetail.ProductID = Product.ProductID)`),
                        "DESC"
                    ]);
                    break;
                default:
                    break;
            }

            // Lấy danh sách sản phẩm
            const { count, rows } = await db.Product.findAndCountAll({
                where,
                attributes: [
                    "ProductID",
                    "ProductName",
                    "ProductPrice",
                    "ProductImage"
                ],
                limit,
                offset,
                order,
                raw: true
            });

            // Lấy ProductDetail mặc định và tổng Stock
            const productIds = rows.map(p => p.ProductID);
            const detail = await db.ProductDetail.findAll({
                where: {
                    ProductID: { [Op.in]: productIds },
                    DetailStatus: 'AVAIL'
                },
                attributes: [
                    "ProductID",
                    "ProductDetailID",
                    "DetailName",
                    "Stock",
                    "SoldCount",
                    "ExtraPrice",
                    "Promotion"
                ],
                order: [["ProductDetailID", "ASC"]],
                raw: true
            });

            // Ánh xạ ProductDetail mặc định và tổng Stock
            const detailMap = detail.reduce((map, detail) => {
                if (!map[detail.ProductID]) {
                    map[detail.ProductID] = {
                        defaultDetail: null,
                        totalStock: 0
                    };
                }
                map[detail.ProductID].totalStock += detail.Stock;
                if (!map[detail.ProductID].defaultDetail && detail.Stock > 0) {
                    map[detail.ProductID].defaultDetail = detail;
                }
                return map;
            }, {});

            // Kết hợp dữ liệu
            const data = rows.map(item => {
                const detail = detailMap[item.ProductID]?.defaultDetail;
                if (!detail) {
                    return null; // Bỏ sản phẩm nếu không có ProductDetail hợp lệ
                }
                const price = (parseFloat(item.ProductPrice) + parseFloat(detail.ExtraPrice)) * (1 - parseFloat(detail.Promotion) / 100);
                return {
                    ProductID: item.ProductID,
                    ProductName: item.ProductName,
                    ItemPrice: price,
                    ProductImage: item.ProductImage,
                    TotalStock: detailMap[item.ProductID].totalStock,
                    ProductDetailID: detail.ProductDetailID,
                    DetailName: detail.DetailName,
                    Promotion: parseFloat(detail.Promotion),
                    ProductDetailID: detail.ProductDetailID
                };
            }).filter(item => item !== null); // Lọc bỏ sản phẩm null
            const totalItems = await db.Product.count();
            resolve({
                errCode: 0,
                errMessage: "Lấy danh sách sản phẩm thành công!",
                data,
                totalItems
            });
        } catch (e) {
            console.log("Error in loadProductInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy danh sách sản phẩm: ${e.message}`,
                data: null
            });
        }
    });
};

let getSaleProductInfo = (productid) => {
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
            await updateOutOfStock();
            let data = null;
            if (productid === "ALL") {
                // Lấy tất cả sản phẩm
                const products = await db.Product.findAll({
                    attributes: [
                        "ProductID",
                        "ProductName",
                        "ProductPrice",
                        "ProductImage",
                        "ProductType",
                        "ProductDescription"
                    ],
                    raw: true
                });

                // Lấy dữ liệu liên quan cho từng sản phẩm
                data = await Promise.all(products.map(async (product) => {
                    const petType = await db.ProductPetType.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["PetType"],
                        raw: true
                    });
                    const detail = await db.ProductDetail.findAll({
                        where: {
                            ProductID: product.ProductID,
                            DetailStatus: 'AVAIL'
                        },
                        attributes: [
                            "ProductDetailID",
                            "DetailName",
                            "Stock",
                            "SoldCount",
                            "ExtraPrice",
                            "Promotion",
                            "DetailStatus"
                        ],
                        raw: true
                    });
                    const image = await db.Image.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["ImageID", "Image"],
                        raw: true
                    });

                    return {
                        ProductID: product.ProductID,
                        ProductName: product.ProductName,
                        ProductPrice: product.ProductPrice,
                        ProductImage: product.ProductImage,
                        ProductType: product.ProductType,
                        ProductDescription: product.ProductDescription,
                        PetTypes: petType.map(pt => pt.PetType),
                        ProductDetails: detail,
                        Images: image
                    };
                }));
            } else {
                // Lấy thông tin sản phẩm cụ thể
                const product = await db.Product.findOne({
                    where: { ProductID: productid },
                    attributes: [
                        "ProductID",
                        "ProductName",
                        "ProductPrice",
                        "ProductImage",
                        "ProductType",
                        "ProductDescription"
                    ],
                    raw: true
                });

                if (product) {
                    // Lấy dữ liệu liên quan
                    const petType = await db.ProductPetType.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["PetType"],
                        raw: true
                    });
                    const detail = await db.ProductDetail.findAll({
                        where: {
                            ProductID: product.ProductID,
                            DetailStatus: 'AVAIL'
                        },
                        attributes: [
                            "ProductDetailID",
                            "DetailName",
                            "Stock",
                            "SoldCount",
                            "ExtraPrice",
                            "Promotion",
                            "DetailStatus"
                        ],
                        raw: true
                    });
                    const image = await db.Image.findAll({
                        where: { ProductID: product.ProductID },
                        attributes: ["ImageID", "Image"],
                        raw: true
                    });

                    data = {
                        ProductID: product.ProductID,
                        ProductName: product.ProductName,
                        ProductPrice: product.ProductPrice,
                        ProductImage: product.ProductImage,
                        ProductType: product.ProductType,
                        ProductDescription: product.ProductDescription,
                        PetType: petType.map(pt => pt.PetType),
                        ProductDetail: detail,
                        Image: image
                    };
                }

                resolve({
                    errCode: data ? 0 : 2,
                    errMessage: data ? "Lấy thông tin sản phẩm thành công!" : "Sản phẩm không tồn tại!",
                    data: data || (productid === "ALL" ? [] : null)
                });
            }
        } catch (e) {
            console.log("Error in getProductInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy thông tin sản phẩm: ${e.message}`,
                data: null
            });
        }
    });
};

let getProductDetailInfo = (productid, productdetailid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productid || !productdetailid) {
                resolve({
                    errCode: -1,
                    errMessage: "Thiếu tham số!",
                    data: null
                });
                return;
            }
            await updateOutOfStock();
            const productInfo = await db.Product.findOne({
                where: {
                    ProductID: productid,
                },
            })
            const detailInfo = await db.ProductDetail.findOne({
                where: {
                    ProductID: productid,
                    ProductDetailID: productdetailid,
                },
            })
            if (productInfo && detailInfo) {
                const productDetailInfo = ({
                    ProductID: productInfo.ProductID,
                    ProductName: productInfo.ProductName,
                    ProductType: productInfo.ProductType,
                    ProductPrice: productInfo.ProductPrice,
                    ProductImage: productInfo.ProductImage,
                    ProductDescription: productInfo.ProductDescription,
                    ProductDetailID: detailInfo.ProductDetailID,
                    DetailName: detailInfo.DetailName,
                    Stock: detailInfo.Stock,
                    SoldCount: detailInfo.SoldCount,
                    ExtraPrice: detailInfo.ExtraPrice,
                    Promotion: detailInfo.Promotion,
                    CreatedAt: detailInfo.CreatedAt,
                    DetailStatus: detailInfo.DetailStatus
                })
                resolve({
                    errCode: 0,
                    errMessage: "Lấy thông tin chi tiết sản phẩm thành công!",
                    data: productDetailInfo
                });
                return;
            }

        } catch (e) {
            console.log("Error in getProductDetailInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy thông tin sản phẩm: ${e.message}`,
                data: null
            });
        }
    });
};

module.exports = {
    loadProductInfo,
    getProductInfo,
    loadSaleProductInfo,
    getSaleProductInfo,
    getProductDetailInfo,
};