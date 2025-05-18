'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BlacklistToken extends Model {
    static associate(models) {
      // Không có mối quan hệ trực tiếp với các bảng khác
    }
  }

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
        type: DataTypes.STRING(10),
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
      indexes: [
        { fields: ['Token'], name: 'index_token' },
      ],
    }
  );

  return BlacklistToken;
};