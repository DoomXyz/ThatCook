'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AllCodes extends Model {
    static associate(models) {
      // Không có mối quan hệ trực tiếp, nhưng được tham chiếu bởi nhiều bảng
    }
  }

  AllCodes.init(
    {
      CodeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Type: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      Code: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      CodeValueVI: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ExtraValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AllCodes',
      tableName: 'AllCodes',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['Type', 'Code'], name: 'unique_type_code' },
        { fields: ['Type'], name: 'index_type' },
      ],
    }
  );

  return AllCodes;
};