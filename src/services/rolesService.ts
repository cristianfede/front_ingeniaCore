const API_BASE_URL = 'http://localhost:3333/api'

interface RolData {
  nombre: string
  descripcion: string
  estado: string
}

export async function obtenerRoles() {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al obtener roles')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al obtener roles:', error)
    throw error
  }
}

export async function crearRol(rolData: RolData) {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rolData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al crear rol')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al crear rol:', error)
    throw error
  }
}

export async function actualizarRol(id: number, rolData: Partial<RolData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rolData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al actualizar rol')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al actualizar rol:', error)
    throw error
  }
}

export async function eliminarRol(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al eliminar rol')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al eliminar rol:', error)
    throw error
  }
}
