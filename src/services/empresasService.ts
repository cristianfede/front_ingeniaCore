const API_BASE_URL = 'http://localhost:3333/api'

interface EmpresaData {
  nombre: string
  nit: string
  correo: string
  telefono: string
}

export async function crearEmpresa(empresaData: EmpresaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al crear empresa')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al crear empresa:', error)
    throw error
  }
}

export async function obtenerEmpresas() {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al obtener empresas')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al obtener empresas:', error)
    throw error
  }
}

export async function actualizarEmpresa(id: number, empresaData: Partial<EmpresaData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al actualizar empresa')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al actualizar empresa:', error)
    throw error
  }
}

export async function eliminarEmpresa(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al eliminar empresa')
    }

    return await response.json()
  } catch (error) {
    console.error('Error al eliminar empresa:', error)
    throw error
  }
}

