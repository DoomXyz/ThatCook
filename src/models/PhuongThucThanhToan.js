'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PhuongThucThanhToan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    PhuongThucThanhToan.init({
        MALOAITT: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false
        },
        TenLoaiTT: DataTypes.STRING(50)
    }, {
        sequelize,
        modelName: 'PhuongThucThanhToan',
    });
    return PhuongThucThanhToan;
};