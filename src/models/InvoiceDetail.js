'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvoiceDetail extends Model {}

  InvoiceDetail.init(
    {
      InvoiceDetailID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ItemQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ItemPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      InvoiceID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      ProductID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      ProductDetailID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'InvoiceDetail',
      tableName: 'InvoiceDetail',
      timestamps: false,
    }
  );

  return InvoiceDetail;
};
