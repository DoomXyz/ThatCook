import db from '../models/index';
import { Op } from 'sequelize';
import { checkValidAllCode } from './utilitiesService';

let validateServiceInput = (serviceInfo) => {
    if (!serviceInfo || Object.keys(serviceInfo).length === 0) {
        return {
            errCode: -1,
            errMessage: 'Thiếu thông tin dịch vụ!',
            data: null,
        };
    }
    const { ServiceName, Price, Duration, Description } = serviceInfo;
    if (!ServiceName?.trim()) {
        return {
            errCode: -1,
            errMessage: 'Tên dịch vụ không được để trống!',
            data: null,
        };
    }
    const nameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!nameRegex.test(ServiceName.trim())) {
        return {
            errCode: 1,
            errMessage: 'Tên dịch vụ không hợp lệ (2-50 ký tự, chỉ chữ, số và khoảng trắng)!',
            data: null,
        };
    }
    if (!Price || isNaN(Price) || parseFloat(Price) < 0) {
        return {
            errCode: -1,
            errMessage: 'Giá dịch vụ không hợp lệ (phải là số không âm)!',
            data: null,
        };
    }
    if (!Duration || isNaN(Duration) || parseInt(Duration) <= 0) {
        return {
            errCode: -1,
            errMessage: 'Thời gian thực hiện không hợp lệ (phải là số nguyên dương)!',
            data: null,
        };
    }
    if (Description && Description.trim().length > 65535) {
        return {
            errCode: 1,
            errMessage: 'Mô tả vượt quá giới hạn ký tự (65535)!',
            data: null,
        };
    }
    return null;
};

let getVeterinarianService = (accountid) => {
    return new Promise(async (resolve, reject) => {
        try {
            const services = await db.VeterinarianService.findAll({
                where: { VeterinarianID: accountid },
                include: [
                    {
                        model: db.Service,
                        attributes: ['ServiceID', 'ServiceName', 'Price', 'Duration', 'Description'],
                    },
                ],
                attributes: [],
                raw: true,
                nest: true,
            });
            if (!services || services.length === 0) {
                resolve({
                    errCode: 1,
                    errMessage: 'Bác sĩ không có dịch vụ nào!',
                    data: [],
                });
                return;
            }
            const formattedServices = services.map((s) => ({
                ServiceID: s.Service.ServiceID,
                ServiceName: s.Service.ServiceName,
                Price: s.Service.Price,
                Duration: s.Service.Duration,
                Description: s.Service.Description,
            }));
            resolve({
                errCode: 0,
                errMessage: 'Lấy danh sách dịch vụ thành công!',
                data: formattedServices,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getServiceInfo = (serviceid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!serviceid) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            let data = null;
            if (serviceid === 'ALL') {
                const services = await db.Service.findAll({
                    where: { ServiceStatus: 'VALID' },
                    attributes: ['ServiceID', 'ServiceName', 'Price', 'Duration', 'Description'],
                    raw: true,
                });
                if (!services || services.length === 0) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Không tìm thấy dịch vụ nào!',
                        data: [],
                    });
                    return;
                }
                data = services;
            } else {
                const service = await db.Service.findOne({
                    where: { ServiceID: serviceid, ServiceStatus: 'VALID' },
                    attributes: ['ServiceID', 'ServiceName', 'Price', 'Duration', 'Description'],
                    raw: true,
                });
                if (!service) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Dịch vụ không tồn tại!',
                        data: null,
                    });
                    return;
                }
                data = service;
            }
            resolve({
                errCode: 0,
                errMessage: 'Lấy thông tin dịch vụ thành công!',
                data,
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi lấy thông tin dịch vụ: ' + e.message,
                data: null,
            });
        }
    });
};

let loadServiceInfo = (page, limit, search, filter, sort) => {
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
            let order = [['ServiceID', 'ASC']];

            if (search?.trim()) {
                const searchTerm = search.trim().substring(0, 50);
                where[Op.or] = [
                    { ServiceName: { [Op.like]: `%${searchTerm}%` } },
                    { Description: { [Op.like]: `%${searchTerm}%` } },
                ];
            }

            if (filter !== 'ALL') {
                const [field, value] = filter.split('-');
                if (field === 'price') {
                    if (value === 'LOW') where.Price = { [Op.lte]: 100000 };
                    else if (value === 'MED') where.Price = { [Op.between]: [100000, 500000] };
                    else if (value === 'HIGH') where.Price = { [Op.gte]: 500000 };
                    else {
                        resolve({
                            errCode: 1,
                            errMessage: 'Tham số filter giá không hợp lệ!',
                            data: null,
                        });
                        return;
                    }
                } else if (field === 'duration') {
                    if (value === 'SHORT') where.Duration = { [Op.lte]: 30 };
                    else if (value === 'MED') where.Duration = { [Op.between]: [30, 60] };
                    else if (value === 'LONG') where.Duration = { [Op.gte]: 60 };
                    else {
                        resolve({
                            errCode: 1,
                            errMessage: 'Tham số filter thời gian không hợp lệ!',
                            data: null,
                        });
                        return;
                    }
                } else if (field === 'status') {
                    const validStatus = await checkValidAllCode('ServiceStatus', value);
                    if (!validStatus) {
                        resolve({
                            errCode: 1,
                            errMessage: 'Tham số filter trạng thái không hợp lệ!',
                            data: null,
                        });
                        return;
                    }
                    where.ServiceStatus = value;
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: 'Tham số filter không hợp lệ!',
                        data: null,
                    });
                    return;
                }
            }

            switch (sort) {
                case '1': order = [['ServiceName', 'ASC']]; break;
                case '2': order = [['ServiceName', 'DESC']]; break;
                case '3': order = [['Price', 'ASC']]; break;
                case '4': order = [['Price', 'DESC']]; break;
                case '5': order = [['Duration', 'ASC']]; break;
                case '6': order = [['Duration', 'DESC']]; break;
                default: order = [['ServiceID', 'ASC']]; break;
            }

            const { count, rows } = await db.Service.findAndCountAll({
                where,
                attributes: ['ServiceID', 'ServiceName', 'Price', 'Duration', 'Description', 'ServiceStatus'],
                limit: parseInt(limit),
                offset,
                order,
                raw: true,
            });

            resolve({
                errCode: 0,
                errMessage: rows.length > 0 ? 'Lấy danh sách dịch vụ thành công!' : 'Không tìm thấy dịch vụ nào!',
                data: rows,
                totalItems: count
            });
        } catch (e) {
            console.log('Error in loadServiceInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy danh sách dịch vụ: ${e.message}`,
                data: null,
            });
        }
    });
};

let createService = (serviceInfo) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!serviceInfo) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu thông tin dịch vụ!',
                    data: null,
                });
                return;
            }
            const isValidateInput = validateServiceInput(serviceInfo);
            if (isValidateInput) {
                await transaction.rollback();
                resolve(isValidateInput);
                return;
            }
            const isServiceExist = await db.Service.findOne({
                where: { ServiceName: serviceInfo.ServiceName.trim() },
                transaction,
            });
            if (isServiceExist) {
                await transaction.rollback();
                resolve({
                    errCode: 1,
                    errMessage: 'Tên dịch vụ đã tồn tại!',
                    data: null,
                });
                return;
            }
            await db.Service.create(
                {
                    ServiceName: serviceInfo.ServiceName.trim(),
                    Price: parseFloat(serviceInfo.Price).toFixed(2),
                    Duration: parseInt(serviceInfo.Duration),
                    Description: serviceInfo.Description ? serviceInfo.Description.trim() : null,
                    ServiceStatus: 'VALID',
                },
                { transaction }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Tạo dịch vụ thành công!',
                data: null,
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in createService: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi tạo dịch vụ: ${e.message}`,
                data: null,
            });
        }
    });
};

let changeServiceInfo = (serviceInfo) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!serviceInfo || !serviceInfo.ServiceID) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số ServiceID!',
                    data: null,
                });
                return;
            }
            const isValidateInput = validateServiceInput(serviceInfo);
            if (isValidateInput) {
                await transaction.rollback();
                resolve(isValidateInput);
                return;
            }
            const service = await db.Service.findOne({
                where: { ServiceID: serviceInfo.ServiceID },
                transaction,
            });
            if (!service) {
                await transaction.rollback();
                resolve({
                    errCode: 2,
                    errMessage: 'Dịch vụ không tồn tại!',
                    data: null,
                });
                return;
            }
            const isNameExist = await db.Service.findOne({
                where: {
                    ServiceName: serviceInfo.ServiceName.trim(),
                    ServiceID: { [Op.ne]: serviceInfo.ServiceID },
                },
                transaction,
            });
            if (isNameExist) {
                await transaction.rollback();
                resolve({
                    errCode: 1,
                    errMessage: 'Tên dịch vụ đã tồn tại!',
                    data: null,
                });
                return;
            }
            let isUpdated = false;
            if (serviceInfo.ServiceName.trim() !== service.ServiceName) {
                service.ServiceName = serviceInfo.ServiceName.trim();
                isUpdated = true;
            }
            if (parseFloat(serviceInfo.Price).toFixed(2) !== service.Price) {
                service.Price = parseFloat(serviceInfo.Price).toFixed(2);
                isUpdated = true;
            }
            if (parseInt(serviceInfo.Duration) !== service.Duration) {
                service.Duration = parseInt(serviceInfo.Duration);
                isUpdated = true;
            }
            const newDescription = serviceInfo.Description ? serviceInfo.Description.trim() : null;
            if (newDescription !== service.Description) {
                service.Description = newDescription;
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
            await db.Service.update(
                {
                    ServiceName: service.ServiceName,
                    Price: service.Price,
                    Duration: service.Duration,
                    Description: service.Description,
                },
                { where: { ServiceID: serviceInfo.ServiceID }, transaction }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Cập nhật thông tin dịch vụ thành công!',
                data: null,
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in changeServiceInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi cập nhật thông tin dịch vụ: ${e.message}`,
                data: null,
            });
        }
    });
};

let changeServiceStatus = (serviceID, newStatus) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!serviceID || !newStatus) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu hoặc tham số không hợp lệ!',
                    data: null,
                });
                return;
            }
            const validServiceStatus = await checkValidAllCode('ServiceStatus', newStatus);
            if (!validServiceStatus) {
                await transaction.rollback();
                resolve({
                    errCode: 1,
                    errMessage: 'Trạng thái dịch vụ không hợp lệ!',
                    data: null,
                });
                return;
            }
            const service = await db.Service.findOne({
                where: { ServiceID: serviceID },
                transaction,
            });
            if (!service) {
                await transaction.rollback();
                resolve({
                    errCode: 2,
                    errMessage: 'Dịch vụ không tồn tại!',
                    data: null,
                });
                return;
            }
            if (service.ServiceStatus === newStatus) {
                await transaction.rollback();
                resolve({
                    errCode: 1,
                    errMessage: 'Trạng thái không thay đổi!',
                    data: null,
                });
                return;
            }
            await db.Service.update(
                { ServiceStatus: newStatus },
                { where: { ServiceID: serviceID }, transaction }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: `Đã ${newStatus === 'VALID' ? 'kích hoạt' : 'vô hiệu hóa'} dịch vụ thành công!`,
                data: null,
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in changeServiceStatus: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi thay đổi trạng thái dịch vụ: ${e.message}`,
                data: null,
            });
        }
    });
};

module.exports = {
    getVeterinarianService,
    getServiceInfo,
    loadServiceInfo,
    createService,
    changeServiceInfo,
    changeServiceStatus,
};