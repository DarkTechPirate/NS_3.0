const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE'],
    default: 'TEXT',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  readAt: {
    type: Date,
  },
  attachments: [
    {
      url: { type: String },
      name: { type: String },
      type: { type: String },
      size: { type: Number },
    },
  ],
  metadata: {
    title: { type: String },
    description: { type: String },
    image: { type: String },
    url: { type: String },
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ 'attachments.url': 1 });

module.exports = mongoose.model('Message', messageSchema);
