<template>
  <article class="card-full" :class="{ loading }">
    <div v-if="!hideCover" class="cover" :style="coverStyle">
      <div class="tag" v-if="statusText">{{ statusText }}</div>
    </div>

    <div class="body">
      <header class="heading">
        <div>
          <h3>{{ normalized.title }}</h3>
        </div>
      </header>

      <div class="info-row" v-if="role === 'ADMIN'">
        <span class="chip">{{ startEndRange }}</span>
        <span class="chip" v-if="normalized.category">Danh mục: {{ categoryLabel || normalized.category }}</span>
        <span class="chip" v-if="staffDisplay">Phụ trách: {{ staffDisplay }}</span>
        <span class="chip" :class="statusClass" v-if="statusLabel">Trạng thái: {{ statusLabel }}</span>
      </div>


      <p class="desc" v-else>{{ normalized.description || 'Không có mô tả' }}</p>

      <div class="metrics compact" v-if="role === 'ADMIN'">
        <div class="metric">
          <p class="value">{{ progress }}%</p>
        </div>
      </div>

      <div class="metrics" v-else>
        <div class="metric">
          <p class="label">Mục tiêu</p>
          <p class="value">{{ formatCurrency(normalized.targetAmount) }} VND</p>
        </div>
        <div class="metric">
          <p class="label">Đã góp</p>
          <p class="value">{{ formatCurrency(normalized.currentAmount) }} VND</p>
        </div>
        <div class="metric">
          <p class="label">Tiến độ</p>
          <p class="value">{{ progress }}</p>
        </div>
      </div>

      <div class="progress-foot" v-if="role === 'ADMIN'">
        <span class="value">{{ formatCurrency(normalized.currentAmount) }} / {{ formatCurrency(normalized.targetAmount) }} VND</span>
      </div>
      <div class="progress-foot" v-else>
        <span class="value">{{ formatCurrency(normalized.currentAmount) }} / {{ formatCurrency(normalized.targetAmount) }} VND</span>
        <span class="sub" v-if="normalized.totalDonations !== null">{{ normalized.totalDonations }} lượt ủng hộ</span>
      </div>

      <footer class="actions" v-if="role === 'ADMIN'">
        <button class="btn ghost" @click="goDetail">Chi tiết</button>
        <button class="btn" :disabled="isEditDisabled" @click="goEdit">Chỉnh sửa</button>
        <button class="btn ghost" @click="emit('pause', normalized)">Tạm dừng</button>
        <button class="btn ghost" @click="emit('finish', normalized)">Kết thúc</button>
        <button class="btn" @click="goAssign">Phân công</button>
        <button class="btn ghost" @click="goAnalytics">Thống kê</button>
      </footer>

      <footer class="actions" v-else>
        <button class="btn ghost" @click="goDetail">Chi tiết</button>
        <button class="btn" @click="goEdit">Chỉnh sửa</button>
        <button class="btn" @click="goUpdate">Cập nhật</button>
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
  role: { type: String, required: true },
  loading: { type: Boolean, default: false },
  hideCover: { type: Boolean, default: false }
});

const emit = defineEmits(['pause', 'finish']);

const normalized = computed(() => {
  const data = props.campaign || {};
  const targetAmount = Number(data.targetAmount ?? data.goal ?? 0);
  const currentAmount = Number(data.currentAmount ?? data.raised ?? 0);
  return {
    ...data,
    title: data.title || data.name || 'Chiến dịch',
    description: data.description || data.story || '',
    status: (data.status || 'IN_PROGRESS'),
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

// Hiển thị trạng thái cho user: lấy trực tiếp từ status, không dựa vào ngày
const statusText = computed(() => {
  if (props.role === 'ADMIN') return null;
  const s = normalized.value.status?.toUpperCase();
  if (s === 'COMPLETED') return 'Hoàn thành';
  if (s === 'IN_PROGRESS') return 'Đang diễn ra';
  if (s === 'PENDING') return 'Chưa bắt đầu';
  if (s === 'ON_HOLD') return 'Tạm dừng';
  if (s === 'CANCELLED') return 'Hủy';
  return '';
});

const statusMap = {
  PENDING: { label: 'Chưa bắt đầu', color: '#f7b500' },
  IN_PROGRESS: { label: 'Đang diễn ra', color: '#1a7f37' },
  ON_HOLD: { label: 'Tạm dừng', color: '#f7b500' },
  COMPLETED: { label: 'Đã hoàn thành', color: '#e53935' },
  CANCELLED: { label: 'Hủy', color: '#8e24aa' }
};
const statusLabel = computed(() => {
  const s = normalized.value.status?.toUpperCase();
  return statusMap[s]?.label || s || '';
});
const statusClass = computed(() => {
  const s = normalized.value.status?.toUpperCase();
  const color = statusMap[s]?.color;
  return color ? { 'status-chip': true, [`status-${s}`]: true } : '';
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
  router.push(`/admin/campaigns/${code}`);
};

const isEditDisabled = computed(() => {
  const s = normalized.value.status?.toUpperCase();
  return s === 'COMPLETED' || s === 'CANCELLED';
});
const goEdit = () => {
  const code = normalized.value.campaignCode;
  if (!code || isEditDisabled.value) return;
  if (props.role === 'ADMIN') router.push(`/admin/CampaignsEdit/${code}`);
  else router.push(`/staff/campaigns/${code}/edit`);
};

const goUpdate = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  if (props.role === 'ADMIN') router.push(`/admin/campaigns/${code}/edit`);
  else router.push(`/staff/campaigns/${code}/update`);
};

const goAnalytics = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  if (props.role === 'ADMIN') router.push({ path: '/admin/analytics', query: { campaign: code } });
  else router.push({ path: '/staff/reports', query: { campaign: code } });
};

const goAssign = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  router.push({ path: '/admin/assign', query: { campaign: code } });
};

const formatCurrency = value => (value || 0).toLocaleString('vi-VN');
</script>

<style scoped lang="scss">
.status-chip {
  font-weight: 700;
}
.status-PENDING, .status-ON_HOLD {
  color: #f7b500 !important;
}
.status-IN_PROGRESS {
  color: #1a7f37 !important;
}
.status-COMPLETED {
  color: #e53935 !important;
}
.status-CANCELLED {
  color: #8e24aa !important;
}
.card-full {
  display: grid;
  grid-template-columns: 320px 1fr;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #09d1c7;
  box-shadow: 0 14px 30px rgba(12, 100, 120, 0.08);
}

.cover {
  position: relative;
  min-height: 220px;
  height: 100%;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ffffff;
  color: var(--primary-strong);
  font-weight: 700;
  text-transform: capitalize;
}

.tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #0b6c7f;
  font-weight: 700;
  font-size: 12px;
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

.heading .eyebrow {
  color: #5c738a;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin: 0;
}

.staff {
  margin: 0;
  color: #0b6c7f;
  font-weight: 600;
  font-size: 13px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.desc {
  margin: 0;
  color: #35516d;
  line-height: 1.45;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.metrics.compact {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.metric {
  background: rgba(9, 209, 199, 0.06);
  border: 1px solid rgba(9, 209, 199, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
}

.metric .label {
  font-size: 12px;
  color: #6b7a8d;
  margin: 0;
}

.metric .value {
  margin: 0;
  font-weight: 800;
  color: #0b6c7f;
}

.progress {
  position: relative;
  height: 10px;
  background: rgba(9, 209, 199, 0.12);
  border-radius: 999px;
  overflow: hidden;
}

.bar {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  border-radius: 999px;
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
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  align-items: stretch;
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
  .card-full {
    grid-template-columns: 1fr;
  }

  .cover {
    height: 220px;
  }
}
</style>
