
import ChatRoom from '../models/ChatRoom.js';
import ChatMessage from '../models/ChatMessage.js';

export const getRooms = async (req, res) => {
  const rooms = await ChatRoom.find().sort({ order: 1, name: 1 });
  res.json(rooms);
};

export const createRoom = async (req, res) => {
  // Admin only
  const { name, topic, description, icon, order } = req.body;
  const room = await ChatRoom.create({ name, topic, description, icon, order });
  res.status(201).json(room);
};

export const getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, before } = req.query;
  
  const query = { room: roomId, status: 'active' };
  
  // Pagination: load messages before a certain date
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1 }) // Get newest first
    .limit(Number(limit))
    .populate('authorId', 'nickname avatarId avatarUrl role');

  // Return reversed (oldest first) so frontend can append easily
  res.json(messages.reverse());
};
