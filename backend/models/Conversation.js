const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    }
  }],
}, {
  timestamps: true,
});

// Index members for fast lookups
conversationSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
