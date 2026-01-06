<template>
  <section class="page">
    <div class="header">
      <div>
        <h1>Dashboard Staff</h1>
        <p class="eyebrow">Tổng quan chiến dịch bạn phụ trách</p>
      </div>
    </div>

    <div class="layout-block">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="icon bubble primary" aria-hidden="true">📈</div>
          <div class="meta">
            <p class="label">Tổng chiến dịch</p>
            <p class="value">{{ totals.total }}</p>
            <p class="hint">Tất cả chiến dịch của bạn</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="icon bubble success" aria-hidden="true">🔥</div>
          <div class="meta">
            <p class="label">Đang diễn ra</p>
            <p class="value">{{ totals.active }}</p>
            <p class="hint">Còn thời gian</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="icon bubble info" aria-hidden="true">✅</div>
          <div class="meta">
            <p class="label">Hoàn thành</p>
            <p class="value">{{ totals.completed }}</p>
            <p class="hint">Đã kết thúc</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="icon bubble accent" aria-hidden="true">💝</div>
          <div class="meta">
            <p class="label">Tổng quyên góp</p>
            <p class="value currency">{{ totals.donations }}</p>
            <p class="hint">Theo dữ liệu hiện có</p>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h3>Chiến dịch gần đây</h3>
            </div>
          </div>

          <div v-if="loading" class="skeleton-list">
            <div v-for="n in 4" :key="n" class="skeleton-row" />
          </div>

          <div v-else-if="!campaigns.length" class="empty">
            <span class="empty-icon" aria-hidden="true">📭</span>
            <p>Bạn chưa có chiến dịch nào</p>
          </div>

          <div v-else class="cards-grid single-column">
            <CampaignCardDashboard
              v-for="item in recentCampaigns"
              :key="item.code || item.campaignCode || item.id"
              :campaign="item"
              :hideCover="true"
              :role="'STAFF'"
            />
          </div>
        </div>

        <div class="panel highlight">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Tổng hợp</p>
              <h3>Tiến độ & phân bổ</h3>
            </div>
          </div>

          <div class="stack">
            <div class="stack-row">
              <p class="label">Đang diễn ra</p>
              <p class="value">{{ totals.active }}</p>
            </div>
            <div class="progress">
              <span class="bar" :style="{ width: activePercent + '%' }" />
            </div>

            <div class="stack-row">
              <p class="label">Hoàn thành</p>
              <p class="value">{{ totals.completed }}</p>
            </div>
            <div class="progress secondary">
              <span class="bar" :style="{ width: completedPercent + '%' }" />
            </div>

            <div class="stack-row">
              <p class="label">Tổng quyên góp</p>
              <p class="value currency">{{ totals.donations }}</p>
            </div>
            <p class="hint">Số liệu dựa trên chiến dịch của bạn</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStaffStore } from '@/stores/staffStore';
import CampaignCardDashboard from '@/components/campaign/CampaignCardDashboard.vue';

const staffStore = useStaffStore();
const loading = ref(false);

const mapStatus = status => {
  if (['COMPLETED', 'DONE', 'FINISHED', 'CLOSED'].includes(status)) return 'Hoàn thành';
  if (['IN_PROGRESS', 'ACTIVE', 'RUNNING', 'ONGOING'].includes(status)) return 'Đang diễn ra';
  return status || 'Khác';
};

const mapStatusClass = status => {
  if (['COMPLETED', 'DONE', 'FINISHED', 'CLOSED'].includes(status)) return 'success';
  if (['IN_PROGRESS', 'ACTIVE', 'RUNNING', 'ONGOING'].includes(status)) return 'info';
  return 'muted';
};

const rawCampaigns = computed(() => (Array.isArray(staffStore.campaigns) ? staffStore.campaigns : []));

const campaigns = computed(() =>
  rawCampaigns.value.map(item => {
    const title = item.title || item.name || item.campaignName || 'Chiến dịch';
    const statusRaw = (item.status || '').toString().toUpperCase();
    const statusLabel = mapStatus(statusRaw);
    const statusClass = mapStatusClass(statusRaw);
    const currentAmount = Number(item.currentAmount ?? item.raised ?? item.totalRaised ?? 0);
    const targetAmount = Number(item.targetAmount ?? item.goal ?? item.expectedAmount ?? 0);
    const durationDays = item.durationDays ?? item.daysLeft;
    const endDate = item.endDate || item.closedAt || null;
    const remaining = Math.max(targetAmount - currentAmount, 0);
    const remainingText = targetAmount ? `${remaining.toLocaleString('vi-VN')} đ` : '—';
    const progressText = targetAmount
      ? `${currentAmount.toLocaleString('vi-VN')} / ${targetAmount.toLocaleString('vi-VN')} đ`
      : currentAmount.toLocaleString('vi-VN');

    return {
      ...item,
      title,
      statusRaw,
      statusLabel,
      statusClass,
      currentAmount,
      targetAmount,
      durationDays,
      endDate,
      remaining,
      remainingText,
      progressText
    };
  })
);

const getDaysRemaining = campaign => {
  const durationValue = Number(campaign.durationDays ?? campaign.daysLeft);
  if (Number.isFinite(durationValue)) return durationValue;

  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    const today = new Date();
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  }

  return null;
};

const totals = computed(() => {
  const total = campaigns.value.length;
  const active = campaigns.value.filter(c => {
    const daysLeft = getDaysRemaining(c);
    if (daysLeft === null) return true;
    return Number(daysLeft) > 0;
  }).length;
  const completed = total - active;
  const donations = campaigns.value.reduce((sum, c) => sum + (c.currentAmount || 0), 0);

  return {
    total,
    active,
    completed,
    donations: donations ? `${donations.toLocaleString('vi-VN')} đ` : '—'
  };
});

const activePercent = computed(() => (totals.value.total ? Math.round((totals.value.active / totals.value.total) * 100) : 0));
const completedPercent = computed(() =>
  totals.value.total ? Math.round((totals.value.completed / totals.value.total) * 100) : 0
);

const recentCampaigns = computed(() => campaigns.value.slice(0, 4));

const fetchData = async () => {
  loading.value = true;
  try {
    await staffStore.fetchCampaigns();
  } catch (err) {
    console.error('Fetch staff campaigns failed', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>


<style scoped lang="scss">
.page {
  padding: 28px;
  background: #f6f8fb;
}

.layout-block {
  display: grid;
  gap: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.eyebrow {
  font-weight: 700;
  color: #2f6b7a;
  letter-spacing: 0.3px;
  margin: 4px 0 0;
}

h1 {
  font-size: 28px;
  color: #123047;
  margin: 0 0 4px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.summary-card {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 30px rgba(12, 100, 120, 0.08);
}

.icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  font-size: 20px;
}

.bubble.primary { background: #e6f5ff; color: #0c6aa7; }
.bubble.success { background: #e7f7ef; color: #1e9c6c; }
.bubble.info { background: #e8f1ff; color: #2e5ea7; }
.bubble.accent { background: #fff2f5; color: #cc3e7b; }

.meta .label { font-weight: 700; color: #1d3557; }
.meta .value { font-size: 22px; font-weight: 800; color: #0c6478; }
.meta .hint { color: #748ea1; }

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  align-items: start;
}

.panel {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 16px 30px rgba(12, 100, 120, 0.08);
  display: grid;
  gap: 14px;
}

.panel.highlight {
  background: linear-gradient(135deg, #0c6478 0%, #1ba4a9 100%);
  color: #fff;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pill {
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(12, 100, 120, 0.08);
  color: #0c6478;
  font-weight: 700;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

.cards-grid.single-column {
  grid-template-columns: 1fr;
}

.skeleton-list { display: grid; gap: 8px; }
.skeleton-row { height: 36px; background: #edf2f5; border-radius: 10px; animation: pulse 1.4s ease infinite; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

.empty { text-align: center; color: #748ea1; display: grid; gap: 6px; padding: 10px 0; }
.empty-icon { font-size: 32px; }

.panel.highlight .stack-row { display: flex; justify-content: space-between; align-items: center; }
.panel.highlight .label { opacity: 0.9; }
.panel.highlight .value { font-weight: 800; font-size: 18px; }
.panel.highlight .progress { width: 100%; height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.18); overflow: hidden; }
.panel.highlight .progress.secondary { background: rgba(255, 255, 255, 0.12); }
.panel.highlight .bar { display: block; height: 100%; background: #fff; opacity: 0.9; }
.panel.highlight .hint { opacity: 0.85; }

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .summary-grid { grid-template-columns: 1fr; }
}
</style>
