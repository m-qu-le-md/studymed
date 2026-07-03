// src/pages/QuizTakingPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import api from '../services/api';
// import Button from '../components/Button';
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
  const [textSize] = useState('base');
  
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
    <div className="h-screen w-screen bg-[conic-gradient(from_at_50%_50%,_#fdf2f8,_#eef2ff,_#f0fdfa)] flex flex-col overflow-hidden relative selection:bg-accent selection:text-white">
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
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl text-center max-w-sm mx-4">
            <h2 className="text-xl font-semibold text-zinc-950 mb-4">Hết giờ!</h2>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setIsTimeUp(false); setIsTimerPaused(true); }} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-950">Làm tiếp</button>
              <button onClick={handleSubmitQuiz} className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium">Nộp bài</button>
            </div>
          </div>
        </div>
      )}

      {/* Header với thanh tiến trình nhiều màu sắc */}
      <header className="h-[10vh] bg-white/90 backdrop-blur-lg z-40 border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          {/* Progress Bar & Timer */}
          <div className="flex items-center gap-4">
            <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-500 ease-out" 
                style={{ width: `${(answeredCount / (totalQuestionsCount || 1)) * 100}%` }}
              />
            </div>
            <div className={`font-mono font-bold text-sm tracking-tight ${isTimeUp && !isTimerPaused ? 'text-red-600 animate-pulse' : 'text-zinc-950'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-zinc-500 text-sm">
             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               {quizMode === 'review' ? 'Ôn tập' : 'Kiểm tra'}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsNavDrawerOpen(true)} className="text-sm font-medium text-zinc-600 hover:text-accent transition-colors">
            Danh sách
          </button>
          <button onClick={handleSubmitQuiz} className="bg-zinc-950 text-white px-5 py-2 rounded-2xl text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-95">
            Kết thúc
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
        <div className="h-full w-full max-w-[1600px] mx-auto overflow-y-auto pr-2">
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
              
              <div className="flex justify-center mt-12 border-t border-zinc-200 pt-8 max-w-5xl mx-auto w-full mb-20">
                <button onClick={handleSubmitQuiz} className="bg-accent text-white px-12 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
                  Nộp bài
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col h-full">
              <div className="flex-1">
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
              </div>

              <footer className="h-[15vh] flex justify-between items-center border-t border-zinc-200 bg-white/50 backdrop-blur-sm shrink-0 px-6">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="px-6 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:bg-white border border-transparent hover:border-zinc-200 transition-all"
                >
                  Thoát
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={handlePreviousQuestion} 
                    disabled={currentQuestionIndex === 0} 
                    className="px-8 py-3 rounded-2xl border-2 border-zinc-900 text-sm font-bold text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-30 disabled:border-zinc-300"
                  >
                      Câu trước
                  </button>
                  
                  {!showFeedback && (currentQuestion.type === 'group' || currentQuestion.questionType === 'multi-select') ? (
                      <button onClick={() => setShowFeedback(true)} disabled={!canCheckAnswer} className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50">
                          Kiểm tra
                      </button>
                  ) : currentQuestionIndex < displayQuestions.length - 1 ? (
                      <button onClick={handleNextQuestion} className="px-8 py-3 bg-zinc-950 text-white rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          Câu sau
                      </button>
                  ) : (
                      <button onClick={handleSubmitQuiz} className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          Nộp bài
                      </button>
                  )}
                </div>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizTakingPage;