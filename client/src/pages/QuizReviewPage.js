import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useDevice } from '../hooks/useDevice';
import QuizReviewDesktop from './QuizReviewDesktop';
import QuizReviewMobile from './QuizReviewMobile';

function QuizReviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { isMobile } = useDevice();

  const [quiz, setQuiz] = useState(null);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  
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
      const res = await api.post(`/api/bookmarks/${questionId}`, {});
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

  const commonProps = {
    quiz,
    displayQuestions,
    userAnswers,
    bookmarkedQuestions,
    currentQuestionIndex,
    isNavDrawerOpen,
    textSize,
    setIsNavDrawerOpen,
    handleToggleBookmark,
    getGlobalQuestionNumber,
    getCaseStudyNumber,
    handleNavigateToQuestion,
    handleNextQuestion,
    handlePreviousQuestion
  };

  return isMobile ? <QuizReviewMobile {...commonProps} /> : <QuizReviewDesktop {...commonProps} />;
}

export default QuizReviewPage;