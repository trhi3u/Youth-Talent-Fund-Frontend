<template>
  <section class="auth-page">

    <div class="auth-card">
      <h2>Đăng nhập</h2>
      <p class="hint">Nhập thông tin tài khoản để tiếp tục</p>

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

        <label class="field">
          <span>Mật khẩu</span>
          <input
            v-model.trim="password"
            type="password"
            placeholder="••••••••"
            :class="{ error: errorMessage }"
            required
          />
        </label>

        <div class="actions-row">
          <label class="remember">
            <input type="checkbox" v-model="rememberMe" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <RouterLink class="link" to="/forgot-password">Quên mật khẩu?</RouterLink>
        </div>

        <button class="btn primary" type="submit" :disabled="loading || !canSubmit">
          <span v-if="!loading">Đăng nhập</span>
          <span v-else>Đang xử lý...</span>
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
      </form>

      <p class="switch">
        <span>Chưa có tài khoản?</span>
        <RouterLink class="switch-link" to="/register">Đăng ký ngay</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const rememberMe = ref(false);

const router = useRouter();
const auth = useAuthStore();

const canSubmit = computed(() => email.value && password.value);

const submit = async () => {
  if (!canSubmit.value || loading.value) return;
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await auth.login({ email: email.value, password: password.value, rememberMe: rememberMe.value });
    successMessage.value = 'Đăng nhập thành công';
    router.push('/user');
  } catch (err) {
    errorMessage.value = err?.message || 'Đăng nhập thất bại, vui lòng thử lại';
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

.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.link {
  color: #0b6c7f;
  font-weight: 600;
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #35516d;
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
    margin: 0;
  }
}
</style>
