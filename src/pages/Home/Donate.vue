<template>
  <section class="page">
    <div class="card form">
      <h1>Quyên góp</h1>
      <form v-if="!qrCode" @submit.prevent="submit">
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
        <p v-if="error" class="feedback error">{{ error }}</p>
        <p v-if="success" class="feedback success">{{ success }}</p>
        <button class="btn primary" type="submit" :disabled="submitting">{{ submitting ? 'Đang gửi...' : 'Gửi quyên góp' }}</button>
      </form>

      <div v-else class="qr-box">
        <p class="muted">Quét mã QR để hoàn tất thanh toán</p>
        <img v-if="qrCode" :src="qrCode" alt="QR Code" />
        <p v-if="checkoutUrl" class="muted">Hoặc mở trang thanh toán:</p>
        <button v-if="checkoutUrl" class="btn ghost" @click="openCheckout">Mở trang thanh toán</button>
        <button class="btn primary" @click="resetForm">Tạo giao dịch khác</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { createDonation } from '@/api/public.api';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();

const form = reactive({
  campaignCode: '',
  name: '',
  email: '',
  phone: '',
  amount: 100000,
  message: ''
});

const qrCode = ref('');
const checkoutUrl = ref('');
const submitting = ref(false);
const error = ref('');
const success = ref('');

onMounted(async () => {
  form.campaignCode = route.params.id;
  if (authStore.isAuthenticated) {
    const profile = await userStore.loadProfile();
    form.name = profile?.name || profile?.fullName || '';
    form.email = profile?.email || '';
    form.phone = profile?.phone || profile?.phoneNumber || '';
  }
});

const buildReturnUrl = status => `${window.location.origin}/campaign/${form.campaignCode}?mode=donation&donate=${status}`;

const submit = async () => {
  error.value = '';
  success.value = '';
  submitting.value = true;
  try {
    const payload = {
      campaignCode: form.campaignCode,
      name: form.name,
      email: form.email,
      phoneNumber: form.phone,
      amount: form.amount,
      message: form.message,
      returnUrl: buildReturnUrl('success'),
      cancelUrl: buildReturnUrl('cancel')
    };

    const res = await createDonation(payload);
    qrCode.value = res?.qrCode || res?.qrCodeUrl || '';
    checkoutUrl.value = res?.checkoutUrl || res?.url || '';
    success.value = res?.message || 'Tạo giao dịch thành công, vui lòng quét mã QR.';
  } catch (err) {
    error.value = err?.message || 'Tạo giao dịch thất bại';
  } finally {
    submitting.value = false;
  }
};

const openCheckout = () => {
  if (!checkoutUrl.value) return;
  window.open(checkoutUrl.value, '_blank');
};

const resetForm = () => {
  qrCode.value = '';
  checkoutUrl.value = '';
  success.value = '';
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

.feedback {
  margin: 0;
  font-weight: 600;
}

.feedback.error {
  color: #b42318;
}

.feedback.success {
  color: #0f9d58;
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

.btn.ghost {
  background: #f2fbf8;
  color: var(--primary-strong);
  border-color: rgba(12, 100, 120, 0.18);
}

.qr-box {
  display: grid;
  gap: 12px;
  place-items: center;
}

.qr-box img {
  width: 260px;
  height: 260px;
  object-fit: contain;
  padding: 12px;
  border: 1px solid rgba(12, 100, 120, 0.1);
  border-radius: 12px;
  background: #fff;
}

.muted {
  color: rgba(12, 100, 120, 0.7);
  margin: 0;
  text-align: center;
}
</style>
