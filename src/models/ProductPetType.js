'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductPetType extends Model {
    static associate(models) {
      ProductPetType.belongsTo(models.Product, { foreignKey: 'ProductID' });
    }
  }

  ProductPetType.init(
    {
      ProductPetTypeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProductID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      PetType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'PetType')
      },
    },
    {
      sequelize,
      modelName: 'ProductPetType',
      tableName: 'ProductPetType',
      timestamps: false,
      indexes: [
        { fields: ['ProductID'], name: 'index_product_id' },
      ],
    }
  );

  return ProductPetType;
};