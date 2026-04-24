const Vote = require('../models/Vote');
const Poll = require('../models/Poll');

const submitVote = async (req, res) => {
  const { pollId, optionIndex } = req.body;
  const userId = req.user._id;

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This poll has expired' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    // Checking if user already voted (also handled via unique compound index on DB level)
    const existingVote = await Vote.findOne({ pollId, userId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    const vote = new Vote({ userId, pollId, optionIndex });
    await vote.save();

    // Increment vote count atomically
    const updatePath = `options.${optionIndex}.votes`;
    await Poll.updateOne(
      { _id: pollId },
      { $inc: { [updatePath]: 1 } }
    );

    res.status(201).json({ message: 'Vote submitted successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { submitVote };
