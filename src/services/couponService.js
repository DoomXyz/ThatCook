import db from '../models/index';
import { Op } from 'sequelize';
import { checkValidAllCode } from './utilitiesService';

let validateCouponInput = async (couponInfo) => {
    if (!couponInfo || Object.keys(couponInfo).length === 0) {
        return {
            errCode: -1,
            errMessage: 'Thiếu thông tin mã giảm giá!',
            data: null,
        };
    }
    const { couponcode, coupondescription, minordervalue, discountvalue, discounttype, maxdiscount, startdate, enddate, couponstatus } = couponInfo;
    if (!couponcode) {
        return { errCode: -1, errMessage: 'Vui lòng nhập mã giảm giá!' };
    } else {
        const couponCodeRegex = /^[a-zA-Z0-9]{5,20}$/;
        if (!couponCodeRegex.test(couponcode.trim())) {
            return { errCode: 1, errMessage: 'Mã giảm giá không hợp lệ hoặc vượt quá giới hạn ký tự!', data: null, };
        }
    }
    if (coupondescription) {
        const description = coupondescription.trim();
        if (!description || description.length > 65535) {
            return {
                errCode: 1,
                errMessage: 'Mô tả giảm giá không hợp lệ hoặc vượt quá giới hạn ký tự!',
                data: null,
            };
        }
    }
    if (minordervalue && minordervalue < 0) {
        return { errCode: -1, errMessage: 'Giá trị mua ít nhất không được bé hơn 0!', data: null };
    }
    if (!discounttype) {
        return { errCode: -1, errMessage: 'Loại giảm giá không được để trống!', data: null };
    } else {
        const validDiscountType = await checkValidAllCode('DiscountType', discounttype);
        if (!validDiscountType) {
            return {
                errCode: 1,
                errMessage: 'Loại giảm giá không hợp lệ!',
                data: null,
            };
        }
    }
    if (!discountvalue) {
        return { errCode: -1, errMessage: 'Giá trị giảm không được để trống!', data: null };
    } else {
        if (discounttype === 'PERC' && discountvalue > 100 || discountvalue < 0) { return { errCode: 1, errMessage: 'Giá trị giảm không hợp lệ!', data: null }; }
        else if (discounttype === 'FIXED' && discountvalue < 0) {
            return { errCode: 1, errMessage: 'Giá trị giảm không hợp lệ!', data: null };
        }
    }
    if (maxdiscount) {
        if (maxdiscount < 0) { return { errCode: 1, errMessage: 'Gỉảm giá tối đa phải lớn hơn 0!', data: null }; }
    } else if (discounttype === 'FIXED' && maxdiscount > discountvalue) {
        return { errCode: -1, errMessage: 'Gỉảm giá tối đa không được lớn hơn giá trị giảm ban đầu!', data: null };
    }
    if (!startdate) {
        return { errCode: -1, errMessage: 'Ngày bắt đầu không được để trống!', data: null };
    }

    if (enddate) {
        const startCheck = new Date(enddate);
        const dateCheck = new Date(enddate);
        if (isNaN(dateCheck.getTime())) return { errCode: 1, errMessage: 'Ngày hết hiệu lực không hợp lệ!', data: null };
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const starttime = `${hours}:${minutes}`;
        const [hoursCheck, minutesCheck] = starttime.split(':').map(Number);
        dateCheck.setHours(hoursCheck, minutesCheck, 0, 0);
        startCheck.setHours(hoursCheck, minutesCheck, 0, 0);
        if (dateCheck < now) return { errCode: 1, errMessage: 'Ngày hết hiệu lực phải trong tương lai', data: null };
        if (dateCheck < startCheck) return { errCode: 1, errMessage: 'Thời gian hết hiệu lực phải lớn hơn thời gian quá khứ', data: null };
    }
    if (!couponstatus) {
        return { errCode: -1, errMessage: 'Trạng thái giảm giá không được để trống!', data: null };
    } else {
        const validCouponStatus = await checkValidAllCode('CouponStatus', couponstatus);
        if (!validCouponStatus) {
            return {
                errCode: 1,
                errMessage: 'Trạng thái giảm giá không hợp lệ!',
                data: null,
            };
        }
    }
    return null
};

let checkCouponCodeExist = (couponcode) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!couponcode) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu mã giảm giá để kiểm tra!',
                    data: null,
                });
                return;
            }
            let exist = await db.Coupon.findOne({
                where: { CouponCode: couponcode },
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra tên tài khoản: ' + e.message,
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
                    const validCouponStatus = await checkValidAllCode('CouponStatus', value);
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
                    const validDiscountType = await checkValidAllCode('DiscountType', value);
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
                errMessage: 'Lỗi khi lấy danh sách mã giảm giá:' + e.message,
                data: null,
            });
        }
    });
};

let createCoupon = (couponInfo) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!couponInfo) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu thông tin mã giảm giá!',
                    data: null,
                });
                return;
            }
            const isValidateInput = await validateCouponInput(couponInfo);
            if (isValidateInput) {
                await transaction.rollback();
                resolve(isValidateInput);
                return;
            }
            const isCouponCodeExist = await checkCouponCodeExist(couponInfo.couponcode);
            if (isCouponCodeExist) {
                await transaction.rollback();
                resolve({
                    errCode: 1,
                    errMessage: 'Mã giảm giá đã tồn tại trong hệ thống!',
                    data: null,
                });
                return;
            }
            await db.Coupon.create({
                CouponCode: couponInfo.couponcode,
                CouponDescription: couponInfo.coupondescription,
                MinOrderValue: couponInfo.minordervalue ? couponInfo.minordervalue : 0,
                DiscountValue: couponInfo.discountvalue,
                MaxDiscount: couponInfo.maxdiscount,
                DiscountType: couponInfo.discounttype,
                StartDate: new Date(couponInfo.startdate).toISOString(),
                EndDate: couponInfo.endate ? new Date(couponInfo.enddate).toISOString() : null,
                CreatedAt: new Date(),
                CouponStatus: couponInfo.couponstatus,
            }, { transaction });
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Tạo mã giảm giá thành công!',
                data: null
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in CreateCoupon: ', e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo mã giảm giá:' + e.message,
                data: null,
            });
        }
    });
};

let changeCouponInfo = (couponInfo) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!couponInfo || !couponInfo.couponid) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số hoặc couponid!',
                    data: null,
                });
                return;
            }
            const isValidateInput = validateCouponInput(couponInfo);
            if (!isValidateInput) {
                await transaction.rollback();
                resolve(isValidateInput);
                return;
            }
            const coupon = await db.Coupon.findOne({
                where: { CouponID: couponInfo.couponid },
                transaction,
            });
            if (!coupon) {
                await transaction.rollback();
                resolve({
                    errCode: 2,
                    errMessage: 'Mã giảm giá không tồn tại!',
                    data: null,
                });
                return;
            }
            let isUpdated = false;
            if (couponInfo.couponcode && couponInfo.couponcode.trim() !== coupon.CouponCode) {
                coupon.CouponCode = couponInfo.couponcode.trim();
                isUpdated = true;
            }
            if (couponInfo.coupondescription !== undefined && couponInfo.coupondescription?.trim() !== (coupon.CouponDescription || '')) {
                coupon.CouponDescription = couponInfo.coupondescription ? couponInfo.coupondescription.trim() : null;
                isUpdated = true;
            }
            if (couponInfo.minordervalue !== undefined) {
                const newMinOrderValue = couponInfo.minordervalue ? parseFloat(couponInfo.minordervalue).toFixed(2) : null;
                if (newMinOrderValue !== (coupon.MinOrderValue || null)) {
                    coupon.MinOrderValue = newMinOrderValue;
                    isUpdated = true;
                }
            }
            if (couponInfo.discountvalue !== undefined) {
                const newDiscountValue = parseFloat(couponInfo.discountvalue);
                if (newDiscountValue !== coupon.DiscountValue) {
                    coupon.DiscountValue = newDiscountValue;
                    isUpdated = true;
                }
            }
            if (couponInfo.maxdiscount !== undefined) {
                const newMaxDiscount = couponInfo.maxdiscount ? parseFloat(couponInfo.maxdiscount).toFixed(2) : null;
                if (newMaxDiscount !== (coupon.MaxDiscount || null)) {
                    coupon.MaxDiscount = newMaxDiscount;
                    isUpdated = true;
                }
            }
            if (couponInfo.discounttype && couponInfo.discounttype !== coupon.DiscountType) {
                coupon.DiscountType = couponInfo.discounttype;
                isUpdated = true;
            }
            if (couponInfo.startdate !== undefined) {
                const newStartDate = couponInfo.startdate ? new Date(couponInfo.startdate).toISOString() : null;
                if (newStartDate !== coupon.StartDate) {
                    coupon.StartDate = newStartDate;
                    isUpdated = true;
                }
            }
            if (couponInfo.enddate !== undefined) {
                const newEndDate = couponInfo.enddate ? new Date(couponInfo.enddate).toISOString() : null;
                if (newEndDate !== coupon.EndDate) {
                    coupon.EndDate = newEndDate;
                    isUpdated = true;
                }
            }
            if (couponInfo.couponstatus && couponInfo.couponstatus !== coupon.CouponStatus) {
                coupon.CouponStatus = couponInfo.couponstatus;
                isUpdated = true;
            }
            if (!isUpdated) {
                await transaction.rollback();
                resolve({
                    errCode: 0,
                    errMessage: 'Không có thông tin nào để cập nhật!',
                    data: null,
                });
                return;
            }
            await db.Coupon.update(
                {
                    CouponCode: coupon.CouponCode,
                    CouponDescription: coupon.CouponDescription,
                    MinOrderValue: coupon.MinOrderValue,
                    DiscountValue: coupon.DiscountValue,
                    MaxDiscount: coupon.MaxDiscount,
                    DiscountType: coupon.DiscountType,
                    StartDate: coupon.StartDate,
                    EndDate: coupon.EndDate,
                    CouponStatus: coupon.CouponStatus
                },
                {
                    where: { CouponID: couponInfo.couponid },
                    transaction
                }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Cập nhật thông tin coupon thành công!',
                data: null,
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in changeCouponInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi cập nhật thông tin coupon: ${e.message}`,
                data: null,
            });
        }
    });
};


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

module.exports = {
    getCouponInfo,
    loadCouponInfo,
    createCoupon,
    changeCouponInfo,
    checkCoupon,
};