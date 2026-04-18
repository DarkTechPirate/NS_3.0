const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Match = require('../models/Match');
const User = require('../models/userModel');

const toId = (value) => String(value?._id ?? value ?? '');

const toClientMessage = (message, sender = null) => {
  if (!message) return null;

  const source = typeof message.toObject === 'function' ? message.toObject() : message;
  const normalizedId = toId(source._id || source.id);

  return {
    ...source,
    _id: normalizedId,
    id: normalizedId,
    conversationId: toId(source.conversationId),
    senderId: toId(source.senderId),
    sender: sender || source.sender || null,
  };
};

const hasMutualInterest = async (userAId, userBId) => {
  const [aToB, bToA] = await Promise.all([
    Match.findOne({ user: userAId, matchedUser: userBId, isDeleted: false }).select('interestExpressed mutualInterest'),
    Match.findOne({ user: userBId, matchedUser: userAId, isDeleted: false }).select('interestExpressed mutualInterest'),
  ]);

  return Boolean(
    aToB &&
    bToA &&
    (aToB.mutualInterest || bToA.mutualInterest || (aToB.interestExpressed && bToA.interestExpressed))
  );
};

class SocketService {
  constructor() {
    this.io = null;
  }

  init(io) {
    this.io = io;

    this.io.on('connection', (socket) => {
      const userId = socket.user._id.toString();
      
      // Join personal room for general notifications
      socket.join(userId);
      console.log(`User connected: ${socket.user.fullname} (${userId})`);

      // Join a specific conversation room
      socket.on('join_chat', (conversationId) => {
        // Leave previous conversation rooms if any? 
        // Usually, socket.io allows multiple rooms, so it's fine.
        socket.join(conversationId);
        console.log(`User ${userId} joined room: ${conversationId}`);
      });

      // Leave a specific conversation room
      socket.on('leave_chat', (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${userId} left room: ${conversationId}`);
      });

      // Send a message via socket
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, content, attachments = [], type = 'TEXT' } = data;
          
          if (!conversationId || (!content && attachments.length === 0)) {
            return socket.emit('error', { message: 'Invalid message data' });
          }

          // Verify membership
          const targetConv = await Conversation.findOne({
            _id: conversationId,
            "members.userId": userId,
          });

          if (!targetConv) {
            return socket.emit('error', { message: 'Conversation not found or access denied' });
          }

          if (!targetConv.isGroup) {
            const peerMember = targetConv.members.find((member) => member.userId.toString() !== userId);
            const peerId = peerMember?.userId;
            const isAllowed = peerId ? await hasMutualInterest(userId, peerId) : false;

            if (!isAllowed) {
              return socket.emit('error', { message: 'Messaging unlocks only after both users express interest.' });
            }
          }

          // Save message to database
          const message = await Message.create({
            conversationId,
            senderId: userId,
            content,
            type: attachments.length > 0 ? (attachments.some(a => a.type?.startsWith('image/')) ? 'IMAGE' : 'FILE') : (type || 'TEXT'),
            attachments: attachments || [],
            isRead: false,
          });

          const sender = await User.findById(userId).select('fullname profilePicture');
          const messageData = toClientMessage(message, sender);

          // Update conversation heartbeat
          await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

          // 1. Broadcast to the room (for current chat window)
          this.io.to(conversationId).emit('receive_message', messageData);
          
          // 2. Broadcast to all members (for conversation list updates, unread counts, etc.)
          targetConv.members.forEach(member => {
            const memberId = member.userId.toString();
            // This will reach them if they are online, regardless of which room they are in
            this.io.to(memberId).emit('conversation_updated', {
              conversationId: toId(conversationId),
              lastMessage: messageData,
              updatedAt: new Date()
            });
          });

        } catch (err) {
          console.error('Socket send_message error:', err);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
      });
    });
  }

  // Helper to emit events from outside the class if needed
  notifyUser(userId, event, data) {
    if (this.io) {
      this.io.to(userId.toString()).emit(event, data);
    }
  }
}

module.exports = new SocketService();
