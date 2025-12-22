// frontend/src/components/Chat.js
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { IonIcon } from '@ionic/react';
import { chatboxEllipses, send, arrowBack, helpCircle, storefront, medical, time } from 'ionicons/icons';
import { handleLoadRoleAccountApi } from '../services/accountServices';
import {
    handleGetUserRooms,
    handleGetRoomMessages,
    handleSendMessage,
    handleCreateRoomApi,
} from '../services/chatServices';
import { checkLoginStatus } from '../utils/pakage';
import './Chat.scss';

class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            accountInfo: null,
            accountType: '',
            actionPage: 1,
            isOpen: false,
            selectingRole: null,
            selectingTitle: '',
            userList: [],
            historyList: [],
            currentRoom: null,
            messages: [],
            newMessage: '',
            socket: null,
        };
        this.socket = null;
    }

    async componentDidMount() {
        await this.checkAuthAndInit();

        const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:9999', {
            withCredentials: true,
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('new-message', (message) => {

            const isOwnMessage = String(message.AccountID) === String(this.state.accountInfo?.AccountID);
            const shouldNotify = !isOwnMessage && (
                !this.state.isOpen ||
                !this.state.currentRoom ||
                String(message.RoomID) !== String(this.state.currentRoom)
            );
            if (shouldNotify) {
                toast.info(`Bạn đang có một tin nhắn mới : ${message.MessageText}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    onClick: () => {
                        this.setState({ isOpen: true });
                        this.enterRoom(message.RoomID);
                    }
                });
                this.updateUnreadBadge(message.RoomID);
            }
            if (this.state.currentRoom && String(message.RoomID) === String(this.state.currentRoom)) {
                this.setState(prev => ({
                    messages: [...prev.messages, message]
                }), () => {
                    this.scrollToBottom(true);
                });
            }
        });

        socket.on('update-last-message', (data) => {
            this.setState(prev => ({
                historyList: prev.historyList.map(room =>
                    String(room.RoomID) === String(data.RoomID)
                        ? { ...room, LastMessage: data.LastMessage, LastMessageTime: data.LastMessageTime }
                        : room
                )
            }));
        });


        socket.on('new-room-notification', (data) => {
            console.log('Received new-room-notification:', data);
            toast.info('Có phòng chat mới: ' + data.message);
            this.loadHistory();
        });

        this.socket = socket;
    }

    componentWillUnmount() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
    componentDidUpdate(prevProps, prevState) {

        if (this.state.actionPage === 2 && prevState.actionPage !== 2) {
            setTimeout(() => this.scrollToBottom(), 100);
        }


        if (this.state.messages.length > prevState.messages.length) {
            const isNearBottom =
                this.messagesEndRef &&
                this.messagesEndRef.scrollHeight - this.messagesEndRef.scrollTop - this.messagesEndRef.clientHeight < 150;

            if (isNearBottom || prevState.messages.length === 0) {
                setTimeout(() => this.scrollToBottom(true), 50);
            }
        }
    }
    checkAuthAndInit = async () => {
        try {
            const { status, accountInfo } = await checkLoginStatus();
            console.log('checkLoginStatus result:', { status, accountInfo });

            if (status && accountInfo && accountInfo.AccountID) {
                this.setState(
                    {
                        isLoggedIn: true,
                        accountInfo,
                        accountType: accountInfo.AccountType || '',
                    },
                    () => {
                        this.loadHistory();
                    }
                );
            } else {
                this.setState({
                    isLoggedIn: false,
                    accountInfo: null,
                    accountType: '',
                });
            }
        } catch (error) {
            console.error('Check login failed:', error);
            this.setState({ isLoggedIn: false, accountInfo: null, accountType: '' });
        }
    };
    openUserList = async (role) => {
        try {
            const res = await handleLoadRoleAccountApi(role);
            if (res.errCode === 0) {
                this.setState({
                    actionPage: 4,
                    selectingRole: role,
                    userList: res.data,
                });
                console.log('User list for role', role, res.data);
            } else {
                toast.error(res.data.errMessage);
            }
        } catch (err) {
            toast.error('Lỗi kết nối server');
        }
    };

    loadHistory = async () => {
        try {
            const res = await handleGetUserRooms();
            if (res.data.errCode === 0) {
                this.setState({ historyList: res.data.data, actionPage: 3 });
            }
        } catch (err) {
            console.error('Load history failed:', err);
        }
    };

    createAndJoinRoom = async (SendID, ReceiveID) => {

        if (!SendID) {
            const saved = localStorage.getItem('userData');
            if (saved) {
                const parsed = JSON.parse(saved);
                SendID = parsed?.AccountID;
                console.log('Fallback: lấy SendID từ localStorage:', SendID);
            }
        }

        if (!SendID) {
            alert('Lỗi nghiêm trọng: Không tìm thấy AccountID!\nVui lòng tải lại trang (F5)');
            console.error('accountInfo:', this.state.accountInfo);
            return;
        }

        try {
            console.log('Gửi yêu cầu tạo phòng:', { SendID, ReceiveID });
            const res = await handleCreateRoomApi(SendID, ReceiveID);
            console.log('Phản hồi từ server:', res.data.data);

            if (res.data.errCode === 0 || res.data.errCode === 1) {
                const RoomID = res.data.data?.RoomID;
                if (RoomID) {
                    this.enterRoom(RoomID);
                } else {
                    toast.error('Server lỗi: Không có RoomID');
                }
            } else {
                toast.error(res.data.errMessage || 'Tạo phòng thất bại');
            }
        } catch (err) {
            console.error('Lỗi mạng:', err);
            toast.error('Không kết nối được server');
        }
    };

    enterRoom = async (RoomID) => {
        const roomIdStr = String(RoomID);
        if (this.socket) {
            this.socket.emit('join-chat-room', roomIdStr);
            console.log('Joined room:', roomIdStr);
        }

        try {
            const res = await handleGetRoomMessages(RoomID);
            if (res.data.errCode === 0) {
                this.setState({
                    messages: res.data.data,
                    currentRoom: roomIdStr,
                    actionPage: 2,
                }, () => {
                    setTimeout(() => this.scrollToBottom(), 150);
                });
            }
        } catch (err) {
            console.error('Load messages error:', err);
        }
    };

    sendMessage = async () => {
        const { newMessage, currentRoom, accountInfo } = this.state;
        if (!newMessage.trim() || !currentRoom || !accountInfo) return;

        const messageText = newMessage.trim();
        this.setState(prev => ({
            newMessage: '',
        }));
        try {
            await handleSendMessage(currentRoom, messageText);
        } catch (err) {
            console.error('Gửi tin nhắn thất bại:', err);
            toast.error('Gửi tin nhắn thất bại!');
        }
    };
    openChatWithUser = async (ReceiveID) => {
        const SendID = this.state.accountInfo?.AccountID;
        if (!SendID) {
            toast.error('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại!');
            return;
        }

        try {
            const res = await handleCreateRoomApi(SendID, ReceiveID);
            if (res.data.errCode === 0 || res.data.errCode === 1) {
                const RoomID = res.data.data?.RoomID;
                if (RoomID) {
                    this.setState({ isOpen: true }); // Mở cửa sổ chat
                    await this.enterRoom(RoomID);
                } else {
                    toast.error('Không nhận được RoomID từ server');
                }
            } else {
                toast.error(res.data.errMessage || 'Tạo phòng thất bại');
            }
        } catch (err) {
            console.error('Open chat error:', err);
            toast.error('Lỗi khi mở chat');
        }
    };
    // Quản lý badge số tin nhắn chưa đọc
    updateUnreadBadge = (roomId) => {
        this.setState(prev => {
            const unreadCount = (prev.unreadCount || 0) + 1;
            return { unreadCount };
        });
    };

    // Reset badge khi mở chat
    resetUnreadBadge = () => {
        this.setState({ unreadCount: 0 });
    };
    scrollToBottom = (smooth = false) => {
        if (this.scrollAnchor) {
            this.scrollAnchor.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' });
        }
        else if (this.messagesEndRef) this.messagesEndRef.scrollTop = this.messagesEndRef.scrollHeight;
    };
    renderForm() {
        const { isLoggedIn, actionPage, accountType, selectingTitle, userList, historyList, messages, newMessage, accountInfo } = this.state;

        // Ẩn/hiện theo role
        const showAdmin = ['C', 'V', 'O'].includes(accountType);
        const showOwner = accountType === 'C';
        const showDoctor = accountType === 'C';

        switch (actionPage) {
            case 1: // Trang chủ chat
                return (
                    <div className="chat-action">
                        <div className="chat-header">
                            Live Chat
                            <button onClick={() => this.setState({ isOpen: false })}>×</button>
                        </div>

                        {isLoggedIn ? (
                            <div className="chat-options">
                                {showAdmin && (
                                    <div className="chat-item" onClick={() => this.openUserList('A')}>
                                        <IonIcon icon={helpCircle} /> Hỗ trợ hệ thống (Admin)
                                    </div>
                                )}
                                {showOwner && (
                                    <div className="chat-item" onClick={() => this.openUserList('O')}>
                                        <IonIcon icon={storefront} /> Hỗ trợ bán hàng (Chủ shop)
                                    </div>
                                )}
                                {showDoctor && (
                                    <div className="chat-item" onClick={() => this.openUserList('V')}>
                                        <IonIcon icon={medical} />  Tư vấn thú y (Bác sĩ)
                                    </div>
                                )}
                                <div className="chat-item" onClick={this.loadHistory}>
                                    <IonIcon icon={time} />  Xem lịch sử chat
                                </div>
                            </div>
                        ) : (
                            <div className="chat-login-prompt">
                                Vui lòng đăng nhập để chat
                            </div>
                        )}
                    </div>
                );

            case 2: // Phòng chat
                return (
                    <div className="chat-room">
                        <div className="chat-header" onClick={() => this.setState({ actionPage: 3 })}>
                            <IonIcon icon={arrowBack}></IonIcon> Phòng chat
                        </div>

                        <div className="chat-messages" ref={el => this.messagesEndRef = el}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`message ${msg.AccountID === accountInfo?.AccountID ? 'own' : ''}`}
                                >
                                    {msg.MessageText}
                                    <small>{new Date(msg.SentAt).toLocaleTimeString()}</small>
                                </div>
                            ))}
                            <div ref={el => this.scrollAnchor = el} />
                        </div>

                        <div className="chat-input">
                            <input
                                placeholder="Nhập tin nhắn..."
                                value={newMessage}
                                onChange={e => this.setState({ newMessage: e.target.value })}
                                onKeyPress={e => e.key === 'Enter' && this.sendMessage()}
                            />
                            <button onClick={this.sendMessage}>
                                <IonIcon icon={send}></IonIcon>
                            </button>
                        </div>
                    </div>
                );

            case 3: // Lịch sử chat
                return (
                    <div className="chat-history-view">
                        <div className="chat-header" onClick={() => this.setState({ actionPage: 1 })}>
                            <IonIcon icon={arrowBack}></IonIcon> Lịch sử
                        </div>
                        <div className="history-list">
                            {historyList.length === 0 ? (
                                <div>Chưa có cuộc trò chuyện nào</div>
                            ) : (
                                historyList.map(room => (
                                    <div
                                        key={room.RoomID}
                                        className="history-item"
                                        onClick={() => this.enterRoom(room.RoomID)}
                                    >
                                        <div className="room-name">{room.RoomName}</div>
                                        <div className="last-msg">
                                            {room.LastMessage || 'Chưa có tin nhắn'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 4: // Trang chọn người
                return (
                    <div className="chat-select-user">
                        <div className="chat-header" onClick={() => this.setState({ actionPage: 1 })}>
                            <IonIcon icon={arrowBack}></IonIcon>  Chọn người chat
                        </div>
                        <div className="user-list">
                            {userList.length === 0 ? (
                                <div>Không có người dùng nào</div>
                            ) : (
                                userList.map(user => (
                                    <div
                                        key={user.AccountID}
                                        className="user-item"
                                        onClick={() => this.createAndJoinRoom(this.state.accountInfo?.AccountID, user.AccountID)}
                                    >
                                        <div className="avatar"><img src={user.UserImage} /></div>
                                        <div className="name">{user.UserName}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }

    render() {
        return (
            <>
                <div
                    className="chat-icon"
                    onClick={() => {
                        this.setState(prev => ({ isOpen: !prev.isOpen }));
                        if (this.state.isOpen === false) {
                            this.resetUnreadBadge(); // Khi mở chat thì xóa badge
                        }
                    }}
                >
                    <IonIcon icon={chatboxEllipses}></IonIcon>
                    {this.state.unreadCount > 0 && (
                        <span className="unread-badge">{this.state.unreadCount}</span>
                    )}
                </div>

                {this.state.isOpen && (
                    <div className="chat-window">
                        <div className="chat-form">{this.renderForm()}</div>
                    </div>
                )}
            </>
        );
    }
}

export default Chat;