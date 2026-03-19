const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/userModel');

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
          const messageData = {
            ...message.toObject(),
            sender,
            id: message._id
          };

          // Update conversation heartbeat
          await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

          // 1. Broadcast to the room (for current chat window)
          this.io.to(conversationId).emit('receive_message', messageData);
          
          // 2. Broadcast to all members (for conversation list updates, unread counts, etc.)
          targetConv.members.forEach(member => {
            const memberId = member.userId.toString();
            // This will reach them if they are online, regardless of which room they are in
            this.io.to(memberId).emit('conversation_updated', {
              conversationId,
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
