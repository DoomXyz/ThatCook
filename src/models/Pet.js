'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pet extends Model {
    static associate(models) {
      Pet.belongsTo(models.Account, { foreignKey: 'AccountID' });
      Pet.hasMany(models.Appointment, { foreignKey: 'PetID' });
    }
  }

  Pet.init(
    {
      PetID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      PetName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      AccountID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      PetType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'PetType')
      },
      PetWeight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      Age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PetGender: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'PetGender')
      },
      PetStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'PetStatus')
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