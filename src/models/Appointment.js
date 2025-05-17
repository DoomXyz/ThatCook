'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {}

  Appointment.init(
    {
      AppointmentID: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      CustomerName: {
        type: DataTypes.CHAR(50),
        allowNull: false,
      },
      CustomerEmail: {
        type: DataTypes.CHAR(100),
        allowNull: false,
      },
      CustomerPhone: {
        type: DataTypes.CHAR(11),
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
      AppointmentStatus: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'AppointmentStatus')
        allowNull: true,
      },
      AccountID: {
        type: DataTypes.CHAR(10),
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
      PetID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      AppointmentType:{
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'AppointmentType')
        allowNull: false,
      },
      PrevAppointmentID: {
        type: DataTypes.CHAR(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Appointment',
      tableName: 'Appointment',
      timestamps: false,
    }
  );

  return Appointment;
};
