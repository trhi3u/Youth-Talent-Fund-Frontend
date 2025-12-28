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
        <input
          type="text"
          inputmode="numeric"
          pattern="[0-9.]*"
          :value="formatCurrency(form.targetAmount)"
          @input="onTargetAmountInput"
          required
          placeholder="nhập số tiền"
        />
      </label>
      <label class="field">
        <span>Địa điểm</span>
        <input v-model="form.location" />
      </label>
      <label class="field">
        <span>Ngày bắt đầu *</span>
        <input type="datetime-local" v-model="form.startDate" required />
      </label>
      <label class="field">
        <span>Ngày kết thúc *</span>
        <input type="datetime-local" v-model="form.endDate" required />
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
      <span>Câu chuyện / Nội dung chính</span>
      <textarea rows="6" v-model="form.story" />
    </label>

    <div v-if="errors.length" class="errors">
      <div v-for="err in errors" :key="err" class="error">{{ err }}</div>
    </div>

    <div class="actions">
      <button class="btn ghost" type="button" @click="$emit('cancel')">Hủy</button>
      <button class="btn primary" type="submit" :disabled="submitting">{{ submitting ? 'Đang lưu...' : 'Tạo chiến dịch' }}</button>
    </div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
  </form>
</template>

<script setup>
const successMessage = ref('');
// Format input value to 1.000.000 style and parse back to number
function onTargetAmountInput(e) {
  let val = e.target.value.replace(/\./g, '');
  val = val.replace(/[^0-9]/g, '');
  form.targetAmount = val ? Number(val) : '';
  e.target.value = formatCurrency(form.targetAmount);
}

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
  if (!form.title) {
    errors.value.push('Tên chiến dịch không được để trống');
  } else if (form.title.length < 10 || form.title.length > 200) {
    errors.value.push('Tên chiến dịch phải từ 10 đến 200 ký tự');
  }
  if (!form.description) {
    errors.value.push('Mô tả ngắn không được để trống');
  }
  if (!form.location) {
    errors.value.push('Địa điểm không được để trống');
  }
  if (!form.targetAmount) {
    errors.value.push('Mục tiêu tài chính bắt buộc phải có');
  } else if (Number(form.targetAmount) < 1000000) {
    errors.value.push('Mục tiêu gây quỹ tối thiểu là 1.000.000 VNĐ');
  }
  if (!form.startDate) {
    errors.value.push('Ngày bắt đầu không được để trống');
  } else {
    const now = new Date();
    const start = new Date(form.startDate);
    if (start < now.setHours(0,0,0,0)) {
      errors.value.push('Ngày bắt đầu phải là hiện tại hoặc tương lai');
    }
  }
  if (!form.endDate) {
    errors.value.push('Ngày kết thúc không được để trống');
  } else {
    const end = new Date(form.endDate);
    const now = new Date();
    if (end <= now) {
      errors.value.push('Ngày kết thúc phải là tương lai');
    }
  }
  if (form.startDate && form.endDate) {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    if (diff < 7) errors.value.push('Ngày kết thúc phải diễn ra sau ngày bắt đầu ít nhất 7 ngày');
  }
  if (!form.category) {
    errors.value.push('Danh mục không được để trống');
  }
  return errors.value.length === 0;
};

function formatCurrency(val) {
  if (!val) return '';
  return Number(val).toLocaleString('vi-VN');
}

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
    location: form.location || null,
    story: form.story || null,
    targetAmount: form.targetAmount?.toString() || '',
    startDate: form.startDate ? toUtcString(form.startDate) : null,
    endDate: form.endDate ? toUtcString(form.endDate) : null,
    category: form.category,
    assigneeCode
  };
  const fd = new FormData();
  console.log('DEBUG imageFile.value:', imageFile.value);
  if (imageFile.value) fd.append('image', imageFile.value);
  fd.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' })
  );
  return fd;
};

const handleSubmit = async () => {
  if (!validate()) return;
  const fd = buildPayload();
  submitting.value = true;
  try {
    await createCampaign(fd);
    successMessage.value = 'Tạo chiến dịch thành công';
    setTimeout(() => {
      successMessage.value = '';
      emit('success');
    }, 1200);
  } catch (err) {
    errors.value = [err?.message || 'Tạo chiến dịch thất bại'];
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.success-message {
  color: #219653;
  background: #eafaf1;
  border: 1px solid #b7e5c2;
  padding: 10px 16px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
  font-weight: 700;
}

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

  span {
    font-weight: 700;
  }

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
