<template>
  <section class="page">
    <div class="card box">
      <h1>Phân công chiến dịch</h1>
      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>Chiến dịch</span>
          <select v-model="selection.campaignId" required>
            <option v-for="c in campaigns" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </label>
        <label class="field">
          <span>Nhân viên</span>
          <select v-model="selection.staffId" required>
            <option v-for="s in staff" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </label>
        <button class="btn primary" type="submit">Phân công</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useAdminStore } from '@/stores/adminStore';

const adminStore = useAdminStore();
const staff = computed(() => adminStore.staff);
const campaigns = computed(() => adminStore.campaigns);
const selection = reactive({ staffId: '', campaignId: '' });

onMounted(() => {
  adminStore.fetchStaff();
  adminStore.fetchCampaigns();
});

const submit = async () => {
  await adminStore.assign({ ...selection });
  alert('Đã phân công (mock/real)');
};
</script>

<style scoped lang="scss">
.page { padding: 32px; }
.box { padding: 24px; display: grid; gap: 12px; }
.form { display: grid; gap: 12px; max-width: 420px; }
.field { display: grid; gap: 6px; }
select { padding: 12px; border-radius: 8px; border: 1px solid rgba(12, 100, 120, 0.2); }
.btn { width: fit-content; padding: 12px 18px; border-radius: 10px; border: 1px solid var(--primary); background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%); color: #fff; font-weight: 600; }
</style>
