// src/services/DashboardService.ts

import { authSetStore } from '@/stores/AuthStore'; // Necesitamos el AuthStore para obtener el token

const API_BASE_URL = 'http://localhost:3333/api'; // <--- ASEGÚRATE DE QUE ESTA URL SEA CORRECTA

/**
 * Define las interfaces para la estructura de datos que esperamos del backend
 * para el dashboard. Esto mejora la seguridad de tipos en el frontend.
 */
interface MetricData {
  ticketsAbiertos: number;
  ticketsCerradosMes: number;
  nuevosUsuarios: number; // Renombrado de 'nuevosClientes' para coincidir con el backend
}

interface ActivityItem {
  id: number;
  titulo: string;
  estado: string;
  asignadoA: string;
  empresa: string;
  evento: string;
  fecha: string;
}

interface TaskItem {
  id: number;
  titulo: string;
  prioridad: string;
  estado: string;
  vence: string; // Asume que esta puede ser una cadena de texto
  detalle: string;
}

interface DashboardResponse {
  metrics: MetricData;
  actividadReciente: ActivityItem[];
  tareasPendientes: TaskItem[];
}

/**
 * Función para obtener los datos del dashboard desde la API.
 * Incluye el token de autenticación.
 */
export async function getDashboardData(): Promise<DashboardResponse> {
  const authStore = authSetStore(); // Obtiene la instancia del store
  const token = authStore.token; // Obtiene el token

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Si hay un token, añádelo a las cabeceras de autorización
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      // Intenta parsear el error del servidor para dar un mensaje más específico
      const errorData = await response.json();
      const errorMessage = errorData.message || 'Error desconocido al obtener datos del dashboard';
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    return await response.json() as DashboardResponse; // Castea la respuesta a la interfaz
  } catch (error) {
    console.error('Error en DashboardService.getDashboardData:', error);
    // Propaga el error para que el componente que llama pueda manejarlo
    throw error;
  }
}