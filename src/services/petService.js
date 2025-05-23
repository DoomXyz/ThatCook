import { raw } from 'body-parser';
import db from '../models/index';
import { checkPetType, checkPetGender } from './utilitiesService';

let deleteUnlinkedGuestPets = () => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            // Tìm thú cưng khách vãng lai (AccountID bắt đầu bằng 'G')
            const guestPets = await db.Pet.findAll({
                where: {
                    AccountID: { [db.Sequelize.Op.like]: 'G%' },
                },
                attributes: ['PetID'],
                raw: true,
                transaction,
            });
            if (!guestPets || guestPets.length === 0) {
                await transaction.commit();
                resolve({
                    errCode: 0,
                    errMessage: 'Không tìm thấy thú cưng khách vãng lai nào để xóa!',
                    data: null
                });
                return;
            }
            const petIDs = guestPets.map(thucung => thucung.PetID);
            const appointments = await db.Appointment.findAll({
                where: { PetID: { [db.Sequelize.Op.in]: petIDs } },
                attributes: ['PetID'],
                raw: true,
                transaction,
            });
            const petsToDelete = guestPets.filter(
                pet => !appointments.some(appointment => appointment.PetID === pet.PetID)
            );
            if (petsToDelete.length === 0) {
                await transaction.commit();
                resolve({
                    errCode: 0,
                    errMessage: 'Không có thú cưng khách vãng lai nào cần xóa!',
                    data: null
                });
                return;
            }
            const petIDsToDelete = petsToDelete.map(pet => pet.PetID);
            await db.Pet.destroy({
                where: { PetID: { [db.Sequelize.Op.in]: petIDsToDelete } },
                transaction,
            });
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Xóa thú cưng khách vãng lai thành công!',
                data: null
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Lỗi trong deleteUnlinkedGuestPets: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi xóa thú cưng khách vãng lai: ${e.message}`,
                data: null,
            });
        }
    });
};

let validatePetInput = async (petInfo) => {
    if (!petInfo || Object.keys(petInfo).length === 0) {
        return {
            errCode: -1,
            errMessage: 'Thiếu thông tin thú cưng!',
            data: null,
        };
    }
    const { petname, pettype, petgender, petweight, age } = petInfo;
    if (!petname?.trim() || petname.trim().length > 50) {
        return {
            errCode: -1,
            errMessage: 'Tên thú cưng trống hoặc vượt quá 50 ký tự!',
            data: null,
        };
    } else {
        const petName = petname.trim();
        const petNameRegex = /^[A-Za-zÀ-ỹ0-9\s]{2,50}$/;
        if (!petNameRegex.test(petName)) {
            return {
                errCode: 1,
                errMessage: 'Tên thú cưng không hợp lệ!',
                data: null,
            };
        }
    }
    if (!pettype) {
        return {
            errCode: -1,
            errMessage: 'Loại thú cưng không được để trống!',
            data: null,
        };
    } else {
        const validPetType = await checkPetType(pettype);
        if (!validPetType) {
            return {
                errCode: 1,
                errMessage: 'Loại thú cưng không hợp lệ!',
                data: null,
            };
        }
    }
    if (!petgender) {
        return {
            errCode: -1,
            errMessage: 'Giới tính thú cưng không được để trống!',
            data: null,
        };
    } else {
        const validPetGender = await checkPetGender(petgender);
        if (!validPetGender) {
            return {
                errCode: 1,
                errMessage: 'Giới tính thú cưng không hợp lệ!',
                data: null,
            };
        }
    }
    if (!petweight || isNaN(petweight) || petweight <= 0 || petweight > 999.99) {
        return {
            errCode: 1,
            errMessage: 'Cân nặng thú cưng không hợp lệ (phải từ 0.01 đến 999.99)!',
            data: null,
        };
    }
    if (age === undefined || isNaN(age) || age < 0 || age > 999) {
        return {
            errCode: 1,
            errMessage: 'Tuổi thú cưng không hợp lệ (phải từ 0 đến 999)!',
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
            let petId = `${prefix}${timestampDigits}`;
            // Kiểm tra xem petId có trùng trong DB không
            let existingPet = await db.Pet.findOne({
                where: { PetID: petId },
            });
            // Nếu trùng, thử lại với timestamp mới (tối đa 5 lần)
            let attempts = 0;
            while (existingPet && attempts < 5) {
                const newTimestamp = Date.now().toString();
                const newTimestampDigits = newTimestamp.slice(-9);
                petId = `${prefix}${newTimestampDigits}`;
                attempts++;
                existingPet = await db.Pet.findOne({
                    where: { PetID: petId },
                });
            }
            if (attempts >= 5) {
                resolve({
                    errCode: 1,
                    errMessage: 'Tạo mã thú cưng thất bại!',
                    data: null,
                });
            }
            resolve(petId);
        } catch (e) {
            console.log(e);
            resolve({
                errCode: 3,
                errMessage: 'Lỗi khi tạo mã thú cưng: ' + e.message,
                data: null,
            });
        }
    });
};

let getAccountPetInfo = (accountid) => {
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
            const data = await db.Pet.findAll({
                where: {
                    AccountID: accountid,
                    PetStatus: 'VALID'
                },
                attributes: ['PetID', 'PetName', 'PetType', 'PetWeight', 'Age', 'PetGender'],
                raw: true,
            });
            if (!data || data.length === 0) {
                resolve({
                    errCode: 0,
                    errMessage: 'Không tìm thấy thú cưng nào!',
                    data: [],
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

let getPetInfo = (petid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!petid) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            await deleteUnlinkedGuestPets();
            const data = await db.Pet.findOne({
                where: { PetID: petid },
                attributes: ['PetID', 'PetName', 'PetType', 'PetGender', 'Age', 'PetWeight'],
                raw: true,
            });
            if (!data) {
                resolve({
                    errCode: 2,
                    errMessage: 'Thú cưng không tồn tại!',
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
        const transaction = await db.sequelize.transaction();
        try {
            if (!petInfo) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu thông tin thú cưng!',
                    data: null,
                });
                return;
            }
            await deleteUnlinkedGuestPets();
            const isValidateInput = await validatePetInput(petInfo);
            if (isValidateInput) {
                await transaction.rollback();
                resolve(isValidateInput);
                return;
            }
            let guestID = null;
            if (!accountid) {
                const generatedGuestID = await generateGuestID();
                if (typeof generatedGuestID === 'object' && generatedGuestID.errCode) {
                    await transaction.rollback();
                    resolve(generatedGuestID);
                    return;
                }
                guestID = generatedGuestID;
            } else {
                const existingPets = await db.Pet.findAll({
                    where: { AccountID: accountid },
                    attributes: ['PetID', 'PetName', 'PetType', 'PetGender', 'Age', 'PetWeight'],
                    raw: true,
                    transaction,
                });
                const matchingPet = existingPets.find(
                    pet =>
                        pet.PetName === petInfo.petname.trim() &&
                        pet.PetType === petInfo.pettype &&
                        pet.PetGender === petInfo.petgender &&
                        pet.Age === parseInt(petInfo.age) &&
                        parseFloat(pet.PetWeight) === parseFloat(petInfo.petweight)
                );
                if (matchingPet) {
                    await transaction.rollback();
                    resolve({
                        errCode: 0,
                        errMessage: 'Thú cưng đã tồn tại, hãy chọn thú cưng hiện có!',
                        data: { PetID: matchingPet.PetID },
                    });
                    return;
                }
            }
            const petID = await generatePetID();
            if (typeof petID === 'object' && petID.errCode) {
                await transaction.rollback();
                resolve(petID);
                return;
            }
            await db.Pet.create(
                {
                    PetID: petID,
                    PetName: petInfo.petname.trim(),
                    AccountID: accountid || guestID,
                    PetType: petInfo.pettype,
                    PetGender: petInfo.petgender,
                    PetWeight: petInfo.petweight,
                    Age: petInfo.age,
                    PetStatus: "VALID"
                },
                { transaction }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Lưu thông tin thú cưng thành công!',
                data: { guestID, PetID: petID },
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in savePetInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi lưu thú cưng: ${e.message}`,
                data: null,
            });
        }
    });
};

let changePetInfo = (petid, petInfo) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!petid || !petInfo) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            const isValidateInput = await validatePetInput(petInfo);
            if (isValidateInput) {
                await transaction.rollback();
                resolve(isValidateInput);
                return;
            }
            const pet = await db.Pet.findOne({
                where: { PetID: petid },
                attributes: ['PetID', 'PetName', 'PetType', 'PetGender', 'Age', 'PetWeight'],
                transaction,
            });
            if (!pet) {
                await transaction.rollback();
                resolve({
                    errCode: 2,
                    errMessage: 'Thú cưng không tồn tại!',
                    data: null,
                });
                return;
            }
            let isUpdated = false;
            if (pet.PetName !== petInfo.petname.trim()) {
                pet.PetName = petInfo.petname.trim();
                isUpdated = true;
            }
            if (pet.PetType !== petInfo.pettype) {
                pet.PetType = petInfo.pettype;
                isUpdated = true;
            }
            if (pet.PetGender !== petInfo.petgender) {
                pet.PetGender = petInfo.petgender;
                isUpdated = true;
            }
            if (pet.Age !== parseInt(petInfo.age)) {
                pet.Age = parseInt(petInfo.age);
                isUpdated = true;
            }
            if (pet.PetWeight !== parseFloat(petInfo.petweight)) {
                pet.PetWeight = parseFloat(petInfo.petweight);
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
            await db.Pet.update(
                {
                    PetName: pet.PetName,
                    PetType: pet.PetType,
                    PetGender: pet.PetGender,
                    Age: pet.Age,
                    PetWeight: pet.PetWeight,
                },
                { where: { PetID: petid }, transaction }
            );

            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Cập nhật thông tin thú cưng thành công!',
                data: null,
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in changePetInfo: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi cập nhật thông tin: ${e.message}`,
                data: null,
            });
        }
    });
};

let removePet = (petid) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!petid) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu mã thú cưng!',
                    data: null,
                });
                return;
            }
            const pet = await db.Pet.findOne({
                where: {
                    PetID: petid,
                    PetStatus: 'VALID'
                },
                attributes: ['PetID', 'PetStatus'],
                raw: true,
                transaction,
            });
            if (!pet) {
                await transaction.rollback();
                resolve({
                    errCode: 2,
                    errMessage: 'Thú cưng không tồn tại hoặc đã bị xóa!',
                    data: null,
                });
                return;
            }
            await db.Pet.update(
                { PetStatus: 'DELET' },
                {
                    where: { PetID: petid },
                    transaction,
                }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Xóa thú cưng thành công!',
                data: null,
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in removePet: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi xóa thú cưng: ${e.message}`,
                data: null,
            });
        }
    });
};

module.exports = {
    getAccountPetInfo,
    getPetInfo,
    savePetInfo,
    changePetInfo,
    removePet,
};