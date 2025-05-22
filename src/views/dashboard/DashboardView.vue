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
              <v-card-text class="text-center text-5xl font-bold metric-value">124</v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">Tickets pendientes de resolución</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Tickets Cerrados (Mes)</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">87</v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">En los últimos 30 días</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="metric-card" elevation="2">
              <v-card-title class="text-h6 metric-title">Nuevos Clientes</v-card-title>
              <v-card-text class="text-center text-5xl font-bold metric-value">5</v-card-text>
              <v-card-subtitle class="text-center metric-subtitle">Este trimestre</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-8">
          <v-col cols="12" md="6">
            <v-card class="section-card" elevation="2">
              <v-card-title class="text-h5 section-title-blue">Actividad Reciente</v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-title>Ticket #1005: Problema de red en Empresa A</v-list-item-title>
                    <v-list-item-subtitle>Hace 2 horas - Asignado a Sofía</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Nuevo cliente: TechSolutions S.A.S.</v-list-item-title>
                    <v-list-item-subtitle>Ayer - Registrado por Diego</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Ticket #1004: Solicitud de acceso a sistema</v-list-item-title>
                    <v-list-item-subtitle>Hace 3 días - Cerrado por Carlos</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="section-card" elevation="2">
              <v-card-title class="text-h5 section-title-green">Tareas Pendientes</v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-title>Revisar tickets de alta prioridad</v-list-item-title>
                    <v-list-item-subtitle>Vence: Hoy</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Preparar informe mensual de rendimiento</v-list-item-title>
                    <v-list-item-subtitle>Vence: Viernes</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Capacitación de nuevo software</v-list-item-title>
                    <v-list-item-subtitle>Fecha: 25 de Mayo</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
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
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { authSetStore } from '@/stores/AuthStore';

const authStore = authSetStore();

onMounted(async () => {
  // Asegúrate de que el usuario esté cargado en el store al montar el componente
  await authStore.checkAuth();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Estilos para el contenedor principal de la tarjeta del dashboard */
.dashboard-card {
  max-width: 1200px; /* Un poco más ancho para el dashboard */
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
  background-color: #E3F2FD; /* Azul claro */
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
  color: #1976D2; /* Azul oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  margin-bottom: 10px;
}

.metric-value {
  color: #1565C0; /* Azul más oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 800; /* Más audaz */
}

.metric-subtitle {
  color: #42A5F5; /* Azul medio */
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
}

/* Estilos para las tarjetas de sección (Actividad Reciente, Tareas Pendientes) */
.section-card {
  background-color: #F5F5F5; /* Gris muy claro */
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
  border-radius: 25px; /* Botón más redondeado */
  padding: 15px 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.explore-button:hover {
  transform: translateY(-2px);
  background-color: #1565C0 !important; /* Un azul un poco más oscuro */
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
