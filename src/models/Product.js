'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model { }

    Product.init({
        ProductID: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false,
        },
        ProductType: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'ProductType')
            allowNull: false,
        },
        ProductName: {
            type: DataTypes.CHAR(100),
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
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'Product',
        timestamps: false,
    });

    return Product;
};