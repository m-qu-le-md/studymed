// src/components/QuestionSingleDisplay.js
import React, { useMemo } from 'react';
import ExplanationBlock from './ExplanationBlock';

// Hệ màu pastel nhạt (10 màu) - Đã loại bỏ Đỏ và Xanh lục để không trùng với màu Đúng/Sai
const PASTEL_VARIANTS = [
  "bg-sky-50/70 border-sky-100 hover:bg-sky-100",
  "bg-amber-50/70 border-amber-100 hover:bg-amber-100",
  "bg-teal-50/70 border-teal-100 hover:bg-teal-100",
  "bg-purple-50/70 border-purple-100 hover:bg-purple-100",
  "bg-orange-50/70 border-orange-100 hover:bg-orange-100",
  "bg-indigo-50/70 border-indigo-100 hover:bg-indigo-100",
  "bg-fuchsia-50/70 border-fuchsia-100 hover:bg-fuchsia-100",
  "bg-cyan-50/70 border-cyan-100 hover:bg-cyan-100",
  "bg-violet-50/70 border-violet-100 hover:bg-violet-100",
  "bg-pink-50/70 border-pink-100 hover:bg-pink-100"
];

const QuestionSingleDisplay = ({
  currentQuestion,
  currentQuestionIndex,
  userAnswers,
  handleAnswerChange,
  showFeedback,
  bookmarkedQuestions,
  handleToggleBookmark,
  globalNumber,
  textSize = 'base'
}) => {

  const titleSizeClass = 
    textSize === 'sm' ? 'text-base md:text-lg' :
    textSize === 'lg' ? 'text-xl md:text-2xl' :
    'text-lg md:text-xl';

  const optionSizeClass = 
    textSize === 'sm' ? 'text-sm md:text-base' :
    textSize === 'lg' ? 'text-lg md:text-xl' :
    'text-base md:text-lg';

  // Khởi tạo mảng màu ngẫu nhiên cho câu hỏi hiện tại. 
  // Mảng này sẽ giữ nguyên, không bị random lại khi bạn click chọn đáp án (re-render)
  const randomColors = useMemo(() => {
    return [...PASTEL_VARIANTS].sort(() => 0.5 - Math.random());
  }, []);

  return (
    <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* CỘT TRÁI: Nội dung câu hỏi và các phương án */}
      <div className="flex-1 min-w-0 bg-white rounded-xl p-6 border border-slate-200 flex flex-col h-full overflow-y-auto shadow-sm">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <h2 className={`${titleSizeClass} font-bold text-slate-800 flex-1 pr-4 leading-relaxed`}>
            <span className="text-blue-600 font-bold mr-2">Câu {globalNumber}:</span>
            {currentQuestion.questionText}
          </h2>
          
          <button
            onClick={() => handleToggleBookmark(currentQuestion._id)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
              bookmarkedQuestions.has(currentQuestion._id)
                ? 'bg-red-50 border-red-200 text-red-600 font-medium'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
            title="Đánh dấu để xem lại"
          >
            <span className="text-base">{bookmarkedQuestions.has(currentQuestion._id) ? '🚩' : '🏳️'}</span>
          </button>
        </div>
        
        {currentQuestion.imageUrl && (
          <div className="mb-4 flex justify-center bg-slate-50 p-2 rounded-lg border border-slate-100 shrink-0">
            <img 
              src={currentQuestion.imageUrl} 
              alt="Question Context" 
              className="max-w-full max-h-[25vh] object-contain rounded"
            />
          </div>
        )}

        {/* Danh sách các Options */}
        <div className="space-y-3 flex-1">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = userAnswers[currentQuestion._id]?.includes(option._id) || false;
            
            let containerClass = "";
            let textClass = "text-slate-700";
            let indexClass = "text-slate-800";

            if (showFeedback) {
              if (option.isCorrect) {
                containerClass = "bg-emerald-100 border-emerald-500 ring-1 ring-emerald-500";
                textClass = "text-emerald-900 font-bold";
                indexClass = "text-emerald-900";
              } else if (isSelected) {
                containerClass = "bg-rose-100 border-rose-500 ring-1 ring-rose-500";
                textClass = "text-rose-900 line-through opacity-80 font-medium";
                indexClass = "text-rose-900";
              } else {
                containerClass = "bg-slate-50 border-slate-200 opacity-40 grayscale";
              }
            } else {
              if (isSelected) {
                containerClass = "bg-blue-100 border-blue-400 ring-1 ring-blue-400";
                textClass = "text-blue-900 font-bold";
                indexClass = "text-blue-900";
              } else {
                // Áp dụng màu đã được xáo trộn ngẫu nhiên
                containerClass = randomColors[optIdx % randomColors.length];
                textClass = "text-slate-700 font-medium";
              }
            }

            return (
              <label key={optIdx} className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${containerClass}`}>
                <input
                  type={currentQuestion.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                  name={`question_${currentQuestion._id}`}
                  value={option._id}
                  checked={isSelected}
                  onChange={() => handleAnswerChange(currentQuestion._id, option._id, currentQuestion.questionType)}
                  className={`mt-1 h-4 w-4 shrink-0 ${currentQuestion.questionType === 'multi-select' ? 'form-checkbox text-blue-600 rounded' : 'form-radio text-blue-600'}`}
                  disabled={showFeedback}
                />
                <span className={`ml-3 ${textClass} ${optionSizeClass} leading-relaxed flex-1 break-words`}>
                  <span className={`font-bold mr-2 ${indexClass}`}>{String.fromCharCode(65 + optIdx)}.</span>
                  {option.text}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* CỘT PHẢI: Giải thích */}
      {showFeedback && (
        <div className="w-full lg:w-[45%] shrink-0 bg-white border border-slate-200 rounded-xl p-6 h-full overflow-y-auto shadow-sm animate-fadeIn">
          <div className="border-b border-slate-100 pb-2 mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
              Cơ sở y khoa & Giải thích
            </h3>
          </div>
          <ExplanationBlock 
            question={currentQuestion} 
            userAnswers={userAnswers[currentQuestion._id]} 
            mode="review"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionSingleDisplay;