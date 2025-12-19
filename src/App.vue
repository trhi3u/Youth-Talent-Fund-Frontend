<template>
  <div class="app-shell">
    <CommonHeader />
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </main>
    <CommonFooter />
    <ChatbotWidget />
  </div>
</template>

<script setup>
import CommonHeader from './components/common/Header.vue';
import CommonFooter from './components/common/Footer.vue';
import ChatbotWidget from './components/chatbot/ChatbotWidget.vue';
import { useRoute } from 'vue-router';


const route = useRoute();
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbfffc;
  color: #0c6478;
}

.app-main {
  flex: 1;
}

.view-fallback {
  min-height: 40vh;
  display: grid;
  place-items: center;
  gap: 10px;
  color: rgba(12, 100, 120, 0.8);
}

.spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(12, 100, 120, 0.15);
  border-top-color: #09d1c7;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
