'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AiSetting extends Model {
    static associate(models) {
      AiSetting.belongsTo(models.Account, { foreignKey: 'AccountID' });
    }
  }

  AiSetting.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      AccountID: {
        type: DataTypes.STRING(42),
        allowNull: false,
      },
      GroqApiKey: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'AiSetting',
      tableName: 'AiSetting',
      timestamps: false,
      indexes: [{ unique: true, fields: ['AccountID'], name: 'unique_account_ai_setting' }],
    }
  );

  return AiSetting;
};
