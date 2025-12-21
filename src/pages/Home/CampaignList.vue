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
      </div>
    </div>

    <div class="grid" v-if="!loading">
      <CampaignCard v-for="item in list" :key="item.code" :campaign="item" />
      <div v-if="!list.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Hiện chưa có chiến dịch để hiển thị</p>
      </div>
    </div>

    <div class="grid" v-else>
      <CampaignCard v-for="n in 6" :key="n" :loading="true" />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onActivated, watch } from 'vue';
import { useRoute } from 'vue-router';
import CampaignCard from '@/components/campaign/CampaignCard.vue';
import { useCampaignStore } from '@/stores/campaignStore';
import fallbackImage from '@/assets/image/background.png';

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
    targetAmount: Number(item.targetAmount ?? item.goal ?? 0)
  }));
});

const list = computed(() => campaigns.value);

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

const ensureData = async () => {
  if (!campaigns.value.length && !loading.value) {
    try {
      await campaignStore.fetchAll();
    } catch (err) {
      console.error('Fetch campaigns failed', err);
    }
  }
};

onMounted(ensureData);
onActivated(ensureData);
watch(
  () => route.fullPath,
  () => ensureData()
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
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
}
</style>
