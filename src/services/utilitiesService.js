import db from '../models/index';
import { Op } from 'sequelize';

//lấy thông tin allcodes
let getAllCodes = (type) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!type) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let allCodes
      if (type !== "ALL") {
        allCodes = await db.AllCodes.findAll({
          where: { Type: type },
          attributes: ['Code', 'CodeValueVI', 'ExtraValue'],
          raw: true,
        });
      } else {
        allCodes = await db.AllCodes.findAll({
          attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('Type')), 'Type']],
          raw: true,
        });
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách mã thành công!',
        data: allCodes.length > 0 ? allCodes : [],
      });
    } catch (e) {
      console.log('Error in getAllCodes: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy danh sách mã: ' + e.message,
        data: null,
      });
    }
  });
};

let validateCodeInput = (codeInfo) => {
  if (!codeInfo || Object.keys(codeInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin mã!',
      data: null,
    };
  }
  const { Type, Code, CodeValueVI, ExtraValue } = codeInfo;
  if (!Type?.trim()) {
    return {
      errCode: -1,
      errMessage: 'Type không được để trống!',
      data: null,
    };
  }
  const typeRegex = /^[A-Za-z0-9]{2,30}$/;
  if (!typeRegex.test(Type.trim())) {
    return {
      errCode: 1,
      errMessage: 'Type không hợp lệ (2-30 ký tự, chỉ chữ và số)!',
      data: null,
    };
  }
  if (!Code?.trim()) {
    return {
      errCode: -1,
      errMessage: 'Code không được để trống!',
      data: null,
    };
  }
  const codeRegex = /^[A-Za-z0-9]{1,20}$/;
  if (!codeRegex.test(Code.trim())) {
    return {
      errCode: 1,
      errMessage: 'Code không hợp lệ (1-20 ký tự, chỉ chữ và số)!',
      data: null,
    };
  }
  if (!CodeValueVI?.trim()) {
    return {
      errCode: -1,
      errMessage: 'CodeValueVI không được để trống!',
      data: null,
    };
  }
  const valueRegex = /^(?=.*[A-Za-zÀ-ỹ]).{2,50}$/;
  if (!valueRegex.test(CodeValueVI.trim())) {
    return {
      errCode: 1,
      errMessage: 'CodeValueVI không hợp lệ (2-50 ký tự, có ít nhất một chữ cái)!',
      data: null,
    };
  }
  if (ExtraValue && (isNaN(ExtraValue) || parseFloat(ExtraValue) < 0)) {
    return {
      errCode: 1,
      errMessage: 'ExtraValue phải là số không âm!',
      data: null,
    };
  }
  return null;
};

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
  const nameRegex = /^[A-Za-z0-9\s]{2,50}$/;
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

let loadAllCodesInfo = (page, limit, search, filter, sort) => {
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
      if (sort && !['0'].includes(sort)) {
        resolve({
          errCode: 1,
          errMessage: 'Tham số sort không hợp lệ!',
          data: null,
        });
        return;
      }
      const offset = (page - 1) * limit;
      let where = {};
      let order = [['CodeID', 'ASC']];

      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 50);
        where[Op.or] = [
          { Type: { [Op.like]: `%${searchTerm}%` } },
          { Code: { [Op.like]: `%${searchTerm}%` } },
          { CodeValueVI: { [Op.like]: `%${searchTerm}%` } },
        ];
      }

      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        if (field === 'type') {
          where.Type = value;
        } else {
          resolve({
            errCode: 1,
            errMessage: 'Tham số filter không hợp lệ!',
            data: null,
          });
          return;
        }
      }

      const { count, rows } = await db.AllCodes.findAndCountAll({
        where,
        attributes: ['CodeID', 'Type', 'Code', 'CodeValueVI', 'ExtraValue'],
        limit: parseInt(limit),
        offset,
        order,
        raw: true,
        distinct: true,
      });

      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy AllCodes nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách AllCodes thành công!',
        data: rows,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadAllCodesInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách AllCodes: ${e.message}`,
        data: null,
      });
    }
  });
};

let createCode = (codeInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!codeInfo) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu thông tin mã!',
          data: null,
        });
        return;
      }
      const isValidateInput = validateCodeInput(codeInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const isCodeExist = await db.AllCodes.findOne({
        where: {
          Type: codeInfo.Type.trim(),
          Code: codeInfo.Code.trim(),
        },
        transaction,
      });
      if (isCodeExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Mã với Type và Code này đã tồn tại!',
          data: null,
        });
        return;
      }
      const newCode = await db.AllCodes.create(
        {
          Type: codeInfo.Type.trim(),
          Code: codeInfo.Code.trim(),
          CodeValueVI: codeInfo.CodeValueVI.trim(),
          ExtraValue: codeInfo.ExtraValue ? parseFloat(codeInfo.ExtraValue).toFixed(2) : null,
        },
        { transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Tạo mã thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in createCode: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi tạo mã: ${e.message}`,
        data: null,
      });
    }
  });
};

let changeCodeInfo = (codeInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!codeInfo || !codeInfo.CodeID) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số CodeID!',
          data: null,
        });
        return;
      }
      const isValidateInput = validateCodeInput(codeInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const code = await db.AllCodes.findOne({
        where: { CodeID: codeInfo.CodeID },
        transaction,
      });
      if (!code) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Mã không tồn tại!',
          data: null,
        });
        return;
      }
      let isUpdated = false;
      if (codeInfo.CodeValueVI && codeInfo.CodeValueVI.trim() !== code.CodeValueVI) {
        code.CodeValueVI = codeInfo.CodeValueVI.trim();
        isUpdated = true;
      }
      if (codeInfo.ExtraValue !== undefined) {
        const newExtraValue = codeInfo.ExtraValue ? parseFloat(codeInfo.ExtraValue).toFixed(2) : null;
        if (newExtraValue !== code.ExtraValue) {
          code.ExtraValue = newExtraValue;
          isUpdated = true;
        }
      }

      if (!isUpdated) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Không có thông tin nào để cập nhật!',
          data: null,
        });
        return;
      }
      await db.AllCodes.update(
        {
          CodeValueVI: code.CodeValueVI,
          ExtraValue: code.ExtraValue,
        },
        { where: { CodeID: codeInfo.CodeID }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật thông tin mã thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in changeCodeInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi cập nhật thông tin mã: ${e.message}`,
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
          if (!['VALID', 'INVALID'].includes(value)) {
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
          errCode: 1,
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
      const validServiceStatus = await checkCode('ServiceStatus', newStatus);
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

let checkAccountType = (accountType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'AccountType',
          Code: accountType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra: ' + e.message,
        data: null,
      });
    }
  });
};

let checkAccountStatus = (accountStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'AccountStatus',
          Code: accountStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra: ' + e.message,
        data: null,
      });
    }
  });
};

let checkGender = (gender) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!gender) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'Gender',
          Code: gender,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPetGender = (petGender) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!petGender) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PetGender',
          Code: petGender,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkWorkingStatus = (workingStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!workingStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'WorkingStatus',
          Code: workingStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkProductType = (productType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!productType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'ProductType',
          Code: productType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPetType = (petType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!petType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PetType',
          Code: petType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkDetailStatus = (detailStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!detailStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'DetailStatus',
          Code: detailStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPaymentType = (paymentType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!paymentType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PaymentType',
          Code: paymentType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkPaymentStatus = (paymentStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!paymentStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'PaymentStatus',
          Code: paymentStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkShippingStatus = (shippingStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!shippingStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'ShippingStatus',
          Code: shippingStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkShippingMethod = (shippingMethod) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!shippingMethod) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'ShippingMethod',
          Code: shippingMethod,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkCouponStatus = (couponStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!couponStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'CouponStatus',
          Code: couponStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkDiscountType = (discountType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!discountType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'DiscountType',
          Code: discountType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};
let checkAppointmentStatus = (appointmentStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!appointmentStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'AppointmentStatus',
          Code: appointmentStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkBannerStatus = (bannerStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bannerStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'BannerStatus',
          Code: bannerStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkAppointmentType = (appointmentType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!appointmentType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'AppointmentType',
          Code: appointmentType,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkScheduleStatus = (scheduleStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!scheduleStatus) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: 'ScheduleStatus',
          Code: scheduleStatus,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra mã: ' + e.message,
        data: null,
      });
    }
  });
};

let checkCode = (type, code) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!type || !code) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type: type,
          Code: code,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(`Error in checkCode (${type}, ${code}): `, e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi kiểm tra mã: ${e.message}`,
        data: null,
      });
    }
  });
};


module.exports = {
  getAllCodes,
  loadAllCodesInfo,
  createCode,
  changeCodeInfo,
  checkAccountType,
  checkAccountStatus,
  checkGender,
  checkPetGender,
  checkPetType,
  checkProductType,
  checkWorkingStatus,
  checkDetailStatus,
  checkPaymentType,
  checkPaymentStatus,
  checkShippingStatus,
  checkShippingMethod,
  checkCouponStatus,
  checkDiscountType,
  checkAppointmentStatus,
  checkBannerStatus,
  checkAppointmentType,
  checkScheduleStatus,
  checkCode,
  loadServiceInfo,
  createService,
  changeServiceInfo,
  changeServiceStatus
};
