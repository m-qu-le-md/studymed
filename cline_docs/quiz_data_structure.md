# Cấu trúc Dữ liệu Bộ đề (Quiz Data Structure)

Tài liệu này định nghĩa cấu trúc JSON chuẩn cho một bộ đề trong StudyMed, tương thích hoàn toàn với Mongoose Schema tại `server/models/Quiz.js`.

## 1. Cấu trúc tổng quát (Root Object)
```json
{
  "title": "String (Required, Unique)",
  "description": "String (Optional)",
  "subject": "String (Required)",
  "topic": "String (Optional)",
  "questions": [QuestionSchema]
}
```

## 2. Các dạng câu hỏi (QuestionSchema)

Hệ thống hỗ trợ 2 loại chính: `single` (câu đơn) và `group` (câu hỏi tình huống).

### A. Dạng câu hỏi đơn (`type: "single"`)
Sử dụng cho các câu hỏi trắc nghiệm thông thường.
```json
{
  "type": "single",
  "questionType": "single-choice" | "multi-select" | "true-false",
  "questionText": "Nội dung câu hỏi",
  "imageUrl": "URL ảnh minh họa (nếu có)",
  "options": [
    { "text": "Lựa chọn 1", "isCorrect": true },
    { "text": "Lựa chọn 2", "isCorrect": false }
  ],
  "generalExplanation": "Giải thích chi tiết",
  "tags": ["Tag1", "Tag2"]
}
```

### B. Dạng câu hỏi nhóm (`type: "group"`)
Sử dụng cho các bệnh án/tình huống lâm sàng có nhiều câu hỏi con.
```json
{
  "type": "group",
  "caseStem": "Nội dung ca lâm sàng",
  "imageUrl": "URL ảnh bệnh án (nếu có)",
  "generalExplanation": "Giải thích chung cho cả ca lâm sàng",
  "childQuestions": [
    {
      "questionText": "Câu hỏi con 1",
      "questionType": "single-choice",
      "imageUrl": "URL ảnh riêng cho câu hỏi này",
      "options": [
        { "text": "A", "isCorrect": true },
        { "text": "B", "isCorrect": false }
      ],
      "generalExplanation": "Giải thích riêng cho câu hỏi này"
    }
  ],
  "tags": ["Tag1"]
}