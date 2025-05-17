'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VeterinarianService extends Model {}

  VeterinarianService.init(
    {
      VeterinarianServiceID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VeterinarianID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      ServiceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'VeterinarianService',
      tableName: 'VeterinarianService',
      timestamps: false,
    }
  );

  return VeterinarianService;
};
