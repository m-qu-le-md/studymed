// src/pages/QuizResultPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';

const formatTime = (seconds) => {
    if (seconds === null || isNaN(seconds)) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [h, m, s].map(v => v < 10 ? "0" + v : v);
    return h > 0 ? parts.join(":") : `${parts[1]}:${parts[2]}`;
};

function QuizResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { setAlert } = useAlert();

    const [results, setResults] = useState({
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        totalQuestions: 0,
        quizTitle: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { quizData, userAnswers } = location.state || {};

        if (!quizData || !userAnswers) {
            setAlert('Không có dữ liệu kết quả để hiển thị.', 'error');
            navigate('/dashboard');
            return;
        }

        const flatQuestions = [];
        quizData.questions.forEach(item => {
            if (item.type === 'single') {
                flatQuestions.push(item);
            } else if (item.type === 'group' && item.childQuestions) {
                flatQuestions.push(...item.childQuestions);
            }
        });

        let correctCounter = 0;
        flatQuestions.forEach(question => {
            const userAnswerIds = userAnswers[question._id] || [];
            const correctOptionIds = question.options.filter(opt => opt.isCorrect).map(o => o._id);

            const isCorrect = userAnswerIds.length === correctOptionIds.length &&
                              userAnswerIds.every(id => correctOptionIds.includes(id));

            if (isCorrect) {
                correctCounter++;
            }
        });

        const total = flatQuestions.length;
        const score = total > 0 ? (correctCounter / total) * 10 : 0;

        setResults({
            score: score.toFixed(1),
            correctCount: correctCounter,
            incorrectCount: total - correctCounter,
            totalQuestions: total,
            quizTitle: quizData.title,
        });

        setLoading(false);

    }, [location.state, navigate, setAlert]);

    const handleReview = () => {
        navigate(`/quiz/review/${id}`, { 
            state: { 
                quizData: location.state.quizData, 
                userAnswers: location.state.userAnswers 
            } 
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-200 selection:text-slate-900">
            <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
                {/* Thanh màu trang trí trên cùng */}
                <div className={`absolute top-0 left-0 w-full h-2 ${results.score >= 5 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                
                <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Báo cáo kết quả</h1>
                <p className="text-xl md:text-2xl font-bold text-slate-800 mb-8">{results.quizTitle}</p>

                <div className="mb-10 flex flex-col items-center justify-center">
                    <div className="w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 border-slate-50 shadow-inner bg-white">
                        <p className={`text-6xl font-bold tracking-tighter ${results.score >= 5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {results.score}
                        </p>
                        <p className="text-sm font-medium text-slate-400 mt-1">điểm / 10</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10 border-t border-b border-slate-100 py-6 bg-slate-50/50 rounded-xl">
                    <div className="flex flex-col items-center">
                        <p className="text-2xl font-bold text-slate-700">{results.totalQuestions}</p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">Tổng số câu</p>
                    </div>
                    <div className="flex flex-col items-center border-l border-slate-200">
                        <p className="text-2xl font-bold text-emerald-600">{results.correctCount}</p>
                        <p className="text-[11px] uppercase tracking-wider text-emerald-600 font-bold mt-1">Chính xác</p>
                    </div>
                    <div className="flex flex-col items-center border-l border-slate-200">
                        <p className="text-2xl font-bold text-rose-600">{results.incorrectCount}</p>
                        <p className="text-[11px] uppercase tracking-wider text-rose-600 font-bold mt-1">Sai lệch</p>
                    </div>
                </div>

                {location.state.timeTaken !== undefined && (
                     <div className="mb-10 inline-block px-4 py-2 bg-slate-100 rounded-lg">
                         <p className="text-sm text-slate-600 font-medium">Thời gian hoàn thành: <span className="font-bold text-slate-900 ml-1">{formatTime(location.state.timeTaken)}</span></p>
                     </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => navigate('/dashboard')} className="px-8 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        Trở về Dashboard
                    </button>
                    <button onClick={handleReview} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md">
                        Xem lại đáp án chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuizResultPage;