import db from '../models/index';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import { checkValidAllCode } from './utilitiesService';
import { verifyJWT } from '../middleware/jwtController';
import { ethers } from 'ethers';
const keys = require('../../keys.json');
//bcrypt
let saltRounds = 10;
let hashPassword = (Password) => {
  if (!Password || typeof Password !== 'string') {
    return { errCode: -1, errMessage: 'Mật khẩu không hợp lệ!', data: null, };
  }
  try {
    let salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(Password, salt);
  } catch (e) {
    console.log(e);
    return { errCode: 3, errMessage: 'Lỗi khi mã hóa mật khẩu: ' + e.message, data: null, };
  }
};
let firstNavigate = (AccountType) => {
  if (!AccountType) {
    return '/login';
  }
  switch (AccountType) {
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
  const { AccountName, Email, Password, UserName, Phone, Address, Gender, AccountType } = userInfo;
  if (!AccountName) {
    return {
      errCode: -1,
      errMessage: 'Tên tài khoản không được để trống!',
      data: null,
    };
  } else {
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    if (!accountNameRegex.test(AccountName.trim())) {
      return {
        errCode: 1,
        errMessage: 'Tên tài khoản sai định dạng!',
        data: null,
      };
    }
  }
  if (!Email) {
    return {
      errCode: -1,
      errMessage: 'Email không được để trống!',
      data: null,
    };
  } else {
    const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email.trim())) {
      return {
        errCode: 1,
        errMessage: 'Email sai định dạng!',
        data: null,
      };
    }
  }
  if (!Password) {
    return {
      errCode: -1,
      errMessage: 'Mật khẩu không được để trống!',
      data: null,
    };
  } else {
    const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;  //cần ít nhất 8 ký tự
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/; //cần ít nhất 8 ký tự, bao gồm chữ cái và số
    if (!passwordRegex.test(Password.trim())) {
      return {
        errCode: 1,
        errMessage: 'Mật khẩu không hợp lệ! (Cần ít nhất 8 ký tự)',
        data: null,
      };
    }
  }
  if (!UserName) {
    return {
      errCode: -1,
      errMessage: 'Tên người dùng không được để trống!',
      data: null,
    };
  } else {
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!userNameRegex.test(UserName.trim())) {
      return {
        errCode: 1,
        errMessage: 'Tên người dùng không hợp lệ!',
        data: null,
      };
    }
  }
  if (!Phone) {
    return {
      errCode: -1,
      errMessage: 'Số điện thoại không được để trống!',
      data: null,
    };
  } else {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(Phone.trim())) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại không hợp lệ!',
        data: null,
      };
    }
  }
  if (!Address || Address.trim().length === 0 || Address.trim().length > 100) {
    return {
      errCode: -1,
      errMessage: 'Địa chỉ không hợp lệ hoặc vượt quá 100 ký tự!',
      data: null,
    };
  }
  if (!Gender) {
    return {
      errCode: -1,
      errMessage: 'Giới tính không được để trống!',
      data: null,
    };
  } else {
    const validGender = await checkValidAllCode('Gender', Gender);
    if (!validGender) {
      return {
        errCode: 1,
        errMessage: 'Giới tính không hợp lệ!',
        data: null,
      };
    }
  }
  if (!AccountType) {
    return {
      errCode: -1,
      errMessage: 'Quyền hạn không được để trống!',
      data: null,
    };
  } else {
    const validAccountType = await checkValidAllCode('AccountType', AccountType);
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
  const { Bio, Specialization, WorkingStatus } = veterinarianInfo;
  if (Bio) {
    if (Bio.trim().length > 65535) {
      return {
        errCode: 1,
        errMessage: 'Bio vượt quá độ dài ký tự tối đa!',
        data: null,
      };
    }
  }
  if (Specialization) {
    const specializationRegex = /^[A-Za-zÀ-ỹ0-9\s]{1,50}$/;
    if (!specializationRegex.test(Specialization.trim())) {
      return {
        errCode: 1,
        errMessage: 'Chuyên khoa không hợp lệ!',
        data: null,
      };
    }
  }
  if (!WorkingStatus) {
    return {
      errCode: -1,
      errMessage: 'Trạng thái làm việc không được để trống!',
      data: null,
    };
  } else {
    const validStatus = await checkValidAllCode('WorkingStatus', WorkingStatus);
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
  const { AccountName, UserName, Phone, Address, Gender, AccountType } = userInfo;
  if (AccountName) {
    const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
    if (!accountNameRegex.test(AccountName.trim())) {
      return {
        errCode: 1,
        errMessage: 'Tên tài khoản sai định dạng!',
        data: null,
      };
    }
  }
  if (UserName) {
    const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
    if (!userNameRegex.test(UserName.trim())) {
      return {
        errCode: 1,
        errMessage: 'Tên người dùng không hợp lệ!',
        data: null,
      };
    }
  }
  if (Phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(Phone.trim())) {
      return {
        errCode: 1,
        errMessage: 'Số điện thoại không hợp lệ!',
        data: null,
      };
    }
  }
  if (Address) {
    if (Address.trim().length === 0 || Address.trim().length > 100) {
      return {
        errCode: 1,
        errMessage: 'Địa chỉ không hợp lệ hoặc vượt quá 100 ký tự!',
        data: null,
      };
    }
  }
  if (Gender) {
    const validGender = await checkValidAllCode('Gender', Gender);
    if (!validGender) {
      return {
        errCode: 1,
        errMessage: 'Giới tính không hợp lệ!',
        data: null,
      };
    }
  }
  if (AccountType) {
    const validAccountType = await checkValidAllCode('AccountType', AccountType);
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
let checkExistEmail = (Email) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Email) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu Email để kiểm tra!',
          data: null,
        });
        return;
      }
      let existEmail = await db.Account.findOne({
        where: { Email },
      });
      resolve(existEmail ? true : false);
    } catch (e) {
      console.log(e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi kiểm tra Email: ' + e.message,
        data: null,
      });
    }
  });
};
let checkExistAccountName = (AccountName) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountName) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tên tài khoản để kiểm tra!',
          data: null,
        });
        return;
      }
      let existAccountName = await db.Account.findOne({
        where: { AccountName },
      });
      resolve(existAccountName ? true : false);
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
let checkExistPhone = (Phone) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Phone) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu số điện thoại để kiểm tra!',
          data: null,
        });
        return;
      }
      let existPhone = await db.Account.findOne({
        where: { Phone },
      });
      resolve(existPhone ? true : false);
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
let sendVerificationEmail = async (Email, Code) => {
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
      to: Email,
      subject: 'Mã xác nhận đặt lại mật khẩu',
      text: `Mã xác nhận của bạn là: ${Code}. Mã này có hiệu lực trong 30 phút.`,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log('Error in sendVerificationEmail: ', e);
    return false;
  }
};
let sendPrivateKeyEmail = async (Email, privateKey) => {
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
      to: Email,
      subject: 'KHÔNG CHIA SẼ CHO BẤT KỲ AI!',
      text: `PrivateKey ví điện tử của bạn là: ${privateKey}. Hãy nhập ví vào Metamask để có thể sử dụng dịch vụ của chúng tôi.`,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log('Error in sendVerificationEmail: ', e);
    return false;
  }
};
//kiểm tra tính hợp lệ của token
let verifyToken = (Token) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Token) {
        resolve({
          errCode: -1,
          errMessage: 'Không có token!',
          data: null,
        });
        return;
      }
      const isBlacklisted = await db.BlacklistToken.findOne({
        where: { Token },
      });
      if (isBlacklisted) {
        resolve({
          errCode: 2,
          errMessage: 'Token đã bị vô hiệu hóa!',
          data: null,
        });
        return;
      }
      const data = verifyJWT(Token);
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
      const { AccountName, Email, Password, UserName, Phone, Address, Gender, AccountType } = userInfo;
      const isAccountNameExist = await checkExistAccountName(AccountName);
      if (isAccountNameExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Tên tài khoản đã tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const isEmailExist = await checkExistEmail(Email);
      if (isEmailExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Email đã tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      const isPhoneExist = await checkExistPhone(Phone);
      if (isPhoneExist) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Số điện thoại đã tồn tại trong hệ thống!',
          data: null,
        });
        return;
      }
      // Kết nối tới Ganache
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
      // Lấy danh sách tài khoản từ Ganache
      const accounts = await provider.send('eth_accounts', []);
      if (!accounts || accounts.length === 0) {
        await transaction.rollback();
        resolve({
          errCode: 3,
          errMessage: 'Không thể lấy tài khoản từ Ganache!',
          data: null,
        });
        return;
      }
      // Tìm tài khoản chưa sử dụng
      let selectedAccount = null;
      let privateKey = null;
      for (const account of accounts) {
        const exists = await db.Account.findOne({
          where: { AccountID: account },
          transaction,
        });
        if (!exists) {
          selectedAccount = account;
          // Lấy private key từ Ganache (cần cấu hình ganache-cli với --account_keys_path hoặc truy vấn trực tiếp)
          // Lưu ý: ganache-cli không cung cấp private key trực tiếp qua eth_accounts, cần lấy từ file keys.json hoặc cấu hình
          // Giả định bạn đã chạy ganache-cli với --account_keys_path để lưu private keys
          privateKey = keys.private_keys[selectedAccount.toLowerCase()];
          break;
        }
      }
      if (!selectedAccount || !privateKey) {
        await transaction.rollback();
        resolve({
          errCode: 3,
          errMessage: 'Không còn tài khoản Ganache khả dụng!',
          data: null,
        });
        return;
      }
      const AccountID = selectedAccount;
      const hashedPassword = hashPassword(Password);
      if (typeof hashedPassword === 'object' && hashedPassword.errCode) {
        await transaction.rollback();
        resolve(hashedPassword);
        return;
      }
      const defaultUserImage = "https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg";
      const CreatedAt = new Date();
      await db.Account.create({
        AccountID,
        AccountName,
        Email,
        Password: hashedPassword,
        UserName,
        UserImage: defaultUserImage,
        Phone,
        Address,
        Gender,
        LoginAttempt: 0,
        LockUntil: null,
        CreatedAt,
        AccountStatus: 'ACT',
        AccountType,
      }, { transaction });
      if (userInfo.AccountType === 'V' && userInfo.veterinarianInfo) {
        const { Bio, Specialization, WorkingStatus, selectedServicesList } = userInfo.veterinarianInfo;
        const veterinarianInfo = {
          Bio,
          Specialization,
          WorkingStatus
        };
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
          AccountID,
          Bio,
          Specialization,
          WorkingStatus,
        }, { transaction });
        for (const ServiceID of selectedServicesList) {
          await db.VeterinarianService.create({
            VeterinarianID: AccountID,
            ServiceID,
          }, { transaction });
        }
      }
      await transaction.commit();
      await sendPrivateKeyEmail(Email, privateKey)
      console.log("Private key của tài khoản vừa tạo", privateKey)
      resolve({
        errCode: 0,
        errMessage: 'Đăng ký người dùng thành công!',
        data: { AccountID },
      });
    } catch (e) {
      await transaction.rollback();
      console.log('Error in userRegister:', e);
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi đăng ký: ' + e.message,
        data: null,
      });
    }
  });
};
//hàm đăng ký khi chưa có blockchain
// let userRegister = (userInfo) => {
//   return new Promise(async (resolve, reject) => {
//     const transaction = await db.sequelize.transaction();
//     try {
//       if (!userInfo) {
//         await transaction.rollback();
//         resolve({
//           errCode: -1,
//           errMessage: 'Thiếu thông tin người dùng!',
//           data: null,
//         });
//         return;
//       }
//       const isValidateInput = await validateAccountInput(userInfo);
//       if (isValidateInput) {
//         await transaction.rollback();
//         resolve(isValidateInput);
//         return;
//       }
//       const isAccountNameExist = await checkExistAccountName(userInfo.accountname);
//       if (isAccountNameExist) {
//         await transaction.rollback();
//         resolve({
//           errCode: 1,
//           errMessage: 'Tên tài khoản đã tồn tại trong hệ thống!',
//           data: null,
//         });
//         return;
//       }
//       const isEmailExist = await checkExistEmail(userInfo.Email);
//       if (isEmailExist) {
//         await transaction.rollback();
//         resolve({
//           errCode: 1,
//           errMessage: 'Email đã tồn tại trong hệ thống!',
//           data: null,
//         });
//         return;
//       }
//       const isPhoneExist = await checkExistPhone(userInfo.phone);
//       if (isPhoneExist) {
//         await transaction.rollback();
//         resolve({
//           errCode: 1,
//           errMessage: 'Số điện thoại đã tồn tại trong hệ thống!',
//           data: null,
//         });
//         return;
//       }
//       // const accountIDResult = await generateID(userInfo.accounttype || 'C', 9, 'Account', 'AccountID');
//       // if (accountIDResult.errCode !== 0) {
//       //   await transaction.rollback();
//       //   resolve(accountIDResult);
//       //   return;
//       // }
//       // const accountID = accountIDResult.data;

//       const wallet = ethers.Wallet.createRandom();
//       const accountID = wallet.address; // Địa chỉ Ethereum (0x...)
//       const privateKey = wallet.privateKey; // Lưu private key

//       const hashedPassword = hashPassword(userInfo.password);
//       if (typeof hashedPassword === 'object' && hashedPassword.errCode) {
//         await transaction.rollback();
//         resolve(hashedPassword);
//         return;
//       }
//       const CreatedAt = new Date();
//       await db.Account.create({
//         AccountID: accountID,
//         AccountName: userInfo.accountname,
//         Email: userInfo.Email,
//         Password: hashedPassword,
//         UserName: userInfo.username,
//         UserImage: "https://res.cloudinary.com/dqblg6ont/image/upload/v1744579137/tgx7fjbmpulisg3emlts.jpg",
//         Phone: userInfo.phone,
//         Address: userInfo.address,
//         Gender: userInfo.gender,
//         LoginAttempt: 0,
//         LockUntil: null,
//         CreatedAt: CreatedAt,
//         AccountStatus: 'ACT',
//         AccountType: userInfo.accounttype || 'C',
//       }, { transaction });
//       if (userInfo.accounttype === 'V' && userInfo.veterinarianInfo) {
//         const { bio, specialization, workingstatus, selectedServicesList } = userInfo.veterinarianInfo;
//         const veterinarianInfo = {
//           bio,
//           specialization,
//           workingstatus
//         }
//         const isValidateInput = await validateVeterinarianInput(veterinarianInfo);
//         if (isValidateInput) {
//           await transaction.rollback();
//           resolve(isValidateInput);
//           return;
//         }
//         if (!selectedServicesList || !Array.isArray(selectedServicesList) || selectedServicesList.length === 0) {
//           await transaction.rollback();
//           resolve({
//             errCode: 1,
//             errMessage: 'Vui lòng chọn ít nhất một dịch vụ cho bác sĩ!',
//             data: null,
//           });
//           return;
//         }
//         const validServices = await db.Service.findAll({
//           where: {
//             ServiceID: selectedServicesList,
//             ServiceStatus: 'VALID'
//           },
//           attributes: ['ServiceID'],
//           transaction,
//         });
//         if (validServices.length !== selectedServicesList.length) {
//           await transaction.rollback();
//           resolve({
//             errCode: 1,
//             errMessage: 'Một hoặc nhiều dịch vụ không hợp lệ!',
//             data: null,
//           });
//           return;
//         }
//         await db.VeterinarianInfo.create({
//           AccountID: accountID,
//           Bio: bio || null,
//           Specialization: specialization || null,
//           WorkingStatus: workingstatus,
//         }, { transaction });
//         for (const serviceid of selectedServicesList) {
//           await db.VeterinarianService.create({
//             VeterinarianID: accountID,
//             ServiceID: serviceid,
//           }, { transaction });
//         }
//       }
//       await transaction.commit();
//       console.log("Private test:", privateKey)
//       resolve({
//         errCode: 0,
//         errMessage: 'Đăng ký người dùng thành công!',
//         data: { AccountID: accountID },
//       });
//     } catch (e) {
//       await transaction.rollback();
//       console.log(e);
//       resolve({
//         errCode: 3,
//         errMessage: 'Lỗi khi đăng ký: ' + e.message,
//         data: null,
//       });
//     }
//   });
// };
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
      const { AccountName, Password } = userInfo;
      if (!AccountName || !Password) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Tên tài khoản hoặc mật khẩu không được để trống!',
          data: null,
        });
        return;
      }
      console.log(userInfo)
      const existedAccount = await db.Account.findOne({
        attributes: ['AccountID', 'AccountName', 'Password', 'UserName', 'UserImage', 'LoginAttempt', 'LockUntil', 'AccountStatus', 'AccountType'],
        where: { AccountName },
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
      const isPasswordValid = bcrypt.compareSync(Password, existedAccount.Password);
      if (isPasswordValid && existedAccount.AccountStatus === 'ACT') {
        delete existedAccount.Password;
        await db.Account.update(
          { LoginAttempt: 0, LockUntil: null },
          { where: { AccountName }, transaction }
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
          { where: { AccountName }, transaction }
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
let userLogout = (Token, decoded) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!Token) {
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
      const ExpiredAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.BlacklistToken.create({
        Token,
        CreatedAt: new Date(),
        ExpiredAt,
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
//lấy thông tin tài khoản = AccountID; lấy hết danh sách = ALL
let getAccountInfo = (AccountID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      let userData = null;
      if (AccountID === 'ALL') {
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
          where: { AccountID },
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
        const validFields = ['AccountType', 'Gender', 'AccountStatus'];
        if (!validFields.includes(field)) {
          resolve({
            errCode: 1,
            errMessage: 'Tham số filter không hợp lệ!',
            data: null,
          });
          return;
        }
        const validCode = await checkValidAllCode(field, value);
        if (!validCode) {
          resolve({
            errCode: 1,
            errMessage: `${field} không hợp lệ!`,
            data: null,
          });
          return;
        }
        where[field] = value;
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
      const { AccountID, AccountName, UserName, Phone, Address, Gender, AccountType, UserImage } = userInfo;
      if (!userInfo || !AccountID) {
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
        where: { AccountID },
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
      if (AccountName && AccountName !== account.AccountName) {
        const isAccountNameExist = await checkExistAccountName(AccountName);
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
      if (Phone && Phone !== account.Phone) {
        const isPhoneExist = await checkExistPhone(Phone);
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
      if (AccountName) {
        account.AccountName = AccountName;
        isUpdated = true;
      }
      if (UserName) {
        account.UserName = UserName;
        isUpdated = true;
      }
      if (Gender) {
        account.Gender = Gender;
        isUpdated = true;
      }
      if (Phone) {
        account.Phone = Phone;
        isUpdated = true;
      }
      if (Address) {
        account.Address = Address;
        isUpdated = true;
      }
      if ('UserImage' in userInfo) {
        if (UserImage === null) {
          account.UserImage = null;
          isUpdated = true;
        } else if (!UserImage?.secure_url || UserImage.secure_url.length > 2048) {
          await transaction.rollback();
          resolve({
            errCode: 1,
            errMessage: 'URL ảnh đại diện không hợp lệ hoặc vượt quá 2048 ký tự!',
            data: null,
          });
          return;
        } else {
          account.UserImage = UserImage.secure_url;
          isUpdated = true;
        }
      }
      if (AccountType) {
        account.AccountType = AccountType;
        isUpdated = true;
      }
      if (AccountType === 'V' && userInfo.veterinarianInfo) {
        const { Bio, Specialization, WorkingStatus, selectedServicesList } = userInfo.veterinarianInfo;
        const veterinarianInfo = {
          Bio,
          Specialization,
          WorkingStatus
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
          where: { AccountID },
          transaction,
        });
        if (vetInfo) {
          await db.VeterinarianInfo.update(
            {
              Bio: Bio?.trim() || vetInfo.Bio,
              Specialization: Specialization?.trim() || vetInfo.Specialization,
              WorkingStatus: WorkingStatus.trim(),
            },
            { where: { AccountID }, transaction }
          );
        } else {
          await db.VeterinarianInfo.create({
            AccountID,
            Bio: Bio?.trim() || null,
            Specialization: Specialization?.trim() || null,
            WorkingStatus: WorkingStatus.trim(),
          }, { transaction });
        }
        await db.VeterinarianService.destroy({
          where: { VeterinarianID: AccountID },
          transaction,
        });
        for (const ServiceID of selectedServicesList) {
          await db.VeterinarianService.create({
            VeterinarianID: AccountID,
            ServiceID,
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
      await db.Account.update({
        AccountName: account.AccountName,
        UserName: account.UserName,
        Phone: account.Phone,
        Address: account.Address,
        Gender: account.Gender,
        UserImage: account.UserImage,
        AccountType: account.AccountType,
      }, { where: { AccountID }, transaction });
      await transaction.commit();
      resolve({
        errCode: 0,
        errMessage: 'Cập nhật thông tin tài khoản thành công!',
        data: null,
      });
    } catch (e) {
      await transaction.rollback();
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi cập nhật thông tin: ' + e.message,
        data: null,
      });
    }
  });
};
//gửi mã xác minh quên mật khẩu
let sendForgotToken = (Email) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!Email) {
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
          errMessage: 'Cấu hình Email không hợp lệ!',
          data: null,
        });
        return;
      }
      const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(Email.trim())) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Email không hợp lệ!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { Email },
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
      const Token = Math.floor(100000 + Math.random() * 900000).toString();
      const CreatedAt = new Date();
      const ExpiredAt = new Date(CreatedAt.getTime() + 30 * 60 * 1000);
      await db.BlacklistToken.destroy({
        where: {
          ExtraValue: account.AccountID,
          ExpiredAt: { [Op.lt]: CreatedAt },
        },
        transaction,
      });
      await db.BlacklistToken.create({
        Token,
        ExtraValue: account.AccountID,
        CreatedAt,
        ExpiredAt,
      }, { transaction });
      const emailSent = await sendVerificationEmail(Email, Token);
      if (!emailSent) {
        await transaction.rollback();
        resolve({
          errCode: 3,
          errMessage: 'Lỗi khi gửi Email xác nhận!',
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
        errMessage: 'Lỗi khi xử lý Email: ' + e.message,
        data: null,
      });
    }
  });
};
//xác nhận mã xác minh
let verifyForgotToken = (AccountID, Token) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !Token) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const tokenRecord = await db.BlacklistToken.findOne({
        where: {
          Token,
          ExtraValue: AccountID,
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
      const currentTime = new Date();
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
        where: { ExtraValue: AccountID },
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
let changePassword = (AccountID, Password, newPassword) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !newPassword) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { AccountID },
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
      if (Password !== 'forgot_password') {
        const isPasswordValid = bcrypt.compareSync(Password, account.Password);
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
      const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(newPassword.trim())) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Mật khẩu mới không hợp lệ! (Cần ít nhất 8 ký tự)',
          data: null,
        });
        return;
      }
      if (Password !== 'forgot_password' && bcrypt.compareSync(newPassword, account.Password)) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Mật khẩu mới không được trùng với mật khẩu cũ!',
          data: null,
        });
        return;
      }
      const hashedPassword = await hashPassword(newPassword);
      if (typeof hashedPassword === 'object' && hashedPassword.errCode) {
        await transaction.rollback();
        resolve(hashedPassword);
        return;
      }
      await db.Account.update(
        { Password: hashedPassword },
        { where: { AccountID }, transaction }
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
let changeAccountStatus = (AccountID, AccountStatus) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!AccountID || !AccountStatus) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const validAccountStatus = await checkValidAllCode('AccountStatus', AccountStatus);
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
        where: { AccountID },
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
      if (account.AccountStatus === AccountStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      await db.Account.update(
        { AccountStatus },
        { where: { AccountID }, transaction }
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
let getVeterinarianInfo = (VeterinarianID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!VeterinarianID) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const account = await db.Account.findOne({
        where: { AccountID: VeterinarianID, AccountType: 'V' },
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
        where: { AccountID: VeterinarianID },
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
        where: { VeterinarianID },
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
      const { Bio, Specialization, WorkingStatus } = vetInfo
      const formattedData = {
        Bio,
        Specialization,
        WorkingStatus,
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
        if (field === 'Service') {
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
let changeWorkingStatus = (VeterinarianID, WorkingStatus) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (!VeterinarianID || !WorkingStatus) {
        await transaction.rollback();
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const validWorkingStatus = await checkValidAllCode('WorkingStatus', WorkingStatus);
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
        where: { AccountID: VeterinarianID },
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
      if (account.WorkingStatus === WorkingStatus) {
        await transaction.rollback();
        resolve({
          errCode: 1,
          errMessage: 'Trạng thái không thay đổi!',
          data: null,
        });
        return;
      }
      await db.VeterinarianInfo.update(
        { WorkingStatus },
        { where: { AccountID: VeterinarianID }, transaction }
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
let loadRoleAccount = (AccountType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountType) {
        resolve({
          errCode: -1,
          errMessage: 'Thiếu tham số!',
          data: null,
        });
        return;
      }
      const isValidRole = await checkValidAllCode('AccountType', AccountType);
      if (!isValidRole) {
        resolve({
          errCode: 1,
          errMessage: 'Role không hợp lệ hoặc không tồn tại!',
          data: null,
        });
        return;
      }
      const data = await db.Account.findAll({
        where: {
          AccountType,
          AccountStatus: 'ACT'
        },
        attributes: ['AccountID', 'UserName'],
        raw: true,
      });
      resolve({
        errCode: 0,
        errMessage: 'Lấy danh sách thành công!',
        data,
      });
    } catch (e) {
      resolve({
        errCode: 3,
        errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
        data: null,
      });
    }
  });
}
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
  loadRoleAccount,
};
