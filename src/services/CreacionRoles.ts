// src/services/CreacionRoles.ts

import axios from 'axios'

// Define la URL base de tu API de AdonisJS para roles
const API_URL = 'http://localhost:3333/api/roles'

// Define la interfaz para la estructura de un rol
export interface Rol {
  id: number
  nombre: string
  descripcion?: string | null // Puede ser nulo
  estado: 'activo' | 'inactivo'
  createdAt?: string
  updatedAt?: string
}

// Define un tipo para los datos que se pueden enviar al actualizar (pueden ser parciales)
type RolUpdateData = {
  nombre?: string
  descripcion?: string | null
  estado?: 'activo' | 'inactivo'
}

/**
 * Obtiene todos los roles (activos e inactivos) desde la API.
 * Corresponde a GET /api/roles
 */
export async function obtenerRoles(): Promise<Rol[]> {
  try {
    const response = await axios.get<Rol[]>(API_URL)
    return response.data
  } catch (error) {
    console.error('Error al obtener roles:', error)
    throw error // Propaga el error para que el componente lo maneje
  }
}

/**
 * Crea un nuevo rol.
 * Corresponde a POST /api/roles
 */
export async function crearRol(rolData: { nombre: string; descripcion?: string | null; estado?: 'activo' | 'inactivo' }): Promise<Rol> {
  try {
    const response = await axios.post<Rol>(API_URL, rolData)
    return response.data
  } catch (error) {
    console.error('Error al crear rol:', error)
    throw error
  }
}

/**
 * Actualiza un rol existente.
 * Corresponde a PUT/PATCH /api/roles/:id
 */
export async function actualizarRol(id: number, rolData: RolUpdateData): Promise<Rol> {
  try {
    const response = await axios.put<Rol>(`${API_URL}/${id}`, rolData) // Usamos PUT para la actualización
    return response.data
  } catch (error) {
    console.error(`Error al actualizar rol con ID ${id}:`, error)
    throw error
  }
}

/**
 * Elimina un rol de forma PERMANENTE de la base de datos.
 * Corresponde a DELETE /api/roles/force/:id
 */
export async function eliminarRolPermanentemente(id: number): Promise<void> {
  try {
    // Nota la nueva ruta 'force' que definimos en el backend
    await axios.delete(`${API_URL}/force/${id}`)
    // No esperamos una respuesta con contenido (204 No Content)
  } catch (error) {
    console.error(`Error al eliminar rol permanentemente con ID ${id}:`, error)
    throw error
  }
}
