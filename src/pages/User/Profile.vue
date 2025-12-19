<template>
  <section class="page">
    <div class="card box">
      <h1>Thông tin cá nhân</h1>
      <div v-if="profile" class="grid">
        <div class="field"><span>Họ tên</span><strong>{{ profile.name }}</strong></div>
        <div class="field"><span>Email</span><strong>{{ profile.email }}</strong></div>
        <div class="field"><span>Điện thoại</span><strong>{{ profile.phone }}</strong></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const profile = computed(() => userStore.profile);

onMounted(() => {
  userStore.loadProfile();
});
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.field { display: grid; gap: 4px; color: var(--primary-strong); background: #ffffff; padding: 12px; border-radius: 10px; border: 1px solid rgba(12, 100, 120, 0.1); }
</style>
