# Active Context: StudyMed

## Trạng thái hiện tại
- Dự án đang ở giai đoạn phát triển tính năng (Features development).
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