const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  optionIndex: { type: Number, required: true }
}, { timestamps: true });

// Compound index to strictly enforce one-vote-per-poll per user
voteSchema.index({ userId: 1, pollId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
