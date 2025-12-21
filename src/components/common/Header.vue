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

      <div class="actions" v-if="!isAuthenticated">
        <RouterLink class="btn ghost" to="/login">Đăng nhập</RouterLink>
        <RouterLink class="btn primary" to="/register">Đăng ký</RouterLink>
      </div>

      <div class="actions user-wrapper" v-else>
        <div class="user-menu" ref="avatarEl" @click="toggleDropdown">
          <div class="avatar" :class="{ placeholder: !hasCustomAvatar && !avatarUrl }" :style="avatarStyle">
            <span v-if="!hasCustomAvatar && !avatarUrl">{{ initials }}</span>
          </div>
          <span class="name">{{ displayName }}</span>
          <span v-if="roleLabel" class="role-pill">{{ roleLabel }}</span>
          <span class="chevron" aria-hidden="true">▾</span>
        </div>

        <div v-if="open" class="dropdown" ref="dropdownEl">
          <template v-if="isUser">
            <RouterLink to="/user/profile" class="item">Thông tin cá nhân</RouterLink>
            <RouterLink to="/user/donations" class="item">Lịch sử quyên góp</RouterLink>
            <RouterLink to="/user/change-password" class="item">Đổi mật khẩu</RouterLink>
            <div class="divider" />
            <button class="item danger" @click="handleLogout">Đăng xuất</button>
          </template>

          <template v-else-if="isAdmin || isStaff">
            <div class="item label">{{ displayName }}</div>
            <div class="item role">{{ roleLabel }}</div>
            <RouterLink v-if="isAdmin" to="/admin" class="item">Trang quản trị</RouterLink>
            <RouterLink v-if="isStaff" to="/staff" class="item">Trang nhân viên</RouterLink>
            <div class="divider" />
            <button class="item danger" @click="handleLogout">Đăng xuất</button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import SearchBar from '@/components/common/SearchBar.vue';
import defaultAvatar from '@/assets/image/avatar.png';

const router = useRouter();
const auth = useAuthStore();

const open = ref(false);
const avatarEl = ref(null);
const dropdownEl = ref(null);

const user = computed(() => auth.userInfo || auth.user || {});
const roles = computed(() => user.value?.roles || []);
const primaryRole = computed(() => roles.value[0] || auth.role || '');

const isAuthenticated = computed(() => auth.isAuthenticated);
const isUser = computed(() => roles.value.includes('ROLE_USER') || primaryRole.value === 'USER');
const isAdmin = computed(() => roles.value.includes('ROLE_ADMIN') || primaryRole.value === 'ADMIN');
const isStaff = computed(() => roles.value.includes('ROLE_STAFF') || primaryRole.value === 'STAFF');

const displayName = computed(() => user.value.fullName || user.value.name || user.value.email || 'Người dùng');
const userAvatar = computed(
  () => user.value?.avatarUrl || user.value?.avatarPath || user.value?.avatarPaths?.originalPath || ''
);
const avatarUrl = computed(() => userAvatar.value || defaultAvatar);
const hasCustomAvatar = computed(() => Boolean(userAvatar.value));
const initials = computed(() => (displayName.value || 'ND').trim().slice(0, 1).toUpperCase());
const avatarStyle = computed(() => (avatarUrl.value ? { backgroundImage: `url(${avatarUrl.value})` } : {}));

const roleLabel = computed(() => {
  if (isAdmin.value) return 'Admin';
  if (isStaff.value) return 'Staff';
  return '';
});

const baseNav = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Chiến dịch', to: '/campaigns' }
];

const roleNav = computed(() => {
  if (isAdmin.value) return [...baseNav, { label: 'Quản trị', to: '/admin' }];
  if (isStaff.value) return [...baseNav, { label: 'Staff', to: '/staff' }];
  return baseNav; 
});

const navItems = computed(() => roleNav.value);

const toggleDropdown = () => {
  open.value = !open.value;
};

const closeDropdown = () => {
  open.value = false;
};

const onClickOutside = event => {
  if (!open.value) return;
  const target = event.target;
  if (avatarEl.value?.contains(target) || dropdownEl.value?.contains(target)) return;
  closeDropdown();
};

const handleLogout = () => {
  auth.logout();
  closeDropdown();
  router.push('/');
};

onMounted(() => {
  window.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', onClickOutside);
});
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

.user-wrapper {
  position: relative;
}

.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(12, 100, 120, 0.06);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: rgba(12, 100, 120, 0.1);
  display: grid;
  place-items: center;
  color: #0c6478;
  font-weight: 700;
}

.avatar.placeholder {
  border: 1px dashed rgba(12, 100, 120, 0.25);
}

.name {
  font-weight: 700;
  color: var(--primary-strong);
}

.role-pill {
  background: rgba(9, 209, 199, 0.16);
  color: var(--primary-strong);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.chevron {
  font-size: 12px;
  color: rgba(12, 100, 120, 0.7);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: #fff;
  border: 1px solid rgba(12, 100, 120, 0.12);
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  padding: 8px;
  display: grid;
  gap: 4px;
  z-index: 20;
}

.item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  color: #0c6478;
  font-weight: 600;
  background: transparent;
  border: none;
}

.item:hover {
  background: rgba(9, 209, 199, 0.08);
}

.item.danger {
  color: #b42318;
}

.item.label {
  cursor: default;
  font-weight: 700;
}

.item.role {
  cursor: default;
  color: rgba(12, 100, 120, 0.75);
}

.divider {
  height: 1px;
  background: rgba(12, 100, 120, 0.12);
  margin: 4px 0;
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
