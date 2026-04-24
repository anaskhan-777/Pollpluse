const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const User = require('../models/User');
const axios = require('axios');

const getStats = async (req, res) => {
  try {
    const totalPolls = await Poll.countDocuments();
    const activePolls = await Poll.countDocuments({ expiresAt: { $gt: new Date() } });
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalPolls,
      activePolls,
      totalVotes,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const generateOptionsWithAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Groq API key is missing' });

    const prompt = `Generate exactly 4 short poll answer options for: "${question}". Respond with ONLY a JSON array of 4 strings. No explanation. Example: ["Option 1","Option 2","Option 3","Option 4"]`;

    const response = await axios({
      method: 'post',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.5
      }
    });

    const aiText = response.data.choices[0].message.content.trim();
    console.log('Groq raw response:', aiText);

    let options = [];
    const match = aiText.match(/\[.*?\]/s);
    if (match) {
      options = JSON.parse(match[0]);
    } else {
      options = JSON.parse(aiText);
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(500).json({ message: 'AI returned invalid options' });
    }

    res.json({ options: options.slice(0, 6) });
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error('Groq API Error:', errMsg);
    res.status(500).json({ message: 'AI generation failed: ' + errMsg });
  }};

const getPollVoters = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const votes = await Vote.find({ pollId: id }).populate('userId', 'name email');
    
    // Group votes by option text
    const optionBreakdown = poll.options.map((option, index) => {
      const votersForOption = votes
        .filter(v => v.optionIndex === index)
        .map(v => ({
          userId: v.userId ? v.userId._id : 'Unknown',
          userName: v.userId ? v.userId.name : 'Unknown',
          userEmail: v.userId ? v.userId.email : 'Unknown',
          votedAt: v.votedAt || v.createdAt
        }));

      return {
        optionText: option.text,
        voters: votersForOption
      };
    });

    res.json({
      pollId: poll._id,
      question: poll.question,
      optionBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getStats, generateOptionsWithAI, getPollVoters };
