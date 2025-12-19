<template>
  <section class="page">
    <div class="card box">
      <h1>Tạo chiến dịch</h1>
      <CampaignForm v-model="form" :editable-fields="editable" @submit="handleSubmit" @cancel="goBack" />
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import CampaignForm from '@/components/campaign/CampaignForm.vue';
import { useCampaignStore } from '@/stores/campaignStore';

const router = useRouter();
const campaignStore = useCampaignStore();
const form = reactive({});
const editable = ['title', 'goal', 'status', 'startDate', 'endDate', 'coverImage', 'description', 'internalNotes'];

const handleSubmit = async payload => {
  await campaignStore.create(payload);
  router.push('/admin/campaigns');
};

const goBack = () => router.back();
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
</style>
