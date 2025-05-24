'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.hasMany(models.Appointment, { foreignKey: 'ServiceID' });
      Service.hasMany(models.VeterinarianService, { foreignKey: 'ServiceID' });
    }
  }

  Service.init(
    {
      ServiceID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ServiceName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      Price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ServiceStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'ServiceStatus')
      },
    },
    {
      sequelize,
      modelName: 'Service',
      tableName: 'Service',
      timestamps: false,
      indexes: [
        { fields: ['ServiceName'], name: 'index_service_name' },
      ],
    }
  );

  return Service;
};