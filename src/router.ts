import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import GameView from './views/GameView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'game', component: GameView },
  { path: '/custom', name: 'custom', component: () => import('./views/CustomView.vue') },
  { path: '/settings', name: 'settings', component: () => import('./views/SettingsView.vue') },
  { path: '/impressum', name: 'impressum', component: () => import('./views/ImpressumView.vue') },
  { path: '/privacy', name: 'privacy', component: () => import('./views/PrivacyView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
