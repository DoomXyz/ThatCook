'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CartItem extends Model { }

    CartItem.init({
        CartItemID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        ItemQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ItemPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        AccountID: {
            type: DataTypes.CHAR(10),
            allowNull: false,
        },
        ProductID: {
            type: DataTypes.CHAR(10),
            allowNull: false,
        },
        ProductDetailID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'CartItem',
        tableName: 'CartItem',
        timestamps: false,
    });

    return CartItem;
};