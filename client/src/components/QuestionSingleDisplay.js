// src/components/QuestionSingleDisplay.js
import React from 'react';
import ExplanationBlock from './ExplanationBlock';

const QuestionSingleDisplay = ({
  currentQuestion,
  currentQuestionIndex,
  userAnswers,
  handleAnswerChange,
  showFeedback,
  bookmarkedQuestions,
  handleToggleBookmark,
  globalNumber,
  textSize = 'base' // Nhận tín hiệu cỡ chữ
}) => {

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
    <div id={`question-${currentQuestion._id}`} className="max-w-4xl mx-auto bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-start mb-5 md:mb-8">
        
        {/* Áp dụng class chữ câu hỏi */}
        <h2 className={`${titleSizeClass} font-bold text-gray-800 flex-1 pr-3 md:pr-4 leading-relaxed transition-all duration-300`}>
          <span className="text-blue-800 font-bold mr-2">
            Câu {globalNumber}:
          </span>
          {currentQuestion.questionText}
        </h2>
        
        <button
          onClick={() => handleToggleBookmark(currentQuestion._id)}
          className={`flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
            bookmarkedQuestions.has(currentQuestion._id)
              ? 'bg-red-50 border-red-200 text-red-600 font-medium'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          title="Đánh dấu để xem lại"
        >
          <span className="text-lg md:text-xl">{bookmarkedQuestions.has(currentQuestion._id) ? '🚩' : '🏳️'}</span>
        </button>
      </div>
      
      {currentQuestion.imageUrl && (
        <div className="mb-6 md:mb-8 flex justify-center bg-gray-50 p-2 md:p-3 rounded-xl border border-gray-100">
          <img src={currentQuestion.imageUrl} alt="Question Context" className="max-w-full max-h-[50vh] md:max-h-80 object-contain rounded-lg"/>
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
        {currentQuestion.options.map((option, optIdx) => {
          const isSelected = userAnswers[currentQuestion._id]?.includes(option._id) || false;
          const feedbackClass = showFeedback 
            ? (option.isCorrect ? 'bg-green-50 border-green-400 ring-1 ring-green-400' : (isSelected ? 'bg-red-50 border-red-400' : 'border-gray-200 opacity-60'))
            : (isSelected ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50');

          return (
            <label key={optIdx} className={`flex items-start p-3 md:p-4 lg:p-5 border rounded-xl cursor-pointer transition-all duration-200 ${feedbackClass}`}>
              <input
                type={currentQuestion.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                name={`question_${currentQuestion._id}`}
                value={option._id}
                checked={isSelected}
                onChange={() => handleAnswerChange(currentQuestion._id, option._id, currentQuestion.questionType)}
                className={`mt-1 h-4 w-4 md:mt-1.5 md:h-5 md:w-5 flex-shrink-0 ${currentQuestion.questionType === 'multi-select' ? 'form-checkbox text-blue-600 rounded' : 'form-radio text-blue-600'}`}
                disabled={showFeedback}
              />
              {/* Áp dụng class chữ đáp án */}
              <span className={`ml-3 md:ml-4 text-gray-700 ${optionSizeClass} leading-relaxed flex-1 break-words transition-all duration-300`}>
                <span className="font-bold text-gray-900 mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                {option.text}
              </span>
            </label>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mt-6 md:mt-8">
          <ExplanationBlock question={currentQuestion} userAnswers={userAnswers[currentQuestion._id]} mode="review"/>
        </div>
      )}
    </div>
  );
};

export default QuestionSingleDisplay;