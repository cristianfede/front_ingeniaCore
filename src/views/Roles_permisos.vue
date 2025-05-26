<template>
  <v-container>
    <v-card class="pa-6 elevation-2">
      <v-card-title class="text-h5 text-center mb-4">Gestión de Asignación de Permisos</v-card-title>

      <v-form @submit.prevent="submitForm">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedRolId" :items="roles"
              item-title="nombre"
              item-value="id"
              label="Seleccionar Rol"
              :rules="[v => v !== null || 'Rol es requerido']" required
              variant="outlined"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedItem"
              :items="items"
              item-title="nombre"
              item-value="id"
              label="Seleccionar Ítem Específico (Opcional)"
              clearable
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="pa-4 elevation-1">
              <v-card-title class="text-subtitle1">Permisos Generales:</v-card-title>
              <v-list dense>
                <v-list-item v-for="permiso in permisos" :key="permiso.id">
                  <v-list-item-content>
                    <v-checkbox
                      v-model="selectedPermisos"
                      :label="permiso.nombre"
                      :value="permiso.id"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-4 elevation-1">
              <v-card-title class="text-subtitle1">Vistas Asignables (Permiso 'Ver' a estas Vistas):</v-card-title>
              <v-list dense>
                <v-list-item v-for="item in items" :key="item.id">
                  <v-list-item-content>
                    <v-checkbox
                      v-model="selectedVistas"
                      :label="item.nombre"
                      :value="item.id"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col class="d-flex justify-center">
            <v-btn color="primary" type="submit" class="mr-2">Asignar Permisos</v-btn>
            <v-btn color="grey" @click="resetForm">Limpiar</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <v-divider class="my-6"></v-divider>

    <v-card class="pa-6 elevation-2">
      <v-card-title class="text-h6 text-center mb-4">Asignaciones Existentes para el Rol Seleccionado</v-card-title>
      <v-text-field
        v-model="search"
        label="Buscar asignaciones"
        append-icon="mdi-magnify"
        single-line
        hide-details
        class="mb-4"
        variant="outlined"
      ></v-text-field>

      <v-data-table
        :headers="headers"
        :items="filteredAsignaciones"
        item-value="id" class="elevation-1"
        :loading="loadingAsignaciones"
        loading-text="Cargando asignaciones..."
        no-data-text="Selecciona un rol para ver sus asignaciones."
      >
        <template v-slot:item.rol="{ item }">
          {{ item.rol ? item.rol.nombre : 'N/A' }}
        </template>
        <template v-slot:item.item="{ item }">
          {{ item.item ? item.item.nombre : 'N/A' }}
        </template>
        <template v-slot:item.permiso="{ item }">
          {{ item.permiso ? item.permiso.nombre : 'N/A' }}
        </template>

        <template v-slot:item.acciones="{ item }">
          <v-icon small class="mr-2" @click="editAsignacion(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteAsignacionConfirm(item)">mdi-delete</v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">¿Estás seguro de eliminar esta asignación?</v-card-title>
        <v-card-text>Esta acción no se puede deshacer.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancelar</v-btn>
          <v-btn color="red-darken-1" variant="text" @click="deleteAsignacionConfirmado">Eliminar</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="showAlertMessage"
      :color="alertType"
      timeout="3000"
      bottom
      right
    >
      {{ alertMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
// Asegúrate de que las interfaces Rol, Permiso, Item, AsignacionPermiso, CreateAsignacionData
// estén correctamente definidas en Roles_permisosService.ts
import RolesPermisosService, { Rol, Permiso, Item, AsignacionPermiso, CreateAsignacionData } from '../services/Roles_permisosService';

// Variables reactivas para los datos maestros y selecciones del formulario
const roles = ref<Rol[]>([]);
const permisos = ref<Permiso[]>([]);
const items = ref<Item[]>([]);

const selectedRolId = ref<number | null>(null); // CAMBIO: Ahora es un número (ID) o null
const selectedPermisos = ref<number[]>([]);
const selectedVistas = ref<number[]>([]);
const selectedItem = ref<Item | null>(null);

// Variables para la tabla de asignaciones
const asignaciones = ref<AsignacionPermiso[]>([]);
const loadingAsignaciones = ref(false);
const search = ref(''); // Para el buscador de la tabla

// Headers de la tabla (asegúrate de que las 'key' coincidan con la estructura de tu AsignacionPermiso)
const headers = [
  { title: 'Rol', key: 'rol.nombre' },
  { title: 'Ítem', key: 'item.nombre' },
  { title: 'Permiso', key: 'permiso.nombre' },
  { title: 'Acciones', key: 'acciones', sortable: false },
];

// Variables para el diálogo de eliminación
const dialogDelete = ref(false);
const itemToDelete = ref<AsignacionPermiso | null>(null);

// Variables para alertas
const showAlertMessage = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'error' | 'info'>('info');

const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
  alertMessage.value = message;
  alertType.value = type;
  showAlertMessage.value = true;
};

// --- Funciones de Carga de Datos Maestros ---
const fetchRoles = async () => {
  try {
    roles.value = await RolesPermisosService.getRoles();
  } catch (error) {
    console.error('Error al cargar roles:', error);
    showAlert('Error al cargar los roles.', 'error');
  }
};

const fetchPermisos = async () => {
  try {
    permisos.value = await RolesPermisosService.getPermisos();
  } catch (error) {
    console.error('Error al cargar permisos:', error);
    showAlert('Error al cargar los permisos.', 'error');
  }
};

const fetchItems = async () => {
  try {
    items.value = await RolesPermisosService.getItems();
  } catch (error) {
    console.error('Error al cargar ítems:', error);
    showAlert('Error al cargar los ítems.', 'error');
  }
};

// --- Función para cargar asignaciones por Rol (Se dispara al seleccionar un rol) ---
const fetchAsignacionesPorRol = async (rolId: number) => {
  loadingAsignaciones.value = true;
  try {
    const fetchedAsignaciones = await RolesPermisosService.getAsignacionesPorRol(rolId);
    asignaciones.value = fetchedAsignaciones;
  } catch (error) {
    console.error('Error al cargar asignaciones por rol:', error);
    showAlert('Error al cargar asignaciones de permisos para el rol seleccionado.', 'error');
  } finally {
    loadingAsignaciones.value = false;
  }
};

// --- Lógica del Formulario ---
const submitForm = async () => {
  // CAMBIO: Ahora verificamos selectedRolId directamente
  if (selectedRolId.value === null) {
    showAlert('Por favor, selecciona un rol.', 'error');
    return;
  }

  const data: CreateAsignacionData = {
    rolId: selectedRolId.value, // CAMBIO: Usamos selectedRolId directamente
    itemId: selectedItem.value ? selectedItem.value.id : null,
    selectedPermisos: selectedPermisos.value,
    selectedVistas: selectedVistas.value,
  };

  try {
    await RolesPermisosService.createAsignacion(data);
    showAlert('Asignaciones guardadas exitosamente.', 'success');
    // Después de guardar, recargar las asignaciones para el rol actual
    // CAMBIO: Verificamos selectedRolId
    if (selectedRolId.value !== null) {
      await fetchAsignacionesPorRol(selectedRolId.value);
    }
    resetFormSelections(); // Limpiar solo las selecciones del formulario, no el rol.
  } catch (error) {
    console.error('Error al crear asignación:', error);
    showAlert('Error al guardar asignaciones: ' + (error as Error).message, 'error');
  }
};

const resetFormSelections = () => {
  selectedPermisos.value = [];
  selectedVistas.value = [];
  selectedItem.value = null;
};

const resetForm = () => {
  selectedRolId.value = null; // CAMBIO: Limpiamos selectedRolId
  resetFormSelections();
  asignaciones.value = []; // Limpiar la tabla también
  search.value = '';
};

// --- Lógica de Edición (Placeholder) ---
const editAsignacion = (item: AsignacionPermiso) => {
  // Esta función es un placeholder. La edición de asignaciones compuestas
  // puede ser compleja. Una estrategia común es:
  // 1. Cargar los datos de 'item' de vuelta al formulario.
  // 2. Permitir al usuario modificar.
  // 3. Al guardar, se usa la lógica de eliminación/creación de `createAsignacion`.
  showAlert('Funcionalidad de edición no implementada. Considera eliminar y recrear si los cambios son menores.', 'info');
};

// --- Lógica de Eliminación ---
const deleteAsignacionConfirm = (item: AsignacionPermiso) => {
  itemToDelete.value = item;
  dialogDelete.value = true;
};

const closeDelete = () => {
  dialogDelete.value = false;
  itemToDelete.value = null;
};

const deleteAsignacionConfirmado = async () => {
  if (itemToDelete.value) {
    try {
      // Asegúrate de que tu AsignacionPermiso tenga rolId, permisoId, itemId
      await RolesPermisosService.deleteAsignacion(
        itemToDelete.value.rolId,
        itemToDelete.value.permisoId,
        itemToDelete.value.itemId
      );
      showAlert('Asignación eliminada exitosamente.', 'success');
      // Recargar las asignaciones después de la eliminación
      // CAMBIO: Verificamos selectedRolId
      if (selectedRolId.value !== null) {
        await fetchAsignacionesPorRol(selectedRolId.value);
      } else {
        asignaciones.value = []; // Si no hay rol seleccionado, limpiar la tabla
      }
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      showAlert('Error al eliminar asignación: ' + (error as Error).message, 'error');
    } finally {
      closeDelete(); // Cerrar el diálogo de eliminación
    }
  }
};

// --- Propiedad computada para filtrar la tabla ---
const filteredAsignaciones = computed(() => {
  if (!search.value) {
    return asignaciones.value;
  }
  const lowerCaseSearch = search.value.toLowerCase();
  return asignaciones.value.filter(asignacion =>
    (asignacion.rol?.nombre || '').toLowerCase().includes(lowerCaseSearch) ||
    (asignacion.item?.nombre || '').toLowerCase().includes(lowerCaseSearch) ||
    (asignacion.permiso?.nombre || '').toLowerCase().includes(lowerCaseSearch)
  );
});

// --- Lifecycle Hook ---
onMounted(async () => {
  await Promise.all([
    fetchRoles(),
    fetchPermisos(),
    fetchItems(),
  ]);
});

// --- Watcher para selectedRolId (Dispara la carga de asignaciones al cambiar el rol) ---
// CAMBIO: Observamos selectedRolId que es de tipo number | null
watch(selectedRolId, async (newRolId) => {
  resetFormSelections(); // Limpiar las selecciones de permisos y vistas al cambiar de rol
  if (newRolId !== null) { // Si hay un ID de rol seleccionado
    await fetchAsignacionesPorRol(newRolId); // Llamamos con el ID directamente
  } else {
    asignaciones.value = []; // Limpiar asignaciones si no hay rol seleccionado
  }
});
</script>

<style scoped>
/* Puedes añadir estilos específicos para este componente aquí si es necesario */
.v-card-title {
  font-weight: bold;
}
.v-list-item-content {
  padding: 0;
}
</style>