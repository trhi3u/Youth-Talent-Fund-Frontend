<template>
  <section class="page" v-if="loaded">
    <div class="card box">
      <h1>Cập nhật tiến độ</h1>
      <CampaignForm v-model="form" :editable-fields="editable" @submit="handleSubmit" @cancel="goBack" />
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CampaignForm from '@/components/campaign/CampaignForm.vue';
import { useStaffStore } from '@/stores/staffStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { toLocalHCM } from '@/utils/date';

const route = useRoute();
const router = useRouter();
const staffStore = useStaffStore();
const campaignStore = useCampaignStore();
const form = reactive({});
const loaded = ref(false);
const editable = ['status', 'goal', 'startDate', 'endDate', 'description', 'internalNotes'];

onMounted(async () => {
  const data = await campaignStore.fetchOne(route.params.id);
  Object.assign(form, {
    ...data,
    startDate: toLocalHCM(data?.startDate),
    endDate: toLocalHCM(data?.endDate)
  });
  loaded.value = true;
});

const handleSubmit = async payload => {
  await staffStore.updateProgress(route.params.id, payload);
  router.push('/staff/campaigns');
};

const goBack = () => router.back();
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
</style>
