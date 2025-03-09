'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaiKhoans extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TaiKhoans.init({
    MATK: {
      type: DataTypes.CHAR(10),
      primaryKey: true,
      allowNull: false
    },
    Email: DataTypes.STRING(100),
    Password: DataTypes.STRING(30),
    HoTen: DataTypes.STRING(100),
    GioiTinh: DataTypes.BOOLEAN,
    SDT: DataTypes.STRING(11),
    DiaChi: DataTypes.TEXT,
    MALOAITK: DataTypes.STRING(10)
  }, {
    sequelize,
    modelName: 'TaiKhoans',
  });
  return TaiKhoans;
};