<template>
  <section class="home">
    <div class="hero" :style="heroStyle">
      <div class="hero-overlay" />
      <div class="hero-content">
        <div class="hero-copy">
          <h1>Đồng hành cùng tài năng trẻ </h1>
          <h1>Việt Nam</h1>
          <p class="subtitle">Mỗi đóng góp của bạn là một bước tiến quan trọng giúp các tài năng trẻ hiện thực hóa ước mơ và tạo nên tương lai tươi sáng.</p>
        </div>
      </div>
    </div>
    <div class="stat-row">
      <div v-for="item in stats" :key="item.label" class="stat-item">
        <div class="stat-icon" />
        <div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
    <section class="section campaigns">
      
      <div class="campaign-surface">
        <p class="eyebrow">Các chiến dịch nổi bật</p>
          <h2>Cùng tham gia ủng hộ các chiến dịch đang cần sự hỗ trợ từ cộng đồng</h2>
        <div class="campaign-grid" v-if="!campaignLoading">
          <CampaignCard
            v-for="item in featuredCampaigns"
            :key="item.code"
            :campaign="item"
          />
          <div v-if="!featuredCampaigns.length" class="empty">
            <span class="empty-icon" aria-hidden="true">📭</span>
            <p>Hiện chưa có chiến dịch để hiển thị</p>
          </div>
        </div>
        <div class="campaign-grid" v-else>
          <CampaignCard v-for="n in 3" :key="n" :loading="true" />
        </div>
        <div class="cta-center">
          <RouterLink class="btn ghost" to="/campaigns">Xem tất cả chiến dịch</RouterLink>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, onActivated, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import CampaignCard from '@/components/campaign/CampaignCard.vue';
import SearchBar from '@/components/common/SearchBar.vue';
import { useCampaignStore } from '@/stores/campaignStore';
import fallbackImage from '@/assets/image/background.png';
import heroBg from '@/assets/image/background.png';

const stats = [
  { label: 'Tổng quỹ góp', value: '2.5 Tỷ VND' },
  { label: 'Nhà hảo tâm', value: '10,000' },
  { label: 'Chiến dịch thành công', value: '100' },
  { label: 'Tài năng trẻ được hỗ trợ', value: '1,000' }
];

const route = useRoute();
const campaignStore = useCampaignStore();
const campaignLoading = computed(() => campaignStore.loading);
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

const featuredCampaigns = computed(() => campaigns.value.slice(0, 3));

const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%), url(${heroBg})`
}));

const ensureCampaigns = async () => {
  if (!campaigns.value.length && !campaignLoading.value) {
    try {
      await campaignStore.fetchAll();
    } catch (err) {
      console.error('Fetch campaigns failed', err);
    }
  }
};

onMounted(ensureCampaigns);
onActivated(ensureCampaigns);

watch(
  () => route.fullPath,
  () => ensureCampaigns()
);
</script>

<style scoped lang="scss">
.home {
  display: grid;
  gap: 40px;
}

.hero {
  position: relative;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
  min-height: 520px;
  background-size: cover;
  background-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.55) 65%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 28px 48px;
  display: grid;
  gap: 24px;
  color: #ffffff;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.brand {
  display: grid;
  gap: 4px;
}

.brand-title {
  font-size: 16px;
  font-weight: 800;
}

.brand-sub {
  font-size: 12px;
  opacity: 0.85;
}

.hero-search {
  width: min(320px, 100%);
}

.hero-copy {
  display: grid;
  gap: 12px;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  justify-content: center;
  margin-top: 40px; 
}

h1 {
  font-size: 38px;
  line-height: 1.25;
  letter-spacing: -0.3px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.btn.primary {
  align-self: flex-start;
}

.stat-row {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px 14px;
  backdrop-filter: blur(6px);
  justify-items: center;
}

.stat-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.stat-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #09d1c7 0%, #46dfb1 100%);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-value {
  font-weight: 800;
  font-size: 16px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.85;
}

.section {
  display: grid;
  gap: 18px;
}

.section-head h2 {
  font-size: 22px;
  color: #fff;
  line-height: 1.35;
}

.eyebrow {
  color: #ffffff;
  font-weight: 700;
  font-size: 50px;
  letter-spacing: 0.3px;
  margin-bottom: 6px;
  text-align: center;
}

.campaigns {
  padding: 48px 0 56px;
}

.campaign-surface {
  color: #fff; 
  text-align: center;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 35%),
    linear-gradient(180deg, #0b6c7f 0%, #084f64 100%);
  border-radius: 28px 28px 0 0;
  margin-top: 8px;
  padding: 32px 20px 40px;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.08);
}

.section-head {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.campaign-grid {
  max-width: 1100px;
  margin: 0 auto;
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.empty {
  grid-column: 1 / -1;
  color: #d4f6f2;
  text-align: center;
  border: 1px dashed rgba(255, 255, 255, 0.35);
  padding: 16px;
  border-radius: 12px;
  display: grid;
  gap: 6px;
  place-items: center;
}

.empty-icon {
  font-size: 20px;
}

.cta-center {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.btn.ghost {
  background: #fff;
  color: #0C6478;
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .hero {
    border-radius: 0 0 20px 20px;
  }

  .hero-content {
    padding: 28px 18px 40px;
  }

  h1 {
    font-size: 100px;
  }

  .section-head h2 {
    font-size: 50px;
  }
}
</style>
