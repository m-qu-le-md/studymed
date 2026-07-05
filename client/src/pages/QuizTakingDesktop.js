// src/pages/QuizTakingDesktop.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionItem from '../components/QuestionItem';
import CaseStudyDisplay from '../components/CaseStudyDisplay';
import QuestionSingleDisplay from '../components/QuestionSingleDisplay';
import QuizNavigationDrawer from '../components/QuizNavigationDrawer';

// Hàm format thời gian mang từ file cũ sang
const formatTime = (seconds) => {
  if (seconds === null) return 'Không giới hạn';
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [h, m, s].map(v => v < 10 ? "0" + v : v);
  return h > 0 ? parts.join(":") : `${parts[1]}:${parts[2]}`;
};

const QuizTakingDesktop = ({
  originalQuiz, displayQuestions, userAnswers, currentQuestionIndex,
  bookmarkedQuestions, timeLeft, isTimeUp, isTimerPaused, showFeedback,
  isNavDrawerOpen, handleAnswerChange, handleJumpToQuestion, handleNextQuestion,
  handlePreviousQuestion, handleSubmitQuiz, handleToggleBookmark,
  setIsNavDrawerOpen, setIsTimeUp, setIsTimerPaused, setShowFeedback,
  quizMode, textSize, getGlobalQuestionNumber, getCaseStudyNumber,
  answeredCount, totalQuestionsCount
}) => {
  const navigate = useNavigate();
  const currentQuestion = displayQuestions?.[currentQuestionIndex];

  useEffect(() => {
    if (quizMode !== 'test') return;

    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        const currentId = visibleEntries[0].target.id.replace('question-', '');
        const currentIdx = displayQuestions.findIndex(q => q._id === currentId);
        if (currentIdx !== -1 && currentIdx !== currentQuestionIndex) {
          handleJumpToQuestion(currentIdx);
        }
      }
    }, { threshold: 0.5 });

    displayQuestions.forEach(q => {
      const el = document.getElementById(`question-${q._id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [displayQuestions, quizMode, currentQuestionIndex, handleJumpToQuestion]);
  
  // TÍNH TOÁN ĐỘC LẬP: Kiểm tra xem đã trả lời đủ điều kiện để sáng nút Kiểm tra chưa
  const canCheckAnswer = currentQuestion?.type === 'group'
    ? (currentQuestion.childQuestions || []).every(cq => Array.isArray(userAnswers[cq._id]) && userAnswers[cq._id].length > 0)
    : (currentQuestion?.questionType === 'multi-select' 
        ? Array.isArray(userAnswers[currentQuestion._id]) && userAnswers[currentQuestion._id].length > 0 
        : false);

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

      {/* Main Container */}
      <div className="flex-1 overflow-hidden relative">
        {quizMode === 'test' ? (
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
                    <div key={item._id} id={`question-${item._id}`} className="min-h-[600px] h-[75vh] mb-8">
                      <CaseStudyDisplay
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
          <div className="h-full w-full p-4 md:p-6 overflow-hidden">
            {currentQuestion && (
              currentQuestion.type === 'group' ? (
                <CaseStudyDisplay
                  question={currentQuestion} groupIndex={currentQuestionIndex} userAnswers={userAnswers}
                  handleAnswerChange={handleAnswerChange} showFeedback={showFeedback}
                  bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark} quizMode={quizMode}
                  startingNumber={getGlobalQuestionNumber(currentQuestionIndex)}
                  caseStudyNumber={getCaseStudyNumber(currentQuestionIndex)}
                  textSize={textSize}
                />
              ) : (
                <QuestionSingleDisplay
                  currentQuestion={currentQuestion} currentQuestionIndex={currentQuestionIndex} userAnswers={userAnswers}
                  handleAnswerChange={handleAnswerChange} showFeedback={showFeedback}
                  bookmarkedQuestions={bookmarkedQuestions} handleToggleBookmark={handleToggleBookmark}
                  globalNumber={getGlobalQuestionNumber(currentQuestionIndex)}
                  textSize={textSize}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Footer cố định */}
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
            
            {!showFeedback && currentQuestion && (currentQuestion.type === 'group' || currentQuestion.questionType === 'multi-select') ? (
                <button onClick={() => setShowFeedback(true)} disabled={!canCheckAnswer} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-40">
                    Kiểm tra
                </button>
            ) : currentQuestionIndex < (displayQuestions?.length || 0) - 1 ? (
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
};

export default QuizTakingDesktop;