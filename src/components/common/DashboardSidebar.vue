<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : null"
      >
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  role: {
    type: String,
    required: true
  }
});

const route = useRoute();

const adminMenu = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Quản lý chiến dịch', to: '/admin/campaigns' },
  { label: 'Quản lý nhân viên', to: '/admin/staff' },
  { label: 'Tạo chiến dịch mới', to: '/admin/campaigns/create' },
  { label: 'Thống kê', to: '/admin/analytics' }
];

const staffMenu = [
  { label: 'Dashboard', to: '/staff/dashboard' },
  { label: 'Chiến dịch của tôi', to: '/staff/campaigns' },
  { label: 'Tạo chiến dịch', to: '/staff/campaigns/create' },
  { label: 'Báo cáo & thống kê', to: '/staff/reports' }
];

const items = computed(() => (props.role === 'ADMIN' ? adminMenu : staffMenu));

const isCampaignListTarget = target => /\/(admin|staff)\/campaigns$/.test(target);

const isActive = target => {
  if (isCampaignListTarget(target)) {
    // Do not highlight list when user is on the create page; highlight detail/edit pages
    if (/\/campaigns\/create($|\/)/.test(route.path)) return false;
    return route.path.startsWith(target);
  }
  return route.path.startsWith(target);
};
</script>

<style scoped lang="scss">
.sidebar {
  background: #0c6478;
  color: #e8f4f6;
  padding: 20px 16px;
  display: grid;
  align-content: start;
  gap: 10px;
  min-height: 100vh;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #e8f4f6;
  background: rgba(255, 255, 255, 0.06);
  font-weight: 700;
  transition: background 0.2s ease, transform 0.15s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(2px);
}

.nav-link.active {
  background: #fff;
  color: #0c6478;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.nav-label {
  white-space: nowrap;
}
</style>
