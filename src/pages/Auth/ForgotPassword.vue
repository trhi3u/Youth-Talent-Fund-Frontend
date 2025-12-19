<template>
  <section class="auth-page">  

    <div class="auth-card">
      <h2>Quên mật khẩu</h2>
      <p class="hint">Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến email của bạn</p>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>Email</span>
          <input
            v-model.trim="email"
            type="email"
            placeholder="nhapemail@example.com"
            :class="{ error: errorMessage }"
            required
          />
        </label>

        <button class="btn primary" type="submit" :disabled="loading || !email">
          <span v-if="!loading">Gửi yêu cầu</span>
          <span v-else>Đang xử lý...</span>
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
      </form>

      <p class="switch">
        <RouterLink to="/login">Quay lại đăng nhập</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/register">Tạo tài khoản mới</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { forgotPassword as forgotPasswordApi } from '@/api/auth.api';

const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const submit = async () => {
  if (!email.value || loading.value) return;
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const res = await forgotPasswordApi({ email: email.value });
    if (res?.status && res.status !== 200) throw new Error(res?.error || 'Gửi yêu cầu thất bại');
    successMessage.value = 'Vui lòng kiểm tra email';
  } catch (err) {
    errorMessage.value = err?.message || 'Gửi yêu cầu thất bại, vui lòng thử lại';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">

.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f3f7f9;
  padding: 32px 16px;
}

.auth-card {
  background: #fff;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 36px;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  display: grid;
  gap: 14px;
  text-align: center;
}

.hint {
  color: #5b7083;
  margin-bottom: 12px;
}

.form {
  display: grid;
  gap: 18px;
  margin-top: 4px;
}

.field {
  display: grid;
  gap: 8px;
  text-align: left;
}

input {
  padding: 14px 12px;
  border: 1px solid rgba(12, 100, 120, 0.25);
  border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #0b6c7f;
  box-shadow: 0 0 0 3px rgba(11, 108, 127, 0.15);
}

input.error {
  border-color: #d14343;
  background: #fff6f6;
}

.btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.error-text {
  color: #d14343;
  font-weight: 600;
}

.success-text {
  color: #0f9d58;
  font-weight: 600;
}

.switch {
  text-align: center;
  color: #0b6c7f;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.divider {
  color: #9fb0c0;
}

@media (max-width: 768px) {
  .auth-card {
    margin: 0;
    padding: 28px 22px;
  }
}
</style>
