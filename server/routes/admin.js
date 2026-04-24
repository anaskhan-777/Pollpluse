const express = require('express');
const router = express.Router();
const { getStats, generateOptionsWithAI, getPollVoters } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/stats', protect, admin, getStats);
router.post('/generate-options', protect, admin, generateOptionsWithAI);
router.get('/polls/:id/voters', protect, admin, getPollVoters);

module.exports = router;
