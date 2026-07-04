# Hướng dẫn Import/Push Quiz JSON lên Database

Để tải một file JSON chứa bộ đề lên MongoDB, hãy thực hiện các bước sau:

1. **Chuẩn bị file dữ liệu**: Đặt file JSON mới vào thư mục `data/`.
2. **Sử dụng script seeding**: Sử dụng script `server/scripts/upload_quiz.js` để đẩy dữ liệu lên database.
   - Script này tự động đọc file JSON, và lưu/cập nhật vào MongoDB (sử dụng `upsert` dựa trên `title` của bộ đề).
3. **Thực thi**:
   - Mở terminal trong thư mục gốc.
   - Chạy lệnh: `node server/scripts/upload_quiz.js`
4. **Kiểm tra**: Sau khi chạy xong, kiểm tra console log "Quiz saved/updated successfully!".

**Lưu ý**: Đảm bảo `MONGODB_URI` đã được cấu hình trong `server/.env`.