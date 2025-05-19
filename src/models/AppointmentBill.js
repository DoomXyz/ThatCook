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
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      AppointmentID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      PaymentType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'PaymentType')
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