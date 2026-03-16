import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/free-play',
      name: 'free-play',
      component: () => import('@/views/FreePlayView.vue'),
    },
    {
      path: '/interval',
      name: 'interval',
      component: () => import('@/views/IntervalView.vue'),
    },
    {
      path: '/scale',
      name: 'scale',
      component: () => import('@/views/ScaleView.vue'),
    },
    {
      path: '/ear-training',
      name: 'ear-training',
      component: () => import('@/views/EarTrainingView.vue'),
    },
  ],
})

export default router
