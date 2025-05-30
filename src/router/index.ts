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
import FormularioEmpresasView from '../views/FormularioEmpresasView.vue'
import FormulariosProyectos from '@/views/FormulariosProyectos.vue'
// Importa ambos componentes de roles
import FormularioRolesView from '@/views/FormularioRolesView.vue' // Tu componente original
import CreacionRoles from "@/views/CreacionRoles.vue"           // Tu nuevo componente CRUD de roles

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
      path: '/Usuarios',
      component: FormularioUsuarios,
      meta: { layout: 'MainLayout' },
    },

    {
      path: '/tickets',
      name: 'tickets',
      component: TicketsView,
      meta: { layout: 'MainLayout' },
    },
    {
      path: '/formulario-empresas',
      name: 'FormularioEmpresas',
      component: FormularioEmpresasView,
      meta: { layout: 'MainLayout', requiresAuth: true, userType: 'interno' },
    },
    {
      path: '/proyectos',
      name: 'FormulariosProyectos',
      component: FormulariosProyectos,
      meta: { layout: 'MainLayout' },
    },
    // ====================================================================
    // RUTAS PARA ROLES (AHORA SEPARADAS)
    // ====================================================================
    {
      // Ruta para tu vista original de "Formularios Roles"
      path: '/Roles', // Mantiene la ruta original con 'R' mayúscula
      name: 'FormularioRoles',
      component: FormularioRolesView, // Apunta al componente original
      meta: { layout: 'MainLayout' },
    },
    {
      // Ruta para el CRUD de Roles (la vista que creamos)
      path: '/roles-crud', // ¡NUEVA RUTA ÚNICA para el CRUD de Roles!
      name: 'RolesCrudList', // Nombre para la lista de roles del CRUD
      component: CreacionRoles, // Apunta a tu nuevo componente CRUD
      meta: { layout: 'MainLayout' },
    },
    {
      // Ruta para la edición del CRUD de Roles
      path: '/roles-crud/editar/:id', // Ruta para editar un rol específico del CRUD
      name: 'RolesCrudEdit', // Nombre para la edición de roles del CRUD
      component: CreacionRoles, // Reutiliza el mismo componente CRUD
      props: true, // Pasa el ':id' de la ruta como una prop al componente
      meta: { layout: 'MainLayout' },
    },
    // ====================================================================

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