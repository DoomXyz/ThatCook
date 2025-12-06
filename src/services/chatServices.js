import axios from 'axios';
const handleCreateRoomApi = (SendID, ReceiveID) => {
    return axios.post('/api/create-room', { SendID, ReceiveID });
};
const handleGetUserRooms = () => {
    return axios.get('/api/chat/rooms');
};
const handleGetRoomMessages = (RoomID, limit = 50) => {
    return axios.get('/api/chat/messages', {
        params: { RoomID, limit },
    });
};
// Gửi tin nhắn mới trong phòng chat
const handleSendMessage = (RoomID, MessageText, MessageType = 'TEXT') => {
    return axios.post('/api/chat/send-message', { RoomID, MessageText, MessageType, });
};
export {
    handleGetUserRooms,
    handleGetRoomMessages,
    handleSendMessage,
    handleCreateRoomApi,
};