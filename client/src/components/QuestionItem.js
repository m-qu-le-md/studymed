// src/components/QuestionItem.js
import React, { useMemo } from 'react';

// Dùng chung một hệ màu an toàn với QuestionSingleDisplay
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

const QuestionItem = ({ 
  question, 
  index, 
  userAnswer, 
  onAnswerChange, 
  isBookmarked, 
  onToggleBookmark,
  showFeedback = false,
  textSize = 'base' 
}) => {
  const questionId = question._id;

  const titleSizeClass = 
    textSize === 'sm' ? 'text-base md:text-lg lg:text-xl' :
    textSize === 'lg' ? 'text-xl md:text-2xl lg:text-3xl' :
    'text-lg md:text-xl lg:text-2xl';

  const optionSizeClass = 
    textSize === 'sm' ? 'text-sm md:text-base lg:text-lg' :
    textSize === 'lg' ? 'text-lg md:text-xl lg:text-2xl' :
    'text-base md:text-lg lg:text-xl'; 

  // Tạo mảng ngẫu nhiên và khóa cứng lại bằng useMemo để chống giật nháy màu
  const randomColors = useMemo(() => {
    return [...PASTEL_VARIANTS].sort(() => 0.5 - Math.random());
  }, []);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className={`${titleSizeClass} font-bold text-slate-800 flex-1 pr-4 leading-relaxed transition-all duration-300`}>
          <span className="text-blue-600 font-bold mr-2">Câu {index + 1}:</span>
          {question.questionText}
        </h3>
        
        <button
          onClick={onToggleBookmark}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
            isBookmarked
              ? 'bg-red-50 border-red-200 text-red-600 font-medium'
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
          title="Đánh dấu để xem lại"
        >
          <span className="text-base">{isBookmarked ? '🚩' : '🏳️'}</span>
        </button>
      </div>
      
      {question.imageUrl && (
        <div className="mb-6 flex justify-center bg-slate-50 p-2 rounded-lg border border-slate-100 shrink-0">
          <img 
            src={question.imageUrl} 
            alt="Question Context" 
            className="max-w-full max-h-[30vh] object-contain rounded"
          />
        </div>
      )}

      <div className="space-y-3 flex-1">
        {question.options.map((option, idx) => {
          const isSelected = userAnswer?.includes(option._id) || false;
          
          let containerClass = "";
          let textClass = "text-slate-700";
          let indexClass = "text-slate-900";

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
              // Gọi màu từ mảng đã được random theo câu hỏi
              containerClass = randomColors[idx % randomColors.length];
              textClass = "text-slate-700 font-medium";
            }
          }

          return (
            <label key={option._id} className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${containerClass}`}>
  <input
    type={question.questionType === 'multi-select' ? 'checkbox' : 'radio'}
    name={`question-${questionId}`}
    value={option._id}
    checked={isSelected}
    onChange={() => onAnswerChange(questionId, option._id, question.questionType)}
    className="hidden"
    disabled={showFeedback}
  />
  <span className={`${textClass} ${optionSizeClass} flex-1 leading-relaxed transition-all duration-300 break-words`}>
                <span className={`font-bold mr-2 ${indexClass}`}>{String.fromCharCode(65 + idx)}.</span>
                {option.text}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionItem;