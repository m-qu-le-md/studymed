// src/pages/BulkUploadPage.js
import React, { useState, useCallback } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const jsonFormatGuide = `[
  {
    "title": "Bộ đề Hướng dẫn Chi tiết Toàn Tập",
    "description": "Bao gồm tất cả các dạng câu hỏi và tùy chọn hình ảnh mà hệ thống hỗ trợ.",
    "subject": "Nội khoa",
    "topic": "Tim mạch",
    "questions": [
      {
        "type": "single",
        "questionText": "1. CÂU HỎI ĐƠN (1 Đáp án) - Có kèm X-quang:",
        "questionType": "single-choice",
        "imageUrl": "https://link-anh.com/xquang.jpg",
        "generalExplanation": "Bóng tim to trên X-quang gợi ý tình trạng suy tim.",
        "tags": ["x-quang", "suy-tim"],
        "difficulty": "Thông hiểu",
        "options": [
          { "text": "Suy tim trái", "isCorrect": true },
          { "text": "Bình thường", "isCorrect": false }
        ]
      },
      {
        "type": "single",
        "questionText": "2. CÂU HỎI ĐƠN (Nhiều đáp án đúng - Multi-select): Triệu chứng kinh điển của Đái tháo đường?",
        "questionType": "multi-select",
        "generalExplanation": "Đái tháo đường có 4 nhiều: Ăn nhiều, uống nhiều, đái nhiều, gầy nhiều.",
        "tags": ["trieu-chung", "noi-tiet"],
        "difficulty": "Nhận biết",
        "options": [
          { "text": "Ăn nhiều", "isCorrect": true },
          { "text": "Uống nhiều", "isCorrect": true },
          { "text": "Tăng cân", "isCorrect": false }
        ]
      },
      {
        "type": "single",
        "questionText": "3. CÂU HỎI ĐƠN (Đúng/Sai): Kháng sinh Penicillin diệt khuẩn bằng cách ức chế tổng hợp vách tế bào?",
        "questionType": "true-false",
        "tags": ["duoc-ly", "khang-sinh"],
        "difficulty": "Nhận biết",
        "options": [
          { "text": "Đúng", "isCorrect": true },
          { "text": "Sai", "isCorrect": false }
        ]
      },
      {
        "type": "group",
        "caseStem": "4. TÌNH HUỐNG LÂM SÀNG: Bệnh nhân nam, 60 tuổi, đau ngực trái lan ra tay...",
        "imageUrl": "https://link-anh.com/ecg-toan-canh.jpg",
        "tags": ["nhoi-mau-co-tim", "cap-cuu", "case-study"],
        "difficulty": "Vận dụng cao",
        "childQuestions": [
          {
            "questionText": "Dựa vào đoạn cắt ECG này, nhịp tim của bệnh nhân là bao nhiêu?",
            "questionType": "single-choice",
            "imageUrl": "https://link-anh.com/ecg-cat-lop.jpg", 
            "generalExplanation": "Khoảng RR là 3 ô lớn -> 300/3 = 100 l/p.",
            "options": [
              { "text": "75 l/p", "isCorrect": false },
              { "text": "100 l/p", "isCorrect": true }
            ]
          },
          {
            "questionText": "Các thuốc nào sau đây cần dùng NGAY LẬP TỨC? (Chọn nhiều đáp án)",
            "questionType": "multi-select",
            "generalExplanation": "Phác đồ cấp cứu mạch vành (MONA).",
            "options": [
              { "text": "Aspirin", "isCorrect": true },
              { "text": "Nitroglycerin", "isCorrect": true },
              { "text": "Paracetamol", "isCorrect": false }
            ]
          }
        ]
      }
    ]
  }
]`;

function BulkUploadPage() {
  const [inputType, setInputType] = useState('file');
  const [jsonText, setJsonText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
      setJsonText('');
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ chọn file JSON.', 'error');
    }
  };

  const handleTextChange = (event) => {
    setJsonText(event.target.value);
    if (selectedFile) {
      setSelectedFile(null);
      setFileName('');
    }
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
      setJsonText('');
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ kéo thả file JSON.', 'error');
    }
  }, [setAlert]);

  const handleUpload = async () => {
    let quizzesData;
    try {
      if (inputType === 'file') {
        if (!selectedFile) {
          setAlert('Vui lòng chọn một file JSON để tải lên.', 'warning');
          return;
        }
        const fileContent = await selectedFile.text();
        quizzesData = JSON.parse(fileContent);
      } else {
        if (jsonText.trim() === '') {
          setAlert('Vui lòng dán nội dung JSON vào ô text.', 'warning');
          return;
        }
        quizzesData = JSON.parse(jsonText);
      }
    } catch (parseError) {
      console.error('Lỗi cú pháp JSON:', parseError);
      setAlert('Nội dung JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.', 'error');
      return;
    }

    try {
      await api.post('/api/quizzes/bulk-upload', quizzesData);
      setAlert(`Đã nhập thành công ${Array.isArray(quizzesData) ? quizzesData.length : 1} bộ đề.`, 'success');
      setSelectedFile(null);
      setFileName('');
      setJsonText('');
    } catch (apiError) {
      console.error('Lỗi khi tải lên bộ đề:', apiError);
      setAlert(apiError.response?.data?.msg || 'Lỗi khi tải lên file.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-soft-gray p-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-primary-blue mb-6 text-center">Nhập Bộ Đề Hàng Loạt</h1>
        
        <div className="text-gray-600 text-sm mb-4 text-center">
          <p>Vui lòng tải lên một file JSON hoặc dán trực tiếp nội dung.</p>
          <button 
            onClick={() => setShowFormatGuide(!showFormatGuide)} 
            className="text-blue-600 hover:underline font-semibold"
          >
            {showFormatGuide ? 'Ẩn hướng dẫn định dạng' : 'Xem hướng dẫn định dạng'}
          </button>
        </div>

        {showFormatGuide && (
          <div className="bg-gray-800 text-white rounded-lg p-4 mb-4 text-left text-xs overflow-x-auto">
            <pre><code>{jsonFormatGuide}</code></pre>
          </div>
        )}

        <div className="flex border-b border-gray-200 mb-4">
            <button 
                onClick={() => setInputType('file')}
                className={`py-2 px-4 font-semibold text-sm ${inputType === 'file' ? 'border-b-2 border-primary-blue text-primary-blue' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Tải lên từ File
            </button>
            <button 
                onClick={() => setInputType('paste')}
                className={`py-2 px-4 font-semibold text-sm ${inputType === 'paste' ? 'border-b-2 border-primary-blue text-primary-blue' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Dán trực tiếp
            </button>
        </div>

        {inputType === 'file' && (
            <div
                className={`border-2 border-dashed ${isDragOver ? 'border-primary-blue-active bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-8 text-center cursor-pointer transition-all duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
            >
                <input type="file" id="fileInput" accept="application/json" onChange={handleFileChange} className="hidden" />
                <p className="text-gray-500 mb-2">Kéo và thả file JSON vào đây, hoặc nhấp để chọn file</p>
                {fileName && (<p className="text-gray-700 font-semibold">File đã chọn: {fileName}</p>)}
            </div>
        )}

        {inputType === 'paste' && (
            <div>
                <textarea
                    value={jsonText}
                    onChange={handleTextChange}
                    placeholder="Dán nội dung JSON của bạn vào đây..."
                    className="w-full h-48 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-200 font-mono text-sm"
                />
            </div>
        )}

        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
            <Button 
                primary 
                onClick={handleUpload} 
                className="w-full" 
                disabled={(inputType === 'file' && !selectedFile) || (inputType === 'paste' && jsonText.trim() === '')}
            >
                Tải Lên và Xử Lý
            </Button>
            <Button secondary onClick={() => navigate('/dashboard')} className="w-full">
                Về Dashboard
            </Button>
        </div>
      </div>
    </div>
  );
}

export default BulkUploadPage;