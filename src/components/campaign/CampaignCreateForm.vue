<template>
  <form class="campaign-create" @submit.prevent="handleSubmit">
    <div class="grid">
      <label class="field">
        <span>Tiêu đề *</span>
        <input v-model="form.title" required />
      </label>
      <label class="field">
        <span>Danh mục *</span>
        <select v-model="form.category" required>
          <option value="" disabled>Chọn danh mục</option>
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>
      <label class="field">
        <span>Mục tiêu (VND) *</span>
        <input type="number" min="0" step="1000" v-model="form.targetAmount" required />
      </label>
      <label class="field">
        <span>Địa điểm</span>
        <input v-model="form.location" />
      </label>
      <label class="field">
        <span>Ngày bắt đầu</span>
        <input type="datetime-local" v-model="form.startDate" />
      </label>
      <label class="field">
        <span>Ngày kết thúc</span>
        <input type="datetime-local" v-model="form.endDate" />
      </label>
      <label class="field file">
        <span>Ảnh bìa</span>
        <input type="file" accept="image/*" @change="onFile" />
      </label>
    </div>

    <label class="field">
      <span>Mô tả ngắn *</span>
      <textarea rows="3" v-model="form.description" required />
    </label>

    <label class="field">
      <span>Câu chuyện / Nội dung chính *</span>
      <textarea rows="6" v-model="form.story" required />
    </label>

    <div v-if="errors.length" class="errors">
      <div v-for="err in errors" :key="err" class="error">{{ err }}</div>
    </div>

    <div class="actions">
      <button class="btn ghost" type="button" @click="$emit('cancel')">Hủy</button>
      <button class="btn primary" type="submit" :disabled="submitting">{{ submitting ? 'Đang lưu...' : 'Tạo chiến dịch' }}</button>
    </div>
  </form>
</template>

<script setup>

import { reactive, ref } from 'vue';
import { getCategoryOptions } from '@/utils/category';
import { toUtcString } from '@/utils/date';
import { createCampaign } from '@/api/management.api';
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits(['success', 'cancel']);

const categoryOptions = getCategoryOptions();

const form = reactive({
  title: '',
  description: '',
  location: '',
  story: '',
  targetAmount: '',
  startDate: '',
  endDate: '',
  category: '',
  assigneeCode: ''
});

const imageFile = ref(null);
const errors = ref([]);
const submitting = ref(false);

const onFile = e => {
  const [file] = e.target.files || [];
  imageFile.value = file || null;
};

const validate = () => {
  errors.value = [];
  if (!form.title) errors.value.push('Tiêu đề là bắt buộc');
  if (!form.description) errors.value.push('Mô tả là bắt buộc');
  if (!form.story) errors.value.push('Câu chuyện là bắt buộc');
  if (!form.targetAmount || Number(form.targetAmount) <= 0) errors.value.push('Mục tiêu phải lớn hơn 0');
  if (!form.category) errors.value.push('Danh mục là bắt buộc');
  return errors.value.length === 0;
};

const buildPayload = () => {
  const auth = useAuthStore();
  // Lấy mã người dùng hiện tại (admin hoặc staff)
  let assigneeCode = '';
  if (auth.role === 'ADMIN') {
    assigneeCode = auth.userInfo?.adminCode || auth.userInfo?.code || '';
  } else if (auth.role === 'STAFF') {
    assigneeCode = auth.userInfo?.staffCode || auth.userInfo?.code || '';
  }
  const data = {
    title: form.title,
    description: form.description,
    location: form.location,
    story: form.story,
    targetAmount: form.targetAmount?.toString() || '',
    startDate: form.startDate ? toUtcString(form.startDate) : null,
    endDate: form.endDate ? toUtcString(form.endDate) : null,
    category: form.category,
    assigneeCode
  };
  const fd = new FormData();
  if (imageFile.value) fd.append('image', imageFile.value);
  fd.append('data', JSON.stringify(data));
  return fd;
};

const handleSubmit = async () => {
  if (!validate()) return;
  const fd = buildPayload();
  submitting.value = true;
  try {
    await createCampaign(fd);
    emit('success');
  } catch (err) {
    errors.value = [err?.message || 'Tạo chiến dịch thất bại'];
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.campaign-create {
  display: grid;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
  color: #0b6c7f;

  input,
  select,
  textarea {
    padding: 12px;
    border: 1px solid rgba(12, 100, 120, 0.2);
    border-radius: 12px;
    background: #fff;
    font: inherit;
    color: inherit;
    resize: none;
  }
}

.field select {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  background-image: none;
}

.field.file input {
  padding: 10px;
}

.note {
  color: #6b7a8d;
}

.errors {
  display: grid;
  gap: 6px;
}

.error {
  background: rgba(244, 13, 13, 0.08);
  border: 1px solid rgba(244, 13, 13, 0.2);
  color: #b42318;
  padding: 8px 12px;
  border-radius: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(12, 100, 120, 0.2);
  background: #f2fbf8;
  color: #0b6c7f;
  transition: transform 0.12s ease, box-shadow 0.15s ease;
}

.btn.primary {
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  border-color: rgba(9, 209, 199, 0.35);
}

.btn:hover { transform: translateY(-1px); }

.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
</style>
