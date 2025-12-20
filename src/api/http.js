import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const http = axios.create({
  baseURL: 'http://localhost:8080/api',
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

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  res => res.data,
  err => {
    if (err?.response?.status === 401) {
      const auth = useAuthStore();
      auth.logout();
      window.location.href = '/login';
      return Promise.reject(err);
    }
    const message = err?.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default http;
