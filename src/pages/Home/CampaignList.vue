<template>
  <section class="page">
    <div class="header">
      <div>
        <p class="eyebrow">Tất cả chiến dịch</p>
        <h1 class="title">Khám phá các chiến dịch đang mở</h1>
      </div>
      <span class="hint">Dữ liệu được cập nhật theo thời gian thực</span>
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
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  color: rgba(12, 100, 120, 0.7);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.3px;
  margin-bottom: 6px;
}

.title {
  color: var(--primary-strong);
  font-size: 26px;
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
