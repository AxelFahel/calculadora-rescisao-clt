import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/calculo/novo',
      name: 'novo-calculo',
      component: () => import('../views/NewCalculationView.vue'),
    },
    {
      path: '/calculo/resultado',
      name: 'resultado',
      component: () => import('../views/ResultView.vue'),
    },
    {
      path: '/historico',
      name: 'historico',
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
