<template>
  <article class="card-full dashboard" :class="{ loading }">
    <div class="body">
      <header class="heading">
        <h3>{{ normalized.title }}</h3>
      </header>
      <div class="info-row">
        <span class="chip">{{ startEndRange }}</span>
        <span class="chip" v-if="normalized.category">Danh mục: {{ categoryLabel || normalized.category }}</span>
        <span class="chip" v-if="staffDisplay">Phụ trách: {{ staffDisplay }}</span>
      </div>
      <div class="progress-bar">
        <div class="bar" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-foot">
        <span class="value">{{ formatCurrency(normalized.currentAmount) }} / {{ formatCurrency(normalized.targetAmount) }} VND</span>
      </div>
      <footer class="actions">
        <button class="btn ghost" @click="goDetail">Chi tiết</button>
        <button class="btn" @click="goEdit">Chỉnh sửa</button>
        <button class="btn ghost" @click="$emit('pause', normalized)">Tạm dừng</button>
        <button class="btn ghost" @click="$emit('finish', normalized)">Kết thúc</button>
        <button class="btn" @click="goAssign">Phân công</button>
        <button class="btn ghost" @click="goAnalytics">Thống kê</button>
      </footer>
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import fallbackImage from '@/assets/image/background.png';
import { getCategoryLabel } from '@/utils/category';
import { getCampaignDetail } from '@/api/public.api';

const props = defineProps({
  campaign: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  hideCover: { type: Boolean, default: false }
});

const normalized = computed(() => {
  const data = props.campaign || {};
  const targetAmount = Number(data.targetAmount ?? data.goal ?? 0);
  const currentAmount = Number(data.currentAmount ?? data.raised ?? 0);
  return {
    ...data,
    title: data.title || data.name || 'Chiến dịch',
    description: data.description || data.story || '',
    status: (data.status || 'PENDING').toString().toUpperCase(),
    category: data.category || data.categoryName || data.topic || '',
    campaignCode: data.campaignCode || data.code || data.id,
    targetAmount,
    currentAmount,
    totalDonations: data.totalDonations ?? data.totalDoantions ?? null,
    coverImage: data.coverImage || data.coverImagePath || fallbackImage,
    startDate: data.startDate || data.beginDate || data.createdAt || null,
    endDate: data.endDate || data.closedAt || null,
    staffName: data.staffName || data.staffname || data.assignee || ''
  };
});

const categoryLabel = computed(() => getCategoryLabel(normalized.value.category));

const progress = computed(() => {
  const goal = normalized.value.targetAmount;
  const raised = normalized.value.currentAmount;
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
});

const daysLeft = computed(() => {
  if (!normalized.value.endDate) return null;
  const end = new Date(normalized.value.endDate);
  const today = new Date();
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
});

const statusText = computed(() => {
  const days = daysLeft.value;
  if (days === null) return null;
  if (days <= 0) return 'Hoàn thành';
  return `${days} ngày còn lại`;
});

const startDateText = computed(() => {
  if (!normalized.value.startDate) return 'Đang cập nhật';
  return new Date(normalized.value.startDate).toLocaleDateString('vi-VN');
});

const endDateText = computed(() => {
  if (!normalized.value.endDate) return 'Đang cập nhật';
  return new Date(normalized.value.endDate).toLocaleDateString('vi-VN');
});

const startEndRange = computed(() => `${startDateText.value} - ${endDateText.value}`);

const coverStyle = computed(() => ({
  background: `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 100%), url(${normalized.value.coverImage}) center/cover no-repeat`
}));

const staffDisplay = ref('');

const fetchDetailStaff = async () => {
  if (normalized.value.staffName) {
    staffDisplay.value = normalized.value.staffName;
    return;
  }
  const id = normalized.value.campaignCode;
  if (!id) return;
  try {
    const detail = await getCampaignDetail(id);
    staffDisplay.value = detail?.staffName || detail?.staffname || detail?.assignee || '';
  } catch (err) {
    console.error('Fetch campaign detail failed', err);
  }
};

onMounted(fetchDetailStaff);

const router = useRouter();

const goDetail = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  router.push(`/campaign/${code}`);
};

const goEdit = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  router.push(`/admin/campaigns/${code}/edit`);
};

const goAnalytics = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  router.push({ path: '/admin/analytics', query: { campaign: code } });
};

const goAssign = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  router.push({ path: '/admin/assign', query: { campaign: code } });
};

const formatCurrency = value => (value || 0).toLocaleString('vi-VN');
</script>

<style scoped lang="scss">
.card-full.dashboard {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #09d1c7;
  box-shadow: 0 14px 30px rgba(12, 100, 120, 0.08);
  padding: 0;
}
.body {
  display: grid;
  gap: 12px;
  padding: 16px;
}
.heading h3 {
  margin: 4px 0 2px;
  color: #123047;
  font-size: 18px;
}
.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f8ff;
  color: #0b6c7f;
  font-weight: 700;
  font-size: 12px;
  border: 1px solid rgba(12, 100, 120, 0.12);
}
.progress-bar {
  width: 100%;
  height: 10px;
  background: rgba(9, 209, 199, 0.12);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 4px;
}
.progress-bar .bar {
  height: 100%;
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  border-radius: 999px;
  transition: width 0.3s;
}
.progress-foot {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: #35516d;
  font-size: 13px;
  text-align: right;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
  justify-content: flex-start; /* Sang trái */
  /* Muốn căn giữa thì dùng: justify-content: center; */
}
.btn {
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(12, 100, 120, 0.18);
  transition: transform 0.12s ease, box-shadow 0.15s ease;
  background: #f2fbf8;
  color: var(--primary-strong);
  white-space: nowrap;
  min-width: 100px;
}
.btn.ghost {
  background: #f2fbf8;
  color: var(--primary-strong);
  border-color: rgba(12, 100, 120, 0.18);
}
.btn:hover { transform: translateY(-1px); }
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
@media (max-width: 900px) {
  .card-full.dashboard {
    padding: 0;
  }
}
</style>
