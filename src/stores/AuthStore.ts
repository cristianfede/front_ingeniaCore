import router from '@/router'
import AuthService from '@/services/AuthService'
import { defineStore } from 'pinia'
// 1. Importa tus servicios de notificación
import { obtenerNotificaciones, marcarComoLeida } from '@/services/NotificacionService'

export const authSetStore = defineStore('auth', {
  state: () => {
    let user = null
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        user = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Error al parsear el usuario desde localStorage:', error)
    }

    return {
      user,
      token: localStorage.getItem('token') || null,
      // 2. Agrega el estado para las notificaciones
      notificaciones: [] as any[], // Un array para almacenar las notificaciones
      cantidadNoLeidas: 0, // Un contador para las notificaciones no leídas
    }
  },

  actions: {
    async login(userData: { email: string; password: string }): Promise<boolean> {
      const auth = new AuthService()
      const login = await auth.login(userData.email, userData.password)

      if (login.errors?.[0]) {
        alert(login.errors[0].message)
        return false
      } else {
        const token = login.token
        this.token = token
        this.user = login.user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(login.user))

        // Después de un login exitoso, carga las notificaciones
        await this.loadUserNotifications() // <--- **AQUÍ SE CARGAN LAS NOTIFICACIONES**

        router.push('/dashboard')
        return true
      }
    },

    logout() {
      this.user = null
      this.token = null
      // 3. Limpia también las notificaciones al cerrar sesión
      this.notificaciones = []
      this.cantidadNoLeidas = 0

      localStorage.removeItem('user')
      localStorage.removeItem('token')

      router.push('/login')
    },

    async checkAuth() {
      if (this.token && !this.user) {
        try {
          const authService = new AuthService()
          const response = await authService.me()

          if (response.user) {
            this.user = response.user
            localStorage.setItem('user', JSON.stringify(response.user))
            console.log('checkAuth: Usuario cargado desde API:', this.user)

            // Después de verificar la autenticación y cargar el usuario,
            // carga las notificaciones para este usuario.
            await this.loadUserNotifications() // <--- **AQUÍ SE CARGAN LAS NOTIFICACIONES**

            if (
              router.currentRoute.value.path === '/login' ||
              router.currentRoute.value.path === '/register'
            ) {
              router.push('/dashboard')
            }
          } else {
            console.error('checkAuth: No se pudo obtener la información del usuario o token inválido.')
            this.logout()
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(
              'checkAuth: Error al verificar autenticación:',
              (error as { response?: { data?: { message?: string } } })?.response?.data?.message || error.message
            )
          } else {
            console.error('checkAuth: Error desconocido:', error)
          }
          this.logout()
        }
      } else if (this.token && this.user) {
        console.log('checkAuth: Usuario ya cargado en el store y token presente.')
        // Si el usuario ya está cargado, podrías recargar las notificaciones aquí también
        // para asegurarte de que estén actualizadas si el store se ha mantenido en caché
        // o si simplemente quieres que se refresquen cuando el usuario está activo.
        await this.loadUserNotifications() // <--- **OPCIONAL: CARGAR NOTIFICACIONES AL REVISAR AUTH**

        if (
          router.currentRoute.value.path === '/login' ||
          router.currentRoute.value.path === '/register'
        ) {
          router.push('/dashboard')
        }
      } else {
        console.log('checkAuth: No hay token en localStorage, no se verifica autenticación.')
      }
    },

    // 4. Agrega esta nueva acción para cargar las notificaciones
    async loadUserNotifications() {
      if (!this.user?.id) {
        console.warn('Usuario ID no disponible para cargar notificaciones. No se cargarán.');
        return;
      }
      try {
        const userId = this.user.id;
        // Llama a tu servicio para obtener las notificaciones
        const data = await obtenerNotificaciones(userId);
        this.notificaciones = data;
        this.cantidadNoLeidas = data.filter((n: any) => !n.leido).length;
        console.log(`Notificaciones cargadas para el usuario ${userId}. No leídas: ${this.cantidadNoLeidas}`);
      } catch (err) {
        console.error('Error al cargar notificaciones en el store:', err);
        this.notificaciones = [];
        this.cantidadNoLeidas = 0;
      }
    },

    // 5. Agrega esta acción para marcar una notificación como leída y recargar
    async markNotificationAsRead(notificationId: number) {
      try {
        await marcarComoLeida(notificationId);
        await this.loadUserNotifications(); // Recarga las notificaciones para actualizar el estado en el UI
        console.log(`Notificación ${notificationId} marcada como leída y notificaciones recargadas.`);
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    },
  },
})