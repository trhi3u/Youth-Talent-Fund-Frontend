<template>
  <div class="message" :data-role="role">
    <div class="bubble">
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  role: { type: String, default: 'bot' },
  text: { type: String, default: '' }
});
</script>

<style scoped lang="scss">
.message {
  display: flex;
  width: 100%;
}

.message[data-role='user'] {
  justify-content: flex-end;
}

.message[data-role='bot'] {
  justify-content: flex-start;
}

.bubble {
  display: inline-flex;
  max-width: 72%;
  width: fit-content;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f3fbff;
  color: #0c6478;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.message[data-role='user'] .bubble {
  background: linear-gradient(120deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
}

.bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
