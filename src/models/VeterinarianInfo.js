'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VeterinarianInfo extends Model {
    static associate(models) {
      VeterinarianInfo.belongsTo(models.Account, { foreignKey: 'AccountID' });
      VeterinarianInfo.hasMany(models.VeterinarianService, { foreignKey: 'VeterinarianID' });
    }
  }

  VeterinarianInfo.init(
    {
      AccountID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      Bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Specialization: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      WorkingStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'WorkingStatus')
      },
    },
    {
      sequelize,
      modelName: 'VeterinarianInfo',
      tableName: 'VeterinarianInfo',
      timestamps: false,
    }
  );

  return VeterinarianInfo;
};