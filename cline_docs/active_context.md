# Active Context: StudyMed

## Trạng thái hiện tại
- Dự án đã chuyển sang chế độ mở (Open-access), loại bỏ hoàn toàn cơ chế đăng nhập và xác thực.
- Deployment: Server chạy trên Render, Frontend chạy trên Vercel.
- Cấu hình server đã đơn giản hóa API endpoints:
  - `/api/quizzes`: Quản lý quiz.
  - `/api/study`: Quản lý tiến trình học tập.
- CORS đã cấu hình mở cho phép mọi origin truy cập.

## Các thay đổi gần đây
- Loại bỏ hoàn toàn chức năng đăng nhập, đăng ký và bảo mật JWT.
- Xóa bỏ các tệp: `server/routes/auth.js`, `server/routes/user.js`, `server/middleware/authMiddleware.js`, `server/models/User.js`.
- Gỡ bỏ `AuthProvider` và các trang `LoginPage`, `RegisterPage` trong Frontend.
- Loại bỏ `axios interceptor` trong `client/src/services/api.js` để xử lý các cảnh báo token lỗi trong console.
