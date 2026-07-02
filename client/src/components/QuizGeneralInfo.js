// Đường dẫn: client/src/components/QuizGeneralInfo.js

import React from 'react';

// Component này nhận vào 2 "mạch máu" (props) từ file gốc truyền xuống:
// 1. quiz: Chứa dữ liệu hiện tại (title, subject, description)
// 2. handleInputChange: Hàm để cập nhật dữ liệu khi bạn gõ phím
const QuizGeneralInfo = ({ quiz, handleInputChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        1. Thông Tin Hành Chính Bộ Đề
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên bộ đề */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tên bộ đề <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            value={quiz.title || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ví dụ: Đề thi Hóa Sinh Y3 - Module Tiêu Hóa..."
            required
          />
        </div>

        {/* Môn học */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Môn học</label>
          <input
            type="text"
            name="subject"
            value={quiz.subject || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ví dụ: Hóa Sinh"
          />
        </div>

        {/* Mô tả */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả thêm (Tùy chọn)</label>
          <textarea
            name="description"
            value={quiz.description || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ghi chú thêm về bộ đề (VD: Bộ đề này tập trung vào phần chuyển hóa Glucid...)"
            rows="3"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizGeneralInfo;