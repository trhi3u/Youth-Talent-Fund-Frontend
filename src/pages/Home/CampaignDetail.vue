<template>
  <section class="page">
    <div class="card detail">
      <div class="cover" :style="coverStyle">
        <div class="badge" v-if="campaign?.status">{{ campaign.status }}</div>
      </div>
      <div class="info">
        <div class="skeleton title" v-if="loading" />
        <h1 v-else>{{ campaign?.title || 'Đang tải...' }}</h1>

        <div class="skeleton" v-if="loading" />
        <p class="desc" v-else>{{ campaign?.description || 'Chiến dịch đang được cập nhật.' }}</p>

        <div class="meta" v-if="!loading && hasCampaign">
          <span v-if="campaign?.goal">Mục tiêu: {{ formatCurrency(campaign.goal) }}đ</span>
          <span>Đã góp: {{ formatCurrency(campaign?.raised) }}đ</span>
          <span v-if="campaign?.status">Trạng thái: {{ campaign.status }}</span>
        </div>

        <div class="skeleton" v-else-if="loading" />
        <div v-else class="empty-inline">
          <p>Không tìm thấy chiến dịch.</p>
          <RouterLink class="btn ghost" to="/campaigns">Quay lại danh sách</RouterLink>
        </div>

        <RouterLink v-if="hasCampaign" class="btn primary" :to="`/donate/${campaign.id}`">Quyên góp</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onActivated, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useCampaignStore } from '@/stores/campaignStore';
import fallbackImage from '@/assets/image/background.png';

const route = useRoute();
const campaignStore = useCampaignStore();

const campaign = computed(() => campaignStore.current);
const loading = computed(() => campaignStore.loading);
const hasCampaign = computed(() => Boolean(campaign.value?.id));

const coverStyle = computed(() => ({
  background: campaign.value?.coverImage
    ? `url(${campaign.value.coverImage}) center/cover no-repeat`
    : `url(${fallbackImage}) center/cover no-repeat`
}));

const formatCurrency = value => (Number(value) || 0).toLocaleString('vi-VN');

const fetchCurrent = async () => {
  const id = route.params.id;
  if (id) {
    try {
      await campaignStore.fetchOne(id);
    } catch (err) {
      console.error('Fetch campaign detail failed', err);
    }
  }
};

onMounted(fetchCurrent);
onActivated(fetchCurrent);

watch(
  () => route.params.id,
  () => fetchCurrent()
);
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
  display: grid;
  gap: 16px;
}

.detail {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
  padding: 24px;
  align-items: stretch;
}

.cover {
  border-radius: 16px;
  background: linear-gradient(180deg, #09d1c7 0%, #46dfb1 100%);
  min-height: 260px;
  position: relative;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-strong);
  font-weight: 700;
}

.info h1 {
  color: var(--primary-strong);
  font-size: 28px;
}

.desc {
  color: #35516d;
  margin: 10px 0 4px;
}

.meta {
  margin: 12px 0;
  display: grid;
  gap: 6px;
  color: #35516d;
}

.btn {
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--primary);
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  font-weight: 600;
  width: fit-content;
}

.empty {
  padding: 20px;
  text-align: center;
  display: grid;
  gap: 10px;
  color: rgba(12, 100, 120, 0.85);
}

.empty-inline {
  display: grid;
  gap: 8px;
  color: rgba(12, 100, 120, 0.9);
}

.skeleton {
  width: 100%;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(9, 209, 199, 0.1) 0%, rgba(70, 223, 177, 0.15) 100%);
  animation: pulse 1.2s ease-in-out infinite;
}

.skeleton.title {
  height: 28px;
  width: 70%;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@media (max-width: 860px) {
  .detail {
    grid-template-columns: 1fr;
  }
}
</style>
