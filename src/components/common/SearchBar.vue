<template>
  <label class="search-bar">
    <span class="icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="6" />
        <path d="M15.5 15.5 21 21" stroke-linecap="round" />
      </svg>
    </span>
    <input
      type="search"
      v-model="keyword"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      @keyup.enter="handleSearch"
    />
  </label>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Tìm kiếm chiến dịch...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['search']);
const keyword = ref('');

const handleSearch = () => {
  const value = (keyword.value || '').trim();
  keyword.value = value;
  emit('search', value);
  keyword.value = '';
};
</script>

<style scoped lang="scss">
.search-bar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(9, 209, 199, 0.08), rgba(70, 223, 177, 0.08));
  border: 1px solid rgba(12, 100, 120, 0.12);
  box-shadow: 0 6px 18px rgba(12, 100, 120, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: var(--primary-strong);
    font-weight: 500;
    font-size: 14px;
    caret-color: var(--primary);
  }

  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 8px 24px rgba(9, 209, 199, 0.25);
    background: #ffffff;
  }

  &:has(input:disabled) {
    opacity: 0.75;
    cursor: not-allowed;
  }
}

.icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  color: var(--primary-strong);
  opacity: 0.8;
}
</style>
