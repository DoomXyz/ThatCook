'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AppointmentBill extends Model {}

  AppointmentBill.init(
    {
      AppointmentBillID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      AppointmentID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      PaymentType: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'PaymentType')
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
    },
    {
      sequelize,
      modelName: 'AppointmentBill',
      tableName: 'AppointmentBill',
      timestamps: false,
    }
  );

  return AppointmentBill;
};
