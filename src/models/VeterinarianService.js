'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VeterinarianService extends Model {
    static associate(models) {
      VeterinarianService.belongsTo(models.Account, { foreignKey: 'VeterinarianID' });
      VeterinarianService.belongsTo(models.Service, { foreignKey: 'ServiceID' });
      VeterinarianService.belongsTo(models.VeterinarianInfo, { foreignKey: 'VeterinarianID' });
    }
  }

  VeterinarianService.init(
    {
      VeterinarianServiceID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VeterinarianID: {
        type: DataTypes.STRING(10),
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
      indexes: [
        { fields: ['VeterinarianID'], name: 'index_veterinarian_id' },
        { fields: ['ServiceID'], name: 'index_service_id' },
      ],
    }
  );

  return VeterinarianService;
};