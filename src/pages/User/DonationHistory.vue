<template>
  <section class="page">
    <div class="card box">
      <h1>Lịch sử quyên góp</h1>
      <table class="table" v-if="donations.length">
        <thead>
          <tr>
            <th>Chiến dịch</th>
            <th>Số tiền</th>
            <th>Ngày</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in donations" :key="item.id">
            <td>{{ item.campaignId }}</td>
            <td>{{ item.amount.toLocaleString() }}đ</td>
            <td>{{ new Date(item.date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>Chưa có giao dịch.</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const donations = computed(() => userStore.donations);

onMounted(() => {
  userStore.loadDonations();
});
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
.table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid rgba(12, 100, 120, 0.1); padding: 10px; text-align: left; }
th { background: rgba(9, 209, 199, 0.08); }
</style>
