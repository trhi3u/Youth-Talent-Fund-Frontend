<template>
  <form class="donate-form card" @submit.prevent="onSubmit">
    <div class="grid">
      <label class="field">
        <span>Họ tên</span>
        <input v-model="form.name" :disabled="loading" required />
      </label>
      <label class="field">
        <span>Email</span>
        <input type="email" v-model="form.email" :disabled="loading" required />
      </label>
      <label class="field">
        <span>Số điện thoại</span>
        <input v-model="form.phone" :disabled="loading" />
      </label>
      <label class="field">
        <span>Số tiền (VND)</span>
        <input type="number" min="10000" step="1000" v-model.number="form.amount" :disabled="loading" required />
      </label>
    </div>
    <label class="field">
      <span>Lời nhắn</span>
      <textarea rows="3" v-model="form.message" :disabled="loading" />
    </label>
    <div v-if="error" class="error">{{ error }}</div>
    <button class="btn primary" type="submit" :disabled="loading">{{ loading ? 'Đang gửi...' : 'Gửi quyên góp' }}</button>
  </form>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const form = reactive({
  campaignId: '',
  name: '',
  email: '',
  phone: '',
  amount: 100000,
  message: ''
});

const error = ref('');

watch(
  () => props.modelValue,
  value => {
    Object.assign(form, value || {});
  },
  { immediate: true, deep: true }
);

watch(
  form,
  value => emit('update:modelValue', { ...value }),
  { deep: true }
);

const onSubmit = () => {
  error.value = '';
  if (!form.name || !form.email || !form.amount) {
    error.value = 'Vui lòng điền đầy đủ thông tin bắt buộc.';
    return;
  }
  if (form.amount < 10000) {
    error.value = 'Số tiền tối thiểu 10.000đ';
    return;
  }
  emit('submit', { ...form });
};
</script>

<style scoped lang="scss">
.donate-form {
  padding: 24px;
  display: grid;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--primary-strong);

  input,
  textarea {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(12, 100, 120, 0.2);
    background: #fff;
  }
}

.btn {
  width: fit-content;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--primary);
  background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  font-weight: 600;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.error {
  background: rgba(244, 13, 13, 0.08);
  border: 1px solid rgba(244, 13, 13, 0.2);
  color: #b42318;
  padding: 8px 12px;
  border-radius: 8px;
}
</style>
