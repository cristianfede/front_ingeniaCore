<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { obtenerRoles, crearRol, actualizarRol, eliminarRol } from '../services/rolesService'
import ConfirmDialog from '../components/Confirmardialogo.vue'

const roles = ref<any[]>([])
const nombre = ref('')
const descripcion= ref('')
const estado = ref('activo')


const search = ref('')
const isEditing = ref(false)
const editingRolId = ref<number | null>(null)

const snackbar = ref({ show: false, message: '', color: 'success' })
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmDialogConfirmText = ref('')
const confirmDialogConfirmColor = ref('')
const currentAction = ref('')
const rolToDeleteId = ref<number | null>(null)

type MySortItem = { key: string; order: boolean | 'asc' | 'desc' | undefined }
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }])
const sortDesc = ref(false)

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre del Rol', key: 'nombre' },
  { title: 'descripcion del Rol', key: 'descripcion' },
  { title: 'estado', key: 'estado' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

async function cargarRoles() {
  try {
    roles.value = await obtenerRoles()
  } catch (error) {
    snackbar.value = { show: true, message: 'Error al cargar roles.', color: 'error' }
  }
}

async function submitForm() {
  if (!nombre.value) {
    snackbar.value = {
      show: true,
      message: 'Por favor, completa el campo de nombre.',
      color: 'warning',
    }
    return
  }

  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización de Rol'
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este rol?'
    confirmDialogConfirmText.value = 'Actualizar'
    confirmDialogConfirmColor.value = 'primary'
    currentAction.value = 'update'
  } else {
    confirmDialogTitle.value = 'Confirmar Creación de Rol'
    confirmDialogMessage.value = '¿Deseas crear este nuevo rol?'
    confirmDialogConfirmText.value = 'Crear'
    confirmDialogConfirmColor.value = 'success'
    currentAction.value = 'create'
  }

  showConfirmDialog.value = true
}

async function handleConfirmAction() {
  try {
    const rolData = { nombre: nombre.value, descripcion: descripcion.value, estado: estado.value }
    if (currentAction.value === 'create') {
      const nuevoRol = await crearRol(rolData)
      roles.value.push(nuevoRol)
      sortBy.value = [{ key: 'id', order: 'desc' }]
      snackbar.value = { show: true, message: 'Rol creado exitosamente.', color: 'success' }

    } else if (currentAction.value === 'update') {
      const actualizado = await actualizarRol(editingRolId.value!, rolData)
      const index = roles.value.findIndex(r => r.id === editingRolId.value)
      if (index !== -1) Object.assign(roles.value[index], actualizado)
      snackbar.value = { show: true, message: 'Rol actualizado.', color: 'success' }

    } else if (currentAction.value === 'delete') {
      if (rolToDeleteId.value !== null) {
        await eliminarRol(rolToDeleteId.value)
        roles.value = roles.value.filter(r => r.id !== rolToDeleteId.value)
        snackbar.value = { show: true, message: 'Rol eliminado.', color: 'success' }
      }
    }

    resetForm()
  } catch (err: any) {
    snackbar.value = { show: true, message: err?.response?.data?.message || 'Error.', color: 'error' }
  } finally {
    showConfirmDialog.value = false
    currentAction.value = ''
  }
}

function editRol(rol: any) {
  isEditing.value = true
  editingRolId.value = rol.id
  nombre.value = rol.nombre
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleDeleteRol(id: number) {
  rolToDeleteId.value = id
  confirmDialogTitle.value = 'Confirmar Eliminación de Rol'
  confirmDialogMessage.value = '¿Deseas eliminar este rol? Esta acción no se puede deshacer.'
  confirmDialogConfirmText.value = 'Eliminar'
  confirmDialogConfirmColor.value = 'error'
  currentAction.value = 'delete'
  showConfirmDialog.value = true
}

function handleCancelAction() {
  rolToDeleteId.value = null
  currentAction.value = ''
  showConfirmDialog.value = false
}

function resetForm() {
  nombre.value = ''
  isEditing.value = false
  editingRolId.value = null
  rolToDeleteId.value = null
}

onMounted(() => {
  cargarRoles()
  sortByIdDesc()
})

const filteredRoles = computed(() =>
  roles.value.filter(r => r.nombre.toLowerCase().includes(search.value.toLowerCase()))
)

const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }]
}

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }]
}
</script>

<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Crear Roles</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitForm" class="form">
          <v-row>
            <v-select
  label="Select"
  :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
></v-select>
                <v-col cols="12" md="6">
              <v-text-field label="descripcion del rol" v-model="descripcion" required outlined />
            </v-col>
            <!-- Campo oculto para estado -->
            <v-text-field
              v-model="estado"
              label="Estado"
              outlined
              readonly
              hide-details
              style="display: none;"
            />

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
        <v-col cols="12" sm="6" md="5">
          <v-text-field v-model="search" label="Buscar rol" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="7" class="d-flex justify-start">
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
        :items="filteredRoles"
        item-value="id"
        v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc"
        class="elevation-1"
      >

      <template v-slot:item.descripcion = "{ item }">
       {{ item.descripcion.length > 30 ? item.descripcion.slice(0, 30) + '...' : item.descripcion }}
      </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editRol(item)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteRol(item.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
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
