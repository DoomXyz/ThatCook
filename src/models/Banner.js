'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Banner extends Model { }

    Banner.init({
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
            allowNull: true,
        },
        HiddenAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        BannerStatus: {
            type: DataTypes.CHAR(20), // Liên kết với Code từ ALLCODES (Type = 'BannerStatus')
            allowNull: true,
        },
        ProductID: {
            type: DataTypes.CHAR(10),
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Banner',
        tableName: 'Banner',
        timestamps: false,
    });

    return Banner;
};