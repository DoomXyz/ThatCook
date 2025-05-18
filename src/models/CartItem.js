'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Account, { foreignKey: 'AccountID' });
      CartItem.belongsTo(models.Product, { foreignKey: 'ProductID' });
      CartItem.belongsTo(models.ProductDetail, { foreignKey: 'ProductDetailID' });
    }
  }

  CartItem.init(
    {
      CartItemID: {
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
      AccountID: {
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
      modelName: 'CartItem',
      tableName: 'CartItem',
      timestamps: false,
      indexes: [
        { fields: ['AccountID'], name: 'index_account_id' },
        { fields: ['ProductID'], name: 'index_product_id' },
        { fields: ['ProductDetailID'], name: 'index_product_detail_id' },
      ],
    }
  );

  return CartItem;
};