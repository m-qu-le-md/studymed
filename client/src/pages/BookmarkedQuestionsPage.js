// src/pages/BookmarkedQuestionsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuestionSingleDisplay from '../components/QuestionSingleDisplay';
import ResizableCaseStudy from '../components/ResizableCaseStudy';
import Button from '../components/Button';

function BookmarkedQuestionsPage() {
  const navigate = useNavigate();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedQuestions, setRevealedQuestions] = useState(new Set());

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/api/users/bookmarks');
        setBookmarkedQuestions(res.data);
      } catch (err) {
        console.error('Lỗi khi tải bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleToggleReveal = (questionId) => {
    setRevealedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleRemoveBookmark = async (questionId) => {
    try {
      await api.put(`/api/users/bookmark/${questionId}`, {});
      setBookmarkedQuestions(prev => prev.filter(item => item.question._id !== questionId));
    } catch (err) {
      console.error('Lỗi khi xóa bookmark:', err);
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải câu hỏi đã gắn cờ...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Câu hỏi đã gắn cờ ({bookmarkedQuestions.length})</h1>
        <Button secondary onClick={() => navigate('/dashboard')}>Quay về Dashboard</Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {bookmarkedQuestions.map((item, idx) => {
          const q = item.question;
          const isRevealed = revealedQuestions.has(q._id);

          return (
            <div key={q._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Bộ đề: {item.quizTitle}</span>
                <button 
                  onClick={() => handleRemoveBookmark(q._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Bỏ gắn cờ
                </button>
              </div>

              {q.type === 'group' ? (
                <ResizableCaseStudy
                  question={q}
                  userAnswers={{}}
                  showFeedback={isRevealed}
                  mode="review"
                />
              ) : (
                <QuestionSingleDisplay
                  currentQuestion={q}
                  userAnswers={{}}
                  showFeedback={isRevealed}
                  mode="review"
                />
              )}

              {!isRevealed && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => handleToggleReveal(q._id)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all"
                  >
                    Xem đáp án & giải thích
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {bookmarkedQuestions.length === 0 && (
          <div className="text-center py-20 text-slate-500">Chưa có câu hỏi nào được gắn cờ.</div>
        )}
      </div>
    </div>
  );
}

export default BookmarkedQuestionsPage;