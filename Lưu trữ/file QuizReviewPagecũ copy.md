// src/pages/QuizReviewPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import QuestionSingleDisplay from '../components/QuestionSingleDisplay';
import ResizableCaseStudy from '../components/ResizableCaseStudy';
import QuizNavigationDrawer from '../components/QuizNavigationDrawer';

function QuizReviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const [quiz, setQuiz] = useState(null);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  
  // Quản lý hiển thị từng câu
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [textSize] = useState('base');

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await api.get('/api/users/bookmarks');
      setBookmarkedQuestions(new Set(res.data.map(q => q.question._id)));
    } catch (err) {
      console.error('Lỗi khi tải bookmarks:', err);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    const setupQuizData = (data) => {
      setQuiz(data);
      if (location.state?.userAnswers) {
        setUserAnswers(location.state.userAnswers);
      }
      setDisplayQuestions(data?.questions || []);
      setLoading(false);
    };

    const fetchQuizById = async () => {
      try {
        const res = await api.get(`/api/quizzes/${id}`);
        setupQuizData(res.data);
      } catch (err) {
        setAlert('Không thể tải bộ đề để xem lại.', 'error');
        navigate('/dashboard');
      }
    };

    if (location.state?.quizData) {
      setupQuizData(location.state.quizData);
    } else if (id && id !== 'virtual') {
      fetchQuizById();
    } else {
      setAlert('Không có dữ liệu để xem lại.', 'error');
      navigate('/dashboard');
    }
  }, [id, location.state, navigate, setAlert]);

  const handleToggleBookmark = async (questionId) => {
    try {
      const res = await api.put(`/api/users/bookmark/${questionId}`, {});
      if (res.data.bookmarked) {
        setAlert('Đã thêm cờ đánh dấu.', 'success');
        setBookmarkedQuestions(prev => new Set(prev).add(questionId));
      } else {
        setAlert('Đã xóa cờ đánh dấu.', 'info');
        setBookmarkedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật bookmark:', err);
      setAlert(err.response?.data?.msg || 'Lỗi hệ thống.', 'error');
    }
  };

  const getGlobalQuestionNumber = useCallback((pIndex) => {
    if (!displayQuestions || displayQuestions.length === 0) return 1;
    let count = 0;
    for (let i = 0; i < pIndex; i++) {
      const q = displayQuestions[i];
      count += (q.type === 'group' && q.childQuestions) ? q.childQuestions.length : 1;
    }
    return count + 1;
  }, [displayQuestions]);

  const getCaseStudyNumber = useCallback((pIndex) => {
    if (!displayQuestions || displayQuestions.length === 0) return 1;
    let count = 0;
    for (let i = 0; i <= pIndex; i++) {
      if (displayQuestions[i].type === 'group') {
        count++;
      }
    }
    return count;
  }, [displayQuestions]);

  // Điều hướng nhảy câu từ Drawer
  const handleNavigateToQuestion = useCallback((index) => {
    setCurrentQuestionIndex(index);
    setIsNavDrawerOpen(false);
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < displayQuestions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-slate-50">Đang chuẩn bị dữ liệu...</div>;
  if (!quiz || displayQuestions.length === 0) return <div className="flex justify-center items-center min-h-screen bg-slate-50">Lỗi không tìm thấy dữ liệu.</div>;

  const currentQuestion = displayQuestions[currentQuestionIndex];

  return (
    // Khóa cứng chiều cao màn hình để kế thừa Panel cuộn độc lập
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden relative selection:bg-blue-200 selection:text-slate-900">
      
      <QuizNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        originalQuiz={{ questions: displayQuestions }}
        userAnswers={userAnswers}
        bookmarkedQuestions={bookmarkedQuestions}
        quizMode="review"
        currentQuestionIndex={currentQuestionIndex} 
        setCurrentQuestionIndex={handleNavigateToQuestion} // Đã sửa logic truyền ID thành Index
      />

      {/* Header */}
      <header className="h-[64px] bg-white z-40 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Lịch sử bài làm
            </span>
            <h1 className="text-base font-bold text-slate-800 truncate">
                {quiz.title}
            </h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsNavDrawerOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            Danh sách
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">
            Thoát
          </button>
        </div>
      </header>

      {/* Main Content Area - Render duy nhất 1 câu đang focus */}
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        {(() => {
            const startNum = getGlobalQuestionNumber(currentQuestionIndex);
            const caseNum = getCaseStudyNumber(currentQuestionIndex);

            return currentQuestion.type === 'group' ? (
                <ResizableCaseStudy
                    question={currentQuestion} groupIndex={currentQuestionIndex} userAnswers={userAnswers}
                    handleAnswerChange={() => {}} // Disabled trong chế độ xem lại
                    showFeedback={true} // Bắt buộc mở bảng giải thích
                    bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark} quizMode="review"
                    startingNumber={startNum} caseStudyNumber={caseNum} textSize={textSize}
                />
            ) : (
                <QuestionSingleDisplay
                    currentQuestion={currentQuestion} currentQuestionIndex={currentQuestionIndex} userAnswers={userAnswers}
                    handleAnswerChange={() => {}} // Disabled
                    showFeedback={true} // Bắt buộc mở bảng giải thích
                    bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark}
                    globalNumber={startNum} textSize={textSize}
                />
            );
        })()}
      </main>

      {/* Footer Navigation */}
      <footer className="h-[72px] flex justify-between items-center border-t border-slate-200 bg-white px-6 shrink-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all"
        >
          Về trang chủ
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={handlePreviousQuestion} 
            disabled={currentQuestionIndex === 0} 
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
              Câu trước
          </button>
          
          <button 
            onClick={handleNextQuestion} 
            disabled={currentQuestionIndex === displayQuestions.length - 1}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
              Câu tiếp theo
          </button>
        </div>
      </footer>
    </div>
  );
}

export default QuizReviewPage;