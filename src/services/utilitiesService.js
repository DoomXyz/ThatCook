import db from '../models/index';
import { Op } from 'sequelize';

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

let checkValidAllCode = (Type, Code) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Type || !Code) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu dữ liệu để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.AllCodes.findOne({
        where: {
          Type,
          Code,
        },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(`Error in checkValidAllCode (${Type}, ${Code}): `, e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi kiểm tra mã: ${e.message}`,
        data: null,
      });
    }
  });
};

let generateID = (prefix, digitCount, tableName, columnName) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!prefix || !digitCount || !tableName || !columnName) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số để tạo ID!',
          data: null,
        });
        return;
      }
      if (isNaN(digitCount) || digitCount < 1 || digitCount > 15) {
        resolve({
          errCode: -1,
          errMessage: 'Số lượng chữ số không hợp lệ (1-15)!',
          data: null,
        });
        return;
      }
      const prefixRegex = /^[A-Za-z0-9]{1,10}$/;
      if (!prefixRegex.test(prefix)) {
        resolve({
          errCode: -1,
          errMessage: 'Prefix không hợp lệ (1-10 ký tự, chỉ chữ và số)!',
          data: null,
        });
        return;
      }
      let id;
      let existingID;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        const timestamp = Date.now().toString();
        const timestampDigits = timestamp.slice(-digitCount).padStart(digitCount, '0');
        id = `${prefix}${timestampDigits}`;
        existingID = await db[tableName].findOne({
          where: { [columnName]: id },
        });
        attempts++;
      } while (existingID && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        resolve({
          errCode: 1,
          errMessage: 'Tạo mã thất bại sau nhiều lần thử!',
          data: null,
        });
        return;
      }

      resolve({
        errCode: 0,
        errMessage: 'Tạo mã thành công!',
        data: id,
      });
    } catch (e) {
      console.log('Error in generateID: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi tạo mã: ${e.message}`,
        data: null,
      });
    }
  });
};

let getAllCodes = (Type) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Type) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let allCodes
      if (Type !== "ALL") {
        allCodes = await db.AllCodes.findAll({
          where: { Type },
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
        if (field === 'Type') {
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
      const { Type, Code, CodeValueVI, ExtraValue } = codeInfo
      const isCodeExist = await db.AllCodes.findOne({
        where: {
          Type,
          Code,
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
      await db.AllCodes.create({
        Type,
        Code,
        CodeValueVI,
        ExtraValue: ExtraValue ? parseFloat(ExtraValue).toFixed(2) : null,
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
      const { CodeID, Type, Code, CodeValueVI, ExtraValue } = codeInfo
      if (!codeInfo || !CodeID) {
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
        where: { CodeID },
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
      if (CodeValueVI && CodeValueVI !== code.CodeValueVI) {
        code.CodeValueVI = CodeValueVI;
        isUpdated = true;
      }
      if (ExtraValue !== undefined) {
        const newExtraValue = ExtraValue ? parseFloat(ExtraValue).toFixed(2) : null;
        if (newExtraValue !== ExtraValue) {
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
        { where: { CodeID: CodeID }, transaction }
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
//thông báo chưa sửa
let checkAccountExist = (AccountID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu mã tài khoản để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.Account.findOne({
        where: { AccountID },
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
let sendNotification = (AccountID, ReceiveNotifID, RoleReceive, NotifType, ExtraValue) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !NotifType || !ExtraValue) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      if (!ReceiveNotifID && !RoleReceive) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const validNotifType = await checkValidAllCode('NotifType', NotifType);
      if (!validNotifType) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Loại thông báo không hợp lệ!',
          data: null,
        });
        return;
      }
      const isSenderExist = await checkAccountExist(AccountID);
      if (!isSenderExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Tài khoản không tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      if (RoleReceive) {
        const validAccountType = await checkValidAllCode('AccountType', RoleReceive);
        if (!validAccountType) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Loại tài khoản không hợp lệ!',
            data: null,
          });
          return;
        }
      } else {
        const isReceiverExist = await checkAccountExist(ReceiveNotifID);
        if (!isReceiverExist) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Tài khoản không tồn tại trong hệ thống!',
            data: null,
          });
          return;
        }
      }
      const account = await db.Account.findOne({
        attributes: ['AccountID', 'UserName'],
        where: { AccountID },
        raw: true,
        transaction,
      });
      let NotifDescription = 'UIA';
      switch (NotifType) {
        case 'ORDER_COMPLETE':
          NotifDescription = `Đơn hàng <strong style="color:#e74c3c;">${ExtraValue}</strong> đã được khách hàng <strong style="color:#e74c3c;">${account.UserName}</strong> đặt và thanh toán thành công!`;
          break;
        case 'ORDER_CONFIRM':
          NotifDescription = `Khách hàng <strong style="color:#e74c3c;">${account.UserName}</strong> đã đặt đơn hàng <strong style="color:#e74c3c;">${ExtraValue}</strong> và đang chờ xác nhận.`;
          break;
        case 'ORDER_SUCCESS':
          NotifDescription = `Bạn đã đặt đơn hàng <strong style="color:#e74c3c;">${ExtraValue}</strong> thành công. Cảm ơn bạn đã mua sắm!`;
          break;
        case 'ORDER_CANCEL':
          NotifDescription = `Đơn hàng <strong style="color:#e74c3c;">${ExtraValue}</strong> đã bị hủy bởi <strong style="color:#e74c3c;">${account.UserName}</strong>.`;
          break;
        case 'APM_SUCCESS':
          NotifDescription = `Bạn đã đặt lịch khám <strong style="color:#e74c3c;">${ExtraValue}</strong> thành công! Chúng tôi sẽ sớm xác nhận. Cảm ơn bạn! ❤️`;
          break;
        case 'APM_WAIT':
          NotifDescription = `Khách hàng <strong style="color:#e74c3c;">${account.UserName}</strong> đã đặt lịch khám <strong style="color:#e74c3c;">${ExtraValue}</strong> và đang chờ bạn xác nhận.`;
          break;
        case 'APM_CONFIRM':
          NotifDescription = `Lịch khám <strong style="color:#e74c3c;">${ExtraValue}</strong> đã được bác sĩ <strong style="color:#e74c3c;">${account.UserName}</strong> xác nhận.`;
          break;
        case 'APM_REFUSE':
          NotifDescription = `Lịch khám <strong style="color:#e74c3c;">${ExtraValue}</strong> đã bị bác sĩ <strong style="color:#e74c3c;">${account.UserName}</strong> từ chối.`;
          break;
        case 'APM_COMPLETE':
          NotifDescription = `Lịch khám <strong style="color:#27ae60;">${ExtraValue}</strong> đã được hoàn thành.`;
          break;
        case 'APM_CANCEL':
          NotifDescription = `Lịch khám <strong style="color:#e74c3c;">${ExtraValue}</strong> đã bị hủy bởi <strong style="color:#e74c3c;">${account.UserName}</strong>.`;
          break;
        default:
          NotifDescription = 'UIA';
      }
      const CreatedAt = new Date();
      await db.Notification.create(
        {
          NotifDescription,
          CreatedAt,
          ExtraValue,
          ReceiveNotifID,
          AccountID,
          RoleReceive,
          NotifType,
          NotifStatus: 'UNREAD',
        },
        { transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Gửi thông báo thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in sendNotification: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi gửi thông báo: ${e.message}`,
        data: null,
      });
    }
  });
};
let getUserNotifications = (receiveId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!receiveId) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu ReceiveNotifID!',
          data: null,
        });
        return;
      }

      const user = await db.Account.findOne({
        where: { AccountID: receiveId },
        attributes: ['AccountType'],
        raw: true,
      });

      if (!user) {
        resolve({
          errCode: 1,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }

      const userRole = (user.AccountType || '').trim().toUpperCase();

      const notifications = await db.Notification.findAll({
        where: {
          [Op.or]: [
            { ReceiveNotifID: receiveId },                                    // 1. Thông báo gửi riêng cho bạn
            {
              [Op.and]: [
                { RoleReceive: userRole },    // 2. Thông báo gửi theo role (ví dụ: 'O' = chủ shop)
                { ReceiveNotifID: null }      // và không gửi riêng cho ai cả → gửi cho cả nhóm
              ]
            },
          ],
        },
        attributes: [
          'NotifID',
          'NotifDescription',
          'CreatedAt',
          'NotifType',
          'NotifStatus',
          'ExtraValue'
        ],
        order: [['CreatedAt', 'DESC']],
        limit: 30,
        raw: true,
      });

      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách thông báo thành công!',
        data: notifications,
      });
    } catch (e) {
      console.log('Error in getUserNotifications:', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông báo: ' + e.message,
        data: null,
      });
    }
  });
};
let NotifiStatusChange = async (notificationId, status = 'READ') => {
  try {
    if (!notificationId) {
      return { errCode: -1, errMessage: 'Thiếu notificationId' };
    }

    await db.Notification.update(
      { NotifStatus: status },
      { where: { NotifID: notificationId } }
    );

    return { errCode: 0, errMessage: 'Cập nhật thành công' };
  } catch (e) {
    console.log('Error NotifiStatusChange:', e);
    return { errCode: 3, errMessage: 'Lỗi server' };
  }
};
let createRoom = async (type, AccountID) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!type || AccountID) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham so16!',
          data: null,
        });
        return;
      }

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
}
module.exports = {
  getAllCodes,
  generateID,
  loadAllCodesInfo,
  createCode,
  changeCodeInfo,
  checkValidAllCode,
  sendNotification,
  getUserNotifications,
  NotifiStatusChange,
  createRoom,
};