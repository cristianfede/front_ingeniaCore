<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  crearTicket,
  obtenerTickets,
  actualizarTicket,
  eliminarTicket,
  obtenerEstados,
  obtenerPrioridades,
  // CAMBIO AQUÍ: Importa obtenerEmpresas en lugar de obtenerClientes
  obtenerEmpresas,
  obtenerUsuariosAsignables,
  obtenerCategorias,
  obtenerServicios
} from '../services/ticketService';
import ConfirmDialog from '../components/Confirmardialogo.vue';

// --- Estado para el formulario de Ticket ---
const titulo = ref('');
const descripcion = ref('');
const estado_id = ref<number | null>(null);
const prioridad_id = ref<number | null>(null);
const cliente_id = ref<number | null>(null); // Este ahora será el ID de la Empresa
const usuario_asignado_id = ref<number | null>(null); // Este será el ID del Técnico
const categoria_id = ref<number | null>(null);
const servicio_id = ref<number | null>(null);

const archivoAdjunto = ref<File | null>(null);
const fileNameDisplay = ref('');

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});
const isEditing = ref(false);
const editingTicketId = ref<number | null>(null);

// --- Listas para los v-select (cargadas desde la API) ---
const estados = ref<{ id: number; nombre: string }[]>([]);
const prioridades = ref<{ id: number; nombre: string }[]>([]);
// CAMBIO AQUÍ: Tipado para 'clientes' ahora representa 'empresas' (asumiendo id y nombre)
const clientes = ref<{ id: number; nombre: string }[]>([]);
// Tipado para usuariosAsignados para incluir 'apellido'
const usuariosAsignados = ref<{ id: number; nombre: string; apellido: string }[]>([]);
const categorias = ref<{ id: number; nombre: string }[]>([]);
const servicios = ref<{ id: number; nombre: string }[]>([]);

// --- Variables para el modal de confirmación ---
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref('');
const ticketToDeleteId = ref<number | null>(null);

/**
 * Precarga los datos de un ticket en el formulario para su edición.
 * @param ticket El objeto ticket a editar.
 */
function editTicket(ticket: any) {
  isEditing.value = true;
  editingTicketId.value = ticket.id;
  titulo.value = ticket.titulo;
  descripcion.value = ticket.descripcion;
  estado_id.value = ticket.estado_id;
  prioridad_id.value = ticket.prioridad_id;
  // Asigna los IDs de las relaciones, usando ?.id para seguridad si la relación es nula
  cliente_id.value = ticket.cliente?.id || null; // Ahora 'cliente' se refiere a la empresa
  usuario_asignado_id.value = ticket.usuario_asignado?.id || null; // 'usuario_asignado' se refiere al técnico
  categoria_id.value = ticket.categoria?.id || null;
  servicio_id.value = ticket.servicio?.id || null;
  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
}

/**
 * Maneja el envío del formulario, configurando el modal de confirmación.
 */
async function submit() {
  if (!titulo.value || !descripcion.value || estado_id.value === null || prioridad_id.value === null) {
    snackbar.value = {
      show: true,
      message: 'Por favor, completa los campos obligatorios del ticket (Título, Descripción, Estado, Prioridad).',
      color: 'warning',
    };
    return;
  }

  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este ticket?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear este ticket?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success';
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true;
}

/**
 * Se ejecuta cuando el usuario confirma una acción en el modal.
 * Realiza la operación CRUD (crear, actualizar, eliminar).
 */
async function handleConfirmAction() {
  snackbar.value.show = false;

  try {
    const formData = new FormData();
    formData.append('titulo', titulo.value);
    formData.append('descripcion', descripcion.value);
    formData.append('estado_id', String(estado_id.value));
    formData.append('prioridad_id', String(prioridad_id.value));
    if (cliente_id.value !== null) formData.append('cliente_id', String(cliente_id.value));
    if (usuario_asignado_id.value !== null) formData.append('usuario_asignado_id', String(usuario_asignado_id.value));
    if (categoria_id.value !== null) formData.append('categoria_id', String(categoria_id.value));
    if (servicio_id.value !== null) formData.append('servicio_id', String(servicio_id.value));

    if (archivoAdjunto.value) {
      formData.append('archivo_adjunto', archivoAdjunto.value);
    }

    if (currentAction.value === 'create') {
      const nuevoTicket = await crearTicket(formData);
      tickets.value.push(nuevoTicket);
      sortBy.value = [{ key: 'id', order: 'desc' }];
      snackbar.value = { show: true, message: 'Ticket creado exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      const actualizado = await actualizarTicket(editingTicketId.value!, formData);
      const index = tickets.value.findIndex(t => t.id === editingTicketId.value);
      if (index !== -1) tickets.value[index] = actualizado;
      snackbar.value = { show: true, message: 'Ticket actualizado correctamente.', color: 'success' };
    } else if (currentAction.value === 'delete') {
      if (ticketToDeleteId.value !== null) {
        await eliminarTicket(ticketToDeleteId.value);
        tickets.value = tickets.value.filter(t => t.id !== ticketToDeleteId.value);
        snackbar.value = { show: true, message: 'Ticket eliminado correctamente.', color: 'success' };
      }
    }
    resetForm();
  } catch (err: any) {
    const errorMessage = err?.message || 'Error al procesar la operación del ticket.';
    snackbar.value = { show: true, message: errorMessage, color: 'error' };
  } finally {
    showConfirmDialog.value = false;
    currentAction.value = '';
  }
}

/**
 * Resetea el formulario y el estado de edición.
 */
function resetForm() {
  titulo.value = '';
  descripcion.value = '';
  estado_id.value = null;
  prioridad_id.value = null;
  cliente_id.value = null;
  usuario_asignado_id.value = null;
  categoria_id.value = null;
  servicio_id.value = null;
  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
  isEditing.value = false;
  editingTicketId.value = null;
  ticketToDeleteId.value = null;
}

// --- Estado y lógica para la tabla de Tickets ---
const tickets = ref<any[]>([]);
const search = ref('');
type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]);
const sortDesc = ref(false);

// Cabeceras de la tabla
const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Asunto', key: 'titulo', sortable: false },
  // CAMBIO AQUÍ: Cambiado 'Cliente' a 'Empresa' para la cabecera de la tabla
  { title: 'Empresa', key: 'cliente.nombre', sortable: false },
  { title: 'Prioridad', key: 'prioridad.nombre', sortable: false },
  { title: 'Estado', key: 'estado.nombre', sortable: false },
  { title: 'Técnico', key: 'usuario_asignado.nombre', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
];

const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }];
};

onMounted(async () => {
  await cargarTickets();
  await cargarListasReferencia();
  sortByIdAsc();
});

async function cargarTickets() {
  try {
    tickets.value = await obtenerTickets();
  } catch (err: any) {
    snackbar.value = {
      show: true,
      message: err.message || 'Error al cargar tickets',
      color: 'error',
    };
  }
}

async function cargarListasReferencia() {
  try {
    estados.value = await obtenerEstados();
    prioridades.value = await obtenerPrioridades();
    // CAMBIO AQUÍ: Llamada a obtenerEmpresas en lugar de obtenerClientes
    clientes.value = await obtenerEmpresas();
    usuariosAsignados.value = await obtenerUsuariosAsignables();
    categorias.value = await obtenerCategorias();
    servicios.value = await obtenerServicios();
  } catch (error: any) {
    console.error('Error al cargar listas de referencia:', error);
    snackbar.value = { show: true, message: error.message || 'Error al cargar opciones de filtro.', color: 'error' };
  }
}

const filteredTickets = computed(() =>
  tickets.value.filter((t) =>
    String(t.id).toLowerCase().includes(search.value.toLowerCase()) ||
    t.titulo.toLowerCase().includes(search.value.toLowerCase()) ||
    (t.cliente?.nombre || '').toLowerCase().includes(search.value.toLowerCase()) || // Filtrado por nombre de empresa
    (t.prioridad?.nombre || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (t.estado?.nombre || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (t.usuario_asignado?.nombre || '').toLowerCase().includes(search.value.toLowerCase())
  )
);

function handleDeleteTicket(id: number) {
  ticketToDeleteId.value = id;
  confirmDialogTitle.value = 'Confirmar Eliminación';
  confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar este ticket? Esta acción es irreversible.';
  confirmDialogConfirmText.value = 'Eliminar';
  confirmDialogConfirmColor.value = 'error';
  currentAction.value = 'delete';
  showConfirmDialog.value = true;
}

function handleCancelAction() {
  console.log('Acción de ticket cancelada por el usuario.');
  ticketToDeleteId.value = null;
  currentAction.value = '';
}

// Funciones para manejar el archivo
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    archivoAdjunto.value = target.files[0];
    fileNameDisplay.value = archivoAdjunto.value.name;
  } else {
    archivoAdjunto.value = null;
    fileNameDisplay.value = '';
  }
}

function clearSelectedFile() {
  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}
</script>

<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center py-4">
        FORMULARIO DE TICKET
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submit" class="form" style="color: black">
          <v-row class="mb-2">
            <v-col cols="12">
              <v-text-field label="Título del Ticket" v-model="titulo" required outlined density="compact" />
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12">
              <v-textarea label="Descripción Detallada del Problema/Solicitud" v-model="descripcion" required outlined rows="5" density="compact" />
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-select
                label="Estado Actual"
                v-model="estado_id"
                :items="estados"
                item-title="nombre"
                item-value="id"
                required
                outlined
                density="compact"
                class="mb-3"
              ></v-select>
              <v-select
                label="Prioridad del Ticket"
                v-model="prioridad_id"
                :items="prioridades"
                item-title="nombre"
                item-value="id"
                required
                outlined
                density="compact"
                class="mb-3"
              ></v-select>
              <v-autocomplete
                label="Empresa Asociada"
                v-model="cliente_id"
                :items="clientes"
                item-value="id"
                outlined
                clearable
                density="compact"
                hide-no-data
                hide-selected
                placeholder="Escribe para buscar o seleccionar la empresa"
              >
                <template v-slot:item="{ item }">
                  <v-list-item-title>{{ item.raw.nombre }}</v-list-item-title>
                </template>
                <template v-slot:selection="{ item }">
                  {{ item.raw.nombre }}
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                label="Asignado a (Técnico)"
                v-model="usuario_asignado_id"
                :items="usuariosAsignados"
                item-value="id"
                outlined
                clearable
                density="compact"
                class="mb-3"
                hide-no-data
                hide-selected
                placeholder="Escribe para buscar o seleccionar al técnico"
              >
                <template v-slot:item="{ item }">
                  <v-list-item-title>{{ item.raw.nombre }} {{ item.raw.apellido }}</v-list-item-title>
                </template>
                <template v-slot:selection="{ item }">
                  {{ item.raw.nombre }} {{ item.raw.apellido }}
                </template>
              </v-autocomplete>
              <v-select
                label="Categoría de Servicio"
                v-model="categoria_id"
                :items="categorias"
                item-title="nombre"
                item-value="id"
                outlined
                clearable
                density="compact"
                class="mb-3"
              ></v-select>
              <v-select
                label="Servicio Específico"
                v-model="servicio_id"
                :items="servicios"
                item-title="nombre"
                item-value="id"
                outlined
                clearable
                density="compact"
              ></v-select>
            </v-col>
          </v-row>

          <v-row class="mb-4 align-center">
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mr-2"
                  @click="triggerFileInput"
                  style="text-transform: none;"
                >
                  Adjuntar archivo
                  <v-icon end>mdi-paperclip</v-icon>
                </v-btn>

                <input
                  type="file"
                  ref="fileInputRef"
                  @change="handleFileChange"
                  style="display: none;"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  single
                />

                <v-chip
                  v-if="fileNameDisplay"
                  closable
                  @click:close="clearSelectedFile"
                  color="info"
                  variant="flat"
                >
                  {{ fileNameDisplay }}
                </v-chip>
              </div>
            </v-col>
          </v-row>

          <div class="d-flex justify-start mt-4">
            <v-btn color="grey" text @click="resetForm" class="mr-2">
              {{ isEditing ? 'Cancelar Edición' : 'Limpiar' }}
            </v-btn>
            <v-btn color="primary" type="submit">
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6 py-4">
        Lista de Tickets
      </v-card-title>

      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4">
          <v-text-field v-model="search" label="Buscar ticket" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="7" lg="8" class="d-flex justify-start">
          <v-btn small @click="sortByIdAsc" class="mr-2" color="#1976D2" dark>
            <v-icon left>mdi-sort-ascending</v-icon> Más Antiguos
          </v-btn>
          <v-btn small @click="sortByIdDesc" color="#1976D2" dark>
            <v-icon left>mdi-sort-descending</v-icon> Más Recientes
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredTickets"
        item-value="id"
        v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editTicket(item)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteTicket(item.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="info" icon="mdi-information">
            No hay tickets disponibles. ¡Crea uno nuevo!
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn text @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>

    <ConfirmDialog
      v-model="showConfirmDialog"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :confirm-text="confirmDialogConfirmText"
      :confirm-color="confirmDialogConfirmColor"
      @confirm="handleConfirmAction"
      @cancel="handleCancelAction"
    />
  </v-container>
</template>

<style scoped>
/* Estilos adicionales si son necesarios, pero Vuetify y Tailwind CSS deberían manejar la mayoría */
.form {
  padding: 1rem;
}
</style>