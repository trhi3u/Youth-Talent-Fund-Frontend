import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const http = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
});

http.interceptors.request.use(config => {
  const auth = useAuthStore();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

http.interceptors.response.use(
  res => res.data,
  err => {
    const message = err?.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default http;
