import React, { useState, useEffect, useMemo } from 'react';
import { useSwipe } from '../hooks/useSwipe';
import ExplanationBlock from '../components/ExplanationBlock';
import QuizNavigationDrawer from '../components/QuizNavigationDrawer';
import CaseStudyDisplay from '../components/CaseStudyDisplay';

const PASTEL_VARIANTS = [
  "bg-sky-50/70 border-sky-100", "bg-amber-50/70 border-amber-100",
  "bg-teal-50/70 border-teal-100", "bg-purple-50/70 border-purple-100",
  "bg-orange-50/70 border-orange-100", "bg-indigo-50/70 border-indigo-100",
  "bg-fuchsia-50/70 border-fuchsia-100", "bg-cyan-50/70 border-cyan-100",
  "bg-violet-50/70 border-violet-100", "bg-pink-50/70 border-pink-100"
];

const QuizTakingMobile = ({
  originalQuiz, displayQuestions, userAnswers, currentQuestionIndex,
  bookmarkedQuestions, timeLeft, isTimeUp, isTimerPaused, showFeedback,
  isNavDrawerOpen, handleAnswerChange, handleJumpToQuestion, handleNextQuestion,
  handlePreviousQuestion, handleSubmitQuiz, handleToggleBookmark,
  setIsNavDrawerOpen, setIsTimeUp, setIsTimerPaused, setShowFeedback,
  quizMode, textSize, getGlobalQuestionNumber, getCaseStudyNumber,
  answeredCount, totalQuestionsCount
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetContentType, setSheetContentType] = useState('caseStem');
  const scrollContainerRef = React.useRef(null);
  const currentQuestion = displayQuestions?.[currentQuestionIndex];

  // Tạo bộ màu thay đổi mỗi khi người dùng vuốt sang câu hỏi đơn mới
  const [randomColors, setRandomColors] = useState(() => [...PASTEL_VARIANTS].sort(() => 0.5 - Math.random()));

  useEffect(() => {
    setIsSheetOpen(false);
    setRandomColors([...PASTEL_VARIANTS].sort(() => 0.5 - Math.random()));
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentQuestionIndex]);

  const canCheckAnswer = currentQuestion?.type === 'group'
    ? (currentQuestion.childQuestions || []).every(cq => Array.isArray(userAnswers[cq._id]) && userAnswers[cq._id].length > 0)
    : (currentQuestion?.questionType === 'multi-select' 
        ? Array.isArray(userAnswers[currentQuestion._id]) && userAnswers[currentQuestion._id].length > 0 
        : false);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe(
    () => { if (currentQuestionIndex < (displayQuestions?.length || 0) - 1) handleNextQuestion(); },
    () => { if (currentQuestionIndex > 0) handlePreviousQuestion(); }
  );

  const openSheet = (type) => {
    setSheetContentType(type);
    setIsSheetOpen(true);
  };

  useEffect(() => {
    if (showFeedback && quizMode === 'review') {
      openSheet('explanation');
    }
  }, [showFeedback, quizMode]);

  const formatTime = (seconds) => {
    if (seconds === null) return 'Không giới hạn';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden selection:bg-blue-200">
      
      {isTimeUp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl text-center w-full max-w-sm">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Hết giờ!</h2>
            <p className="text-slate-500 text-base mb-8">Bạn đã dùng hết thời gian quy định cho ca lâm sàng này.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleSubmitQuiz} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform">Nộp bài ngay</button>
              <button onClick={() => { setIsTimeUp(false); setIsTimerPaused(true); }} className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Tiếp tục xem</button>
            </div>
          </div>
        </div>
      )}

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

      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => window.location.href = '/dashboard'} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-2 rounded-xl">
            <div className={`font-mono font-bold text-base ${isTimeUp && !isTimerPaused ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="w-[1px] h-4 bg-slate-300"></div>
            <button onClick={() => setIsNavDrawerOpen(true)} className="text-blue-600 flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            </button>
          </div>

          <button onClick={handleSubmitQuiz} className="p-2 text-emerald-600 font-bold text-sm">Nộp bài</button>
        </div>
        
        <div className="h-[2px] w-full bg-slate-50">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(answeredCount / (totalQuestionsCount || 1)) * 100}%` }} />
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onTouchStart={!isSheetOpen ? onTouchStart : undefined} 
        onTouchMove={!isSheetOpen ? onTouchMove : undefined} 
        onTouchEnd={!isSheetOpen ? onTouchEnd : undefined}
        className="flex-1 w-full overflow-y-auto pt-6 pb-32 custom-scrollbar bg-white"
      >
        <div key={currentQuestion?._id} className="animate-fadeIn px-5">
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg uppercase tracking-widest">
              {currentQuestion?.type === 'group' ? 'Ca lâm sàng' : 'Câu hỏi đơn'}
            </span>
            <button 
              onClick={() => handleToggleBookmark(currentQuestion._id)} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                bookmarkedQuestions.has(currentQuestion._id) 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-slate-50 text-slate-500'
              }`}
            >
              <span className="text-lg leading-none">{bookmarkedQuestions.has(currentQuestion._id) ? '🚩' : '🏳️'}</span>
            </button>
          </div>

          {currentQuestion?.type === 'group' ? (
            <CaseStudyDisplay 
              question={currentQuestion}
              groupIndex={currentQuestionIndex}
              userAnswers={userAnswers}
              handleAnswerChange={handleAnswerChange}
              showFeedback={showFeedback}
              bookmarkedQuestions={bookmarkedQuestions}
              handleToggleBookmark={handleToggleBookmark}
              startingNumber={getGlobalQuestionNumber(currentQuestionIndex)}
              onOpenSheet={openSheet}
            />
          ) : (
            <div className="space-y-6">
              <div className="text-[19px] md:text-[21px] font-bold text-slate-800 leading-relaxed tracking-tight">
                 <span className="text-blue-600 mr-2 font-extrabold">Câu {getGlobalQuestionNumber(currentQuestionIndex)}:</span>
                {currentQuestion?.questionText}
              </div>
              
              {currentQuestion?.imageUrl && (
                <div className="flex justify-center my-6">
                  <img src={currentQuestion.imageUrl} alt="Context" className="max-w-full max-h-[35vh] object-contain rounded-xl" />
                </div>
              )}
              
              <div className="space-y-3 pt-2">
                {currentQuestion?.options.map((option, idx) => {
                  const isSelected = userAnswers[currentQuestion._id]?.includes(option._id) || false;
                  let containerClass = "";
                  let textClass = "text-slate-700 font-medium";
                  
                  if (showFeedback) {
                    if (option.isCorrect) { containerClass = "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"; textClass = "text-emerald-900 font-bold"; }
                    else if (isSelected) { containerClass = "bg-rose-50 border-rose-400"; textClass = "text-rose-900 line-through opacity-80"; }
                    else { containerClass = "bg-slate-50/30 border-slate-100 opacity-40"; }
                  } else if (isSelected) { 
                    containerClass = "bg-blue-50 border-blue-400 ring-1 ring-blue-400"; 
                    textClass = "text-blue-900 font-bold"; 
                  } else {
                    containerClass = randomColors[idx % randomColors.length];
                  }
                  
                  return (
                    <label key={option._id} className={`flex items-start p-4 border rounded-2xl w-full cursor-pointer transition-all active:scale-[0.99] ${containerClass}`}>
                      <input type={currentQuestion.questionType === 'multi-select' ? 'checkbox' : 'radio'} className="hidden" checked={isSelected} onChange={() => handleAnswerChange(currentQuestion._id, option._id, currentQuestion.questionType || 'single-choice')} disabled={showFeedback} />
                      <span className={`text-[17px] leading-snug flex-1 ${textClass}`}>
                        <span className="font-bold mr-3 text-[18px] opacity-80">{String.fromCharCode(65 + idx)}.</span>
                        {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {showFeedback && (
            <button onClick={() => openSheet('explanation')} className="mt-8 w-full bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-bold flex justify-center items-center gap-2 active:bg-indigo-100 transition-colors">
              💡 Phân tích đáp án
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex gap-3 z-30 pb-safe">
        <button 
          onClick={handlePreviousQuestion} 
          disabled={currentQuestionIndex === 0} 
          className="w-[25%] py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 disabled:opacity-30 active:bg-slate-200 transition-colors flex justify-center items-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <button 
          onClick={
            quizMode === 'review' && !showFeedback 
              ? () => setShowFeedback(true) 
              : currentQuestionIndex === (displayQuestions?.length || 0) - 1 
                ? handleSubmitQuiz 
                : handleNextQuestion
          } 
          disabled={quizMode === 'review' && !showFeedback && !canCheckAnswer}
          className={`flex-1 py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98] ${
             (quizMode === 'review' && !showFeedback && !canCheckAnswer) ? 'bg-blue-200' : 
             (currentQuestionIndex === (displayQuestions?.length || 0) - 1 && (quizMode === 'test' || showFeedback)) ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
          }`}
        >
          {quizMode === 'review' && !showFeedback 
            ? 'Kiểm tra' 
            : currentQuestionIndex === (displayQuestions?.length || 0) - 1 
              ? 'Nộp bài' 
              : 'Câu tiếp theo'}
        </button>
      </div>

      {isSheetOpen && (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsSheetOpen(false)}></div>
          
          <div className="relative w-full bg-white rounded-t-[32px] flex flex-col max-h-[85vh] transform transition-transform duration-300 ease-out translate-y-0">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4 flex-shrink-0"></div>
            
            <button onClick={() => setIsSheetOpen(false)} className="absolute top-4 right-5 p-2 bg-slate-100 rounded-full text-slate-500 active:bg-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="px-6 pt-2 pb-12 overflow-y-auto flex-1 custom-scrollbar">
              
              {sheetContentType === 'caseStem' && currentQuestion?.type === 'group' && (
                <div className="pb-8">
                  <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-3">
                    <span className="w-2.5 h-6 rounded-full bg-blue-600"></span> Bệnh án lâm sàng
                  </h3>
                  <div className="text-slate-700 text-[17px] leading-relaxed whitespace-pre-line bg-blue-50/30 p-6 rounded-[24px] border border-blue-100/50">
                    {currentQuestion.caseStem}
                  </div>
                  {currentQuestion.imageUrl && (
                    <div className="mt-6 flex justify-center">
                      <img src={currentQuestion.imageUrl} alt="Case visual" className="w-full rounded-2xl" />
                    </div>
                  )}
                </div>
              )}
              
              {sheetContentType === 'explanation' && showFeedback && (
                <div className="pb-8">
                  <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-3">
                    <span className="w-2.5 h-6 rounded-full bg-indigo-500"></span> Phân tích y khoa
                  </h3>
                  
                  <div className="space-y-8">
                    {currentQuestion?.type === 'group' ? (
                      currentQuestion.childQuestions.map((childQ, cqIdx) => (
                        <div key={childQ._id}>
                           <div className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                             <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs">Mục {getGlobalQuestionNumber(currentQuestionIndex) + cqIdx}</span>
                           </div>
                           <ExplanationBlock question={childQ} userAnswers={userAnswers[childQ._id] || []} mode="review" />
                        </div>
                      ))
                    ) : (
                      <ExplanationBlock question={currentQuestion} userAnswers={userAnswers[currentQuestion?._id] || []} mode="review" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTakingMobile;