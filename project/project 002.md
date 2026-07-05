# CONTEXT DỰ ÁN: DETOX VÀ TÁI CẤU TRÚC MOBILE VIEW (PROJECT 002)

**Tên dự án:** StudyMed (Nền tảng thi trắc nghiệm và ôn tập y khoa)
**Stack:** ReactJS thuần (MERN Stack), Tailwind CSS.
**Mục tiêu:** Khắc phục triệt để lỗi Crash `Cannot read properties of undefined` do dự án trước đó lạm dụng thư viện ngoài và sai định dạng file. Xây dựng lại giao diện Mobile (Container - Presenter) hoàn toàn bằng **React JS thuần + Tailwind CSS**.

## ⚠️ QUY TẮC TỐI THƯỢNG (BẮT BUỘC TUÂN THỦ 100%)
1. **KHÔNG CÀI THÊM THƯ VIỆN:** Cấm tuyệt đối việc sử dụng `react-spring-bottom-sheet`, `react-swipeable`, `lucide-react` hay bất kỳ thư viện UI nào khác. 
2. **CHUẨN ĐỊNH DẠNG FILE:** Tất cả các component tạo mới phải có đuôi **`.js`** (KHÔNG ĐƯỢC dùng `.jsx`).
3. **ICON THUẦN:** Sử dụng thẻ `<svg>` thuần của HTML thay vì import từ thư viện icon.
4. **SAFE RENDER:** Luôn cấp giá trị mặc định cho Object/Array (VD: `options = []`) và dùng Optional Chaining (`?.`) trước khi `.map()` để chống lỗi crash undefined.

---

## LỘ TRÌNH THỰC HIỆN (ROADMAP)

### BƯỚC 1: DỌN DẸP DEPENDENCIES (CLEANUP)
**Nhiệm vụ của AI:** Hướng dẫn người dùng gỡ bỏ các thư viện gây xung đột.
- Đưa ra lệnh Terminal: `npm uninstall react-spring-bottom-sheet react-swipeable lucide-react`
- Hướng dẫn người dùng đổi tên file `QuizTakingMobile.jsx` và `QuizTakingDesktop.jsx` thành đuôi `.js`.

### BƯỚC 2: CODE TÍNH NĂNG VUỐT (SWIPE) BẰNG JS THUẦN
**Nhiệm vụ của AI:** Không dùng `react-swipeable`. Hãy viết một Custom Hook hoặc thêm logic xử lý Touch Event thuần túy vào trong component.
**Gợi ý Logic mẫu:**
```javascript
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && currentQuestionIndex < displayQuestions.length - 1) handleNextQuestion();
    if (isRightSwipe && currentQuestionIndex > 0) handlePreviousQuestion();
  };
BƯỚC 3: XÂY DỰNG BOTTOM SHEET BẰNG TAILWIND THUẦN
Nhiệm vụ của AI: Viết giao diện khung trượt (Bottom Sheet) hiển thị "Bệnh án gốc" hoặc "Giải thích đáp án" bằng div tĩnh và CSS transition, không dùng thư viện animation.
Cấu trúc yêu cầu:

Một lớp fixed inset-0 z-50 làm màng bọc.

Một lớp absolute inset-0 bg-black/50 làm nền mờ (click vào để đóng).

Một lớp relative w-full bg-white rounded-t-3xl max-h-[85vh] đặt ở bottom để chứa nội dung.

BƯỚC 4: TRIỂN KHAI src/pages/QuizTakingMobile.js
Nhiệm vụ của AI: Viết lại toàn bộ code cho file QuizTakingMobile.js tích hợp Bước 2 và Bước 3.
Yêu cầu UI:

Thanh Progress bar mỏng ở Header.

Thẻ bọc nội dung câu hỏi phải có onTouchStart, onTouchMove, onTouchEnd để bắt sự kiện vuốt.

Danh sách đáp án dùng thẻ <label> bọc <input type="radio/checkbox">. Màu sắc phải đồng bộ Tailwind CSS (Xanh khi đúng, Đỏ khi sai) phụ thuộc vào state showFeedback.

Có nút kích hoạt hiển thị Modal Bottom Sheet khi type câu hỏi là group (chùm lâm sàng).

BƯỚC 5: KẾT NỐI ROUTER TẠI src/pages/QuizTakingPage.js
Nhiệm vụ của AI: Sửa phần return cuối cùng của QuizTakingPage.js.
Sử dụng Hook useDevice (nếu width < 1024px) để render <QuizTakingMobile {...quizProps} />, ngược lại render <QuizTakingDesktop {...quizProps} />.
Tuyệt đối giữ nguyên toàn bộ logic useEffect, tính giờ, chấm điểm ở nửa trên của file.

AI AGENT HÃY BẮT ĐẦU VỚI BƯỚC 1 VÀ XUẤT CODE CHO BƯỚC 4!