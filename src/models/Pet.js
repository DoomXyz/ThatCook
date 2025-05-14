'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pet extends Model {}

  Pet.init(
    {
      PetID: {
        type: DataTypes.CHAR(10),
        primaryKey: true,
        allowNull: false,
      },
      PetName: {
        type: DataTypes.CHAR(50),
        allowNull: false,
      },
      AccountID: {
        type: DataTypes.CHAR(10),
        allowNull: false,
      },
      PetType: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'PetType')
        allowNull: false,
      },
      Age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PetGender: {
        type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'PetGender')
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Pet',
      tableName: 'Pet',
      timestamps: false,
    }
  );

  return Pet;
};
