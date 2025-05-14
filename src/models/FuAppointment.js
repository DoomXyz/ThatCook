'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FuAppointment extends Model {}

  FuAppointment.init(
    {
      FuAppointmentID: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      AppointmentID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      AppointmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      StartTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      EndTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      Notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      FuAppointmentStatus: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'FuAppointmentStatus')
        allowNull: true,
      },
      ServiceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'FuAppointment',
      tableName: 'FuAppointment',
      timestamps: false,
    }
  );

  return FuAppointment;
};
