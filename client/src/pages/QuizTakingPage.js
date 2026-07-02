// src/pages/QuizTakingPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import QuestionItem from '../components/QuestionItem';
import ResizableCaseStudy from '../components/ResizableCaseStudy';
import QuestionSingleDisplay from '../components/QuestionSingleDisplay';
import QuizNavigationDrawer from '../components/QuizNavigationDrawer';

const formatTime = (seconds) => {
  if (seconds === null) return 'Không giới hạn';
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [h, m, s].map(v => v < 10 ? "0" + v : v);
  return h > 0 ? parts.join(":") : `${parts[1]}:${parts[2]}`;
};

function QuizTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAlert } = useAlert();
  const [searchParams] = useSearchParams();

  const quizMode = searchParams.get('mode') || 'review';
  const timeLimit = searchParams.get('timeLimit') ? parseInt(searchParams.get('timeLimit'), 10) : null;
  const isShuffle = searchParams.get('shuffle') === 'true';

  const [originalQuiz, setOriginalQuiz] = useState(null);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  
  // STATE CỠ CHỮ: 'sm' (Nhỏ), 'base' (Vừa), 'lg' (Lớn)
  const [textSize, setTextSize] = useState('base'); 
  
  const timerRef = useRef(null);

  const handleSubmitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = localStorage.getItem('quizStartTime');
    const timeTaken = startTime ? Math.floor((Date.now() - parseInt(startTime, 10)) / 1000) : 0;
    const quizId = id || 'virtual';
    
    navigate(`/quiz/result/${quizId}`, { 
      state: { quizData: originalQuiz, userAnswers, timeTaken, quizMode } 
    });
    localStorage.removeItem('quizStartTime');
    
    // Dọn dẹp cờ khi kết thúc bài làm
    localStorage.removeItem(`studyMed_bookmarks_${quizId}`); 
  }, [id, navigate, originalQuiz, userAnswers, quizMode]);

  // --- HÀM LẤY CỜ TỪ LOCAL STORAGE (Đã gắn ID bộ đề) ---
  const fetchBookmarks = useCallback(() => {
    try {
      const bookmarkKey = `studyMed_bookmarks_${id || 'virtual'}`;
      const localBookmarks = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
      setBookmarkedQuestions(new Set(localBookmarks));
    } catch (err) {
      console.error('Lỗi tải bookmarks:', err);
    }
  }, [id]);
  
  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  useEffect(() => {
    const setupQuiz = (quizData) => {
      // Khởi tạo một mảng copy từ mảng gốc để tránh mutate (đột biến) dữ liệu gốc
      let processedQuestions = quizData?.questions ? [...quizData.questions] : [];

      // Nếu hệ thống nhận được tín hiệu isShuffle = true, tiến hành xáo trộn (enzym hoạt động)
      if (isShuffle) {
        for (let i = processedQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          // Tráo đổi vị trí 2 phần tử
          [processedQuestions[i], processedQuestions[j]] = [processedQuestions[j], processedQuestions[i]];
        }
      }

      // Cập nhật lại não bộ (originalQuiz) bằng chính danh sách đã xáo trộn
      setOriginalQuiz({ ...quizData, questions: processedQuestions });

      // Cập nhật môi trường nội môi với danh sách đã xử lý
      setDisplayQuestions(processedQuestions);
      localStorage.setItem('quizStartTime', Date.now().toString());
      setLoadingQuiz(false);
    };

    const fetchQuizById = async () => {
      try {
        setLoadingQuiz(true);
        const res = await api.get(`/api/quizzes/${id}`);
        setupQuiz(res.data);
      } catch (err) {
        setAlert('Không thể tải bộ đề.', 'error');
        navigate('/dashboard');
      }
    };

    if (location.state?.virtualQuiz) {
      setupQuiz(location.state.virtualQuiz);
    } else if (id && id !== 'virtual') {
      fetchQuizById();
    } else {
      setAlert('Không có dữ liệu bộ đề.', 'error');
      navigate('/dashboard');
    }
  // LƯU Ý: Thêm isShuffle vào mảng phụ thuộc (dependency array) để useEffect biết mà theo dõi
  }, [id, location.state, navigate, setAlert, isShuffle]);

  useEffect(() => {
    if (timeLeft === null || isTimerPaused || loadingQuiz || isTimeUp) {
      if(timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      setAlert('Đã hết giờ làm bài!', 'warning');
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, isTimerPaused, loadingQuiz, isTimeUp, setAlert]);

  // --- HÀM GẮN CỜ (Đã gắn ID bộ đề) ---
  const handleToggleBookmark = (questionId) => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
          newSet.delete(questionId);
      } else {
          newSet.add(questionId);
      }
      
      const bookmarkKey = `studyMed_bookmarks_${id || 'virtual'}`;
      localStorage.setItem(bookmarkKey, JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const handleAnswerChange = (questionId, optionId, questionType) => {
    // 1. Chỉ tắt feedback nếu chuyển sang câu mới hoặc đang ở chế độ review mà KHÔNG PHẢI đang làm multi-select dở dang
    if (quizMode === 'review' && displayQuestions[currentQuestionIndex]?.type !== 'group' && questionType !== 'multi-select') {
      setShowFeedback(false);
    }
    
    setUserAnswers((prevAnswers) => {
      const currentAnswers = prevAnswers[questionId] || [];
      let newAnswers;

      if (questionType === 'multi-select') {
        newAnswers = currentAnswers.includes(optionId) 
          ? currentAnswers.filter((id) => id !== optionId) 
          : [...currentAnswers, optionId];
      } else {
        newAnswers = [optionId];
      }
      return { ...prevAnswers, [questionId]: newAnswers };
    });

    // 2. Chặn việc tự động bật feedback nếu là multi-select
    const isGroupQuestion = displayQuestions[currentQuestionIndex]?.type === 'group';
    if (quizMode === 'review' && questionType !== 'multi-select' && !isGroupQuestion) {
      setShowFeedback(true);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < displayQuestions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePreviousQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
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

  if (loadingQuiz) return <div className="flex items-center justify-center min-h-screen">Đang tải bộ đề...</div>;
  if (!originalQuiz || displayQuestions.length === 0) return <div className="flex items-center justify-center min-h-screen">Lỗi tải bộ đề.</div>;

  const currentQuestion = displayQuestions[currentQuestionIndex];
  
  // Total count vẫn lấy từ originalQuiz để đảm bảo tổng số câu hỏi luôn đúng kể cả khi xáo trộn
  const totalQuestionsCount = originalQuiz.questions.reduce((total, q) => total + (q.type === 'group' && q.childQuestions ? q.childQuestions.length : 1), 0);
  const answeredCount = Object.values(userAnswers).filter(a => a.length > 0).length;

  let currentQuestionDisplay = '';
  if (quizMode === 'review' && currentQuestion) {
    const startNum = getGlobalQuestionNumber(currentQuestionIndex);
    if (currentQuestion.type === 'group' && currentQuestion.childQuestions) {
      const endNum = startNum + currentQuestion.childQuestions.length - 1;
      currentQuestionDisplay = `${startNum} - ${endNum}`;
    } else {
      currentQuestionDisplay = `${startNum}`;
    }
  }

  const canCheckAnswer = currentQuestion?.type === 'group'
    ? currentQuestion.childQuestions.every(cq => userAnswers[cq._id] && userAnswers[cq._id].length > 0)
    : (currentQuestion?.questionType === 'multi-select' ? userAnswers[currentQuestion._id]?.length > 0 : false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <QuizNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        originalQuiz={originalQuiz}
        userAnswers={userAnswers}
        bookmarkedQuestions={bookmarkedQuestions}
        quizMode={quizMode}
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
      />

      {isTimeUp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Đã Hết Giờ!</h2>
            <div className="flex justify-center space-x-4">
              <Button secondary onClick={() => { setIsTimeUp(false); setIsTimerPaused(true); }}>Làm tiếp</Button>
              <Button primary onClick={handleSubmitQuiz}>Xem kết quả</Button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-200 shadow-sm px-4 py-2 flex justify-between items-center transition-all">
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-bold text-lg ${isTimeUp && !isTimerPaused ? 'text-red-500 animate-pulse' : 'text-blue-800'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {formatTime(timeLeft)}
          </div>
          <div className="hidden md:flex items-center gap-3 text-gray-600 font-medium border-l pl-6 border-gray-300">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm uppercase tracking-wide">
              {quizMode === 'review' ? 'Ôn tập' : 'Kiểm tra'}
            </span>
            <span className="text-sm">
              Câu hỏi: <strong className="text-blue-600">{quizMode === 'review' ? currentQuestionDisplay : answeredCount}</strong> / {totalQuestionsCount}
            </span>
          </div>
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
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors text-sm md:text-base border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            <span className="hidden sm:inline">Danh sách</span>
          </button>
          {quizMode === 'test' && (
            <Button primary onClick={handleSubmitQuiz} className="py-1.5 px-3 md:px-6 shadow-md bg-green-600 hover:bg-green-700 border-none text-sm md:text-base">
              Nộp bài
            </Button>
          )}
        </div>
      </div>

      <div className="w-full max-w-[1600px] flex-1 mx-auto my-4 md:my-6 p-4 md:p-6 lg:p-8">
        {quizMode === 'test' ? (
          <div className="w-full">
            {displayQuestions.map((item, index) => {
              const startNum = getGlobalQuestionNumber(index);
              const caseNum = getCaseStudyNumber(index); 
              
              if (item.type === 'single') {
                return (
                  <div key={item._id || index} id={`question-${item._id}`} className="max-w-5xl mx-auto mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <QuestionItem 
                      question={item} 
                      index={startNum - 1} 
                      userAnswer={userAnswers[item._id]} 
                      onAnswerChange={handleAnswerChange} 
                      isBookmarked={bookmarkedQuestions.has(item._id)}
                      onToggleBookmark={() => handleToggleBookmark(item._id)}
                      textSize={textSize}
                    />
                  </div>
                );
              }
              if (item.type === 'group') {
                return (
                  <ResizableCaseStudy
                    key={item._id || index} question={item} groupIndex={index} userAnswers={userAnswers}
                    handleAnswerChange={handleAnswerChange} showFeedback={false}
                    bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark} quizMode={quizMode}
                    startingNumber={startNum} 
                    caseStudyNumber={caseNum} 
                    textSize={textSize}
                  />
                );
              }
              return null;
            })}
            
            <div className="flex justify-center mt-12 border-t pt-8 max-w-5xl mx-auto w-full mb-20">
              <Button primary onClick={handleSubmitQuiz} className="py-3 px-12 text-lg shadow-xl bg-green-600 hover:bg-green-700">Xác nhận nộp bài</Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {(() => {
              const startNum = getGlobalQuestionNumber(currentQuestionIndex);
              const caseNum = getCaseStudyNumber(currentQuestionIndex);
              return currentQuestion.type === 'group' ? (
                <ResizableCaseStudy
                  question={currentQuestion} groupIndex={currentQuestionIndex} userAnswers={userAnswers}
                  handleAnswerChange={handleAnswerChange} showFeedback={showFeedback}
                  bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark} quizMode={quizMode}
                  startingNumber={startNum}
                  caseStudyNumber={caseNum}
                  textSize={textSize}
                />
              ) : (
                <QuestionSingleDisplay
                  currentQuestion={currentQuestion} currentQuestionIndex={currentQuestionIndex} userAnswers={userAnswers}
                  handleAnswerChange={handleAnswerChange} showFeedback={showFeedback}
                  bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark}
                  globalNumber={startNum}
                  textSize={textSize}
                />
              );
            })()}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button 
                secondary 
                onClick={() => {
                  localStorage.removeItem(`studyMed_bookmarks_${id || 'virtual'}`);
                  navigate('/dashboard');
                }} 
                className="px-6 py-2.5"
              >
                Thoát
              </Button>
              <div className="flex gap-3">
                <Button secondary onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>Trang trước</Button>
                
                {!showFeedback && (currentQuestion.type === 'group' || currentQuestion.questionType === 'multi-select') ? (
                    <Button primary onClick={() => setShowFeedback(true)} disabled={!canCheckAnswer}>Xem đáp án</Button>
                ) : currentQuestionIndex < displayQuestions.length - 1 ? (
                    <Button primary onClick={handleNextQuestion}>Trang tiếp theo</Button>
                ) : (
                    <Button primary onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700">Kết thúc ôn tập</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizTakingPage;