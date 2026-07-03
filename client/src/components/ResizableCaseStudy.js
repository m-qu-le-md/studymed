// src/components/ResizableCaseStudy.js
import React, { useState, useRef, useCallback, useMemo } from 'react';
import ExplanationBlock from './ExplanationBlock';

// Hệ màu pastel nhạt (10 màu) đồng bộ toàn hệ thống
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

const ResizableCaseStudy = ({
  question,
  groupIndex,
  userAnswers,
  handleAnswerChange,
  showFeedback,
  bookmarkedQuestions,
  handleToggleBookmark,
  quizMode,
  startingNumber,
  caseStudyNumber,
  textSize = 'base'
}) => {
  
  const [leftWidth, setLeftWidth] = useState(33.33);
  const containerRef = useRef(null);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newWidth < 20) newWidth = 20;
      if (newWidth > 60) newWidth = 60;
      
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const titleSizeClass = 
    textSize === 'sm' ? 'text-base md:text-lg' :
    textSize === 'lg' ? 'text-xl md:text-2xl' :
    'text-lg md:text-xl';

  const optionSizeClass = 
    textSize === 'sm' ? 'text-sm md:text-base' :
    textSize === 'lg' ? 'text-lg md:text-xl' :
    'text-base md:text-lg';

  // THUẬT TOÁN XÁO TRỘN MÀU CHO CASE STUDY
  // Tạo một Map lưu trữ mảng màu ngẫu nhiên riêng biệt cho TỪNG câu hỏi con
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
    <div ref={containerRef} className="w-full h-full max-w-[1600px] mx-auto flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* CỘT 1 (TRÁI): Bệnh án */}
      <div 
        style={{ width: `calc(${leftWidth}% - 8px)` }} 
        className="shrink-0 bg-white rounded-xl p-5 md:p-6 flex flex-col h-full overflow-y-auto shadow-sm border-2 border-blue-100 custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-5 shrink-0 border-b-2 border-blue-50 pb-3">
          <h3 className="font-bold text-blue-800 text-sm md:text-base uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            Bệnh án gốc - Ca lâm sàng {caseStudyNumber}
          </h3>
          
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((tag, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 text-[11px] px-2.5 py-1 rounded-md font-bold">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-slate-800 text-[15px] md:text-[16px] leading-relaxed whitespace-pre-line flex-1 select-text">
          {question.caseStem}
        </div>

        {question.imageUrl && (
          <div className="mt-5 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0 flex justify-center">
            <img 
              src={question.imageUrl} 
              alt="Clinical Data" 
              className="max-w-full max-h-[35vh] object-contain rounded-lg"
            />
          </div>
        )}
      </div>

      {/* THANH KÉO (RESIZER) */}
      <div 
        className="hidden lg:flex w-4 mx-1 cursor-col-resize items-center justify-center group shrink-0 z-10"
        onMouseDown={startResizing}
        title="Kéo để thay đổi kích thước"
      >
        <div className="h-16 w-1.5 bg-slate-200 rounded-full group-hover:bg-blue-500 transition-colors"></div>
      </div>

      {/* CỘT 2 (GIỮA): Câu hỏi con & Các lựa chọn */}
      <div className={`h-full overflow-y-auto bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out ${
        showFeedback ? 'w-full lg:w-[35%] shrink-0' : 'flex-1 min-w-0'
      }`}>
        <div className="border-b-2 border-slate-50 pb-3 mb-5 shrink-0 flex justify-between items-center">
          <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
            Câu hỏi & Lựa chọn
          </h4>
          <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-md">
            {question.childQuestions?.length || 0} câu
          </span>
        </div>

        <div className="space-y-8 flex-1 custom-scrollbar">
          {question.childQuestions?.map((childQ, cqIdx) => {
            const globalCqNum = startingNumber + cqIdx;
            const isCqBookmarked = bookmarkedQuestions.has(childQ._id);
            const cqAnswers = userAnswers[childQ._id] || [];
            
            // Lấy ra mảng màu đã được xáo trộn dành riêng cho câu hỏi này
            const randomColors = randomColorsMap[childQ._id] || PASTEL_VARIANTS;

            return (
              <div key={childQ._id || cqIdx} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <h5 className={`${titleSizeClass} font-bold text-slate-800 leading-relaxed flex-1`}>
                    <span className="text-blue-700 font-extrabold mr-2">Câu {globalCqNum}:</span>
                    {childQ.questionText}
                  </h5>
                  <button
                    onClick={() => handleToggleBookmark(childQ._id)}
                    className={`p-2 rounded-lg border transition-all shrink-0 ${
                      isCqBookmarked 
                        ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                  >
                    <span className="text-base block leading-none">{isCqBookmarked ? '🚩' : '🏳️'}</span>
                  </button>
                </div>

                {childQ.imageUrl && (
                  <div className="mb-4 flex justify-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <img src={childQ.imageUrl} alt="Context visual" className="max-w-full max-h-[20vh] object-contain rounded"/>
                  </div>
                )}

                {/* Danh sách Lựa chọn đồng bộ logic màu sắc */}
                <div className="space-y-3">
                  {childQ.options?.map((option, optIdx) => {
                    const isSelected = cqAnswers.includes(option._id);
                    
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
                        // Áp dụng màu đã được xáo trộn ngẫu nhiên từ Map
                        containerClass = randomColors[optIdx % randomColors.length];
                        textClass = "text-slate-700 font-medium";
                      }
                    }

                    return (
                      <label key={option._id || optIdx} className={`flex items-start p-3.5 md:p-4 border rounded-xl cursor-pointer transition-all duration-200 relative ${containerClass}`}>
                        <input
                          type={childQ.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                          name={`child_question_${childQ._id}`}
                          value={option._id}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(childQ._id, option._id, childQ.questionType || 'single-choice')}
                          className={`mt-1 h-4 w-4 md:h-5 md:w-5 shrink-0 transition-transform ${childQ.questionType === 'multi-select' ? 'form-checkbox text-blue-600 rounded' : 'form-radio text-blue-600'}`}
                          disabled={showFeedback}
                        />
                        <span className={`ml-3 md:ml-4 ${textClass} ${optionSizeClass} leading-relaxed flex-1 break-words`}>
                          <span className={`font-bold mr-2 ${indexClass}`}>
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CỘT 3 (PHẢI): Giải thích chi tiết */}
      {showFeedback && (
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl p-5 md:p-6 h-full overflow-y-auto shadow-sm animate-fadeIn ml-0 lg:ml-4 custom-scrollbar">
          <div className="border-b-2 border-indigo-50 pb-3 mb-5 shrink-0">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-md rotate-45"></span>
              Phân tích đáp án
            </h3>
          </div>
          
          <div className="space-y-6">
            {question.childQuestions?.map((childQ, cqIdx) => {
              const globalCqNum = startingNumber + cqIdx;
              return (
                <div key={`exp-panel-${childQ._id}`} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-800 text-[14px] md:text-[15px] border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded text-xs">Mục {globalCqNum}</span>
                    Giải thích chi tiết
                  </div>
                  
                  <ExplanationBlock 
                    question={childQ} 
                    userAnswers={userAnswers[childQ._id]} 
                    mode="review"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ResizableCaseStudy;