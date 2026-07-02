// src/services/api.js
import axios from 'axios';

// Sử dụng biến môi trường REACT_APP_API_URL
// Khi chạy cục bộ hoặc chưa cài đặt biến môi trường, ứng dụng sẽ gọi trực tiếp đến backend trên Render
const API_URL = process.env.REACT_APP_API_URL || 'https://studymed-backend.onrender.com';

// Tạo một instance Axios tùy chỉnh
const api = axios.create({
  baseURL: API_URL, // Đặt URL cơ sở cho tất cả các yêu cầu
  headers: {
    'Content-Type': 'application/json',
  },
});

// Đã xóa toàn bộ phần interceptor tự động thêm Authorization header

export default api;