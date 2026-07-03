// src/pages/QuizFormPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
// import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import QuizGeneralInfo from '../components/QuizGeneralInfo';
import QuestionSingleEditor from '../components/QuestionSingleEditor';
import QuestionGroupEditor from '../components/QuestionGroupEditor';

function QuizFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const [quiz, setQuiz] = useState({ title: '', description: '', subject: '', topic: '', questions: [] });
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const loadQuizData = async () => {
        try {
          const res = await api.get(`/api/quizzes/${id}`);
          setQuiz(res.data);
        } catch (err) {
          console.error("Không thể tải bộ đề:", err);
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      loadQuizData();
    } else {
      setLoading(false);
    }
  }, [id, navigate]); 

  // Xử lý thông tin chung của bộ đề
  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prevQuiz => ({ ...prevQuiz, [name]: value }));
  };

  // --- BẮT ĐẦU: CÁC SỢI DÂY THẦN KINH ĐÃ ĐƯỢC ỔN ĐỊNH BẰNG USECALLBACK & IMMUTABILITY ---

  // 1. Cập nhật câu hỏi gốc (Đơn / Chùm)
  const handleQuestionChange = useCallback((index, field, value) => {
    setQuiz((prevQuiz) => {
      const newQuestions = [...prevQuiz.questions];
      // Sinh ra "tế bào" mới thay vì sửa trực tiếp tế bào cũ
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prevQuiz, questions: newQuestions };
    });
  }, []);

  // 2. Cập nhật đáp án của câu hỏi đơn
  const handleOptionChange = useCallback((qIndex, oIndex, field, value) => {
    setQuiz((prevQuiz) => {
      const newQuestions = [...prevQuiz.questions];
      const newOptions = [...newQuestions[qIndex].options];
      
      newOptions[oIndex] = { ...newOptions[oIndex], [field]: value };
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
      
      return { ...prevQuiz, questions: newQuestions };
    });
  }, []);

  // 3. Cập nhật câu hỏi con (trong Case Study)
  const handleChildQuestionChange = useCallback((qIndex, childQIndex, field, value) => {
    setQuiz((prevQuiz) => {
      const newQuestions = [...prevQuiz.questions];
      const newChildQs = [...newQuestions[qIndex].childQuestions];
      
      newChildQs[childQIndex] = { ...newChildQs[childQIndex], [field]: value };
      newQuestions[qIndex] = { ...newQuestions[qIndex], childQuestions: newChildQs };
      
      return { ...prevQuiz, questions: newQuestions };
    });
  }, []);

  // 4. Cập nhật đáp án của câu hỏi con
  const handleChildOptionChange = useCallback((qIndex, childQIndex, oIndex, field, value) => {
    setQuiz((prevQuiz) => {
      const newQuestions = [...prevQuiz.questions];
      const newChildQs = [...newQuestions[qIndex].childQuestions];
      const newOptions = [...newChildQs[childQIndex].options];
      
      newOptions[oIndex] = { ...newOptions[oIndex], [field]: value };
      newChildQs[childQIndex] = { ...newChildQs[childQIndex], options: newOptions };
      newQuestions[qIndex] = { ...newQuestions[qIndex], childQuestions: newChildQs };
      
      return { ...prevQuiz, questions: newQuestions };
    });
  }, []);

  // --- KẾT THÚC: CÁC SỢI DÂY THẦN KINH ĐƯỢC TỐI ƯU ---

  const handleTagsChange = (qIndex, newTags, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    if (childIndex !== null) {
      newQuestions[qIndex].childQuestions[childIndex].tags = newTags;
    } else {
      newQuestions[qIndex].tags = newTags;
    }
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleAddOption = (qIndex, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    const targetQuestion = childIndex !== null ? newQuestions[qIndex].childQuestions[childIndex] : newQuestions[qIndex];
    targetQuestion.options.push({ text: '', isCorrect: false });
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const handleDeleteOption = (qIndex, oIndex, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    const targetQuestion = childIndex !== null ? newQuestions[qIndex].childQuestions[childIndex] : newQuestions[qIndex];
    targetQuestion.options = targetQuestion.options.filter((_, i) => i !== oIndex);
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleDeleteQuestion = (qIndex, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    if (childIndex !== null) {
      newQuestions[qIndex].childQuestions = newQuestions[qIndex].childQuestions.filter((_, i) => i !== childIndex);
    } else {
      newQuestions.splice(qIndex, 1);
    }
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleImageUpload = async (arg1, arg2, arg3 = null, arg4 = false) => {
    let file, qIndex, childIndex = null, isCaseStem = false;
    if (arg1 && arg1.target && arg1.target.files) {
      file = arg1.target.files[0];
      qIndex = arg2;
      childIndex = arg3;
      isCaseStem = arg4;
    } else {
      qIndex = arg1;
      childIndex = arg2;
      file = arg3;
    }

    if (!file) return;

    setUploadingImage(`${qIndex}-${childIndex}`); 

    const formData = new FormData();
    formData.append('image', file);

    try {
      setAlert('Đang tải ảnh lên...', 'info');
      const res = await api.post('/api/quizzes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedUrl = res.data.imageUrl;
      
      setQuiz(prevQuiz => {
        const newQuestions = JSON.parse(JSON.stringify(prevQuiz.questions));
        if (isCaseStem || childIndex === null) {
          newQuestions[qIndex].imageUrl = uploadedUrl;
        } else {
          newQuestions[qIndex].childQuestions[childIndex].imageUrl = uploadedUrl;
        }
        return { ...prevQuiz, questions: newQuestions };
      });

      setAlert('Tải ảnh thành công!', 'success');
    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      setAlert('Tải ảnh thất bại!', 'error');
    } finally {
      setUploadingImage(false); 
    }
  };

  const handleAddSingleQuestion = () => {
    setQuiz(prev => ({ ...prev, questions: [
      ...prev.questions,
      { type: 'single', questionText: '', imageUrl: '', questionType: 'single-choice', tags: [], difficulty: 'Thông hiểu', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }], generalExplanation: '' }
    ]}));
  };
  
  const handleAddGroupQuestion = () => {
    setQuiz(prev => ({ ...prev, questions: [
      ...prev.questions,
      { type: 'group', caseStem: '', imageUrl: '', childQuestions: [] }
    ]}));
  };

  const handleAddChildQuestion = (qIndex) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    newQuestions[qIndex].childQuestions.push({
      questionText: '', imageUrl: '', questionType: 'single-choice', tags: [], difficulty: 'Thông hiểu', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }], generalExplanation: ''
    });
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/api/quizzes/${id}`, quiz);
        setAlert('Cập nhật bộ đề thành công!', 'success');
      } else {
        await api.post('/api/quizzes', quiz);
        setAlert('Tạo bộ đề mới thành công!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      setAlert(err.response?.data?.msg || 'Lưu bộ đề thất bại!', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;

  // Reading this as: Form page for quiz management, with a minimalist/calm language, leaning toward modern sans-serif typography + neutral palette.
  return (
    <div className="min-h-[100dvh] bg-zinc-50 p-6 md:p-12 selection:bg-accent selection:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-zinc-950 mb-10 tracking-tight">{isEditMode ? 'Chỉnh sửa bộ đề' : 'Tạo bộ đề mới'}</h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <QuizGeneralInfo quiz={quiz} handleInputChange={handleQuizChange} />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-zinc-950">Danh sách câu hỏi</h2>
            {quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                {question.type === 'single' ? (
                  <QuestionSingleEditor
                    qIndex={qIndex}
                    question={question}
                    handleQuestionChange={handleQuestionChange}
                    handleTagsChange={handleTagsChange}
                    handleOptionChange={handleOptionChange}
                    addOption={handleAddOption}
                    removeOption={handleDeleteOption}
                    removeQuestion={handleDeleteQuestion}
                    handleImageUpload={handleImageUpload}
                    uploadingImage={uploadingImage}
                  />
                ) : (
                  <QuestionGroupEditor
                    qIndex={qIndex}
                    question={question}
                    handleQuestionChange={handleQuestionChange}
                    handleTagsChange={handleTagsChange}
                    handleChildTagsChange={handleTagsChange}
                    removeQuestion={handleDeleteQuestion}
                    addChildQuestion={handleAddChildQuestion}
                    removeChildQuestion={handleDeleteQuestion}
                    handleChildQuestionChange={handleChildQuestionChange} 
                    handleChildOptionChange={handleChildOptionChange}
                    addChildOption={handleAddOption}
                    removeChildOption={handleDeleteOption}
                    handleImageUpload={handleImageUpload}
                    uploadingImage={uploadingImage}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-4">
              <button type="button" onClick={handleAddSingleQuestion} className="flex-1 border border-zinc-200 text-zinc-600 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-50 transition-colors">Thêm câu hỏi đơn</button>
              <button type="button" onClick={handleAddGroupQuestion} className="flex-1 border border-zinc-200 text-zinc-600 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-50 transition-colors">Thêm nhóm câu hỏi</button>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-8 border-t border-zinc-200">
            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2.5 text-sm text-zinc-500 hover:text-zinc-950 font-medium">Hủy</button>
            <button type="submit" className="bg-accent text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">{isEditMode ? 'Cập nhật' : 'Lưu bộ đề'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuizFormPage;