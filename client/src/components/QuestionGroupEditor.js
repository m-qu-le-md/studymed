import React, { useState } from 'react';
import CustomTagInput from './CustomTagInput'; // Cấy ghép thụ thể nhận diện Tag

const QuestionGroupEditor = ({
  qIndex,
  question,
  handleQuestionChange,
  removeQuestion,
  addChildQuestion,
  removeChildQuestion,
  handleChildQuestionChange, 
  handleChildOptionChange,   
  addChildOption,
  removeChildOption,
  handleImageUpload,
  uploadingImage
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Nếp gấp co giãn (Accordion)

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 border-2 border-indigo-200 overflow-hidden transition-all">
      {/* HEADER: Bấm vào để đóng/mở toàn bộ Case Study */}
      <div 
        className={`p-4 flex justify-between items-center cursor-pointer ${isExpanded ? 'bg-indigo-100' : 'bg-indigo-50 hover:bg-indigo-100'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 pr-4">
          <span className="font-bold text-indigo-900 mr-2">Tình huống {qIndex + 1}:</span>
          <span className="text-indigo-800 text-sm italic">
            {question.caseStem ? (question.caseStem.substring(0, 70) + '...') : '(Chưa có nội dung bệnh án)'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-1 bg-indigo-200 text-indigo-700 rounded">Case Study</span>
          <span className="text-indigo-600 font-bold text-xl leading-none">{isExpanded ? '−' : '+'}</span>
        </div>
      </div>

      {/* BODY: Chỉ hiện khi mở nếp gấp */}
      {isExpanded && (
        <div className="p-6 bg-indigo-50/30 animate-fadeIn">
          {/* --- PHẦN 1: BỆNH ÁN GỐC (CASE STEM) --- */}
          <div className="mb-6 border-b-2 border-indigo-100 pb-6">
            <label className="block text-lg font-bold text-indigo-900 mb-2">Thông tin tình huống</label>
            <textarea
              value={question.caseStem || ''}
              onChange={(e) => handleQuestionChange(qIndex, 'caseStem', e.target.value)}
              className="w-full border border-indigo-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              placeholder="Nhập bệnh án, triệu chứng, tiền sử..."
              rows="4"
            />
            
            {/* Upload Ảnh cho Bệnh Án Gốc */}
            <div className="mt-3 mb-4">
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(qIndex, null, e.target.files[0])} className="text-sm text-gray-500" />
              {uploadingImage === `${qIndex}-null` && <span className="text-indigo-500 text-xs ml-2 italic">Đang tải...</span>}
              {question.imageUrl && <img src={question.imageUrl} alt="Case" className="mt-2 max-h-32 rounded border" />}
            </div>

            {/* ---> ĐÃ THÊM: Cấy ghép "Hạch bạch huyết" (Hệ thống Tag) cho Case Study <--- */}
            <div className="mt-4 p-4 bg-white rounded border border-indigo-100 shadow-sm">
              <label className="block text-sm font-bold text-indigo-800 mb-2">Chủ đề / Tag của toàn bộ Tình huống này:</label>
              <CustomTagInput
                tags={question.tags || []}
                setTags={(newTags) => handleQuestionChange(qIndex, 'tags', newTags)}
              />
              <p className="text-xs text-gray-500 mt-2 italic">Gắn tag ở đây sẽ tự động áp dụng cho tất cả các câu hỏi con bên trong tình huống này.</p>
            </div>
          </div>

          {/* --- PHẦN 2: DANH SÁCH CÂU HỎI CON --- */}
          <div className="space-y-8">
            {question.childQuestions?.map((childQ, cqIndex) => (
              <div key={cqIndex} className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm relative ml-4">
                <button onClick={() => removeChildQuestion(qIndex, cqIndex)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">✕</button>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Câu hỏi con {cqIndex + 1}:</label>
                  <textarea
                    value={childQ.questionText}
                    onChange={(e) => handleChildQuestionChange(qIndex, cqIndex, 'questionText', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-400 outline-none"
                    placeholder="Ví dụ: Chẩn đoán sơ bộ nào là phù hợp nhất?"
                    rows="2"
                  />
                </div>

                {/* Upload Ảnh cho riêng từng câu hỏi con */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ảnh riêng cho câu hỏi này (nếu có):</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(qIndex, cqIndex, e.target.files[0])} className="text-xs" />
                  {uploadingImage === `${qIndex}-${cqIndex}` && <span className="text-indigo-500 text-xs ml-2 italic">Đang tải...</span>}
                  {childQ.imageUrl && <img src={childQ.imageUrl} alt="Child" className="mt-2 max-h-24 rounded border" />}
                </div>

                {/* Các Phương Án Lựa Chọn */}
                <div className="space-y-3 mb-4">
                  {childQ.options.map((option, oIndex) => (
                    <div key={oIndex} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => handleChildOptionChange(qIndex, cqIndex, oIndex, 'isCorrect', e.target.checked)}
                          className="w-4 h-4 text-green-600"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleChildOptionChange(qIndex, cqIndex, oIndex, 'text', e.target.value)}
                          className={`flex-1 border rounded p-1.5 text-sm ${option.isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                          placeholder={`Đáp án ${oIndex + 1}`}
                        />
                        <button onClick={() => removeChildOption(qIndex, cqIndex, oIndex)} className="text-red-400 hover:text-red-600 text-xs">Xóa</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addChildOption(qIndex, cqIndex)} className="text-indigo-600 text-xs font-bold hover:underline">+ THÊM ĐÁP ÁN</button>
                </div>

                {/* Giải thích chung cho cả câu hỏi con */}
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Giải thích tổng quát (Explanation):</label>
                  <textarea
                    value={childQ.generalExplanation || ''}
                    onChange={(e) => handleChildQuestionChange(qIndex, cqIndex, 'generalExplanation', e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2 text-sm bg-yellow-50/30 outline-none focus:border-indigo-300"
                    placeholder="Tại sao chọn đáp án này? Kiến thức liên quan là gì?..."
                    rows="2"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addChildQuestion(qIndex)}
              className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-all"
            >
              + THÊM CÂU HỎI CON CHO BỆNH ÁN NÀY
            </button>
          </div>

          {/* Nút cắt bỏ (Xóa) toàn bộ khối bệnh án */}
          <div className="flex justify-end mt-6 pt-4 border-t border-indigo-200">
             <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 text-sm font-bold hover:underline bg-red-50 px-4 py-2 rounded-md hover:bg-red-100 transition">
               Xóa toàn bộ tình huống này
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(QuestionGroupEditor);