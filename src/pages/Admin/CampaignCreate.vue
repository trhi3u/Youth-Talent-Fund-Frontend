<template>
  <section class="page">
    <div class="card box">
      <h1>Tạo chiến dịch mới</h1>
      <CampaignForm />
    </div>
  </section>
</template>

<script setup>
import CampaignForm from '@/components/campaign/CampaignForm.vue';
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
</style>
