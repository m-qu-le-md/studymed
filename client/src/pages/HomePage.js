// src/pages/HomePage.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeBackground from '../assets/home-background-2.jpg'; 

function HomePage() {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-dvh bg-cover bg-center text-white font-sans" 
      style={{ backgroundImage: `url(${HomeBackground})` }}
    >
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
        <div className="text-xl font-bold tracking-wider">
          STUDYMED
        </div>
        
        <nav className="flex space-x-6 text-sm">
          <Link to="/dashboard" className="bg-white text-blue-900 px-4 py-2 rounded font-semibold hover:bg-gray-200 transition-colors duration-200">
            Vào Dashboard
          </Link>
        </nav>
      </header>

      <main className="absolute bottom-48 left-8 right-8 md:bottom-32 md:left-32 md:right-auto max-w-lg">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 lowercase">
          welcome
        </h1>
        <p className="text-base leading-relaxed text-gray-300">
          Nền tảng học tập y khoa toàn diện, được thiết kế để nâng cao kiến thức và kỹ năng của bạn qua các bộ đề ôn tập chuyên sâu, làm bài trắc nghiệm thông minh, và tính năng theo dõi tiến độ.
        </p>
      </main>
    </div>
  );
}

export default HomePage;