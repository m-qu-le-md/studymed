// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import { FiMenu } from 'react-icons/fi';

function DashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [showQuizOptionsModal, setShowQuizOptionsModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizMode, setQuizMode] = useState('review');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [timeLimitOption, setTimeLimitOption] = useState('unlimited');
  const [customTimeLimit, setCustomTimeLimit] = useState(30);

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoadingQuizzes(true);
      const response = await api.get('/api/quizzes');
      setQuizzes(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bộ đề:', err);
      setAlert('Lỗi khi tải bộ đề.', 'error');
    } finally {
      setLoadingQuizzes(false);
    }
  }, [setAlert]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ đề này không?')) {
      try {
        await api.delete(`/api/quizzes/${quizId}`);
        setAlert('Bộ đề đã được xóa thành công!', 'success');
        fetchQuizzes();
      } catch (err) {
        setAlert('Xóa bộ đề thất bại!', 'error');
      }
    }
  };

  const handleStartQuizClick = (quizId) => {
    setSelectedQuizId(quizId);
    setShowQuizOptionsModal(true);
    setTimeLimitOption('unlimited');
    setCustomTimeLimit(30);
  };

  const handleConfirmStartQuiz = () => {
    if (selectedQuizId) {
      setShowQuizOptionsModal(false);
      let timeLimit = null;
      if (timeLimitOption === 'limited') {
        timeLimit = customTimeLimit * 60;
      }
      navigate(`/quiz/take/${selectedQuizId}?mode=${quizMode}&shuffle=${shuffleQuestions}${timeLimit ? `&timeLimit=${timeLimit}` : ''}`);
    }
  };

  if (loadingQuizzes) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Đang tải danh sách bộ đề...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] bg-zinc-50 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white flex flex-col border-r border-zinc-200 z-30
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <h1 className="text-lg font-bold tracking-tight text-zinc-950">STUDYMED</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/quiz/new" className="flex items-center px-3 py-2 text-sm text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors">
            Tạo bộ đề mới
          </Link>
          <Link to="/bulk-upload" className="flex items-center px-3 py-2 text-sm text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors">
            Nhập bộ đề (JSON)
          </Link>
          <Link to="/study-by-tag" className="flex items-center px-3 py-2 text-sm text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors">
            Ôn tập theo tag
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-600 text-xl lg:hidden"
          >
            <FiMenu />
          </button>
          <span className="text-sm text-zinc-500 ml-auto">Chào bác sĩ, chúc một ngày tốt lành</span>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1 capitalize">{currentDate}</p>
          </div>

          {quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <p>Hệ thống chưa có bộ đề nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="bg-white p-5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all flex flex-col group">
                  <h2 className="text-sm font-semibold text-zinc-950 truncate">{quiz.title}</h2>
                  <p className="text-xs text-zinc-500 mt-1 mb-4 line-clamp-2 flex-grow">{quiz.description || "Không có mô tả."}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{quiz.subject}</span>
                    <div className="flex gap-2">
                        <button onClick={() => navigate(`/quiz/edit/${quiz._id}`)} className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900">Quản lý</button>
                        <button onClick={() => handleStartQuizClick(quiz._id)} className="text-[10px] font-medium text-accent">Làm bài</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showQuizOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Tùy Chọn Làm Bài</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Chế độ làm bài:</p>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="quizMode" value="review" checked={quizMode === 'review'} onChange={(e) => setQuizMode(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Ôn tập (Xem đáp án sau mỗi câu)</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="quizMode" value="test" checked={quizMode === 'test'} onChange={(e) => setQuizMode(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Kiểm tra (Chấm điểm cuối cùng)</span>
                  </label>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Thứ tự câu hỏi:</p>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="shuffleQuestions" checked={shuffleQuestions === true} onChange={() => setShuffleQuestions(true)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Trộn ngẫu nhiên</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="shuffleQuestions" checked={shuffleQuestions === false} onChange={() => setShuffleQuestions(false)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Thứ tự gốc</span>
                  </label>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Thời gian làm bài:</p>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="timeLimit" value="unlimited" checked={timeLimitOption === 'unlimited'} onChange={(e) => setTimeLimitOption(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Không giới hạn</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="timeLimit" value="limited" checked={timeLimitOption === 'limited'} onChange={(e) => setTimeLimitOption(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Đếm ngược</span>
                  </label>
                  {timeLimitOption === 'limited' && (
                    <div className="mt-2">
                      <label htmlFor="customTimeLimit" className="block text-gray-700 text-sm font-semibold mb-1">Chọn số phút:</label>
                      <input
                        type="number"
                        id="customTimeLimit"
                        value={customTimeLimit}
                        onChange={(e) => setCustomTimeLimit(Math.max(1, parseInt(e.target.value)))}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <Button secondary onClick={() => setShowQuizOptionsModal(false)}>
                Hủy
              </Button>
              <Button primary onClick={handleConfirmStartQuiz}>
                Bắt Đầu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;