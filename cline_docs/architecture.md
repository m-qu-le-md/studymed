# Architecture: StudyMed

## Hệ thống kiến trúc (MERN Stack)
- **Frontend (Client)**: Ứng dụng React chạy trên `react-scripts`. Giao tiếp với Backend qua `axios` với `baseURL` linh hoạt (hỗ trợ env var `REACT_APP_API_URL` hoặc fallback về Render server).
- **Backend (Server)**: RESTful API sử dụng `Express.js`. 
  - Lưu trữ dữ liệu: MongoDB (Mongoose).
  - Xử lý tệp tin: Tích hợp `Multer` và `Cloudinary` để quản lý ảnh (đặc biệt cho case study/quizzes).
  - Bảo mật: Chế độ mở, không yêu cầu xác thực.

## Luồng dữ liệu chi tiết (Data Flow)
1. **Khởi tạo**: Server cấu hình các endpoint tại `server/index.js` bao gồm các module (`quiz`, `study`).
2. **Yêu cầu (Request)**: Client gửi request trực tiếp đến các API.
3. **Xử lý logic (Route Handler)**: 
   - Ví dụ: `POST /api/quizzes/upload-image` sử dụng `Multer` để đẩy ảnh trực tiếp lên Cloudinary và trả về `secure_url`.
   - Các thao tác CRUD quiz (POST, GET, PUT, DELETE) trực tiếp thao tác với `Quiz` model.
4. **Phản hồi (Response)**: Trả về JSON cho Client.

## Quy ước quan trọng
- **CORS**: Đã cấu hình `app.use(cors())` cho phép mọi origin truy cập.
- **Xác thực**: Đã gỡ bỏ toàn bộ, không còn yêu cầu JWT.
- **Upload**: Ảnh được upload lên Cloudinary (thư mục `studymed_quizzes`) trước khi lưu link vào Database.
