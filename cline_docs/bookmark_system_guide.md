# Hướng dẫn Hệ thống Bookmarking (StudyMed)

## 1. Tổng quan
Hệ thống bookmark cho phép người dùng lưu lại các câu hỏi quan trọng để ôn tập. Hệ thống hoạt động theo mô hình MERN nhưng đã loại bỏ xác thực người dùng (authentication) để đơn giản hóa cho người dùng cá nhân.

## 2. Kiến trúc & Cơ chế hoạt động
Do không còn hệ thống đăng nhập, hệ thống sử dụng một **Fixed User ID** cố định để lưu trữ danh sách các câu hỏi đã gắn cờ trên MongoDB.

### Cấu hình môi trường (Quan trọng)
Hệ thống định danh người dùng qua biến môi trường:
- `DEFAULT_USER_ID`: ID của một user duy nhất trong collection `users`. ID này phải khớp với ID của document user tồn tại trong database MongoDB.

## 3. Luồng dữ liệu (Data Flow)

### Backend (`server/routes/user.js`)
- **Tất cả các route** (PUT bookmark, GET bookmarks) đều sử dụng `User.findById(process.env.DEFAULT_USER_ID)`.
- **Lưu ý**: Nếu `DEFAULT_USER_ID` không tồn tại trong DB, các route sẽ trả về lỗi 404. Cần đảm bảo database đã có sẵn document user này.

### Frontend (`client/src/`)
- **`QuizTakingPage.js`**:
    - Gọi API `api.put('/api/users/bookmark/${questionId}')` để toggle trạng thái bookmark.
    - Cập nhật state cục bộ `bookmarkedQuestions` (dạng `Set`) để phản ánh trạng thái trên UI ngay lập tức.
- **`BookmarkedQuestionsPage.js`**:
    - Gọi API `api.get('/api/users/bookmarks')` để lấy danh sách chi tiết các câu hỏi đã lưu.
    - Xử lý dữ liệu trả về và hiển thị dưới dạng danh sách các câu hỏi đã gắn cờ.

## 4. Cách thiết lập khi deploy
Khi triển khai trên Render hoặc môi trường production:
1. Đảm bảo MongoDB đã có ít nhất một user.
2. Lấy `_id` của user đó.
3. Thiết lập biến môi trường trên Render:
   - Key: `DEFAULT_USER_ID`
   - Value: `[ID_đã_lấy]`
4. Server sẽ tự động sử dụng ID này làm "chủ sở hữu" cho mọi hành động bookmark.

## 5. Xử lý lỗi thường gặp
- **Lỗi 404 khi bookmark**: Kiểm tra xem `DEFAULT_USER_ID` trong `.env` có trùng khớp với ID trong database không.
- **TypeError (Cannot read 'has' of undefined)**: Thường xảy ra ở `BookmarkedQuestionsPage.js` khi dữ liệu API trả về rỗng hoặc sai cấu trúc. Đã có code bảo vệ (`item?.question`), nhưng hãy kiểm tra lại cấu trúc dữ liệu nếu bạn thay đổi Model `Quiz`.