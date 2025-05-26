// src/services/Roles_permisosService.ts

const API_URL = 'http://localhost:3333/api/permisos-gestion'; // Asegúrate que este prefijo coincida con tus rutas

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface Rol {
  id: number;
  nombre: string;
}

interface Permiso {
  id: number;
  nombre: string;
}

interface Item {
  id: number;
  nombre: string;
}

interface AsignacionPermiso {
  rolId: number;
  permisoId: number;
  itemId: number;
  rol: Rol | null; // Puede ser null si no se precarga
  permiso: Permiso | null; // Puede ser null
  item: Item | null;       // Puede ser null
}

// Interfaz para el payload de creación de asignaciones (ahora coincide con el controlador)
export interface CreateAsignacionData {
  rolId: number;
  itemId?: number | null; // Opcional para permisos generales
  selectedPermisos: number[]; // Array de IDs de permisos
  selectedVistas: number[]; // Array de IDs de ítems (vistas)
}

async function handleResponse<T>(response: Response): Promise<T> { // Agregado <T> para tipado genérico
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en la solicitud a la API.');
  }
  return response.json();
}

const RolesPermisosService = {
  async getUsuarios(): Promise<Usuario[]> {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  async getRoles(): Promise<Rol[]> {
    try {
      const response = await fetch(`${API_URL}/roles`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  },

  async getPermisos(): Promise<Permiso[]> {
    try {
      const response = await fetch(`${API_URL}/permisos`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  },

  async getItems(): Promise<Item[]> {
    try {
      const response = await fetch(`${API_URL}/items`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al obtener ítems:', error);
      throw error;
    }
  },

  async getAsignaciones(): Promise<AsignacionPermiso[]> {
    try {
      const response = await fetch(`${API_URL}/asignaciones`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
      throw error;
    }
  },

  // Método para obtener asignaciones por rol (CORREGIDO LA URL AQUÍ)
  async getAsignacionesPorRol(rolId: number): Promise<AsignacionPermiso[]> {
    try {
      const response = await fetch(`${API_URL}/roles/${rolId}/asignaciones`); // <--- RUTA CORREGIDA
      return handleResponse(response);
    } catch (error) {
      console.error(`Error al cargar asignaciones para el rol ${rolId}:`, error);
      throw error;
    }
  },

  // createAsignacion ahora envía los arrays de permisos y vistas en un solo objeto
  async createAsignacion(data: CreateAsignacionData): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/asignaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al crear asignación de permisos:', error);
      throw error;
    }
  },

  // deleteAsignacion ahora espera los tres IDs para una eliminación específica
  async deleteAsignacion(rolId: number, permisoId: number, itemId: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/asignaciones/${rolId}/${permisoId}/${itemId}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error al eliminar asignación de permisos:', error);
      throw error;
    }
  }
};

export default RolesPermisosService;