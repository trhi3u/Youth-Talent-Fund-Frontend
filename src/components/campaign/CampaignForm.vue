<template>
  <form class="campaign-form card" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <label class="field">
        <span>Tiêu đề</span>
        <input v-model="form.title" :disabled="isDisabled('title')" required />
      </label>
      <label class="field">
        <span>Mục tiêu (VND)</span>
        <input type="number" min="0" step="1000" v-model.number="form.goal" :disabled="isDisabled('goal')" required />
      </label>
      <label class="field">
        <span>Trạng thái</span>
        <select v-model="form.status" :disabled="isDisabled('status')">
          <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </label>
      <label class="field">
        <span>Ngày bắt đầu</span>
        <input type="datetime-local" v-model="form.startDate" :disabled="isDisabled('startDate')" />
      </label>
      <label class="field">
        <span>Ngày kết thúc</span>
        <input type="datetime-local" v-model="form.endDate" :disabled="isDisabled('endDate')" />
      </label>
      <label class="field">
        <span>Ảnh bìa (URL)</span>
        <input v-model="form.coverImage" :disabled="isDisabled('coverImage')" />
      </label>
    </div>

    <label class="field">
      <span>Mô tả</span>
      <textarea rows="4" v-model="form.description" :disabled="isDisabled('description')" />
    </label>

    <label class="field">
      <span>Ghi chú nội bộ</span>
      <textarea rows="3" v-model="form.internalNotes" :disabled="isDisabled('internalNotes')" />
    </label>

    <div v-if="errors.length" class="errors">
      <div v-for="err in errors" :key="err" class="error">{{ err }}</div>
    </div>

    <div class="actions">
      <button class="btn ghost" type="button" @click="$emit('cancel')">Hủy</button>
      <button class="btn primary" type="submit">Lưu</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';
import { toUtcString } from '@/utils/date';

const statuses = ['Pending', 'In-progress', 'On-hold', 'Completed', 'Cancelled'];

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  editableFields: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const form = reactive({
  title: '',
  goal: 0,
  status: 'Pending',
  startDate: '',
  endDate: '',
  coverImage: '',
  description: '',
  internalNotes: ''
});

const errors = reactive([]);

watch(
  () => props.modelValue,
  value => {
    Object.assign(form, value || {});
  },
  { immediate: true, deep: true }
);

watch(
  form,
  value => {
    emit('update:modelValue', { ...value });
  },
  { deep: true }
);

const editableSet = computed(() => new Set(props.editableFields));
const isDisabled = field => editableSet.value.size ? !editableSet.value.has(field) : false;

const validate = () => {
  errors.splice(0, errors.length);
  if (!form.title) errors.push('Tiêu đề là bắt buộc');
  if (form.goal <= 0) errors.push('Mục tiêu phải lớn hơn 0');
  if (!statuses.includes(form.status)) errors.push('Trạng thái không hợp lệ');
  if (form.status === 'Completed' || form.status === 'Cancelled') {
    if (editableSet.value.has('status')) {
      // Allow viewing but warn if attempting to edit locked states.
      errors.push('Chiến dịch đã hoàn tất/huỷ không được chỉnh sửa');
    }
  }
  return errors.length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  const payload = {
    ...form,
    startDate: form.startDate ? toUtcString(form.startDate) : null,
    endDate: form.endDate ? toUtcString(form.endDate) : null
  };
  emit('submit', payload);
};
</script>

<style scoped lang="scss">
.campaign-form {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--primary-strong);

  input,
  select,
  textarea {
    padding: 12px;
    border: 1px solid rgba(12, 100, 120, 0.2);
    border-radius: 10px;
    background: #ffffff;
    font: inherit;
    color: inherit;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--primary);
  font-weight: 600;
  transition: all 0.2s ease;

  &.primary {
    background: linear-gradient(90deg, #09d1c7 0%, #46dfb1 100%);
    color: #ffffff;
  }

  &.ghost {
    background: transparent;
    color: var(--primary-strong);
  }
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
</style>
