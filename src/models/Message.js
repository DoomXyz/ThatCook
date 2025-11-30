'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Message extends Model {
        static associate(models) {
            Message.belongsTo(models.Account, { foreignKey: 'AccountID' });
            Message.belongsTo(models.Room, { foreignKey: 'RoomID' });
        }
    }

    Message.init(
        {
            MessageID: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            MessageType: {
                type: DataTypes.STRING(20),
                allowNull: false,
                // Liên kết với Code từ ALLCODES (Type = 'MessageType')
            },
            MessageText: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            SentAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            RoomID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            AccountID: {
                type: DataTypes.STRING(42),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Message',
            tableName: 'Message',
            timestamps: false,
            indexes: [
                { fields: ['MessageID'], name: 'index_message_id' },
                { fields: ['AccountID'], name: 'index_account_id' },
                { fields: ['RoomID'], name: 'index_room_id' },
                { fields: ['RoomID', 'ChatAt'], name: 'index_room_sentat' },
                { fields: ['RoomID', 'MessageID'], name: 'index_room_messageid' },
            ],
        }
    );

    return Message;
};