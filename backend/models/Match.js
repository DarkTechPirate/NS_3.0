const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  matchedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  compatibility: {
    type: String,
    enum: ['Strong', 'Moderate', 'Developing'],
    required: true,
  },
  matchReasons: [{
    type: String,
  }],
  interestExpressed: {
    type: Boolean,
    default: false,
  },
  interestExpressedAt: {
    type: Date,
    default: null,
  },
  mutualInterest: {
    type: Boolean,
    default: false,
  },
  mutualInterestAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  visibleInCycle: {
    type: Boolean,
    default: false,
  },
  cycleKey: {
    type: String,
    default: null,
  },
  lastShownAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Avoid duplicate matches between the same two users
MatchSchema.index({ user: 1, matchedUser: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);
