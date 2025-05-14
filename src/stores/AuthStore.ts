import router from '@/router'
import AuthService from '@/services/AuthService'
import { defineStore } from 'pinia'
//import { router } from '@/router'

export const authSetStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'), //toDo:Se puede reventar al proteger las rutas por el NULL porque no es un JSON string válido
    token: localStorage.getItem('token') || null,
  }),

  actions: {
    async login(userData: { email: string; password: string }): Promise<boolean> {
      const auth = new AuthService()
      const login = await auth.login(userData.email, userData.password)

      if (login.errors?.[0]) {
        /*login.JSON({"message": "credenciales invalidas"})*/
        alert(login.errors[0].message)
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
      //this.token = null

      //elimina
      localStorage.removeItem('user')
      localStorage.removeItem('token')

      router.push('/login')
    },
  },
})
