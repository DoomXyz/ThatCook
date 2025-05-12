import db from "../models/index";
import { Op } from "sequelize";
import { checkProductType, checkPetType, checkDetailStatus } from "./utilitiesService";

let validateProductInput = async (productInfo) => {
    if (productInfo.ProductName) {
        const productName = productInfo.ProductName.trim();
        const productNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,100}$/;
        if (!productNameRegex.test(productName)) {
            return {
                errCode: 1,
                errMessage: "Tên sản phẩm không hợp lệ!",
                data: null,
            };
        }
    }
    if (productInfo.ProductType) {
        const validProductType = await checkProductType(productInfo.ProductType);
        if (!validProductType) {
            return {
                errCode: 1,
                errMessage: "Loại sản phẩm không hợp lệ!",
                data: null,
            };
        }
    }
    if (productInfo.ProductPrice) {
        const price = parseFloat(productInfo.ProductPrice);
        if (isNaN(price) || price <= 0) {
            return {
                errCode: 1,
                errMessage: "Giá sản phẩm phải lớn hơn 0!",
                data: null,
            };
        }
    }
    if (productInfo.ProductDescription && !productInfo.ProductDescription.trim()) {
        return {
            errCode: 1,
            errMessage: "Mô tả sản phẩm không hợp lệ!",
            data: null,
        };
    }
    if (productInfo.PetType) {
        if (!Array.isArray(productInfo.PetType) || productInfo.PetType.length === 0) {
            return {
                errCode: -1,
                errMessage: "Vui lòng chọn ít nhất một loại thú cưng!",
                data: null,
            };
        }
        for (const petType of productInfo.PetType) {
            const validPetType = await checkPetType(petType);
            if (!validPetType) {
                return {
                    errCode: 1,
                    errMessage: `Loại thú cưng ${petType} không hợp lệ!`,
                    data: null,
                };
            }
        }
    }
    if (productInfo.ProductDetail) {
        if (!Array.isArray(productInfo.ProductDetail) || productInfo.ProductDetail.length === 0) {
            return {
                errCode: -1,
                errMessage: "Vui lòng thêm ít nhất một chi tiết sản phẩm!",
                data: null,
            };
        }
    } else {
        for (let i = 0; i < productInfo.ProductDetail.length; i++) {
            const detail = productInfo.ProductDetail[i];
            if (!detail.DetailName) {
                return {
                    errCode: -1,
                    errMessage: `Tên chi tiết tại dòng ${i + 1} không được để trống!`,
                    data: null,
                };
            } else {
                const detailNameRegex = /^(?=.*[A-Za-zÀ-ỹ]).{2,50}$/;
                if (!detailNameRegex.test(detail.DetailName.trim())) {
                    return {
                        errCode: 1,
                        errMessage: `Tên chi tiết tại dòng ${i + 1} không hợp lệ!`,
                        data: null,
                    };
                }
            }
            if (detail.Stock === undefined || detail.Stock === "") {
                return {
                    errCode: -1,
                    errMessage: `Số lượng tồn tại dòng ${i + 1} không được để trống!`,
                    data: null,
                };
            } else if (isNaN(detail.Stock) || parseInt(detail.Stock) < 0) {
                return {
                    errCode: 1,
                    errMessage: `Số lượng tồn tại dòng ${i + 1} phải lớn hơn hoặc bằng 0!`,
                    data: null,
                };
            }
            if (detail.ExtraPrice === undefined || detail.ExtraPrice === "") {
                return {
                    errCode: -1,
                    errMessage: `Giá thêm tại dòng ${i + 1} không được để trống!`,
                    data: null,
                };
            } else if (isNaN(detail.ExtraPrice) || parseFloat(detail.ExtraPrice) < 0) {
                return {
                    errCode: 1,
                    errMessage: `Giá thêm tại dòng ${i + 1} phải lớn hơn hoặc bằng 0!`,
                    data: null,
                };
            }
            if (detail.Promotion === undefined || detail.Promotion === "") {
                return {
                    errCode: -1,
                    errMessage: `Khuyến mãi tại dòng ${i + 1} không được để trống!`,
                    data: null,
                };
            } else if (isNaN(detail.Promotion) || parseFloat(detail.Promotion) < 0 || parseFloat(detail.Promotion) > 100) {
                return {
                    errCode: 1,
                    errMessage: `Khuyến mãi tại dòng ${i + 1} phải từ 0 đến 100%!`,
                    data: null,
                };
            }
            if (!detail.DetailStatus) {
                return {
                    errCode: -1,
                    errMessage: `Trạng thái chi tiết tại dòng ${i + 1} không được để trống!`,
                    data: null,
                };
            } else {
                const validDetailStatus = await checkDetailStatus(detail.DetailStatus);
                if (!validDetailStatus) {
                    return {
                        errCode: 1,
                        errMessage: `Trạng thái chi tiết tại dòng ${i + 1} không hợp lệ!`,
                        data: null,
                    };
                }
            }
            if (parseInt(detail.Stock) === 0 && detail.DetailStatus === "AVAIL") {
                return {
                    errCode: 1,
                    errMessage: `Số lượng tồn tại dòng ${i + 1} bằng 0, không thể chọn trạng thái Còn hàng!`,
                    data: null,
                };
            }
        }
    }
    if (productInfo.Image && !Array.isArray(productInfo.Image)) {
        return {
            errCode: 1,
            errMessage: "Danh sách ảnh phụ phải là một mảng!",
            data: null,
        };
    }
    return null;
};

let checkProductNameExist = (productName) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productName) {
                resolve({
                    errCode: -1,
                    errMessage: "Thiếu tên sản phẩm để kiểm tra!",
                    data: null,
                });
                return;
            }
            let where = { ProductName: productName };
            if (excludeProductId) {
                where.ProductID = { [Op.ne]: excludeProductId };
            }
            let exist = await db.Product.findOne({ where });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: "Lỗi khi kiểm tra tên sản phẩm: " + e.message,
                data: null,
            });
        }
    });
};

let generateProductID = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const prefix = "P"; // Prefix cho Product
            const timestamp = Date.now().toString();
            const timestampDigits = timestamp.slice(-9); // Lấy 9 chữ số cuối
            let productId = `${prefix}${timestampDigits}`;
            let existingProduct = await db.Product.findOne({
                where: { ProductID: productId },
            });
            let attempts = 0;
            while (existingProduct && attempts < 5) {
                const newTimestamp = Date.now().toString();
                const newTimestampDigits = newTimestamp.slice(-9);
                productId = `${prefix}${newTimestampDigits}`;
                attempts++;
                existingProduct = await db.Product.findOne({
                    where: { ProductID: productId },
                });
            }
            if (attempts >= 5) {
                resolve({
                    errCode: 1,
                    errMessage: "Tạo mã sản phẩm thất bại!",
                    data: null,
                });
            }
            resolve(productId);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: "Lỗi khi tạo mã sản phẩm: " + e.message,
                data: null,
            });
        }
    });
};

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

let createProduct = (productInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productInfo) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu thông tin sản phẩm!',
                    data: null
                });
                return;
            }
            let isValidateInput = await validateProductInput(productInfo);
            if (isValidateInput) {
                resolve(isValidateInput);
                return;
            }
            let isProductNameExist = await checkProductNameExist(productInfo.ProductName);
            if (isProductNameExist) {
                resolve({
                    errCode: 1,
                    errMessage: "Tên sản phẩm đã tồn tại trong hệ thống!",
                    data: null,
                });
                return;
            }
            const productId = await generateProductID();
            if (typeof productId === "object" && productId.errCode) {
                resolve(productId);
                return;
            }
            await db.Product.create({
                ProductID: productId,
                ProductType: productInfo.ProductType,
                ProductName: productInfo.ProductName.trim(),
                ProductPrice: parseFloat(productInfo.ProductPrice),
                ProductImage: productInfo.ProductImage || null,
                ProductDescription: productInfo.ProductDescription.trim(),
            });
            const createdAt = new Date();
            for (const detail of productInfo.ProductDetail) {
                await db.ProductDetail.create({
                    DetailName: detail.DetailName.trim(),
                    Stock: parseInt(detail.Stock),
                    SoldCount: detail.SoldCount || 0,
                    ExtraPrice: parseFloat(detail.ExtraPrice),
                    Promotion: parseFloat(detail.Promotion),
                    CreatedAt: createdAt,
                    DetailStatus: detail.DetailStatus,
                    ProductID: productId,
                });
            }
            for (const petType of productInfo.PetType) {
                await db.ProductPetType.create({
                    ProductID: productId,
                    PetType: petType,
                });
            }
            if (productInfo.Image && productInfo.Image.length > 0) {
                for (const image of productInfo.Image) {
                    await db.Image.create({
                        Image: image.Image,
                        ProductID: productId,
                        AppointmentID: null,
                    });
                }
            }
            resolve({
                errCode: 0,
                errMessage: "Tạo sản phẩm thành công!",
                data: null,
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: "Lỗi khi tạo sản phẩm: " + e.message,
                data: null,
            });
        }
    });
};

let changeProductInfo = (productInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productInfo || !productInfo.ProductID) {
                resolve({
                    errCode: -1,
                    errMessage: "Thiếu tham số ProductID!",
                    data: null,
                });
                return;
            }
            let isValidateInput = await validateProductInput(productInfo);
            if (isValidateInput) {
                resolve(isValidateInput);
                return;
            }
            let product = await db.Product.findOne({
                where: { ProductID: productInfo.ProductID },
                raw: false,
            });
            if (!product) {
                resolve({
                    errCode: 2,
                    errMessage: "Sản phẩm không tồn tại!",
                    data: null,
                });
                return;
            }
            if (productInfo.ProductName && productInfo.ProductName !== product.ProductName) {
                let isProductNameExist = await checkProductNameExist(productInfo.ProductName, productInfo.ProductID);
                if (isProductNameExist) {
                    resolve({
                        errCode: 1,
                        errMessage: "Tên sản phẩm đã tồn tại trong hệ thống!",
                        data: null,
                    });
                    return;
                }
            }
            let isUpdated = false;
            if (productInfo.ProductName) {
                product.ProductName = productInfo.ProductName.trim();
                isUpdated = true;
            }
            if (productInfo.ProductType) {
                product.ProductType = productInfo.ProductType;
                isUpdated = true;
            }
            if (productInfo.ProductPrice) {
                product.ProductPrice = parseFloat(productInfo.ProductPrice);
                isUpdated = true;
            }
            if (productInfo.ProductImage !== undefined) {
                product.ProductImage = productInfo.ProductImage || null;
                isUpdated = true;
            }
            if (productInfo.ProductDescription) {
                product.ProductDescription = productInfo.ProductDescription.trim();
                isUpdated = true;
            }
            if (productInfo.ProductDetail) {
                const createdAt = new Date();
                for (const detail of productInfo.ProductDetail) {
                    if (detail.ProductDetailID) {
                        // Cập nhật chi tiết hiện có
                        let existingDetail = await db.ProductDetail.findOne({
                            where: { ProductDetailID: detail.ProductDetailID, ProductID: productInfo.ProductID },
                            raw: false,
                        });
                        if (existingDetail) {
                            existingDetail.DetailName = detail.DetailName.trim();
                            existingDetail.Stock = parseInt(detail.Stock);
                            existingDetail.SoldCount = detail.SoldCount || existingDetail.SoldCount;
                            existingDetail.ExtraPrice = parseFloat(detail.ExtraPrice);
                            existingDetail.Promotion = parseFloat(detail.Promotion);
                            existingDetail.DetailStatus = detail.DetailStatus;
                            isUpdated = true;
                        }
                    } else {
                        await db.ProductDetail.create(
                            {
                                DetailName: detail.DetailName.trim(),
                                Stock: parseInt(detail.Stock),
                                SoldCount: detail.SoldCount || 0,
                                ExtraPrice: parseFloat(detail.ExtraPrice),
                                Promotion: parseFloat(detail.Promotion),
                                CreatedAt: createdAt,
                                DetailStatus: detail.DetailStatus,
                                ProductID: productInfo.ProductID,
                            });
                        isUpdated = true;
                    }
                }
            }
            if (productInfo.PetType) {
                await db.ProductPetType.destroy({
                    where: { ProductID: productInfo.ProductID }
                });
                for (const petType of productInfo.PetType) {
                    await db.ProductPetType.create(
                        {
                            ProductID: productInfo.ProductID,
                            PetType: petType,
                        });
                }
                isUpdated = true;
            }
            if (productInfo.Image !== undefined) {
                await db.Image.destroy({
                    where: { ProductID: productInfo.ProductID }
                });
                if (productInfo.Image && productInfo.Image.length > 0) {
                    for (const image of productInfo.Image) {
                        await db.Image.create(
                            {
                                Image: image.Image,
                                ProductID: productInfo.ProductID,
                                AppointmentID: null,
                            });
                    }
                }
                isUpdated = true;
            }
            if (isUpdated) {
                resolve({
                    errCode: 0,
                    errMessage: "Cập nhật thông tin sản phẩm thành công!",
                    data: null,
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: "Không có thông tin nào để cập nhật!",
                    data: null,
                });
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: "Lỗi khi cập nhật sản phẩm: " + e.message,
                data: null,
            });
        }
    });
};

let loadFilteredProductInfo = (filterProductType, filterPetType) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (filterPetType && !Array.isArray(filterPetType)) {
                resolve({
                    errCode: 1,
                    errMessage: "filterPetType phải là mảng!",
                    data: null,
                });
                return;
            }
            if (filterProductType && filterProductType !== "ALL") {
                const validProductType = await checkProductType(filterProductType);
                if (!validProductType) {
                    console.log(`Invalid ProductType: ${filterProductType}`);
                    resolve({
                        errCode: 1,
                        errMessage: `Loại sản phẩm ${filterProductType} không hợp lệ!`,
                        data: null,
                    });
                    return;
                }
            }
            if (filterPetType && filterPetType.length > 0 && filterPetType[0] !== "ALL") {
                for (const petType of filterPetType) {
                    const validPetType = await checkPetType(petType);
                    if (!validPetType) {
                        console.log(`Invalid PetType: ${petType}`);
                        resolve({
                            errCode: 1,
                            errMessage: `Loại thú cưng ${petType} không hợp lệ!`,
                            data: null,
                        });
                        return;
                    }
                }
            }
            await updateOutOfStock();
            let where = {};
            if (filterProductType && filterProductType !== "ALL") {
                where.ProductType = filterProductType;
            }
            // Lọc theo PetType (sản phẩm phải có tất cả PetType trong danh sách)
            let petTypeProductIds = null;
            if (filterPetType && filterPetType.length > 0 && filterPetType[0] !== "ALL") {
                // Lấy danh sách ProductID cho từng PetType
                const petTypePromises = filterPetType.map(async (petType) => {
                    const products = await db.ProductPetType.findAll({
                        where: { PetType: petType },
                        attributes: ["ProductID"],
                        raw: true,
                    });
                    return products.map((p) => p.ProductID);
                });
                const petTypeProductIdArrays = await Promise.all(petTypePromises);
                // Tìm giao của các ProductID (sản phẩm phải có tất cả PetType)
                petTypeProductIds = petTypeProductIdArrays.reduce((commonIds, ids) => {
                    return commonIds.filter((id) => ids.includes(id));
                }, petTypeProductIdArrays[0] || []);
                if (petTypeProductIds.length === 0) {
                    resolve({
                        errCode: 0,
                        errMessage: "Không tìm thấy sản phẩm nào thỏa mãn bộ lọc PetType!",
                        data: [],
                    });
                    return;
                }
                where.ProductID = { [Op.in]: petTypeProductIds };
            }
            const products = await db.Product.findAll({
                where,
                attributes: ["ProductID", "ProductName"],
                raw: true,
            });
            resolve({
                errCode: 0,
                errMessage: "Lấy danh sách sản phẩm thành công!",
                data: products,
            });
        } catch (e) {
            console.log("Error in loadFilteredProductInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy danh sách sản phẩm: ${e.message}`,
                data: null,
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
    createProduct,
    changeProductInfo,
    loadFilteredProductInfo,
};