require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const quizData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/mẫu.json'), 'utf8'));
    
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { title: quizData.title },
      quizData,
      { upsert: true, new: true, runValidators: true }
    );
    console.log('Quiz saved/updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding quiz:', err);
    process.exit(1);
  }
}

seed();
