import db from '../models/index';
import { generateID, checkValidAllCode } from './utilitiesService';

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

let deleteUnlinkedDeletedPets = () => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            // Tìm thú cưng có PetStatus là 'DELET'
            const deletedPets = await db.Pet.findAll({
                where: {
                    PetStatus: 'DELET'
                },
                attributes: ['PetID'],
                raw: true,
                transaction,
            });
            if (!deletedPets || deletedPets.length === 0) {
                await transaction.commit();
                resolve({
                    errCode: 0,
                    errMessage: 'Không tìm thấy thú cưng đã xóa nào để xóa!',
                    data: null
                });
                return;
            }
            const petIDs = deletedPets.map(pet => pet.PetID);
            const appointments = await db.Appointment.findAll({
                where: { PetID: { [db.Sequelize.Op.in]: petIDs } },
                attributes: ['PetID'],
                raw: true,
                transaction,
            });
            const petsToDelete = deletedPets.filter(
                pet => !appointments.some(appointment => appointment.PetID === pet.PetID)
            );
            if (petsToDelete.length === 0) {
                await transaction.commit();
                resolve({
                    errCode: 0,
                    errMessage: 'Không có thú cưng đã xóa nào cần xóa!',
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
                errMessage: 'Xóa thú cưng đã xóa thành công!',
                data: null
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Lỗi trong deleteUnlinkedDeletedPets: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi xóa thú cưng: ${e.message}`,
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
        const validPetType = await checkValidAllCode('PetType', pettype);
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
        const validPetGender = await checkValidAllCode('PetGender', petgender);
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
            await deleteUnlinkedDeletedPets();
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
            await deleteUnlinkedDeletedPets();
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
            await deleteUnlinkedDeletedPets();
            const isValidateInput = await validatePetInput(petInfo);
            if (isValidateInput) {
                await transaction.rollback();
                resolve(isValidateInput);
                return;
            }
            let guestID = null;
            if (!accountid) {
                const guestIdResult = await generateID('G', 9, 'Account', 'AccountID');
                if (guestIdResult.errCode !== 0) {
                    await transaction.rollback();
                    resolve(guestIdResult);
                    return;
                }
                guestID = guestIdResult.data;
            } else {
                const existingPets = await db.Pet.findAll({
                    where: { AccountID: accountid, PetStatus: 'VALID' },
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
            const petIdResult = await generateID('P', 9, 'Pet', 'PetID');
            if (petIdResult.errCode !== 0) {
                await transaction.rollback();
                resolve(petIdResult);
                return;
            }
            const petID = petIdResult.data;
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