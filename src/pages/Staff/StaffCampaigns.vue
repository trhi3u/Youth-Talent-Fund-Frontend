<template>
  <section class="page">
    <div class="card box">
      <div class="header">
        <h1>Chiến dịch của tôi</h1>
        <RouterLink class="btn primary" to="/staff/campaigns/create">Tạo chiến dịch</RouterLink>
      </div>
      <div class="grid">
        <article v-for="item in campaigns" :key="item.id" class="card row">
          <div>
            <h3>{{ item.title }}</h3>
            <p>Trạng thái: {{ item.status }}</p>
          </div>
          <div class="actions">
            <RouterLink :to="`/staff/campaigns/${item.id}/edit`" class="btn ghost">Sửa</RouterLink>
            <RouterLink :to="`/staff/campaigns/${item.id}/update`" class="btn primary">Cập nhật</RouterLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useStaffStore } from '@/stores/staffStore';

const staffStore = useStaffStore();
const campaigns = computed(() => staffStore.campaigns);

onMounted(() => {
  staffStore.fetchCampaigns();
});
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.grid { display: grid; gap: 12px; }
.row { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 8px; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--primary); font-weight: 600; }
.primary { background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%); color: #fff; }
.ghost { background: transparent; color: var(--primary-strong); }
</style>
