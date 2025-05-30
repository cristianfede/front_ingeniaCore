<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { obtenerRoles, crearRol, actualizarRol, eliminarRolPermanentemente } from '../services/CreacionRoles' 
import ConfirmDialog from '../components/Confirmardialogo.vue';

const roles = ref<any[]>([])
const nombre = ref('')
const descripcion = ref('')
const estado = ref('activo')

const search = ref('')
const isEditing = ref(false)
const editingRolId = ref<number | null>(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref(''); 
const rolToDeleteId = ref<number | null>(null); 
const rolToActivateId = ref<number | null>(null);
const rolToDeletePermanentlyId = ref<number | null>(null);

type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]);

const filtroEstadoTabla = ref('activo');

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre del Rol', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

async function cargarRoles() {
  try {
    roles.value = await obtenerRoles();
  } catch (error: any) {
    console.error('Error al cargar roles:', error);
    snackbar.value = { show: true, message: 'Error al cargar roles.', color: 'error' };
  }
}

async function submitForm() {
  if (!nombre.value) {
    snackbar.value = { show: true, message: 'Por favor, ingresa el nombre del rol.', color: 'warning' };
    return;
  }

  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización de Rol';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este rol?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación de Rol';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear este rol?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success';
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true;
}

async function handleConfirmAction() {
  snackbar.value.show = false;

  try {
    const rolData = {
      nombre: nombre.value,
      descripcion: descripcion.value,
      estado: estado.value,
    };

    if (currentAction.value === 'create') {
      await crearRol(rolData); // No necesitas el retorno para actualizar, solo recargar
      snackbar.value = { show: true, message: 'Rol creado exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      await actualizarRol(editingRolId.value!, rolData); // No necesitas el retorno
      snackbar.value = { show: true, message: 'Rol actualizado correctamente.', color: 'success' };
    } else if (currentAction.value === 'inactivate') {
      if (rolToDeleteId.value !== null) {
        await actualizarRol(rolToDeleteId.value, { estado: 'inactivo' }); // No necesitas el retorno
        snackbar.value = { show: true, message: 'Rol inactivado correctamente.', color: 'success' };
      }
    } else if (currentAction.value === 'activate') {
      if (rolToActivateId.value !== null) {
        await actualizarRol(rolToActivateId.value, { estado: 'activo' }); // No necesitas el retorno
        snackbar.value = { show: true, message: 'Rol activado correctamente.', color: 'success' };
      }
    } else if (currentAction.value === 'delete_permanent') {
      if (rolToDeletePermanentlyId.value !== null) {
        await eliminarRolPermanentemente(rolToDeletePermanentlyId.value);
        snackbar.value = { show: true, message: 'Rol eliminado definitivamente.', color: 'success' };
      }
    }
    
    // !!! IMPORTANTE: Recargar los roles después de CUALQUIER operación exitosa !!!
    await cargarRoles(); 
    resetForm();

  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || 'Error al procesar la operación del rol.';
    snackbar.value = { show: true, message: errorMessage, color: 'error' };
  } finally {
    showConfirmDialog.value = false;
    currentAction.value = '';
    rolToDeleteId.value = null;
    rolToActivateId.value = null;
    rolToDeletePermanentlyId.value = null;
  }
}

function editRol(rol: any) {
  isEditing.value = true;
  editingRolId.value = rol.id;
  nombre.value = rol.nombre;
  descripcion.value = rol.descripcion;
  estado.value = rol.estado;
  window.scrollTo({ top: 0, behavior: 'smooth'})
}

function handleDeleteRol(id: number) {
  rolToDeleteId.value = id;
  confirmDialogTitle.value = 'Confirmar Inactivación de Rol';
  confirmDialogMessage.value = '¿Estás seguro de que quieres inactivar este rol? Se cambiará su estado a inactivo.';
  confirmDialogConfirmText.value = 'Inactivar';
  confirmDialogConfirmColor.value = 'error';
  currentAction.value = 'inactivate';
  showConfirmDialog.value = true;
}

function handleDeletePermanentlyRol(id: number) {
  rolToDeletePermanentlyId.value = id;
  confirmDialogTitle.value = '¡ADVERTENCIA! Eliminación Permanente de Rol';
  confirmDialogMessage.value = 'Esta acción eliminará el rol de forma definitiva de la base de datos y no se podrá recuperar. ¿Estás absolutamente seguro?';
  confirmDialogConfirmText.value = 'Eliminar PERMANENTEMENTE';
  confirmDialogConfirmColor.value = 'red darken-3';
  currentAction.value = 'delete_permanent';
  showConfirmDialog.value = true;
}

function handleActivateRol(id: number) {
  rolToActivateId.value = id;
  confirmDialogTitle.value = 'Confirmar Activación de Rol';
  confirmDialogMessage.value = '¿Estás seguro de que quieres activar este rol? Se cambiará su estado a activo.';
  confirmDialogConfirmText.value = 'Activar';
  confirmDialogConfirmColor.value = 'success';
  currentAction.value = 'activate';
  showConfirmDialog.value = true;
}

function handleCancelAction() {
  console.log('Acción de rol cancelada por el usuario.');
  rolToDeleteId.value = null;
  rolToActivateId.value = null;
  rolToDeletePermanentlyId.value = null;
  currentAction.value = '';
  showConfirmDialog.value = false;
}

function resetForm() {
  nombre.value = ''
  descripcion.value = ''
  estado.value = 'activo'
  isEditing.value = false
  editingRolId.value = null
  rolToDeleteId.value = null
  rolToActivateId.value = null
  rolToDeletePermanentlyId.value = null
}

onMounted(() => {
  cargarRoles();
  sortByIdDesc();
});

const filteredRoles = computed(() => {
  let rolesFiltrados = roles.value;

  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    rolesFiltrados = rolesFiltrados.filter(r =>
      r.nombre.toLowerCase().includes(searchTerm) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(searchTerm))
    );
  }

  if (filtroEstadoTabla.value === 'activo') {
    rolesFiltrados = rolesFiltrados.filter(r => r.estado === 'activo');
  } else if (filtroEstadoTabla.value === 'inactivo') {
    rolesFiltrados = rolesFiltrados.filter(r => r.estado === 'inactivo');
  }

  return rolesFiltrados;
});

const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }];
};
</script>

<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Gestión de Roles</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitForm" class="form" style="color: black">
          <v-row>
            <v-col cols="12">
              <v-text-field label="Nombre del Rol" v-model="nombre" required outlined />
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Descripción del Rol"
                v-model="descripcion"
                outlined
                counter
                maxlength="500"
                hint="Proporciona una breve descripción del rol."
              />
            </v-col>
            <v-col cols="12" v-if="isEditing"> <v-select
                label="Estado del Rol"
                v-model="estado"
                :items="['activo', 'inactivo']"
                outlined
                required
              ></v-select>
            </v-col>
          </v-row>

          <div class="d-flex justify-start">
            <v-btn v-if="isEditing" color="secondary" @click="resetForm" class="mr-2">Cancelar</v-btn>
            <v-btn v-if="!isEditing" color="grey" text @click="resetForm" class="mr-2">Limpiar</v-btn>
            <v-btn color="primary" type="submit">Guardar Rol</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">Listado de Roles</v-card-title>
      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-text-field v-model="search" label="Buscar rol" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            v-model="filtroEstadoTabla"
            :items="[{ title: 'Activos', value: 'activo' }, { title: 'Inactivos', value: 'inactivo' }, { title: 'Todos', value: 'todos' }]"
            label="Filtrar por Estado"
            outlined
            dense
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="6" class="d-flex justify-end">
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
        :items="filteredRoles" item-value="id"
        v-model:sort-by="sortBy"
        class="elevation-1"
      >
        <template v-slot:item.estado="{ item }">
          <v-chip :color="item.estado === 'activo' ? 'green' : 'red'" variant="flat" size="small">
            {{ item.estado === 'activo' ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editRol(item)" class="mr-1" :disabled="item.estado === 'inactivo'">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteRol(item.id)" v-if="item.estado === 'activo'">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
          <v-btn icon @click="handleActivateRol(item.id)" v-else>
            <v-icon color="success">mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeletePermanentlyRol(item.id)" class="ml-1">
            <v-icon color="grey darken-2">mdi-eraser</v-icon> </v-btn>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="info" icon="mdi-information">
            No hay roles disponibles.
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
</style>