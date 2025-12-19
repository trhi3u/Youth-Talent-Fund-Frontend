<template>
  <section class="page">
    <div class="card form">
      <h1>Quyên góp</h1>
      <form @submit.prevent="submit">
        <div class="grid">
          <label class="field">
            <span>Họ tên</span>
            <input v-model="form.name" required />
          </label>
          <label class="field">
            <span>Email</span>
            <input type="email" v-model="form.email" required />
          </label>
          <label class="field">
            <span>Số điện thoại</span>
            <input v-model="form.phone" />
          </label>
          <label class="field">
            <span>Số tiền (VND)</span>
            <input type="number" min="10000" step="1000" v-model.number="form.amount" required />
          </label>
        </div>
        <label class="field">
          <span>Lời nhắn</span>
          <textarea rows="3" v-model="form.message" />
        </label>
        <button class="btn primary" type="submit">Gửi quyên góp</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { createDonation } from '@/api/public.api';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();

const form = reactive({
  campaignId: '',
  name: '',
  email: '',
  phone: '',
  amount: 100000,
  message: ''
});

onMounted(async () => {
  form.campaignId = route.params.id;
  if (authStore.isAuthenticated) {
    const profile = await userStore.loadProfile();
    form.name = profile?.name || '';
    form.email = profile?.email || '';
    form.phone = profile?.phone || '';
  }
});

const submit = async () => {
  await createDonation({ ...form });
  alert('Đã tạo giao dịch mock/real thành công');
};
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
}

.form {
  padding: 24px;
  display: grid;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  input,
  textarea {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(12, 100, 120, 0.2);
    background: #fff;
  }
}

.btn {
  margin-top: 12px;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--primary);
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  font-weight: 600;
}
</style>
