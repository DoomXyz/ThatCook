'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Account, { foreignKey: 'AccountID' });
      Appointment.belongsTo(models.Account, { foreignKey: 'VeterinarianID', as: 'Veterinarian' });
      Appointment.belongsTo(models.Service, { foreignKey: 'ServiceID' });
      Appointment.belongsTo(models.Pet, { foreignKey: 'PetID' });
      Appointment.hasOne(models.AppointmentBill, { foreignKey: 'AppointmentID' });
      Appointment.hasOne(models.Schedule, { foreignKey: 'AppointmentID' });
      Appointment.hasMany(models.Image, { foreignKey: 'ReferenceID', constraints: false, scope: { ReferenceType: 'Appointment' } });
    }
  }

  Appointment.init(
    {
      AppointmentID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      CustomerName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      CustomerEmail: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      CustomerPhone: {
        type: DataTypes.STRING(11),
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
        allowNull: false,
      },
      AppointmentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'AppointmentStatus')
      },
      AccountID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      VeterinarianID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      ServiceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PetID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      AppointmentType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'AppointmentType')
      },
      PrevAppointmentID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Appointment',
      tableName: 'Appointment',
      timestamps: false,
      indexes: [
        { fields: ['AccountID'], name: 'index_account_id' },
        { fields: ['VeterinarianID'], name: 'index_veterinarian_id' },
        { fields: ['ServiceID'], name: 'index_service_id' },
        { fields: ['PetID'], name: 'index_pet_id' },
        { fields: ['AppointmentDate'], name: 'index_appointment_date' },
      ],
    }
  );

  return Appointment;
};