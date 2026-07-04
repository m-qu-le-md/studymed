# Active Context: StudyMed

## Trạng thái hiện tại
- Dự án đang ở giai đoạn phát triển tính năng (Features development).
- Deployment: Server chạy liên tục trên Render, Frontend chạy trên Vercel.
- Cấu hình server đã thiết lập các API endpoint:
  - `/api/quizzes`: Quản lý quiz.
  - `/api/users`: Quản lý thông tin người dùng.
  - `/api/study`: Quản lý tiến trình học tập.
- CORS đã được cấu hình mở (`app.use(cors())`) để hỗ trợ phát triển local.
- Yêu cầu mới: Tự động push code lên GitHub sau mỗi thay đổi thành công.

## Các thay đổi gần đây (Dựa trên code)
- Xóa bỏ `authRoutes` khỏi `server/index.js` (dòng 11, 33).
- Đảm bảo các route `quiz`, `user`, `study` đã được kết nối đúng.
- Sử dụng Mongoose để kết nối database thông qua biến môi trường `MONGODB_URI`.
- Fix lỗi `textSize` is not defined trong `QuizReviewPage` và `QuizTakingPage`.
- Đã bổ sung hướng dẫn khởi động dự án vào `cline_docs/project_brief.md`.
- Fix lỗi ESLint `react-hooks/exhaustive-deps` trong `QuestionItem.js` và `QuestionSingleDisplay.js` để vượt qua build trên Vercel.
- Xây dựng bộ tài liệu kỹ thuật chi tiết (`cline_docs/pages_reference.md` và `cline_docs/component_reference.md`) nhằm mục đích onboarding cho dev mới.
- Tạo mới bộ đề mẫu `data/sample_quiz.json` tuân thủ chuẩn `QuizSchema`.
- Thiết lập quy trình tự động hóa git push cho tài khoản công việc (`mqule.md.hmu@gmail.com`).
