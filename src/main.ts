import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from './i18n.js';
import { router } from './router.js';
import './styles/main.css';

createApp(App).use(router).use(i18n).mount('#app');
