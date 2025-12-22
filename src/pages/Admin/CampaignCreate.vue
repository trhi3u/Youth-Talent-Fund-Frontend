<template>
  <section class="page">
    <div class="card box">
      <h1>Tạo chiến dịch mới</h1>
      <CampaignCreateForm @success="handleSuccess" @cancel="goBack" />
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import CampaignCreateForm from '@/components/campaign/CampaignCreateForm.vue';

const router = useRouter();

const handleSuccess = () => {
  router.push('/admin/campaigns');
};

const goBack = () => router.back();
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
</style>
