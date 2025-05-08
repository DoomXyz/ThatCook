'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Service extends Model { }

    Service.init({
        ServiceID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        ServiceName: {
            type: DataTypes.CHAR(50),
            allowNull: false,
        },
        Price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        Duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Service',
        tableName: 'Service',
        timestamps: false,
    });

    return Service;
};