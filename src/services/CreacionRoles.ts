// src/services/CreacionRoles.ts

// No es necesario importar axios si solo usas fetch

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
 * Función auxiliar para manejar respuestas de fetch
 * Lanza un error estructurado si la respuesta no es OK (status 2xx)
 */
async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any = {};
    let errorMessage: string = '';

    try {
      // Intentar parsear el error como JSON
      // Esto es crucial para errores 422 de AdonisJS/VineJS que devuelven JSON
      errorData = await response.json();
      errorMessage = errorData.message || 'Error del servidor.'; // Intenta obtener un mensaje general si existe
    } catch (e) {
      // Si no es JSON o hay un error al parsear, obtener el texto o un mensaje genérico
      errorMessage = await response.text();
      if (!errorMessage) {
        errorMessage = `Error de red o respuesta no JSON. Estado: ${response.status} ${response.statusText}`;
      }
    }

    // 🚀 CORRECCIÓN CLAVE: Lanza un objeto que imita la estructura de error de Axios
    // para que el componente Vue pueda acceder a 'error.response.status' y 'error.response.data.errors'
    const customError: any = {
      response: {
        status: response.status,
        statusText: response.statusText,
        data: errorData, // Esto contendrá el { errors: [...] } de VineJS para 422
      },
      message: errorMessage, // Un mensaje de error general para el snackbar
    };
    throw customError;
  }

  // Si la respuesta es 204 No Content, response.json() fallará.
  // Es mejor verificar si hay contenido antes de intentar parsear.
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  // Si no es JSON (ej. 204 No Content), devolvemos un objeto vacío
  return {} as T;
}


/**
 * Obtiene todos los roles (activos e inactivos) desde la API.
 * Corresponde a GET /api/roles
 */
export async function obtenerRoles(): Promise<Rol[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET', // Método HTTP GET
      headers: {
        'Content-Type': 'application/json',
        // Si usas token de autenticación, añádelo aquí:
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return await handleFetchResponse<Rol[]>(response);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    // Propaga el error estructurado
    throw error;
  }
}

/**
 * Crea un nuevo rol.
 * Corresponde a POST /api/roles
 */
export async function crearRol(rolData: { nombre: string; descripcion?: string | null; estado?: 'activo' | 'inactivo' }): Promise<Rol> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST', // Método HTTP POST
      headers: {
        'Content-Type': 'application/json', // Importante para enviar JSON
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(rolData), // Convierte el objeto a string JSON
    })
    return await handleFetchResponse<Rol>(response);
  } catch (error) {
    console.error('Error al crear rol:', error);
    // Propaga el error estructurado
    throw error;
  }
}

/**
 * Actualiza un rol existente.
 * Corresponde a PUT/PATCH /api/roles/:id
 */
export async function actualizarRol(id: number, rolData: RolUpdateData): Promise<Rol> {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT', // O 'PATCH' si tu API espera PATCH para actualizaciones parciales
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(rolData),
    })
    return await handleFetchResponse<Rol>(response);
  } catch (error) {
    console.error(`Error al actualizar rol con ID ${id}:`, error);
    // Propaga el error estructurado
    throw error;
  }
}

/**
 * Elimina un rol de forma PERMANENTE de la base de datos.
 * Corresponde a DELETE /api/roles/:id/permanente
 */
export async function eliminarRolPermanentemente(id: number): Promise<void> {
  try {
    // La URL ahora coincide con la ruta en AdonisJS: /api/roles/:id/permanente
    const response = await fetch(`${API_URL}/${id}/permanente`, {
      method: 'DELETE', // Método HTTP DELETE
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    // Para DELETE que devuelve 204 No Content, no intentamos parsear JSON del cuerpo
    // Solo necesitamos verificar si la respuesta fue exitosa y lanzar el error estructurado si no lo fue.
    if (!response.ok) {
        let errorData: any = {};
        let errorMessage: string = '';
        try {
            errorData = await response.json();
            errorMessage = errorData.message || 'Error del servidor.';
        } catch (e) {
            errorMessage = await response.text();
            if (!errorMessage) {
              errorMessage = `Error de red o respuesta no JSON. Estado: ${response.status} ${response.statusText}`;
            }
        }
        throw {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          },
          message: errorMessage,
        };
    }
    // Si llegamos aquí, la eliminación fue exitosa (ej. 204 No Content)
    return; // No hay datos que devolver para una eliminación 204
  } catch (error) {
    console.error(`Error al eliminar rol permanentemente con ID ${id}:`, error);
    // Propaga el error estructurado
    throw error;
  }
}

// NOTA IMPORTANTE: La lógica actual de tu componente Vue usa `actualizarRol`
// para cambiar el estado a 'inactivo' o 'activo'. Estas funciones comentadas
// son ejemplos si decidieras tener rutas y métodos PATCH dedicados en tu API
// para inactivar/activar, en lugar de un PUT general de actualización.
/*
export async function inactivarRol(id: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/${id}/inactivar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            let errorData: any = {};
            let errorMessage: string = '';
            try {
                errorData = await response.json();
                errorMessage = errorData.message || 'Error del servidor.';
            } catch (e) {
                errorMessage = await response.text();
                if (!errorMessage) {
                  errorMessage = `Error de red o respuesta no JSON. Estado: ${response.status} ${response.statusText}`;
                }
            }
            throw {
              response: {
                status: response.status,
                statusText: response.statusText,
                data: errorData,
              },
              message: errorMessage,
            };
        }
    } catch (error) {
        console.error(`Error al inactivar rol con ID ${id}:`, error);
        throw error;
    }
}

export async function activarRol(id: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/${id}/activar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            let errorData: any = {};
            let errorMessage: string = '';
            try {
                errorData = await response.json();
                errorMessage = errorData.message || 'Error del servidor.';
            } catch (e) {
                errorMessage = await response.text();
                if (!errorMessage) {
                  errorMessage = `Error de red o respuesta no JSON. Estado: ${response.status} ${response.statusText}`;
                }
            }
            throw {
              response: {
                status: response.status,
                statusText: response.statusText,
                data: errorData,
              },
              message: errorMessage,
            };
        }
    } catch (error) {
        console.error(`Error al activar rol con ID ${id}:`, error);
        throw error;
    }
}
*/