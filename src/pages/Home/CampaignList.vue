<template>
  <section class="page">
    <div class="header">
      <div>
        <h1 class="title">Tất cả chiến dịch</h1>
        <p class="eyebrow">Cùng nhau chung tay giúp đỡ những hoàn cảnh khó khăn, lan tỏa yêu thương đến mọi miền đất nước</p>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Tổng cộng:</span>
            <span class="stat-value">{{ campaignStats.total }} Chiến dịch</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Đang diễn ra:</span>
            <span class="stat-value">{{ campaignStats.inProgress }} Chiến dịch</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Đã hoàn thành:</span>
            <span class="stat-value">{{ campaignStats.completed }} Chiến dịch</span>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-left">
            <label class="search-bar">
              <span class="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="6" />
                  <path d="M15.5 15.5 21 21" stroke-linecap="round" />
                </svg>
              </span>
              <input
                type="search"
                v-model="keywordInput"
                placeholder="Tìm kiếm chiến dịch..."
                @keyup.enter="applyKeyword"
              />
            </label>
          </div>

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
      </div>
    </div>

    <div class="grid" v-if="!loading">
      <CampaignCard v-for="item in list" :key="item.code" :campaign="item" />
      <div v-if="!list.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Không có chiến dịch phù hợp với bộ lọc đã chọn</p>
      </div>
    </div>

    <div class="grid" v-else>
      <CampaignCard v-for="n in 6" :key="n" :loading="true" />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onActivated, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CampaignCard from '@/components/campaign/CampaignCard.vue';
import { useCampaignStore } from '@/stores/campaignStore';
import fallbackImage from '@/assets/image/background.png';
import { getCategoryOptions } from '@/utils/category';

const campaignStore = useCampaignStore();
const loading = computed(() => campaignStore.loading);
const campaigns = computed(() => {
  const raw = campaignStore.campaigns;
  const list = Array.isArray(raw) ? raw : raw?.content || [];
  return list.map(item => ({
    ...item,
    code: item.code || item.id || item.slug || item.title,
    title: item.title || item.name || 'Chiến dịch',
    description: item.description || '',
    coverImage: item.coverImage || item.coverImagePath || fallbackImage,
    currentAmount: Number(item.currentAmount ?? item.raised ?? 0),
    targetAmount: Number(item.targetAmount ?? item.goal ?? 0),
    durationDays: item.durationDays ?? item.daysLeft,
    endDate: item.endDate || item.closedAt || null
  }));
});

const getDaysRemaining = campaign => {
  const durationValue = Number(campaign.durationDays);
  if (Number.isFinite(durationValue)) return durationValue;

  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  return null;
};

const list = computed(() => {
  const currentStatus = status.value;
  const currentCategory = (category.value || '').trim();
  const keywordTerm = (keywordInput.value || '').trim().toLowerCase();

  return campaigns.value.filter(c => {
    const days = getDaysRemaining(c);

    if (currentStatus === 'IN_PROGRESS') {
      if (days === null) return true; // keep if no data
      if (days <= 0) return false;
    }

    if (currentStatus === 'COMPLETED') {
      if (days === null || days > 0) return false;
    }

    if (currentCategory) {
      const campaignCategory = (c.category || '').toString().trim();
      if (!campaignCategory || campaignCategory.toLowerCase() !== currentCategory.toLowerCase()) return false;
    }

    if (keywordTerm) {
      const title = (c.title || '').toString().toLowerCase();
      if (!title.includes(keywordTerm)) return false;
    }

    return true;
  });
});

const campaignStats = computed(() => {
  const total = campaigns.value.length;
  const inProgress = campaigns.value.filter(c => {
    const daysLeft = c.durationDays ?? c.daysLeft ?? 0;
    return Number(daysLeft) <= 0;
  }).length;
  const completed = total - inProgress;
  
  return { total, inProgress, completed };
});

const route = useRoute();
const router = useRouter();

const keywordInput = ref((route.query.keyword || '').toString());
const status = computed(() => (route.query.status || '').toString() || undefined);
const category = ref((route.query.category || '').toString());

const statusOptions = [
  { label: 'Tất cả', value: undefined },
  { label: 'Đang diễn ra', value: 'IN_PROGRESS' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' }
];

const categoryOptions = getCategoryOptions();

const fetchParams = computed(() => ({
  keyword: keywordInput.value.trim() || undefined,
  category: category.value || undefined
}));

const updateQuery = updates => {
  const query = {
    keyword: Object.prototype.hasOwnProperty.call(updates, 'keyword') ? updates.keyword : route.query.keyword,
    status: Object.prototype.hasOwnProperty.call(updates, 'status') ? updates.status : route.query.status,
    category: Object.prototype.hasOwnProperty.call(updates, 'category') ? updates.category : route.query.category
  };

  Object.keys(query).forEach(key => {
    if (query[key] === undefined || query[key] === null || query[key] === '') {
      delete query[key];
    }
  });

  router.push({ path: '/campaigns', query });
};

const applyKeyword = () => {
  keywordInput.value = (keywordInput.value || '').trim();
  updateQuery({ keyword: keywordInput.value });
};

const applyStatus = value => {
  updateQuery({ status: value });
};

const applyCategory = () => {
  updateQuery({ category: category.value });
};

const syncFromRoute = () => {
  keywordInput.value = (route.query.keyword || '').toString();
  category.value = (route.query.category || '').toString();
};

const fetchCampaigns = async () => {
  try {
    await campaignStore.fetchAll(fetchParams.value);
  } catch (err) {
    console.error('Fetch campaigns failed', err);
  }
};

onMounted(fetchCampaigns);
onActivated(fetchCampaigns);
watch(
  () => route.query,
  () => {
    syncFromRoute();
    fetchCampaigns();
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
  display: grid;
  gap: 18px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  margin-bottom: 12px;
}

.eyebrow {
  color: rgba(12, 100, 120, 0.7);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.3px;
  margin: 0 0 16px 0;
  max-width: 1200px;
  line-height: 1.5;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid rgba(12, 100, 120, 0.15);
}

.filter-bar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px 16px;
  align-items: center;
  margin-top: 16px;
}

.filter-left {
  width: 100%;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.search-bar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(9, 209, 199, 0.08), rgba(70, 223, 177, 0.08));
  border: 1px solid rgba(12, 100, 120, 0.12);
  box-shadow: 0 6px 18px rgba(12, 100, 120, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  width: 100%;

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: var(--primary-strong);
    font-weight: 500;
    font-size: 14px;
    caret-color: var(--primary);
  }

  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 8px 24px rgba(9, 209, 199, 0.25);
    background: #ffffff;
  }
}

.icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  color: var(--primary-strong);
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
  border: 1px solid rgba(12, 100, 120, 0.12);
  background: #f4fbf8;
  color: var(--primary-strong);
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
  color: var(--primary-strong);
  font-weight: 600;
  min-width: 200px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  color: rgba(12, 100, 120, 0.7);
  font-weight: 600;
  font-size: 14px;
}

.stat-value {
  color: var(--primary-strong);
  font-weight: 800;
  font-size: 15px;
}

.title {
  color: var(--primary-strong);
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
}

.hint {
  color: rgba(12, 100, 120, 0.75);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
  gap: 20px;
}

.empty {
  grid-column: 1 / -1;
  padding: 18px;
  border: 1px dashed rgba(12, 100, 120, 0.25);
  border-radius: 12px;
  text-align: center;
  color: rgba(12, 100, 120, 0.8);
  display: grid;
  gap: 6px;
  place-items: center;
}

.empty-icon {
  font-size: 20px;
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-bar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .filter-right {
    justify-content: flex-start;
  }
}

@media (min-width: 768px) {
  .filter-bar {
    grid-template-columns: minmax(480px, 1.4fr) auto;
    align-items: center;
  }

  .filter-right {
    flex-wrap: nowrap;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
