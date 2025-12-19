import { defineStore } from 'pinia';
import { sendChatMessage } from '@/api/chat.api';

const FALLBACK = 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.';

export const useChatStore = defineStore('CHAT', {
  state: () => ({
    messages: [],
    loading: false,
    isOpen: false
  }),
  actions: {
    toggleChat() {
      this.isOpen = !this.isOpen;
    },
    resetChat() {
      this.messages = [];
      this.loading = false;
    },
    async sendMessage(message) {
      const text = (message || '').trim();
      if (!text || this.loading) return;

      this.messages.push({ role: 'user', text });
      this.loading = true;
      try {
        const res = await sendChatMessage(text);
        const reply = res?.reply || '';
        this.messages.push({ role: 'bot', text: reply || FALLBACK });
      } catch (err) {
        this.messages.push({ role: 'bot', text: FALLBACK });
      } finally {
        this.loading = false;
      }
    }
  }
});
