<template>
  <div class="realtime-panel">
    <div class="panel-head">
      <h3>Hoạt động mới nhất</h3>
    </div>

    <div v-if="!donations.length" class="empty">Chưa có giao dịch mới</div>

    <ul v-else class="donation-list">
      <li v-for="(item, idx) in donations" :key="idx" class="donation-item">
        <div class="meta">
          <span class="name">{{ donorName(item) }}</span>
          <span class="time">{{ formatTime(item.time) }}</span>
        </div>
        <div class="body">
          <span class="amount">+{{ formatCurrency(item.amount) }}</span>
          <span class="msg" v-if="item.message">{{ item.message }}</span>
        </div>
        <div class="campaign">Chiến dịch: {{ item.campaignCode }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import dayjs from 'dayjs';
import { formatLocal } from '@/utils/date';
import { useWebSocket } from '@/composables/useWebSocket';

const { connect, listenAllDonations, disconnect } = useWebSocket();

const donations = ref([]);
let subscription = null;

const donorName = item => item?.donorName || 'Người ủng hộ ẩn danh';
const formatCurrency = value => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`;

const formatTime = value => {
  if (!value) return '';
  const now = dayjs();
  const t = dayjs(value);
  if (now.diff(t, 'minute') < 1) return 'vừa xong';
  return formatLocal(value, 'HH:mm DD/MM/YYYY');
};

const handleDonation = payload => {
  if (!payload) return;
  donations.value = [payload, ...donations.value].slice(0, 30);
};

onMounted(async () => {
  await connect();
  subscription = listenAllDonations(handleDonation);
});

onUnmounted(() => {
  if (subscription && typeof subscription.unsubscribe === 'function') {
    subscription.unsubscribe();
  }
  disconnect();
});
</script>

<style scoped lang="scss">
.realtime-panel {
  border: 1px solid rgba(12, 100, 120, 0.12);
  border-radius: 12px;
  padding: 16px;
  background: #f8fbfc;
  display: grid;
  gap: 12px;
}

.panel-head {
  display: grid;
  gap: 4px;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(12, 100, 120, 0.7);
}

h3 {
  margin: 0;
  font-size: 18px;
  color: var(--primary-strong);
}

.empty {
  padding: 12px;
  border-radius: 10px;
  background: #eef6f7;
  color: rgba(12, 100, 120, 0.8);
}

.donation-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.donation-item {
  background: #fff;
  border: 1px solid rgba(12, 100, 120, 0.1);
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 6px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(12, 100, 120, 0.85);
}

.name {
  font-weight: 700;
  color: var(--primary-strong);
}

.time {
  font-style: italic;
}

.body {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.amount {
  font-weight: 800;
  color: #0b6c7f;
}

.msg {
  color: rgba(12, 100, 120, 0.85);
}

.campaign {
  font-size: 12px;
  color: rgba(12, 100, 120, 0.75);
}
</style>
