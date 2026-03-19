const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

// GET /api/conversations — all conversations for the logged-in user
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate("participants", "fullname profilePicture")
            .populate("match", "compatibility")
            .sort({ updatedAt: -1 });

        const formatted = conversations.map((c) => {
            // Find the other participant (not the current user)
            const otherUser = c.participants.find(
                (p) => p._id.toString() !== req.user._id.toString()
            );

            // Count unread messages
            return {
                id: c._id,
                otherUser: {
                    id: otherUser?._id,
                    name: otherUser?.fullname || "Unknown",
                    image: otherUser?.profilePicture
                        ? otherUser.profilePicture.startsWith("http")
                            ? otherUser.profilePicture
                            : `/uploads/${otherUser.profilePicture}`
                        : null,
                },
                lastMessage: c.lastMessage?.text || null,
                lastMessageTime: c.lastMessage?.createdAt || c.createdAt,
                compatibility: c.match?.compatibility || null,
                updatedAt: c.updatedAt,
            };
        });

        // Get unread counts for each conversation
        for (const conv of formatted) {
            const unreadCount = await Message.countDocuments({
                conversation: conv.id,
                sender: { $ne: req.user._id },
                read: false,
            });
            conv.unread = unreadCount > 0;
            conv.unreadCount = unreadCount;
        }

        res.json(formatted);
    } catch (error) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ message: "Failed to fetch conversations" });
    }
};

// GET /api/conversations/:id/messages — messages in a conversation
exports.getMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: req.user._id,
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const messages = await Message.find({
            conversation: req.params.id,
        })
            .populate("sender", "fullname profilePicture")
            .sort({ createdAt: 1 });

        // Mark unread messages as read
        await Message.updateMany(
            {
                conversation: req.params.id,
                sender: { $ne: req.user._id },
                read: false,
            },
            { read: true }
        );

        const formatted = messages.map((m) => ({
            id: m._id,
            text: m.text,
            sender: {
                id: m.sender._id,
                name: m.sender.fullname,
                image: m.sender.profilePicture
                    ? m.sender.profilePicture.startsWith("http")
                        ? m.sender.profilePicture
                        : `/uploads/${m.sender.profilePicture}`
                    : null,
            },
            isOwn: m.sender._id.toString() === req.user._id.toString(),
            read: m.read,
            createdAt: m.createdAt,
        }));

        res.json({
            conversationId: conversation._id,
            startedAt: conversation.createdAt,
            messages: formatted,
        });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// POST /api/conversations/:id/messages — send a message
exports.sendMessage = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: req.user._id,
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const message = await Message.create({
            conversation: req.params.id,
            sender: req.user._id,
            text: text.trim(),
        });

        // Update the conversation's lastMessage
        conversation.lastMessage = {
            text: text.trim(),
            sender: req.user._id,
            createdAt: message.createdAt,
        };
        await conversation.save();

        const populated = await Message.findById(message._id).populate(
            "sender",
            "fullname profilePicture"
        );

        res.status(201).json({
            id: populated._id,
            text: populated.text,
            sender: {
                id: populated.sender._id,
                name: populated.sender.fullname,
            },
            isOwn: true,
            read: false,
            createdAt: populated.createdAt,
        });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};
