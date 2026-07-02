// src/components/QuestionItem.js
import React from 'react';

const QuestionItem = ({ 
  question, 
  index, 
  userAnswer, 
  onAnswerChange, 
  isBookmarked, 
  onToggleBookmark,
  textSize = 'base' // Nhận tín hiệu cỡ chữ từ QuizTakingPage
}) => {
  const questionId = question._id;

  // THUẬT TOÁN ĐIỀU PHỐI CỠ CHỮ
  const titleSizeClass = 
    textSize === 'sm' ? 'text-base md:text-lg lg:text-xl' :
    textSize === 'lg' ? 'text-xl md:text-2xl lg:text-3xl' :
    'text-lg md:text-xl lg:text-2xl'; // default base

  const optionSizeClass = 
    textSize === 'sm' ? 'text-sm md:text-base lg:text-lg' :
    textSize === 'lg' ? 'text-lg md:text-xl lg:text-2xl' :
    'text-base md:text-lg lg:text-xl'; // default base

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex justify-between items-start mb-6">
        {/* Áp dụng class chữ câu hỏi kết hợp hiệu ứng chuyển đổi mượt */}
        <h3 className={`${titleSizeClass} font-bold text-gray-800 flex-1 pr-4 leading-relaxed transition-all duration-300`}>
          <span className="text-blue-800 font-bold mr-2">Câu {index + 1}:</span>
          {question.questionText}
        </h3>
        
        {/* NÚT GẮN CỜ THU NHẬN CHUẨN PROP ONTOGGLEBOOKMARK */}
        <button
          onClick={onToggleBookmark}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
            isBookmarked
              ? 'bg-red-50 border-red-200 text-red-600 font-medium'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          title="Đánh dấu để xem lại"
        >
          <span className="text-xl">{isBookmarked ? '🚩' : '🏳️'}</span>
        </button>
      </div>
      
      {/* HIỂN THỊ ẢNH CHO CÂU HỎI ĐƠN (CHẾ ĐỘ TEST) */}
      {question.imageUrl && (
        <div className="mb-6 flex justify-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          <img 
            src={question.imageUrl} 
            alt="Question Context" 
            className="max-w-full max-h-80 object-contain rounded-lg"
          />
        </div>
      )}

      <div className="space-y-4">
        {question.options.map((option, idx) => (
          <label key={option._id} className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              // Đã trực tiếp sử dụng question.questionType
              type={question.questionType === 'multi-select' ? 'checkbox' : 'radio'}
              name={`question-${questionId}`}
              value={option._id}
              checked={userAnswer?.includes(option._id) || false}
              // Truyền đúng question.questionType vào onAnswerChange
              onChange={() => onAnswerChange(questionId, option._id, question.questionType)}
              className={`mt-1 h-5 w-5 flex-shrink-0 ${question.questionType === 'multi-select' ? 'form-checkbox rounded text-blue-600' : 'form-radio text-blue-600'}`}
            />
            {/* Áp dụng class chữ đáp án */}
            <span className={`ml-3 text-gray-800 ${optionSizeClass} flex-1 leading-relaxed transition-all duration-300`}>
              {/* Đã cập nhật class in đậm */}
              <span className="font-bold text-gray-900 mr-2">{String.fromCharCode(65 + idx)}.</span>
              {option.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionItem;