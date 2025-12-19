<template>
  <div class="stats-card card" :class="{ loading }">
    <div class="icon" v-if="icon && !loading">{{ icon }}</div>
    <div class="label">{{ label }}</div>
    <div class="value" v-if="!loading">{{ value }}</div>
    <div class="sublabel" v-if="subLabel && !loading">{{ subLabel }}</div>
    <div v-if="loading" class="skeleton value" />
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, default: '' },
  value: { type: String, default: '-' },
  subLabel: { type: String, default: '' },
  icon: { type: String, default: '' },
  loading: { type: Boolean, default: false }
});
</script>

<style scoped lang="scss">
.stats-card {
  padding: 16px;
  display: grid;
  gap: 6px;
  min-height: 120px;
  border: 1px solid rgba(12, 100, 120, 0.1);
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(9, 209, 199, 0.15);
  display: grid;
  place-items: center;
  color: var(--primary-strong);
  font-weight: 700;
}

.label {
  color: #35516d;
  font-size: 14px;
  letter-spacing: 0.01em;
}

.value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-strong);
}

.sublabel {
  color: #35516d;
  font-size: 13px;
}

.loading .value,
.loading .sublabel {
  opacity: 0.6;
}

.skeleton {
  background: linear-gradient(90deg, rgba(9, 209, 199, 0.1) 0%, rgba(70, 223, 177, 0.15) 100%);
  border-radius: 8px;
  height: 24px;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>
