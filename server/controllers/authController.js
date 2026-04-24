// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const generateToken = (id, name, role) => {
//   return jwt.sign({ id, name, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// const registerUser = async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: 'User already exists' });
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const count = await User.countDocuments({});
//     const role = count === 0 ? 'admin' : 'user';
//     const user = await User.create({ name, email, password: hashedPassword, role });
//     res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.name, user.role) });
//   } catch (error) {
//     console.error('Register error:', error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (user && (await bcrypt.compare(password, user.password))) {
//       res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.name, user.role) });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (error) {
//     console.error('Login error:', error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { registerUser, loginUser };


const User = require('../models/User');
const Otp = require('../models/Otp');
const axios = require('axios');
const { sendOtpEmail } = require('../config/emailService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebaseAdmin');

const generateToken = (id, name, role) => {
  return jwt.sign({ id, name, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const count = await User.countDocuments({});
    const role = count === 0 ? 'admin' : 'user';
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.name, user.role) });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
    console.log("got the email and password")

  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    console.log("got the email and password")
    const user = await User.findOne({ email });
    console.log("user", user)

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'Invalid account configuration' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt compare error (possibly invalid hash in DB?):', bcryptError);
      return res.status(500).json({ message: 'Error comparing passwords securely' });
    }

    if (isMatch) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.name, user.role) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login processing error:', error);
    res.status(500).json({ message: 'Internal Server Error during login' });
  }
};

const firebaseAuth = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'No Firebase ID token provided' });
  }

  try {
    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, phone_number } = decodedToken;

    // Use email or phone_number as the primary identifier
    const identifier = email || phone_number;
    if (!identifier) {
       return res.status(400).json({ message: 'Could not extract email or phone from Firebase token' });
    }

    let user = await User.findOne({ $or: [{ email: identifier }, { uid }] });

    if (!user) {
      // Create a new user if one doesn't exist
      const count = await User.countDocuments({});
      const role = count === 0 ? 'admin' : 'user';
      
      // We generate a dummy password for Firebase users since they don't use passwords here
      const dummyPassword = await bcrypt.hash(uid + process.env.JWT_SECRET, 10);

      user = await User.create({
        name: name || (phone_number ? 'Phone User' : 'Unknown User'),
        email: identifier, // Save phone number in email field if email doesn't exist, or we can adjust model. For now, email is required in model. Let's use identifier.
        uid, // Storing Firebase UID
        password: dummyPassword,
        role
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.name, user.role)
    });
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(401).json({ message: 'Invalid or expired Firebase token' });
  }
};

const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  // Format phone number to be 10 digits
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  if (cleanPhone.length !== 10) {
    return res.status(400).json({ message: 'Invalid Indian phone number' });
  }

  try {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (overwrites old OTP if exists due to same phone number)
    await Otp.deleteMany({ phone: cleanPhone });
    await Otp.create({ phone: cleanPhone, otp });

    console.log('\n=============================================');
    console.log(`📱 DUMMY OTP FOR ${cleanPhone}: ${otp}`);
    console.log('=============================================\n');

    // Send via Fast2SMS using POST method as per their docs
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', 
      {
        variables_values: otp,
        route: 'otp',
        numbers: cleanPhone
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY
        }
      }
    );

    if (response.data.return === true) {
      res.json({ message: 'OTP sent successfully via SMS' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP via Fast2SMS' });
    }
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    
    // Fallback: If Fast2SMS fails (like API Key disabled), still let the user proceed using the console OTP!
    res.json({ 
      message: 'SMS failed (check Fast2SMS account), but OTP is printed in your Backend Terminal for testing!' 
    });
  }
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' });

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  try {
    const otpRecord = await Otp.findOne({ phone: cleanPhone, otp });
    
    if (!otpRecord) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid, clear it
    await Otp.deleteMany({ phone: cleanPhone });

    // Find user by phone (which we stored in email for consistency in the dummy login, or phone field)
    const identifier = `+91${cleanPhone}`;
    let user = await User.findOne({ $or: [{ email: identifier }, { phone: cleanPhone }] });

    if (!user) {
      return res.status(401).json({ message: 'Mobile number not registered! Please register first.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.name, user.role)
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

const sendEmailOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ phone: email });
    await Otp.create({ phone: email, otp });

    // Send real email via Nodemailer
    await sendOtpEmail(email, otp);

    console.log(`📧 Email OTP sent to ${email}: ${otp}`);
    res.json({ message: `OTP sent to ${email}! Please check your inbox.` });
  } catch (error) {
    console.error('Email OTP Error:', error);
    res.status(500).json({ message: 'Error sending email OTP. Check Gmail credentials.' });
  }
};

module.exports = { registerUser, loginUser, firebaseAuth, sendOtp, verifyOtp, sendEmailOtp };
