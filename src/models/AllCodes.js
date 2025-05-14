'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AllCode extends Model {}

  AllCode.init(
    {
      CodeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Type: {
        type: DataTypes.CHAR(30),
        allowNull: false,
      },
      Code: {
        type: DataTypes.CHAR(20),
        allowNull: false,
      },
      CodeValueVI: {
        type: DataTypes.CHAR(50),
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
      tableName: 'ALLCODES',
      timestamps: false,
    }
  );

  return AllCode;
};
