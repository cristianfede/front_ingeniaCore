<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '../services/userService'

const nombre = ref('')
const apellido = ref('')
const telefono = ref('')
const correo = ref('')
const password = ref('')
// Snackbar para mensajes de éxito o error
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})
const isEditing = ref(false)
const editingUserId = ref<number | null>(null)

function editUser(user: any) {
  isEditing.value = true
  editingUserId.value = user.id
  nombre.value = user.nombre
  apellido.value = user.apellido
  telefono.value = user.telefono
  correo.value = user.correo
  password.value = ''
}


async function submit() {
  snackbar.value.show = false

  try {
    if (isEditing.value && editingUserId.value !== null) {
      // Actualizar usuario
      const actualizado = await actualizarUsuario(editingUserId.value, {
        nombre: nombre.value,
        apellido: apellido.value,
        telefono: telefono.value,
        correo: correo.value,
        password: password.value, // si no se cambia, backend debe ignorar o dejar igual
      })
      //hasta aqui actualiza db
      
      // Actualizar la lista localmente
      const index = usuarios.value.findIndex(u => u.id === editingUserId.value)
      if (index !== -1) usuarios.value[index] = actualizado

      snackbar.value = {
        show: true,
        message: 'Usuario actualizado correctamente.',
        color: 'success',
      }
    } else {
      // Crear usuario nuevo
      const nuevoUsuario = await crearUsuario({
        nombre: nombre.value,
        apellido: apellido.value,
        telefono: telefono.value,
        correo: correo.value,
        password: password.value,
      })

      usuarios.value.push(nuevoUsuario)
      snackbar.value = {
        show: true,
        message: 'Usuario creado exitosamente.',
        color: 'success',
      }
    }

    // Limpiar formulario y estado edición
    nombre.value = ''
    apellido.value = ''
    telefono.value = ''
    correo.value = ''
    password.value = ''
    isEditing.value = false
    editingUserId.value = null
  } catch (err: any) {
    snackbar.value = {
      show: true,
      message: err?.response?.data?.message || 'Error al crear el usuario',
      color: 'error',
    }
  }
}
function cancelEdit() {
  nombre.value = ''
  apellido.value = ''
  telefono.value = ''
  correo.value = ''
  password.value = ''
  isEditing.value = false
  editingUserId.value = null
}

// Lista de usuarios
const usuarios = ref<any[]>([])
const search = ref('')
type MySortItem = {
  key: string
  order: boolean | 'asc' | 'desc' | undefined
}

const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }])

const sortDesc = ref(false)

// Cabeceras para la tabla
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Apellido', key: 'apellido' },
  { title: 'Correo', key: 'correo' },
  { title: 'Teléfono', key: 'telefono' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

// Obtener lista de usuarios al cargar
onMounted(async () => {
  await cargarUsuarios()
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

// Filtro de búsqueda
const filteredUsers = computed(() =>
  usuarios.value.filter((u) =>
    Object.values(u).some((val) => String(val).toLowerCase().includes(search.value.toLowerCase()))
  )
)

async function handleDeleteUser(id: number) {
  try {
    await eliminarUsuario(id)
    usuarios.value = usuarios.value.filter(u => u.id !== id)
    snackbar.value = {
      show: true,
      message: 'Usuario eliminado correctamente',
      color: 'success',
    }
  } catch (error: any) {
    snackbar.value = {
      show: true,
      message: error.message || 'Error al eliminar usuario',
      color: 'error',
    }
  }
}

</script>


<!-- <template>
  <form @submit.prevent="submit" class="form" style="color: black;">
    <div>
      <label>Nombre</label>
      <input v-model="nombre" type="text" required />
    </div>
    <div>
      <label>Apellido</label>
      <input v-model="apellido" type="text" required />
    </div>
    <div>
      <label>Teléfono</label>
      <input v-model="telefono" type="text" required />
    </div>
    <div>
      <label>Correo</label>
      <input v-model="correo" type="email" required />
    </div>
    <div>
      <label>Contraseña</label>
      <input v-model="password" type="password" required minlength="6" />
    </div>

    <button type="submit">Crear Usuario</button>

    <p v-if="error" style="color: red">{{ error }}</p>
    <p v-if="mensajeExito" style="color: green">{{ mensajeExito }}</p>
  </form>
</template> -->
<template>
  <v-container class="py-5">
    <!-- Formulario de Usuario -->
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center"> Formulario de Usuario </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submit" class="form" style="color: black">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field label="Nombre" v-model="nombre" required outlined />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field label="Apellido" v-model="apellido" required outlined />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field label="Email" v-model="correo" type="email" required outlined />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field label="Teléfono" v-model="telefono" type="tel" required outlined />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field label="Contraseña" v-model="password" type="password" required minlength="6" outlined />
            </v-col>
          </v-row>
          <v-btn v-if="isEditing" color="secondary" @click="cancelEdit">Cancelar</v-btn>
          <v-btn color="primary" type="submit">Guardar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">Lista de Usuarios</v-card-title>

      <v-text-field v-model="search" label="Buscar usuario" prepend-inner-icon="mdi-magnify" class="mb-4" outlined />

      <v-data-table :headers="headers" :items="filteredUsers" item-value="id" v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc" class="elevation-1">
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="editUser(item)">
                <v-list-item-title>Actualizar</v-list-item-title>
              </v-list-item>

              <v-list-item @click="item.id !== undefined && handleDeleteUser(item.id)">
                <v-list-item-title>Eliminar</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn text @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
