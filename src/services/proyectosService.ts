// src/services/proyectoService.ts

const API_BASE_URL = 'http://localhost:3333/api' // Cambia por tu URL base si es necesario

/**
 * Obtiene todos los proyectos.
 * @returns Un array con los proyectos.
 */
export async function obtenerProyectos() {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al obtener proyectos')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en proyectoService (obtenerProyectos):', error)
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
    console.error('Error en proyectoService (obtenerEmpresas):', error)
    throw error
  }
}


/**
 * Crea un nuevo proyecto.
 * @param proyectoData Un objeto con los datos del proyecto a crear.
 * @returns El proyecto creado.
 */
export async function crearProyecto(proyectoData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos`, {
      method: 'POST',
      body: proyectoData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al crear proyecto')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en proyectoService (crearProyecto):', error)
    throw error
  }
}

/**
 * Actualiza un proyecto existente por ID.
 * @param id El ID del proyecto a actualizar.
 * @param proyectoData Datos actualizados en FormData.
 * @returns El proyecto actualizado.
 */
export async function actualizarProyecto(id: number, proyectoData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${id}?_method=PUT`, {
      method: 'POST', // Usar POST con _method=PUT para FormData
      body: proyectoData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al actualizar proyecto')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en proyectoService (actualizarProyecto):', error)
    throw error
  }
}

/**
 * Elimina un proyecto por su ID.
 * @param id El ID del proyecto a eliminar.
 * @returns Confirmación de eliminación.
 */
export async function eliminarProyecto(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al eliminar proyecto')
    }

    return response.status === 204 ? {} : await response.json()
  } catch (error) {
    console.error('Error en proyectoService (eliminarProyecto):', error)
    throw error
  }
}

// export async function obtenerProyectos() {
//   const response = await fetch(`${API_BASE_URL}/proyectos`)
//   if (!response.ok) throw new Error('Error al obtener proyectos')
//   return await response.json()
// }

// export async function obtenerEmpresas() {
//   try {
//     const response = await fetch(`${API_BASE_URL}/empresas`)

//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.mensaje || 'Error al obtener empresas')
//     }

//     return await response.json()
//   } catch (error) {
//     console.error('Error al obtener empresas:', error)
//     throw error
//   }
// }
