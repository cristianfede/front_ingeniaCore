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
import FormularioUsuarios from '@/views/FormularioUsuarios.vue'
import TicketsView from '../views/TicketsView.vue'
// import GestionClientes from '../views/FormularioEmpresasView.vue' // ¡ELIMINADA ESTA IMPORTACIÓN DUPLICADA!
import FormularioEmpresasView from '../views/FormularioEmpresasView.vue' // Mantenemos esta, que es la que se usa en la ruta
import FormulariosProyectos from '@/views/FormulariosProyectos.vue'
import FormularioRoles from "@/views/FormularioRolesView.vue"

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
      component: FormularioUsuarios,
      meta: { layout: 'MainLayout' },
    },

    {
      path: '/tickets', // <-- Nueva ruta
      name: 'tickets',
      component: TicketsView,
      meta: { layout: 'MainLayout' }, // <--- ¡AÑADIDO ESTO!
    },
    {
      path: '/formulario-empresas', // ¡RUTA Y NOMBRE ACTUALIZADOS!
      name: 'FormularioEmpresas',
      component: FormularioEmpresasView, // Usamos el nombre de importación directo
      meta: { layout: 'MainLayout', requiresAuth: true, userType: 'interno' }, // Protegida y solo para internos
    },
    {
      path: '/proyectos',
      name: 'FormulariosProyectos',
      component: FormulariosProyectos,
      meta: { layout: 'MainLayout' },
    },
     {
      path: '/Roles',
      name: 'FormularioRoles',
      component: FormularioRoles,
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
