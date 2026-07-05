import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionSingleDisplay from '../components/QuestionSingleDisplay';
import CaseStudyDisplay from '../components/CaseStudyDisplay';
import QuizNavigationDrawer from '../components/QuizNavigationDrawer';

const QuizReviewDesktop = ({
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
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef(null);
  const currentQuestion = displayQuestions[currentQuestionIndex];
  const startNum = getGlobalQuestionNumber(currentQuestionIndex);
  const caseNum = getCaseStudyNumber(currentQuestionIndex);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentQuestionIndex]);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden relative selection:bg-blue-200 selection:text-slate-900">
      
      <QuizNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        originalQuiz={{ questions: displayQuestions }}
        userAnswers={userAnswers}
        bookmarkedQuestions={bookmarkedQuestions}
        quizMode="review"
        currentQuestionIndex={currentQuestionIndex} 
        setCurrentQuestionIndex={handleNavigateToQuestion}
      />

      {/* Header */}
      <header className="h-[64px] bg-white z-40 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex flex-col truncate">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lịch sử bài làm</span>
          <h1 className="text-base font-bold text-slate-800 truncate">{quiz.title}</h1>
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

      {/* Main Content Area */}
      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        {currentQuestion.type === 'group' ? (
          <CaseStudyDisplay
            question={currentQuestion}
            groupIndex={currentQuestionIndex}
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
        ) : (
          <QuestionSingleDisplay
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            handleAnswerChange={() => {}} 
            showFeedback={true} 
            bookmarkedQuestions={bookmarkedQuestions}
            handleToggleBookmark={handleToggleBookmark}
            globalNumber={startNum}
            textSize={textSize}
          />
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="h-[72px] flex justify-between items-center border-t border-slate-200 bg-white px-6 shrink-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
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
};

export default QuizReviewDesktop;