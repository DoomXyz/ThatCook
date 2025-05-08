'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductDetail extends Model { }

    ProductDetail.init({
        ProductDetailID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        DetailName: {
            type: DataTypes.CHAR(50),
            allowNull: false,
        },
        Stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        SoldCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ExtraPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        Promotion: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        CreatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        DetailStatus: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'DetailStatus')
            allowNull: true,
        },
        ProductID: {
            type: DataTypes.CHAR(10),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'ProductDetail',
        tableName: 'ProductDetail',
        timestamps: false,
    });

    return ProductDetail;
};