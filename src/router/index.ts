import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePageView.vue'),
      meta: { public: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true }
    },
    {
      path: '/recruitment',
      name: 'recruitment',
      component: () => import('@/views/RecruitmentView.vue'),
      meta: { public: true }
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/NewsView.vue'),
      meta: { public: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/accounting',
      name: 'accounting',
      component: () => import('@/views/AccountingView.vue'),
      meta: { 
        requiresAuth: true,
        requiresPermission: 'accounting'
      }
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import('@/views/EmployeesView.vue'),
      meta: { 
        requiresAuth: true,
        requiresPermission: 'accounting'
      }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/TransactionsView.vue'),
      meta: { 
        requiresAuth: true,
        requiresPermission: 'accounting'
      }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Vérifier l'authentification au démarrage
  if (!authStore.user) {
    await authStore.checkAuth()
  }

  // Routes publiques
  if (to.meta.public) {
    return next()
  }

  // Routes nécessitant une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Routes nécessitant des permissions spécifiques
  if (to.meta.requiresPermission) {
    const permission = to.meta.requiresPermission as string
    
    if (permission === 'accounting' && !authStore.canAccessAccounting) {
      return next('/dashboard')
    }
  }

  next()
})

export default router
