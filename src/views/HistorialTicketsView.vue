<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title>
        <v-icon icon="mdi-clipboard-text-clock" class="me-2" />
        Historial de Tickets
      </v-card-title>

      <!-- Buscador -->
      <v-row class="px-4 pb-2">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            label="Buscar en esta página"
            prepend-inner-icon="mdi-magnify"
            dense
            outlined
            hide-details
          />
        </v-col>
      </v-row>

      <!-- Tabla con paginación -->
      <v-data-table
        :headers="headers"
        :items="tickets"
        item-value="id"
        class="elevation-1"
        :page="page"
        :items-per-page="itemsPerPage"
        :loading="loading"
        :server-items-length="totalItems"
        @update:page="(val) => { page = val; fetchTickets() }"
        @update:items-per-page="(val) => { itemsPerPage = val; fetchTickets() }"
      >
        <template #item="{ item }">
          <tr v-if="coincideConBusqueda(item)" @click="irADetalle(item.id)">
            <td>{{ item.id }}</td>
            <td>{{ item.titulo }}</td>
            <td>
              <v-chip :color="getPrioridadColor(item.prioridad?.nombre)">
                {{ item.prioridad?.nombre }}
              </v-chip>
            </td>
            <td>
              <v-chip :color="getEstadoColor(item.estado?.nombre)">
                {{ item.estado?.nombre }}
              </v-chip>
            </td>
            <td>
              <v-btn icon @click.stop="irADetalle(item.id)">
                <v-icon icon="mdi-eye" />
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 🧠 Datos y paginación
const tickets = ref([])
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const loading = ref(false)
const search = ref('')

// 🔁 Columnas
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Título', key: 'titulo' },
  { title: 'Prioridad', key: 'prioridad.nombre' },
  { title: 'Estado', key: 'estado.nombre' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

// 🧠 Computed para búsqueda local
/*const filteredTickets = computed(() => {
  if (!search.value) return tickets.value
  return tickets.value.filter((ticket) =>
    Object.values(ticket).some((val) =>
      String(val).toLowerCase().includes(search.value.toLowerCase())
    )
  )
})*/

function coincideConBusqueda(item: any): boolean {
  const texto = search.value. trim().toLowerCase()
  return (
    item.titulo?.toLowerCase().includes(texto) ||
    item.estado?.nombre?.toLowerCase().includes(texto) ||
    item.prioridad?.nombre?.toLowerCase().includes(texto)
  )
}

// 📡 Fetch desde backend con paginación
async function fetchTickets() {
  try {
    loading.value = true
    const res = await fetch(`http://localhost:3333/api/tickets/historial?page=${page.value}&limit=${itemsPerPage.value}`)
    const data = await res.json()
    tickets.value = data.data
    totalItems.value = data.meta.total
  } catch (error) {
    console.error('Error al obtener tickets:', error)
  } finally {
    loading.value = false
  }
}

function irADetalle(ticketId: number) {
  router.push({ name: 'detalle-ticket', params: { id: ticketId } })
}

function getEstadoColor(estado: string) {
  switch (estado) {
    case 'Abierto': return 'blue'
    case 'Asignado': return 'orange'
    case 'Cerrado': return 'green'
    default: return 'grey'
  }
}

function getPrioridadColor(prioridad: string) {
  switch (prioridad) {
    case 'Alta': return 'red'
    case 'Media': return 'orange'
    case 'Baja': return 'green'
    default: return 'grey'
  }
}

onMounted(fetchTickets)
</script>
