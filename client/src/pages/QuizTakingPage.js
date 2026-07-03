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

  if (loadingQuiz) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">Đang chuẩn bị bộ đề...</p>
      </div>
    </div>
  );
  
  if (!originalQuiz || displayQuestions.length === 0) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-red-600 font-medium">
      Không thể tải dữ liệu bộ đề. Vui lòng thử lại.
    </div>
  );

  const currentQuestion = displayQuestions[currentQuestionIndex];
  const totalQuestionsCount = originalQuiz.questions.reduce((total, q) => total + (q.type === 'group' && q.childQuestions ? q.childQuestions.length : 1), 0);
  const answeredCount = Object.values(userAnswers).filter(a => a.length > 0).length;
  const progressPercentage = (answeredCount / (totalQuestionsCount || 1)) * 100;

  const canCheckAnswer = currentQuestion?.type === 'group'
    ? currentQuestion.childQuestions.every(cq => userAnswers[cq._id] && userAnswers[cq._id].length > 0)
    : (currentQuestion?.questionType === 'multi-select' ? userAnswers[currentQuestion._id]?.length > 0 : false);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden relative selection:bg-slate-800 selection:text-white">
      
      {/* Progress Bar Top Edge */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
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
        setCurrentQuestionIndex={setCurrentQuestionIndex}
      />

      {/* Time Up Modal */}
      {isTimeUp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-4 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Đã hết thời gian</h2>
            <p className="text-slate-500 mb-6 text-sm">Hệ thống đã ghi nhận toàn bộ quá trình làm bài của bạn.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setIsTimeUp(false); setIsTimerPaused(true); }} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                Xem lại bài
              </button>
              <button onClick={handleSubmitQuiz} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md">
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Header */}
      <header className="h-[72px] bg-white z-40 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm mt-1.5">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              {quizMode === 'review' ? 'Chế độ: Ôn tập' : 'Chế độ: Kiểm tra'}
            </span>
            <div className={`font-mono text-xl font-semibold tracking-tight ${isTimeUp && !isTimerPaused ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-slate-200">
            <span className="text-sm text-slate-500 font-medium">Tiến độ:</span>
            <span className="text-sm font-bold text-slate-800">{answeredCount} / {totalQuestionsCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsNavDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            Danh sách câu hỏi
          </button>
          <button onClick={handleSubmitQuiz} className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition-all shadow-sm active:scale-95">
            Kết thúc thi
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-0 relative">
        <div className="h-full w-full overflow-y-auto px-4 md:px-8 py-6 pb-32">
          {quizMode === 'test' ? (
            <div className="w-full max-w-5xl mx-auto space-y-8">
              {displayQuestions.map((item, index) => {
                const startNum = getGlobalQuestionNumber(index);
                const caseNum = getCaseStudyNumber(index); 
                
                if (item.type === 'single') {
                  return (
                    <div key={item._id || index} id={`question-${item._id}`} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
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
              
              <div className="flex justify-center mt-16 pt-8 max-w-2xl mx-auto w-full mb-10">
                <button onClick={handleSubmitQuiz} className="w-full bg-blue-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                  Nộp bài và Xem kết quả
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto flex flex-col h-full">
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
      </main>

      {/* Floating Action Footer (chỉ hiển thị ở chế độ Review) */}
      {quizMode === 'review' && (
        <footer className="absolute bottom-0 left-0 w-full h-[80px] bg-white border-t border-slate-200 px-6 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Thoát ra ngoài
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handlePreviousQuestion} 
              disabled={currentQuestionIndex === 0} 
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Câu trước
            </button>
            
            {!showFeedback && (currentQuestion.type === 'group' || currentQuestion.questionType === 'multi-select') ? (
                <button 
                  onClick={() => setShowFeedback(true)} 
                  disabled={!canCheckAnswer} 
                  className="px-8 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Kiểm tra đáp án
                </button>
            ) : currentQuestionIndex < displayQuestions.length - 1 ? (
                <button 
                  onClick={handleNextQuestion} 
                  className="px-8 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition-all shadow-md"
                >
                    Câu tiếp theo
                </button>
            ) : (
                <button 
                  onClick={handleSubmitQuiz} 
                  className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md"
                >
                    Hoàn thành & Nộp bài
                </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

export default QuizTakingPage;