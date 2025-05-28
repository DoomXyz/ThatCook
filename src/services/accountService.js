import db from '../models/index';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import { checkValidAllCode, generateID } from './utilitiesService';
import { verifyJWT } from '../middleware/jwtController';
//bcrypt
let saltRounds = 10;
let hashPassword = (userPassword) => {
  if (!userPassword || typeof userPassword !== 'string') {
    return { errCode: -1, errMessage: 'Mật khẩu không hợp lệ!', data: null, };
  }
  try {
    let salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(userPassword, salt);
  } catch (e) {
    console.log(e);
    return { errCode: 3, errMessage: 'Lỗi khi mã hóa mật khẩu: ' + e.message, data: null, };
  }
};
let firstNavigate = (accountType) => {
  if (!accountType) {
    return '/login';
  }
  switch (accountType) {
    case 'A':
      return '/user/admin';
    case 'O':
      return '/user/owner';
    case 'V':
      return '/user/veterinarian';
    case 'C':
      return '/home';
    default:
      return '/login';
  }
};
let validateAccountInput = async (userInfo) => {
  if (!userInfo || Object.keys(userInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin người dùng!',
      data: null,
    };
  }
  const { accountname, email, password, username, phone, address, gender, accounttype } = userInfo;
  if (!accountname) {
    return {
      errCode: -1,
      errMessage: 'Tên tài khoản không được để trống!',
      data: null,
    };
  } else {
    const accountName = accountname.trim();
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    if (!accountNameRegex.test(accountName)) {
      return {
        errCode: 1,
        errMessage: 'Tên tài khoản sai định dạng!',
        data: null,
      };
    }
  }
  if (!email) {
    return {
      errCode: -1,
      errMessage: 'Email không được để trống!',
      data: null,
    };
  } else {
    const emailTrimmed = email.trim();
    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return {
        errCode: 1,
        errMessage: 'Email sai định dạng!',
        data: null,
      };
    }
  }
  if (!password) {
    return {
      errCode: -1,
      errMessage: 'Mật khẩu không được để trống!',
      data: null,
    };
  } else {
    const passwordTrimmed = password.trim();
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;  //cần ít nhất 8 ký tự
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/; //cần ít nhất 8 ký tự, bao gồm chữ cái và số để tăng tính bảo mật
    if (!passwordRegex.test(passwordTrimmed)) {
      return {
        errCode: 1,
        errMessage: 'Mật khẩu không hợp lệ! (Cần ít nhất 8 ký tự)',
        data: null,
      };
    }
  }
  if (!username) {
    return {
      errCode: -1,
      errMessage: 'Tên người dùng không được để trống!',
      data: null,
    };
  } else {
    const userName = username.trim();
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!userNameRegex.test(userName)) {
      return {
        errCode: 1,
        errMessage: 'Tên người dùng không hợp lệ!',
        data: null,
      };
    }
  }
  if (!phone) {
    return {
      errCode: -1,
      errMessage: 'Số điện thoại không được để trống!',
      data: null,
    };
  } else {
    const phoneNumber = phone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại không hợp lệ!',
        data: null,
      };
    }
  }
  if (!address || address.trim().length === 0 || address.trim().length > 100) {
    return {
      errCode: -1,
      errMessage: 'Địa chỉ không hợp lệ hoặc vượt quá 100 ký tự!',
      data: null,
    };
  }
  if (!gender) {
    return {
      errCode: -1,
      errMessage: 'Giới tính không được để trống!',
      data: null,
    };
  } else {
    const validGender = await checkValidAllCode('Gender', gender);
    if (!validGender) {
      return {
        errCode: 1,
        errMessage: 'Giới tính không hợp lệ!',
        data: null,
      };
    }
  }
  if (!accounttype) {
    return {
      errCode: -1,
      errMessage: 'Quyền hạn không được để trống!',
      data: null,
    };
  } else {
    const validAccountType = await checkValidAllCode('AccountType', accounttype);
    if (!validAccountType) {
      return {
        errCode: 1,
        errMessage: 'Quyền hạn không hợp lệ!',
        data: null,
      };
    }
  }
  return null;
};
let validateVeterinarianInput = async (veterinarianInfo) => {
  if (!veterinarianInfo || Object.keys(veterinarianInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin bác sĩ thú y!',
      data: null,
    };
  }
  const { bio, specialization, workingstatus } = veterinarianInfo;
  if (bio) {
    if (bio.trim().length > 65535) {
      return {
        errCode: 1,
        errMessage: 'Bio vượt quá độ dài tối đa (65535 ký tự)!',
        data: null,
      };
    }
  }
  if (specialization) {
    const specializationRegex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;
    if (!specializationRegex.test(specialization.trim())) {
      return {
        errCode: 1,
        errMessage: 'Chuyên khoa không hợp lệ hoặc vượt quá 50 ký tự!',
        data: null,
      };
    }
  }
  if (!workingstatus) {
    return {
      errCode: -1,
      errMessage: 'Trạng thái làm việc không được để trống!',
      data: null,
    };
  } else {
    const validStatus = await checkValidAllCode('WorkingStatus', workingstatus);
    if (!validStatus) {
      return {
        errCode: 1,
        errMessage: 'Trạng thái làm việc không hợp lệ!',
        data: null,
      };
    }
  }
  return null;
}
let validateAccountEdit = async (userInfo) => {
  if (!userInfo || Object.keys(userInfo).length === 0) {
    return {
      errCode: -1,
      errMessage: 'Thiếu thông tin chỉnh sửa!',
      data: null,
    };
  }
  const { accountname, username, phone, address, gender, accounttype } = userInfo;
  if (accountname) {
    const accountName = accountname.trim();
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    if (!accountNameRegex.test(accountName)) {
      return {
        errCode: 1,
        errMessage: 'Tên tài khoản sai định dạng!',
        data: null,
      };
    }
  }
  if (username) {
    const userName = username.trim();
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!userNameRegex.test(userName)) {
      return {
        errCode: 1,
        errMessage: 'Tên người dùng không hợp lệ!',
        data: null,
      };
    }
  }
  if (phone) {
    const phoneNumber = phone.trim();
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại không hợp lệ!',
        data: null,
      };
    }
  }
  if (address) {
    if (address.trim().length === 0 || address.trim().length > 100) {
      return {
        errCode: 1,
        errMessage: 'Địa chỉ không hợp lệ hoặc vượt quá 100 ký tự!',
        data: null,
      };
    }
  }
  if (gender) {
    const validGender = await checkValidAllCode('Gender', gender);
    if (!validGender) {
      return {
        errCode: 1,
        errMessage: 'Giới tính không hợp lệ!',
        data: null,
      };
    }
  }
  if (accounttype) {
    const validAccountType = await checkValidAllCode('AccountType', accounttype);
    if (!validAccountType) {
      return {
        errCode: 1,
        errMessage: 'Quyền hạn không hợp lệ!',
        data: null,
      };
    }
  }
  return null;
};
let checkEmailExist = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userEmail) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu email để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.Account.findOne({
        where: { Email: userEmail },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra email: ' + e.message,
        data: null,
      });
    }
  });
};
let checkAccountNameExist = (userAccountName) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userAccountName) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tên tài khoản để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.Account.findOne({
        where: { AccountName: userAccountName },
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
let checkPhoneExist = (userPhone) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userPhone) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu số điện thoại để kiểm tra!',
          data: null,
        });
        return;
      }
      let exist = await db.Account.findOne({
        where: { Phone: userPhone },
      });
      resolve(exist ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra số điện thoại: ' + e.message,
        data: null,
      });
    }
  });
};
let sendVerificationEmail = async (email, code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã xác nhận đặt lại mật khẩu',
      text: `Mã xác nhận của bạn là: ${code}. Mã này có hiệu lực trong 30 phút.`,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log('Error in sendVerificationEmail: ', e);
    return false;
  }
};
//kiểm tra tính hợp lệ của token
let verifyToken = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token) {
        resolve({
          errCode: -1,
          errMessage: 'Không có token!',
          data: null,
        });
        return;
      }
      const isBlacklisted = await db.BlacklistToken.findOne({
        where: { Token: token },
      });
      if (isBlacklisted) {
        resolve({
          errCode: 2,
          errMessage: 'Token đã bị vô hiệu hóa!',
          data: null,
        });
        return;
      }
      const data = verifyJWT(token);
      if (data) {
        resolve({
          errCode: 0,
          errMessage: 'Token hợp lệ!',
          data: data,
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: 'Token không hợp lệ hoặc đã hết hạn!',
          data: null,
        });
      }
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi xác minh token: ' + e.message,
        data: null,
      });
    }
  });
};
//đăng ký
let userRegister = (userInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!userInfo) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu thông tin người dùng!',
          data: null,
        });
        return;
      }
      const isValidateInput = await validateAccountInput(userInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const isAccountNameExist = await checkAccountNameExist(userInfo.accountname);
      if (isAccountNameExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Tên tài khoản đã tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const isEmailExist = await checkEmailExist(userInfo.email);
      if (isEmailExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Email đã tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const isPhoneExist = await checkPhoneExist(userInfo.phone);
      if (isPhoneExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Số điện thoại đã tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const accountIDResult = await generateID(userInfo.accounttype || 'C', 9, 'Account', 'AccountID');
      if (accountIDResult.errCode !== 0) {
        await transaction.rollback();
        resolve(accountIDResult);
        return;
      }
      const accountID = accountIDResult.data;

      const hashedPassword = hashPassword(userInfo.password);
      if (typeof hashedPassword === 'object' && hashedPassword.errCode) {
        await transaction.rollback();
        resolve(hashedPassword);
        return;
      }
      const createdAt = new Date();
      await db.Account.create({
        AccountID: accountID,
        AccountName: userInfo.accountname,
        Email: userInfo.email,
        Password: hashedPassword,
        UserName: userInfo.username,
        UserImage: "https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg",
        Phone: userInfo.phone,
        Address: userInfo.address,
        Gender: userInfo.gender,
        LoginAttempt: 0,
        LockUntil: null,
        CreatedAt: createdAt,
        AccountStatus: 'ACT',
        AccountType: userInfo.accounttype || 'C',
      }, { transaction });
      if (userInfo.accounttype === 'V' && userInfo.veterinarianInfo) {
        const { bio, specialization, workingstatus, selectedServicesList } = userInfo.veterinarianInfo;
        const veterinarianInfo = {
          bio,
          specialization,
          workingstatus
        }
        const isValidateInput = await validateVeterinarianInput(veterinarianInfo);
        if (isValidateInput) {
          await transaction.rollback();
          resolve(isValidateInput);
          return;
        }
        if (!selectedServicesList || !Array.isArray(selectedServicesList) || selectedServicesList.length === 0) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Vui lòng chọn ít nhất một dịch vụ cho bác sĩ!',
            data: null,
          });
          return;
        }
        const validServices = await db.Service.findAll({
          where: {
            ServiceID: selectedServicesList,
            ServiceStatus: 'VALID'
          },
          attributes: ['ServiceID'],
          transaction,
        });
        if (validServices.length !== selectedServicesList.length) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Một hoặc nhiều dịch vụ không hợp lệ!',
            data: null,
          });
          return;
        }
        await db.VeterinarianInfo.create({
          AccountID: accountID,
          Bio: bio || null,
          Specialization: specialization || null,
          WorkingStatus: workingstatus,
        }, { transaction });
        for (const serviceid of selectedServicesList) {
          await db.VeterinarianService.create({
            VeterinarianID: accountID,
            ServiceID: serviceid,
          }, { transaction });
        }
      }
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Đăng ký người dùng thành công!',
        data: { AccountID: accountID },
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi đăng ký: ' + e.message,
        data: null,
      });
    }
  });
};
//đăng nhập
let userLogin = (userInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!userInfo) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu thông tin đăng nhập!',
          data: null,
        });
        return;
      }
      const { accountname, password } = userInfo;
      if (!accountname || !password) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Tên tài khoản hoặc mật khẩu không được để trống!',
          data: null,
        });
        return;
      }
      const existedAccount = await db.Account.findOne({
        attributes: ['AccountID', 'AccountName', 'Password', 'UserName', 'UserImage', 'LoginAttempt', 'LockUntil', 'AccountStatus', 'AccountType'],
        where: { AccountName: accountname },
        raw: true,
        transaction,
      });
      if (!existedAccount) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }
      const currentTime = new Date();
      if (existedAccount.LockUntil && new Date(existedAccount.LockUntil) > currentTime) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản đang bị khóa. Vui lòng thử lại sau!',
          data: null,
        });
        return;
      }
      const isPasswordValid = bcrypt.compareSync(password, existedAccount.Password);
      if (isPasswordValid && existedAccount.AccountStatus === 'ACT') {
        delete existedAccount.Password;
        await db.Account.update(
          { LoginAttempt: 0, LockUntil: null },
          { where: { AccountName: accountname }, transaction }
        );
        await transaction.commit();
        resolve({
          errCode: 0,
          errMessage: 'Đăng nhập thành công!',
          data: {
            ...existedAccount,
            navigate: firstNavigate(existedAccount.AccountType),
          },
        });
      } else {
        let newLoginAttempts = (existedAccount.LoginAttempt || 0) + 1;
        let lockUntilTime = null;
        if (newLoginAttempts >= 5) {
          lockUntilTime = new Date(currentTime.getTime() + 5 * 60 * 1000);
          newLoginAttempts = 0;
        }
        await db.Account.update(
          { LoginAttempt: newLoginAttempts, LockUntil: lockUntilTime },
          { where: { AccountName: accountname }, transaction }
        );
        await transaction.commit();
        resolve({
          errCode: 2,
          errMessage:
            newLoginAttempts === 0
              ? 'Đã vượt quá số lần đăng nhập. Tài khoản bị khóa 5 phút!'
              : 'Sai mật khẩu!',
          data: null,
        });
      }
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi đăng nhập: ' + e.message,
        data: null,
      });
    }
  });
};
//đăng xuất
let userLogout = (token, decoded) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!token) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Không có token để đăng xuất!',
          data: null,
        });
        return;
      }
      await db.BlacklistToken.destroy({
        where: {
          ExpiredAt: {
            [Op.lt]: new Date(),
          },
        },
        transaction,
      });
      const expiredAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.BlacklistToken.create({
        Token: token,
        CreatedAt: new Date(),
        ExpiredAt: expiredAt,
      }, { transaction });
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Đăng xuất thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi đăng xuất: ' + e.message,
        data: null,
      });
    }
  });
};
//lấy thông tin tài khoản = accountid; lấy hết danh sách = ALL
let getAccountInfo = (accountid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let userData = null;
      if (accountid === 'ALL') {
        userData = await db.Account.findAll({
          attributes: {
            exclude: ['Password', 'LoginAttempt'],
          },
          raw: true,
        });
        if (!userData || userData.length === 0) {
          resolve({
            errCode: 1,
            errMessage: 'Không tìm thấy tài khoản nào!',
            data: [],
          });
          return;
        }
      } else {
        userData = await db.Account.findOne({
          where: { AccountID: accountid },
          attributes: {
            exclude: ['Password', 'LoginAttempt'],
          },
          raw: true,
        });
        if (!userData) {
          resolve({
            errCode: 2,
            errMessage: 'Tài khoản không tồn tại!',
            data: null,
          });
          return;
        }
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin tài khoản thành công!',
        data: userData,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};
//load danh sách tài khoản ra bảng theo điều kiện
let loadAccountInfo = (page, limit, search, filter, sort) => {
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
      if (sort && !['0', '1', '2', '3', '4'].includes(sort)) {
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
      // Tìm kiếm
      if (search && search.trim()) {
        const searchTerm = search.trim().substring(0, 100);
        where[Op.or] = [
          { Email: { [Op.like]: `%${searchTerm}%` } },
          { UserName: { [Op.like]: `%${searchTerm}%` } },
          { Phone: { [Op.like]: `%${searchTerm}%` } },
        ];
      }
      // Lọc
      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        const fieldMap = {
          accounttype: 'AccountType',
          gender: 'Gender',
          accountstatus: 'AccountStatus',
        };
        if (!fieldMap[field]) {
          resolve({
            errCode: 1,
            errMessage: 'Tham số filter không hợp lệ!',
            data: null,
          });
          return;
        }
        const validCode = await checkValidAllCode(fieldMap[field], value);
        if (!validCode) {
          resolve({
            errCode: 1,
            errMessage: `${fieldMap[field]} không hợp lệ!`,
            data: null,
          });
          return;
        }
        where[fieldMap[field]] = value;
      }
      // Sắp xếp
      switch (sort) {
        case '1':
          order.push(['UserName', 'ASC']);
          break;
        case '2':
          order.push(['UserName', 'DESC']);
          break;
        case '4':
          order.push(['CreatedAt', 'DESC']);
          break;
        case '5':
          order.push(['CreatedAt', 'ASC']);
          break;
        default:
          order.push(['AccountID', 'DESC']);
          break;
      }
      const { count, rows } = await db.Account.findAndCountAll({
        where,
        attributes: { exclude: ['Password', 'LoginAttempt'] },
        limit,
        offset,
        order,
        raw: true,
      });
      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy tài khoản nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách tài khoản thành công!',
        data: rows,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadAccountInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy danh sách: ' + e.message,
        data: null,
      });
    }
  });
};
//chỉnh sửa thông tin người dùng cơ bản
let changeAccountInfo = (userInfo) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!userInfo || !userInfo.accountid) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const isValidateInput = await validateAccountEdit(userInfo);
      if (isValidateInput) {
        await transaction.rollback();
        resolve(isValidateInput);
        return;
      }
      const account = await db.Account.findOne({
        where: { AccountID: userInfo.accountid },
        transaction,
      });
      if (!account) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }
      if (userInfo.accountname && userInfo.accountname !== account.AccountName) {
        const isAccountNameExist = await checkAccountNameExist(userInfo.accountname);
        if (typeof isAccountNameExist === 'object' && isAccountNameExist.errCode !== 0) {
          resolve(isAccountNameExist);
          return;
        }
        if (isAccountNameExist) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Tên tài khoản đã tồn tại trong hệ thống!',
            data: null,
          });
          return;
        }
      }
      if (userInfo.phone && userInfo.phone !== account.Phone) {
        const isPhoneExist = await checkPhoneExist(userInfo.phone);
        if (typeof isPhoneExist === 'object' && isPhoneExist.errCode !== 0) {
          resolve(isPhoneExist);
          return;
        }
        if (isPhoneExist) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Số điện thoại đã tồn tại trong hệ thống!',
            data: null,
          });
          return;
        }
      }
      let isUpdated = false;
      if (userInfo.accountname) {
        account.AccountName = userInfo.accountname;
        isUpdated = true;
      }
      if (userInfo.username) {
        account.UserName = userInfo.username;
        isUpdated = true;
      }
      if (userInfo.gender) {
        account.Gender = userInfo.gender;
        isUpdated = true;
      }
      if (userInfo.phone) {
        account.Phone = userInfo.phone;
        isUpdated = true;
      }
      if (userInfo.address) {
        account.Address = userInfo.address;
        isUpdated = true;
      }
      if ('userimage' in userInfo) {
        if (userInfo.userimage === null) {
          account.UserImage = null;
          isUpdated = true;
        } else if (!userInfo.userimage?.secure_url || userInfo.userimage.secure_url.length > 2048) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'URL ảnh đại diện không hợp lệ hoặc vượt quá 2048 ký tự!',
            data: null,
          });
          return;
        } else {
          account.UserImage = userInfo.userimage.secure_url;
          isUpdated = true;
        }
      }
      if (userInfo.accounttype) {
        account.AccountType = userInfo.accounttype;
        isUpdated = true;
      }
      if (userInfo.accounttype === 'V' && userInfo.veterinarianInfo) {
        const { bio, specialization, workingstatus, selectedServicesList } = userInfo.veterinarianInfo;
        const veterinarianInfo = {
          bio,
          specialization,
          workingstatus
        }
        const isValidateInput = await validateVeterinarianInput(veterinarianInfo);
        if (isValidateInput) {
          await transaction.rollback();
          resolve(isValidateInput);
          return;
        }
        if (!selectedServicesList || !Array.isArray(selectedServicesList) || selectedServicesList.length === 0) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Vui lòng chọn ít nhất một dịch vụ cho bác sĩ!',
            data: null,
          });
          return;
        }
        const validServices = await db.Service.findAll({
          where: {
            ServiceID: selectedServicesList,
          },
          attributes: ['ServiceID'],
          transaction,
        });
        if (validServices.length !== selectedServicesList.length) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'Một hoặc nhiều dịch vụ không hợp lệ!',
            data: null,
          });
          return;
        }
        const vetInfo = await db.VeterinarianInfo.findOne({
          where: { AccountID: userInfo.accountid },
          transaction,
        });
        if (vetInfo) {
          await db.VeterinarianInfo.update(
            {
              Bio: bio?.trim() || vetInfo.Bio,
              Specialization: specialization?.trim() || vetInfo.Specialization,
              WorkingStatus: workingstatus.trim(),
            },
            { where: { AccountID: userInfo.accountid }, transaction }
          );
        } else {
          await db.VeterinarianInfo.create({
            AccountID: userInfo.accountid,
            Bio: bio?.trim() || null,
            Specialization: specialization?.trim() || null,
            WorkingStatus: workingstatus.trim(),
          }, { transaction });
        }
        await db.VeterinarianService.destroy({
          where: { VeterinarianID: userInfo.accountid },
          transaction,
        });
        for (const serviceid of selectedServicesList) {
          await db.VeterinarianService.create({
            VeterinarianID: userInfo.accountid,
            ServiceID: serviceid,
          }, { transaction });
        }
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
      await db.Account.update(
        {
          AccountName: account.AccountName,
          UserName: account.UserName,
          Gender: account.Gender,
          Phone: account.Phone,
          Address: account.Address,
          UserImage: account.UserImage,
          AccountType: account.AccountType,
        },
        { where: { AccountID: userInfo.accountid }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật thông tin tài khoản thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi cập nhật thông tin: ' + e.message,
        data: null,
      });
    }
  });
};
//gửi mã xác minh quên mật khẩu
let sendForgotToken = (email) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!email) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        await transaction.rollback();
        resolve({
          errCode: 3,
          errMessage: 'Cấu hình email không hợp lệ!',
          data: null,
        });
        return;
      }
      const emailTrimmed = email.trim();
      const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Email không hợp lệ!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { Email: emailTrimmed },
        attributes: ['AccountID'],
        raw: true,
        transaction,
      });
      if (!account) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Email không tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const recentTokens = await db.BlacklistToken.count({
        where: { ExtraValue: account.AccountID, CreatedAt: { [Op.gt]: new Date(Date.now() - 60 * 1000) } },
      });
      if (recentTokens >= 5) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Vượt quá số lần gửi mã xác nhận!',
          data: null
        });
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const currentTime = new Date();
      const expiredAt = new Date(currentTime.getTime() + 30 * 60 * 1000);
      await db.BlacklistToken.destroy({
        where: {
          ExtraValue: account.AccountID,
          ExpiredAt: { [Op.lt]: currentTime },
        },
        transaction,
      });
      await db.BlacklistToken.create({
        Token: code,
        ExtraValue: account.AccountID,
        CreatedAt: currentTime,
        ExpiredAt: expiredAt,
      }, { transaction });
      const emailSent = await sendVerificationEmail(emailTrimmed, code);
      if (!emailSent) {
        await transaction.rollback();
        resolve({
          errCode: 3,
          errMessage: 'Lỗi khi gửi email xác nhận!',
          data: null,
        });
        return;
      }
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Mã xác nhận đã được gửi!',
        data: account.AccountID,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in sendForgotToken: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi xử lý email: ' + e.message,
        data: null,
      });
    }
  });
};
//xác nhận mã xác minh
let verifyForgotToken = (accountid, token) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!accountid || !token) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const currentTime = new Date();
      const tokenRecord = await db.BlacklistToken.findOne({
        where: {
          Token: token,
          ExtraValue: accountid,
        },
        transaction,
      });
      if (!tokenRecord) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Mã xác nhận không hợp lệ!',
          data: null,
        });
        return;
      }
      if (tokenRecord.ExpiredAt < currentTime) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Mã xác nhận đã hết hạn!',
          data: null,
        });
        return;
      }
      await db.BlacklistToken.destroy({
        where: { ExtraValue: accountid },
        transaction,
      });
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Xác nhận mã thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in verifyForgotToken: ', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi xác minh mã: ' + e.message,
        data: null,
      });
    }
  });
};
//thay đổi mật khẩu
let changePassword = (accountid, password, newpassword) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!accountid || !newpassword) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { AccountID: accountid },
        transaction,
      });
      if (!account) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }
      if (password !== 'forgot_password') {
        const isPasswordValid = bcrypt.compareSync(password, account.Password);
        if (!isPasswordValid) {
          await transaction.rollback();
          resolve({
            errCode: 2,
            errMessage: 'Mật khẩu cũ không đúng!',
            data: null,
          });
          return;
        }
      }
      const newPasswordTrimmed = newpassword.trim();
      const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(newPasswordTrimmed)) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Mật khẩu mới không hợp lệ! (Cần ít nhất 8 ký tự)',
          data: null,
        });
        return;
      }
      if (password !== 'forgot_password' && bcrypt.compareSync(newpassword, account.Password)) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Mật khẩu mới không được trùng với mật khẩu cũ!',
          data: null,
        });
        return;
      }
      const hashedPassword = await hashPassword(newPasswordTrimmed);
      if (typeof hashedPassword === 'object' && hashedPassword.errCode) {
        await transaction.rollback();
        resolve(hashedPassword);
        return;
      }
      await db.Account.update(
        { Password: hashedPassword },
        { where: { AccountID: accountid }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Đổi mật khẩu thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi đổi mật khẩu: ' + e.message,
        data: null,
      });
    }
  });
};
//chuyển trạng thái của tài khoản
let changeAccountStatus = (accountid, accountstatus) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!accountid || !accountstatus) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const validAccountStatus = await checkValidAllCode('AccountStatus', accountstatus);
      if (!validAccountStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái tài khoản không hợp lệ!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { AccountID: accountid },
        transaction,
      });
      if (!account) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản không tồn tại!',
          data: null,
        });
        return;
      }
      if (account.AccountStatus === accountstatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      await db.Account.update(
        { AccountStatus: accountstatus },
        { where: { AccountID: accountid }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Thay đổi trạng thái tài khoản thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi thay đổi trạng thái: ' + e.message,
        data: null,
      });
    }
  });
};
//lấy thông tin thêm của tài khoản bác sĩ thú y
let getVeterinarianInfo = (accountid) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!accountid) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { AccountID: accountid, AccountType: 'V' },
        attributes: ['AccountID'],
      });
      if (!account) {
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản không phải bác sĩ thú y!',
          data: null,
        });
        return;
      }
      const vetInfo = await db.VeterinarianInfo.findOne({
        where: { AccountID: accountid },
        attributes: ['Bio', 'Specialization', 'WorkingStatus'],
        raw: true,
      });

      if (!vetInfo) {
        return resolve({
          errCode: 2,
          errMessage: 'Không tìm thấy thông tin bác sĩ thú y!',
          data: null,
        });
      }
      const servicesRaw = await db.VeterinarianService.findAll({
        where: { VeterinarianID: accountid },
        attributes: ['ServiceID'],
        include: [
          {
            model: db.Service,
            attributes: ['ServiceID', 'ServiceName'],
          },
        ],
        raw: true,
        nest: true,
      });
      const formattedData = {
        Bio: vetInfo.Bio || null,
        Specialization: vetInfo.Specialization || null,
        WorkingStatus: vetInfo.WorkingStatus || null,
        services: servicesRaw.map((vs) => ({
          ServiceID: vs.ServiceID,
          ServiceName: vs.Service?.ServiceName || null,
        })),
      };
      resolve({
        errCode: 0,
        errMessage: 'Lấy thông tin bác sĩ thú y thành công!',
        data: formattedData,
      });
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
};
let loadVeterinarianInfo = (page, limit, search, filter, sort) => {
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
      if (sort && !['0', '1', '2', '3'].includes(sort)) {
        resolve({
          errCode: 1,
          errMessage: 'Tham số sort không hợp lệ!',
          data: null,
        });
        return;
      }
      const offset = (page - 1) * limit;
      let accountWhere = { AccountType: 'V' };
      let order = [];
      let include = [
        {
          model: db.VeterinarianInfo,
          as: 'VeterinarianInfo',
          attributes: ['Bio', 'Specialization', 'WorkingStatus'],
          required: true,
        },
      ];

      if (search?.trim()) {
        const searchTerm = search.trim().substring(0, 50);
        accountWhere.UserName = { [Op.like]: `%${searchTerm}%` };
      }
      if (filter !== 'ALL') {
        const [field, value] = filter.split('-');
        if (field === 'service') {
          const validService = await db.Service.findOne({
            where: { ServiceID: value },
          });
          if (!validService) {
            resolve({
              errCode: 1,
              errMessage: 'Dịch vụ không tồn tại!',
              data: null,
            });
            return;
          }
          include.push({
            model: db.VeterinarianService,
            as: 'VeterinarianServices',
            attributes: [],
            where: { ServiceID: value },
            required: true,
          });
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
        case '1': // Số lượt đặt lịch
          order.push([
            db.sequelize.literal(
              '(SELECT COUNT(*) FROM Appointment WHERE Appointment.VeterinarianID = Account.AccountID)'
            ),
            'DESC'
          ]);
          break;
        case '2': // Tên A-Z
          order.push(['UserName', 'ASC']);
          break;
        case '3': // Tên Z-A
          order.push(['UserName', 'DESC']);
          break;
        default: // Mặc định
          order.push(['AccountID', 'ASC']);
          break;
      }
      const { count, rows } = await db.Account.findAndCountAll({
        where: accountWhere,
        attributes: [
          'AccountID',
          'UserName',
          'UserImage',
          [
            db.sequelize.literal(
              '(SELECT COUNT(*) FROM Appointment WHERE Appointment.VeterinarianID = Account.AccountID)'
            ),
            'BookingCount'
          ],
        ],
        include,
        limit: parseInt(limit),
        offset,
        order,
        raw: true,
        distinct: 'Account.AccountID',
        nest: true,
      });
      if (!rows || rows.length === 0) {
        resolve({
          errCode: 0,
          errMessage: 'Không tìm thấy bác sĩ thú y nào!',
          data: [],
          totalItems: 0,
        });
        return;
      }
      const data = rows.map(row => ({
        AccountID: row.AccountID,
        UserName: row.UserName,
        UserImage: row.UserImage,
        Bio: row.VeterinarianInfo.Bio,
        WorkingStatus: row.VeterinarianInfo.WorkingStatus,
        Specialization: row.VeterinarianInfo.Specialization,
        BookingCount: parseInt(row.BookingCount) || 0,
      }));
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách bác sĩ thú y thành công!',
        data,
        totalItems: count,
      });
    } catch (e) {
      console.log('Error in loadVeterinarianInfo: ', e);
      resolve({
        errCode: 3,
        errMessage: `Lỗi khi lấy danh sách bác sĩ thú y: ${e.message}`,
        data: null,
      });
    }
  });
};
let changeWorkingStatus = (accountid, workingstatus) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!accountid || !workingstatus) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const validWorkingStatus = await checkValidAllCode('WorkingStatus', workingstatus);
      if (!validWorkingStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái làm việc không hợp lệ!',
          data: null,
        });
        return;
      }
      const account = await db.VeterinarianInfo.findOne({
        where: { AccountID: accountid },
        transaction,
      });
      if (!account) {
        await transaction.rollback();
        resolve({
          errCode: 2,
          errMessage: 'Tài khoản bác sĩ không tồn tại!',
          data: null,
        });
        return;
      }
      if (account.WorkingStatus === workingstatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      await db.VeterinarianInfo.update(
        { WorkingStatus: workingstatus },
        { where: { AccountID: accountid }, transaction }
      );
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Thay đổi trạng thái tài khoản thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi thay đổi trạng thái: ' + e.message,
        data: null,
      });
    }
  });
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  verifyToken,
  getAccountInfo,
  loadAccountInfo,
  changeAccountInfo,
  changeAccountStatus,
  changePassword,
  sendForgotToken,
  verifyForgotToken,
  getVeterinarianInfo,
  loadVeterinarianInfo,
  changeWorkingStatus,
};
