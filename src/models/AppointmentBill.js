'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AppointmentBill extends Model {
    static associate(models) {
      AppointmentBill.belongsTo(models.Appointment, { foreignKey: 'AppointmentID' });
    }
  }

  AppointmentBill.init(
    {
      AppointmentBillID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      AppointmentID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      ServicePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      MedicalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      TotalPayment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      MedicalImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      MedicalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'AppointmentBill',
      tableName: 'AppointmentBill',
      timestamps: false,
      indexes: [
        { fields: ['AppointmentID'], name: 'index_appointment_id' },
      ],
    }
  );

  return AppointmentBill;
};