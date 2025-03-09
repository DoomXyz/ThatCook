import db from '../models/index';
import bcrypt from 'bcrypt';

let saltRounds = 10;

let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.Password)
            await db.TaiKhoans.create({
                MATK: "Test",
                Email: data.Email,
                Password: hashPasswordFromBcrypt,
                HoTen: data.HoTen,
                GioiTinh: data.GioiTinh === '1' ? true : false,
                SDT: data.SDT,
                DiaChi: data.DiaChi,
                MALOAITK: data.MALOAITK
            })
            resolve('Thêm thành công')
        } catch (e) {
            reject(e);
        }
    })
}

let hashUserPassword = (password) => {
    return new Promise((resolve, reject) => {
        try {
            let salt = bcrypt.genSaltSync(saltRounds);
            let hashPassword = bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = db.TaiKhoans.findAll({
                raw: true,
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
}