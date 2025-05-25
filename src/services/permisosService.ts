// src/services/permisosService.ts

const BASE_URL_API = 'http://localhost:3333/api';

// Interfaz 'Rol'
export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz 'Item' (previamente Modulo)
export interface Item {
  id: number;
  nombre: string;
  url: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz 'Permiso'
export interface Permiso {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para el payload que se envía al asignar permisos
export interface CargaAsignacion {
  roleId: number;
  itemId: number;
  permisosIds: number[];
}

// Interfaz para una asignación existente (para la tabla), tal como viene del backend
// El backend nos devuelve cada permiso individualmente para cada Rol-Item.
// El frontend luego agrupará esto.
export interface AsignacionExistente {
  id: number; // ID de la entrada individual en role_module_permissions
  roleId: number;
  permissionId: number;
  itemId: number;
  createdAt: string;
  updatedAt: string;
  // Propiedades de relación para mostrar en la tabla (el backend las incluye)
  role?: Rol;
  item?: Item;
  permission?: Permiso;
}


/**
 * Función auxiliar para manejar las respuestas de 'fetch'.
 */
async function manejarRespuesta<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const datosError: any = await response.json().catch(() => ({ message: 'Error desconocido en la respuesta del servidor' }));
    const mensajeError: string = datosError.message || datosError.errors?.[0]?.message || 'Error en la petición al servidor';
    throw new Error(mensajeError);
  }
  return response.json() as Promise<T>;
}

const servicioPermisos = {
  async obtenerRoles(): Promise<Rol[]> {
    try {
      const respuesta = await fetch(`${BASE_URL_API}/roles`);
      return await manejarRespuesta<Rol[]>(respuesta);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  },

  async obtenerItems(): Promise<Item[]> {
    try {
      const respuesta = await fetch(`${BASE_URL_API}/items`);
      return await manejarRespuesta<Item[]>(respuesta);
    } catch (error) {
      console.error('Error al obtener ítems:', error);
      throw error;
    }
  },

  async obtenerPermisos(): Promise<Permiso[]> {
    try {
      const respuesta = await fetch(`${BASE_URL_API}/permissions`);
      return await manejarRespuesta<Permiso[]>(respuesta);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  },

  async asignarPermisosRolItem(datos: CargaAsignacion): Promise<{ message: string }> {
    try {
      const respuesta = await fetch(`${BASE_URL_API}/assign-role-module-permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });
      return await manejarRespuesta<{ message: string }>(respuesta);
    } catch (error) {
      console.error('Error al asignar permisos:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las asignaciones existentes.
   * El backend debe precargar las relaciones (rol, item, permission)
   */
  async obtenerAsignaciones(): Promise<AsignacionExistente[]> {
    try {
      const respuesta = await fetch(`${BASE_URL_API}/assignments`);
      return await manejarRespuesta<AsignacionExistente[]>(respuesta);
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      throw error;
    }
  },

  /**
   * Nuevo método para eliminar todas las asignaciones de permisos para un rol y un ítem específicos.
   * @param roleId El ID del rol.
   * @param itemId El ID del ítem.
   * @returns {Promise<{ message: string }>} Mensaje de confirmación.
   */
  async eliminarAsignacionPorRolItem(roleId: number, itemId: number): Promise<{ message: string }> {
    try {
      const respuesta = await fetch(`${BASE_URL_API}/assignments/${roleId}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await manejarRespuesta<{ message: string }>(respuesta);
    } catch (error) {
      console.error(`Error al eliminar asignaciones para Rol ${roleId} e Ítem ${itemId}:`, error);
      throw error;
    }
  }
};

export default servicioPermisos;
