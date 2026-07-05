// src/pages/QuizTakingPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import api from '../services/api';
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
    localStorage.removeItem(`studyMed_bookmarks_${quizId}`); 
  }, [id, navigate, originalQuiz, userAnswers, quizMode]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await api.get('/api/bookmarks');
      const questionIds = res.data.map(item => item._id);
      setBookmarkedQuestions(new Set(questionIds));
    } catch (err) {
      console.error('Lỗi tải bookmarks:', err);
    }
  }, []);
  
  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  useEffect(() => {
    const setupQuiz = (quizData) => {
      let processedQuestions = quizData?.questions ? [...quizData.questions] : [];
      if (isShuffle) {
        for (let i = processedQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [processedQuestions[i], processedQuestions[j]] = [processedQuestions[j], processedQuestions[i]];
        }
      }
      setOriginalQuiz({ ...quizData, questions: processedQuestions });
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

  const handleToggleBookmark = useCallback(async (questionId) => {
    try {
      const res = await api.post(`/api/bookmarks/${questionId}`, {});
      setBookmarkedQuestions(prev => {
        const newSet = new Set(prev);
        if (res.data.bookmarked) {
          newSet.add(questionId);
        } else {
          newSet.delete(questionId);
        }
        return newSet;
      });
      
      if (res.data.bookmarked) {
        setAlert('Đã đánh dấu câu hỏi', 'success');
      } else {
        setAlert('Đã bỏ đánh dấu câu hỏi', 'info');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật bookmark:', err);
      setAlert('Lỗi cập nhật đánh dấu.', 'error');
    }
  }, [setAlert]);

  const handleAnswerChange = (questionId, optionId, questionType) => {
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
    const isGroupQuestion = displayQuestions[currentQuestionIndex]?.type === 'group';
    if (quizMode === 'review' && questionType !== 'multi-select' && !isGroupQuestion) {
      setShowFeedback(true);
    }
  };

  const handleJumpToQuestion = (index) => {
    setShowFeedback(false);
    setCurrentQuestionIndex(index);
    if (quizMode === 'test') {
      setTimeout(() => {
        const question = displayQuestions[index];
        const element = document.getElementById(`question-${question._id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    setIsNavDrawerOpen(false);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < displayQuestions.length - 1) {
        handleJumpToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) {
        handleJumpToQuestion(currentQuestionIndex - 1);
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

  if (loadingQuiz) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Đang tải bộ đề...</div>;
  if (!originalQuiz || displayQuestions.length === 0) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Lỗi tải bộ đề.</div>;

  const currentQuestion = displayQuestions[currentQuestionIndex];
  const totalQuestionsCount = originalQuiz.questions.reduce((total, q) => total + (q.type === 'group' && q.childQuestions ? q.childQuestions.length : 1), 0);
  const answeredCount = Object.values(userAnswers).filter(a => a.length > 0).length;
  const canCheckAnswer = currentQuestion?.type === 'group'
    ? currentQuestion.childQuestions.every(cq => userAnswers[cq._id] && userAnswers[cq._id].length > 0)
    : (currentQuestion?.questionType === 'multi-select' ? userAnswers[currentQuestion._id]?.length > 0 : false);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden relative selection:bg-slate-800 selection:text-white">
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${(answeredCount / (totalQuestionsCount || 1)) * 100}%` }}
        />
      </div>

        <QuizNavigationDrawer
          isOpen={isNavDrawerOpen}
          onClose={() => setIsNavDrawerOpen(false)}
          originalQuiz={originalQuiz}
          userAnswers={userAnswers}
          bookmarkedQuestions={bookmarkedQuestions}
          quizMode={quizMode}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={handleJumpToQuestion}
        />

      {isTimeUp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Hết giờ làm bài!</h2>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setIsTimeUp(false); setIsTimerPaused(true); }} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900">Làm tiếp</button>
              <button onClick={handleSubmitQuiz} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Nộp bài</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-[64px] bg-white z-40 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm mt-1">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {quizMode === 'review' ? 'Ôn tập' : 'Kiểm tra'}
            </span>
            <div className={`font-mono font-bold text-base ${isTimeUp && !isTimerPaused ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsNavDrawerOpen(true)} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Danh sách câu hỏi
          </button>
          <button onClick={handleSubmitQuiz} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95">
            Kết thúc
          </button>
        </div>
      </header>

      {/* Main Container - Khống chế cuộn tổng thể */}
      <div className="flex-1 overflow-hidden relative">
        {quizMode === 'test' ? (
          /* Chế độ thi thử: Cho phép cuộn dọc toàn trang tự do */
          <div className="h-full w-full overflow-y-auto p-4 md:p-6 lg:p-8 pb-32">
            <div className="w-full max-w-5xl mx-auto space-y-6">
              {displayQuestions.map((item, index) => {
                const startNum = getGlobalQuestionNumber(index);
                const caseNum = getCaseStudyNumber(index); 
                
                if (item.type === 'single') {
                  return (
                    <div key={item._id} id={`question-${item._id}`} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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
                    <div key={item._id} id={`question-${item._id}`}>
                      <ResizableCaseStudy
                        question={item} groupIndex={index} userAnswers={userAnswers}
                        handleAnswerChange={handleAnswerChange} showFeedback={false}
                        bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark} quizMode={quizMode}
                        startingNumber={startNum} 
                        caseStudyNumber={caseNum} 
                        textSize={textSize}
                      />
                    </div>
                  );
                }
                return null;
              })}
              <div className="flex justify-center pt-8 max-w-xl mx-auto w-full">
                <button onClick={handleSubmitQuiz} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Nộp bài và xem kết quả
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Chế độ Ôn tập: Khóa cứng h-full để ép các panel con tự cuộn độc lập */
          <div className="h-full w-full p-4 md:p-6 overflow-hidden">
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
        )}
      </div>

      {/* Footer cố định cho chế độ Ôn tập */}
      {quizMode === 'review' && (
        <footer className="h-[72px] flex justify-between items-center border-t border-slate-200 bg-white px-6 shrink-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all"
          >
            Thoát
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handlePreviousQuestion} 
              disabled={currentQuestionIndex === 0} 
              className="px-5 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-30"
            >
                Câu trước
            </button>
            
            {!showFeedback && (currentQuestion.type === 'group' || currentQuestion.questionType === 'multi-select') ? (
                <button onClick={() => setShowFeedback(true)} disabled={!canCheckAnswer} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-40">
                    Kiểm tra
                </button>
            ) : currentQuestionIndex < displayQuestions.length - 1 ? (
                <button onClick={handleNextQuestion} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                    Câu sau
                </button>
            ) : (
                <button onClick={handleSubmitQuiz} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all">
                    Nộp bài
                </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

export default QuizTakingPage;