// server/models/Quiz.js
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, default: false }
});

// Schema cho các câu hỏi con trong một nhóm
const childQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: "" }, // <--- MỚI THÊM: Chứa link ảnh cho câu hỏi con (nếu có)
  questionType: {
    type: String,
    enum: ['single-choice', 'multi-select', 'true-false'],
    default: 'single-choice',
    required: true
  },
  options: {
    type: [optionSchema],
    required: true,
    validate: {
      validator: (v) => v && v.length >= 2,
      message: 'Một câu hỏi phải có ít nhất 2 lựa chọn.'
    }
  },
  generalExplanation: { type: String, trim: true }
});

// questionSchema giờ là một cấu trúc "lai"
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['single', 'group']
  },
  
  // ---> BỔ SUNG TRƯỜNG NÀY ĐỂ DATABASE CHỊU LƯU LOẠI CÂU HỎI ĐƠN <---
  questionType: {
    type: String,
    enum: ['single-choice', 'multi-select', 'true-false'],
    default: 'single-choice'
  },
  
  // Các trường cho type: 'single'
  questionText: { type: String, required: function() { return this.type === 'single'; } },
  options: { type: [optionSchema], required: function() { return this.type === 'single'; } },
  
  // Các trường cho type: 'group'
  caseStem: { type: String, required: function() { return this.type === 'group'; } },
  childQuestions: { type: [childQuestionSchema], required: function() { return this.type === 'group'; } },
  
  // Các trường chung cho cả hai loại
  imageUrl: { type: String, default: "" }, // <--- MỚI THÊM: Chứa link ảnh cho câu hỏi đơn HOẶC ảnh của Bệnh án (caseStem)
  generalExplanation: { type: String, trim: true },
  
  // "Kháng nguyên bề mặt" - Giữ nguyên tuyệt đối để phục vụ hệ tuần hoàn lọc dữ liệu
  tags: { type: [String], default: [] }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  topic: { type: String, trim: true },
  questions: [questionSchema]
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;