import { createRouter, createWebHistory } from 'vue-router'
import { authSetStore } from '@/stores/AuthStore'

import LoginView from '@/views/LoginView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import RegisterView from '@/views/RegisterView.vue'
import NewPasswordView from '@/views/NewPasswordView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import SettingsView from '@/views/dashboard/SettingsView.vue'
import ProfileView from '@/views/dashboard/ProfileView.vue'
import HomeView from '@/views/HomeView.vue'
import CrudView from '@/views/CrudView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/login',
      component: LoginView,
      meta: { layout: 'AuthLayout' },
    },

    {
      path: '/reset-password',
      component: ResetPasswordView,
      meta: { layout: 'AuthLayout' },
    },

    {
      path: '/register',
      component: RegisterView,
      meta: { layout: 'AuthLayout' },
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { layout: 'MainLayout', requiresAuth: true },
    },

    {
      path: '/settings',
      component: SettingsView,
      meta: { layout: 'MainLayout' },
    },

    {
      path: '/profile',
      component: ProfileView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/crud',
      component: CrudView,
      meta: { layout: 'MainLayout' },
    },

    { path: '/new-password', component: NewPasswordView, meta: { layout: 'AuthLayout' } },
  ],
})

router.beforeEach((to, from, next) => {
  const store = authSetStore()
  const isAuthenticated = !!store.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
export default router
