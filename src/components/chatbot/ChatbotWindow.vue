<template>
  <div class="chat-window">
    <header class="chat-header">
      <div>
        <h2>Hỗ trợ trực tuyến</h2>
      </div>
      <button class="icon-btn" @click="chatStore.toggleChat" aria-label="Đóng chatbot">✕</button>
    </header>

    <section ref="listRef" class="chat-body">
      <ChatMessage
        v-for="(msg, idx) in chatStore.messages"
        :key="idx"
        :role="msg.role"
        :text="msg.text"
      />
      <div v-if="chatStore.loading" class="loading">Đang phản hồi...</div>
    </section>

    <form class="chat-input" @submit.prevent="handleSend">
      <input
        v-model="draft"
        type="text"
        placeholder="Nhập tin nhắn..."
        :disabled="chatStore.loading"
        @keydown.enter.exact.prevent="handleSend"
      />
      <button type="submit" class="send-btn" :disabled="!canSend">
        Gửi
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import ChatMessage from './ChatMessage.vue';

const chatStore = useChatStore();
const draft = ref('');
const listRef = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight;
    }
  });
};

watch(
  () => chatStore.messages.length,
  () => scrollToBottom()
);

const handleSend = () => {
  const text = draft.value.trim();
  if (!text || chatStore.loading) return;
  chatStore.sendMessage(text);
  draft.value = '';
  scrollToBottom();
};

const canSend = computed(() => draft.value.trim().length > 0 && !chatStore.loading);
</script>

<style scoped lang="scss">
.chat-window {
  width: min(360px, 90vw);
  height: 480px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.14);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(120deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
}

.chat-body {
  padding: 12px;
  background: #f7fbfd;
  overflow-y: auto;
  display: grid;
  gap: 10px;
}

.loading {
  font-size: 13px;
  color: rgba(12, 100, 120, 0.8);
}

.chat-input {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid rgba(12, 100, 120, 0.1);
  background: #fff;
}

.chat-input input {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(12, 100, 120, 0.16);
  font: inherit;
}

.chat-input input:focus {
  outline: none;
  border-color: #09d1c7;
  box-shadow: 0 0 0 3px rgba(9, 209, 199, 0.18);
}

.send-btn {
  padding: 0 16px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(120deg, #09d1c7 0%, #46dfb1 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .chat-window {
    width: 94vw;
    height: 70vh;
  }
}
</style>
