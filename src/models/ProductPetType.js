'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductPetType extends Model {}

  ProductPetType.init(
    {
      ProductPetTypeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProductID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      PetType: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'PetType')
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ProductPetType',
      tableName: 'ProductPetType',
      timestamps: false,
    }
  );

  return ProductPetType;
};
