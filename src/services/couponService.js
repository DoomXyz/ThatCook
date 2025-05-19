import db from '../models/index';
import { Op, literal } from 'sequelize';
import { checkDiscountType, checkCouponStatus } from './utilitiesService';

let checkCoupon = (couponcode, price) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!couponcode || !price) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            let discountAmout = 0;
            const couponInfo = await db.Coupon.findOne({
                where: { CouponCode: couponcode, CouponStatus: 'ACTIVE' },
                attributes: ['DiscountType', 'DiscountValue', 'MaxDiscount', 'MinOrderValue', 'StartDate', 'EndDate'],
            });
            if (!couponInfo) {
                resolve({
                    errCode: 1,
                    errMessage: 'Mã giảm giá không tồn tại hoặc đã hết hạn!',
                    data: discountAmout,
                });
                return;
            }
            const currentDate = new Date();
            if (couponInfo.StartDate > currentDate || couponInfo.EndDate < currentDate) {
                resolve({
                    errCode: 2,
                    errMessage: 'Mã giảm giá không trong thời gian hiệu lực!',
                    data: discountAmout,
                });
                return;
            }
            if (couponInfo.StartDate > currentDate || couponInfo.EndDate < currentDate) {
                resolve({
                    errCode: 2,
                    errMessage: 'Mã giảm giá chưa bắt đầu!',
                    data: discountAmout,
                });
                return;
            }
            if (parseFloat(price) < parseFloat(couponInfo.MinOrderValue)) {
                resolve({
                    errCode: 2,
                    errMessage: 'Không thể áp dụng mã giảm giá!',
                    data: discountAmout,
                });
                return;
            }
            let discountValue = 0;
            if (couponInfo.DiscountType === 'FIXED') {
                discountValue = parseFloat(couponInfo.DiscountValue);
            } else {
                discountValue = price * (parseFloat(couponInfo.DiscountValue) / 100);
            }
            discountValue = price - discountValue > couponInfo.MaxDiscount ? couponInfo.MaxDiscount : discountValue;
            resolve({
                errCode: 0,
                errMessage: 'Kiểm tra giảm giá thành công!',
                data: discountValue,
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra thông tin: ' + e.message,
                data: null,
            });
        }
    });
};

let getCouponInfo = (couponcode) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!couponcode) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            let couponData = null;
            if (couponcode === 'ALL') {
                couponData = await db.Coupon.findAll({
                    attributes: ['CouponCode', 'MinOrderValue', 'DiscountValue', 'MaxDiscount', 'StartDate', 'EndDate', 'DiscountType', 'CouponStatus'],
                });
            } else {
                couponData = await db.Coupon.findOne({
                    where: { CouponCode: couponcode },
                    attributes: ['CouponCode', 'MinOrderValue', 'DiscountValue', 'MaxDiscount', 'StartDate', 'EndDate', 'DiscountType', 'CouponStatus'],
                });
            }
            if (couponData !== null) {
                resolve({
                    errCode: 0,
                    errMessage: 'Lấy dữ liệu thành công!',
                    data: couponData,
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Mã giảm giá không tồn tại!',
                    data: null,
                });
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra thông tin: ' + e.message,
                data: null,
            });
        }
    });
};

let loadCouponInfo = (page, limit, search, filter, sort, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!page || !limit || page < 1 || limit < 1) {
                resolve({
                    errCode: -1,
                    errMessage: 'Tham số page hoặc limit không hợp lệ!',
                    data: null,
                });
                return;
            }
            if (filter !== 'ALL' && !filter.includes('-')) {
                resolve({
                    errCode: 1,
                    errMessage: 'Tham số filter không hợp lệ!',
                    data: null,
                });
                return;
            }
            if (sort && !['0', '1', '2', '3', '4', '5', '6'].includes(sort)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Tham số sort không hợp lệ!',
                    data: null,
                });
                return;
            }
            const offset = (page - 1) * limit;
            let where = {};
            let order = [];

            // Tìm kiếm theo CouponCode
            if (search?.trim()) {
                const searchTerm = search.trim().substring(0, 20);
                where[Op.or] = [{ CouponCode: { [Op.like]: `%${searchTerm}%` } }];
            }
            // Lọc theo ngày (bỏ qua giờ)
            if (date) {
                const selectedDate = new Date(date);
                if (isNaN(selectedDate.getTime())) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Tham số date không hợp lệ!',
                        data: null,
                    });
                    return;
                }
                selectedDate.setHours(0, 0, 0, 0);
                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999);
                where[Op.and] = [
                    { StartDate: { [Op.lte]: endOfDay } },
                    {
                        [Op.or]: [
                            { EndDate: { [Op.gte]: selectedDate } },
                            { EndDate: null },
                        ],
                    },
                ];
            }
            // Lọc theo couponstatus, discounttype, maxdiscountfixed, hoặc maxdiscountperc
            if (filter !== 'ALL') {
                const [field, value] = filter.split('-');
                if (field === 'couponstatus') {
                    const validCouponStatus = await checkCouponStatus(value);
                    if (!validCouponStatus) {
                        resolve({
                            errCode: 1,
                            errMessage: 'Trạng thái mã giảm giá không hợp lệ!',
                            data: null,
                        });
                        return;
                    }
                    where.CouponStatus = value;
                } else if (field === 'discounttype') {
                    const validDiscountType = await checkDiscountType(value);
                    if (!validDiscountType) {
                        resolve({
                            errCode: 1,
                            errMessage: 'Loại giảm giá không hợp lệ!',
                            data: null,
                        });
                        return;
                    }
                    where.DiscountType = value;
                } else if (field === 'maxdiscountfixed') {
                    where.DiscountType = 'FIXED';
                    switch (value) {
                        case '0':
                            where.MaxDiscount = { [Op.between]: [0, 20000] };
                            break;
                        case '1':
                            where.MaxDiscount = { [Op.between]: [20000, 50000] };
                            break;
                        case '2':
                            where.MaxDiscount = { [Op.between]: [50000, 100000] };
                            break;
                        case '3':
                            where.MaxDiscount = { [Op.gt]: 100000 };
                            break;
                        default:
                            resolve({
                                errCode: 1,
                                errMessage: 'Khoảng giá không hợp lệ!',
                                data: null,
                            });
                            return;
                    }
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: 'Tham số filter không hợp lệ!',
                        data: null,
                    });
                    return;
                }
            }

            // Sắp xếp
            switch (sort) {
                case '1': // Mã giảm giá mới nhất
                    order.push(['CreatedAt', 'DESC']);
                    break;
                case '2': // Mã giảm giá cũ nhất
                    order.push(['CreatedAt', 'ASC']);
                    break;
                case '3': // Hạn sử dụng xa nhất
                    order.push(['EndDate', 'ASC']);
                    break;
                case '4': // Hết sử dụng gần nhất
                    order.push(['EndDate', 'DESC']);
                    break;
                case '5': // Giảm giá ít nhất
                    order.push(['MaxDiscount', 'ASC']);
                    break;
                case '6': // Giảm giá nhiều nhất
                    order.push(['MaxDiscount', 'DESC']);
                    break;
                default: // Mặc định (0)
                    order.push(['CreatedAt', 'DESC']);
                    break;
            }

            // Lấy danh sách hóa đơn
            const { count, rows } = await db.Coupon.findAndCountAll({
                where,
                attributes: [
                    'CouponID',
                    'CouponCode',
                    'CouponDescription',
                    'MinOrderValue',
                    'DiscountValue',
                    'MaxDiscount',
                    'DiscountType',
                    'CouponStatus',
                    'StartDate',
                    'EndDate',
                    'CreatedAt',
                ],
                limit: parseInt(limit),
                offset,
                order,
                raw: true,
                distinct: true,
            });
            if (!rows || rows.length === 0) {
                resolve({
                    errCode: 0,
                    errMessage: 'Không tìm thấy mã giảm giá nào!',
                    data: [],
                    totalItems: 0,
                });
                return;
            }
            resolve({
                errCode: 0,
                errMessage: 'Lấy danh sách mã giảm giá thành công!',
                data: rows,
                totalItems: count,
            });
        } catch (e) {
            console.log('Error in loadCouponInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy danh sách mã giảm giá: ${e.message}`,
                data: null,
            });
        }
    });
};

module.exports = {
    checkCoupon,
    getCouponInfo,
    loadCouponInfo,
};