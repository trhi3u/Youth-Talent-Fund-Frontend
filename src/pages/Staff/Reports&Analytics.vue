<template>
  <section class="page">
    <div class="card box">
      <h1>Báo cáo & Thống kê</h1>
      <div class="grid">
        <article v-for="item in reports" :key="item.id" class="card row">
          <div>
            <h3>{{ item.title }}</h3>
            <p>Tổng: {{ item.total.toLocaleString() }}đ</p>
          </div>
        </article>
      </div>
      <h2>Giao dịch</h2>
      <div class="grid">
        <article v-for="item in transactions" :key="item.id" class="card row">
          <div>
            <p>Chiến dịch: {{ item.campaignId }}</p>
            <p>Số tiền: {{ item.amount.toLocaleString() }}đ</p>
            <p>{{ new Date(item.date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useStaffStore } from '@/stores/staffStore';

const staffStore = useStaffStore();
const reports = computed(() => staffStore.reports);
const transactions = computed(() => staffStore.transactions);

onMounted(() => {
  staffStore.loadReports();
  staffStore.loadTransactions();
});
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 16px; }
.grid { display: grid; gap: 12px; }
.row { padding: 14px; }
</style>
