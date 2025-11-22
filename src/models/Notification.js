'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.Account, { foreignKey: 'AccountID' });
        }
    }

    Notification.init(
        {
            NotifID: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            NotifDescription: {
                type: DataTypes.TEXT,
                allowNull: false,
                collate: 'utf8mb4_bin',
            },
            CreatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            ExtraValue: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            ReceiveNotifID: {
                type: DataTypes.STRING(42),
                allowNull: true,
            },
            AccountID: {
                type: DataTypes.STRING(42),
                allowNull: false,
            },
            RoleReceive: {
                type: DataTypes.STRING(20),
                allowNull: true,
                // Liên kết với Code từ ALLCODES (Type = 'AccountType')
            },
            NotifType: {
                type: DataTypes.STRING(20),
                allowNull: false,
                // Liên kết với Code từ ALLCODES (Type = 'NotifType')
            },
            NotifStatus: {
                type: DataTypes.STRING(20),
                allowNull: false,
                // Liên kết với Code từ ALLCODES (Type = 'NotifStatus')
            },
        },
        {
            sequelize,
            modelName: 'Notification',
            tableName: 'Notification',
            timestamps: false,
            indexes: [
                { fields: ['AccountID'], name: 'index_accountid' },
                { fields: ['ReceiveNotifID'], name: 'index_receivenotifid' },
                { fields: ['RoleReceive'], name: 'index_rolereceive' },
            ],
        }
    );

    return Notification;
};