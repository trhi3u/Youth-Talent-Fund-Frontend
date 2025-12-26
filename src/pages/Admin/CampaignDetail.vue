<template>
  <section class="admin-campaign-detail" v-if="campaign">
    <div class="main-header">
      <div class="cover-col">
        <img v-if="campaign.coverImage" :src="campaign.coverImage" class="cover-img" alt="cover" />
        <div v-else class="cover-img no-img">Không có ảnh</div>
      </div>
      <div class="main-info">
        <h1 class="title">{{ campaign.title }}</h1>
        <div class="meta-row">
          <span class="label">Danh mục:</span>
          <span class="category">{{ categoryLabel }}</span>
        </div>
        <div class="row">
          <span class="label">Trạng thái:</span>
          <span class="value status status-label" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <div class="row">
          <span class="label">Phụ trách:</span>
          <span class="value">{{ campaign.staffName || 'Chưa phân công' }}<span v-if="campaign.staffEmail"> ({{ campaign.staffEmail }})</span></span>
        </div>
        <div class="row">
          <span class="label">Thời gian:</span>
          <span class="value">{{ formatDate(campaign.startDate) }} - {{ formatDate(campaign.endDate) }}</span>
        </div>
        <div class="row">
          <span class="label">Địa điểm:</span>
          <span class="value">{{ campaign.location || '---' }}</span>
        </div>
      </div>
    </div>

    <div class="stats-block">
      <div class="stat">
        <div class="label">Mục tiêu</div>
        <div class="value">{{ formatCurrency(campaign.targetAmount) }} VND</div>
      </div>
      <div class="stat">
        <div class="label">Đã quyên góp</div>
        <div class="value">{{ formatCurrency(campaign.currentAmount) }} VND</div>
      </div>
      <div class="stat">
        <div class="label">% hoàn thành</div>
        <div class="value">{{ percent }}%</div>
      </div>
      <div class="stat">
        <div class="label">Lượt quyên góp</div>
        <div class="value">{{ campaign.totalDonations ?? '---' }}</div>
      </div>
      <div class="stat" v-if="campaign.participantCount">
        <div class="label">Người tham gia</div>
        <div class="value">{{ campaign.participantCount }}</div>
      </div>
    </div>

    <div class="desc-block">
      <div class="desc-section">
        <h2>Mô tả ngắn</h2>
        <div class="desc">{{ campaign.description || '---' }}</div>
      </div>
      <div class="desc-section">
        <h2>Câu chuyện chi tiết</h2>
        <div class="story">{{ campaign.story || '---' }}</div>
      </div>
    </div>

    <div class="actions-block">
      <button class="btn primary" @click="goEdit">Chỉnh sửa</button>
      <button class="btn ghost" " @click="openAssign = true">Phân công nhân viên</button>
      <button class="btn ghost" @click="goReport">Xem báo cáo</button>
      <button class="btn danger" v-if="canHideOrFinish" @click="hideOrFinish">{{ hideOrFinishLabel }}</button>
    </div>

    <AssignStaff v-if="openAssign" :campaignCode="campaign.campaignCode" @close="openAssign = false" @assigned="onAssigned" />
  </section>
  <div v-else class="loading">Đang tải...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCategoryLabel } from '@/utils/category';
import { useAuthStore } from '@/stores/authStore';

import { getCampaignDetail } from '@/api/public.api';

const route = useRoute();
const router = useRouter();
const campaignCode = route.params.campaignCode;
const campaign = ref(null);
const openAssign = ref(false);


const fetchDetail = async () => {
  const res = await getCampaignDetail(campaignCode);
  campaign.value = res;
};

onMounted(fetchDetail);

const categoryLabel = computed(() => getCategoryLabel(campaign.value?.category));
const formatDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '---';
const formatCurrency = v => v ? v.toLocaleString('vi-VN') : '0';
const percent = computed(() => {
  if (!campaign.value) return 0;
  const { currentAmount, targetAmount } = campaign.value;
  if (!targetAmount) return 0;
  return Math.round((currentAmount / targetAmount) * 100);
});

const statusMap = {
  PENDING: { label: 'Chưa bắt đầu', class: 'pending' },
  IN_PROGRESS: { label: 'Đang diễn ra', class: 'inprogress' },
  ON_HOLD: { label: 'Tạm dừng', class: 'onhold' },
  COMPLETED: { label: 'Đã hoàn thành', class: 'completed' },
  CANCELLED: { label: 'Hủy', class: 'cancelled' }
};
const statusLabel = computed(() => {
  const s = campaign.value?.status?.toUpperCase();
  return statusMap[s]?.label || s || '';
});
const statusClass = computed(() => {
  const s = campaign.value?.status?.toUpperCase();
  return statusMap[s]?.class || '';
});

const goEdit = () => router.push(`/admin/campaigns/${campaign.value.campaignCode}/edit`);
const goReport = () => router.push(`/admin/campaigns/${campaign.value.campaignCode}/report`);
const hideOrFinish = () => {
 
};
const hideOrFinishLabel = computed(() => {
  if (!campaign.value) return '';
  if (campaign.value.status === 'IN_PROGRESS') return 'Kết thúc chiến dịch';
  if (campaign.value.status === 'PENDING') return 'Ẩn chiến dịch';
  return '';
});
const canHideOrFinish = computed(() => {
  if (!campaign.value) return false;
  return ['IN_PROGRESS', 'PENDING'].includes(campaign.value.status);
});
const onAssigned = () => {
  openAssign.value = false;
  fetchDetail();
};
</script>

<style scoped lang="scss">
.admin-campaign-detail {
  max-width: 980px;
  margin: 0 auto;
  padding: 36px 0 48px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}
.main-header {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
}
.cover-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.cover-img {
  width: 220px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  background: #f3f7f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #888;
}
.cover-img.no-img {
  background: #f3f7f9;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-badge {
  margin-top: 8px;
  padding: 6px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(12,100,120,0.06);
  &.pending { color: #f7b500; border: 1.5px solid #f7b500; }
  &.inprogress { color: #1a7f37; border: 1.5px solid #1a7f37; }
  &.onhold { color: #f7b500; border: 1.5px solid #f7b500; }
  &.completed { color: #e53935; border: 1.5px solid #e53935; }
  &.cancelled { color: #8e24aa; border: 1.5px solid #8e24aa; }
}
.main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.title {
  font-size: 2rem;
  font-weight: 800;
  color: #123047;
  margin-bottom: 2px;
}
.meta-row {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 15px;
  color: #15919B;
  margin-bottom: 2px;
}
.row {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  color: #35516d;
}
.row .label {
  font-weight: 600;
  color: #5c738a;
}
.status-label.pending { color: #f7b500 !important; }
.status-label.inprogress { color: #1a7f37 !important; }
.status-label.onhold { color: #f7b500 !important; }
.status-label.completed { color: #e53935 !important; }
.status-label.cancelled { color: #8e24aa !important; }
.row .value.status {
  font-weight: 700;
}
.stats-block {
  display: flex;
  gap: 32px;
  background: #fff;
  border-radius: 12px;
  padding: 18px 24px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
  justify-content: flex-start;
}
.stat {
  min-width: 120px;
  text-align: center;
}
.stat .label {
  color: #888;
  font-size: 14px;
}
.stat .value {
  font-size: 18px;
  font-weight: 700;
  color: #123047;
}
.desc-block {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(12,100,120,0.04);
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
}
.desc-section {
  flex: 1 1 320px;
  min-width: 320px;
}
.desc-block h2 {
  margin: 12px 0 4px;
  font-size: 17px;
  color: #15919B;
}
.desc, .story {
  color: #35516d;
  font-size: 15px;
  margin-bottom: 8px;
  white-space: pre-line;
}
.actions-block {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  border: 1px solid #09d1c7;
  background: #f2fbf8;
  color: #15919B;
  cursor: pointer;
  transition: background 0.15s;
}
.btn.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border: none;
}
.btn.ghost {
  background: transparent;
  color: #15919B;
  border: 1px solid #09d1c7;
}
.btn.danger {
  background: #fff0f0;
  color: #e53935;
  border: 1px solid #e53935;
}
.loading {
  text-align: center;
  color: #15919B;
  font-size: 18px;
  padding: 32px 0;
}
</style>
