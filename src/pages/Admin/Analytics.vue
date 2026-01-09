<template>
  <section class="page analytics">
    <header class="hero">
      <div>
        <h1>Thống kê quyên góp</h1>
      </div>
      <div class="filters">
        <div class="field">
          <label>Ngày bắt đầu</label>
          <input type="date" v-model="range.start" />
        </div>
        <div class="field">
          <label>Ngày kết thúc</label>
          <input type="date" v-model="range.end" />
        </div>
        <div class="actions-inline">
          <button class="btn primary" @click="applyRange">Áp dụng</button>
          <button class="btn ghost" @click="resetRange">Xóa lọc</button>
        </div>
      </div>
    </header>

    <section class="summary-grid">
      <article class="card metric">
        <p class="label">Tổng số tiền</p>
        <p class="value">{{ formatCurrency(summary.totalAmount) }}</p>
        <p class="hint">Tính trong khoảng thời gian đã chọn</p>
      </article>
      <article class="card metric">
        <p class="label">Số giao dịch</p>
        <p class="value">{{ summary.totalTransactions }}</p>
        <p class="hint">Bao gồm tất cả trạng thái</p>
      </article>
      <article class="card metric">
        <p class="label">Người ủng hộ</p>
        <p class="value">{{ summary.totalDonors }}</p>
        <p class="hint">Bao gồm khách vãng lai</p>
      </article>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Nhà hảo tâm nổi bật</h3>
        </div>
        <p class="hint">Sắp xếp theo số tiền quyên góp</p>
      </div>
      <div v-if="loadingTop" class="skeleton-list">
        <div v-for="n in 4" :key="n" class="skeleton-row" />
      </div>
      <div v-else-if="!topDonators.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Chưa có dữ liệu trong khoảng đã chọn</p>
      </div>
      <div v-else class="top-list">
        <article v-for="item in topDonators" :key="item.phoneNumber || item.fullName || item.id" class="top-item">
          <div>
            <p class="name">{{ item.fullName || 'Ẩn danh' }}</p>
            <p class="muted">{{ item.phoneNumber || 'Không có số' }}</p>
          </div>
          <p class="amount">{{ formatCurrency(item.amount) }}</p>
        </article>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Danh sách chiến dịch</h3>
        </div>
      </div>

      <div v-if="campaignLoading" class="skeleton-list">
        <div v-for="n in 6" :key="n" class="skeleton-row" />
      </div>
      <div v-else-if="!campaigns.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Chưa có chiến dịch</p>
      </div>
      <div v-else class="table">
        <div class="table-row head">
          <span>Chiến dịch</span>
          <span>Đã gây quỹ</span>
          <span>Mục tiêu</span>
          <span>Trạng thái</span>
          <span></span>
        </div>
        <div class="table-row" v-for="item in campaigns" :key="item.campaignCode || item.id || item.code">
          <span class="title">{{ item.title || item.name || item.campaignName || 'Chiến dịch' }}</span>
          <span>{{ formatCurrency(item.currentAmount || item.raised || item.totalRaised || 0) }}</span>
          <span>{{ formatCurrency(item.targetAmount || item.goal || 0) }}</span>
          <span :class="['status', statusClass(item.status)]">{{ statusLabel(item.status) }}</span>
          <button class="btn ghost sm" @click="openTransactions(item)">Xem giao dịch</button>
        </div>
      </div>

      <div class="pagination" v-if="campaignPage.totalPages > 1">
        <button :disabled="campaignPage.number === 0" @click="changeCampaignPage(campaignPage.number - 1)">◀</button>
        <span>Trang {{ campaignPage.number + 1 }} / {{ campaignPage.totalPages }}</span>
        <button :disabled="campaignPage.number >= campaignPage.totalPages - 1" @click="changeCampaignPage(campaignPage.number + 1)">▶</button>
      </div>
    </section>

    <div v-if="showTransactions" class="drawer" @click.self="closeTransactions">
      <aside class="drawer-body">
        <header class="drawer-head">
          <div>
            <p class="eyebrow">Sao kê</p>
            <h3>{{ activeCampaignTitle }}</h3>
            <p class="muted">Mã chiến dịch: {{ activeCampaignCode }}</p>
          </div>
          <button class="btn ghost" @click="closeTransactions">Đóng</button>
        </header>

        <div v-if="txLoading" class="skeleton-list">
          <div v-for="n in 5" :key="n" class="skeleton-row" />
        </div>
        <div v-else-if="!transactions.length" class="empty compact">
          <span class="empty-icon" aria-hidden="true">📭</span>
          <p>Chưa có giao dịch</p>
        </div>
        <div v-else class="table dense">
          <div class="table-row head">
            <span>Người ủng hộ</span>
            <span>Số tiền</span>
            <span>Thời gian</span>
            <span>Trạng thái</span>
          </div>
          <div class="table-row" v-for="tx in transactions" :key="tx.id || tx.code">
            <span>{{ tx.fullName || tx.donorName || tx.name || 'N/A' }}</span>
            <span>{{ formatCurrency(tx.amount || tx.total || 0) }}</span>
            <span>{{ formatDateTime(tx.date || tx.createdAt || tx.time || tx.transactionDate) }}</span>
            <span :class="['status', statusClass(tx.status)]">{{ statusLabel(tx.status) }}</span>
          </div>
        </div>

        <div class="pagination" v-if="txPage.totalPages > 1">
          <button :disabled="txPage.number === 0" @click="changeTxPage(txPage.number - 1)">◀</button>
          <span>Trang {{ txPage.number + 1 }} / {{ txPage.totalPages }}</span>
          <button :disabled="txPage.number >= txPage.totalPages - 1" @click="changeTxPage(txPage.number + 1)">▶</button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  getTotalDonationStatistic,
  getTopDonatorStatistic,
  getMyCampaigns,
  fetchTransactions
} from '@/api/management.api';
import { formatLocal, toUtcString } from '@/utils/date';

const summary = ref({ totalAmount: 0, totalTransactions: 0, totalDonors: 0 });
const campaigns = ref([]);
const campaignPage = ref({ number: 0, totalPages: 0 });
const campaignLoading = ref(false);
const topDonators = ref([]);
const loadingTop = ref(false);

const transactions = ref([]);
const txPage = ref({ number: 0, totalPages: 0 });
const txLoading = ref(false);
const showTransactions = ref(false);
const activeCampaign = ref(null);

const range = reactive({ start: '', end: '' });
const pageSize = 8;

const formatCurrency = value => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`;
const formatDateTime = value => (value ? formatLocal(value, 'DD/MM/YYYY HH:mm') : '—');

const toApiDate = val => {
  if (!val) return null;
  const iso = toUtcString(val);
  return iso ? iso.slice(0, 19) : null;
};

const buildRangeParams = () => {
  const params = {};
  const start = toApiDate(range.start);
  const end = toApiDate(range.end);
  if (start) params.start = start;
  if (end) params.end = end;
  return params;
};

const statusLabel = status => {
  const s = (status || '').toString().toUpperCase().replace(/[-\s]/g, '_');
  if (['PENDING', 'CREATED'].includes(s)) return 'Chưa bắt đầu';
  if (['IN_PROGRESS', 'ACTIVE', 'RUNNING', 'ONGOING', 'PROCESSING'].includes(s)) return 'Đang diễn ra';
  if (['ON_HOLD', 'PAUSED', 'HOLD'].includes(s)) return 'Tạm dừng';
  if (['COMPLETED', 'SUCCESS', 'DONE', 'FINISHED', 'EARLY_FINISHED'].includes(s)) return 'Đã hoàn thành';
  if (['CANCELLED', 'CANCEL', 'CANCELED', 'REJECTED'].includes(s)) return 'Hủy';
  return 'Khác';
};

const statusClass = status => {
  const s = (status || '').toString().toUpperCase().replace(/[-\s]/g, '_');
  if (['PENDING', 'CREATED'].includes(s)) return 'pending';
  if (['IN_PROGRESS', 'ACTIVE', 'RUNNING', 'ONGOING', 'PROCESSING'].includes(s)) return 'in-progress';
  if (['ON_HOLD', 'PAUSED', 'HOLD'].includes(s)) return 'on-hold';
  if (['COMPLETED', 'SUCCESS', 'DONE', 'FINISHED', 'EARLY_FINISHED'].includes(s)) return 'completed';
  if (['CANCELLED', 'CANCEL', 'CANCELED', 'REJECTED'].includes(s)) return 'cancelled';
  return 'info';
};

const mapSummary = data => {
  const totalAmount = Number(
    data?.totalAmount ?? data?.totalReceived ?? data?.donated ?? data?.totalDonationAmount ?? 0
  );
  const totalTransactions = Number(
    data?.totalTransactions ?? data?.transactionCount ?? data?.count ?? data?.totalDonation ?? 0
  );
  const totalDonors = Number(
    data?.totalDonors ?? data?.donorCount ?? data?.uniqueDonors ?? data?.guestDonation ?? 0
  );
  return { totalAmount, totalTransactions, totalDonors };
};

const fetchSummary = async () => {
  try {
    const res = await getTotalDonationStatistic(buildRangeParams());
    summary.value = mapSummary(res);
  } catch (err) {
    summary.value = mapSummary({});
  }
};

const fetchTop = async () => {
  loadingTop.value = true;
  try {
    const res = await getTopDonatorStatistic({ ...buildRangeParams(), page: 0 });
    topDonators.value = res?.content || [];
  } catch (err) {
    topDonators.value = [];
  }
  loadingTop.value = false;
};

const fetchCampaigns = async (page = 0) => {
  campaignLoading.value = true;
  try {
    const res = await getMyCampaigns({ page, size: pageSize, ...buildRangeParams() });
    campaigns.value = res?.content || res || [];
    campaignPage.value = {
      number: res?.number ?? page,
      totalPages: res?.totalPages ?? 1,
      totalElements: res?.totalElements ?? campaigns.value.length
    };
  } catch (err) {
    campaigns.value = [];
    campaignPage.value = { number: 0, totalPages: 0, totalElements: 0 };
  }
  campaignLoading.value = false;
};

const activeCampaignCode = computed(() => {
  const c = activeCampaign.value;
  return c?.campaignCode || c?.code || c?.id || 'N/A';
});

const activeCampaignTitle = computed(() => {
  const c = activeCampaign.value;
  return c?.title || c?.name || c?.campaignName || 'Chiến dịch';
});

const fetchTx = async (page = 0) => {
  if (!activeCampaign.value) return;
  txLoading.value = true;
  try {
    const params = { campaignCode: activeCampaignCode.value, page, ...buildRangeParams() };
    const res = await fetchTransactions(params);
    transactions.value = res?.content || res || [];
    txPage.value = {
      number: res?.number ?? page,
      totalPages: res?.totalPages ?? 1
    };
  } catch (err) {
    transactions.value = [];
    txPage.value = { number: 0, totalPages: 0 };
  }
  txLoading.value = false;
};

const changeCampaignPage = page => {
  if (page < 0 || page === campaignPage.value.number) return;
  fetchCampaigns(page);
};

const openTransactions = campaign => {
  activeCampaign.value = campaign;
  showTransactions.value = true;
  txPage.value = { number: 0, totalPages: 0 };
  fetchTx(0);
};

const closeTransactions = () => {
  showTransactions.value = false;
  activeCampaign.value = null;
  transactions.value = [];
};

const changeTxPage = page => {
  if (page < 0 || page === txPage.value.number) return;
  fetchTx(page);
};

const resetRange = () => {
  range.start = '';
  range.end = '';
  reloadAll();
};

const applyRange = () => {
  reloadAll();
};

const reloadAll = () => {
  fetchSummary();
  fetchTop();
  if (showTransactions.value) fetchTx(txPage.value.number || 0);
};

onMounted(() => {
  fetchSummary();
  fetchTop();
  fetchCampaigns();
});
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
  display: grid;
  gap: 16px;
  background: #f6f8fb;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filters { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.actions-inline { display: flex; gap: 8px; }

.eyebrow { margin: 0; font-size: 12px; font-weight: 700; color: #0f766e; }
h1 { margin: 2px 0; }
.hint { margin: 4px 0 0; color: #5b7083; }



.field { display: grid; gap: 4px; font-size: 13px; color: #334155; }
.field input {
  padding: 8px 10px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  background: #fff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.metric { display: grid; gap: 6px; }
.metric .label { margin: 0; color: #0f172a; font-weight: 600; }
.metric .value { margin: 0; font-size: 24px; font-weight: 800; color: #0f766e; }

.panel { background: #fff; border-radius: 14px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: grid; gap: 12px; }

.panel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }

.skeleton-list { display: grid; gap: 8px; }
.skeleton-row { height: 40px; background: linear-gradient(90deg, #edf2f7 0%, #f6f8fb 50%, #edf2f7 100%); border-radius: 10px; animation: shimmer 1.3s infinite; }

@keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }

.top-list { display: grid; gap: 8px; }
.top-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
.name { margin: 0; font-weight: 700; }
.muted { margin: 2px 0 0; color: #64748b; font-size: 13px; }
.amount { margin: 0; font-weight: 700; color: #0f766e; }

.table { display: grid; gap: 6px; }
.table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; align-items: center; gap: 8px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; }
.table-row.head { background: transparent; color: #475569; font-weight: 700; }
.table-row .title { font-weight: 700; }

.table.dense .table-row { grid-template-columns: 1.6fr 1fr 1.2fr 0.8fr; background: #fff; border: 1px solid #e2e8f0; }

.status { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; text-align: center; display: inline-block; }
.status.pending { background: #fff8e1; color: #f7b500; }
.status.in-progress { background: #e6f4ea; color: #1a7f37; }
.status.on-hold { background: #fff8e1; color: #f7b500; }
.status.completed { background: #fdeaea; color: #e53935; }
.status.cancelled { background: #f6e9fb; color: #8e24aa; }
.status.info { background: #eff6ff; color: #1d4ed8; }

.btn { border: none; cursor: pointer; padding: 10px 14px; border-radius: 10px; font-weight: 700; }
.btn.primary { background: #0ea5e9; color: #fff; }
.btn.ghost { background: #e2e8f0; color: #0f172a; }
.btn.sm { padding: 8px 12px; }

.pagination { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.pagination button { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }

.empty { text-align: center; color: #64748b; display: grid; place-items: center; gap: 4px; padding: 16px; }
.empty.compact { padding: 8px; }
.empty-icon { font-size: 28px; }

.drawer { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); display: grid; justify-content: end; z-index: 20; }
.drawer-body { width: min(540px, 100%); background: #fff; padding: 18px; display: grid; gap: 12px; overflow-y: auto; }
.drawer-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }

@media (max-width: 768px) {
  .table-row { grid-template-columns: 1.6fr 1fr 1fr 1fr; }
  .table-row.head { display: none; }
  .table { gap: 10px; }
}
</style>
