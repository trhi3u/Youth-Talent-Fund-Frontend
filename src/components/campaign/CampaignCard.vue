<template>
  <article class="campaign-card card" :class="{ loading }">
    <div class="cover" :style="coverStyle">
      <div class="badge" v-if="normalized.category">{{ categoryLabel || normalized.category }}</div>
      <div class="tag" v-if="campaignStatus">{{ campaignStatus }}</div>
    </div>
    <div class="content">
      <h3 class="title" v-if="!loading">{{ normalized.title }}</h3>
      <div class="skeleton title" v-else />

      <p class="desc" v-if="!loading">{{ normalized.description }}</p>
      <div class="skeleton" v-else />

      <div class="meta" v-if="!loading">
        <div class="meta-item">
          <span class="label">Mục tiêu</span>
          <span class="value">{{ formatCurrency(normalized.currentAmount) }}/{{ formatCurrency(normalized.targetAmount) }} VND</span>
        </div>
      </div>

      <div class="progress" v-if="!loading">
        <div class="bar" :style="{ width: progress + '%' }" />
      </div>
      <div class="progress-foot" v-if="!loading">
        <span class="progress-text">{{ progress }}%</span>
        <span class="sub" v-if="normalized.totalDonations !== null">{{ normalized.totalDonations }} lượt ủng hộ</span>
        <span class="sub" v-else>Kết thúc: {{ endDateText }}</span>
      </div>

      <div class="actions" v-if="!loading">
        <button class="btn primary" @click="goDetail">Chi tiết</button>
        <button class="btn ghost" :disabled="isCompleted" @click="goDonate">{{ isCompleted ? 'Hoàn thành' : 'Ủng hộ' }}</button>
      </div>

      <slot name="actions" v-if="!loading" />
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import fallbackImage from '@/assets/image/background.png';
import { getCategoryLabel } from '@/utils/category';

const props = defineProps({
  campaign: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
});

const normalized = computed(() => {
  const data = props.campaign || {};
  const targetAmount = Number(data.targetAmount ?? data.goal ?? 0);
  const currentAmount = Number(data.currentAmount ?? data.raised ?? 0);
  return {
    ...data,
    title: data.title || data.name || 'Chiến dịch',
    description: data.description || data.story || '',
    status: data.status || 'PENDING',
    category: data.category || data.categoryName || data.topic || '',
    campaignCode: data.campaignCode || data.code || data.id,
    targetAmount,
    currentAmount,
    totalDonations: data.totalDonations ?? data.totalDoantions ?? null,
    coverImage: data.coverImage || data.coverImagePath || fallbackImage,
    endDate: data.endDate || data.closedAt || null
  };
});

const categoryLabel = computed(() => getCategoryLabel(normalized.value.category));

const progress = computed(() => {
  const goal = normalized.value.targetAmount;
  const raised = normalized.value.currentAmount;
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
});

const router = useRouter();
const goDetail = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  router.push(`/campaign/${code}`);
};

const goDonate = () => {
  const code = normalized.value.campaignCode;
  if (!code) return;
  router.push(`/campaign/${code}?mode=donation`);
};

const daysLeft = computed(() => {
  if (!normalized.value.endDate) return null;
  const end = new Date(normalized.value.endDate);
  const today = new Date();
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
});

const campaignStatus = computed(() => {
  const daysRemaining = daysLeft.value;
  if (daysRemaining === null) return null;
  if (normalized.value.status === 'CANCELLED') return 'Đã hủy';
  return daysRemaining <= 0 ? 'Hoàn thành' : `${daysRemaining} ngày còn lại`;
});

const isCompleted = computed(() => {
  const daysRemaining = daysLeft.value;
  return daysRemaining !== null && daysRemaining <= 0;
});

const endDateText = computed(() => {
  if (!normalized.value.endDate) return 'Đang cập nhật';
  return new Date(normalized.value.endDate).toLocaleDateString('vi-VN');
});

const coverStyle = computed(() => ({
  background: `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 100%), url(${normalized.value.coverImage}) center/cover no-repeat`
}));

const formatCurrency = value => (value || 0).toLocaleString('vi-VN');
</script>

<style scoped lang="scss">
.campaign-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(12, 100, 120, 0.12);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.cover {
  position: relative;
  height: 180px;
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

.content {
  padding: 16px;
  display: grid;
  gap: 8px;
}

.title {
  font-size: 18px;
  color: var(--primary-strong);
}

.desc {
  color: #35516d;
  font-size: 14px;
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  color: #35516d;
  font-size: 14px;
}

.meta-item {
  background: rgba(33, 240, 230, 0.06);
  border: 1px solid rgba(35, 243, 232, 0.12);
  border-radius: 10px;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
  text-align: right;
}

.label {
  font-size: 12px;
  color: #6b7a8d;
}

.value {
  font-weight: 700;
  color: #0b6c7f;
}

.progress {
  position: relative;
  height: 10px;
  background: rgba(9, 209, 199, 0.12);
  border-radius: 999px;
}

.bar {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  border-radius: 999px;
}

.progress-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #35516d;
  font-size: 13px;
}

.progress-text {
  margin-top: 4px;
  font-size: 12px;
  color: #35516d;
}

.sub {
  color: #6b7a8d;
}

.skeleton {
  width: 100%;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(9, 209, 199, 0.1) 0%, rgba(70, 223, 177, 0.15) 100%);
  animation: pulse 1.2s ease-in-out infinite;
}

.skeleton.title {
  height: 22px;
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 6px;
}

.btn {
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.12s ease, box-shadow 0.15s ease;
}

.btn:hover { transform: translateY(-1px); }

.btn.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border-color: rgba(9, 209, 199, 0.35);
}

.btn.ghost {
  background: #f2fbf8;
  color: var(--primary-strong);
  border-color: rgba(12, 100, 120, 0.18);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
