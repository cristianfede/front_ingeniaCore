<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  crearTicket,
  obtenerTickets,
  actualizarTicket,
  eliminarTicket,
  obtenerEstados,
  obtenerPrioridades,
  obtenerEmpresas,
  obtenerTecnicos, // ✅ Ahora importamos la función correcta
  obtenerCategorias,
  obtenerServicios,
  downloadTicketAttachment
} from '../services/ticketService'; // Asegúrate que la ruta a ticketService.ts sea correcta
import ConfirmDialog from '../components/Confirmardialogo.vue';

// --- Estado para el formulario de Ticket ---
const titulo = ref('');
const descripcion = ref('');
const estado_id = ref<number | null>(null);
const prioridad_id = ref<number | null>(null);
const empresa_id = ref<number | null>(null);
const usuario_asignado_id = ref<number | null>(null);
const categoria_id = ref<number | null>(null);
const servicio_id = ref<number | null>(null);

const archivoAdjunto = ref<File | null>(null);
const fileNameDisplay = ref('');
const existingFileName = ref<string | null>(null);
const clearExistingAttachment = ref(false);

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
const empresa = ref<{ id: number; nombre: string }[]>([]);

// ✅ Tipo de dato actualizado: Esperamos 'nombreCompleto' directamente del backend
const usuariosAsignados = ref<{ id: number; nombreCompleto: string }[]>([]);

const categorias = ref<{ id: number; nombre: string }[]>([]);
const servicios = ref<{ id: number; nombre: string }[]>([]);

// ✅ ELIMINADA: Esta propiedad computada ya no es necesaria
// porque el backend ya devuelve 'nombreCompleto'
// const usuariosAsignadosFormateados = computed(() =>
//   usuariosAsignados.value.map(u => ({
//     ...u,
//     nombreCompleto: `${u.nombre} ${u.apellido}`
//   }))
// );

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
  estado_id.value = ticket.estado?.id || null;
  prioridad_id.value = ticket.prioridad?.id || null;
  empresa_id.value = ticket.empresa?.id || null;
  usuario_asignado_id.value = ticket.usuarioAsignado?.id || null; // ✅ Asignación directa del ID
  categoria_id.value = ticket.categoria?.id || null;
  servicio_id.value = ticket.servicio?.id || null;

  // Lógica para el archivo adjunto existente
  archivoAdjunto.value = null; // Siempre se limpia al editar para nueva subida
  fileNameDisplay.value = ''; // Se limpia el nombre del archivo seleccionado para nueva subida
  existingFileName.value = ticket.nombreArchivo || null; // Muestra el nombre del archivo si existe
  clearExistingAttachment.value = false; // Resetea la bandera al editar
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
    if (empresa_id.value !== null) formData.append('empresas_id', String(empresa_id.value));
    if (usuario_asignado_id.value !== null) formData.append('usuario_asignado_id', String(usuario_asignado_id.value));
    if (categoria_id.value !== null) formData.append('categoria_id', String(categoria_id.value));
    if (servicio_id.value !== null) formData.append('servicio_id', String(servicio_id.value));

    // Lógica para el archivo adjunto
    if (archivoAdjunto.value) {
      formData.append('archivo_adjunto', archivoAdjunto.value);
    } else if (isEditing.value && clearExistingAttachment.value) {
      // Si estamos editando y se solicitó borrar el adjunto existente
      formData.append('clear_adjunto', 'true');
    }

    if (currentAction.value === 'create') {
      const nuevoTicket = await crearTicket(formData);
      tickets.value.unshift(nuevoTicket); // Añadir al principio para que se vea primero
      // Asegúrate de que la tabla se ordene por ID descendente después de crear
      sortBy.value = [{ key: 'id', order: 'desc' }];
      snackbar.value = { show: true, message: 'Ticket creado exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      const actualizado = await actualizarTicket(editingTicketId.value!, formData);
      const index = tickets.value.findIndex(t => t.id === editingTicketId.value);
      if (index !== -1) {
        // Reemplaza el ticket con el actualizado para reflejar el nuevo nombre del archivo
        tickets.value[index] = actualizado;
      }
      await cargarTickets();
      snackbar.value = { show: true, message: 'Ticket actualizado correctamente.', color: 'success' };
    } else if (currentAction.value === 'delete') {
      if (ticketToDeleteId.value !== null) {
        await eliminarTicket(ticketToDeleteId.value);
        tickets.value = tickets.value.filter(t => t.id !== ticketToDeleteId.value);
        await cargarTickets(); // Recargar tickets para reflejar la eliminación
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
  empresa_id.value = null;
  usuario_asignado_id.value = null;
  categoria_id.value = null;
  servicio_id.value = null;
  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
  existingFileName.value = null;
  clearExistingAttachment.value = false;
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
// Inicialmente, la tabla se ordenará de forma descendente (los más recientes primero)
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'desc' }]);
const sortDesc = ref(false);

// Cabeceras de la tabla
const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Asunto', key: 'titulo', sortable: false },
  { title: 'Empresa', key: 'empresa.nombre', sortable: false },
  { title: 'Prioridad', key: 'prioridad.nombre', sortable: false },
  { title: 'Estado', key: 'estado.nombre', sortable: false },
  { title: 'Técnico', key: 'usuarioAsignado.nombre', sortable: false }, // Asumiendo que 'usuarioAsignado' tiene una propiedad 'nombre'
  { title: 'Adjunto', key: 'nombreArchivo', sortable: false },
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
  sortByIdDesc(); // Asegura que la tabla empiece ordenada DESCENDENTE al cargar
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
    empresa.value = await obtenerEmpresas();

    // ✅ ¡Cargando los técnicos directamente con la función obtenerTecnicos!
    // Esta función ya devuelve los datos con 'nombreCompleto'
    usuariosAsignados.value = await obtenerTecnicos();

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
    (t.empresa?.nombre || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (t.prioridad?.nombre || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (t.estado?.nombre || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (t.usuarioAsignado?.nombre || '').toLowerCase().includes(search.value.toLowerCase()) || // Asumiendo que 'usuarioAsignado' tiene 'nombre'
    (t.nombreArchivo || '').toLowerCase().includes(search.value.toLowerCase())
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
  ticketToDeleteId.value = null;
  currentAction.value = '';
  // También resetea el estado del formulario si se canceló una edición/creación
  resetForm();
}

// Funciones para manejar el archivo
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      if (file.size <= 5 * 1024 * 1024) { // 5 MB en bytes
        archivoAdjunto.value = file;
        fileNameDisplay.value = archivoAdjunto.value.name;
        clearExistingAttachment.value = false; // Si se sube un nuevo archivo, no borrar el existente
      } else {
        snackbar.value = { show: true, message: 'El archivo es demasiado grande (máx. 5MB).', color: 'warning' };
        clearSelectedFile();
      }
    } else {
      snackbar.value = { show: true, message: 'Tipo de archivo no permitido. Solo se aceptan imágenes, PDF, y documentos de Office.', color: 'warning' };
      clearSelectedFile();
    }
  } else {
    archivoAdjunto.value = null;
    fileNameDisplay.value = '';
  }
}

function clearSelectedFile() {
  archivoAdjunto.value = null;
  fileNameDisplay.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = ''; // Esto limpia el input de tipo file
  }
}

// Función para eliminar el adjunto existente
function removeExistingAttachment() {
  existingFileName.value = null;
  clearExistingAttachment.value = true; // Establecer la bandera para enviar al backend
  // Si se había seleccionado un nuevo archivo para reemplazarlo, se limpia también
  clearSelectedFile();
}

// Función para descargar el adjunto
async function downloadAttachment(ticketId: number) {
  try {
    await downloadTicketAttachment(ticketId);
  } catch (error: any) {
    snackbar.value = { show: true, message: error.message || 'Error al descargar el archivo.', color: 'error' };
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
              <v-select
                label="Empresa Asociada"
                v-model="empresa_id"
                :items="empresa"
                item-title="nombre"
                item-value="id"
                required
                outlined
                density="compact"
                class="mb-3"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                label="Asignado a (Técnico)"
                v-model="usuario_asignado_id"
                :items="usuariosAsignados"     item-title="nombreCompleto"    item-value="id"
                outlined
                clearable
                density="compact"
                class="mb-3"
              ></v-select>
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
                class="mb-3"
              ></v-select>
            </v-col>
          </v-row>

          <v-row class="mb-4 align-center">
            <v-col cols="12">
              <p class="text-subtitle-1 mb-2">Adjuntar Archivo (opcional, máx. 5MB):</p>
              <div class="d-flex align-center flex-wrap">
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mr-2 mb-2"
                  @click="triggerFileInput"
                  style="text-transform: none;"
                >
                  Seleccionar archivo
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
                  class="mb-2 mr-2"
                >
                  {{ fileNameDisplay }} (Nuevo)
                </v-chip>

                <v-chip
                  v-if="isEditing && existingFileName && !fileNameDisplay"
                  closable
                  @click:close="removeExistingAttachment"
                  color="purple"
                  variant="flat"
                  class="mb-2"
                >
                  {{ existingFileName }} (Existente)
                </v-chip>

                <p v-if="isEditing && existingFileName && !fileNameDisplay" class="text-caption ml-2 mb-2">
                  <a @click="downloadAttachment(editingTicketId!)" style="cursor: pointer; text-decoration: underline;">Descargar existente</a>
                </p>

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
        <template #item.nombreArchivo="{ item }">
          <v-btn
            v-if="item.nombreArchivo"
            icon
            variant="flat"
            size="small"
            color="grey-lighten-3"
            @click="downloadAttachment(item.id)"
            title="Descargar adjunto"
          >
            <v-icon color="blue-darken-2">mdi-download</v-icon>
          </v-btn>
          <span v-else>N/A</span>
        </template>

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
.form {
  padding: 1rem;
}
.text-h5, .text-h6 {
  color: #1976D2;
  font-weight: bold;
}
</style>