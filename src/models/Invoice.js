'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Invoice extends Model { }

    Invoice.init({
        InvoiceID: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false,
        },
        ReceiverName: {
            type: DataTypes.CHAR(50),
            allowNull: false,
        },
        ReceiverPhone: {
            type: DataTypes.CHAR(11),
            allowNull: false,
        },
        ReceiverAddress: {
            type: DataTypes.CHAR(100),
            allowNull: false,
        },
        TotalQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        TotalPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        DiscountAmount: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        TotalPayment: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        CreatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        CanceledAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        CancelReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        PaymentStatus: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'PaymentStatus')
            allowNull: true,
        },
        ShippingStatus: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'ShippingStatus')
            allowNull: true,
        },
        PaymentType: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'PaymentType')
            allowNull: true,
        },
        ShippingMethod: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'ShippingMethod')
            allowNull: true,
        },
        CouponID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        AccountID: {
            type: DataTypes.CHAR(10),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Invoice',
        tableName: 'Invoice',
        timestamps: false,
    });
    return Invoice;
};