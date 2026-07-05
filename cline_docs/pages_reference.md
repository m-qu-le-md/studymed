# Detailed Page Reference: StudyMed (Technical Documentation)

Đây là tài liệu hướng dẫn chuyên sâu về các trang (Pages) của hệ thống. 

## 1. HomePage.js
- **Vai trò**: Entry point của ứng dụng.
- **Logic**: Giới thiệu giá trị cốt lõi, điều hướng đến `DashboardPage`.

## 2. DashboardPage.js
- **Vai trò**: Trung tâm điều khiển.
- **Logic**: Fetch toàn bộ quiz (`GET /api/quizzes`), hiển thị danh sách để quản lý (CRUD) hoặc Bắt đầu học.

## 3. QuizFormPage.js
- **Vai trò**: Form quản lý nội dung (Quiz Builder).
- **Logic**: Xử lý Create/Edit quiz. Quản lý state `QuizGeneralInfo` và các trình soạn thảo câu hỏi (`QuestionSingleEditor`/`QuestionGroupEditor`).

## 4. QuizTakingPage.js (Container)
- **Vai trò**: Điều phối môi trường làm bài thi (Container pattern).
- **Logic**: 
    - Sử dụng `useDevice.js` để render `QuizTakingDesktop.js` hoặc `QuizTakingMobile.js`.
    - Quản lý State: Timer, Bookmark, Answer Management.
    - Responsive: Tích hợp design Edge-to-Edge trên Mobile.

## 5. Presenter Components (QuizTakingDesktop/Mobile)
- **QuizTakingDesktop.js**: UI chuẩn cho Desktop, dùng `QuizNavigationDrawer`, `CaseStudyDisplay`.
- **QuizTakingMobile.js**: Tối ưu Mobile, dùng `useSwipe.js` và Bottom Sheet thuần CSS. Không sử dụng thư viện UI ngoài.

## 6. QuizResultPage.js
- **Vai trò**: Báo cáo kết quả.
- **Logic**: Tổng hợp kết quả, hiển thị feedback điểm số.

## 7. QuizReviewPage.js
- **Vai trò**: Phân tích đáp án.
- **Logic**: Render lại đề, highlight kết quả đúng/sai kèm `ExplanationBlock`.

## 8. BulkUploadPage.js
- **Vai trò**: Tiện ích nạp liệu JSON.

## 9. BookmarkedQuestionsPage.js
- **Vai trò**: Quản lý bookmark.
- **Logic**: Gọi `GET /api/bookmarks`, hiển thị danh sách câu hỏi đã được flatten, hỗ trợ chỉnh sửa nhanh qua `EditQuestionPage`.

## 10. EditQuestionPage.js
- **Vai trò**: Chỉnh sửa chi tiết câu hỏi đơn lẻ.
- **Logic**: API `PUT` lên server để cập nhật nội dung sau khi sửa.