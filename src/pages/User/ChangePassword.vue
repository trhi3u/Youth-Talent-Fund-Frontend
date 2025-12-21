<template>
  <section class="page">
    <div class="card surface">
      <div class="head">
        <p class="eyebrow">Bảo mật tài khoản</p>
        <h1>Đổi mật khẩu</h1>
      </div>

      <form class="form" @submit.prevent="onSubmit" novalidate>
        <label class="field">
          <span>Mật khẩu hiện tại</span>
          <div class="input-wrap">
            <input
              :type="showCurrent ? 'text' : 'password'"
              v-model.trim="form.currentPassword"
              placeholder="Nhập mật khẩu hiện tại"
              autocomplete="current-password"
              required
            />
            <button type="button" class="toggle" @click="showCurrent = !showCurrent">{{ showCurrent ? 'Ẩn' : 'Hiện' }}</button>
          </div>
          <p v-if="errors.current" class="error">{{ errors.current }}</p>
        </label>

        <label class="field">
          <span>Mật khẩu mới</span>
          <div class="input-wrap">
            <input
              :type="showNew ? 'text' : 'password'"
              v-model.trim="form.newPassword"
              placeholder="Nhập mật khẩu mới"
              autocomplete="new-password"
              required
            />
            <button type="button" class="toggle" @click="showNew = !showNew">{{ showNew ? 'Ẩn' : 'Hiện' }}</button>
          </div>
          <p v-if="errors.new" class="error">{{ errors.new }}</p>
        </label>

        <label class="field">
          <span>Xác nhận mật khẩu mới</span>
          <div class="input-wrap">
            <input
              :type="showConfirm ? 'text' : 'password'"
              v-model.trim="form.confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              autocomplete="new-password"
              required
            />
            <button type="button" class="toggle" @click="showConfirm = !showConfirm">{{ showConfirm ? 'Ẩn' : 'Hiện' }}</button>
          </div>
          <p v-if="errors.confirm" class="error">{{ errors.confirm }}</p>
        </label>

        <div class="actions-row">
          <button
            type="button"
            class="link"
            :disabled="forgotLoading"
            @click="onForgot"
          >
            <span v-if="!forgotLoading">Quên mật khẩu?</span>
            <span v-else>Đang gửi...</span>
          </button>
        </div>

        <p v-if="feedback.success" class="feedback success">{{ feedback.success }}</p>
        <p v-if="feedback.error" class="feedback error">{{ feedback.error }}</p>

        <button class="btn primary" type="submit" :disabled="submitting || !canSubmit">
          <span v-if="!submitting">Cập nhật mật khẩu</span>
          <span v-else>Đang lưu...</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { changePassword } from '@/api/user.api';
import { forgotPassword } from '@/api/auth.api';

const authStore = useAuthStore();
const userStore = useUserStore();

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const errors = reactive({ current: '', new: '', confirm: '' });
const feedback = reactive({ success: '', error: '' });

const submitting = ref(false);
const forgotLoading = ref(false);

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const userEmail = computed(() => authStore.userInfo?.email || authStore.user?.email || userStore.profile?.email || '');

const validate = () => {
  errors.current = '';
  errors.new = '';
  errors.confirm = '';

  if (!form.currentPassword) errors.current = 'Vui lòng nhập mật khẩu hiện tại';
  if (!form.newPassword) errors.new = 'Vui lòng nhập mật khẩu mới';
  else if (form.newPassword.length < 8) errors.new = 'Mật khẩu mới tối thiểu 8 ký tự';
  if (form.confirmPassword !== form.newPassword) errors.confirm = 'Mật khẩu nhập lại chưa khớp';

  return !errors.current && !errors.new && !errors.confirm;
};

const canSubmit = computed(() =>
  form.currentPassword && form.newPassword && form.confirmPassword && form.newPassword.length >= 8 && form.newPassword === form.confirmPassword
);

const resetFields = () => {
  form.currentPassword = '';
  form.newPassword = '';
  form.confirmPassword = '';
  showCurrent.value = false;
  showNew.value = false;
  showConfirm.value = false;
};

const onSubmit = async () => {
  feedback.success = '';
  feedback.error = '';
  if (!validate()) return;

  submitting.value = true;
  try {
    await changePassword({
      oldPassword: form.currentPassword,
      newPassword: form.newPassword
    });
    feedback.success = 'Đã cập nhật mật khẩu thành công';
    resetFields();
  } catch (err) {
    feedback.error = err?.message || 'Cập nhật mật khẩu thất bại, vui lòng thử lại';
  } finally {
    submitting.value = false;
  }
};

const onForgot = async () => {
  feedback.error = '';
  feedback.success = '';
  if (!userEmail.value) {
    feedback.error = 'Không tìm thấy email tài khoản để gửi yêu cầu.';
    return;
  }

  forgotLoading.value = true;
  try {
    await forgotPassword({ email: userEmail.value });
    feedback.success = 'Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn';
  } catch (err) {
    feedback.error = err?.message || 'Không thể gửi yêu cầu, vui lòng thử lại';
  } finally {
    forgotLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
  display: grid;
  place-items: center;
}

.surface {
  width: min(720px, 100%);
  padding: 28px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.08);
  display: grid;
  gap: 16px;
}

.head {
  display: grid;
  gap: 6px;
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(12, 100, 120, 0.75);
}

.head h1 {
  margin: 0;
  font-size: 24px;
  color: var(--primary-strong);
}

.hint {
  margin: 0;
  color: rgba(12, 100, 120, 0.72);
}

.form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
  font-weight: 600;
  color: var(--primary-strong);
}

.input-wrap {
  position: relative;
  display: grid;
}

.input-wrap input {
  padding: 12px 44px 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.15);
  background: #fff;
  font: inherit;
}

.input-wrap input:focus {
  outline: none;
  border-color: #0b6c7f;
  box-shadow: 0 0 0 3px rgba(11, 108, 127, 0.12);
}

.toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: rgba(12, 100, 120, 0.9);
  font-weight: 700;
  cursor: pointer;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
}

.link {
  background: none;
  border: none;
  color: #0b6c7f;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b42318;
  margin: 0;
  font-weight: 600;
  font-size: 13px;
}

.feedback {
  margin: 0;
  font-weight: 600;
}

.feedback.success {
  color: #0f9d58;
}

.feedback.error {
  color: #b42318;
}

.btn {
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid var(--primary);
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

@media (max-width: 640px) {
  .surface {
    padding: 22px;
  }

  .head h1 {
    font-size: 22px;
  }
}
</style>
