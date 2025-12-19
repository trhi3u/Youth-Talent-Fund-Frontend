<template>
  <section class="auth-page">

    <div class="auth-card">
      <h2>Đăng ký</h2>
      <p class="hint">Điền thông tin của bạn để tạo tài khoản</p>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>Họ và tên</span>
          <input
            v-model.trim="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            :class="{ error: fieldError('fullName') }"
            required
          />
        </label>

        <label class="field">
          <span>Email</span>
          <input
            v-model.trim="email"
            type="email"
            placeholder="nhapemail@example.com"
            :class="{ error: fieldError('email') }"
            required
          />
        </label>

        <label class="field">
          <span>Số điện thoại</span>
          <input
            v-model.trim="phoneNumber"
            type="tel"
            placeholder="0123 456 789"
            :class="{ error: fieldError('phoneNumber') }"
            required
          />
        </label>

        <label class="field">
          <span>Mật khẩu</span>
          <input
            v-model.trim="password"
            type="password"
            placeholder="••••••••"
            minlength="6"
            :class="{ error: fieldError('password') }"
            required
          />
        </label>

        <button class="btn primary" type="submit" :disabled="loading || !canSubmit">
          <span v-if="!loading">Tạo tài khoản</span>
          <span v-else>Đang xử lý...</span>
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
      </form>

      <p class="switch">
        <span>Đã có tài khoản?</span>
        <RouterLink class="switch-link" to="/login">Đăng nhập</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { register as registerApi } from '@/api/auth.api';

const fullName = ref('');
const email = ref('');
const phoneNumber = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const router = useRouter();

const canSubmit = computed(() => fullName.value && email.value && phoneNumber.value && password.value.length >= 6);

const fieldError = field => {
  if (!errorMessage.value) return false;
  if (field === 'email' && !/.+@.+\..+/.test(email.value)) return true;
  if (field === 'password' && password.value.length < 6) return true;
  return false;
};

const submit = async () => {
  if (!canSubmit.value || loading.value) return;
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const res = await registerApi({
      email: email.value,
      password: password.value,
      fullName: fullName.value,
      phoneNumber: phoneNumber.value
    });
    if (res?.status && res.status !== 200) throw new Error(res?.error || 'Đăng ký thất bại');
    successMessage.value = 'Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.';
    setTimeout(() => router.push('/login'), 600);
  } catch (err) {
    errorMessage.value = err?.message || 'Đăng ký thất bại, vui lòng thử lại';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: center;
  justify-items: center;
  background: #f3f7f9;
  padding: 32px 16px;
}


.eyebrow {
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.9;
}

h1 {
  font-size: 32px;
  font-weight: 800;
}

.sub {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.bullets {
  margin: 8px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  color: rgba(255, 255, 255, 0.95);
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
}

.hint {
  color: #5b7083;
  margin-bottom: 12px;
}

.form {
  display: grid;
  gap: 18px;
}

.field {
  display: grid;
  gap: 8px;
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
  color: #5b7083;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.switch-link {
  font-weight: 700;
  color: #0b6c7f;
}

@media (max-width: 768px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-card {
    margin: 0 auto;
    padding: 32px 24px;
  }
}
</style>
