import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import QuestionSingleEditor from '../components/QuestionSingleEditor';

function EditQuestionPage() {
  const { quizId, questionId } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/api/quizzes/${quizId}`);
        setQuiz(res.data);
      } catch (err) {
        setAlert('Không thể tải bộ đề', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate, setAlert]);

  const handleUpdate = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await api.put(`/api/quizzes/${quizId}`, quiz);
      setAlert('Cập nhật câu hỏi thành công!', 'success');
      navigate('/bookmarks');
    } catch (err) {
      setAlert('Cập nhật thất bại', 'error');
      setIsSaving(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!quiz) return <div>Không tìm thấy bộ đề</div>;

  const qIndex = quiz.questions.findIndex(q => q._id === questionId);
  if (qIndex === -1) return <div>Không tìm thấy câu hỏi</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa câu hỏi</h1>
      <div className="bg-white p-6 rounded-xl border">
        <QuestionSingleEditor
          qIndex={qIndex}
          question={quiz.questions[qIndex]}
          handleQuestionChange={(idx, field, value) => {
            const newQuestions = [...quiz.questions];
            newQuestions[idx] = { ...newQuestions[idx], [field]: value };
            setQuiz({ ...quiz, questions: newQuestions });
          }}
          handleTagsChange={(idx, tags) => {
            const newQuestions = [...quiz.questions];
            newQuestions[idx].tags = tags;
            setQuiz({ ...quiz, questions: newQuestions });
          }}
          handleOptionChange={(qIdx, oIdx, field, value) => {
            const newQuestions = [...quiz.questions];
            newQuestions[qIdx].options[oIdx][field] = value;
            setQuiz({ ...quiz, questions: newQuestions });
          }}
          addOption={(qIdx) => {
            const newQuestions = [...quiz.questions];
            newQuestions[qIdx].options.push({ text: '', isCorrect: false });
            setQuiz({ ...quiz, questions: newQuestions });
          }}
          removeOption={(qIdx, oIdx) => {
            const newQuestions = [...quiz.questions];
            newQuestions[qIdx].options.splice(oIdx, 1);
            setQuiz({ ...quiz, questions: newQuestions });
          }}
          handleImageUpload={async (e, qIdx) => {
             const file = e.target.files[0];
             const formData = new FormData();
             formData.append('image', file);
             const res = await api.post('/api/quizzes/upload-image', formData);
             const newQuestions = [...quiz.questions];
             newQuestions[qIdx].imageUrl = res.data.imageUrl;
             setQuiz({ ...quiz, questions: newQuestions });
          }}
        />
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={() => navigate(-1)} className="px-4 py-2 text-zinc-500">Hủy</button>
          <button 
            onClick={handleUpdate} 
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg ${isSaving ? 'bg-gray-400' : 'bg-blue-600'} text-white`}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditQuestionPage;