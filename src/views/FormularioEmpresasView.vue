<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Formulario de Empresa</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submit" class="form" style="color: black">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field label="Nombre de la Empresa" v-model="nombre" required outlined />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field label="NIT" v-model="nit" required outlined />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field label="Correo de Contacto" v-model="correo" type="email" required outlined />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field label="telefono" v-model="telefono" type="telefono" required outlined />
            </v-col>
          </v-row>
          <div class="d-flex justify-start">
            <v-btn v-if="isEditing" color="secondary" @click="resetForm" class="mr-2">Cancelar</v-btn>
            <v-btn v-if="!isEditing" color="grey" text @click="resetForm" class="mr-2">Limpiar</v-btn>
            <v-btn color="primary" type="submit">Guardar Empresa</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">Lista de Empresas</v-card-title>
      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4">
          <v-text-field v-model="search" label="Buscar empresa" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="7" lg="8" class="d-flex justify-start">
          <v-btn small @click="sortByIdAsc" class="mr-2" color="#1976D2" dark>
            <v-icon left>mdi-sort-ascending</v-icon> Más Antiguas
          </v-btn>
          <v-btn small @click="sortByIdDesc" color="#1976D2" dark>
            <v-icon left>mdi-sort-descending</v-icon> Más Recientes
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredEmpresas"
        item-value="id"
        v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editEmpresa(item)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteEmpresa(item.id)">
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

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { crearEmpresa, obtenerEmpresas, actualizarEmpresa, eliminarEmpresa } from '../services/empresasService'; // ¡CORREGIDO: Cambiado a empresasService!
import ConfirmDialog from '../components/Confirmardialogo.vue'; // Asegúrate de que la ruta sea correcta

const nombre = ref('');
const nit = ref('');
const correo = ref('');
const telefono = ref('');

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});
const isEditing = ref(false);
const editingEmpresaId = ref<number | null>(null);

// --- Variables de estado para los modales de confirmación ---
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref(''); // 'create', 'update', 'delete'
const empresaToDeleteId = ref<number | null>(null);
// ------------------------------------------------------------------

const empresas = ref<any[]>([]); // Ahora almacena empresas
const search = ref('');
type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};

const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]);
const sortDesc = ref(false);

const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Nombre', key: 'nombre', sortable: false },
  { title: 'NIT', key: 'nit', sortable: false },
  { title: 'Correo', key: 'correo', sortable: false },
  { title: 'Telefono', key: 'telefono', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
];

const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }];
};

onMounted(async () => {
  await cargarEmpresas();
  sortByIdAsc();
});

async function cargarEmpresas() {
  try {
    empresas.value = await obtenerEmpresas();
  } catch (err) {
    snackbar.value = {
      show: true,
      message: 'Error al cargar empresas',
      color: 'error',
    };
  }
}

const filteredEmpresas = computed(() =>
  empresas.value.filter((e) =>
    Object.values(e).some((val) => String(val).toLowerCase().includes(search.value.toLowerCase()))
  )
);

function editEmpresa(empresa: any) {
  isEditing.value = true;
  editingEmpresaId.value = empresa.id;
  nombre.value = empresa.nombre;
  nit.value = empresa.nit;
  correo.value = empresa.correo;
  telefono.value = empresa.telefono;
}

async function submit() {
  // Validación básica del formulario
  if (!nombre.value || !nit.value || !correo.value || !telefono.value) {
    snackbar.value = {
      show: true,
      message: 'Por favor, completa todos los campos requeridos.',
      color: 'warning',
    };
    return;
  }

  // Configura el modal de confirmación según la acción
  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización de Empresa';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar esta empresa?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación de Empresa';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear esta empresa?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success';
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true; // Muestra el modal
}

async function handleConfirmAction() {
  snackbar.value.show = false; // Oculta cualquier snackbar anterior

  try {
    const empresaData = {
      nombre: nombre.value,
      nit: nit.value,
      correo: correo.value,
      telefono: telefono.value,
    };

    if (currentAction.value === 'create') {
      const nuevaEmpresa = await crearEmpresa(empresaData);
      empresas.value.push(nuevaEmpresa);
      sortBy.value = [{ key: 'id', order: 'desc' }];
      snackbar.value = { show: true, message: 'Empresa creada exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      const actualizado = await actualizarEmpresa(editingEmpresaId.value!, empresaData);
      const index = empresas.value.findIndex(e => e.id === editingEmpresaId.value);
      if (index !== -1) {
        Object.assign(empresas.value[index], actualizado);
      }
      snackbar.value = { show: true, message: 'Empresa actualizada correctamente.', color: 'success' };
    } else if (currentAction.value === 'delete') {
      if (empresaToDeleteId.value !== null) {
        await eliminarEmpresa(empresaToDeleteId.value);
        empresas.value = empresas.value.filter(e => e.id !== empresaToDeleteId.value);
        snackbar.value = { show: true, message: 'Empresa eliminada correctamente.', color: 'success' };
      }
    }
    resetForm();
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || 'Error al procesar la operación.';
    snackbar.value = { show: true, message: errorMessage, color: 'error' };
  } finally {
    showConfirmDialog.value = false;
    currentAction.value = '';
  }
}

function handleDeleteEmpresa(id: number) {
  empresaToDeleteId.value = id;
  confirmDialogTitle.value = 'Confirmar Eliminación de Empresa';
  confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar esta empresa? Esta acción es irreversible y afectará a los clientes asociados.';
  confirmDialogConfirmText.value = 'Eliminar';
  confirmDialogConfirmColor.value = 'error';
  currentAction.value = 'delete';
  showConfirmDialog.value = true;
}

function handleCancelAction() {
  console.log('Acción de empresa cancelada por el usuario.');
  empresaToDeleteId.value = null;
  currentAction.value = '';
  showConfirmDialog.value = false; // Asegura que el modal se cierre
}

function resetForm() {
  nombre.value = '';
  nit.value = '';
  correo.value = '';
  telefono.value = '';
  isEditing.value = false;
  editingEmpresaId.value = null;
  empresaToDeleteId.value = null;
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios, pero Vuetify y Tailwind CSS deberían manejar la mayoría */
.form {
  padding: 1rem;
}
</style>
