<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5">
        <v-icon icon="mdi-clipboard-text-clock" class="me-2" />
        Historial de Tickets
      </v-card-title>

      <!-- Nuevo: Barra de búsqueda y controles de ordenamiento -->
      <v-row class="px-4 pb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            label="Buscar tickets..."
            prepend-inner-icon="mdi-magnify"
            outlined
            dense
            clearable
            @update:modelValue="handleSearch"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="8" class="d-flex justify-end">
          <v-btn-toggle v-model="sortOrder" mandatory>
            <v-btn value="asc" @click="changeSortOrder('asc')">
              <v-icon left>mdi-sort-ascending</v-icon>
              Más Antiguos
            </v-btn>
            <v-btn value="desc" @click="changeSortOrder('desc')">
              <v-icon left>mdi-sort-descending</v-icon>
              Más Recientes
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <!-- Tabla existente (sin cambios) -->
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items-length="totalItems"
        :items="tickets"
        :loading="loading"
        :items-per-page-options="[10, 20, 30, 50]"
        @update:options="loadItems"
        class="elevation-1"
      >
        <!-- Prioridad -->
        <template #item.prioridad.nombre="{ item }">
          <v-chip :color="getPrioridadColor(item.prioridad?.nombre)" small>
            {{ item.prioridad?.nombre || 'N/A' }}
          </v-chip>
        </template>

        <!-- Estado -->
        <template #item.estado.nombre="{ item }">
          <v-chip :color="getEstadoColor(item.estado?.nombre)" small>
            {{ item.estado?.nombre || 'N/A' }}
          </v-chip>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt || '') }}
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <v-btn
            icon
            @click="irADetalle(item.id)"
            color="primary"
            variant="text"
            size="small"
          >
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">Ver detalles</v-tooltip>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash'

const router = useRouter()

// Define el tipo de Ticket para evitar errores de tipo
interface Ticket {
  id: number
  titulo: string
  prioridad?: { nombre?: string }
  estado?: { nombre?: string }
  created_at?: string
  createdAt?: string
  // agrega otros campos según sea necesario
}

// Estado existente
const tickets = ref<Ticket[]>([])
const loading = ref(false)
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)

// Nuevo estado para búsqueda y ordenamiento
const search = ref('')
const sortOrder = ref('desc') // 'asc' o 'desc'

// Cabeceras (sin cambios)
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Título', key: 'titulo', sortable: true },
  { title: 'Prioridad', key: 'prioridad.nombre', sortable: true },
  { title: 'Estado', key: 'estado.nombre', sortable: true },
  { title: 'Fecha', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Función modificada para incluir búsqueda y ordenamiento
async function loadItems() {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: itemsPerPage.value.toString(),
      sortOrder: sortOrder.value,
      search: search.value.trim() // Envía el término de búsqueda
    })

    console.log('Parámetros enviados:', params.toString()) // Debug

    const response = await fetch(`http://localhost:3333/api/tickets/historial?${params}`)
    if (!response.ok) throw new Error('Error en la respuesta')

    const { data, meta } = await response.json()
    console.log('Datos recibidos:', data[0])
    tickets.value = data
    totalItems.value = meta.total
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}
// Nuevas funciones para manejar búsqueda y ordenamiento
const handleSearch = debounce(() => {
  page.value = 1
  loadItems()
}, 500)

function changeSortOrder(order: string) {
  sortOrder.value = order
  page.value = 1 // Resetear a la primera página al cambiar orden
  loadItems()
}

// Resto del código existente (sin cambios)
function irADetalle(ticketId: number) {
  router.push({ name: 'detalle-ticket', params: { id: ticketId } })
}

function getEstadoColor(estado: string) {
  if (!estado) return 'grey'
  switch (estado.toLowerCase()) {
    case 'abierto': return 'blue'
    case 'asignado': return 'orange'
    case 'cerrado': return 'green'
    default: return 'grey'
  }
}

function getPrioridadColor(prioridad: string) {
  if (!prioridad) return 'grey'
  switch (prioridad.toLowerCase()) {
    case 'alta': return 'red'
    case 'media': return 'orange'
    case 'baja': return 'green'
    default: return 'grey'
  }
}

// Función para formatear la fecha
function formatDate(dateString: string) {
  console.log('Fecha recibida:', dateString)
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Estilos para los nuevos elementos */
.v-btn-toggle {
  border-radius: 4px;
  overflow: hidden;
}

.v-btn-toggle .v-btn {
  margin: 0;
  border-radius: 0;
}
</style>
