import React, { useMemo } from 'react';
import ExplanationBlock from './ExplanationBlock';

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

const CaseStudyMobile = ({ question, startingNumber, userAnswers, showFeedback, handleAnswerChange }) => {
  
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
      {/* VÙNG 1: BỆNH ÁN GỐC HIỂN THỊ TRỰC QUAN */}
      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm mb-6">
        <h3 className="font-bold text-blue-800 text-[15px] flex items-center gap-2 mb-3 uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          Bệnh án lâm sàng
        </h3>
        <div className="text-slate-800 text-[16px] leading-relaxed whitespace-pre-line">
          {question.caseStem}
        </div>
        {question.imageUrl && (
          <div className="mt-4 flex justify-center">
            <img src={question.imageUrl} alt="Case visual" className="w-full max-h-[30vh] object-contain rounded-xl border border-blue-200 bg-white p-1" />
          </div>
        )}
      </div>

      {/* VÙNG 2: DANH SÁCH CÂU HỎI CON */}
      {question.childQuestions?.map((childQ, index) => (
        <div key={childQ._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="font-semibold text-slate-800 mb-4 text-[18px] leading-relaxed">
            <span className="text-blue-600 mr-2 font-extrabold">Câu {startingNumber + index}:</span>
            {childQ.questionText} {/* Đã sửa lỗi: childQ.question -> childQ.questionText */}
          </div>

          {childQ.imageUrl && (
            <div className="mb-4 flex justify-center">
              <img src={childQ.imageUrl} alt="Context visual" className="max-w-full max-h-[25vh] rounded-xl object-contain" />
            </div>
          )}

          <div className="space-y-3">
            {childQ.options.map((option, idx) => {
              const isSelected = userAnswers[childQ._id]?.includes(option._id) || false;
              const randomColors = randomColorsMap[childQ._id] || PASTEL_VARIANTS; 

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

          {/* VÙNG 3: GIẢI THÍCH CHI TIẾT KHI XEM LẠI */}
          {showFeedback && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-emerald-500"></span> Phân tích đáp án
              </div>
              <ExplanationBlock 
                question={childQ} 
                userAnswers={userAnswers[childQ._id] || []} 
                mode="review" 
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CaseStudyMobile;