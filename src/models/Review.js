'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Account, { foreignKey: 'AccountID' });
      Review.belongsTo(models.Product, { foreignKey: 'ProductID' });
    }
  }

  Review.init(
    {
      ReviewID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      AccountID: { type: DataTypes.STRING(42), allowNull: false },
      ProductID: { type: DataTypes.STRING(10), allowNull: false },
      Rating: { type: DataTypes.INTEGER, allowNull: false },
      Comment: { type: DataTypes.TEXT, allowNull: true },
      ReviewImages: { type: DataTypes.TEXT('long'), allowNull: true },
      CreatedAt: { type: DataTypes.DATE, allowNull: false }
    },
    {
      sequelize,
      modelName: 'Review',
      tableName: 'Review',
      timestamps: false,
      indexes: [
        { fields: ['AccountID'], name: 'index_review_account_id' },
        { fields: ['ProductID'], name: 'index_review_product_id' }
      ]
    }
  );

  return Review;
};
