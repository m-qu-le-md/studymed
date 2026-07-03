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

  // Reading this as: Landing page for medical students, with a minimalist/calm language, leaning toward modern sans-serif typography + neutral palette.
  return (
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-950 font-sans selection:bg-accent selection:text-white">
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="text-sm font-semibold tracking-tight">STUDYMED</div>
        <nav>
          <Link to="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.1] mb-8">
            Nền tảng y khoa chuyên sâu.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-2xl mb-12">
            Nâng cao năng lực chẩn đoán qua các bộ đề trắc nghiệm thông minh và hệ thống theo dõi tiến độ học tập toàn diện.
          </p>
          <div className="flex gap-4">
            <Link to="/dashboard" className="bg-accent text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;