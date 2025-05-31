<template>
  <v-container class="py-5">
    <v-card class="dashboard-card" outlined>
      <v-card-title class="text-h4 text-center py-6 dashboard-title">
        Bienvenido, {{ authStore.user?.nombre || 'Usuario' }}!
      </v-card-title>
      <v-card-text>
        <p class="text-lg text-center mb-10 dashboard-subtitle">
          Este es un resumen general de tu actividad y las métricas clave del sistema.
        </p>

        <v-row class="mb-8">
          <v-col cols="12" md="4">
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Tickets Abiertos</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">
                {{ metrics.ticketsAbiertos }}
              </v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">Tickets pendientes de resolución</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Tickets Cerrados (Mes)</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">
                {{ metrics.ticketsCerradosMes }}
              </v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">En los últimos 30 días</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Nuevos Usuarios</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">
                {{ metrics.nuevosUsuarios }}
              </v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">Este trimestre</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-8">
          <v-col cols="12" md="6">
            <v-card class="section-card" elevation="2">
              <v-card-title class="text-h5 section-title-blue">Actividad Reciente</v-card-title>
              <v-card-text>
                <v-list dense v-if="actividadReciente.length">
                  <v-list-item v-for="item in actividadReciente" :key="item.id">
                    <v-list-item-title>{{ item.evento }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.fecha }} - {{ item.asignadoA }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <p v-else class="text-center text-grey">No hay actividad reciente.</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="section-card" elevation="2">
              <v-card-title class="text-h5 section-title-green">Tareas Pendientes</v-card-title>
              <v-card-text>
                <v-list dense v-if="tareasPendientes.length">
                  <v-list-item v-for="item in tareasPendientes" :key="item.id">
                    <v-list-item-title>{{ item.titulo }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.detalle }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <p v-else class="text-center text-grey">No hay tareas pendientes.</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <div class="text-center mt-10">
          <v-btn color="blue-darken-2" size="large" class="explore-button">
            Explorar Reportes Completos
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card-text>
      <v-overlay :model-value="loading" class="align-center justify-center">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
      <v-alert
        v-if="error"
        type="error"
        prominent
        class="mt-4"
      >
        Hubo un error al cargar los datos del dashboard: {{ error }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'; // Importa 'ref' para variables reactivas
import { authSetStore } from '@/stores/AuthStore';

// Define la URL base de tu API de AdonisJS
const API_BASE_URL = 'http://localhost:3333/api'; // <-- ASEGÚRATE DE QUE ESTA URL SEA CORRECTA PARA TU BACKEND

const authStore = authSetStore();

// Variables reactivas para almacenar los datos del dashboard
const metrics = ref({ // Inicializa con valores por defecto
  ticketsAbiertos: 0,
  ticketsCerradosMes: 0,
  nuevosUsuarios: 0,
});
const actividadReciente = ref<any[]>([]); // Array vacío para la actividad
const tareasPendientes = ref<any[]>([]); // Array vacío para las tareas
const loading = ref(false); // Estado de carga
const error = ref<string | null>(null); // Mensaje de error

const fetchDashboardData = async () => {
  loading.value = true; // Activa el estado de carga
  error.value = null; // Limpia errores previos

  try {
    const token = authStore.token; // Obtiene el token de autenticación del store

    const headers: HeadersInit = { // Usa HeadersInit para las cabeceras de fetch
      'Content-Type': 'application/json',
    };

    // Si la ruta del dashboard en AdonisJS está protegida (como acordamos),
    // es crucial enviar el token en la cabecera Authorization.
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Realiza la petición GET a tu API de AdonisJS usando fetch
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: headers,
    });

    // Manejo de errores HTTP en fetch
    if (!response.ok) {
      const errorData = await response.json(); // Intenta leer el mensaje de error del servidor
      throw new Error(`Error: ${response.status} - ${errorData.message || 'Error en la respuesta del servidor'}`);
    }

    const data = await response.json(); // Parsea la respuesta JSON

    // Verifica si la respuesta contiene datos y actualiza las variables reactivas
    if (data) {
      metrics.value = data.metrics;
      actividadReciente.value = data.actividadReciente;
      tareasPendientes.value = data.tareasPendientes;
    }
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    // Errores de red o errores lanzados desde 'throw new Error'
    error.value = `Error al cargar datos: ${err.message || 'Ocurrió un error desconocido'}`;
  } finally {
    loading.value = false; // Desactiva el estado de carga al finalizar (éxito o error)
  }
};

onMounted(async () => {
  // Primero, asegúrate de que la información del usuario (y el token) estén cargados en el store.
  await authStore.checkAuth();
  // Luego, carga los datos del dashboard desde la API.
  await fetchDashboardData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Estilos para el contenedor principal de la tarjeta del dashboard */
.dashboard-card {
  max-width: 1200px;
  margin: 20px auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.dashboard-title {
  color: #333333;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

.dashboard-subtitle {
  color: #555555;
  font-family: 'Inter', sans-serif;
}

/* Estilos para las tarjetas de métricas */
.metric-card {
  background-color: #E3F2FD;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.metric-title {
  color: #1976D2;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 10px;
}

.metric-value {
  color: #1565C0;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
}

.metric-subtitle {
  color: #42A5F5;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
}

/* Estilos para las tarjetas de sección (Actividad Reciente, Tareas Pendientes) */
.section-card {
  background-color: #F5F5F5;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.section-title-blue {
  color: #1976D2;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 15px;
}

.section-title-green {
  color: #4CAF50;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 15px;
}

/* Estilos para los elementos de lista dentro de las secciones */
.v-list-item-title {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  color: #333333;
}

.v-list-item-subtitle {
  font-family: 'Inter', sans-serif;
  color: #777777;
  font-size: 0.85rem;
}

/* Estilo para el botón de explorar */
.explore-button {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-transform: none;
  border-radius: 25px;
  padding: 15px 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.explore-button:hover {
  transform: translateY(-2px);
  background-color: #1565C0 !important;
}

/* Clases de utilidad de Vuetify y Tailwind (asegúrate de que Tailwind esté configurado) */
.py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-10 { margin-top: 2.5rem; }
.text-h4 { font-size: 2.125rem; line-height: 2.5rem; }
.text-h5 { font-size: 1.5rem; line-height: 2rem; }
.text-h6 { font-size: 1.25rem; line-height: 1.75rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
</style>