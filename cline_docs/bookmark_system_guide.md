# Hướng dẫn Hệ thống Bookmarking (StudyMed)

## 1. Tổng quan
Hệ thống bookmark cho phép người dùng lưu lại các câu hỏi quan trọng để ôn tập. Hệ thống hoạt động theo mô hình MERN nhưng đã loại bỏ xác thực người dùng (authentication) để đơn giản hóa cho người dùng cá nhân.

## 2. Kiến trúc & Cơ chế hoạt động
Hệ thống hiện tại sử dụng collection `Bookmark` riêng biệt trong MongoDB để lưu trữ các ID câu hỏi được gắn cờ. 
- Không còn phụ thuộc vào `userId` hoặc `DEFAULT_USER_ID`.
- Mọi người dùng truy cập hệ thống đều có chung một danh sách bookmark toàn cục.

## 3. Luồng dữ liệu (Data Flow)

### Backend (`server/routes/api/bookmark.js`)
- `GET /api/bookmarks`: Truy vấn toàn bộ collection `Bookmark`, đối chiếu với `Quiz` collection để trả về chi tiết câu hỏi (đã flatten cả câu hỏi nhóm).
- `POST /api/bookmarks/:questionId`: Kiểm tra sự tồn tại của `questionId` trong collection. Nếu có thì xóa (Toggle Off), nếu chưa có thì thêm mới (Toggle On).

### Frontend (`client/src/`)
- **`QuizTakingPage.js`**:
    - Gọi API `POST /api/bookmarks/${questionId}` để toggle trạng thái.
    - Duy trì state `Set` để cập nhật icon bookmark (🚩/🏳️) ngay lập tức trên UI.
- **`BookmarkedQuestionsPage.js`**:
    - Gọi API `GET /api/bookmarks` để nhận về danh sách câu hỏi đã được flatten.
    - Hiển thị trực tiếp các câu hỏi này.

## 4. Cấu trúc dữ liệu
- Collection `Bookmark` lưu: `{ questionId: String, createdAt: Date }`.
- API trả về một mảng object câu hỏi đã được bổ sung thông tin: `quizId`, `parentId` (nếu là câu hỏi nhóm), `isChild`.

## 5. Xử lý lỗi
- **Lỗi cập nhật đánh dấu**: Đã xử lý tại Backend bằng cách kiểm tra và phản hồi chuẩn JSON, đồng thời Frontend đã được cập nhật để xử lý response này.
- **Trang bookmark trống**: Đã khắc phục bằng cách sửa logic đối chiếu câu hỏi nhóm/đơn tại Backend.