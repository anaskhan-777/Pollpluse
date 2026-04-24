const express = require('express');
const router = express.Router();
const { getActivePolls, getAllPolls, createPoll, deletePoll, getPollResults, getPastPolls } = require('../controllers/pollController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/active', getActivePolls);
router.get('/past', getPastPolls);
router.get('/', protect, admin, getAllPolls);
router.post('/', protect, admin, createPoll);
router.delete('/:id', protect, admin, deletePoll);
router.get('/:id/results', getPollResults);

module.exports = router;
