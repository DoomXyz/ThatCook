// src/controllers/chatController.js
import db from '../models/index';
import { verifyJWT } from '../middleware/jwtController';
import chatService from '../services/chatService';

const getAccountFromRequest = (req) => {
    const token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return null;
    return verifyJWT(token);
};

const handleCreateRoom = async (req, res) => {
    try {
        const { SendID, ReceiveID } = req.body;
        const response = await chatService.createRoom(SendID, ReceiveID);

        if (response.errCode === 0) {

            global.io.to(String(ReceiveID)).emit('new-room-notification', {
                RoomID: response.data.RoomID,
                message: 'Bạn có phòng chat mới từ ' + SendID,
            });
        }

        return res.status(200).json(response);
    } catch (e) {
        console.error('Error handleCreateRoom:', e);
        return res.status(500).json({ errCode: 3, errMessage: 'Lỗi server' });
    }
};

// [GET] Lấy danh sách phòng chat của user hiện tại
const getUserRooms = async (req, res) => {
    try {
        const decoded = getAccountFromRequest(req);
        if (!decoded || !decoded.AccountID) {
            return res.status(401).json({
                errCode: -1,
                errMessage: 'Không xác thực được người dùng!',
            });
        }

        const result = await chatService.getUserRooms(decoded.AccountID);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getUserRooms controller:', error);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi server: ' + error.message,
        });
    }
};

// [GET] Lấy tin nhắn trong một phòng chat
const getRoomMessages = async (req, res) => {
    try {
        const { RoomID } = req.query;
        if (!RoomID) {
            return res.status(400).json({
                errCode: -1,
                errMessage: 'Thiếu RoomID!',
            });
        }

        const result = await chatService.getRoomMessages(RoomID);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getRoomMessages controller:', error);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi server: ' + error.message,
        });
    }
};

// [POST] Gửi tin nhắn trong phòng
const sendMessage = async (req, res) => {
    try {
        const decoded = getAccountFromRequest(req);
        if (!decoded || !decoded.AccountID) {
            return res.status(401).json({
                errCode: -1,
                errMessage: 'Không xác thực được người dùng!',
            });
        }

        const { RoomID, MessageText, MessageType = 'TEXT' } = req.body;

        if (!RoomID || !MessageText) {
            return res.status(400).json({
                errCode: -1,
                errMessage: 'Thiếu RoomID hoặc nội dung tin nhắn!',
            });
        }

        const messageData = {
            AccountID: decoded.AccountID,
            RoomID: parseInt(RoomID),
            MessageText: MessageText.trim(),
            MessageType,
        };

        const result = await chatService.sendMessage(messageData);

        if (result.errCode === 0) {
            const messageWithUser = {
                ...result.data.dataValues,
                'Account.UserName': decoded.UserName || 'Bạn',
            };

            // Emit to room (string)
            const roomStr = String(RoomID);
            global.io.to(roomStr).emit('new-message', messageWithUser);

            // Update last message
            global.io.to(roomStr).emit('update-last-message', {
                RoomID: RoomID,
                LastMessage: messageWithUser.MessageText,
                LastMessageTime: new Date(),
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in sendMessage controller:', error);
        return res.status(500).json({
            errCode: 3,
            errMessage: 'Lỗi server: ' + error.message,
        });
    }
};

module.exports = {
    handleCreateRoom,
    getUserRooms,
    getRoomMessages,
    sendMessage,
};