const express = require('express');
const router = express.Router();
const { submitVote } = require('../controllers/voteController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, submitVote);

module.exports = router;
