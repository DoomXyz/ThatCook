import db from '../models/index';
const { Op } = require('sequelize');

let createRoom = async (SendID, ReceiveID) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            if (!SendID || !ReceiveID) {
                await transaction.rollback();
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu tham số!',
                    data: null,
                });
                return;
            }
            if (SendID === ReceiveID) {
                await transaction.rollback();
                return resolve({
                    errCode: 1,
                    errMessage: 'Không thể tạo phòng chat với chính mình!',
                    data: null,
                });
            }
            const [senderRoom, receiverRoom] = await Promise.all([
                db.RoomMember.findAll({
                    where: { AccountID: SendID },
                    attributes: ['RoomID'],
                    raw: true,
                    transaction
                }),
                db.RoomMember.findAll({
                    where: { AccountID: ReceiveID },
                    attributes: ['RoomID'],
                    raw: true,
                    transaction
                })
            ]);

            const senderRoomID = senderRoom.map(r => r.RoomID);
            const receiverRoomID = receiverRoom.map(r => r.RoomID);
            const existingRoomID = senderRoomID.find(id => receiverRoomID.includes(id));
            if (existingRoomID) {
                await transaction.commit();
                return resolve({
                    errCode: 0,
                    errMessage: 'Phòng chat đã tồn tại!',
                    data: { RoomID: existingRoomID }
                });
            }
            const RoomID = Math.floor(Date.now() / 1000);
            const [sender, receiver] = await Promise.all([
                db.Account.findOne({ where: { AccountID: SendID }, attributes: ['UserName'], raw: true }),
                db.Account.findOne({ where: { AccountID: ReceiveID }, attributes: ['UserName'], raw: true }),
            ]);
            const senderName = sender?.UserName || 'Người dùng';
            const receiverName = receiver?.UserName || 'Người dùng';
            const RoomName = `${senderName} - ${receiverName}`;
            await db.Room.create(
                {
                    RoomID,
                    RoomName,
                    CreatedAt: new Date(),
                },
                { transaction }
            );
            await db.RoomMember.bulkCreate(
                [
                    { AccountID: SendID, RoomID },
                    { AccountID: ReceiveID, RoomID },
                ],
                { transaction }
            );
            await transaction.commit();
            resolve({
                errCode: 0,
                errMessage: 'Tạo phòng chat thành công!',
                data: { RoomID },
            });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in createRoom: ', e);
            resolve({
                errCode: 3,
                errMessage: `Lỗi khi tạo mã: ${e.message}`,
                data: null,
            });
        }
    });
};
let getUserRooms = (AccountID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!AccountID) {
                resolve({ errCode: -1, errMessage: 'Thiếu AccountID!', data: null });
                return;
            }
            const rooms = await db.RoomMember.findAll({
                where: { AccountID },
                include: [
                    {
                        model: db.Room,
                        attributes: ['RoomID', 'RoomName', 'LastMessage', 'LastMessageTime'],
                    },
                    {
                        model: db.RoomMember,
                        as: 'OtherMembers', // Giả sử bạn thêm alias này trong model RoomMember associate
                        attributes: [],
                        include: [{ model: db.Account, attributes: ['UserName'] }],
                    },
                ],
                raw: true,
            });
            // Format data: Group by room, list other members
            const formattedRooms = rooms.reduce((acc, room) => {
                const existing = acc.find(r => r.RoomID === room['Room.RoomID']);
                if (!existing) {
                    acc.push({
                        RoomID: room['Room.RoomID'],
                        RoomName: room['Room.RoomName'],
                        LastMessage: room['Room.LastMessage'],
                        LastMessageTime: room['Room.LastMessageTime'],
                        Members: [room['OtherMembers.Account.UserName']],
                    });
                } else {
                    existing.Members.push(room['OtherMembers.Account.UserName']);
                }
                return acc;
            }, []);
            resolve({ errCode: 0, errMessage: 'Lấy rooms thành công!', data: formattedRooms });
        } catch (e) {
            console.log('Error in getUserRooms: ', e);
            resolve({ errCode: 3, errMessage: `Lỗi: ${e.message}`, data: null });
        }
    });
};

let getRoomMessages = (RoomID, limit = 50) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!RoomID) {
                resolve({ errCode: -1, errMessage: 'Thiếu RoomID!', data: null });
                return;
            }
            const messages = await db.Message.findAll({
                where: { RoomID },
                include: [{ model: db.Account, attributes: ['UserName'] }],
                order: [['SentAt', 'ASC']],
                limit,
                raw: true,
            });
            resolve({ errCode: 0, errMessage: 'Lấy messages thành công!', data: messages });
        } catch (e) {
            console.log('Error in getRoomMessages: ', e);
            resolve({ errCode: 3, errMessage: `Lỗi: ${e.message}`, data: null });
        }
    });
};

let sendMessage = (data) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            const { AccountID, RoomID, MessageText, MessageType = 'TEXT' } = data; // Giả sử MessageType mặc định 'TEXT', check AllCodes
            if (!AccountID || !RoomID || !MessageText) {
                await transaction.rollback();
                resolve({ errCode: -1, errMessage: 'Thiếu tham số!', data: null });
                return;
            }
            // Tạo message
            const newMessage = await db.Message.create({
                MessageType,
                MessageText,
                SentAt: new Date(),
                RoomID,
                AccountID,
            }, { transaction });
            // Update last message cho room
            await db.Room.update({
                LastMessage: MessageText,
                LastMessageTime: new Date(),
            }, { where: { RoomID }, transaction });
            await transaction.commit();
            resolve({ errCode: 0, errMessage: 'Gửi message thành công!', data: newMessage });
        } catch (e) {
            await transaction.rollback();
            console.log('Error in sendMessage: ', e);
            resolve({ errCode: 3, errMessage: `Lỗi: ${e.message}`, data: null });
        }
    });
};

module.exports = {
    getUserRooms,
    getRoomMessages,
    sendMessage,
    createRoom,
};