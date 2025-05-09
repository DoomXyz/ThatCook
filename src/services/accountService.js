import { response } from "express";
import db from "../models/index";
import bcrypt from "bcrypt";
import { InvalidConnectionError, where, Op } from "sequelize";
import { checkGender, checkAccountType, checkAccountStatus } from "./utilitiesService";
import { verifyJWT } from '../middleware/jwtController';
//bcrypt
let saltRounds = 10;
let validateUserInput = async (userInfo) => {
    if (!userInfo || Object.keys(userInfo).length === 0) {
        return {
            errCode: -1,
            errMessage: 'Thiếu thông tin người dùng!',
            data: null
        };
    }
    if (!userInfo.accountname) {
        return {
            errCode: -1,
            errMessage: "Tên tài khoản trống!",
            data: null
        };
    } else {
        const accountName = userInfo.accountname.trim();
        const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
        if (!accountNameRegex.test(accountName)) {
            return {
                errCode: 1,
                errMessage: "Tên tài khoản sai định dạng!",
                data: null
            };
        }
    }
    if (!userInfo.email) {
        return {
            errCode: -1,
            errMessage: "Email trống!",
            data: null
        };
    } else {
        const email = userInfo.email.trim();
        const emailRegex = /^(?=.{5,100}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                errCode: 1,
                errMessage: "Email sai định dạng!",
                data: null
            };
        }
    }
    if (!userInfo.password) {
        return {
            errCode: -1,
            errMessage: "Mật khẩu trống!",
            data: null
        };
    } else {
        const password = userInfo.password.trim();
        const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;  //cần ít nhất 8 ký tự
        // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/; //cần ít nhất 8 ký tự, bao gồm chữ cái và số để tăng tính bảo mật
        if (!passwordRegex.test(password)) {
            return {
                errCode: 1,
                errMessage: "Mật khẩu không hợp lệ! (Cần ít nhất 8 ký tự)",
                data: null
            };
        }
    }
    if (!userInfo.username) {
        return {
            errCode: -1,
            errMessage: "Tên người dùng trống!",
            data: null
        };
    } else {
        const userName = userInfo.username.trim();
        const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/; //chứa chữ cái, số hoặc khoảng trắng, dài từ 2-50 ký tự
        if (!userNameRegex.test(userName)) {
            return {
                errCode: 1,
                errMessage: "Tên người dùng không hợp lệ!",
                data: null
            };
        }
    }
    if (!userInfo.phone) {
        return {
            errCode: -1,
            errMessage: "Số điện thoại trống!",
            data: null
        };
    } else {
        const phoneNumber = userInfo.phone.trim();
        const phoneRegex = /^[0-9]{10,11}$/; //chỉ chứa số và có độ dài từ 10-11 ký tự
        if (!phoneRegex.test(phoneNumber)) {
            return {
                errCode: 1,
                errMessage: "Số điện thoại không hợp lệ!",
                data: null
            };
        }
    }
    if (!userInfo.address) {
        return {
            errCode: -1,
            errMessage: "Địa chỉ trống!",
            data: null
        };
    }
    if (!userInfo.gender) {
        return {
            errCode: -1,
            errMessage: "Giới tính không tồn tại!",
            data: null
        };
    } else {
        let validGender = await checkGender(userInfo.gender);
        if (!validGender) {
            return {
                errCode: 1,
                errMessage: "Giới tính không hợp lệ!",
                data: null
            };
        }
    }
    if (!userInfo.accounttype) {
        return {
            errCode: -1,
            errMessage: "Quyền hạn không tồn tại!",
            data: null
        };
    } else {
        let validAccountType = await checkAccountType(userInfo.accounttype);
        if (!validAccountType) {
            return {
                errCode: 1,
                errMessage: "Quyền hạn không hợp lệ!",
                data: null
            };
        }
    }
    return null;
};
let validateUserEdit = async (userInfo) => {
    if (userInfo.username) {
        const userName = userInfo.username.trim();
        const userNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
        if (!userNameRegex.test(userName)) {
            return {
                errCode: 1,
                errMessage: 'Tên người dùng không hợp lệ!',
                data: null
            };
        }
    }
    if (userInfo.accountname) {
        const accountName = userInfo.accountname.trim();
        const accountNameRegex = /^[a-zA-Z0-9_]{5,50}$/;
        if (!accountNameRegex.test(accountName)) {
            return {
                errCode: 1,
                errMessage: "Tên tài khoản sai định dạng!",
                data: null
            };
        }
    }
    if (userInfo.phone) {
        const phoneNumber = userInfo.phone.trim();
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return {
                errCode: 1,
                errMessage: 'Số điện thoại không hợp lệ!',
                data: null
            };
        }
    }
    if (userInfo.address && !userInfo.address.trim()) {
        return {
            errCode: 1,
            errMessage: 'Địa chỉ không hợp lệ!',
            data: null
        };
    }
    if (userInfo.birthday) {
        const birthday = new Date(userInfo.birthday);
        if (isNaN(birthday.getTime()) || birthday > new Date()) {
            return {
                errCode: 1,
                errMessage: 'Ngày sinh không hợp lệ!',
                data: null
            };
        }
    }
    if (userInfo.gender) {
        let validGender = await checkGender(userInfo.gender);
        if (typeof validGender === 'object' && validGender.errCode !== 0) {
            return {
                errCode: 1,
                errMessage: validGender.errMessage,
                data: null
            };
        }
        if (!validGender) {
            return {
                errCode: 1,
                errMessage: 'Giới tính không hợp lệ!',
                data: null
            };
        }
    }
    return null
}
let checkEmailExist = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userEmail) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu email để kiểm tra!',
                    data: null
                });
                return;
            }
            let exist = await db.Account.findOne({
                where: { Email: userEmail }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra email: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.Account.findOne({
                where: { AccountName: userAccountName }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra tên tài khoản: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let exist = await db.Account.findOne({
                where: { Phone: userPhone }
            });
            resolve(exist ? true : false);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi kiểm tra số điện thoại: ' + e.message,
                data: null
            });
        }
    });
};
let generateAccountID = (userAccountType) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userAccountType) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu loại tài khoản để tạo ID!',
                    data: null
                });
                return;
            }
            const roleMap = {
                A: "A", // Admin
                O: "O", // Chủ cửa hàng
                V: "V", // Bác sĩ thú y
                C: "C", // Khách hàng
            };
            const prefix = roleMap[userAccountType] || "C"; // Chỉ lấy A, O, V, hoặc C
            // Lấy timestamp
            const timestamp = Date.now().toString();
            // Lấy 9 chữ số từ timestamp
            const timestampDigits = timestamp.slice(-9); // Lấy 9 chữ số cuối
            let accountId = `${prefix}${timestampDigits}`;
            // Kiểm tra xem accountId có trùng trong DB không
            let existingAccount = await db.Account.findOne({
                where: { AccountID: accountId },
            });
            // Nếu trùng, thử lại với timestamp mới (tối đa 5 lần)
            let attempts = 0;
            while (existingAccount && attempts < 5) {
                const newTimestamp = Date.now().toString();
                const newTimestampDigits = newTimestamp.slice(-9);
                accountId = `${prefix}${newTimestampDigits}`;
                attempts++;
                existingAccount = await db.Account.findOne({
                    where: { AccountID: accountId },
                });
            }
            if (attempts >= 5) {
                resolve({
                    errCode: 1,
                    errMessage: "Tạo mã tài khoản thất bại!",
                    data: null
                });
            }
            resolve(accountId);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo mã tài khoản: ' + e.message,
                data: null
            });
        }
    });
};
let hashPassword = (userPassword) => {
    return new Promise((resolve, reject) => {
        try {
            if (!userPassword || typeof userPassword !== "string") {
                resolve({
                    errCode: -1,
                    errMessage: 'Mật khẩu không hợp lệ!',
                    data: null
                });
                return;
            }
            let salt = bcrypt.genSaltSync(saltRounds);
            let hashPassword = bcrypt.hashSync(userPassword, salt);
            resolve(hashPassword);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi mã hóa mật khẩu: ' + e.message,
                data: null
            });
        }
    });
};
let firstNavigate = (accountType) => {
    if (!accountType) {
        return '/login';
    }
    switch (accountType) {
        case "A":
            return "/user/admin";
        case "O":
            return "/user/owner";
        case "V":
            return "/user/veterinarian"
        case "C":
            return "/home";
        default:
            return "/login";
    }
};
//đăng ký
let userRegister = (userInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userInfo || Object.keys(userInfo).length === 0) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu thông tin người dùng!',
                    data: null
                });
                return;
            }
            let isValidateInput = await validateUserInput(userInfo);
            if (isValidateInput) {
                //có trả lỗi về -> dữ liệu nhập vào không hợp lệ
                resolve(isValidateInput);
                return;
            }
            let isAccountNameExist = await checkAccountNameExist(userInfo.accountname);
            if (isAccountNameExist) {
                //tên tài khoản đã tồn tại
                resolve({
                    errCode: 1,
                    errMessage: "Tên tài khoản đã tồn tại trong hệ thống!",
                    data: null
                });
                return;
            }
            let isEmailExist = await checkEmailExist(userInfo.email);
            if (isEmailExist) {
                //email đã tồn tại
                resolve({
                    errCode: 1,
                    errMessage: "Email đã tồn tại trong hệ thống!",
                    data: null
                });
                return;
            }
            let isPhoneExist = await checkPhoneExist(userInfo.phone);
            if (isPhoneExist) {
                resolve({
                    errCode: 1,
                    errMessage: "Số điện thoại đã tồn tại trong hệ thống!",
                    data: null
                });
                return;
            }
            //pass hết mọi điều kiện = 4 hàm trên không trả về lỗi -> tạo các trường cần thiết -> lưu vào db
            const accountID = await generateAccountID(userInfo.accounttype);
            if (typeof accountID === 'object' && accountID.errCode) {
                resolve(accountID);
                return;
            }
            const hashedPassword = await hashPassword(userInfo.password);
            if (typeof hashedPassword === 'object' && hashedPassword.errCode !== 0) {
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
                Birthday: null,
                UserImage: null,
                Phone: userInfo.phone,
                Address: userInfo.address,
                Gender: userInfo.gender,
                LoginAttempt: 0,
                LockUntil: null,
                CreatedAt: createdAt,
                AccountStatus: "ACT",
                AccountType: userInfo.accounttype || "C",
            });
            resolve({
                errCode: 0,
                errMessage: "Đăng ký người dùng thành công!",
                data: null
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi đăng ký: ' + e.message,
                data: null
            });
        }
    });
};
//đăng nhập
let userLogin = (userInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userInfo || Object.keys(userInfo).length === 0) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu thông tin đăng nhập!',
                    data: null
                });
                return;
            }
            let userAccountName = userInfo.accountname;
            let userPassword = userInfo.password;
            if (!userAccountName || !userPassword) {
                resolve({
                    errCode: -1,
                    errMessage: 'Tên tài khoản hoặc mật khẩu không được bỏ trống!',
                    data: null
                });
                return;
            }
            let userData = {};
            let existedAccount = await db.Account.findOne({
                attributes: [
                    'AccountID',
                    'AccountName',
                    'Password',
                    'UserName',
                    'UserImage',
                    'LoginAttempt',
                    'LockUntil',
                    'AccountStatus',
                    'AccountType'
                ],
                where: { AccountName: userAccountName },
                raw: true
            });
            if (!existedAccount) {
                userData.errCode = 2;
                userData.errMessage = 'Tên tài khoản không tồn tại!';
                userData.data = null;
                resolve(userData);
                return;
            }
            const currentTime = new Date();
            if (existedAccount.LockUntil && new Date(existedAccount.LockUntil) > currentTime) {
                userData.errCode = 2;
                userData.errMessage = "Tài khoản đang bị khóa. Vui lòng thử lại sau!";
                userData.data = null;
                resolve(userData);
                return;
            }
            let checkValidPasword = bcrypt.compareSync(userPassword, existedAccount.Password);
            if (checkValidPasword) {
                if (existedAccount.AccountStatus === "ACT") {
                    userData.errCode = 0;
                    userData.errMessage = "Đúng mật khẩu!";
                    delete existedAccount.Password;
                    userData.data = existedAccount;
                    userData.navigate = firstNavigate(existedAccount.AccountType);
                    await db.Account.update(
                        { LoginAttempt: 0, LockUntil: null },
                        { where: { AccountName: userAccountName } }
                    );
                } else {
                    userData.errCode = 2;
                    userData.errMessage = "Tài khoản đăng nhập đã bị khóa!";
                    userData.data = null;
                }
            } else {
                //tăng bộ đếm nếu đăng nhập sai mật khẩu
                let newLoginAttempts = (existedAccount.LoginAttempt || 0) + 1;
                let lockUntilTime = null;
                if (newLoginAttempts >= 5) {
                    //khóa tài khoản 5 phút
                    lockUntilTime = new Date(currentTime.getTime() + 5 * 60 * 1000);
                    newLoginAttempts = 0; //cho attempt về không
                    userData.errCode = 2;
                    userData.errMessage = "Đã vượt quá số lần đăng nhập. Tài khoản bị khóa 5 phút!";
                    userData.data = null;
                } else {
                    userData.errCode = 2;
                    userData.errMessage = "Sai mật khẩu!";
                    userData.data = null;
                }
                await db.Account.update(
                    {
                        LoginAttempt: newLoginAttempts,
                        LockUntil: lockUntilTime
                    },
                    { where: { AccountName: userAccountName } }
                );
            }
            resolve(userData);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi đăng nhập: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            let userData = null;
            if (accountid === "ALL") {
                userData = await db.Account.findAll({
                    attributes: {
                        exclude: ["Password", "LoginAttempt"],
                    },
                });
            } else {
                userData = await db.Account.findOne({
                    where: { AccountID: accountid },
                    attributes: {
                        exclude: ["Password", "LoginAttempt"],
                    },
                });
            }
            if (userData !== null) {
                resolve({
                    errCode: 0,
                    errMessage: "Lấy dữ liệu thành công!",
                    data: userData
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: "Tài khoản không tồn tại!",
                    data: null
                })
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi lấy thông tin: ' + e.message,
                data: null
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
                    data: null
                });
                return;
            }
            if (filter !== 'ALL' && !filter.includes('-')) {
                resolve({
                    errCode: 1,
                    errMessage: 'Tham số filter không hợp lệ!',
                    data: null
                });
                return;
            }
            if (sort && !['0', '1', '2', '3', '4', '5', '6', '7'].includes(sort)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Tham số sort không hợp lệ!',
                    data: null
                });
                return;
            }
            const offset = (page - 1) * limit;
            let where = {};
            let order = [];
            // Tìm kiếm
            if (search) {
                where[Op.or] = [
                    { Email: { [Op.like]: `%${search}%` } },
                    { UserName: { [Op.like]: `%${search}%` } },
                    { Phone: { [Op.like]: `%${search}%` } },
                ];
            }
            // Lọc
            if (filter !== "ALL") {
                const [field, value] = filter.split("-");
                if (field === "accounttype") {
                    const validAccountType = await checkAccountType(value);
                    if (!validAccountType) {
                        resolve({
                            errCode: 1,
                            errMessage: "Loại tài khoản không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.AccountType = value;
                }
                if (field === "gender") {
                    const validGender = await checkGender(value);
                    if (!validGender) {
                        resolve({
                            errCode: 1,
                            errMessage: "Giới tính không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.Gender = value;
                }
                if (field === "accountstatus") {
                    const validAccountStatus = await checkAccountStatus(value);
                    if (!validAccountStatus) {
                        resolve({
                            errCode: 1,
                            errMessage: "Trạng thái tài khoản không hợp lệ!",
                            data: null
                        });
                        return;
                    }
                    where.AccountStatus = value;
                }
            }
            // Sắp xếp
            switch (sort) {
                case "1":
                    order.push(["UserName", "ASC"]);
                    break;
                case "2":
                    order.push(["UserName", "DESC"]);
                    break;
                case "3":
                    order.push(["AccountType", "ASC"]);
                    break;
                case "4":
                    order.push(["AccountStatus", "ASC"]);
                    break;
                case "5":
                    order.push(["Gender", "DESC"]);
                    break;
                case "6":
                    order.push(["CreatedAt", "DESC"]);
                    break;
                case "7":
                    order.push(["CreatedAt", "ASC"]);
                    break;
                default:
                    break;
            }
            const { count, rows } = await db.Account.findAndCountAll({
                where,
                attributes: { exclude: ["Password", "LoginAttempt"] },
                limit,
                offset,
                order,
                raw: true
            });
            resolve({
                errCode: 0,
                errMessage: 'Lấy danh sách tài khoản thành công!',
                data: rows,
                totalItems: count
            });
        } catch (e) {
            console.log("Error in loadAccountInfo: ", e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi lấy danh sách: ' + e.message,
                data: null
            });
        }
    });
};
//kiểm tra tính hợp lệ của token
let verifyToken = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!token) {
                resolve({
                    errCode: -1,
                    errMessage: 'Không có token!',
                    data: null
                });
                return;
            }
            const isBlacklisted = await db.BlacklistToken.findOne({
                where: { Token: token }
            });
            if (isBlacklisted) {
                resolve({
                    errCode: 2,
                    errMessage: 'Token đã bị vô hiệu hóa!',
                    data: null
                });
                return;
            }
            const data = verifyJWT(token);
            if (data) {
                resolve({
                    errCode: 0,
                    errMessage: 'Token hợp lệ!',
                    data: data
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Token không hợp lệ hoặc đã hết hạn!',
                    data: null
                });
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi xác minh token: ' + e.message,
                data: null
            });
        }
    });
}
//đăng xuất
let userLogout = (token, decoded) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!token) {
                resolve({
                    errCode: -1,
                    errMessage: 'Không có token để đăng xuất, nhưng vẫn thành công!',
                    data: null
                });
                return;
            }
            await db.BlacklistToken.destroy({
                where: {
                    ExpiredAt: {
                        [Op.lt]: new Date() // Xóa các token có ExpiredAt nhỏ hơn thời gian hiện tại
                    }
                }
            });
            const expiredAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;
            await db.BlacklistToken.create({
                Token: token,
                CreatedAt: new Date(),
                ExpiredAt: expiredAt
            });
            resolve({
                errCode: 0,
                errMessage: 'Đăng xuất thành công!',
                data: null
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi đăng xuất: ' + e.message,
                data: null
            });
        }
    });
};
//chuyển trạng thái của tài khoản
let changeAccountStatus = (accountid, accountstatus) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!accountid || !accountstatus) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            let userData = await db.Account.findOne({
                where: { AccountID: accountid },
                raw: false,
            });
            if (userData) {
                if (userData.AccountStatus !== accountstatus) {
                    let validAccountStatus = await checkAccountStatus(accountstatus);
                    if (typeof validAccountStatus === 'object' && validAccountStatus.errCode !== 0) {
                        resolve({
                            errCode: 1,
                            errMessage: validAccountStatus.errMessage,
                            data: null
                        });
                        return;
                    }
                    if (!validAccountStatus) {
                        resolve({
                            errCode: 1,
                            errMessage: 'Mã trạng thái tài khoản không tồn tại!',
                            data: null
                        });
                        return;
                    }
                    userData.AccountStatus = accountstatus;
                    await userData.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Thay đổi trạng thái thành công!',
                        data: null
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: 'Trạng thái không thay đổi!',
                        data: null
                    });
                }
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Tài khoản không tồn tại!',
                    data: null
                });
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi thay đổi trạng thái: ' + e.message,
                data: null
            });
        }
    });
};
//chỉnh sửa thông tin người dùng cơ bản
let changeAccountInfo = (userInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userInfo || !userInfo.accountid) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            let isValidateInput = await validateUserEdit(userInfo);
            if (isValidateInput) {
                //trả về lỗi = ko hợp lệ
                resolve(isValidateInput);
                return;
            }
            let account = await db.Account.findOne({
                where: { AccountID: userInfo.accountid },
                raw: false
            });
            if (!account) {
                resolve({
                    errCode: 2,
                    errMessage: 'Tài khoản không tồn tại!',
                    data: null
                });
                return;
            }
            if (userInfo.accountname && userInfo.accountname !== account.AccountName) {
                let isAccountNameExist = await checkEmailExist(userInfo.accountname);
                if (typeof isAccountNameExist === 'object' && isAccountNameExist.errCode !== 0) {
                    resolve(isAccountNameExist);
                    return;
                }
                if (isAccountNameExist) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Tên tài khoản đã tồn tại trong hệ thống!',
                        data: null
                    });
                    return;
                }
            }
            if (userInfo.phone && userInfo.phone !== account.Phone) {
                let isPhoneExist = await checkPhoneExist(userInfo.phone);
                if (typeof isPhoneExist === 'object' && isPhoneExist.errCode !== 0) {
                    resolve(isPhoneExist);
                    return;
                }
                if (isPhoneExist) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Số điện thoại đã tồn tại trong hệ thống!',
                        data: null
                    });
                    return;
                }
            }
            let isUpdated = false;
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
            if (userInfo.birthday) {
                account.Birthday = new Date(userInfo.birthday);
                isUpdated = true;
            }
            if ('userimage' in userInfo) {
                if (userInfo.userimage === 0) {
                    account.UserImage = null;
                    isUpdated = true;
                } else if (!userInfo.userimage?.secure_url) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Định dạng ảnh đại diện không hợp lệ!',
                        data: null
                    });
                    return;
                } else {
                    account.UserImage = userInfo.userimage.secure_url;
                    isUpdated = true;
                }
            }
            if (userInfo.accountname) {
                account.AccountName = userInfo.accountname;
                isUpdated = true;
            }
            if (isUpdated) {
                await account.save();
                resolve({
                    errCode: 0,
                    errMessage: 'Cập nhật thông tin tài khoản thành công!',
                    data: null
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Không có thông tin nào để cập nhật!',
                    data: null
                });
            }
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi cập nhật thông tin: ' + e.message,
                data: null
            });
        }
    });
};
//thay đổi mật khẩu
let changePassword = (accountid, password, newpassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!accountid || !password || !newpassword) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            let account = await db.Account.findOne({
                where: { AccountID: accountid },
                raw: false
            });
            if (!account) {
                resolve({
                    errCode: 2,
                    errMessage: 'Tài khoản không tồn tại!',
                    data: null
                });
                return;
            }
            let checkPassword = bcrypt.compareSync(password, account.Password);
            if (!checkPassword) {
                resolve({
                    errCode: 2,
                    errMessage: 'Mật khẩu cũ không đúng!',
                    data: null
                });
                return;
            }
            const checkNewPassword = newpassword.trim();
            const passwordRegex = /^[A-Za-z\d!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(checkNewPassword)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Mật khẩu mới không hợp lệ! (Cần ít nhất 8 ký tự)',
                    data: null
                });
                return;
            }
            if (password === newpassword) {
                resolve({
                    errCode: 1,
                    errMessage: 'Mật khẩu mới không được trùng với mật khẩu cũ!',
                    data: null
                });
                return;
            }
            let hashedPassword = await hashPassword(newpassword);
            if (typeof hashedPassword === 'object' && hashedPassword.errCode !== 0) {
                resolve(hashedPassword);
                return;
            }
            account.Password = hashedPassword;
            await account.save();
            resolve({
                errCode: 0,
                errMessage: 'Đổi mật khẩu thành công!',
                data: null
            });
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi đổi mật khẩu: ' + e.message,
                data: null
            });
        }
    });
};
//lấy thông tin thanh toán cho người dùng đã đăng nhập
let getPaymentInfo = (accountid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!accountid) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null
                });
                return;
            }
            let data = await db.Account.findOne({
                where: { AccountID: accountid },
                attributes: ['UserName', 'Phone', 'Address'],
                raw: true
            });
            if (data) {
                resolve({
                    errCode: 0,
                    errMessage: 'Lấy thông tin thanh toán thành công!',
                    data
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Tài khoản không tồn tại!',
                    data: null
                });
            }
        } catch (e) {
            console.log('Error in getPaymentInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi lấy thông tin thanh toán: ' + e.message,
                data: null
            });
        }
    });
};

module.exports = {
    userRegister,
    userLogin,
    getAccountInfo,
    loadAccountInfo,
    verifyToken,
    userLogout,
    changeAccountStatus,
    changeAccountInfo,
    changePassword,
    getPaymentInfo,
};