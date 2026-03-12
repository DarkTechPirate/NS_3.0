const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
        },
        lastMessage: {
            text: String,
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    },
    { timestamps: true }
);

// Index for fast lookup by participant
ConversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", ConversationSchema);
