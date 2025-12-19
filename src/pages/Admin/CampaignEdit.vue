<template>
  <section class="page" v-if="loaded">
    <div class="card box">
      <h1>Chỉnh sửa chiến dịch</h1>
      <CampaignForm v-model="form" :editable-fields="editable" @submit="handleSubmit" @cancel="goBack" />
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CampaignForm from '@/components/campaign/CampaignForm.vue';
import { useCampaignStore } from '@/stores/campaignStore';
import { toLocalHCM } from '@/utils/date';

const route = useRoute();
const router = useRouter();
const campaignStore = useCampaignStore();
const form = reactive({});
const loaded = ref(false);
const editable = ['title', 'goal', 'status', 'startDate', 'endDate', 'coverImage', 'description', 'internalNotes'];

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
  await campaignStore.update(route.params.id, payload);
  router.push('/admin/campaigns');
};

const goBack = () => router.back();
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
</style>
