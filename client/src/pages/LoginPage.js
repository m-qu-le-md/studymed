// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import AuthBackground from '../assets/auth-background.jpg';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/login', { email, password });
      setAlert('Đăng nhập thành công!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Đăng nhập thất bại!';
      setAlert(msg, 'error');
    }
  };

  // Reading this as: Authentication page for medical students, with a minimalist/calm language, leaning toward modern sans-serif typography + neutral palette.
  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex items-center justify-center p-6">
      <Link to="/" className="fixed top-6 left-6 text-sm font-semibold tracking-tight text-zinc-950">
        STUDYMED
      </Link>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-950 mb-8 tracking-tight text-center">
          Đăng nhập
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Email</label>
            <InputField type="email" name="email" value={email} onChange={onChange} required className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Mật khẩu</label>
            <InputField type="password" name="password" value={password} onChange={onChange} required className="w-full" />
          </div>
          <button type="submit" className="w-full bg-accent text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors mt-6">
            Đăng nhập
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;