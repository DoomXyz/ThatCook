'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {}

  Image.init(
    {
      ImageID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ProductID: {
        type: DataTypes.CHAR(10),
        allowNull: true,
      },
      AppointmentID: {
        type: DataTypes.CHAR(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Image',
      tableName: 'Image',
      timestamps: false,
    }
  );

  return Image;
};
