'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.Product, { foreignKey: 'ReferenceID', constraints: false, scope: { ReferenceType: 'Product' } });
      Image.belongsTo(models.Appointment, { foreignKey: 'ReferenceID', constraints: false, scope: { ReferenceType: 'Appointment' } });
    }
  }

  Image.init(
    {
      ImageID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ReferenceType: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      ReferenceID: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Image',
      tableName: 'Image',
      timestamps: false,
      indexes: [
        { fields: ['ReferenceType', 'ReferenceID'], name: 'index_reference' },
      ],
    }
  );

  return Image;
};