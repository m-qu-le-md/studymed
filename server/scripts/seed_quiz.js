const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Quiz = require('../models/Quiz');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/long_cardiology_quiz.json'), 'utf8'));

const transformOptions = (options, correctIndices) => {
  return options.map((opt, index) => ({
    text: opt,
    isCorrect: correctIndices.includes(index)
  }));
};

const transformedQuestions = data.questions.map(q => {
  if (q.type === 'group') {
    return {
      type: 'group',
      caseStem: q.caseStudy,
      childQuestions: q.childQuestions.map(cq => ({
        questionText: cq.question,
        questionType: 'single-choice',
        options: transformOptions(cq.options, cq.correctAnswer),
        generalExplanation: cq.explanation
      }))
    };
  } else {
    return {
      type: 'single',
      questionType: 'single-choice',
      questionText: q.question,
      options: transformOptions(q.options, q.correctAnswer),
      generalExplanation: q.explanation
    };
  }
});

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const quiz = new Quiz({
      title: data.title,
      description: data.description,
      subject: 'Cardiology',
      topic: 'General Cardiology',
      questions: transformedQuestions
    });

    await quiz.save();
    console.log('Quiz saved successfully');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

run();