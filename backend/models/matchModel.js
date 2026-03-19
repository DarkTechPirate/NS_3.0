const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        matchedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "interested", "declined", "mutual"],
            default: "pending",
        },
        compatibility: {
            type: String,
            enum: ["Strong", "Moderate", "Developing"],
            default: "Moderate",
        },
        timeline: {
            type: String,
            default: "Within 6 Months",
        },
        matchReasons: [String],
        considerations: [
            {
                topic: String,
                detail: String,
            },
        ],
        tags: [String],
        isVerified: {
            type: Boolean,
            default: false,
        },
        familyShortlisted: {
            type: Boolean,
            default: false,
        },
        familyFlagged: {
            type: Boolean,
            default: false,
        },
        familyNotes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Ensure a user can only be matched with another user once
MatchSchema.index({ user: 1, matchedUser: 1 }, { unique: true });

module.exports = mongoose.model("Match", MatchSchema);
