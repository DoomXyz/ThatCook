import { where } from 'sequelize';
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

let getTaiKhoanMATK = (maTK) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.TaiKhoans.findOne({
                where: { MATK: maTK },
                raw: true
            })
            if (user) {
                resolve(user)
            } else {
                resolve({})
            }
        } catch (e) {
            reject(e);
        }
    })
}

let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.TaiKhoans.findOne({
                where: { MATK: data.MATK },
            })
            if (user) {
                user.HoTen = data.HoTen;
                user.SDT = data.SDT;
                user.DiaChi = data.DiaChi;
                await user.save();
                let allUsers = await db.TaiKhoans.findAll();
                resolve(allUsers);
            } else {
                resolve();
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getTaiKhoanMATK: getTaiKhoanMATK,
    updateUser: updateUser,
}