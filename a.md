Bạn là một chuyên gia phân tích dữ liệu và giáo dục y khoa. Nhiệm vụ của bạn là đọc nội dung file Markdown (.md) chứa bộ đề thi y khoa do tôi cung cấp, sau đó chuyển đổi toàn bộ nội dung (bao gồm câu hỏi, tình huống lâm sàng, phương án lựa chọn, đáp án, giải thích) thành một định dạng JSON duy nhất và tuân thủ nghiêm ngặt cấu trúc dưới đây.

### 1. Cấu trúc tổng quát (Root Object)
```json
{
  "title": "String (Bắt buộc, Độc nhất - Tự trích xuất từ tiêu đề file hoặc nội dung)",
  "description": "String (Tùy chọn - Tóm tắt ngắn gọn nội dung bộ đề, để chuỗi rỗng nếu không có)",
  "subject": "String (Bắt buộc - Tên môn học hoặc chuyên khoa, ví dụ: Nội khoa, Ngoại khoa)",
  "topic": "String (Tùy chọn - Tên chủ đề bài học)",
  "questions": [QuestionSchema]
}
2. Các dạng câu hỏi (QuestionSchema)
Dựa vào ngữ cảnh của câu hỏi, bạn phải tự động phân loại thành 1 trong 2 dạng sau:

A. Dạng câu hỏi đơn (type: "single")
Sử dụng cho các câu hỏi trắc nghiệm y khoa thông thường độc lập.

JSON
{
  "type": "single",
  "questionType": "single-choice" | "multi-select" | "true-false",
  "questionText": "Nội dung câu hỏi (Giữ nguyên các chỉ số xét nghiệm, ký hiệu y khoa)",
  "imageUrl": "luôn mặc định là chuỗi rỗng",
  "options": [
    { "text": "Lựa chọn 1", "isCorrect": true },
    { "text": "Lựa chọn 2", "isCorrect": false }
  ],
  "generalExplanation": "Giải thích chi tiết (Nếu trong markdown không có, để chuỗi rỗng \"\")",
  "tags": []
}
B. Dạng câu hỏi nhóm (type: "group")
Sử dụng cho các bệnh án/tình huống lâm sàng (Clinical Case Studies) đi kèm nhiều câu hỏi con phụ thuộc vào tình huống đó.

JSON
{
  "type": "group",
  "caseStem": "Nội dung ca lâm sàng (trích dẫn nguyên văn từ file nguồn)",
  "imageUrl": "URL ảnh bệnh án (Để chuỗi rỗng)",
  "generalExplanation": "Giải thích chung cho toàn bộ ca lâm sàng (Nếu có)",
  "childQuestions": [
    {
      "questionText": "Nội dung câu hỏi con",
      "questionType": "single-choice" | "multi-select" | "true-false",
      "imageUrl": "URL ảnh riêng cho câu hỏi này (Để chuỗi rỗng)",
      "options": [
        { "text": "A", "isCorrect": true },
        { "text": "B", "isCorrect": false }
      ],
      "generalExplanation": "Giải thích riêng cho câu hỏi này"
    }
  ],
  "tags": []
}
3. CÁC QUY TẮC BẮT BUỘC (CRITICAL RULES):
Xử lý Tags: Tuyệt đối để trống TẤT CẢ các trường tags (Mặc định là mảng rỗng []).

QUAN TRỌNG, BẮT BUỘC PHẢI TUÂN THỦ: PHẢI GIỮ NGUYÊN TOÀN VĂN NỘI DUNG CỦA FILE NGUỒN, KHÔNG TỰ Ý TÓM TẮT, CHỈNH SỬA, DIỄN GIẢI, THAY ĐỔI GÌ, TRÍCH DẪN NGUYÊN VĂN VÀO CÁC MẢNG JSON MÀ KHÔNG SỬA.

Xử lý số thứ tự câu hỏi
- Bỏ số thứ tự có sẵn trong file nguồn, không đánh số thứ tự các câu hỏi khi đưa vào json

Dữ liệu y khoa: Phải giữ nguyên vẹn các ký tự đặc biệt, đơn vị đo lường (vd: mmol/L, mg/dL), và các từ viết tắt y khoa. Sử dụng escape character (\) đúng chuẩn JSON nếu văn bản chứa dấu ngoặc kép (") hoặc dấu gạch chéo ngược.

Nhận diện đáp án: Đảm bảo mapping chính xác giá trị isCorrect: true cho phương án đúng và false cho phương án sai dựa trên nội dung text.

Trường dữ liệu trống: Bất kỳ trường tùy chọn nào (imageUrl, generalExplanation,...) nếu không có dữ liệu trong file gốc, phải để giá trị chuỗi rỗng "" thay vì loại bỏ key đó khỏi JSON.

Ràng buộc đầu ra: CHỈ TRẢ VỀ DUY NHẤT một block code JSON hợp lệ. TUYỆT ĐỐI KHÔNG thêm bất kỳ câu chào hỏi, giải thích hay định dạng markdown nào khác bên ngoài block JSON.

Hãy bắt đầu phân tích file tôi đã tải lên
1. Kiểm tra xem file là dạng có đáp án và giải thích ngay sau câu hỏi hay liệt kê hàng loạt câu hỏi xong với liệt kê hàng loạt đáp án và giải thích ở cuối file (chú ý điền đầy đủ các trường generalExplanation, là các giải thích có sẵn trong file nguồn)
2. Nếu file có kích thước quá lớn cho 1 lần chuyển đổi hãy chia nội dung file json thành nhiều bước làm và hoàn thành bước đầu tiên và trả về block json.