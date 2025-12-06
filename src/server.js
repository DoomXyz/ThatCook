require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/connectDB';
import initAPIRoutes from './route/api';
let app = express();
// THÊM MỚI: Socket.io + http server
import http from 'http';                    // <-- THÊM DÒNG NÀY
import { Server } from 'socket.io';         // <-- THÊM DÒNG NÀY
// app.use(cors({ origin: true }));
app.use(
  cors({
    origin: process.env.URL_REACT, //Chỉ định rõ origin của frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Cho phép credentials
  })
);

//config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config cookiesParser
app.use(cookieParser());

// Khởi tạo HTTP server (để gắn Socket.io)
const server = http.createServer(app);        // <-- THAY ĐỔI TỪ app.listen → server
// THÊM MỚI: KHỞI TẠO SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: process.env.URL_REACT || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Đưa io vào global để các service khác dùng được (rất quan trọng!)
global.io = io;                               // <-- DÒNG QUAN TRỌNG NHẤT!

// XỬ LÝ KẾT NỐI SOCKET.IO
io.on('connection', (socket) => {
  // Người dùng đăng nhập → join room theo AccountID
  socket.on('join-user', (accountId) => {
    if (accountId) {
      socket.join(accountId);
    }
  });

  // Bác sĩ / chủ shop → join room theo role
  socket.on('join-role', (role) => {
    if (role === 'V') socket.join('role_V');
    if (role === 'O') socket.join('role_O');
    console.log(`[SOCKET] User joined role_${role}`);
  });
  socket.on('join-chat-room', (RoomID) => {
    if (RoomID) {
      socket.join(RoomID);
      console.log(`[SOCKET] User joined room ${RoomID}`);
    }
  });

  // Leave room (nếu cần)
  socket.on('leave-chat-room', (RoomID) => {
    socket.leave(RoomID);
  });
  socket.on('disconnect', () => {
  });
});

initAPIRoutes(app);
connectDB();

app.use((req, res) => {
  return res.send('404 Not Found!');
});

// LẮNG NGHE BẰNG SERVER (không dùng app.listen nữa)
let port = process.env.PORT;
server.listen(port, () => {                    // <-- ĐÃ THAY app.listen → server.listen
  console.log('Server running on port: ' + port);
  console.log('Socket.io ready');
});
