import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000
});

http.interceptors.request.use(config => {
  const auth = useAuthStore();
  let token = auth?.token;
  if (!token && typeof localStorage !== 'undefined') {
    token = JSON.parse(localStorage.getItem('auth_state_v1') || '{}')?.token;
  }
  if (!token && typeof sessionStorage !== 'undefined') {
    token = JSON.parse(sessionStorage.getItem('auth_state_v1') || '{}')?.token;
  }

  if (token) {
    // Backend tokenType already includes 'Bearer ', just append token
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[HTTP] Request to:', config.url, 'with auth:', config.headers.Authorization?.substring(0, 30) + '...');
  }
  return config;
});

http.interceptors.response.use(
  res => {
    console.log('[HTTP] Response from:', res.config?.url, 'status:', res.status);
    return res.data;
  },
  err => {
    console.error('[HTTP] Error:', err?.response?.status, err?.response?.data || err.message);
    const reqUrl = err?.config?.url || '';

    // Do not force redirect on login calls; let screens show error message
    const isAuthLogin = /\/auth\/login/i.test(reqUrl);

    if (err?.response?.status === 401 && !isAuthLogin) {
      const auth = useAuthStore();
      auth.logout();
      window.location.href = '/login';
      return Promise.reject(err);
    }
    let message = err?.response?.data?.message || err.message || 'Request failed';

    if (/bad credentials/i.test(message)) {
      message = 'Không có thông tin người dùng';
    }

    return Promise.reject(new Error(message));
  }
);

export default http;
