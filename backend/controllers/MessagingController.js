const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Match = require("../models/Match");
const User = require("../models/userModel");
const socketService = require("../services/socketService");
const Notification = require("../models/Notification");

const hasMutualInterest = async (userAId, userBId) => {
  const [aToB, bToA] = await Promise.all([
    Match.findOne({ user: userAId, matchedUser: userBId, isDeleted: false }).select("interestExpressed mutualInterest"),
    Match.findOne({ user: userBId, matchedUser: userAId, isDeleted: false }).select("interestExpressed mutualInterest"),
  ]);

  return Boolean(
    aToB &&
    bToA &&
    (aToB.mutualInterest || bToA.mutualInterest || (aToB.interestExpressed && bToA.interestExpressed))
  );
};

const getConversationPeerId = (conversation, requesterId) => {
  const peerMember = (conversation?.members || []).find(
    (member) => member.userId.toString() !== requesterId.toString()
  );

  return peerMember?.userId || null;
};

/**
 * Get all conversations for the authenticated user
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find conversations where the user is a member
    const conversations = await Conversation.find({
      "members.userId": userId,
    }).sort({ updatedAt: -1 });

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();
        
        // Get other members' details
        const otherMemberIds = conv.members
          .filter((m) => m.userId.toString() !== userId.toString())
          .map((m) => m.userId);

        const otherUsers = await User.find({
            _id: { $in: otherMemberIds }
        }).select('fullname profilePicture email');

        // Get last message
        const lastMessage = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 });

        return {
          ...convObj,
          id: convObj._id,
          participants: otherUsers,
          lastMessage,
        };
      })
    );

    return res.status(200).json({ success: true, data: enrichedConversations });
  } catch (error) {
    console.error(`[Messaging] getConversations Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Failed to fetch conversations." });
  }
};

/**
 * Get messages for a specific conversation
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify membership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "members.userId": userId,
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: "Access denied or conversation not found." });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // Enrich messages with sender details
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = await User.find({
        _id: { $in: senderIds }
    }).select('fullname profilePicture');

    const enrichedMessages = messages.map((msg) => {
      const msgObj = msg.toObject();
      return {
        ...msgObj,
        id: msgObj._id,
        sender: senders.find((s) => s._id.toString() === msg.senderId.toString()),
      };
    });

    // Update last read time for this user
    await Conversation.updateOne(
      { _id: conversationId, "members.userId": userId },
      { $set: { "members.$.lastReadAt": new Date() } }
    );

    return res.status(200).json({ success: true, data: enrichedMessages });
  } catch (error) {
    console.error(`[Messaging] getMessages Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Failed to fetch messages." });
  }
};

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, content, attachments = [], metadata = null } = req.body;
    let { type } = req.body;
    const senderId = req.user._id;

    // Auto-detect type if not provided
    if (!type) {
      if (attachments.length > 0) {
        const hasImage = attachments.some(a => a.type && a.type.startsWith('image/'));
        type = hasImage ? 'IMAGE' : 'FILE';
      } else {
        type = 'TEXT';
      }
    }

    let targetConv = null;

    if (conversationId) {
      targetConv = await Conversation.findOne({
        _id: conversationId,
        "members.userId": senderId,
      });

      if (targetConv && !targetConv.isGroup) {
        const peerId = getConversationPeerId(targetConv, senderId);
        const isAllowed = peerId ? await hasMutualInterest(senderId, peerId) : false;

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            message: "Messaging unlocks only after both users express interest.",
          });
        }
      }
    } else if (recipientId) {
      if (senderId.toString() === recipientId.toString()) {
        return res.status(400).json({ success: false, message: "Cannot message yourself." });
      }

      const isAllowed = await hasMutualInterest(senderId, recipientId);
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: "Messaging is locked until both users express interest.",
        });
      }

      // Find or create 1:1 conversation
      targetConv = await Conversation.findOne({
        isGroup: false,
        members: {
          $size: 2,
          $all: [
            { $elemMatch: { userId: senderId } },
            { $elemMatch: { userId: recipientId } }
          ]
        }
      });

      if (!targetConv) {
        targetConv = await Conversation.create({
          isGroup: false,
          members: [
            { userId: senderId },
            { userId: recipientId }
          ]
        });
      }
    }

    if (!targetConv) {
      return res.status(400).json({ success: false, message: "Conversation not found or access denied." });
    }

    // Save message
    const message = await Message.create({
      conversationId: targetConv._id,
      senderId,
      content,
      type,
      attachments: attachments || [],
      metadata: metadata || null,
      isRead: false,
    });

    // Enrich message with sender details
    const sender = await User.findById(senderId).select('fullname profilePicture');

    // Update conversation heartbeat
    await Conversation.findByIdAndUpdate(targetConv._id, { updatedAt: new Date() });

    // Broadcast via SSE
    const messageData = {
        ...message.toObject(),
        sender,
        id: message._id
    };

    targetConv.members.forEach(member => {
        socketService.notifyUser(member.userId.toString(), "NEW_MESSAGE", messageData);
        // Also update conversation list for all members
        socketService.notifyUser(member.userId.toString(), "conversation_updated", {
            conversationId: targetConv._id,
            lastMessage: messageData,
            updatedAt: new Date()
        });
    });

    // Create Notification for the recipient
    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type: 'MESSAGE',
        message: `New message from ${sender.fullname}`,
        link: `/messages`
      });
      // Notify via socket for the bell icon
      socketService.notifyUser(recipientId.toString(), "NEW_NOTIFICATION", {
        type: 'MESSAGE',
        message: `New message from ${sender.fullname}`
      });
    }

    return res.status(201).json({ success: true, data: messageData });
  } catch (error) {
    console.error(`[Messaging] sendMessage Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

/**
 * Find or create conversation with a user
 */
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user._id;

    if (userId.toString() === recipientId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself." });
    }

    const isAllowed = await hasMutualInterest(userId, recipientId);
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Messaging is locked until both users express interest.",
      });
    }

    let conversation = await Conversation.findOne({
      isGroup: false,
      members: {
        $size: 2,
        $all: [
          { $elemMatch: { userId } },
          { $elemMatch: { userId: recipientId } }
        ]
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: false,
        members: [
          { userId },
          { userId: recipientId }
        ]
      });
    }

    // Enrich with participant details
    const otherUser = await User.findById(recipientId).select('fullname profilePicture email');

    return res.status(200).json({ 
      success: true, 
      data: { 
        ...conversation.toObject(), 
        id: conversation._id, 
        participants: [otherUser] 
      } 
    });
  } catch (error) {
    console.error(`[Messaging] getOrCreateConversation Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Failed to get conversation." });
  }
};

/**
 * Mark all messages in a conversation as read for the current user
 */
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const now = new Date();
    // Update messages sent by others as read
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, isRead: false },
      { $set: { isRead: true, readAt: now } }
    );

    // Update conversation lastReadAt
    const targetConv = await Conversation.findOneAndUpdate(
      { _id: conversationId, "members.userId": userId },
      { $set: { "members.$.lastReadAt": now } },
      { new: true }
    );

    if (!targetConv) {
       return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    // Notify other participants via SSE
    targetConv.members.forEach(member => {
        socketService.notifyUser(member.userId.toString(), "MESSAGES_READ", { conversationId, readerId: userId, readAt: now });
    });

    return res.status(200).json({ success: true, message: "Messages marked as read." });
  } catch (error) {
    console.error(`[Messaging] markAsRead Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Failed to mark messages as read." });
  }
};
