'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.Invoice, { foreignKey: 'CouponID' });
    }
  }

  Coupon.init(
    {
      CouponID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      CouponCode: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      CouponDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      MinOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      DiscountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      MaxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      StartDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      EndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      DiscountType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'DiscountType')
      },
      CouponStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'CouponStatus')
      },
    },
    {
      sequelize,
      modelName: 'Coupon',
      tableName: 'Coupon',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['CouponCode'], name: 'unique_coupon_code' },
        { fields: ['StartDate', 'EndDate'], name: 'index_date_range' },
      ],
    }
  );

  return Coupon;
};