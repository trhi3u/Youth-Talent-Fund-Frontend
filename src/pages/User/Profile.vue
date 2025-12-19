<template>
  <section class="page">
    <div class="card profile-card">
      <div class="header">
        <h1>Thông tin cá nhân</h1>
      </div>

      <div class="user-summary">
        <div class="avatar" :class="{ placeholder: !avatarUrl }" :style="avatarStyle">
          <span v-if="!avatarUrl">{{ initials }}</span>
        </div>
        <div class="user-text">
          <p class="name">{{ displayName }}</p>
          <p v-if="joinDateText" class="subtitle">Tham gia từ: {{ joinDateText }}</p>
        </div>
      </div>

      <form class="form" @submit.prevent="submit" novalidate>
        <label class="field">
          <span>Họ và tên</span>
          <input v-model.trim="form.fullName" type="text" placeholder="Nhập họ và tên" required />
        </label>

        <label class="field">
          <span>Email</span>
          <input v-model="form.email" type="email" placeholder="Email" readonly />
        </label>

        <label class="field">
          <span>Số điện thoại</span>
          <input v-model.trim="form.phone" type="tel" placeholder="Số điện thoại" />
        </label>

        <label class="field">
          <span>Địa chỉ</span>
          <input v-model.trim="form.address" type="text" placeholder="Địa chỉ" />
        </label>

        <label class="field">
          <span>Giới thiệu bản thân</span>
          <textarea v-model.trim="form.bio" rows="4" placeholder="Chia sẻ đôi nét về bạn" />
        </label>

        <p v-if="error" class="feedback error">{{ error }}</p>
        <p v-if="success" class="feedback success">{{ success }}</p>

        <button class="btn primary" type="submit" :disabled="loading">
          <span v-if="!loading">Cập nhật thông tin</span>
          <span v-else>Đang lưu...</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { updateProfile } from '@/api/user.api';

// Toggle mock vs real API. In DEV we default to mock; switch off to call real API.
const USE_MOCK = import.meta.env.DEV;

const authStore = useAuthStore();

const user = computed(() => authStore.userInfo || authStore.user || {});
const displayName = computed(() => user.value?.fullName || user.value?.name || user.value?.email || 'Người dùng');
const avatarUrl = computed(() => user.value?.avatarUrl || user.value?.avatarPath || '');
const initials = computed(() => (user.value?.fullName || user.value?.name || user.value?.email || 'U').charAt(0).toUpperCase());
const avatarStyle = computed(() => (avatarUrl.value ? { backgroundImage: `url(${avatarUrl.value})` } : {}));
const joinDateText = computed(() => {
  const raw = user.value?.createdAt || user.value?.joinDate || user.value?.joinedAt;
  if (!raw) return 'xx/xx/xxxx';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'xx/xx/xxxx';
  return date.toLocaleDateString('vi-VN');
});

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  bio: ''
});

const loading = ref(false);
const error = ref('');
const success = ref('');

const populateForm = () => {
  form.fullName = user.value?.fullName || user.value?.name || '';
  form.email = user.value?.email || '';
  form.phone = user.value?.phone || '';
  form.address = user.value?.address || '';
  form.bio = user.value?.bio || '';
};

onMounted(() => {
  populateForm();
});

const submit = async () => {
  error.value = '';
  success.value = '';
  if (!form.fullName) {
    error.value = 'Họ và tên là bắt buộc';
    return;
  }

  loading.value = true;
  try {
    if (USE_MOCK) {
      // Mock path: update the auth store locally and show success.
      authStore.setAuth({
        token: authStore.token,
        role: authStore.role,
        user: {
          ...user.value,
          fullName: form.fullName,
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          bio: form.bio
        }
      });
      success.value = 'Đã cập nhật hồ sơ (mock)';
    } else {
      await updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        bio: form.bio
      });
      // After real update, refresh local state to keep UI in sync.
      authStore.setAuth({
        token: authStore.token,
        role: authStore.role,
        user: {
          ...user.value,
          fullName: form.fullName,
          name: form.fullName,
          phone: form.phone,
          address: form.address,
          bio: form.bio
        }
      });
      success.value = 'Đã cập nhật hồ sơ';
    }
  } catch (err) {
    error.value = err?.message || 'Cập nhật thất bại, vui lòng thử lại';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.page {
  padding: 32px;
  display: grid;
  place-items: center;
}

.profile-card {
  width: min(960px, 100%);
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  background: #ffffff;
  display: grid;
  gap: 18px;
}

.header {
  display: grid;
  gap: 4px;
}

.header h1 {
  margin: 0;
  font-size: 22px;
  color: var(--primary-strong);
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(12, 100, 120, 0.75);
}

.user-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: rgba(12, 100, 120, 0.1);
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 800;
  color: #0c6478;
}

.avatar.placeholder {
  border: 1px dashed rgba(12, 100, 120, 0.3);
}

.user-text {
  display: grid;
  gap: 4px;
}

.name {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--primary-strong);
}

.subtitle {
  margin: 4px 0 0;
  color: rgba(12, 100, 120, 0.7);
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

.field input,
.field textarea {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.15);
  background: #fff;
  font: inherit;
  resize: none;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #0b6c7f;
  box-shadow: 0 0 0 3px rgba(11, 108, 127, 0.12);
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
  .header {
    align-items: flex-start;
  }

  .avatar {
    width: 64px;
    height: 64px;
    font-size: 22px;
  }
}
</style>
