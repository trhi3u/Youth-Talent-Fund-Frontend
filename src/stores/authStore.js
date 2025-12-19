import { defineStore } from 'pinia';
import { login as loginApi } from '@/api/auth.api';

const STORAGE_KEY = 'auth_state_v1';

const normalizeRole = role => (role || '').replace(/^ROLE_/i, '').toUpperCase();

const loadPersistedAuth = () => {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (err) {
    console.warn('Failed to parse auth cache', err);
    return {};
  }
};

const persistAuth = payload => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload || {}));
};

const clearPersistedAuth = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: loadPersistedAuth().token || '',
    role: normalizeRole(loadPersistedAuth().role),
    userInfo: loadPersistedAuth().userInfo || null
  }),
  getters: {
    isAuthenticated: state => Boolean(state.token)
  },
  actions: {
    setAuth({ token, role, user }) {
      this.token = token || '';
      this.role = normalizeRole(role);
      this.userInfo = user || null;
      persistAuth({ token: this.token, role: this.role, userInfo: this.userInfo });
    },
    logout() {
      this.token = '';
      this.role = '';
      this.userInfo = null;
      clearPersistedAuth();
    },
    async login(payload) {
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

        this.setAuth({ token: dev.accessToken, role: dev.role, user: dev.userInfo });
        return dev;
      }

      const data = await loginApi(payload);
      const accessToken = data?.accessToken || data?.token;
      const userInfo = data?.userInfo || data?.user;
      const role = normalizeRole(userInfo?.roles?.[0] || data?.role || '');

      this.setAuth({ token: accessToken, role, user: userInfo });
      return { accessToken, userInfo, role };
    }
  }
});
