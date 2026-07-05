import React, { useEffect } from 'react';
import { useDevice } from '../hooks/useDevice';

const QuizNavigationDrawer = ({
  isOpen,
  onClose,
  originalQuiz,
  userAnswers,
  bookmarkedQuestions,
  quizMode,
  currentQuestionIndex,
  setCurrentQuestionIndex
}) => {
  const { isMobile } = useDevice();
  // Khoá cuộn màn hình nền khi mở ngăn kéo
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (index, qId) => {
    // Trạng thái Review HOẶC đang dùng Mobile thì đều dùng phân trang
    if (quizMode === 'review' || isMobile) {
      setCurrentQuestionIndex(index);
    } else {
      // Chế độ Test trên Desktop: Cuộn màn hình
      const el = document.getElementById(`question-${qId}`);
      if (el) {
        // Trừ đi 100px để không bị thanh công cụ (sticky header) che mất
        const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    onClose(); // Đóng ngăn kéo sau khi nhảy cóc
  };

  // Trải phẳng (Flatten) mảng câu hỏi để vẽ ra lưới số thứ tự liên tục
  const gridItems = [];
  let globalIndex = 0;

  if (originalQuiz && originalQuiz.questions) {
    originalQuiz.questions.forEach((q, qIndex) => {
      if (q.type === 'single') {
        globalIndex++;
        gridItems.push({
          label: globalIndex,
          qId: q._id,
          isAnswered: userAnswers[q._id]?.length > 0,
          isBookmarked: bookmarkedQuestions.has(q._id),
          parentIndex: qIndex
        });
      } else if (q.type === 'group' && q.childQuestions) {
        q.childQuestions.forEach((childQ) => {
          globalIndex++;
          gridItems.push({
            label: globalIndex,
            qId: childQ._id,
            isAnswered: userAnswers[childQ._id]?.length > 0,
            isBookmarked: bookmarkedQuestions.has(childQ._id),
            parentIndex: qIndex
          });
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Lớp Overlay mờ */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Ngăn kéo chính */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Bản đồ câu hỏi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Chú giải sinh hiệu */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm font-medium text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-blue-500 shadow-sm"></span> Đã làm</div>
            <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-white border border-gray-300 shadow-sm"></span> Chưa làm</div>
            <div className="flex items-center gap-1"><span className="text-red-500 text-base">🚩</span> Xem lại</div>
          </div>

          {/* Lưới số thứ tự */}
          <div className="grid grid-cols-5 gap-3">
            {gridItems.map((item) => {
              const isActive = quizMode === 'review' && item.parentIndex === currentQuestionIndex;
              return (
                <button
                  key={item.qId}
                  onClick={() => handleNavigate(item.parentIndex, item.qId)}
                  className={`
                    relative h-12 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-200
                    ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                    ${item.isAnswered 
                        ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
                  `}
                >
                  {item.label}
                  {item.isBookmarked && (
                    <span className="absolute -top-2 -right-2 text-sm drop-shadow-sm filter">🚩</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizNavigationDrawer;