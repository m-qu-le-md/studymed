import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionSingleDisplay from '../components/QuestionSingleDisplay';
import CaseStudyDisplay from '../components/CaseStudyDisplay';
import QuizNavigationDrawer from '../components/QuizNavigationDrawer';

const QuizReviewMobile = ({
  quiz, displayQuestions, userAnswers, bookmarkedQuestions,
  currentQuestionIndex, isNavDrawerOpen, textSize, setIsNavDrawerOpen,
  handleToggleBookmark, getGlobalQuestionNumber, getCaseStudyNumber,
  handleNavigateToQuestion, handleNextQuestion, handlePreviousQuestion
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef(null);
  const currentQuestion = displayQuestions[currentQuestionIndex];

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentQuestionIndex]);
  const startNum = getGlobalQuestionNumber(currentQuestionIndex);
  const caseNum = getCaseStudyNumber(currentQuestionIndex);

  const progressPercent = ((currentQuestionIndex + 1) / displayQuestions.length) * 100;

  return (
    <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden selection:bg-blue-200">
      
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

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex flex-col items-center max-w-[60%] truncate">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lịch sử bài làm</span>
            <span className="text-sm font-bold text-slate-700 truncate w-full text-center">{quiz.title}</span>
          </div>

          <button onClick={() => setIsNavDrawerOpen(true)} className="p-2 text-blue-600 rounded-full bg-blue-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          </button>
        </div>
        
        <div className="h-[2px] w-full bg-slate-50">
          <div className="h-full bg-indigo-500 transition-all duration-300 rounded-r-full" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 w-full overflow-y-auto bg-white custom-scrollbar pb-24">
        <div key={currentQuestion?._id} className="animate-fadeIn h-full">
          {currentQuestion.type === 'group' ? (
            <div className="px-5 pt-6">
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
            </div>
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
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 flex gap-3 z-30 pb-safe">
        <button 
          onClick={() => {
            if (currentQuestionIndex === displayQuestions.length - 1) {
              navigate('/dashboard');
            } else {
              handleNextQuestion();
            }
          }}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-[17px] transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 flex justify-center items-center"
        >
          {currentQuestionIndex === displayQuestions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
        </button>
      </div>

    </div>
  );
};

export default QuizReviewMobile;