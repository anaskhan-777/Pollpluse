const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

const getActivePolls = async (req, res) => {
  try {
    const polls = await Poll.find({ 
      isActive: true, 
      expiresAt: { $gt: new Date() } 
    }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find({}).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createPoll = async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;
    
    if (!question || !options || options.length < 2 || !expiresAt) {
      return res.status(400).json({ message: 'Please provide question, at least 2 options, and expiry date' });
    }

    const poll = new Poll({
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      expiresAt,
      createdBy: req.user._id
    });

    const createdPoll = await poll.save();
    res.status(201).json(createdPoll);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    await Vote.deleteMany({ pollId: poll._id });
    await Poll.deleteOne({ _id: poll._id });

    res.json({ message: 'Poll removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);
    
    const results = poll.options.map((opt, index) => ({
      _id: opt._id,
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100)
    }));

    res.json({ poll, results, totalVotes });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPastPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ 
      expiresAt: { $lte: new Date() } 
    }).sort({ expiresAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getActivePolls, getAllPolls, createPoll, deletePoll, getPollResults, getPastPolls };
