'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DonHang extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    DonHang.init({
        MADH: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false
        },
        MAKH: DataTypes.STRING(10),
        NgayLapDonHang: DataTypes.DATE,
        DiaChiNhanHang: DataTypes.TEXT,
        LoiNhan: DataTypes.TEXT,
        TongTien: DataTypes.FLOAT,
        TrangThai: DataTypes.BOOLEAN,
        MALOAITT: DataTypes.STRING(10)
    }, {
        sequelize,
        modelName: 'DonHang',
    });
    return DonHang;
};