const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: ["INTEREST", "MESSAGE", "VERIFICATION", "SYSTEM"],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String // Optional link to redirect user (e.g., /messages/123)
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
