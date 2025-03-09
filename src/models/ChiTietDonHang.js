'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ChiTietDonHang extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    ChiTietDonHang.init({
        MADH: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false
        },
        MASP: DataTypes.STRING(10),
        SoLuong: DataTypes.INTEGER,
        GiaBanRa: DataTypes.FLOAT
    }, {
        sequelize,
        modelName: 'ChiTietDonHang',
    });
    return ChiTietDonHang;
};