const express = require('express');
const router = express.Router();
const Bookmark = require('../../models/Bookmark');
const Quiz = require('../../models/Quiz');

// @route   GET api/bookmarks
// @desc    Lấy danh sách tất cả các câu hỏi đã bookmark
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({ createdAt: -1 });
    const questionIds = bookmarks.map(b => b.questionId);

    // Tìm các câu hỏi tương ứng trong Quiz
    const allQuizzes = await Quiz.find();
    let bookmarkedQuestions = [];

    allQuizzes.forEach(quiz => {
      // Xử lý cả câu hỏi thường và câu hỏi nhóm (group)
      quiz.questions.forEach(q => {
        if (q.type === 'group' && q.childQuestions) {
          q.childQuestions.forEach(cq => {
            if (questionIds.includes(cq._id.toString())) {
              bookmarkedQuestions.push({ ...cq.toObject(), quizId: quiz._id, parentId: q._id, isChild: true });
            }
          });
        } else {
          if (questionIds.includes(q._id.toString())) {
            bookmarkedQuestions.push({ ...q.toObject(), quizId: quiz._id });
          }
        }
      });
    });

    res.json(bookmarkedQuestions);
  } catch (err) {
    res.status(500).send('Lỗi Server');
  }
});

// @route   POST api/bookmarks/:questionId
// @desc    Toggle bookmark (thêm/xóa)
router.post('/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const existing = await Bookmark.findOne({ questionId });

    if (existing) {
      await Bookmark.deleteOne({ questionId });
      return res.json({ msg: 'Bookmark đã xóa', bookmarked: false });
    } else {
      const newBookmark = new Bookmark({ questionId });
      await newBookmark.save();
      return res.json({ msg: 'Bookmark đã thêm', bookmarked: true });
    }
  } catch (err) {
    res.status(500).send('Lỗi Server');
  }
});

module.exports = router;