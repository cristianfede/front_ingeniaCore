<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Formulario de Asignación de Permisos</v-card-title>
      <v-card-text>
        <v-form ref="formularioAsignacion" @submit.prevent="enviarFormulario" class="form" style="color: black">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="rolSeleccionado"
                :items="roles"
                label="Selecciona un rol"
                item-title="nombre" item-value="id"
                :rules="[v => !!v || 'El rol es requerido']"
                required
                outlined
                dense
                :loading="cargandoRoles"
                :disabled="cargandoRoles || isEditing" ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="itemSeleccionado"
                :items="items"
                label="Selecciona un Ítem"
                item-title="nombre" item-value="id"
                :rules="[v => !!v || 'El ítem es requerido']"
                required
                outlined
                dense
                chips
                single-line
                clearable
                :loading="cargandoItems"
                :disabled="cargandoItems || isEditing" hint="Solo puedes seleccionar un ítem a la vez para asignar permisos."
                persistent-hint
              >
                <template v-slot:selection="{ item }">
                  <v-chip closable @click:close="removerItem()">
                    <span>{{ (item.raw as Item).nombre }}</span> </v-chip>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="permisosSeleccionados"
                :items="permisos"
                label="Permisos"
                item-title="nombre" item-value="id"
                :rules="[v => permisosSeleccionados.length > 0 || 'Debes seleccionar al menos un permiso']"
                required
                outlined
                dense
                chips
                multiple
                clearable
                :loading="cargandoPermisos"
                :disabled="cargandoPermisos"
              >
                <template v-slot:selection="{ item }">
                  <v-chip closable @click:close="removerPermiso(item.raw as Permiso)">
                    <span>{{ (item.raw as Permiso).nombre }}</span>
                  </v-chip>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <div class="d-flex justify-start">
            <v-btn v-if="isEditing" color="secondary" @click="restablecerFormulario" class="mr-2">Cancelar</v-btn>
            <v-btn v-if="!isEditing" color="grey" text @click="restablecerFormulario" class="mr-2">Limpiar</v-btn>
            <v-btn color="primary" type="submit" :loading="enviandoFormulario">
              {{ isEditing ? 'Actualizar Asignación' : 'Asignar Permisos' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">Asignaciones Existentes</v-card-title>
      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4">
          <v-text-field
            v-model="searchAsignaciones"
            label="Buscar asignación"
            prepend-inner-icon="mdi-magnify"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="7" lg="8" class="d-flex justify-start">
          <v-btn small @click="sortAsignacionesByCreatedAtAsc" class="mr-2" color="#1976D2" dark>
            <v-icon left>mdi-sort-ascending</v-icon> Más Antiguas
          </v-btn>
          <v-btn small @click="sortAsignacionesByCreatedAtDesc" color="#1976D2" dark>
            <v-icon left>mdi-sort-descending</v-icon> Más Recientes
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headersAsignaciones"
        :items="groupedAssignments"
        item-value="key" v-model:sort-by="sortByAsignaciones"
        v-model:sort-desc="sortDescAsignaciones"
        class="elevation-1"
        :loading="cargandoAsignaciones"
        loading-text="Cargando asignaciones..."
        no-data-text="No hay asignaciones de permisos existentes."
      >
        <template v-slot:item.rol.nombre="{ item }">
          {{ item.raw.rol ? item.raw.rol.nombre : 'N/A' }}
        </template>
        <template v-slot:item.item.nombre="{ item }">
          {{ item.raw.item ? item.raw.item.nombre : 'N/A' }}
        </template>
        <template v-slot:item.permisosCombinados="{ item }">
          <v-chip
            v-for="permisoObj in item.raw.permisos"
            :key="permisoObj.id"
            small
            class="ma-1"
            color="info"
          >
            {{ permisoObj.nombre }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editAsignacion(item.raw)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="manejarEliminarAsignacion(item.raw.rol.id, item.raw.item.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
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
      v-model="mostrarDialogoConfirmacion"
      :title="tituloDialogoConfirmacion"
      :message="mensajeDialogoConfirmacion"
      :confirm-text="textoConfirmacionDialogo"
      :confirm-color="colorConfirmacionDialogo"
      @confirm="manejarAccionConfirmada"
      @cancel="manejarAccionCancelada"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
// Asegúrate de que la ruta del servicio sea correcta
import servicioPermisos { Rol, Item, Permiso, CargaAsignacion, AsignacionExistente } from '../services/permisosService';
import ConfirmDialog from '../components/Confirmardialogo.vue'; // Asegúrate de que la ruta sea correcta

// --- Variables de estado del formulario de asignación ---
const rolSeleccionado = ref<number | null>(null);
const itemSeleccionado = ref<number | null>(null);
const permisosSeleccionados = ref<number[]>([]);

// --- Control de Edición ---
const isEditing = ref(false);
const editingRolId = ref<number | null>(null); // Para almacenar el rolId original al editar
const editingItemId = ref<number | null>(null); // Para almacenar el itemId original al editar

// --- Datos para los selects ---
const roles = ref<Rol[]>([]);
const items = ref<Item[]>([]);
const permisos = ref<Permiso[]>([]);

// --- Estados de carga de selects y formulario ---
const cargandoRoles = ref(false);
const cargandoItems = ref(false);
const cargandoPermisos = ref(false);
const enviandoFormulario = ref(false); // Para el botón de submit

// --- Variables para la tabla de asignaciones ---
// Esta es la lista "cruda" de asignaciones que viene del backend
const asignacionesRaw = ref<AsignacionExistente[]>([]);
const cargandoAsignaciones = ref(false);
const searchAsignaciones = ref(''); // Para la búsqueda en la tabla

// Tipo para el ordenamiento de la tabla
type SortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};
const sortByAsignaciones = ref<SortItem[]>([{ key: 'createdAt', order: 'desc' }]); // Ordenamiento inicial por fecha de creación descendente
const sortDescAsignaciones = ref(true);

// Encabezados de la tabla de asignaciones
const headersAsignaciones = [
  { title: 'Rol', key: 'rol.nombre', sortable: true },
  { title: 'Ítem', key: 'item.nombre', sortable: true },
  { title: 'Permisos Asignados', key: 'permisosCombinados', sortable: false }, // Nueva columna para los chips
  { title: 'Fecha Última Asignación', key: 'createdAt', sortable: true }, // Fecha de creación de la última asignación en el grupo
  { title: 'Acciones', key: 'actions', sortable: false },
];

// --- Snackbar ---
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

// --- Variables de estado para el diálogo de confirmación ---
const mostrarDialogoConfirmacion = ref(false);
const tituloDialogoConfirmacion = ref('');
const mensajeDialogoConfirmacion = ref('');
const textoConfirmacionDialogo = ref('');
const colorConfirmacionDialogo = ref('');
const accionActual = ref<'asignar' | 'eliminar' | ''>('');
const asignacionAEliminarIds = ref<{ rolId: number; itemId: number } | null>(null); // Para guardar rolId y itemId al eliminar

// --- Referencia al formulario de Vuetify para validación ---
interface ReferenciasFormularioVuetify {
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
}
const formularioAsignacion = ref<ReferenciasFormularioVuetify | null>(null);

// --- Computed para agrupar y filtrar asignaciones para la tabla ---
const groupedAssignments = computed(() => {
  const grouped = new Map<string, { rol: Rol; item: Item; permisos: Permiso[]; createdAt: string; key: string }>();

  // Agrupar por rolId e itemId
  asignacionesRaw.value.forEach(assign => {
    if (assign.role && assign.item && assign.permission) {
      const key = `${assign.role.id}-${assign.item.id}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          rol: assign.role,
          item: assign.item,
          permisos: [],
          createdAt: assign.createdAt, // Usaremos la fecha de la primera asignación encontrada
          key: key // Clave para item-value de v-data-table
        });
      }
      // Asegurarse de no duplicar permisos si por alguna razón vienen duplicados en el raw data
      if (!grouped.get(key)!.permisos.some(p => p.id === assign.permission!.id)) {
        grouped.get(key)!.permisos.push(assign.permission);
      }
      // Opcional: Actualizar createdAt a la más reciente si hay múltiples por el mismo grupo
      if (new Date(assign.createdAt) > new Date(grouped.get(key)!.createdAt)) {
         grouped.get(key)!.createdAt = assign.createdAt;
      }
    }
  });

  let result = Array.from(grouped.values());

  // Aplicar filtro de búsqueda
  if (searchAsignaciones.value) {
    const searchTerm = searchAsignaciones.value.toLowerCase();
    result = result.filter(group =>
      group.rol.nombre.toLowerCase().includes(searchTerm) ||
      group.item.nombre.toLowerCase().includes(searchTerm) ||
      group.permisos.some(p => p.nombre.toLowerCase().includes(searchTerm))
    );
  }

  return result;
});


// --- Métodos de ordenamiento para la tabla ---
const sortAsignacionesByCreatedAtAsc = () => {
  sortByAsignaciones.value = [{ key: 'createdAt', order: 'asc' }];
  sortDescAsignaciones.value = false;
};

const sortAsignacionesByCreatedAtDesc = () => {
  sortByAsignaciones.value = [{ key: 'createdAt', order: 'desc' }];
  sortDescAsignaciones.value = true;
};

// --- Métodos para cargar datos al inicio ---
onMounted(async () => {
  await Promise.all([
    obtenerRoles(),
    obtenerItems(),
    obtenerPermisos(),
    obtenerTodasLasAsignaciones()
  ]);
});

async function obtenerRoles() {
  cargandoRoles.value = true;
  try {
    roles.value = await servicioPermisos.obtenerRoles();
  } catch (error: any) {
    console.error('Error al cargar los roles:', error);
    snackbar.value = { show: true, message: `Error al cargar roles: ${error.message || 'Error desconocido'}`, color: 'error' };
  } finally {
    cargandoRoles.value = false;
  }
}

async function obtenerItems() {
  cargandoItems.value = true;
  try {
    items.value = await servicioPermisos.obtenerItems();
  } catch (error: any) {
    console.error('Error al cargar los ítems:', error);
    snackbar.value = { show: true, message: `Error al cargar ítems: ${error.message || 'Error desconocido'}`, color: 'error' };
  } finally {
    cargandoItems.value = false;
  }
}

async function obtenerPermisos() {
  cargandoPermisos.value = true;
  try {
    permisos.value = await servicioPermisos.obtenerPermisos();
  } catch (error: any) {
    console.error('Error al cargar los permisos:', error);
    snackbar.value = { show: true, message: `Error al cargar permisos: ${error.message || 'Error desconocido'}`, color: 'error' };
  } finally {
    cargandoPermisos.value = false;
  }
}

async function obtenerTodasLasAsignaciones() {
  cargandoAsignaciones.value = true;
  try {
    const data = await servicioPermisos.obtenerAsignaciones();
    asignacionesRaw.value = data; // Almacenamos los datos sin agrupar
  } catch (error: any) {
    console.error('Error al cargar las asignaciones existentes:', error);
    snackbar.value = { show: true, message: `Error al cargar asignaciones: ${error.message || 'Error desconocido'}`, color: 'error' };
  } finally {
    cargandoAsignaciones.value = false;
  }
}

// --- Métodos para manejar los chips ---
function removerItem() {
  itemSeleccionado.value = null;
}

function removerPermiso(permisoParaRemover: Permiso) {
  permisosSeleccionados.value = permisosSeleccionados.value.filter(
    (idPermiso) => idPermiso !== permisoParaRemover.id
  );
}

// --- Lógica de Edición ---
// El tipo de 'asignacionGrupo' debe coincidir con el tipo de los ítems en 'groupedAssignments'
interface GroupedAssignment {
  rol: Rol;
  item: Item;
  permisos: Permiso[];
  createdAt: string;
  key: string;
}

function editAsignacion(asignacionGrupo: GroupedAssignment) {
  isEditing.value = true;
  editingRolId.value = asignacionGrupo.rol.id;
  editingItemId.value = asignacionGrupo.item.id;

  rolSeleccionado.value = asignacionGrupo.rol.id;
  itemSeleccionado.value = asignacionGrupo.item.id;
  permisosSeleccionados.value = asignacionGrupo.permisos.map(p => p.id);

  // Desplazar la vista al inicio del formulario para editar
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Lógica del formulario de asignación (submit) ---
async function enviarFormulario() {
  if (!formularioAsignacion.value) {
    console.error("Referencia al formulario no disponible.");
    return;
  }

  const { valid } = await formularioAsignacion.value.validate();

  if (valid) {
    if (isEditing.value) {
      tituloDialogoConfirmacion.value = 'Confirmar Actualización de Asignación';
      mensajeDialogoConfirmacion.value = '¿Estás seguro de que quieres actualizar esta asignación? Los permisos existentes para este rol e ítem serán reemplazados por los nuevos seleccionados.';
      textoConfirmacionDialogo.value = 'Actualizar';
      colorConfirmacionDialogo.value = 'primary';
      accionActual.value = 'asignar'; // La acción sigue siendo 'asignar' porque es un upsert en el backend
    } else {
      tituloDialogoConfirmacion.value = 'Confirmar Asignación de Permisos';
      mensajeDialogoConfirmacion.value = '¿Estás seguro de que quieres asignar estos permisos al rol y ítem seleccionados? Las asignaciones previas para este rol e ítem serán reemplazadas.';
      textoConfirmacionDialogo.value = 'Asignar';
      colorConfirmacionDialogo.value = 'success';
      accionActual.value = 'asignar';
    }
    mostrarDialogoConfirmacion.value = true;
  } else {
    snackbar.value = {
      show: true,
      message: 'Por favor, completa todos los campos requeridos y corrige los errores.',
      color: 'warning',
    };
  }
}

// --- Lógica de eliminación desde la tabla ---
function manejarEliminarAsignacion(rolId: number, itemId: number) {
  asignacionAEliminarIds.value = { rolId, itemId };
  tituloDialogoConfirmacion.value = 'Confirmar Eliminación de Asignación';
  mensajeDialogoConfirmacion.value = '¿Estás seguro de que quieres eliminar TODAS las asignaciones de permisos para este Rol e Ítem? Esta acción es irreversible.';
  textoConfirmacionDialogo.value = 'Eliminar';
  colorConfirmacionDialogo.value = 'error';
  accionActual.value = 'eliminar';
  mostrarDialogoConfirmacion.value = true;
}

async function manejarAccionConfirmada() {
  snackbar.value.show = false;
  enviandoFormulario.value = true;

  try {
    if (accionActual.value === 'asignar') {
      const cargaUtil: CargaAsignacion = {
        roleId: rolSeleccionado.value as number,
        itemId: itemSeleccionado.value as number,
        permisosIds: permisosSeleccionados.value,
      };

      await servicioPermisos.asignarPermisosRolItem(cargaUtil);
      snackbar.value = { show: true, message: isEditing.value ? 'Asignación actualizada con éxito.' : 'Permisos asignados con éxito.', color: 'success' };
      restablecerFormulario();
      await obtenerTodasLasAsignaciones(); // Refrescar la tabla
    } else if (accionActual.value === 'eliminar') {
      if (asignacionAEliminarIds.value !== null) {
        const { rolId, itemId } = asignacionAEliminarIds.value;
        await servicioPermisos.eliminarAsignacionPorRolItem(rolId, itemId);
        snackbar.value = { show: true, message: 'Asignaciones eliminadas correctamente.', color: 'success' };
        await obtenerTodasLasAsignaciones(); // Refrescar la tabla
      }
    }
  } catch (err: any) {
    const errorMessage = err?.message || 'Error al procesar la operación.';
    console.error('Error en manejarAccionConfirmada:', err);
    snackbar.value = { show: true, message: errorMessage, color: 'error' };
  } finally {
    mostrarDialogoConfirmacion.value = false;
    accionActual.value = '';
    asignacionAEliminarIds.value = null;
    enviandoFormulario.value = false;
  }
}

function manejarAccionCancelada() {
  console.log('Acción cancelada por el usuario.');
  accionActual.value = '';
  asignacionAEliminarIds.value = null;
  mostrarDialogoConfirmacion.value = false;
}

function restablecerFormulario() {
  rolSeleccionado.value = null;
  itemSeleccionado.value = null;
  permisosSeleccionados.value = [];
  isEditing.value = false; // Importante para salir del modo edición
  editingRolId.value = null;
  editingItemId.value = null;
  if (formularioAsignacion.value) {
    formularioAsignacion.value.resetValidation();
  }
}
</script>

<style scoped>
.form {
  padding: 1rem;
}
</style>
