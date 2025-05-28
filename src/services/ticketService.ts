// src/services/ticketService.ts

// Define la URL base de tu API
// Es crucial que esta URL coincida con el prefijo de tus rutas en AdonisJS (generalmente /api)
const API_BASE_URL = 'http://localhost:3333/api';

// Interfaz para los datos de un ticket (al crear o actualizar)
interface TicketData {
  titulo: string;
  descripcion: string;
  estado_id: number | null;
  prioridad_id: number | null;
  cliente_id: number | null; // Este será el ID de la Empresa
  usuario_asignado_id: number | null; // Este será el ID del Técnico
  categoria_id: number | null;
  servicio_id: number | null;
  // Si 'fecha_asignacion' es parte de tu DB y la quieres manejar, agrégala aquí.
  // Por ahora la dejamos comentada como en tu original.
  // fecha_asignacion: string;
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
    });

    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al crear ticket';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (crearTicket):', error);
    throw error;
  }
}

/**
 * Obtiene todos los tickets de la base de datos.
 * @returns Un array de objetos ticket.
 */
export async function obtenerTickets() {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`);

    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al obtener tickets';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerTickets):', error);
    throw error;
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
    // Esto es necesario porque FormData no funciona directamente con PUT/PATCH en todas las implementaciones.
    const response = await fetch(`${API_BASE_URL}/tickets/${id}?_method=PUT`, {
      method: 'POST', // Método POST para enviar FormData con _method=PUT
      body: ticketData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al actualizar ticket';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (actualizarTicket):', error);
    throw error;
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
    });

    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al eliminar ticket';
      throw new Error(errorMessage);
    }

    // Si la respuesta es 204 No Content, no intentamos parsear JSON
    return response.status === 204 ? {} : await response.json();
  } catch (error) {
    console.error('Error en ticketService (eliminarTicket):', error);
    throw error;
  }
}

// --- Servicios adicionales para las listas de referencia ---
// Asumo que estos endpoints existen y devuelven un array de objetos con 'id' y 'nombre' (o 'nombre' y 'apellido' para usuarios)

/**
 * Obtiene la lista de estados de tickets desde la tabla 'estado_tickets'.
 */
export async function obtenerEstados() {
  try {
    // Endpoint para la tabla estado_tickets
    const response = await fetch(`${API_BASE_URL}/estados`); // Asumo que la ruta es /api/estados
    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al obtener estados de tickets';
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerEstados):', error);
    throw error;
  }
}

/**
 * Obtiene la lista de prioridades de tickets desde la tabla 'prioridades'.
 */
export async function obtenerPrioridades() {
  try {
    // Endpoint para la tabla prioridades
    const response = await fetch(`${API_BASE_URL}/prioridades`);
    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al obtener prioridades';
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerPrioridades):', error);
    throw error;
  }
}

/**
 * Obtiene la lista de EMPRESAS desde la tabla 'empresas'.
 */
export async function obtenerEmpresas() {
  try {
    // Endpoint para la tabla empresas
    const response = await fetch(`${API_BASE_URL}/empresas`);
    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al obtener empresas';
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerEmpresas):', error);
    throw error;
  }
}

/**
 * Obtiene la lista de USUARIOS (para asignar tickets).
 * Para filtrar por rol (ej. 'Técnico de soporte'), la forma más eficiente es que el backend
 * proporcione un endpoint específico para ello, o que el endpoint general de usuarios
 * incluya la información del rol para que el frontend pueda filtrar.
 *
 * Por ahora, mantendremos la llamada a `/usuarios` general, y el filtro se hará en el frontend
 * como lo tienes en el componente Vue. Si tu backend tiene un endpoint como `/usuarios/tecnicos`,
 * cámbialo aquí.
 */
export async function obtenerUsuariosAsignables() {
  try {
    // Endpoint para la tabla usuarios.
    // Si tienes una ruta específica para técnicos, cámbiala aquí (ej. /usuarios/tecnicos)
    const response = await fetch(`${API_BASE_URL}/usuarios`);
    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al obtener usuarios asignables';
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerUsuariosAsignables):', error);
    throw error;
  }
}

/**
 * Obtiene la lista de categorías de tickets desde la tabla 'categorias'.
 */
export async function obtenerCategorias() {
  try {
    // Endpoint para la tabla categorias
    const response = await fetch(`${API_BASE_URL}/categorias`);
    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al obtener categorías';
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerCategorias):', error);
    throw error;
  }
}

/**
 * Obtiene la lista de servicios desde la tabla 'servicios'.
 */
export async function obtenerServicios() {
  try {
    // Endpoint para la tabla servicios
    const response = await fetch(`${API_BASE_URL}/servicios`);
    if (!response.ok) {
      const errorData = await response.json();
      // CORRECCIÓN: Intenta obtener el mensaje de error de 'message', 'error' o 'mensaje'
      const errorMessage = errorData.message || errorData.error || errorData.mensaje || 'Error al obtener servicios';
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en ticketService (obtenerServicios):', error);
    throw error;
  }
}
