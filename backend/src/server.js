import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import sanitizeHtml from 'sanitize-html';
import path from 'path';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.js';
import ChatMessage from './models/ChatMessage.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import { env } from './config/env.js';
import { verifySMTP } from './config/email.js';

connectDB();

const app = express();
const server = http.createServer(app);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api', apiRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// Socket.IO Logic
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true
  }
});

// Rate limiting map: userId -> lastMessageTimestamp
const messageRateLimits = new Map();
const RATE_LIMIT_MS = 1000; // 1 second

// Room Presence: roomId -> Map<userId, {nickname, avatarId, avatarUrl}>
const roomPresence = new Map();

// Middleware for Socket Auth
io.use(async (socket, next) => {
  const token = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('nickname avatarId avatarUrl role');
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    // Leave previous room logic if strictly one room at a time, 
    // but for simplicity we allow joining.
    // If we want to track "current active room", we should leave others.
    if (socket.currentRoom && socket.currentRoom !== roomId) {
      socket.leave(socket.currentRoom);
      // Remove from presence
      if (roomPresence.has(socket.currentRoom)) {
        roomPresence.get(socket.currentRoom).delete(socket.userId);
        io.to(socket.currentRoom).emit('room_users', Array.from(roomPresence.get(socket.currentRoom).values()));
      }
    }

    socket.join(roomId);
    socket.currentRoom = roomId;

    if (!roomPresence.has(roomId)) {
      roomPresence.set(roomId, new Map());
    }

    roomPresence.get(roomId).set(socket.userId, {
      userId: socket.userId,
      nickname: socket.user.nickname,
      avatarId: socket.user.avatarId,
      avatarUrl: socket.user.avatarUrl
    });

    // Broadcast user list
    io.to(roomId).emit('room_users', Array.from(roomPresence.get(roomId).values()));
  });

  socket.on('disconnect', () => {
    if (socket.currentRoom && roomPresence.has(socket.currentRoom)) {
      roomPresence.get(socket.currentRoom).delete(socket.userId);
      io.to(socket.currentRoom).emit('room_users', Array.from(roomPresence.get(socket.currentRoom).values()));
    }
  });

  socket.on('send_message', async (data) => {
    const { room, content, clientSideId } = data;

    // 1. Rate Limiting
    const lastTime = messageRateLimits.get(socket.userId);
    const now = Date.now();
    if (lastTime && (now - lastTime < RATE_LIMIT_MS)) {
      socket.emit('error_message', { message: 'You are sending messages too fast.', clientSideId });
      return;
    }
    messageRateLimits.set(socket.userId, now);

    // 2. Validation
    if (!content || content.trim().length === 0 || content.length > 500) {
      return;
    }

    // 3. Sanitization
    const cleanContent = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {}
    });

    try {
      // 4. Persistence
      const msg = await ChatMessage.create({
        room,
        authorId: socket.userId,
        content: cleanContent
      });

      // 5. Populate Author Details
      await msg.populate('authorId', 'nickname avatarId avatarUrl role');

      // 6. Broadcast
      // Attach clientSideId to the plain object so the sender can reconcile
      const msgObj = msg.toObject();
      if (clientSideId) msgObj.clientSideId = clientSideId;

      io.to(room).emit('receive_message', msgObj);
    } catch (err) {
      console.error('Socket message error:', err);
      socket.emit('error_message', { message: 'Failed to send message', clientSideId });
    }
  });
});

const PORT = env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  verifySMTP();
});
