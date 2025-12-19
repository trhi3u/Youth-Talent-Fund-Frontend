<template>
  <section class="page">
    <div class="card box">
      <h1>Dashboard Staff</h1>
      <p>Truy cập nhanh các chiến dịch bạn phụ trách.</p>
      <div class="grid">
        <article v-for="item in campaigns" :key="item.id" class="card row">
          <div>
            <h3>{{ item.title }}</h3>
            <p>Trạng thái: {{ item.status }}</p>
          </div>
          <RouterLink :to="`/staff/campaigns/${item.id}/update`" class="btn primary">Cập nhật</RouterLink>
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
.grid { display: grid; gap: 12px; }
.row { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--primary); background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%); color: #fff; font-weight: 600; }
</style>
