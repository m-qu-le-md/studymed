import React, { useMemo, useState, useEffect } from 'react';
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

  // Khởi tạo state để tự điều khiển việc đóng/mở Bottom Sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Mở sheet tự động khi showFeedback kích hoạt hoặc khi chuyển câu hỏi
  useEffect(() => {
    if (showFeedback) {
      setIsSheetOpen(true);
    } else {
      setIsSheetOpen(false);
    }
  }, [currentQuestion._id, showFeedback]);

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white">
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

         {/* Nút để gọi lại Bottom Sheet khi người dùng đã đóng nó đi */}
         {showFeedback && !isSheetOpen && (
           <button
             onClick={() => setIsSheetOpen(true)}
             className="mt-6 w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-colors"
           >
             💡 Xem phân tích đáp án
           </button>
         )}
      </div>

      {/* Bottom Sheet Giải thích (Có Header và Nút Đóng) */}
      <div 
        className={`absolute bottom-0 left-0 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-slate-100 transition-transform duration-300 ease-out z-50 flex flex-col ${
          isSheetOpen ? 'translate-y-0 h-[70%]' : 'translate-y-full h-0'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 shrink-0 border-b border-slate-100">
          <h4 className="font-bold text-slate-900 text-[19px] flex items-center gap-3">
            <span className="w-2.5 h-6 rounded-full bg-emerald-500"></span> Phân tích y khoa
          </h4>
          <button 
            onClick={() => setIsSheetOpen(false)} 
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <ExplanationBlock 
              question={currentQuestion} 
              userAnswers={userAnswers[currentQuestion._id]} 
              mode="review"
            />
        </div>
      </div>
      
      {/* Lớp phủ mờ giúp click ra ngoài để đóng */}
      {isSheetOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 transition-opacity" 
          onClick={() => setIsSheetOpen(false)}
        />
      )}
    </div>
  );
}

export default QuestionSingleMobile;