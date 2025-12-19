<template>
  <Teleport to="body">
    <div class="chatbot-root">
      <button class="fab" @click="chatStore.toggleChat" aria-label="Mở chatbot">
        💬
      </button>
      <div v-if="chatStore.isOpen" class="panel">
        <ChatbotWindow />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Teleport } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import ChatbotWindow from './ChatbotWindow.vue';

const chatStore = useChatStore();
</script>

<style scoped lang="scss">
.chatbot-root {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 500;
  display: grid;
  justify-items: end;
  gap: 10px;
}

.fab {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(120deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.panel {
  position: relative;
}

@media (max-width: 480px) {
  .chatbot-root {
    right: 12px;
    bottom: 12px;
  }
}
</style>
