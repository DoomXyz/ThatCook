'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Room extends Model {
        static associate(models) {
            Room.hasMany(models.Message, { foreignKey: 'RoomID' });
            Room.hasMany(models.RoomMember, { foreignKey: 'RoomID' });
        }
    }

    Room.init(
        {
            RoomID: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: false,
                allowNull: false,
            },
            RoomName: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            LastMessage: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            LastMessageTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            CreatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Room',
            tableName: 'Room',
            timestamps: false,
            indexes: [
                { fields: ['RoomID'], name: 'index_room_id' },
                { fields: ['RoomName'], name: 'index_room_name' },
                { fields: ['LastMessage'], name: 'index_last_message' },
                { fields: ['LastMessageTime'], name: 'index_last_message_time' },
            ],
        }
    );

    return Room;
};