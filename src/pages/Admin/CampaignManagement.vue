<template>
  <section class="page">
    <div class="header">
      <div>
        <h1>Quản lý chiến dịch</h1>
      </div>
      <RouterLink class="btn primary" to="/admin/campaigns/create">Tạo chiến dịch</RouterLink>
    </div>

    <div class="filters">
      <label class="search-bar">
        <span class="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="6" />
            <path d="M15.5 15.5 21 21" stroke-linecap="round" />
          </svg>
        </span>
        <input
          type="search"
          v-model="keyword"
          placeholder="Tìm kiếm chiến dịch..."
        />
      </label>

      <div class="filter-right">
        <div class="status-group">
          <button
            v-for="item in statusOptions"
            :key="item.value || 'all'"
            type="button"
            :class="['status-btn', { active: item.value === status } ]"
            @click="applyStatus(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <select class="category-select" v-model="category" @change="applyCategory">
          <option value="">Tất cả danh mục</option>
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="grid">
      <CampaignCardFull v-for="n in 4" :key="n" :loading="true" role="ADMIN" />
    </div>

    <div v-else class="grid">
      <CampaignCardFull
        v-for="item in filteredCampaigns"
        :key="item.campaignCode || item.id"
        :campaign="item"
        role="ADMIN"
        @assign="openAssignModal(item)"
      />

      <div v-if="!filteredCampaigns.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Không có chiến dịch phù hợp</p>
      </div>
    </div>

    <AssignCampaignToStaff
      v-if="showAssignModal"
      :selected-campaign="assignCampaign"
      @close="showAssignModal = false"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useCampaignStore } from '@/stores/campaignStore';
import CampaignCardFull from '@/components/campaign/CampaignCardFull.vue';
import AssignCampaignToStaff from '@/pages/Admin/AssignCampaignToStaff.vue';
import { getCategoryOptions } from '@/utils/category';
const showAssignModal = ref(false);
const assignCampaign = ref(null);

function openAssignModal(campaign) {
  assignCampaign.value = campaign;
  showAssignModal.value = true;
}

const campaignStore = useCampaignStore();
const loading = computed(() => campaignStore.loading);

const statusOptions = [
  { label: 'Tất cả', value: undefined },
  { label: 'Đang diễn ra', value: 'IN_PROGRESS' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' }
];

const categoryOptions = getCategoryOptions();

const keyword = ref('');
const status = ref();
const category = ref('');

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

const campaigns = computed(() => {
  const raw = Array.isArray(campaignStore.campaigns) ? campaignStore.campaigns : campaignStore.campaigns?.content || [];
  return raw.map(item => ({
    ...item,
    campaignCode: item.campaignCode || item.code || item.id,
    title: item.title || item.name || 'Chiến dịch',
    description: item.description || item.story || '',
    currentAmount: Number(item.currentAmount ?? item.raised ?? 0),
    targetAmount: Number(item.targetAmount ?? item.goal ?? 0),
    durationDays: item.durationDays ?? item.daysLeft,
    endDate: item.endDate || item.closedAt || null,
    category: item.category || item.categoryName || item.topic || ''
  }));
});

const filteredCampaigns = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  const stat = status.value;
  const cat = (category.value || '').trim().toLowerCase();

  return campaigns.value.filter(c => {
    const days = getDaysRemaining(c);

    if (stat === 'IN_PROGRESS') {
      if (days !== null && days <= 0) return false;
    }

    if (stat === 'COMPLETED') {
      if (days === null || days > 0) return false;
    }

    if (cat) {
      const campaignCategory = (c.category || '').toString().toLowerCase();
      if (!campaignCategory || campaignCategory !== cat) return false;
    }

    if (key) {
      const title = (c.title || '').toString().toLowerCase();
      if (!title.includes(key)) return false;
    }

    return true;
  });
});

const applyStatus = value => {
  status.value = value;
};

const applyCategory = () => {
  category.value = category.value || '';
};

onMounted(() => {
  campaignStore.fetchAll();
});
</script>

<style scoped lang="scss">
.page {
  padding: 28px;
  background: #f6f8fb;
  display: grid;
  gap: 18px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

h1 { margin: 0; }
.hint { margin: 4px 0 0; color: #5d7588; }

.filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(12, 100, 120, 0.12);
  box-shadow: 0 6px 18px rgba(12, 100, 120, 0.08);
  width: 100%;
}

.search-bar input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  color: #0b6c7f;
  font-weight: 500;
  font-size: 14px;
}

.icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  color: #0b6c7f;
  opacity: 0.8;
}

.status-group {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.18);
  background: #f4fbf8;
  color: #0b6c7f;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn.active {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(9, 209, 199, 0.35);
}

.status-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.category-select {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.18);
  background: #ffffff;
  color: #0b6c7f;
  font-weight: 600;
  min-width: 200px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.empty {
  padding: 18px;
  border: 1px dashed rgba(12, 100, 120, 0.25);
  border-radius: 12px;
  text-align: center;
  color: rgba(12, 100, 120, 0.8);
  display: grid;
  gap: 6px;
  place-items: center;
}

.empty-icon { font-size: 20px; }

.btn {
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(12, 100, 120, 0.18);
  background: #f2fbf8;
  color: #0b6c7f;
}

.btn.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border-color: rgba(9, 209, 199, 0.35);
}

@media (min-width: 768px) {
  .filters {
    grid-template-columns: minmax(420px, 1.3fr) auto;
  }
}

@media (max-width: 640px) {
  .filter-right { justify-content: flex-start; }
}
</style>
