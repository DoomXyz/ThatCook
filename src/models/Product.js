'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.ProductDetail, { foreignKey: 'ProductID' });
      Product.hasMany(models.ProductPetType, { foreignKey: 'ProductID' });
      Product.hasMany(models.Banner, { foreignKey: 'ProductID' });
      Product.hasMany(models.InvoiceDetail, { foreignKey: 'ProductID' });
      Product.hasMany(models.CartItem, { foreignKey: 'ProductID' });
      Product.hasMany(models.Image, { foreignKey: 'ReferenceID', constraints: false, scope: { ReferenceType: 'Product' } });
    }
  }

  Product.init(
    {
      ProductID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      ProductType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'ProductType')
      },
      ProductName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      ProductPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      ProductImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ProductDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'Product',
      timestamps: false,
      indexes: [
        { fields: ['ProductName'], name: 'index_product_name' },
        { fields: ['ProductType'], name: 'index_product_type' },
      ],
    }
  );

  return Product;
};