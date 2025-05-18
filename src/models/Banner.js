'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      Banner.belongsTo(models.Product, { foreignKey: 'ProductID' });
    }
  }

  Banner.init(
    {
      BannerID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      BannerImage: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      HiddenAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      BannerStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // Liên kết với Code từ ALLCODES (Type = 'BannerStatus')
      },
      ProductID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Banner',
      tableName: 'Banner',
      timestamps: false,
      indexes: [
        { fields: ['ProductID'], name: 'index_product_id' },
      ],
    }
  );

  return Banner;
};