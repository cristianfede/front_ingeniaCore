const BASE_URL = 'http://localhost:3333';

export default {
  async obtenerRoles() {
    const res = await fetch(`${BASE_URL}/roles`);
    if (!res.ok) throw new Error('Error al obtener roles');
    return await res.json();
  },

  async obtenerItems() {
    const res = await fetch(`${BASE_URL}/items`);
    if (!res.ok) throw new Error('Error al obtener ítems');
    return await res.json();
  },

  async obtenerPermisos() {
    const res = await fetch(`${BASE_URL}/permisos`);
    if (!res.ok) throw new Error('Error al obtener permisos');
    return await res.json();
  },

  async obtenerAsignaciones() {
    const res = await fetch(`${BASE_URL}/asignaciones`);
    if (!res.ok) throw new Error('Error al obtener asignaciones');
    return await res.json();
  },

  async asignarPermisosRolItem(data: { roleId: number, itemId: number, permisosIds: number[] }) {
    const res = await fetch(`${BASE_URL}/asignaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rolId: data.roleId,
        itemId: data.itemId,
        permisosIds: data.permisosIds
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al asignar permisos');
    }

    return await res.json();
  },

  // Nueva función para actualizar permisos
async actualizarPermisosRolItem(data: { rolId: number, itemId: number, permisosIds: number[] }) {
  const res = await fetch(`${BASE_URL}/asignaciones/actualizar-por-rol-item`, { // Nueva ruta
    method: 'PUT', // O PATCH, dependiendo de tu convención
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al actualizar permisos');
  }

  return await res.json();
},

  async eliminarAsignacion(asignacionId: number) {
  const res = await fetch(`${BASE_URL}/asignaciones/${asignacionId}`, {
    method: 'DELETE',
  });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al eliminar asignación');
    }

    return await res.json();
  },
};
