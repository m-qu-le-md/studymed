// src/services/api.js
import axios from 'axios';

// Sử dụng biến môi trường REACT_APP_API_URL
// Khi chạy cục bộ hoặc chưa cài đặt biến môi trường, ứng dụng sẽ gọi trực tiếp đến backend trên Render
const API_URL = process.env.REACT_APP_API_URL || 'https://studymed.onrender.com';

// Tạo một instance Axios tùy chỉnh
const api = axios.create({
  baseURL: API_URL, // Đặt URL cơ sở cho tất cả các yêu cầu
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào header cho các yêu cầu xác thực
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Interceptor - Token:', token);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('Interceptor - No token found in localStorage');
  }
  return config;
}, (error) => {
  console.error('Interceptor Error:', error);
  return Promise.reject(error);
});

export default api;
