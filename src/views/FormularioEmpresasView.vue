<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Formulario de Empresa</v-card-title>
      <v-card-text>
        <v-form ref="empresaForm" @submit.prevent="submit" class="form" style="color: black">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Nombre de la Empresa"
                v-model="nombre"
                outlined
                :rules="[
                  v => !!v || 'El nombre de la empresa es requerido',
                  v => (v && v.length >= 3) || 'El nombre debe tener al menos 3 caracteres',
                  validateNombreUnico
                ]"
              /> </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="NIT"
                v-model="nit"
                outlined
                :rules="[
                  v => !!v || 'El NIT es requerido',
                  v => /^[0-9-]+$/.test(v) || 'El NIT debe contener solo números y guiones'
                ]"
              /> </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Correo de Contacto"
                v-model="correo"
                type="email"
                outlined
                :rules="[
                  v => !!v || 'El correo de contacto es requerido',
                  v => /.+@.+\..+/.test(v) || 'Formato de correo electrónico inválido'
                ]"
              /> </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Teléfono"
                v-model="telefono"
                outlined
                :rules="[
                  v => !!v || 'El teléfono es requerido',
                  v => /^\d+$/.test(v) || 'El teléfono debe contener solo números',
                  v => (v && v.length >= 7) || 'El teléfono debe tener al menos 7 dígitos'
                ]"
              /> </v-col>
            <v-col cols="12" v-if="isEditing">
              <v-select
                label="Estado de la Empresa"
                v-model="estado"
                :items="['activo', 'inactivo']"
                outlined
                :rules="[v => !!v || 'El estado de la empresa es requerido']"
              /> </v-col>
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
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-text-field v-model="search" label="Buscar empresa" prepend-inner-icon="mdi-magnify" outlined dense hide-details /> </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select
            v-model="filtroEstadoTabla"
            :items="[{ title: 'Activas', value: 'activo' }, { title: 'Inactivas', value: 'inactivo' }, { title: 'Todas', value: 'todos' }]"
            label="Filtrar por Estado"
            outlined
            dense
            hide-details
          /> </v-col>
        <v-col cols="12" sm="6" md="4" lg="6" class="d-flex justify-end">
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
        class="elevation-1"
      >
        <template v-slot:item.estado="{ item }">
          <v-chip :color="item.estado === 'activo' ? 'green' : 'red'" variant="flat" size="small">
            {{ item.estado === 'activo' ? 'Activa' : 'Inactiva' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editEmpresa(item)" class="mr-1" :disabled="item.estado === 'inactivo'">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleInactivateEmpresa(item.id)" v-if="item.estado === 'activo'">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
          <v-btn icon @click="handleActivateEmpresa(item.id)" v-else>
            <v-icon color="success">mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeletePermanentlyEmpresa(item.id)" class="ml-1">
            <v-icon color="grey darken-2">mdi-eraser</v-icon>
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="info" icon="mdi-information">
            No hay empresas disponibles.
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
    /> </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { crearEmpresa, obtenerEmpresas, actualizarEmpresa, inactivarEmpresa, activarEmpresa, eliminarEmpresaPermanentemente, verificarNombreEmpresaUnico } from '../services/empresasService';
import ConfirmDialog from '../components/Confirmardialogo.vue';

const nombre = ref('');
const nit = ref('');
const correo = ref('');
const telefono = ref('');
const estado = ref<'activo' | 'inactivo'>('activo'); // Valor por defecto para el estado y tipo específico

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});
const isEditing = ref(false);
const editingEmpresaId = ref<number | null>(null);

const empresaForm = ref<any>(null);

const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');

type ActionType = 'create' | 'update' | 'inactivate' | 'activate' | 'delete_permanent';
const currentAction = ref<ActionType | ''>('');
const empresaToProcessId = ref<number | null>(null);

const empresas = ref<any[]>([]);
const search = ref('');
type MySortItem = {
  key: string;
  order: boolean | 'asc' | 'desc' | undefined;
};

const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'desc' }]);

const filtroEstadoTabla = ref('todos');

const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Nombre', key: 'nombre', sortable: false },
  { title: 'NIT', key: 'nit', sortable: false },
  { title: 'Correo', key: 'correo', sortable: false },
  { title: 'Telefono', key: 'telefono', sortable: false },
  { title: 'Proyectos', key: 'proyectos', sortable: false },
  { title: 'Estado', key: 'estado', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
];

const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }];
};

watch(filtroEstadoTabla, async (newVal) => {
  await cargarEmpresas(newVal);
});

onMounted(async () => {
  await cargarEmpresas(filtroEstadoTabla.value);
});

async function cargarEmpresas(estadoFiltro?: string) {
  try {
    empresas.value = await obtenerEmpresas(estadoFiltro);
  } catch (err) {
    console.error('Error al cargar empresas:', err);
    snackbar.value = {
      show: true,
      message: 'Error al cargar empresas',
      color: 'error',
    };
  }
}

const filteredEmpresas = computed(() =>
  empresas.value.filter((e) =>
    Object.values(e).some((val) => String(val).trim().toLowerCase().includes(search.value.toLowerCase()))
  )
);

function editEmpresa(empresa: any) {
  isEditing.value = true;
  editingEmpresaId.value = empresa.id;
  nombre.value = empresa.nombre;
  nit.value = empresa.nit;
  correo.value = empresa.correo;
  telefono.value = empresa.telefono;
  estado.value = empresa.estado;

  window.scrollTo({ top: 0, behavior: 'smooth'})
}

async function validateNombreUnico(value: string) {
  if (!value) return true;
  
  if (isEditing.value && editingEmpresaId.value !== null) {
    const originalEmpresa = empresas.value.find(e => e.id === editingEmpresaId.value);
    if (originalEmpresa && originalEmpresa.nombre === value) {
      return true;
    }
  }

  try {
    const isUnique = await verificarNombreEmpresaUnico(value);
    return isUnique || 'Ya existe una empresa con este nombre.';
  } catch (error) {
    console.error('Error al verificar unicidad del nombre:', error);
    return 'Error al verificar la unicidad del nombre.';
  }
}

async function submit() {
  const { valid } = await empresaForm.value.validate();

  if (!valid) {
    snackbar.value = {
      show: true,
      message: 'Por favor, completa correctamente todos los campos requeridos.',
      color: 'warning',
    };
    return;
  }

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
  showConfirmDialog.value = true;
}

async function handleConfirmAction() {
  snackbar.value.show = false;

  try {
    const empresaData = {
      nombre: nombre.value,
      nit: nit.value,
      correo: correo.value,
      telefono: telefono.value,
      estado: estado.value,
    };

    if (currentAction.value === 'create') {
      await crearEmpresa(empresaData);
      snackbar.value = { show: true, message: 'Empresa creada exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      await actualizarEmpresa(editingEmpresaId.value!, empresaData);
      snackbar.value = { show: true, message: 'Empresa actualizada correctamente.', color: 'success' };
    } else if (currentAction.value === 'inactivate') {
      if (empresaToProcessId.value !== null) {
        await inactivarEmpresa(empresaToProcessId.value);
        snackbar.value = { show: true, message: 'Empresa inactivada correctamente.', color: 'success' };
      }
    } else if (currentAction.value === 'activate') {
      if (empresaToProcessId.value !== null) {
        await activarEmpresa(empresaToProcessId.value);
        snackbar.value = { show: true, message: 'Empresa activada correctamente.', color: 'success' };
      }
    } else if (currentAction.value === 'delete_permanent') {
      if (empresaToProcessId.value !== null) {
        await eliminarEmpresaPermanentemente(empresaToProcessId.value);
        snackbar.value = { show: true, message: 'Empresa eliminada permanentemente.', color: 'success' };
      }
    }

    await cargarEmpresas(filtroEstadoTabla.value);
    resetForm();
  } catch (err: any) {
    const errorMessage = err?.message || 'Error al procesar la operación.';
    snackbar.value = { show: true, message: errorMessage, color: 'error' };
  } finally {
    showConfirmDialog.value = false;
    currentAction.value = '';
    empresaToProcessId.value = null;
  }
}

function handleInactivateEmpresa(id: number) {
  empresaToProcessId.value = id;
  confirmDialogTitle.value = 'Confirmar Inactivación';
  confirmDialogMessage.value = '¿Estás seguro de que quieres inactivar esta empresa? Los usuarios y proyectos asociados no podrán interactuar con ella.';
  confirmDialogConfirmText.value = 'Inactivar';
  confirmDialogConfirmColor.value = 'red';
  currentAction.value = 'inactivate';
  showConfirmDialog.value = true;
}

function handleActivateEmpresa(id: number) {
  empresaToProcessId.value = id;
  confirmDialogTitle.value = 'Confirmar Activación';
  confirmDialogMessage.value = '¿Estás seguro de que quieres activar esta empresa? Volverá a estar operativa para usuarios y proyectos.';
  confirmDialogConfirmText.value = 'Activar';
  confirmDialogConfirmColor.value = 'success';
  currentAction.value = 'activate';
  showConfirmDialog.value = true;
}

function handleDeletePermanentlyEmpresa(id: number) {
  empresaToProcessId.value = id;
  confirmDialogTitle.value = 'Eliminar Empresa Permanentemente';
  confirmDialogMessage.value = '¡ADVERTENCIA! ¿Estás ABSOLUTAMENTE seguro de que quieres eliminar esta empresa permanentemente? Esta acción NO se puede deshacer y eliminará todos los datos asociados. Los proyectos asociados a la empresa no se pueden eliminar por las políticas del negocio.';
  confirmDialogConfirmText.value = 'Eliminar PERMANENTEMENTE';
  confirmDialogConfirmColor.value = 'grey darken-2';
  currentAction.value = 'delete_permanent';
  showConfirmDialog.value = true;
}

function handleCancelAction() {
  console.log('Acción de empresa cancelada por el usuario.');
  empresaToProcessId.value = null;
  currentAction.value = '';
  showConfirmDialog.value = false;
}

function resetForm() {
  nombre.value = '';
  nit.value = '';
  correo.value = '';
  telefono.value = '';
  estado.value = 'activo';
  isEditing.value = false;
  editingEmpresaId.value = null;
  empresaToProcessId.value = null;
  if (empresaForm.value) {
    empresaForm.value.resetValidation();
  }
}
</script>

<style scoped>
.form {
  padding: 1rem;
}
</style>