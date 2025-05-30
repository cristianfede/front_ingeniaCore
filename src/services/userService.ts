// src/services/userService.ts (o api.ts)

const API_BASE_URL = 'http://localhost:3333'

interface UsuarioData {
  nombre: string
  apellido: string
  telefono: string
  correo: string
  password: string
  // Asegúrate de que esta interfaz también incluya rolId
  rolId?: number | null // Es opcional si se envía o no, pero debe estar presente si se usa.
}

export async function crearUsuario(usuarioData: UsuarioData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, { // <-- ¡CAMBIO AQUÍ!
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al crear usuario')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en userService:', error)
    throw error
  }
}

export async function obtenerUsuarios() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios`) // <-- ¡CAMBIO AQUÍ!

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al obtener usuarios')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    throw error
  }
}

export async function actualizarUsuario(id: number, usuarioData: Partial<UsuarioData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, { // <-- ¡CAMBIO AQUÍ!
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al actualizar usuario')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw error
  }
}

export async function eliminarUsuario(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, { // <-- ¡CAMBIO AQUÍ!
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al eliminar usuario')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    throw error
  }
}