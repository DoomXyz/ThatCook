'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Coupon extends Model { }

    Coupon.init({
        CouponID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        CouponCode: {
            type: DataTypes.CHAR(100),
            allowNull: false,
        },
        CouponDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        MinOrderValue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        DiscountValue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        MaxDiscount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        StartDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        EndDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        DiscountType: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'DiscountType')
            allowNull: false,
        },
        CouponStatus: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'CouponStatus')
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Coupon',
        tableName: 'Coupon',
        timestamps: false,
    });

    return Coupon;
};