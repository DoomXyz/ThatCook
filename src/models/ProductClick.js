'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductClick extends Model {
    static associate(models) {
      ProductClick.belongsTo(models.Product, { foreignKey: 'ProductID' });
      ProductClick.belongsTo(models.Account, { foreignKey: 'AccountID' });
    }
  }

  ProductClick.init(
    {
      ClickID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProductID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      AccountID: {
        type: DataTypes.STRING(42),
        allowNull: true,
      },
      ClickedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'ProductClick',
      tableName: 'ProductClick',
      timestamps: false,
      indexes: [
        { fields: ['ProductID'], name: 'idx_product_id' },
        { fields: ['AccountID'], name: 'idx_account_id' },
        { fields: ['ClickedAt'], name: 'idx_clicked_at' },
      ],
    }
  );

  return ProductClick;
};
