export default class AuthService {
  async login(correo: string, password: string) {
    try {
      const response = await fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en la autenticación')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        return { errors: [{ message: error.message }] }
      }
      return { errors: [{ message: 'Error desconocido' }] }
    }
  }
}
