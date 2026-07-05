import React, { useMemo } from 'react';
import ExplanationBlock from './ExplanationBlock';

const PASTEL_VARIANTS = [
  "bg-sky-50/50 border-sky-100", "bg-amber-50/50 border-amber-100",
  "bg-teal-50/50 border-teal-100", "bg-purple-50/50 border-purple-100",
  "bg-orange-50/50 border-orange-100", "bg-indigo-50/50 border-indigo-100"
];

function QuestionSingleMobile({
  currentQuestion, userAnswers, handleAnswerChange, showFeedback,
  bookmarkedQuestions, handleToggleBookmark, globalNumber, textSize = 'base'
}) {
  const randomColors = useMemo(() => {
    return [...PASTEL_VARIANTS].sort(() => 0.5 - Math.random());
  }, []);

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white">
      {/* Vùng cuộn chứa câu hỏi, dùng px-5 thay vì p-4 -> p-5 */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-28 custom-scrollbar">
         
         <div className="flex justify-between items-start mb-6">
           <div className="text-[19px] md:text-[21px] font-bold text-slate-800 leading-relaxed tracking-tight pr-4">
             <span className="text-blue-600 mr-2 font-extrabold">Câu {globalNumber}:</span>
             {currentQuestion.questionText}
           </div>
           
           <button
              onClick={() => handleToggleBookmark(currentQuestion._id)}
              className={`p-2 rounded-xl text-lg shrink-0 ${bookmarkedQuestions.has(currentQuestion._id) ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}
           >
             {bookmarkedQuestions.has(currentQuestion._id) ? '🚩' : '🏳️'}
           </button>
         </div>
         
         {currentQuestion.imageUrl && (
           <div className="flex justify-center mb-6">
              <img src={currentQuestion.imageUrl} alt="Context" className="max-w-full max-h-[35vh] rounded-xl object-contain" />
           </div>
         )}

         <div className="space-y-3">
           {currentQuestion.options.map((option, optIdx) => {
             const isSelected = userAnswers[currentQuestion._id]?.includes(option._id) || false;
             let containerClass = "";
             
             if (showFeedback) {
               if (option.isCorrect) containerClass = "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900 font-bold";
               else if (isSelected) containerClass = "bg-rose-50 border-rose-400 text-rose-900 line-through opacity-80";
               else containerClass = "bg-slate-50/50 border-slate-100 text-slate-700 opacity-50";
             } else {
               containerClass = isSelected ? "bg-blue-50 border-blue-400 ring-1 ring-blue-400 text-blue-900 font-bold" : `${randomColors[optIdx % randomColors.length]} text-slate-700 font-medium`;
             }

             return (
               <label key={optIdx} className={`flex items-start p-4 border rounded-2xl w-full transition-all ${containerClass}`}>
                 <input
                   type={currentQuestion.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                   checked={isSelected}
                   onChange={() => handleAnswerChange(currentQuestion._id, option._id, currentQuestion.questionType)}
                   className="hidden"
                   disabled={showFeedback}
                 />
                 <span className="text-[17px] leading-snug flex-1">
                   <span className="font-bold mr-3 text-[18px] opacity-80">{String.fromCharCode(65 + optIdx)}.</span>
                   {option.text}
                 </span>
               </label>
             );
           })}
         </div>
      </div>

      {/* Bottom Sheet Giải thích tối ưu lại UI */}
      <div 
        className={`absolute bottom-0 left-0 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-slate-100 transition-transform duration-300 ease-out z-50 flex flex-col ${
          showFeedback ? 'translate-y-0 h-[65%]' : 'translate-y-full h-0'
        }`}
      >
        <div className="flex justify-center py-4 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
            <h4 className="font-bold text-slate-900 text-xl mb-4 flex items-center gap-3">
              <span className="w-2.5 h-6 rounded-full bg-emerald-500"></span> Phân tích y khoa
            </h4>
            <ExplanationBlock 
              question={currentQuestion} 
              userAnswers={userAnswers[currentQuestion._id]} 
              mode="review"
            />
        </div>
      </div>
      
      {showFeedback && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40" />
      )}
    </div>
  );
}

export default QuestionSingleMobile;