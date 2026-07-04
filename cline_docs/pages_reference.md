# Detailed Page Reference: StudyMed (Technical Documentation)

Đây là tài liệu hướng dẫn chuyên sâu về các trang (Pages) của hệ thống. Tài liệu dành cho các nhà phát triển mới tiếp cận dự án.

## 1. HomePage.js
- **Vai trò**: Entry point của ứng dụng.
- **Logic**: Sử dụng các phần tử tĩnh để giới thiệu giá trị cốt lõi của StudyMed. Không gọi API. Điều hướng người dùng bằng `react-router-dom` (Link/useNavigate) đến Dashboard nếu đã đăng nhập hoặc trang Auth nếu chưa.

## 2. LoginPage.js & RegisterPage.js
- **Vai trò**: Xác thực người dùng (Authentication Layer).
- **Logic**:
    - Sử dụng `axios` gửi `POST` request đến `/api/users/login` hoặc `/api/users/register`.
    - Quản lý trạng thái loading và error để phản hồi UI.
    - Lưu trữ token (JWT) vào Local Storage sau khi đăng nhập thành công.
- **Lưu ý**: Cần chuyển hướng người dùng về `DashboardPage` sau khi xác thực thành công.

## 3. DashboardPage.js
- **Vai trò**: Trung tâm điều khiển chính.
- **Logic**:
    - Gọi `GET /api/quizzes` để lấy toàn bộ danh sách bộ đề.
    - Sử dụng React Hooks (`useEffect`) để fetch dữ liệu.
    - Hiển thị các hành động (CRUD): Chỉnh sửa (`QuizFormPage`), Xóa (xác nhận trước khi gọi DELETE API), hoặc Bắt đầu học (`QuizTakingPage`).

## 4. QuizFormPage.js
- **Vai trò**: Form quản lý nội dung (Quiz Builder).
- **Logic**:
    - Nhận `quizId` qua `useParams` để quyết định trạng thái (Create/Edit).
    - Quản lý state phức tạp bao gồm: Thông tin chung (`QuizGeneralInfo`), Danh sách câu hỏi (`QuestionSingleEditor` hoặc `QuestionGroupEditor`).
    - Validation: Kiểm tra dữ liệu trước khi `POST` hoặc `PUT` lên server.

## 5. QuizTakingPage.js
- **Vai trò**: Môi trường làm bài thi thực tế.
- **Logic**:
    - Fetch chi tiết bộ đề qua `GET /api/quizzes/:id`.
    - Sử dụng `QuizNavigationDrawer` để người dùng nhảy nhanh giữa các câu hỏi.
    - Quản lý state "câu trả lời hiện tại" cục bộ trước khi submit kết quả cuối cùng qua `POST /api/study/submit`.

## 6. QuizResultPage.js
- **Vai trò**: Màn hình báo cáo kết quả.
- **Logic**: Nhận dữ liệu kết quả từ state của `QuizTakingPage` (hoặc thông qua location state). Tính toán phần trăm, điểm số và hiển thị summary.

## 7. QuizReviewPage.js
- **Vai trò**: Phân tích đáp án (Learning & Reflection).
- **Logic**: Hiển thị lại toàn bộ bộ đề, mỗi câu hỏi được đối chiếu với đáp án người dùng chọn để highlight đúng/sai. Tích hợp `ExplanationBlock` để show giải thích y khoa.

## 8. BulkUploadPage.js
- **Vai trò**: Tiện ích nạp liệu nhanh.
- **Logic**: Xử lý input JSON thô. Cần validate cấu trúc JSON theo Mongoose Schema (`Quiz.js`) trước khi gửi lên `POST /api/quizzes/bulk`.

## 9. BookmarkedQuestionsPage.js
- **Vai trò**: Lưu trữ và quản lý câu hỏi đã gắn cờ.
- **Tính năng**: Cho phép review câu hỏi, bỏ gắn cờ và chỉnh sửa câu hỏi trực tiếp (điều hướng sang `EditQuestionPage`).

## 10. EditQuestionPage.js
- **Vai trò**: Chỉnh sửa chi tiết một câu hỏi cụ thể trong bộ đề.
- **Logic**: 
    - Nhận `quizId` và `questionId` qua URL params.
    - Fetch dữ liệu bộ đề và render `QuestionSingleEditor`.
    - Gọi API `PUT /api/quizzes/:quizId` để cập nhật dữ liệu.
