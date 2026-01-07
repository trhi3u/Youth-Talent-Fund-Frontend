<template>
  <section class="page">
    <div class="header">
      <h1>Chiến dịch của tôi</h1>
      <RouterLink class="btn primary" to="/staff/campaigns/create">Tạo chiến dịch</RouterLink>
    </div>

    <div v-if="loading" class="grid">
      <CampaignCardFull v-for="n in 4" :key="n" :loading="true" role="STAFF" />
    </div>

    <div v-else class="grid">
      <CampaignCardFull
        v-for="item in campaigns"
        :key="codeFor(item)"
        :campaign="item"
        role="STAFF"
      />
      <div v-if="!campaigns.length" class="empty">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <p>Bạn chưa có chiến dịch nào</p>
      </div>
    </div>

  </section>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useStaffStore } from '@/stores/staffStore';
import CampaignCardFull from '@/components/campaign/CampaignCardFull.vue';

const staffStore = useStaffStore();
const campaigns = computed(() => staffStore.campaigns);
const loading = ref(false);

const codeFor = item => item?.campaignCode || item?.code || item?.id;

onMounted(async () => {
  loading.value = true;
  try {
    await staffStore.fetchCampaigns();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.page { padding: 32px; display: grid; gap: 16px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.grid { display: grid; gap: 12px; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--primary); font-weight: 600; }
.primary { background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%); color: #fff; }
.ghost { background: transparent; color: var(--primary-strong); }
.empty { text-align: center; color: #748ea1; display: grid; gap: 6px; padding: 10px 0; }
.empty-icon { font-size: 20px; }
</style>
