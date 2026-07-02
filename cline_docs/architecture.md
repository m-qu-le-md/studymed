# Architecture: StudyMed

## Hệ thống kiến trúc (MERN Stack)
- **Frontend (Client)**: Ứng dụng React chạy trên `react-scripts`. Giao tiếp với Backend qua `axios` với `baseURL` linh hoạt (hỗ trợ env var `REACT_APP_API_URL` hoặc fallback về Render server).
- **Backend (Server)**: RESTful API sử dụng `Express.js`. 
  - Lưu trữ dữ liệu: MongoDB (Mongoose).
  - Xử lý tệp tin: Tích hợp `Multer` và `Cloudinary` để quản lý ảnh (đặc biệt cho case study/quizzes).
  - Bảo mật: Middleware `authMiddleware` xử lý xác thực qua `JWT` (JSON Web Token) để bảo vệ các route nhạy cảm.

## Luồng dữ liệu chi tiết (Data Flow)
1. **Khởi tạo**: Server cấu hình các endpoint tại `server/index.js` bao gồm các module (`quiz`, `user`, `study`).
2. **Yêu cầu (Request)**: Client gửi request kèm hoặc không kèm token (định dạng `Bearer <token>`).
3. **Xử lý (Middleware)**: Nếu là route cần bảo mật, `authMiddleware` sẽ kiểm tra token, giải mã payload (chứa `user id`, `role`) và gán vào `req.user`.
4. **Xử lý logic (Route Handler)**: 
   - Ví dụ: `POST /api/quizzes/upload-image` sử dụng `Multer` để đẩy ảnh trực tiếp lên Cloudinary và trả về `secure_url`.
   - Các thao tác CRUD quiz (POST, GET, PUT, DELETE) trực tiếp thao tác với `Quiz` model.
5. **Phản hồi (Response)**: Trả về JSON cho Client, bao gồm cả lỗi xác thực hoặc lỗi validation nếu có.

## Quy ước quan trọng
- **CORS**: Đã cấu hình `app.use(cors())` cho phép mọi origin truy cập cục bộ.
- **Xác thực**: Token JWT được yêu cầu qua header `Authorization`.
- **Upload**: Ảnh được upload lên Cloudinary (thư mục `studymed_quizzes`) trước khi lưu link vào Database.