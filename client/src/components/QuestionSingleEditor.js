import React, { useState } from 'react';
import CustomTagInput from './CustomTagInput'; 

const QuestionSingleEditor = ({
  qIndex,
  question,
  handleQuestionChange,
  handleTagsChange, 
  handleOptionChange,
  addOption,
  removeOption,
  removeQuestion,
  handleImageUpload,
  uploadingImage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-200 overflow-hidden transition-all duration-300">
      
      <div 
        className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50 border-b border-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 pr-4">
          <span className="font-bold text-gray-800 mr-2">Câu {qIndex + 1}:</span>
          <span className="text-gray-600 text-sm">
            {question.questionText 
              ? (question.questionText.length > 80 ? question.questionText.substring(0, 80) + '...' : question.questionText) 
              : <span className="italic text-gray-400">(Chưa có nội dung câu hỏi)</span>}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-600 rounded">Câu hỏi đơn</span>
          <span className="text-blue-500 font-bold text-lg w-6 text-center">
            {isExpanded ? '−' : '+'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 relative animate-fadeIn">
          <button
            onClick={() => removeQuestion(qIndex)}
            className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            title="Xóa câu hỏi này"
          >
            ✕
          </button>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Nội dung câu hỏi</label>
            <textarea
              value={question.questionText || ''}
              onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Nhập nội dung câu hỏi..."
              rows="2"
              required
            />
          </div>

          {/* --- ĐÃ SỬA: CHIA THÀNH 3 CỘT ĐỂ THÊM MENU LỰA CHỌN "LOẠI CÂU HỎI" --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-yellow-50/50 p-3 rounded-md border border-yellow-100 shadow-sm">
              <label className="block text-sm font-bold text-yellow-800 mb-2">Loại câu hỏi:</label>
              <select
                value={question.questionType || 'single-choice'}
                onChange={(e) => handleQuestionChange(qIndex, 'questionType', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="single-choice">Một đáp án (Radio)</option>
                <option value="multi-select">Nhiều đáp án (Checkbox)</option>
                <option value="true-false">Đúng / Sai</option>
              </select>
            </div>
            
            <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 shadow-sm">
              <label className="block text-sm font-bold text-blue-800 mb-2">Chủ đề / Tags:</label>
              <CustomTagInput
                tags={question.tags || []}
                setTags={(newTags) => handleTagsChange(qIndex, newTags)}
              />
            </div>
            
          </div>

          <div className="mb-4 bg-gray-50 p-3 rounded-md border border-dashed border-gray-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh minh họa (nếu có)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(qIndex, null, e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
              {uploadingImage === `${qIndex}-null` && <span className="text-blue-500 text-sm italic">Đang tải...</span>}
            </div>
            {question.imageUrl && (
              <div className="mt-3 relative inline-block">
                <img src={question.imageUrl} alt="Minh họa" className="max-h-32 rounded-md border shadow-sm" />
                <button
                  type="button"
                  onClick={() => handleQuestionChange(qIndex, 'imageUrl', '')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6 border-t pt-4">
            <label className="block text-sm font-semibold text-gray-800">Các lựa chọn đáp án:</label>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-start gap-3 bg-white p-3 rounded-md border border-gray-200 hover:border-blue-200 transition-colors">
                <div className="pt-2">
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, 'isCorrect', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                    className={`w-full border rounded-md p-2 outline-none transition-all ${option.isCorrect ? 'border-green-400 bg-green-50/30' : 'border-gray-300 focus:border-blue-400'}`}
                    placeholder={`Lựa chọn ${oIndex + 1}`}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(qIndex, oIndex)}
                  className="text-gray-400 hover:text-red-500 pt-2 px-2 transition-colors"
                  title="Xóa lựa chọn này"
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addOption(qIndex)}
              className="text-blue-600 text-sm font-bold hover:text-blue-800 hover:underline flex items-center gap-1 mt-3 py-2 px-3 bg-blue-50 rounded-md"
            >
              + THÊM LỰA CHỌN
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">Giải thích tổng quát (General Explanation):</label>
            <textarea
              value={question.generalExplanation || ''}
              onChange={(e) => handleQuestionChange(qIndex, 'generalExplanation', e.target.value)}
              className="w-full border border-gray-200 rounded-md p-3 text-sm bg-yellow-50/50 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
              placeholder="Giải thích chi tiết tại sao chọn đáp án đúng, kiến thức liên quan..."
              rows="2"
            />
          </div>

        </div>
      )}
    </div>
  );
};

export default React.memo(QuestionSingleEditor);