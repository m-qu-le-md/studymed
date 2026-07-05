import React, { useMemo } from 'react';

// Khai báo mảng màu Pastel
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

const CaseStudyMobile = ({ question, startingNumber, userAnswers, showFeedback, onOpenSheet, handleAnswerChange }) => {
  // Tạo bộ màu ngẫu nhiên nhưng giữ nguyên giá trị cho từng câu hỏi con (tránh nháy màu khi re-render)
  const randomColorsMap = useMemo(() => {
    const map = {};
    if (question.childQuestions) {
      question.childQuestions.forEach(cq => {
        map[cq._id] = [...PASTEL_VARIANTS].sort(() => 0.5 - Math.random());
      });
    }
    return map;
  }, [question]);

  return (
    <div className="space-y-6">
      {question.childQuestions?.map((childQ, index) => (
        <div key={childQ._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="font-semibold text-slate-800 mb-3">
            {startingNumber + index}. {childQ.question}
          </div>
          <div className="space-y-3">
            {childQ.options.map((option, idx) => {
              const isSelected = userAnswers[childQ._id]?.includes(option._id) || false;
              const randomColors = randomColorsMap[childQ._id] || PASTEL_VARIANTS; // Trích xuất màu

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
                // Áp dụng màu Pastel ngẫu nhiên
                containerClass = randomColors[idx % randomColors.length];
              }

              return (
                <label key={option._id} className={`flex items-start p-4 border rounded-2xl w-full cursor-pointer transition-all active:scale-[0.99] ${containerClass}`}>
                  <input 
                    type={childQ.questionType === 'multi-select' ? 'checkbox' : 'radio'} 
                    className="hidden" 
                    checked={isSelected} 
                    onChange={() => handleAnswerChange(childQ._id, option._id, childQ.questionType || 'single-choice')} 
                    disabled={showFeedback} 
                  />
                  <span className={`text-[17px] leading-snug flex-1 ${textClass}`}>
                    <span className="font-bold mr-3 text-[18px] opacity-80">{String.fromCharCode(65 + idx)}.</span>
                    {option.text}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CaseStudyMobile;