'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VeterinarianInfo extends Model { }

    VeterinarianInfo.init({
        AccountID: {
            type: DataTypes.CHAR(10),
            primaryKey: true,
            allowNull: false,
        },
        Bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        Specialization: {
            type: DataTypes.CHAR(50),
            allowNull: true,
        },
        WorkingStatus: {
            type: DataTypes.CHAR(20), // Liên kết với CodeID từ ALLCODES (Type = 'WorkingStatus')
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'VeterinarianInfo',
        tableName: 'VeterinarianInfo',
        timestamps: false,
    });

    return VeterinarianInfo;
};