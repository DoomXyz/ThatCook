'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BlacklistToken extends Model { }

  BlacklistToken.init(
    {
      TokenID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ExtraValue: {
        type: DataTypes.CHAR(10),
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ExpiredAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'BlacklistToken',
      tableName: 'BlacklistToken',
      timestamps: false,
    }
  );

  return BlacklistToken;
};
