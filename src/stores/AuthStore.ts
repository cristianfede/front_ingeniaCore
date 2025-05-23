import router from '@/router'
import AuthService from '@/services/AuthService'
import { defineStore } from 'pinia'

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
        alert(login.errors[0].message)
        return false
      } else {
        const token = login.token
        this.token = token
        this.user = login.user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(login.user))

        router.push('/dashboard')
        return true
      }
    },

    logout() {
      this.user = null
      this.token = null

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
        } catch (error: any) {
          console.error(
            'checkAuth: Error al verificar autenticación:',
            error.response?.data?.message || error.message
          )
          this.logout()
        }
      } else if (this.token && this.user) {
        console.log('checkAuth: Usuario ya cargado en el store y token presente.')
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
  },
})
