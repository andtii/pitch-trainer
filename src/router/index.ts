import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/stability',
      name: 'stability',
      component: () => import('@/views/StabilityView.vue'),
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
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  // Lazy-load the settings store without Pinia context issues
  const stored = localStorage.getItem('pitchtrainer-settings')
  let hasOnboarded = false
  if (stored) {
    try {
      hasOnboarded = JSON.parse(stored).hasCompletedOnboarding === true
    } catch {}
  }
  if (!hasOnboarded && to.name !== 'onboarding') {
    return { name: 'onboarding' }
  }
})

export default router
