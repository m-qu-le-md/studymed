import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useDevice } from '../hooks/useDevice';
import QuizTakingMobile from './QuizTakingMobile';
import QuizTakingDesktop from './QuizTakingDesktop';

function QuizTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAlert } = useAlert();
  const [searchParams] = useSearchParams();
  const { isMobile } = useDevice();

  const quizMode = searchParams.get('mode') || 'review';
  const timeLimitParam = searchParams.get('timeLimit');
  const timeLimit = timeLimitParam ? parseInt(timeLimitParam, 10) : null;
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
  const isQuizInitialized = useRef(false);

  useEffect(() => {
    if (timeLimit === null || isTimerPaused || isTimeUp) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimeUp(true);
          return 0; // Hết giờ
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function để tránh rò rỉ bộ nhớ khi unmount
    return () => clearInterval(timerRef.current);
  }, [timeLimit, isTimerPaused, isTimeUp]);

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
    if (isQuizInitialized.current) return;

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
      isQuizInitialized.current = true;
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
      setAlert(res.data.bookmarked ? 'Đã đánh dấu câu hỏi' : 'Đã bỏ đánh dấu câu hỏi', res.data.bookmarked ? 'success' : 'info');
    } catch (err) {
      setAlert('Lỗi cập nhật đánh dấu.', 'error');
    }
  }, [setAlert]);

  const handleAnswerChange = (questionId, optionId, questionType) => {
    if (isTimeUp) return;
    
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

  const getGlobalQuestionNumber = (pIndex) => {
    if (!displayQuestions || displayQuestions.length === 0) return 1; 
    let count = 0;
    for (let i = 0; i < pIndex; i++) {
      const q = displayQuestions[i]; 
      count += (q.type === 'group' && q.childQuestions) ? q.childQuestions.length : 1;
    }
    return count + 1;
  };

  const getCaseStudyNumber = (pIndex) => {
    if (!displayQuestions || displayQuestions.length === 0) return 1;
    let count = 0;
    for (let i = 0; i <= pIndex; i++) {
      if (displayQuestions[i].type === 'group') count++;
    }
    return count;
  };

  if (loadingQuiz) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Đang tải bộ đề...</div>;
  if (!originalQuiz || displayQuestions.length === 0) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Lỗi tải bộ đề.</div>;

  const totalQuestionsCount = originalQuiz.questions.reduce((total, q) => total + (q.type === 'group' && q.childQuestions ? q.childQuestions.length : 1), 0);
  const answeredCount = Object.values(userAnswers).filter(a => a.length > 0).length;

  const commonProps = {
    originalQuiz, displayQuestions, userAnswers, currentQuestionIndex,
    bookmarkedQuestions, timeLeft, isTimeUp, isTimerPaused, showFeedback,
    isNavDrawerOpen, handleAnswerChange, handleJumpToQuestion, handleNextQuestion,
    handlePreviousQuestion, handleSubmitQuiz, handleToggleBookmark,
    setIsNavDrawerOpen, setIsTimeUp, setIsTimerPaused, setShowFeedback,
    quizMode, textSize, getGlobalQuestionNumber, getCaseStudyNumber,
    answeredCount, totalQuestionsCount
  };

  return isMobile ? <QuizTakingMobile {...commonProps} /> : <QuizTakingDesktop {...commonProps} />;
}

export default QuizTakingPage;