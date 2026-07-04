# Detailed Component Reference: StudyMed (Technical Documentation)

Dành cho nhà phát triển: Cách thức hoạt động và tái sử dụng các components trong hệ thống.

## 1. Input & Form Components
- **InputField.js**:
    - *Purpose*: Wrapper cho `input` tag.
    - *Features*: Hỗ trợ label, placeholder, và hiển thị thông báo lỗi.
- **CustomTagInput.js**:
    - *Purpose*: Xử lý tập hợp các thẻ (Tags).
    - *Logic*: Dùng để quản lý mảng tag trong `QuizGeneralInfo`. Cần xử lý sự kiện nhấn Enter hoặc phẩy để thêm tag mới.
- **QuizGeneralInfo.js**:
    - *Purpose*: Khối thông tin gốc của Quiz.
    - *Props*: `data` (object) và `onChange` (callback) để cập nhật state cha.

## 2. Editor Components (Sử dụng trong QuizFormPage)
- **QuestionSingleEditor.js**:
    - *Logic*: Dành cho trắc nghiệm A/B/C/D. Yêu cầu hiển thị input cho nội dung câu hỏi và danh sách các lựa chọn.
- **QuestionGroupEditor.js**:
    - *Logic*: Dành cho nhóm câu hỏi cùng tình huống lâm sàng (Case study). Cần hiển thị logic lồng ghép (Parent - Children).

## 3. Display & UX Components
- **QuestionSingleDisplay.js**:
    - *Purpose*: Render câu hỏi trong môi trường làm bài/xem lại.
    - *Features*: Hiển thị trạng thái đã chọn (selected) hoặc trạng thái đúng/sai (khi ở chế độ Review).
- **ResizableCaseStudy.js**:
    - *Purpose*: Tối ưu hóa đọc văn bản dài y khoa.
    - *Logic*: Sử dụng CSS/JS để drag hoặc kéo thả thay đổi height của container.
- **ExplanationBlock.js**:
    - *Purpose*: Hiển thị thông tin diễn giải (Medical Reasoning).
    - *Features*: Hỗ trợ render Markdown hoặc Rich text (cần cẩn trọng khi dùng `dangerouslySetInnerHTML`).

## 4. UI Library Components
- **Button.js**: Thiết kế theo biến thể `variant` (primary, danger, secondary).
- **QuizNavigationDrawer.js**:
    - *Logic*: Nhận vào mảng danh sách câu hỏi. Render grid các nút, highlight nút theo trạng thái (Đã làm/Chưa làm).