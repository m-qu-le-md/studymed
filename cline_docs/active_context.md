# Active Context: StudyMed

## Trạng thái hiện tại
- Dự án đã hoàn thiện kiến trúc Open-access, loại bỏ hoàn toàn cơ chế đăng nhập và xác thực.
- Deployment: Server (Render), Frontend (Vercel).
- API cấu hình mở: `/api/quizzes`, `/api/study`, `/api/bookmark` (không yêu cầu auth).

## Các thay đổi gần đây
- **Kiến trúc UI/UX:** Hoàn tất chuyển đổi sang thiết kế Responsive (Edge-to-Edge) cho mobile. 
- **Component System:** Tái cấu trúc thành các bộ hiển thị chuyên biệt (`CaseStudyDisplay`, `QuestionSingleDisplay`) hỗ trợ cả Desktop và Mobile.
- **Mobile optimization:** Sử dụng JS thuần (không thư viện UI ngoài), định dạng file `.js` chuẩn, tối ưu bằng `?.` và kỹ thuật vuốt (useSwipe) tự xây dựng.
- **Loại bỏ Auth:** Đã dọn dẹp toàn bộ middleware và route liên quan đến JWT/User.
- **Hệ thống Bookmark:** Chuyển sang lưu trữ cục bộ độc lập, hỗ trợ linh hoạt cho cả câu hỏi đơn và nhóm câu hỏi.

## Ưu tiên hiện tại
- Duy trì tính ổn định của giao diện Edge-to-Edge.
- Đảm bảo tính nhất quán giữa tài liệu kỹ thuật và mã nguồn sau khi refactor.