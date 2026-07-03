// src/pages/QuizResultPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import Button from '../components/Button';
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
        return <div className="flex items-center justify-center min-h-screen">Đang tính toán kết quả...</div>;
    }

    // Reading this as: Quiz result page for medical students, with a minimalist/calm language, leaning toward modern sans-serif typography + neutral palette.
    return (
        <div className="min-h-[100dvh] bg-zinc-50 flex items-center justify-center p-6 selection:bg-accent selection:text-white">
            <div className="w-full max-w-lg bg-white p-10 rounded-3xl border border-zinc-200 shadow-sm text-center">
                <h1 className="text-xl font-semibold text-zinc-950 mb-2">Kết quả</h1>
                <p className="text-sm text-zinc-500 mb-10">{results.quizTitle}</p>

                <div className="mb-12">
                    <p className="text-7xl font-semibold text-zinc-950 tracking-tighter">{results.score}</p>
                    <p className="text-sm text-zinc-400 mt-2">điểm / 10</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10 border-t border-b border-zinc-100 py-6">
                    <div>
                        <p className="text-xl font-semibold text-zinc-950">{results.totalQuestions}</p>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Câu hỏi</p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold text-emerald-600">{results.correctCount}</p>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Đúng</p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold text-red-600">{results.incorrectCount}</p>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Sai</p>
                    </div>
                </div>

                {location.state.timeTaken !== undefined && (
                     <p className="text-sm text-zinc-500 mb-10">Thời gian: <span className="font-medium text-zinc-950">{formatTime(location.state.timeTaken)}</span></p>
                )}

                <div className="flex gap-4">
                    <button onClick={() => navigate('/dashboard')} className="flex-1 px-6 py-3 rounded-full text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition-colors">Về Dashboard</button>
                    <button onClick={handleReview} className="flex-1 bg-accent text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">Xem lại</button>
                </div>
            </div>
        </div>
    );
}

export default QuizResultPage;