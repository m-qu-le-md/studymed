# Architecture: StudyMed

## Hệ thống kiến trúc (MERN Stack)
- **Frontend (Client)**: Ứng dụng React 19, sử dụng Tailwind CSS cho thiết kế Responsive (Edge-to-Edge). Giao tiếp với Backend qua Axios.
- **Backend (Server)**: RESTful API sử dụng `Express.js`. 
  - Lưu trữ dữ liệu: MongoDB (Mongoose).
  - Xử lý tệp tin: Tích hợp `Multer` và `Cloudinary` (folder `studymed_quizzes`).
  - Bảo mật: Kiến trúc Open-access, không yêu cầu xác thực JWT.

## Luồng dữ liệu chi tiết (Data Flow)
1. **Kiến trúc Frontend**: 
   - Sử dụng kiến trúc tách biệt giữa **Container** (xử lý logic) và **Presentation Layer** (view-specific).
   - Hệ thống View: Mỗi trang quan trọng (như QuizTaking, QuizReview) có cấu hình tách biệt cho Desktop/Mobile dựa trên Hook `useDevice`.
   - Thiết kế UI: JS thuần, Tailwind CSS, không sử dụng thư viện UI ngoài, tuân thủ tiêu chuẩn Edge-to-Edge trên mobile.
2. **Khởi tạo**: Server cấu hình các endpoint (`/api/quizzes`, `/api/study`, `/api/bookmark`).
3. **Yêu cầu (Request)**: Client gửi request trực tiếp đến API.
4. **Xử lý logic (Route Handler)**: Các thao tác CRUD (POST, GET, PUT, DELETE) trực tiếp thao tác với Mongoose Models.
5. **Phản hồi (Response)**: Trả về JSON cho Client.

## Quy ước quan trọng
- **CORS**: Cấu hình mở cho phép mọi origin.
- **Xác thực**: Đã gỡ bỏ toàn bộ, không yêu cầu Authorization header.
- **Upload**: Ảnh được đẩy lên Cloudinary trước khi lưu link vào Database.
- **Mobile Design**: Ưu tiên hiển thị tràn viền (Edge-to-Edge), sử dụng `?.` (Optional Chaining) và các kỹ thuật vuốt tự xây dựng.