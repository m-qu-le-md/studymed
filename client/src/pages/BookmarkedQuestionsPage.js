// src/pages/BookmarkedQuestionsPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function BookmarkedQuestionsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-soft-gray p-4 flex flex-col justify-center items-center">
      <div className="container mx-auto max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-lg text-center border-t-4 border-primary-blue">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tính năng đang nâng cấp 🚧
        </h1>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Chúng tôi đang tiến hành thay đổi cách thức lưu trữ để bạn có thể dùng tính năng đánh dấu sao mà không cần đăng nhập (chuyển sang lưu trữ Local Storage trên máy của bạn). Vui lòng quay lại sau nhé!
        </p>
        <div className="flex justify-center">
          <Button primary onClick={() => navigate('/dashboard')}>
            Quay về Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkedQuestionsPage;