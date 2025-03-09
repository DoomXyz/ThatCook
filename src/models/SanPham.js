'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SanPham extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    SanPham.init({
        MASP: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false
        },
        TenSanPham: DataTypes.STRING(50),
        SLTon: DataTypes.INTEGER,
        KhuyenMai: DataTypes.FLOAT,
        GiaBan: DataTypes.FLOAT,
        TinhTrang: DataTypes.BOOLEAN,
        MoTa: DataTypes.TEXT,
        HinhAnh: DataTypes.STRING,
        MALOAISP: DataTypes.STRING(10)
    }, {
        sequelize,
        modelName: 'SanPham',
    });
    return SanPham;
};