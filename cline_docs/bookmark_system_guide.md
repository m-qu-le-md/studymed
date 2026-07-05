# Hướng dẫn Hệ thống Bookmarking (StudyMed)

## 1. Tổng quan
Hệ thống bookmark cho phép lưu lại các câu hỏi quan trọng để ôn tập. Dự án hiện tại đã loại bỏ xác thực người dùng (Open-access), mọi truy cập đều là ẩn danh.

## 2. Kiến trúc & Cơ chế hoạt động
Hệ thống sử dụng collection `Bookmark` trong MongoDB để lưu trữ các ID câu hỏi được gắn cờ. 
- **Không phụ thuộc người dùng**: Loại bỏ hoàn toàn `userId` và `DEFAULT_USER_ID`.
- **Toàn cục**: Danh sách bookmark dùng chung cho mọi truy cập.

## 3. Luồng dữ liệu (Data Flow)

### Backend (`server/routes/api/bookmark.js`)
- `GET /api/bookmarks`: Truy vấn collection `Bookmark`, đối chiếu với collection `Quiz` để trả về chi tiết câu hỏi (đã flatten cả câu hỏi nhóm).
- `POST /api/bookmarks/:questionId`: Chức năng Toggle (Nếu chưa có thì thêm, nếu đã có thì xóa).

### Frontend (`client/src/`)
- **Tương tác**: Gọi trực tiếp API `/api/bookmarks/:questionId` để toggle trạng thái.
- **State Management**: Duy trì local state (thường là `Set`) để đồng bộ UI (icon 🚩/🏳️) ngay lập tức mà không cần reload trang.
- **Hiển thị**: Trang `BookmarkedQuestionsPage.js` gọi API GET để render danh sách đã flatten.

## 4. Cấu trúc dữ liệu
- Collection `Bookmark`: `{ questionId: String, createdAt: Date }`.
- Response API: Mảng object câu hỏi đã được bổ sung thông tin `quizId`, `parentId` (nếu có), `isChild`.

## 5. Quy chuẩn Frontend
- Mọi thành phần hiển thị câu hỏi (như `QuestionSingleDisplay`) cần tương tác đồng bộ với state bookmark thông qua hook hoặc prop truyền từ Container Page.
- Đảm bảo xử lý `?.` (Optional Chaining) khi truy xuất dữ liệu câu hỏi trong trang bookmark để tránh crash runtime.