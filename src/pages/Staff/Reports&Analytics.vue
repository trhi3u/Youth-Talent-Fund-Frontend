<template>
  <section class="page">
    <div class="card box">
      <header class="head">
        <h1>Báo cáo & Thống kê</h1>
        <p class="hint">Tổng quan báo cáo và giao dịch mới nhất</p>
      </header>

      <div class="summary-grid">
        <div class="stat">
          <p class="label">Tổng báo cáo</p>
          <p class="value">{{ reports.length }}</p>
        </div>
        <div class="stat">
          <p class="label">Tổng giao dịch</p>
          <p class="value">{{ transactions.length }}</p>
        </div>
        <div class="stat">
          <p class="label">Tổng tiền giao dịch</p>
          <p class="value">{{ formatCurrency(totalTransactionAmount) }}</p>
        </div>
      </div>

      <section class="section">
        <div class="section-head">
          <h2>Báo cáo</h2>
          <span v-if="loadingReports" class="tag">Đang tải...</span>
        </div>
        <div v-if="!reports.length && !loadingReports" class="empty">Chưa có báo cáo</div>
        <div v-else class="grid">
          <article v-for="item in reports" :key="item.id || item.title" class="card row">
            <div class="row-head">
              <h3>{{ item.title || 'Báo cáo' }}</h3>
              <span class="pill">{{ formatDate(item.createdAt || item.date) }}</span>
            </div>
            <p class="muted">{{ item.description || 'Không có mô tả' }}</p>
            <p class="total">Tổng: {{ formatCurrency(item.total || item.amount) }}</p>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Giao dịch</h2>
          <span v-if="loadingTransactions" class="tag">Đang tải...</span>
        </div>
        <div v-if="!transactions.length && !loadingTransactions" class="empty">Chưa có giao dịch</div>
        <div v-else class="grid">
          <article v-for="item in transactions" :key="item.id || item.code" class="card row">
            <div class="row-head">
              <h3>{{ item.campaignCode || item.campaignId || 'Chiến dịch' }}</h3>
              <span class="pill">{{ formatDate(item.date) }}</span>
            </div>
            <p class="muted">Mã giao dịch: {{ item.code || item.id || '—' }}</p>
            <p class="total">Số tiền: {{ formatCurrency(item.amount) }}</p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStaffStore } from '@/stores/staffStore';
import { formatLocal } from '@/utils/date';

const staffStore = useStaffStore();

const loadingReports = ref(false);
const loadingTransactions = ref(false);

const reports = computed(() => staffStore.reports || []);
const transactions = computed(() => staffStore.transactions || []);

const totalTransactionAmount = computed(() =>
  transactions.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
);

const formatCurrency = value => (Number(value) || 0).toLocaleString('vi-VN') + 'đ';
const formatDate = value => (value ? formatLocal(value, 'HH:mm DD/MM/YYYY') : '—');

const loadData = async () => {
  loadingReports.value = true;
  loadingTransactions.value = true;
  try {
    await Promise.all([staffStore.loadReports(), staffStore.loadTransactions()]);
  } finally {
    loadingReports.value = false;
    loadingTransactions.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
  display: grid;
  place-items: center;
}

.box {
  width: min(1100px, 100%);
  padding: 24px;
  display: grid;
  gap: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.08);
}

.head {
  display: grid;
  gap: 6px;
}

.hint {
  margin: 0;
  color: rgba(12, 100, 120, 0.72);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.stat {
  padding: 14px;
  border-radius: 12px;
  background: #f0f9f8;
  border: 1px solid rgba(12, 100, 120, 0.1);
}

.stat .label {
  margin: 0;
  color: rgba(12, 100, 120, 0.75);
  font-weight: 600;
}

.stat .value {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--primary-strong);
}

.section {
  display: grid;
  gap: 12px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  padding: 4px 8px;
  border-radius: 10px;
  background: #eef6f7;
  color: rgba(12, 100, 120, 0.8);
  font-size: 12px;
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.row {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.1);
  background: #f8fbfc;
  display: grid;
  gap: 8px;
}

.row-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.pill {
  padding: 4px 8px;
  border-radius: 10px;
  background: rgba(12, 100, 120, 0.12);
  color: rgba(12, 100, 120, 0.85);
  font-size: 12px;
}

.muted {
  margin: 0;
  color: rgba(12, 100, 120, 0.72);
}

.total {
  margin: 0;
  font-weight: 700;
  color: #0b6c7f;
}

.empty {
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed rgba(12, 100, 120, 0.2);
  color: rgba(12, 100, 120, 0.8);
}

@media (max-width: 768px) {
  .row-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
