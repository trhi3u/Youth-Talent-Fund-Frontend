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
      if (import.meta.env.DEV) {
        const email = payload?.email || payload?.username || 'user@example.com';
        const name = payload?.fullName || payload?.name || email.split('@')[0] || 'Người dùng';
        const dev = {
          accessToken: 'dev-token-any-login',
          userInfo: {
            id: 'dev-user-any',
            fullName: name,
            email,
            avatarUrl: null,
            roles: ['ROLE_USER']
          },
          role: 'USER'
        };

        this.setAuth({ token: dev.accessToken, role: dev.role, user: dev.userInfo, rememberMe });
        return dev;
      }

      const data = await loginApi(payload);
      const accessToken = data?.accessToken || data?.token;
      const userInfo = data?.userInfo || data?.user;
      const role = normalizeRole(userInfo?.roles?.[0] || data?.role || '');

      this.setAuth({ token: accessToken, role, user: userInfo, rememberMe });
      return { accessToken, userInfo, role };
    }
  }
});
