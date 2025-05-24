'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductDetail extends Model {
    static associate(models) {
      ProductDetail.belongsTo(models.Product, { foreignKey: 'ProductID' });
      ProductDetail.hasMany(models.InvoiceDetail, { foreignKey: 'ProductDetailID' });
      ProductDetail.hasMany(models.CartItem, { foreignKey: 'ProductDetailID' });
    }
  }

  ProductDetail.init(
    {
      ProductDetailID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      DetailName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      Stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      SoldCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ExtraPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Promotion: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      DetailStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'DetailStatus')
      },
      ProductID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ProductDetail',
      tableName: 'ProductDetail',
      timestamps: false,
      indexes: [
        { fields: ['ProductID'], name: 'index_product_id' },
      ],
    }
  );

  return ProductDetail;
};