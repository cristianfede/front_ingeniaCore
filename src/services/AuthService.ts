export default class AuthService {
  async login(correo: string, password: string) {
    const response = await fetch('http://localhost:3333/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ correo, password }),
    })

    return response.json()
  }
}
