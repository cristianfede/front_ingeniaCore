const API_URL = 'http://localhost:3000/api/permisos' // Ajusta según tu backend

// Obtener todos los permisos
export async function obtenerPermisos() {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`Error al obtener permisos: ${response.statusText}`)
    }

    const data = await response.json()
    return data // Se espera un array tipo: [{ id: 1, nombre: 'crear_usuario' }, ...]
  } catch (error) {
    console.error('Error en permisosService:', error)
    throw error
  }
}
