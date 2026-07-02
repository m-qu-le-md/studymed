// src/components/ResizableCaseStudy.js
import React, { useState, useEffect, useRef } from 'react';
import ExplanationBlock from './ExplanationBlock';

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
  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [isDragging, setIsDragging] = useState(false);

  // --- THUẬT TOÁN ĐIỀU PHỐI MÀU VIỀN THEO STT TÌNH HUỐNG ---
  const getBorderColor = (num) => {
    const colors = [
      'border-red-400',    // Case 1: Đỏ
      'border-blue-400',   // Case 2: Xanh dương
      'border-emerald-400',// Case 3: Xanh lá
      'border-amber-500',  // Case 4: Vàng cam
      'border-purple-400', // Case 5: Tím
      'border-pink-400'    // Case 6: Hồng
    ];
    // Sử dụng phép chia lấy dư để lặp lại bảng màu nếu có quá nhiều Case
    return colors[(num - 1) % colors.length];
  };

  const borderColorClass = getBorderColor(caseStudyNumber);

  // THUẬT TOÁN CỠ CHỮ
  const titleSizeClass = 
    textSize === 'sm' ? 'text-base md:text-lg lg:text-xl' :
    textSize === 'lg' ? 'text-xl md:text-2xl lg:text-3xl' :
    'text-lg md:text-xl lg:text-2xl';

  const optionSizeClass = 
    textSize === 'sm' ? 'text-sm md:text-base lg:text-lg' :
    textSize === 'lg' ? 'text-lg md:text-xl lg:text-2xl' :
    'text-base md:text-lg lg:text-xl';

  const stemSizeClass = 
    textSize === 'sm' ? 'text-sm md:text-base' :
    textSize === 'lg' ? 'text-lg md:text-xl' :
    'text-base md:text-lg';

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth < 20) newWidth = 20;
      if (newWidth > 70) newWidth = 70;
      setLeftWidth(newWidth);
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="flex flex-col lg:flex-row items-start mb-16 md:mb-24 w-full" // Tăng margin bottom để phân tách các Case rõ hơn
      ref={containerRef}
      style={{
        '--left-width': `${leftWidth}%`,
        '--right-width': `calc(${100 - leftWidth}% - 1.5rem)`
      }}
    >
      {/* CỘT TRÁI: THÂN BỆNH ÁN */}
      <div className={`w-full lg:w-[var(--left-width)] lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-100px)] overflow-y-auto bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border-2 ${borderColorClass} mb-6 lg:mb-0 transition-all duration-300`}>
        <div className="flex items-center gap-2 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Tình huống lâm sàng {caseStudyNumber}
          </h2>
        </div>

        {question.imageUrl && (
          <div className="mb-5 md:mb-6 flex justify-center bg-white p-2 rounded-xl border border-gray-100">
            <img src={question.imageUrl} alt="Case Study" className="max-w-full max-h-[40vh] md:max-h-96 object-contain rounded-lg"/>
          </div>
        )}
        <div className={`text-gray-800 leading-relaxed ${stemSizeClass} whitespace-pre-wrap transition-all duration-300`}>{question.caseStem}</div>
      </div>

      <div
        className="hidden lg:flex w-6 cursor-col-resize justify-center items-center group self-stretch z-10"
        onMouseDown={() => setIsDragging(true)}
      >
        <div className={`h-16 w-1.5 rounded-full transition-all duration-200 ${isDragging ? 'bg-blue-500 h-full scale-y-100' : 'bg-gray-300 group-hover:bg-blue-400 group-hover:h-32'}`}></div>
      </div>

      {/* CỘT PHẢI: CÁC CÂU HỎI CON */}
      <div className="w-full lg:w-[var(--right-width)] space-y-4 md:space-y-6">
        {question.childQuestions.map((childQ, index) => (
          <div key={childQ._id || index} id={`question-${childQ._id}`} className={`bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border-2 ${borderColorClass} hover:shadow-md transition-all duration-300`}>
            
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <h3 className={`${titleSizeClass} font-bold text-gray-800 flex-1 pr-3 md:pr-4 leading-relaxed transition-all duration-300`}>
                <span className="text-blue-800 font-bold mr-2">
                  Câu {startingNumber + index}:
                </span>
                {childQ.questionText}
              </h3>
              
              <button
                onClick={() => handleToggleBookmark(childQ._id)}
                className={`flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
                  bookmarkedQuestions.has(childQ._id)
                    ? 'bg-red-50 border-red-200 text-red-600 font-medium'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg md:text-xl">{bookmarkedQuestions.has(childQ._id) ? '🚩' : '🏳️'}</span>
              </button>
            </div>

            {childQ.imageUrl && (
              <div className="mb-5 md:mb-6 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <img src={childQ.imageUrl} alt="Child Question" className="max-w-full max-h-[40vh] md:max-h-64 object-contain rounded-lg mx-auto"/>
              </div>
            )}

            <div className="space-y-3 md:space-y-4">
              {childQ.options.map((option, optIdx) => {
                const isSelected = userAnswers[childQ._id]?.includes(option._id) || false;
                const feedbackClass = showFeedback
                  ? (option.isCorrect ? 'bg-green-50 border-green-400 ring-1 ring-green-400' : (isSelected ? 'bg-red-50 border-red-400' : 'border-gray-200 opacity-60'))
                  : (isSelected ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50');

                return (
                  <label key={optIdx} className={`flex items-start p-3 md:p-4 lg:p-5 border rounded-xl cursor-pointer transition-all duration-200 ${feedbackClass}`}>
                    <input
                      type={childQ.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                      name={`question_${childQ._id}`}
                      value={option._id}
                      onChange={() => handleAnswerChange(childQ._id, option._id, childQ.questionType)}
                      checked={isSelected}
                      disabled={showFeedback}
                      className={`mt-1 h-4 w-4 md:mt-1.5 md:h-5 md:w-5 flex-shrink-0 ${childQ.questionType === 'multi-select' ? 'form-checkbox text-blue-600 rounded' : 'form-radio text-blue-600'}`}
                    />
                    <span className={`ml-3 md:ml-4 text-gray-700 ${optionSizeClass} leading-relaxed flex-1 break-words transition-all duration-300`}>
                      <span className="font-bold text-gray-900 mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                      {option.text}
                    </span>
                  </label>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-5 md:mt-6">
                <ExplanationBlock question={childQ} userAnswers={userAnswers[childQ._id]} mode="review"/>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResizableCaseStudy;