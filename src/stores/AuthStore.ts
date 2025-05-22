import router from '@/router'
import AuthService from '@/services/AuthService' // Asegúrate de que AuthService tenga un método 'me()'
import { defineStore } from 'pinia'
//import { router } from '@/router' // Esta línea está comentada, no la modifico

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
    }
  },

  actions: {
    async login(userData: { email: string; password: string }): Promise<boolean> {
      const auth = new AuthService()
      const login = await auth.login(userData.email, userData.password)

      if (login.errors?.[0]) {
        /*login.JSON({"message": "credenciales invalidas"})*/
        alert(login.errors[0].message) // ¡IMPORTANTE! Considera reemplazar alert() con un snackbar de Vuetify
        return false
      } else {
        const token = login.token
        //Actualizar
        this.token = token
        this.user = login.user

        //Almacenar
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(login.user))

        router.push('/dashboard')
        return true
      }
    },

    logout() {
      //restablece
      this.user = null
      this.token = null

      //elimina
      localStorage.removeItem('user')
      localStorage.removeItem('token')

      router.push('/login')
    },

    // --- NUEVA ACCIÓN AGREGADA: checkAuth ---
    async checkAuth() {
      // Solo intenta cargar si hay un token y el usuario no está ya cargado en el store
      if (this.token && !this.user) {
        try {
          const authService = new AuthService();
          const response = await authService.me(); // Asume que AuthService tiene un método 'me()'
          
          if (response.user) {
            this.user = response.user;
            localStorage.setItem('user', JSON.stringify(response.user));
            console.log('checkAuth: Usuario cargado desde API:', this.user);

            // Redirige si el usuario está autenticado y en la página de login/registro
            if (router.currentRoute.value.path === '/login' || router.currentRoute.value.path === '/register') {
                // Puedes refinar esta lógica de redirección si tienes diferentes dashboards
                // para 'interno' y 'externo' como habíamos discutido antes.
                // Por ahora, redirige a /dashboard si está en login/register
                router.push('/dashboard');
            }
          } else {
            // Si la API no devuelve usuario, o el token es inválido/expirado
            console.error('checkAuth: No se pudo obtener la información del usuario o token inválido.');
            this.logout(); // Cierra la sesión si el token no es válido
          }
        } catch (error: any) {
          console.error('checkAuth: Error al verificar autenticación:', error.response?.data?.message || error.message);
          this.logout(); // Cierra la sesión en caso de error de la API
        }
      } else if (this.token && this.user) {
        console.log('checkAuth: Usuario ya cargado en el store y token presente.');
        // Si el usuario ya está cargado y está en login/register, redirige
        if (router.currentRoute.value.path === '/login' || router.currentRoute.value.path === '/register') {
          router.push('/dashboard');
        }
      } else {
        console.log('checkAuth: No hay token en localStorage, no se verifica autenticación.');
      }
    },
    // --- FIN DE NUEVA ACCIÓN AGREGADA ---
  },
})
