import db from "../models/index";
import { and, Op } from "sequelize";

let validateProductInput = async (productInfo) => {
    if (!productInfo.tensanpham) {
        return {
            errCode: 1,
            errMessage: "Tên sản phẩm không được để trống!",
        };
    } else {
        const productName = productInfo.tensanpham.trim();
        const basicProductRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,100}$/;
        if (!basicProductRegex.test(productName)) {
            return {
                errCode: 2,
                errMessage: "Tên sản phẩm không hợp lệ! Tên phải từ 2-100 ký tự, chỉ chứa chữ cái, số và khoảng trắng.",
            };
        }
        const existingProduct = await db.SanPham.findOne({
            where: {
                [Op.and]: [
                    db.Sequelize.where(
                        db.Sequelize.fn("LOWER", db.Sequelize.col("TenSanPham")),
                        { [Op.like]: productName.toLowerCase() }
                    ),
                ],
            },
        });
        if (existingProduct) {
            return {
                errCode: 3,
                errMessage: "Tên sản phẩm đã tồn tại!",
            };
        }
    }

    if (!productInfo.giaban) {
        return {
            errCode: 1,
            errMessage: "Giá bán không được để trống!",
        };
    } else if (isNaN(productInfo.giaban) || parseFloat(productInfo.giaban) <= 0) {
        return {
            errCode: 2,
            errMessage: "Giá bán phải lớn hơn 0!",
        };
    }

    if (!productInfo.producttype) {
        return {
            errCode: 1,
            errMessage: "Danh mục không được để trống!",
        };
    } else {
        const validProductType = await db.AllCodes.findOne({
            where: { Type: "ProductType", Code: productInfo.producttype },
        });
        if (!validProductType) {
            return {
                errCode: 2,
                errMessage: "Danh mục không hợp lệ!",
            };
        }
    }

    if (!productInfo.hinhanh || typeof productInfo.hinhanh !== "object" || !productInfo.hinhanh.secure_url) {
        return {
            errCode: 1,
            errMessage: "Vui lòng thêm ít nhất 1 hình ảnh chính cho sản phẩm!",
        };
    }

    if (productInfo.chitiethinhanh && productInfo.chitiethinhanh.length > 4) {
        return {
            errCode: 2,
            errMessage: "Tối đa 4 hình ảnh phụ cho sản phẩm!",
        };
    }
    if (productInfo.chitiethinhanh) {
        for (let img of productInfo.chitiethinhanh) {
            if (typeof img !== "object" || !img.secure_url) {
                return {
                    errCode: 2,
                    errMessage: "Hình ảnh phụ không hợp lệ!",
                };
            }
        }
    }

    if (!productInfo.chitietsanpham || productInfo.chitietsanpham.length === 0) {
        return {
            errCode: 1,
            errMessage: "Vui lòng thêm ít nhất 1 chi tiết sản phẩm!",
        };
    } else {
        for (let item of productInfo.chitietsanpham) {
            if (!item.tenctsp) {
                return {
                    errCode: 1,
                    errMessage: "Tên chi tiết sản phẩm không được để trống!",
                };
            } else {
                const ctspRegex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;
                if (!ctspRegex.test(item.tenctsp.trim())) {
                    return {
                        errCode: 2,
                        errMessage: "Tên chi tiết sản phẩm không hợp lệ! Tên phải từ 1-50 ký tự, chỉ chứa chữ cái, số và khoảng trắng.",
                    };
                }
            }
            if (item.soluongton === undefined || item.soluongton === "") {
                return {
                    errCode: 1,
                    errMessage: "Số lượng tồn không được để trống!",
                };
            } else if (isNaN(item.soluongton) || parseInt(item.soluongton) < 0) {
                return {
                    errCode: 2,
                    errMessage: "Số lượng tồn phải lớn hơn hoặc bằng 0!",
                };
            }
            if (item.giathem && (isNaN(item.giathem) || parseFloat(item.giathem) < 0)) {
                return {
                    errCode: 2,
                    errMessage: "Giá thêm phải lớn hơn hoặc bằng 0!",
                };
            }
        }
    }

    if (productInfo.khuyenmai && (isNaN(productInfo.khuyenmai) || parseFloat(productInfo.khuyenmai) < 0 || parseFloat(productInfo.khuyenmai) > 100)) {
        return {
            errCode: 2,
            errMessage: "Khuyến mãi phải từ 0 đến 100%!",
        };
    }

    return {
        errCode: 0,
        errMessage: "OK",
    };
};

let validateUpdateProduct = async (productInfo) => {
    if (!productInfo.masanpham) {
        return {
            errCode: 1,
            errMessage: "Mã sản phẩm không được để trống!",
        };
    }

    if (!productInfo.tensanpham) {
        return {
            errCode: 1,
            errMessage: "Tên sản phẩm không được để trống!",
        };
    } else {
        const productName = productInfo.tensanpham.trim();
        const basicProductRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,100}$/;
        if (!basicProductRegex.test(productName)) {
            return {
                errCode: 2,
                errMessage: "Tên sản phẩm không hợp lệ! Tên phải từ 2-100 ký tự, chỉ chứa chữ cái, số và khoảng trắng.",
            };
        }
    }

    if (!productInfo.giaban) {
        return {
            errCode: 1,
            errMessage: "Giá bán không được để trống!",
        };
    } else if (isNaN(productInfo.giaban) || parseFloat(productInfo.giaban) <= 0) {
        return {
            errCode: 2,
            errMessage: "Giá bán phải lớn hơn 0!",
        };
    }

    if (!productInfo.producttype) {
        return {
            errCode: 1,
            errMessage: "Danh mục không được để trống!",
        };
    } else {
        const validProductType = await db.AllCodes.findOne({
            where: { Type: "ProductType", Code: productInfo.producttype },
        });
        if (!validProductType) {
            return {
                errCode: 2,
                errMessage: "Danh mục không hợp lệ!",
            };
        }
    }

    if (!productInfo.hinhanh || typeof productInfo.hinhanh !== "object" || !productInfo.hinhanh.secure_url) {
        return {
            errCode: 1,
            errMessage: "Vui lòng thêm ít nhất 1 hình ảnh chính cho sản phẩm!",
        };
    }

    if (productInfo.chitiethinhanh && productInfo.chitiethinhanh.length > 4) {
        return {
            errCode: 2,
            errMessage: "Tối đa 4 hình ảnh phụ cho sản phẩm!",
        };
    }
    if (productInfo.chitiethinhanh) {
        for (let img of productInfo.chitiethinhanh) {
            if (typeof img !== "object" || !img.secure_url) {
                return {
                    errCode: 2,
                    errMessage: "Hình ảnh phụ không hợp lệ!",
                };
            }
        }
    }

    if (!productInfo.chitietsanpham || productInfo.chitietsanpham.length === 0) {
        return {
            errCode: 1,
            errMessage: "Vui lòng thêm ít nhất 1 chi tiết sản phẩm!",
        };
    } else {
        for (let item of productInfo.chitietsanpham) {
            if (!item.tenctsp) {
                return {
                    errCode: 1,
                    errMessage: "Tên chi tiết sản phẩm không được để trống!",
                };
            } else {
                const ctspRegex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;
                if (!ctspRegex.test(item.tenctsp.trim())) {
                    return {
                        errCode: 2,
                        errMessage: "Tên chi tiết sản phẩm không hợp lệ! Tên phải từ 1-50 ký tự, chỉ chứa chữ cái, số và khoảng trắng.",
                    };
                }
            }
            if (item.soluongton === undefined || item.soluongton === "") {
                return {
                    errCode: 1,
                    errMessage: "Số lượng tồn không được để trống!",
                };
            } else if (isNaN(item.soluongton) || parseInt(item.soluongton) < 0) {
                return {
                    errCode: 2,
                    errMessage: "Số lượng tồn phải lớn hơn hoặc bằng 0!",
                };
            }
            if (item.giathem && (isNaN(item.giathem) || parseFloat(item.giathem) < 0)) {
                return {
                    errCode: 2,
                    errMessage: "Giá thêm phải lớn hơn hoặc bằng 0!",
                };
            }
        }
    }

    if (productInfo.khuyenmai && (isNaN(productInfo.khuyenmai) || parseFloat(productInfo.khuyenmai) < 0 || parseFloat(productInfo.khuyenmai) > 100)) {
        return {
            errCode: 2,
            errMessage: "Khuyến mãi phải từ 0 đến 100%!",
        };
    }

    return {
        errCode: 0,
        errMessage: "OK",
    };
};

// Hàm generateMaSanPham (di chuyển lên trước createProduct)
let generateMaSanPham = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const timestamp = Date.now().toString();
            const uniquePart = timestamp.slice(-8);
            let MASANPHAM = `SP${uniquePart}`;
            let attempts = 0;

            while (attempts < 5) {
                const existingProduct = await db.SanPham.findOne({
                    where: { MASANPHAM },
                });
                if (!existingProduct) {
                    resolve(MASANPHAM);
                    return;
                }
                const newUniquePart = timestamp.slice(-8, -attempts) + Math.floor(Math.random() * 10);
                MASANPHAM = `SP${newUniquePart.padEnd(8, "0")}`;
                attempts++;
            }

            reject(new Error("Không thể tạo mã sản phẩm sau 5 lần thử!"));
        } catch (e) {
            reject(e);
        }
    });
};



let getChiTietHinhAnh = (masanpham) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = null;
            if (masanpham) {
                data = await db.ChiTietHinhAnh.findAll({
                    attributes: ["MATHAMCHIEU", "HinhAnh"],
                    where: { MATHAMCHIEU: masanpham },
                });
            }
            resolve(data && data.length > 0 ? data : { errCode: 1, errMessage: "Get fail!" });
        } catch (e) {
            reject(e);
        }
    });
};

let getProductDetailsByMASANPHAM = (masanpham) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!masanpham) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing MASANPHAM parameter",
                });
                return;
            }
            const sanPham = await db.SanPham.findOne({
                where: { MASANPHAM: masanpham },
                attributes: ["MASANPHAM", "TenSanPham", "GiaBan", "HinhAnh", "KhuyenMai", "MoTa"],
                raw: true,
            });
            if (!sanPham) {
                resolve({
                    errCode: 2,
                    errMessage: "Product not found",
                });
                return;
            }
            const chiTietSanPham = await db.ChiTietSanPham.findAll({
                where: { MASP: masanpham },
                attributes: ["MACTSP", "TenCTSP", "SoLuongTon", "GiaThem"],
                raw: true,
            });
            const chiTietHinhAnh = await db.ChiTietHinhAnh.findAll({
                where: { MATHAMCHIEU: masanpham },
                attributes: ["HinhAnh"],
                raw: true,
            });
            const productDetails = {
                SanPham: sanPham,
                ChiTietSanPham: chiTietSanPham,
                ChiTietHinhAnh: chiTietHinhAnh,
            };
            resolve({
                errCode: 0,
                errMessage: "OK",
                data: productDetails,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let loadBanner = (page, limit, search, sort) => {
    return new Promise(async (resolve, reject) => {
        try {
            const offset = (page - 1) * limit;
            let where = {};

            // Tìm kiếm theo TenSanPham
            let whereSanPham = {};
            if (search) {
                whereSanPham.TenSanPham = { [Op.like]: `%${search}%` };
            }

            // Lấy danh sách banner
            const banners = await db.Banner.findAll({
                where,
                attributes: ["ID", "HinhAnh", "ThoiGianTao", "ThoiGianAn", "BannerStatus", "MASANPHAM"],
                include: [
                    {
                        model: db.SanPham,
                        as: "SanPham",
                        attributes: ["MASANPHAM", "TenSanPham", "HinhAnh"],
                        where: whereSanPham, // Điều kiện tìm kiếm "Cát"
                        required: true, // Chỉ trả về banner có SanPham khớp
                    },
                    {
                        model: db.AllCodes,
                        as: "BannerStatusData",
                        attributes: ["Code", "Value"],
                        where: { Type: "BannerStatus" },
                        required: false,
                    },
                ],
                limit,
                offset,
                raw: true,
                nest: true,
            });

            // Ánh xạ dữ liệu
            let data = banners.map((item) => ({
                ID: item.ID,
                HinhAnh: item.HinhAnh,
                ThoiGianTao: item.ThoiGianTao,
                ThoiGianAn: item.ThoiGianAn,
                BannerStatus: item.BannerStatusData && item.BannerStatusData.Code === item.BannerStatus // Sửa BANNER_STATUS thành BannerStatus
                    ? item.BannerStatusData.Value
                    : item.BannerStatus || "N/A",
                isActive: item.BannerStatus === "SHOW", // Sửa BANNER_STATUS thành BannerStatus
                MASANPHAM: item.SanPham?.MASANPHAM || "N/A",
                TenSanPham: item.SanPham?.TenSanPham || "N/A",
                HinhAnhSanPham: item.SanPham?.HinhAnh || null,
            }));


            // Sắp xếp
            switch (sort) {
                case "1": // Cũ nhất
                    data.sort((a, b) => new Date(a.ThoiGianTao) - new Date(b.ThoiGianTao));
                    break;
                default: // Mới nhất
                    data.sort((a, b) => new Date(b.ThoiGianTao) - new Date(a.ThoiGianTao));
                    break;
            }

            // Tính tổng số banner
            const totalItems = await db.Banner.count({
                where,
                include: [
                    {
                        model: db.SanPham,
                        as: "SanPham",
                        where: whereSanPham,
                        required: true,
                    },
                ],
            });

            resolve({
                errCode: 0,
                errMessage: "OK",
                data,
                totalItems,
            });
        } catch (e) {
            console.error("Error in loadBanner:", e);
            reject(e);
        }
    });
};

let createProduct = (productInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate dữ liệu
            let validation = await validateProductInput(productInfo);
            if (validation.errCode !== 0) {
                resolve(validation);
                return;
            }

            // Tạo mã sản phẩm
            const MASANPHAM = await generateMaSanPham();

            // Lưu sản phẩm vào bảng SanPham
            const sanPham = await db.SanPham.create({
                MASANPHAM,
                TenSanPham: productInfo.tensanpham,
                GiaBan: productInfo.giaban,
                KhuyenMai: productInfo.khuyenmai || null,
                MoTa: productInfo.mota || null,
                ProductType: productInfo.producttype,
                ProductStatus: "AVAIL",
                HinhAnh: productInfo.hinhanh.secure_url,
            });

            // Lưu chi tiết sản phẩm vào bảng ChiTietSanPham
            if (productInfo.chitietsanpham && productInfo.chitietsanpham.length > 0) {
                await db.ChiTietSanPham.bulkCreate(
                    productInfo.chitietsanpham.map((item) => ({
                        MASP: MASANPHAM,
                        TenCTSP: item.tenctsp,
                        GiaThem: item.giathem || null,
                        SoLuongTon: item.soluongton,
                    }))
                );
            }

            // Lưu chi tiết hình ảnh vào bảng ChiTietHinhAnh (các ảnh phụ)
            if (productInfo.chitiethinhanh && productInfo.chitiethinhanh.length > 0) {
                await db.ChiTietHinhAnh.bulkCreate(
                    productInfo.chitiethinhanh.map((img) => ({
                        MATHAMCHIEU: MASANPHAM,
                        HinhAnh: img.secure_url,
                    }))
                );
            }

            resolve({
                errCode: 0,
                errMessage: "Tạo sản phẩm thành công!",
            });
        } catch (e) {
            resolve({
                errCode: 1,
                errMessage: `Lỗi khi lưu sản phẩm: ${e.message || "Không xác định"}`,
            });
        }
    });
};

let delSanPham = (masanpham) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!masanpham) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }
            let data = await db.SanPham.findOne({
                where: { MASANPHAM: masanpham },
                raw: false
            })
            if (!data) {
                resolve({
                    errCode: 2,
                    errMessage: 'Sản phẩm không tồn tại!'
                })
            }
            data.ProductStatus = data.ProductStatus === "AVAIL" ? "OUT" : "AVAIL";
            await data.save();
            resolve({
                errCode: 0,
                errMessage: "Xóa sản phẩm thành công!"
            })
        } catch (e) {
            reject(e);
        }
    })
}

let updateProduct = (productInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate dữ liệu
            let validation = await validateUpdateProduct(productInfo);
            if (validation.errCode !== 0) {
                resolve(validation);
                return;
            }

            const MASANPHAM = productInfo.masanpham;

            // Kiểm tra sản phẩm tồn tại
            const sanPham = await db.SanPham.findOne({
                where: { MASANPHAM },
                raw: false, // Để có thể cập nhật
            });

            if (!sanPham) {
                resolve({
                    errCode: 2,
                    errMessage: "Sản phẩm không tồn tại!",
                });
                return;
            }

            // Cập nhật thông tin sản phẩm trong bảng SanPham
            await sanPham.update({
                TenSanPham: productInfo.tensanpham,
                GiaBan: productInfo.giaban,
                KhuyenMai: productInfo.khuyenmai || null,
                MoTa: productInfo.mota || null,
                ProductType: productInfo.producttype,
                HinhAnh: productInfo.hinhanh.secure_url,
            });

            // Xóa chi tiết sản phẩm cũ
            await db.ChiTietSanPham.destroy({
                where: { MASP: MASANPHAM },
            });

            // Lưu chi tiết sản phẩm mới vào bảng ChiTietSanPham
            if (productInfo.chitietsanpham && productInfo.chitietsanpham.length > 0) {
                await db.ChiTietSanPham.bulkCreate(
                    productInfo.chitietsanpham.map((item) => ({
                        MASP: MASANPHAM,
                        TenCTSP: item.tenctsp,
                        GiaThem: item.giathem || null,
                        SoLuongTon: item.soluongton,
                    }))
                );
            }

            // Xóa chi tiết hình ảnh cũ
            await db.ChiTietHinhAnh.destroy({
                where: { MATHAMCHIEU: MASANPHAM },
            });

            // Lưu chi tiết hình ảnh mới vào bảng ChiTietHinhAnh
            if (productInfo.chitiethinhanh && productInfo.chitiethinhanh.length > 0) {
                await db.ChiTietHinhAnh.bulkCreate(
                    productInfo.chitiethinhanh.map((img) => ({
                        MATHAMCHIEU: MASANPHAM,
                        HinhAnh: img.secure_url,
                    }))
                );
            }

            resolve({
                errCode: 0,
                errMessage: "Cập nhật sản phẩm thành công!",
            });
        } catch (e) {
            resolve({
                errCode: 1,
                errMessage: `Lỗi khi cập nhật sản phẩm: ${e.message || "Không xác định"}`,
            });
        }
    });
};

module.exports = {
    getChiTietHinhAnh,
    getProductDetailsByMASANPHAM,
    loadBanner,
    createProduct,
    delSanPham,
    updateProduct
};