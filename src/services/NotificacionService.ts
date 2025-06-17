// src/services/notificacionService.ts

const BASE_URL = 'http://localhost:3333/api/notificaciones'

/**
 * Obtener las notificaciones de un usuario
 */
export async function obtenerNotificaciones(usuarioId: number) {
  const response = await fetch(`${BASE_URL}?usuarioId=${usuarioId}`)

  if (!response.ok) {
    throw new Error('Error al obtener notificaciones')
  }

  return await response.json()
}

/**
 * Marcar una notificación como leída
 */
export async function marcarComoLeida(id: number) {
  const response = await fetch(`${BASE_URL}/${id}/leida`, {
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error('Error al marcar notificación como leída')
  }

  return await response.json()
}