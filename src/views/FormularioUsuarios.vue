<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '../services/userService'
import ConfirmDialog from '../components/Confirmardialogo.vue' // Importa el nuevo componente

const nombre = ref('')
const apellido = ref('')
const telefono = ref('')
const correo = ref('')
const password = ref('')
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})
const isEditing = ref(false)
const editingUserId = ref<number | null>(null)

// --- Nuevas variables de estado para los modales de confirmación ---
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref(''); // 'create', 'update', 'delete'
const userToDeleteId = ref<number | null>(null);
// ------------------------------------------------------------------

function editUser(user: any) {
  isEditing.value = true
  editingUserId.value = user.id
  nombre.value = user.nombre
  apellido.value = user.apellido
  telefono.value = user.telefono
  correo.value = user.correo
  password.value = '' // No precargamos la contraseña por seguridad
}

async function submit() {
  // Primero, validación básica del formulario (puedes añadir más reglas)
  if (!nombre.value || !apellido.value || !correo.value || !telefono.value || (!isEditing.value && !password.value)) {
    snackbar.value = {
      show: true,
      message: 'Por favor, completa todos los campos requeridos.',
      color: 'warning',
    };
    return;
  }

  // Configura el modal de confirmación según la acción
  if (isEditing.value) {
    confirmDialogTitle.value = 'Confirmar Actualización';
    confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este usuario?';
    confirmDialogConfirmText.value = 'Actualizar';
    confirmDialogConfirmColor.value = 'primary';
    currentAction.value = 'update';
  } else {
    confirmDialogTitle.value = 'Confirmar Creación';
    confirmDialogMessage.value = '¿Estás seguro de que quieres crear este usuario?';
    confirmDialogConfirmText.value = 'Crear';
    confirmDialogConfirmColor.value = 'success'; // Un color verde para crear
    currentAction.value = 'create';
  }
  showConfirmDialog.value = true; // Muestra el modal
}

async function handleConfirmAction() {
  snackbar.value.show = false; // Oculta cualquier snackbar anterior

  try {
    if (currentAction.value === 'create') {
      const nuevoUsuario = await crearUsuario({
        nombre: nombre.value,
        apellido: apellido.value,
        telefono: telefono.value,
        correo: correo.value,
        password: password.value,
      });
      usuarios.value.push(nuevoUsuario);
      sortBy.value = [{ key: 'id', order: 'desc' }];
      snackbar.value = { show: true, message: 'Usuario creado exitosamente.', color: 'success' };
    } else if (currentAction.value === 'update') {
      const userDataToUpdate: any = {
        nombre: nombre.value,
        apellido: apellido.value,
        telefono: telefono.value,
        correo: correo.value,
      };
      if (password.value) { // Solo envía la contraseña si se ha modificado
        userDataToUpdate.password = password.value;
      }
      const actualizado = await actualizarUsuario(editingUserId.value!, userDataToUpdate);
      const index = usuarios.value.findIndex(u => u.id === editingUserId.value);
      if (index !== -1) usuarios.value[index] = actualizado;
      snackbar.value = { show: true, message: 'Usuario actualizado correctamente.', color: 'success' };
    } else if (currentAction.value === 'delete') {
      if (userToDeleteId.value !== null) {
        await eliminarUsuario(userToDeleteId.value);
        usuarios.value = usuarios.value.filter(u => u.id !== userToDeleteId.value);
        snackbar.value = { show: true, message: 'Usuario eliminado correctamente.', color: 'success' };
      }
    }
    // Limpiar formulario y estado de edición después de una operación exitosa
    resetForm(); // Llama a la nueva función de reseteo
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || 'Error al procesar la operación.';
    snackbar.value = { show: true, message: errorMessage, color: 'error' };
  } finally {
    showConfirmDialog.value = false; // Asegura que el modal se cierre
    currentAction.value = ''; // Resetea la acción actual
  }
}

// Nueva función para resetear el formulario y el estado de edición
function resetForm() {
  nombre.value = '';
  apellido.value = '';
  telefono.value = '';
  correo.value = '';
  password.value = '';
  isEditing.value = false; // Importante para que el botón "Limpiar" aparezca al terminar de editar
  editingUserId.value = null;
  userToDeleteId.value = null;
}


const usuarios = ref<any[]>([])
const search = ref('')
type MySortItem = {
  key: string
  order: boolean | 'asc' | 'desc' | undefined
}

const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]); 

const sortDesc = ref(false) 

const headers = [
  { title: 'ID', key: 'id', sortable: false }, 
  { title: 'Nombre', key: 'nombre', sortable: false }, 
  { title: 'Apellido', key: 'apellido', sortable: false }, 
  { title: 'Correo', key: 'correo', sortable: false }, 
  { title: 'Teléfono', key: 'telefono', sortable: false }, 
  { title: 'Acciones', key: 'actions', sortable: false },
]

const sortByIdAsc = () => {
  sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
  sortBy.value = [{ key: 'id', order: 'desc' }];
};

onMounted(async () => {
  await cargarUsuarios();
  sortByIdAsc(); 
})

async function cargarUsuarios() {
  try {
    usuarios.value = await obtenerUsuarios()
  } catch (err) {
    snackbar.value = {
      show: true,
      message: 'Error al cargar usuarios',
      color: 'error',
    }
  }
}

const filteredUsers = computed(() =>
  usuarios.value.filter((u) =>
    Object.values(u).some((val) => String(val).toLowerCase().includes(search.value.toLowerCase()))
  )
)

function handleDeleteUser(id: number) {
  userToDeleteId.value = id; // Guarda el ID del usuario a eliminar
  confirmDialogTitle.value = 'Confirmar Eliminación';
  confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar a este usuario? Esta acción es irreversible.';
  confirmDialogConfirmText.value = 'Eliminar';
  confirmDialogConfirmColor.value = 'error'; // Color rojo para eliminar
  currentAction.value = 'delete';
  showConfirmDialog.value = true; // Muestra el modal
}

function handleCancelAction() {
  console.log('Acción cancelada por el usuario.');
  userToDeleteId.value = null;
  currentAction.value = '';
}
</script>

<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center"> Formulario de Usuario </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submit" class="form" style="color: black">
          <v-row>
            <v-col cols="12" md="6"> <v-text-field label="Nombre" v-model="nombre" required outlined /> </v-col>
            <v-col cols="12" md="6"> <v-text-field label="Apellido" v-model="apellido" required outlined /> </v-col>
            <v-col cols="12" md="6"> <v-text-field label="Email" v-model="correo" type="email" required outlined /> </v-col>
            <v-col cols="12" md="6"> <v-text-field label="Teléfono" v-model="telefono" type="tel" required outlined /> </v-col>
            <v-col cols="12" md="6"> <v-text-field label="Contraseña" v-model="password" type="password" required minlength="6" outlined /> </v-col>
          </v-row>
          <div class="d-flex justify-start">
            <v-btn v-if="isEditing" color="secondary" @click="resetForm" class="mr-2">Cancelar</v-btn>
            
            <v-btn v-if="!isEditing" color="grey" text @click="resetForm" class="mr-2">Limpiar</v-btn>
            
            <v-btn color="primary" type="submit">Guardar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">
          Lista de Usuarios
      </v-card-title>
      
      <v-row align="center" class="px-4 pb-4">
        <v-col cols="12" sm="6" md="5" lg="4"> <v-text-field v-model="search" label="Buscar usuario" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
        </v-col>
        
        <v-col cols="12" sm="6" md="7" lg="8" class="d-flex justify-start"> <v-btn small @click="sortByIdAsc" class="mr-2" color="#1976D2" dark>
            <v-icon left>mdi-sort-ascending</v-icon> Más Antiguos
          </v-btn>
          <v-btn small @click="sortByIdDesc" color="#1976D2" dark>
            <v-icon left>mdi-sort-descending</v-icon> Más Recientes
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table :headers="headers" :items="filteredUsers" item-value="id" v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc" class="elevation-1">
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editUser(item)" class="mr-1">
            <v-icon color="primary">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="handleDeleteUser(item.id)">
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