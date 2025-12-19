import { defineStore } from 'pinia';
import { login as loginApi } from '@/api/auth.api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    role: '',
    userInfo: null
  }),
  getters: {
    isAuthenticated: state => Boolean(state.token)
  },
  actions: {
    setAuth({ token, role, user }) {
      this.token = token || '';
      this.role = role || '';
      this.userInfo = user || null;
    },
    logout() {
      this.token = '';
      this.role = '';
      this.userInfo = null;
    },
    async login(payload) {
      const data = await loginApi(payload);
      const accessToken = data?.accessToken || data?.token;
      const userInfo = data?.userInfo || data?.user;
      const role = userInfo?.roles?.[0] || data?.role || '';

      this.setAuth({ token: accessToken, role, user: userInfo });
      return { accessToken, userInfo, role };
    }
  }
});
