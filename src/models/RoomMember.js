'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RoomMember extends Model {
        static associate(models) {
            RoomMember.belongsTo(models.Account, { foreignKey: 'AccountID' });
            RoomMember.belongsTo(models.Room, { foreignKey: 'RoomID' });
        }
    }

    RoomMember.init(
        {
            RoomMemberID: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            AccountID: {
                type: DataTypes.STRING(42),
                allowNull: false,
            },
            RoomID: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'RoomMember',
            tableName: 'RoomMember',
            timestamps: false,
            indexes: [
                { fields: ['RoomMemberID'], name: 'index_message_id' },
                { fields: ['AccountID'], name: 'index_account_id' },
                { fields: ['RoomID'], name: 'index_room_id' },
            ],
        }
    );

    return RoomMember;
};