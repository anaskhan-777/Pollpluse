const express = require('express');
const router = express.Router();
const { registerUser, loginUser, firebaseAuth, sendOtp, verifyOtp, sendEmailOtp } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase', firebaseAuth);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/send-email-otp', sendEmailOtp);

module.exports = router;
