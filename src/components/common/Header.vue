<template>
  <header class="header">
    <div class="inner">
      <div class="brand" @click="router.push('/')">
        <div class="brand-text">
          <span class="brand-title">Quỹ Tài Năng Trẻ</span>
          <span class="brand-sub">Đồng hành cùng tương lai</span>
        </div>
      </div>

      <nav class="nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" active-class="active">
          {{ item.label }}
        </RouterLink>
      </nav>

      <SearchBar class="search" />

      <div class="actions">
        <span v-if="role" class="pill">{{ role }}</span>
        <span v-if="userName" class="user">{{ userName }}</span>
        <RouterLink v-if="role === 'ADMIN'" class="btn ghost" to="/admin">Admin</RouterLink>
        <RouterLink v-else-if="role === 'STAFF'" class="btn ghost" to="/staff">Staff</RouterLink>
        <RouterLink v-else-if="role === 'USER'" class="btn ghost" to="/user">Tài khoản</RouterLink>
        <template v-if="isAuthenticated">
          <button class="btn primary" @click="logout">Đăng xuất</button>
        </template>
        <template v-else>
          <RouterLink class="btn ghost" to="/login">Đăng nhập</RouterLink>
          <RouterLink class="btn primary" to="/register">Đăng ký</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import SearchBar from '@/components/common/SearchBar.vue';

const router = useRouter();
const auth = useAuthStore();

const role = computed(() => auth.role || '');
const isAuthenticated = computed(() => auth.isAuthenticated);
const userName = computed(() => auth.userInfo?.name || auth.userInfo?.email || '');

const baseNav = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Chiến dịch', to: '/campaigns' }
];

const roleNav = computed(() => {
  if (role.value === 'ADMIN') return [...baseNav, { label: 'Quản trị', to: '/admin' }];
  if (role.value === 'STAFF') return [...baseNav, { label: 'Staff', to: '/staff' }];
  if (role.value === 'USER') return [...baseNav, { label: 'Tài khoản', to: '/user' }];
  return baseNav;
});

const navItems = computed(() => roleNav.value);

const logout = () => {
  auth.logout();
  router.push('/');
};
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1px solid rgba(12, 100, 120, 0.08);
  box-shadow: 0 14px 32px rgba(12, 100, 120, 0.08);
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 18px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
}


.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-weight: 800;
  font-size: 18px;
  color: var(--primary-strong);
  letter-spacing: 0.3px;
}

.brand-sub {
  font-size: 12px;
  color: rgba(12, 100, 120, 0.7);
  font-weight: 600;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #ffffff;
  display: grid;
  place-items: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.nav {
  display: inline-flex;
  gap: 12px;
  justify-content: center;

  a {
    font-weight: 600;
    font-size: 14px;
    padding: 10px 12px;
    border-radius: 12px;
    color: var(--primary-strong);
    background: transparent;
    transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }

  .active {
    color: var(--primary-strong);
    background: rgba(9, 209, 199, 0.16);
    box-shadow: 0 10px 24px rgba(9, 209, 199, 0.18);
  }
}

.search {
  width: 100%;
  max-width: 340px;
  justify-self: end;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--primary);
  font-weight: 700;
  letter-spacing: 0.2px;
  transition: all 0.2s ease;

  &.primary {
    background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
    color: #ffffff;
    box-shadow: 0 10px 24px rgba(9, 209, 199, 0.35);
  }

  &.ghost {
    background: #f2fbf8;
    color: var(--primary-strong);
    border-color: rgba(12, 100, 120, 0.18);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }
}

.pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(9, 209, 199, 0.15);
  color: var(--primary-strong);
  font-weight: 700;
  letter-spacing: 0.3px;
}

.user {
  color: rgba(12, 100, 120, 0.9);
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(12, 100, 120, 0.08);
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(120deg, #09d1c7 0%, #0c6478 100%);
}
</style>
