<template>
  <section class="page">
    <div class="card box">
      <h1>Tạo chiến dịch mới</h1>
      <CampaignForm v-model="form" :editable-fields="editable" @submit="handleSubmit" @cancel="goBack" />
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import CampaignForm from '@/components/campaign/CampaignCreateForm.vue';
import { useStaffStore } from '@/stores/staffStore';

const router = useRouter();
const staffStore = useStaffStore();
const form = reactive({});
const editable = ['title', 'goal', 'status', 'startDate', 'endDate', 'coverImage', 'description', 'internalNotes'];

const handleSubmit = async payload => {
  await staffStore.createCampaign(payload);
  router.push('/staff/campaigns');
};

const goBack = () => router.back();
</script>

<style scoped lang="scss">
.page { 
  padding: 32px; 
}
h1 {
  margin-bottom: 28px;
}
.box {
  padding: 24px; 
  display: grid; 
  gap: 12px; 
}
</style>
