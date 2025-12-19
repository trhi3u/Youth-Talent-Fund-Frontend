<template>
  <section class="page">
    <div class="card surface">
      <div class="head">
        <h1>Lịch sử quyên góp</h1>
        <p class="hint">Theo dõi các khoản quyên góp của bạn</p>
      </div>

      <div class="stats">
        <div class="stat-card-1">
          <p class="label">Tổng quyên góp</p>
          <p class="value">{{ formatCurrency(totalAmount) }}</p>
        </div>
        <div class="stat-card-2">
          <p class="label">Chiến dịch đã tham gia</p>
          <p class="value">{{ campaignCount }}</p>
        </div>
      </div>

      <div class="table-wrap" v-if="loading">
        <div v-for="n in 3" :key="n" class="skeleton-row">
          <span class="skeleton text" />
          <span class="skeleton text" />
          <span class="skeleton text" />
          <span class="skeleton text" />
          <span class="skeleton badge" />
        </div>
      </div>

      <div class="table-wrap" v-else-if="donations.length">
        <div class="table-row header">
          <span>Chiến dịch</span>
          <span>Số tiền</span>
          <span>Ngày</span>
          <span>Lời nhắn</span>
          <span>Trạng thái</span>
        </div>
        <div class="table-row" v-for="item in donations" :key="item.id || item.code">
          <span class="title">{{ item.campaignName || item.campaignId || 'Chiến dịch' }}<small v-if="item.isAnonymous" class="pill">Ẩn danh</small></span>
          <span class="amount">{{ formatCurrency(item.amount) }}</span>
          <span class="date">{{ formatDate(item.date) }}</span>
          <span class="message">{{ item.message || '—' }}</span>
          <span class="status" :data-status="(item.status || 'SUCCESS').toLowerCase()">{{ statusText(item.status) }}</span>
        </div>
      </div>

      <div v-else class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Bạn chưa có lịch sử quyên góp</p>
      </div>

      <div class="actions-row" v-if="page.totalPages > 1">
        <button class="btn ghost" :disabled="pageNumber === 0 || loading" @click="changePage(pageNumber - 1)">Trang trước</button>
        <span class="page-info">Trang {{ pageNumber + 1 }} / {{ page.totalPages }}</span>
        <button class="btn ghost" :disabled="pageNumber >= page.totalPages - 1 || loading" @click="changePage(pageNumber + 1)">Trang sau</button>
      </div>

      <p v-if="error" class="feedback error">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

const authStore = useAuthStore();
const userStore = useUserStore();

const loading = computed(() => userStore.loadingDonations);
const donations = computed(() => userStore.donations || []);
const page = computed(() => userStore.donationPage || { totalPages: 0, totalElements: 0 });
const pageNumber = ref(0);
const error = computed(() => userStore.donationError);
const totalAmount = computed(() => donations.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0));
const campaignCount = computed(() => {
  const set = new Set();
  donations.value.forEach(item => {
    const key = item.campaignId || item.campaignName || item.campaignCode;
    if (key) set.add(key);
  });
  return set.size;
});

const formatCurrency = value => (Number(value) || 0).toLocaleString('vi-VN') + 'đ';
const formatDate = value => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
};

const statusText = status => {
  const s = (status || 'SUCCESS').toLowerCase();
  if (s === 'pending') return 'Đang xử lý';
  if (s === 'failed') return 'Thất bại';
  return 'Thành công';
};

const buildPayload = () => {
  const userCode = authStore.userInfo?.code || authStore.user?.code || '';
  return {
    userCode,
    pageNumber: pageNumber.value
  };
};

const fetchDonations = async () => {
  try {
    await userStore.fetchDonationHistory(buildPayload());
  } catch (err) {
    // error handled via store state
  }
};

const changePage = newPage => {
  pageNumber.value = newPage;
  fetchDonations();
};

onMounted(() => {
  fetchDonations();
});
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
  display: grid;
  place-items: center;
}

.surface {
  width: min(1000px, 100%);
  padding: 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.08);
  display: grid;
  gap: 18px;
}

.head {
  display: grid;
  gap: 6px;
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(12, 100, 120, 0.75);
}

.head h1 {
  margin: 0;
  font-size: 24px;
  color: var(--primary-strong);
}

.hint {
  margin: 0;
  color: rgba(12, 100, 120, 0.72);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.stat-card-1 {
  padding: 16px;
  border-radius: 14px;
  background: #F0FDFA;
  border: 1px solid rgba(12, 100, 120, 0.12);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 6px;
  text-align: center;
  align-items: center;
}

.stat-card-1 .label {
  margin: 0;
  color: rgba(12, 100, 120, 0.75);
  font-weight: 600;
}

.stat-card-1 .value {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #09D1C7;
}


.stat-card-2 {
  padding: 16px;
  border-radius: 14px;
  background: #CCFBF1;
  border: 1px solid rgba(12, 100, 120, 0.12);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 6px;
  text-align: center;
  align-items: center;
}

.stat-card-2 .label {
  margin: 0;
  color: rgba(12, 100, 120, 0.75);
  font-weight: 600;
}

.stat-card-2 .value {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--primary-strong);
}

.table-wrap {
  display: grid;
  gap: 8px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(12, 100, 120, 0.08);
  border-radius: 12px;
  background: #f8fbfc;
  align-items: center;
}

.table-row.header {
  background: rgba(12, 100, 120, 0.06);
  font-weight: 700;
}

.title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: var(--primary-strong);
}

.amount {
  font-weight: 800;
  color: #0b6c7f;
}

.date {
  color: rgba(12, 100, 120, 0.85);
}

.message {
  color: rgba(12, 100, 120, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  font-weight: 700;
  color: #2e7d32;
}

.status[data-status='pending'] {
  color: #f4a11a;
}

.status[data-status='failed'] {
  color: #b42318;
}

.pill {
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(12, 100, 120, 0.1);
  font-size: 12px;
  color: rgba(12, 100, 120, 0.9);
}

.empty {
  border: 1px dashed rgba(12, 100, 120, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: grid;
  place-items: center;
  gap: 8px;
  color: rgba(12, 100, 120, 0.8);
}

.empty-icon {
  font-size: 22px;
}

.skeleton-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #f3f7f9;
}

.skeleton {
  display: block;
  height: 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(9, 209, 199, 0.1) 0%, rgba(70, 223, 177, 0.18) 100%);
  animation: pulse 1.2s ease-in-out infinite;
}

.skeleton.text {
  width: 100%;
}

.skeleton.badge {
  width: 60%;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.actions-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.page-info {
  color: rgba(12, 100, 120, 0.85);
  font-weight: 600;
}

.btn {
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid var(--primary);
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s;
}

.btn.ghost {
  background: #f2fbf8;
  color: var(--primary-strong);
  border-color: rgba(12, 100, 120, 0.18);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.feedback.error {
  color: #b42318;
  margin: 0;
  font-weight: 700;
}

@media (max-width: 768px) {
  .table-row,
  .skeleton-row {
    grid-template-columns: 1fr;
  }
}
</style>
