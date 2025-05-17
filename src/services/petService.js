import { raw } from 'body-parser';
import db from '../models/index';
import { Op, where } from 'sequelize';
import { checkPetType, checkPetGender } from './utilitiesService';

let validatePetInput = async (petInfo) => {
    if (!petInfo.petname) {
        return {
            errCode: -1,
            errMessage: 'Tên thú cưng trống!',
            data: null,
        };
    } else {
        const petName = petInfo.petname.trim();
        const petNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
        if (!petNameRegex.test(petName)) {
            return {
                errCode: 1,
                errMessage: 'Tên thú cưng không hợp lệ!',
                data: null,
            };
        }
    }
    let validPetType = await checkPetType(petInfo.pettype);
    if (!validPetType) {
        return {
            errCode: 1,
            errMessage: 'Loại thú cưng không hợp lệ!',
            data: null,
        };
    }
    let validPetGender = await checkPetGender(petInfo.petgender);
    if (!validPetGender) {
        return {
            errCode: 1,
            errMessage: 'Giới tính thú cưng không hợp lệ!',
            data: null,
        };
    }
    return null;
};

let generateGuestID = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const prefix = 'G';
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
                    errMessage: 'Tạo mã khách hàng thất bại!',
                    data: null,
                });
            }
            resolve(accountId);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo mã khách hàng: ' + e.message,
                data: null,
            });
        }
    });
};
let generatePetID = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const prefix = 'P';
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
                    errMessage: 'Tạo mã khách hàng thất bại!',
                    data: null,
                });
            }
            resolve(accountId);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo mã khách hàng: ' + e.message,
                data: null,
            });
        }
    });
};

let getPetInfo = (accountid) => {
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
            let data
            if (accountid !== "ALL") {
                const account = await db.Account.findOne({
                    where: { AccountID: accountid },
                    raw: false,
                });
                if (!account) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Người dùng không tồn tại!',
                        data: null,
                    });
                    return;
                }
                data = await db.Pet.findAll({
                    where: { AccountID: accountid },
                    attributes: {
                        exclude: ['AccountID'],
                    },
                    raw: true
                })
            } else {
                data = await db.Pet.findAll({
                    attributes: {
                        exclude: ['AccountID'],
                    },
                    raw: true
                })
            }
            if (!data) {
                resolve({
                    errCode: 2,
                    errMessage: 'Không tìm thấy thú cưng phù hợp!',
                    data: null,
                });
                return;
            }
            resolve({
                errCode: 0,
                errMessage: 'Lấy thông tin thú cưng thành công!',
                data,
            });
        } catch (e) {
            console.log('Error in getPetInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lấy thông tin pet: ${e.message}`,
                data: null,
            });
        }
    });
};

let savePetInfo = (accountid, petInfo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!petInfo) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            let guestID
            if (!accountid) {
                const GuestID = await generateGuestID();
                if (typeof GuestID === 'object' && GuestID.errCode) {
                    resolve(GuestID);
                    return;
                }
                guestID = GuestID;
            }
            let isValidateInput = await validatePetInput(petInfo);
            if (isValidateInput) {
                resolve(isValidateInput);
                return;
            }
            const PetID = await generatePetID();
            if (typeof PetID === 'object' && PetID.errCode) {
                resolve(PetID);
                return;
            }
            await db.Pet.create({
                PetID,
                PetName: petInfo.petname,
                AccountID: accountid ? accountid : guestID,
                PetType: petInfo.pettype,
                PetGender: petInfo.petgender,
                PetWeight: petInfo.petweight ? parseFloat(petInfo.petweight) : 0,
                Age: petInfo.age ? parseInt(petInfo.age) : 0
            });
            const data = {
                guestID,
                PetID,
            }
            resolve({
                errCode: 0,
                errMessage: 'Lưu thú cưng thành công!',
                data,
            });
        } catch (e) {
            console.log('Error in createBanner: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi tạo banner: ${e.message}`,
                data: null,
            });
        }
    });
};

module.exports = {
    getPetInfo,
    savePetInfo,
};
