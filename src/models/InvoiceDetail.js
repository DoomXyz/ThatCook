'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvoiceDetail extends Model {
    static associate(models) {
      InvoiceDetail.belongsTo(models.Invoice, { foreignKey: 'InvoiceID' });
      InvoiceDetail.belongsTo(models.Product, { foreignKey: 'ProductID' });
      InvoiceDetail.belongsTo(models.ProductDetail, { foreignKey: 'ProductDetailID' });
    }
  }

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
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      ProductID: {
        type: DataTypes.STRING(10),
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
      indexes: [
        { fields: ['InvoiceID'], name: 'index_invoice_id' },
        { fields: ['ProductID'], name: 'index_product_id' },
        { fields: ['ProductDetailID'], name: 'index_product_detail_id' },
      ],
    }
  );

  return InvoiceDetail;
};