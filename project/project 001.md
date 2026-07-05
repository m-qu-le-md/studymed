CONTEXT DỰ ÁN: TỐI ƯU HÓA TRẢI NGHIỆM MOBILE (DỰ ÁN 001)

Tên dự án: StudyMed (Nền tảng thi trắc nghiệm và ôn tập y khoa)
Công nghệ: ReactJS, Tailwind CSS, React Router DOM.
Mục tiêu cốt lõi: Chuyển đổi kiến trúc trang làm bài (QuizTakingPage.js) từ Responsive cơ bản sang mô hình Container - Presenter. Tách biệt hoàn toàn giao diện Desktop và Mobile để tối ưu hóa không gian hiển thị trên điện thoại (hiện tại chữ bị ép nhỏ, layout chia cột quá ngột ngạt). Tích hợp thao tác vuốt (swipe) cho Mobile.

⚠️ QUY TẮC BẮT BUỘC DÀNH CHO AI AGENT

KHÔNG ĐƯỢC XÓA LOGIC: Khi refactor, tuyệt đối không được làm mất các state, useEffect, hay logic tính điểm/thời gian hiện có trong QuizTakingPage.js.

LÀM TỪNG BƯỚC: Chỉ thực hiện code khi có yêu cầu cụ thể cho từng bước. Không tự ý sửa đổi các component khác ngoài phạm vi được giao.

TAILWIND CSS: Sử dụng class của Tailwind để styling. Bỏ các padding lớn (p-6, p-8) trên mobile, thay bằng p-3 hoặc p-4 (edge-to-edge).

LỘ TRÌNH THỰC HIỆN (ROADMAP)

GIAI ĐOẠN 1: TẠO HOOK NHẬN DIỆN THIẾT BỊ

Yêu cầu: Tạo file src/hooks/useDevice.js.
Mô tả: Hook này dùng window.innerWidth để kiểm tra màn hình. Nếu < 1024 (breakpoint lg của Tailwind) thì trả về isMobile: true.
Mã nguồn mẫu yêu cầu AI tạo:

import { useState, useEffect } from 'react';

export function useDevice() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
}


GIAI ĐOẠN 2: TÁCH PRESENTER CHO DESKTOP

Yêu cầu: Tạo file src/pages/QuizTakingDesktop.jsx.
Mô tả: Copy toàn bộ giao diện (phần return (...)) từ QuizTakingPage.js hiện tại sang file này.
File này KHÔNG chứa logic gọi API hay khai báo useState. Nó chỉ là một "Dumb Component" nhận dữ liệu thông qua props.
Cấu trúc props yêu cầu:

const QuizTakingDesktop = ({
  originalQuiz, displayQuestions, userAnswers, currentQuestionIndex,
  bookmarkedQuestions, timeLeft, isTimeUp, isTimerPaused, showFeedback,
  isNavDrawerOpen, handleAnswerChange, handleJumpToQuestion, handleNextQuestion,
  handlePreviousQuestion, handleSubmitQuiz, handleToggleBookmark,
  setIsNavDrawerOpen, setIsTimeUp, setIsTimerPaused, setShowFeedback, quizMode, textSize
}) => {
  // Trả về giao diện Desktop cũ tại đây
}


GIAI ĐOẠN 3: TẠO PRESENTER CHO MOBILE (BẢN NHÁP)

Yêu cầu: Tạo file src/pages/QuizTakingMobile.jsx.
Mô tả: Component này nhận props y hệt như Desktop. Tạm thời chỉ trả về một thẻ div đơn giản để test luồng chạy.
Mã nguồn mẫu:

import React from 'react';

const QuizTakingMobile = (props) => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <h1 className="text-xl font-bold text-slate-800">Giao diện Mobile đang xây dựng</h1>
    </div>
  );
};

export default QuizTakingMobile;


GIAI ĐOẠN 4: BIẾN TRANG GỐC THÀNH CONTAINER (THE BRAIN)

Yêu cầu: Cập nhật src/pages/QuizTakingPage.js.
Mô tả: Giữ lại TOÀN BỘ logic (API, timers, state) ở nửa trên của file. Thay thế phần return để nó làm nhiệm vụ "người điều phối" (Router) giữa 2 giao diện.
Mã nguồn mẫu cần áp dụng cho phần return:

import { useDevice } from '../hooks/useDevice';
import QuizTakingDesktop from './QuizTakingDesktop';
import QuizTakingMobile from './QuizTakingMobile';

// ... (Giữ nguyên toàn bộ logic cũ ở trên) ...

  const { isMobile } = useDevice();

  const quizProps = {
    originalQuiz, displayQuestions, userAnswers, currentQuestionIndex,
    bookmarkedQuestions, timeLeft, isTimeUp, isTimerPaused, showFeedback,
    isNavDrawerOpen, handleAnswerChange, handleJumpToQuestion, handleNextQuestion,
    handlePreviousQuestion, handleSubmitQuiz, handleToggleBookmark,
    setIsNavDrawerOpen, setIsTimeUp, setIsTimerPaused, setShowFeedback,
    quizMode, textSize
  };

  if (loadingQuiz) return <div className="...">Đang tải...</div>;
  if (!originalQuiz || displayQuestions.length === 0) return <div className="...">Lỗi tải bộ đề.</div>;

  return isMobile ? <QuizTakingMobile {...quizProps} /> : <QuizTakingDesktop {...quizProps} />;


GIAI ĐOẠN 5: XÂY DỰNG UI CHO MOBILE

Yêu cầu: Code lại src/pages/QuizTakingMobile.jsx.
Mô tả UI:

Header (sticky top-0 z-50): Nút Thoát, Đồng hồ đếm ngược, Tiến độ (ProgressBar mỏng).

Main Content (flex-1 overflow-y-auto p-4): - Nếu là câu hỏi chùm (type === 'group'), tạo nút "Xem bệnh án" mở ra một Modal chứa caseStem.

Hiển thị nội dung displayQuestions[currentQuestionIndex].

Các options dùng text-base hoặc text-sm, chiếm w-full, padding p-3. Đảm bảo touch target đủ lớn.

Bottom Nav (fixed bottom-0 w-full): Nút "Câu trước", "Câu sau" (hoặc "Nộp bài"), "Kiểm tra" (nếu ở chế độ Review).

GIAI ĐOẠN 6: TÍCH HỢP GESTURE (VUỐT)

Yêu cầu: Cài đặt npm install react-swipeable và áp dụng vào QuizTakingMobile.jsx.
Mô tả: Cho phép người dùng vuốt sang trái/phải trên màn hình để chuyển câu hỏi.
Hướng dẫn triển khai cho AI:

import { useSwipeable } from 'react-swipeable';

// Khởi tạo handlers bên trong QuizTakingMobile
const handlers = useSwipeable({
  onSwipedLeft: () => {
    if (currentQuestionIndex < displayQuestions.length - 1) handleNextQuestion();
  },
  onSwipedRight: () => {
    if (currentQuestionIndex > 0) handlePreviousQuestion();
  },
  preventScrollOnSwipe: true,
  trackMouse: false
});

// Gắn vào thẻ bọc nội dung câu hỏi
// Thêm key để kích hoạt CSS animation (fade-in) mỗi khi đổi câu
<div {...handlers} className="flex-1 w-full overflow-y-auto p-4">
    <div key={displayQuestions[currentQuestionIndex]._id} className="animate-fadeIn">
        {/* Render nội dung câu hỏi ở đây */}
    </div>
</div>

GIAI ĐOẠN 7: TÍCH HỢP BOTTOM SHEET CHO MOBILE (BỆNH ÁN & GIẢI THÍCH)

Yêu cầu: Sử dụng `react-spring-bottom-sheet` để tạo khung trượt từ dưới lên cho `QuizTakingMobile.jsx`.

Mô tả:
- Import thư viện và component `ExplanationBlock`.
- Tạo state `isSheetOpen` và `sheetContentType` (caseStem/explanation).
- Thêm `BottomSheet` vào cuối giao diện.
- Gắn nút kích hoạt "Xem bệnh án" và "Xem giải thích" vào giao diện chính.
