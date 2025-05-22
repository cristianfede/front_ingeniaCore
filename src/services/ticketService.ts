// src/services/ticketService.ts

// Define la URL base de tu API
const API_BASE_URL = 'http://localhost:3333' // URL base original (sin /api)

// Interfaz para los datos de un ticket (al crear o actualizar)
interface TicketData {
  titulo: string;
  descripcion: string;
  estado_id: number | null;
  prioridad_id: number | null;
  cliente_id: number | null;
  usuario_asignado_id: number | null;
  categoria_id: number | null;
  servicio_id: number | null;
  // fecha_asignacion: string; // Si esta columna no existe en tu DB, puedes quitarla o hacerla opcional
}

/**
 * Crea un nuevo ticket en la base de datos.
 * @param ticketData Los datos del ticket a crear (ahora espera FormData para archivos).
 * @returns El ticket creado con su ID y otras propiedades.
 */
export async function crearTicket(ticketData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      body: ticketData, // Envía FormData directamente
      // No se establece 'Content-Type' aquí, el navegador lo hace automáticamente para FormData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al crear ticket')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en ticketService (crearTicket):', error)
    throw error
  }
}

/**
 * Obtiene todos los tickets de la base de datos.
 * @returns Un array de objetos ticket.
 */
export async function obtenerTickets() {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al obtener tickets')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en ticketService (obtenerTickets):', error)
    throw error
  }
}

/**
 * Actualiza un ticket existente por su ID.
 * @param id El ID del ticket a actualizar.
 * @param ticketData Los datos parciales del ticket a actualizar (espera FormData para archivos).
 * @returns El ticket actualizado.
 */
export async function actualizarTicket(id: number, ticketData: FormData) {
  try {
    // Para enviar FormData con PUT/PATCH en AdonisJS, a menudo se usa un POST con _method=PUT
    const response = await fetch(`${API_BASE_URL}/tickets/${id}?_method=PUT`, {
      method: 'POST', // Método POST para enviar FormData con _method=PUT
      body: ticketData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al actualizar ticket')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en ticketService (actualizarTicket):', error)
    throw error
  }
}

/**
 * Elimina un ticket por su ID.
 * @param id El ID del ticket a eliminar.
 * @returns Un objeto de confirmación de eliminación (puede ser vacío o con un mensaje).
 */
export async function eliminarTicket(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.mensaje || 'Error al eliminar ticket')
    }

    return response.status === 204 ? {} : await response.json();
  } catch (error) {
    console.error('Error en ticketService (eliminarTicket):', error)
    throw error
  }
}

// --- Servicios adicionales para las listas de referencia (ejemplos) ---
// Asumo que estos endpoints existen y devuelven un array de objetos { id: number; nombre: string }

/**
 * Obtiene la lista de estados de tickets.
 */
export async function obtenerEstados() {
  try {
    const response = await fetch(`${API_BASE_URL}/estados`); // URL original sin /api
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al obtener estados');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerEstados):', error);
    throw error;
  }
}

/**
 * Obtiene la lista de prioridades de tickets.
 */
export async function obtenerPrioridades() {
    try {
        const response = await fetch(`${API_BASE_URL}/prioridades`); // URL original sin /api
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al obtener prioridades');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en ticketService (obtenerPrioridades):', error);
        throw error;
    }
}

/**
 * Obtiene la lista de clientes.
 */
export async function obtenerClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`); // URL original sin /api
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al obtener clientes');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en ticketService (obtenerClientes):', error);
        throw error;
    }
}

/**
 * Obtiene la lista de usuarios (para asignar tickets).
 */
export async function obtenerUsuariosAsignables() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios_asignables`); // URL original sin /api
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al obtener usuarios asignables');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en ticketService (obtenerUsuariosAsignables):', error);
        throw error;
    }
}

/**
 * Obtiene la lista de categorías de tickets.
 */
export async function obtenerCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`); // URL original sin /api
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al obtener categorías');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en ticketService (obtenerCategorias):', error);
        throw error;
    }
}

/**
 * Obtiene la lista de servicios.
 */
export async function obtenerServicios() {
    try {
        const response = await fetch(`${API_BASE_URL}/servicios`); // URL original sin /api
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al obtener servicios');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en ticketService (obtenerServicios):', error);
        throw error;
    }
}
