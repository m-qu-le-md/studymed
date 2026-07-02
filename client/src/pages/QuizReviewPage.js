// src/pages/QuizReviewPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
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
  
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  
  // STATE CỠ CHỮ: 'sm' (Nhỏ), 'base' (Vừa), 'lg' (Lớn)
  const [textSize, setTextSize] = useState('base'); 

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
        setAlert('Đã thêm câu hỏi vào bookmark.', 'success');
        setBookmarkedQuestions(prev => new Set(prev).add(questionId));
      } else {
        setAlert('Đã xóa câu hỏi khỏi bookmark.', 'info');
        setBookmarkedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật bookmark:', err);
      setAlert(err.response?.data?.msg || 'Lỗi khi cập nhật bookmark.', 'error');
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

  /**
   * PHẢN XẠ ĐỊNH VỊ CHÍNH XÁC:
   * Chấp nhận index (để fallback) và qId (để trỏ thẳng tới tế bào đích).
   */
  const handleNavigateToQuestion = useCallback((index, qId) => {
    // Ưu tiên dùng qId để tìm ID HTML chính xác của câu hỏi (dù là câu đơn hay câu con trong group)
    const targetId = qId ? `question-${qId}` : (
      displayQuestions[index]?.type === 'single' 
        ? `question-${displayQuestions[index]._id}`
        : `question-${displayQuestions[index]?.childQuestions?.[0]?._id}`
    );

    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        // Trừ hao 80px để không bị Header che lấp (giống như đặt khoảng cách an toàn khi mổ)
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setIsNavDrawerOpen(false); 
    }
  }, [displayQuestions]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  }

  if (!quiz) {
    return <div className="flex justify-center items-center min-h-screen">Không tìm thấy dữ liệu bộ đề.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      
      <QuizNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        originalQuiz={{ questions: displayQuestions }}
        userAnswers={userAnswers}
        bookmarkedQuestions={bookmarkedQuestions}
        quizMode="review"
        currentQuestionIndex={0} 
        setCurrentQuestionIndex={handleNavigateToQuestion} // Đã cập nhật khả năng nhận qId
      />

      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-200 shadow-sm px-4 md:px-8 py-3 flex justify-between items-center transition-all">
        <div className="flex items-center gap-4 truncate">
            <h1 className="text-xl md:text-2xl font-bold text-blue-800 truncate">
                Xem lại: {quiz.title}
            </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* THANH ĐIỀU CHỈNH CỠ CHỮ */}
          <div className="flex items-center bg-gray-100/80 rounded-lg p-1 border border-gray-200">
            <button onClick={() => setTextSize('sm')} title="Thu nhỏ chữ" className={`px-2 py-1 rounded text-xs font-bold transition-all ${textSize === 'sm' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}>A-</button>
            <button onClick={() => setTextSize('base')} title="Chữ mặc định" className={`px-2 py-1 rounded text-sm font-bold transition-all ${textSize === 'base' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}>A</button>
            <button onClick={() => setTextSize('lg')} title="Phóng to chữ" className={`px-2 py-1 rounded text-base font-bold transition-all ${textSize === 'lg' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}>A+</button>
          </div>

          <button
            onClick={() => setIsNavDrawerOpen(true)}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-semibold transition-colors text-sm md:text-base border border-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            <span className="hidden sm:inline">Danh sách</span>
          </button>
          <Button secondary onClick={() => navigate('/dashboard')} className="py-1.5 md:py-2 text-sm md:text-base hidden md:block">
            Thoát
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[1600px] flex-1 mx-auto my-4 md:my-8 p-4 md:p-6 lg:p-8">
        
        {quiz.description && (
            <div className="max-w-5xl mx-auto mb-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600 text-lg">{quiz.description}</p>
            </div>
        )}

        {displayQuestions.map((item, index) => {
          const startNum = getGlobalQuestionNumber(index);
          const caseNum = getCaseStudyNumber(index);

          if (item.type === 'single') {
            return (
              <QuestionSingleDisplay
                key={item._id || index}
                currentQuestion={item}
                currentQuestionIndex={index}
                userAnswers={userAnswers}
                handleAnswerChange={() => {}}
                showFeedback={true}
                bookmarkedQuestions={bookmarkedQuestions}
                handleToggleBookmark={handleToggleBookmark}
                globalNumber={startNum}
                textSize={textSize}
              />
            );
          }

          if (item.type === 'group') {
            return (
              <ResizableCaseStudy
                key={item._id || index}
                question={item}
                groupIndex={index}
                userAnswers={userAnswers}
                handleAnswerChange={() => {}}
                showFeedback={true}
                bookmarkedQuestions={bookmarkedQuestions}
                handleToggleBookmark={handleToggleBookmark}
                quizMode="review"
                startingNumber={startNum}
                caseStudyNumber={caseNum}
                textSize={textSize}
              />
            );
          }
          return null;
        })}
        
        <div className="flex justify-center mt-12 border-t pt-10 max-w-5xl mx-auto w-full mb-12">
          <Button primary onClick={() => navigate('/dashboard')} className="py-3 px-12 text-lg shadow-xl bg-blue-600 hover:bg-blue-700">
            Hoàn tất xem lại
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizReviewPage;