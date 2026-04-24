require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Poll = require('./models/Poll');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pollpulse');
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany(); // Reset users for clean test base! Remove this in prod.
    
    // EXPLICIT bcrypt hashing for seed user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Pollpulse@2026', salt);

    const admin = new User({
      name: 'Anas Asad Khan',
      email: 'anasasadkhan786@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    const user = new User({
      name: 'Normal User',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'user'
    });

    await admin.save();
    await user.save();
    
    // ==========================================
    // GENERATE 100 UNIQUE POLLS FOR ADMIN
    // ==========================================
    console.log('Generating 100 premium polls...');
    await Poll.deleteMany(); // Clear old polls

    const categories = ['Technology', 'Sports', 'Entertainment', 'Politics', 'Lifestyle', 'Gaming'];
    const samplePolls = [];

    for (let i = 1; i <= 100; i++) {
      const category = categories[i % categories.length];
      let question = '';
      let options = [];

      if (category === 'Technology') {
        question = `Tech Poll #${i}: What is the best programming language for AI in 2026?`;
        options = [{ text: 'Python', votes: 0 }, { text: 'JavaScript', votes: 0 }, { text: 'C++', votes: 0 }, { text: 'Rust', votes: 0 }];
      } else if (category === 'Gaming') {
        question = `Gaming Poll #${i}: Which console generation is your favorite?`;
        options = [{ text: 'PS5 / Xbox Series', votes: 0 }, { text: 'PS4 / Xbox One', votes: 0 }, { text: 'PS3 / Xbox 360', votes: 0 }, { text: 'Retro', votes: 0 }];
      } else if (category === 'Sports') {
        question = `Sports Poll #${i}: Who will win the next World Cup?`;
        options = [{ text: 'India', votes: 0 }, { text: 'Australia', votes: 0 }, { text: 'England', votes: 0 }, { text: 'Others', votes: 0 }];
      } else {
        question = `General Poll #${i}: What is your favorite time of the day?`;
        options = [{ text: 'Morning', votes: 0 }, { text: 'Afternoon', votes: 0 }, { text: 'Evening', votes: 0 }, { text: 'Night', votes: 0 }];
      }

      // Add some random votes for realism
      options.forEach(opt => opt.votes = Math.floor(Math.random() * 50));

      samplePolls.push({
        question: question,
        options: options,
        createdBy: admin._id,
        category: category,
        status: 'active',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random past dates
        expiresAt: new Date(Date.now() + 10000000000) // Future expiration
      });
    }

    await Poll.insertMany(samplePolls);

    console.log('Seed successful! Anas Asad Khan (Admin) & Normal User created.');
    console.log('100 Polls successfully added to Admin account! 🎉');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
