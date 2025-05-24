'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Coupon, { foreignKey: 'CouponID' });
      Invoice.belongsTo(models.Account, { foreignKey: 'AccountID' });
      Invoice.hasMany(models.InvoiceDetail, { foreignKey: 'InvoiceID' });
    }
  }

  Invoice.init(
    {
      InvoiceID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      ReceiverName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ReceiverPhone: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      ReceiverAddress: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      TotalQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      TotalPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      DiscountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      TotalPayment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      CanceledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CancelReason: {
        type: DataTypes.STRING(20),
        allowNull: true,
        // Liên kết với Code từ ALLCODES (Type = 'CancelReason')
      },
      PaymentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'PaymentStatus')
      },
      ShippingStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'ShippingStatus')
      },
      PaymentType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'PaymentType')
      },
      ShippingMethod: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'ShippingMethod')
      },
      CouponID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AccountID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Invoice',
      tableName: 'Invoice',
      timestamps: false,
      indexes: [
        { fields: ['CouponID'], name: 'index_coupon_id' },
        { fields: ['AccountID'], name: 'index_account_id' },
      ],
    }
  );

  return Invoice;
};