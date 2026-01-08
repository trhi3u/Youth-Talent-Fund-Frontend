import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/global.scss';
import { formatLocal } from '@/utils/date';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.config.globalProperties.$formatTime = (value, format = 'DD/MM/YYYY HH:mm') => formatLocal(value, format);
app.mount('#app');
