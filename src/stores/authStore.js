import { defineStore } from 'pinia';
import { login as loginApi } from '@/api/auth.api';

const STORAGE_KEY = 'auth_state_v1';

const normalizeRole = role => (role || '').replace(/^ROLE_/i, '').toUpperCase();

const readStorage = storage => {
  if (!storage) return {};
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
  } catch (err) {
    console.warn('Failed to parse auth cache', err);
    return {};
  }
};

const loadAuth = () => {
  const local = typeof localStorage !== 'undefined' ? readStorage(localStorage) : {};
  if (local?.token) return local;
  const session = typeof sessionStorage !== 'undefined' ? readStorage(sessionStorage) : {};
  return session;
};

const persistAuth = (payload, useLocal) => {
  const target = useLocal ? localStorage : sessionStorage;
  if (!target) return;
  target.setItem(STORAGE_KEY, JSON.stringify(payload || {}));
};

const clearPersistedAuth = () => {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: loadAuth().token || '',
    role: normalizeRole(loadAuth().role),
    userInfo: loadAuth().userInfo || null
  }),
  getters: {
    isAuthenticated: state => Boolean(state.token)
  },
  actions: {
    setAuth({ token, role, user, rememberMe = false }) {
      this.token = token || '';
      this.role = normalizeRole(role);
      this.userInfo = user || null;
      const useLocal = this.role === 'USER' && rememberMe;
      clearPersistedAuth();
      persistAuth({ token: this.token, role: this.role, userInfo: this.userInfo }, useLocal);
    },
    logout() {
      this.token = '';
      this.role = '';
      this.userInfo = null;
      clearPersistedAuth();
    },
    async login(payload) {
      const rememberMe = Boolean(payload?.rememberMe);
      console.log('[AuthStore] Calling login API with:', { email: payload?.email });
      
      const data = await loginApi(payload);
      console.log('[AuthStore] Login API response:', data);
      
      const accessToken = data?.accessToken || data?.token;
      const userInfo = data?.userInfo || data?.user;
      const role = normalizeRole(userInfo?.roles?.[0] || data?.role || payload?.role || '');

      if (!userInfo) {
        console.error('[AuthStore] Missing user info in login response');
        throw new Error('Không có thông tin người dùng');
      }

      console.log('[AuthStore] Extracted:', { accessToken: accessToken?.substring(0, 20) + '...', role, userInfo });

      if (!accessToken) {
        console.error('[AuthStore] No access token in response');
        throw new Error(data?.message || 'Đăng nhập thất bại');
      }

      this.setAuth({ token: accessToken, role, user: userInfo, rememberMe });
      console.log('[AuthStore] Auth state set. Token stored:', Boolean(this.token));
      return { accessToken, userInfo, role };
    }
  }
});
