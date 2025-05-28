// src/services/PermisosService.ts

const PERMISOS_API_URL = 'http://localhost:3333/api/permisos'; // ¡Asegúrate que este prefijo coincida con tus rutas de AdonisJS!

interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string; // Opcional, si tu modelo lo tiene
  createdAt?: string;
  updatedAt?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error en la solicitud a la API: ${response.statusText}`);
  }
  if (response.status === 204) {
    return null as T; // No content for DELETE operations
  }
  return response.json();
}

const PermisosService = {
  async getPermisos(): Promise<Permiso[]> {
    try {
      const response = await fetch(PERMISOS_API_URL);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  },

  async getPermisoById(id: number): Promise<Permiso> {
    try {
      const response = await fetch(`${PERMISOS_API_URL}/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener permiso ${id}:`, error);
      throw error;
    }
  },

  async createPermiso(nombre: string, descripcion?: string): Promise<Permiso> {
    try {
      const response = await fetch(PERMISOS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear permiso:', error);
      throw error;
    }
  },

  async updatePermiso(id: number, nombre: string, descripcion?: string): Promise<Permiso> {
    try {
      const response = await fetch(`${PERMISOS_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
      throw error;
    }
  },

  async deletePermiso(id: number): Promise<void> {
    try {
      const response = await fetch(`${PERMISOS_API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al eliminar permiso: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al eliminar permiso:', error);
      throw error;
    }
  },
};

export default PermisosService;
export type { Permiso };