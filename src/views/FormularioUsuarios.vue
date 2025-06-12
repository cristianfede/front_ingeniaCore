<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// Asegúrate de que las rutas a tus servicios sean correctas
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '../services/userService'
import ConfirmDialog from '../components/Confirmardialogo.vue' // Importa tu componente de diálogo de confirmación

// --- Estados del formulario y datos ---
const nombre = ref('')
const apellido = ref('')
const telefono = ref('')
const correo = ref('')
const password = ref('')
const rol = ref('') // Estado para el ID del rol seleccionado en el formulario (v-model)
const roles = ref<any[]>([]) // Estado para almacenar los roles obtenidos de la API

// --- Estados de la UI ---
const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
})
const isEditing = ref(false)
const editingUserId = ref<number | null>(null)

// --- Variables de estado para los modales de confirmación ---
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref(''); // CORRECCIÓN: Variable 'confirmDialogMessage' declarada como ref
const confirmDialogConfirmText = ref('');
const confirmDialogConfirmColor = ref('');
const currentAction = ref(''); // 'create', 'update', 'delete'
const userToDeleteId = ref<number | null>(null);
// -----------------------------------------------------------

// --- Datos de la tabla ---
const usuarios = ref<any[]>([])
const search = ref('')
type MySortItem = {
    key: string
    order: boolean | 'asc' | 'desc' | undefined
}
// Inicialmente, la tabla se ordenará de forma ascendente (del 1 al 100)
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]);
const sortDesc = ref(false)

const headers = [
    { title: 'ID', key: 'id', sortable: false },
    { title: 'Nombre', key: 'nombre', sortable: false },
    { title: 'Apellido', key: 'apellido', sortable: false },
    { title: 'Correo', key: 'correo', sortable: false },
    { title: 'Teléfono', key: 'telefono', sortable: false },
    { title: 'Rol', key: 'rol_display_name', sortable: false }, // Campo para mostrar el nombre del rol
    { title: 'Acciones', key: 'actions', sortable: false },
]

// --- Funciones para la interacción con la API y el estado ---

/**
 * Carga los roles desde el backend.
 */
async function fetchRoles() {
    try {
        const response = await fetch('http://localhost:3333/api/roles'); // URL de tu API de roles en Adonis
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        roles.value = data;
    } catch (error: any) {
        console.error('Error al obtener los roles:', error);
        snackbar.value = { show: true, message: `Error al cargar los roles: ${error.message}`, color: 'error' };
    }
}

/**
 * Carga los usuarios desde el backend y los mapea para mostrar el nombre del rol.
 */
async function cargarUsuarios() {
    try {
        const fetchedUsers = await obtenerUsuarios();
        usuarios.value = fetchedUsers.map((user: any) => {
            const roleDisplayName = user.role ? user.role.nombre : 'N/A';
            return {
                ...user,
                rol_display_name: roleDisplayName // Crea una nueva propiedad para mostrar el nombre del rol
            };
        });
    } catch (err) {
        snackbar.value = {
            show: true,
            message: 'Error al cargar usuarios. Consulta la consola para más detalles.',
            color: 'error',
        }
        console.error('Error al cargar usuarios:', err);
    }
}

/**
 * Prepara el formulario para editar un usuario existente.
 * @param user El objeto de usuario a editar.
 */
function editUser(user: any) {
    isEditing.value = true
    editingUserId.value = user.id
    nombre.value = user.nombre
    apellido.value = user.apellido
    telefono.value = user.telefono
    correo.value = user.correo
    password.value = '' // No precargamos la contraseña por seguridad

    rol.value = user.rolId || user.rol_id || (user.role ? user.role.id : '');
}

/**
 * Abre el diálogo de confirmación antes de crear o actualizar un usuario.
 */
async function submit() {
    if (!nombre.value || !apellido.value || !correo.value || !telefono.value || (!isEditing.value && !password.value) || !rol.value) {
        snackbar.value = {
            show: true,
            message: 'Por favor, completa todos los campos requeridos, incluyendo el rol.',
            color: 'warning',
        };
        return;
    }

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
        confirmDialogConfirmColor.value = 'success';
        currentAction.value = 'create';
    }
    // Añadido para depuración: verificar los valores antes de mostrar el diálogo
    /*console.log('DEBUG: Propiedades del diálogo antes de mostrar:', {
        title: confirmDialogTitle.value,
        message: confirmDialogMessage.value,
        confirmText: confirmDialogConfirmText.value,
        confirmColor: confirmDialogConfirmColor.value,
        action: currentAction.value
    });*/
    showConfirmDialog.value = true;
}

/**
 * Ejecuta la acción confirmada (crear, actualizar, eliminar).
 */
async function handleConfirmAction() {
    snackbar.value.show = false; // Oculta cualquier snackbar previo.
    console.log('DEBUG: handleConfirmAction ejecutada para la acción:', currentAction.value);

    try {
        if (currentAction.value === 'create') {
            const userData = {
                nombre: nombre.value,
                apellido: apellido.value,
                telefono: telefono.value,
                correo: correo.value,
                password: password.value,
                rolId: rol.value, // Envía el ID del rol como 'rolId'
            };
            console.log('DEBUG: Creando usuario con datos:', userData);
            await crearUsuario(userData);
            snackbar.value = { show: true, message: 'Usuario creado exitosamente.', color: 'success' };
            await cargarUsuarios(); // Recarga la lista para incluir el nuevo usuario
            sortByIdDesc(); // Ordenar DESCENDENTE solo si se CREÓ un usuario
        } else if (currentAction.value === 'update') {
            const userDataToUpdate: any = {
                nombre: nombre.value,
                apellido: apellido.value,
                telefono: telefono.value,
                correo: correo.value,
                rolId: rol.value, // Envía el ID del rol como 'rolId'
            };
            if (password.value) {
                userDataToUpdate.password = password.value; // Solo actualiza la contraseña si se proporciona
            }
            console.log('DEBUG: Actualizando usuario con ID:', editingUserId.value, ' y datos:', userDataToUpdate);
            await actualizarUsuario(editingUserId.value!, userDataToUpdate);
            snackbar.value = { show: true, message: 'Usuario actualizado correctamente.', color: 'success' };
            await cargarUsuarios(); // Recarga la lista
            sortByIdAsc(); // Volver a ordenar ASCENDENTE para otras operaciones
        } else if (currentAction.value === 'delete') {
            if (userToDeleteId.value !== null) {
                console.log('DEBUG: Eliminando usuario con ID:', userToDeleteId.value);
                await eliminarUsuario(userToDeleteId.value);
                snackbar.value = { show: true, message: 'Usuario eliminado correctamente.', color: 'success' };
                await cargarUsuarios(); // Recarga la lista
                sortByIdAsc(); // Volver a ordenar ASCENDENTE para otras operaciones
            }
        }

        resetForm(); // Limpia el formulario después de la operación
    } catch (err: any) {
        // Captura el error completo para una mejor depuración
        console.error('ERROR en handleConfirmAction:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Error desconocido al procesar la operación.';
        snackbar.value = { show: true, message: errorMessage, color: 'error' };
    } finally {
        showConfirmDialog.value = false; // Cierra el diálogo de confirmación
        currentAction.value = ''; // Resetea la acción actual
    }
}

/**
 * Resetea todos los campos del formulario y el estado de edición.
 */
function resetForm() {
    nombre.value = '';
    apellido.value = '';
    telefono.value = '';
    correo.value = '';
    password.value = '';
    rol.value = '';
    isEditing.value = false;
    editingUserId.value = null;
    userToDeleteId.value = null;
}

/**
 * Ordena la tabla por ID de forma ascendente.
 */
const sortByIdAsc = () => {
    sortBy.value = [{ key: 'id', order: 'asc' }];
};

/**
 * Ordena la tabla por ID de forma descendente.
 */
const sortByIdDesc = () => {
    sortBy.value = [{ key: 'id', order: 'desc' }];
};

/**
 * Hook de ciclo de vida: Se ejecuta cuando el componente está montado.
 */
onMounted(async () => {
    await fetchRoles(); // Carga los roles primero
    await cargarUsuarios(); // Luego carga los usuarios
    sortByIdAsc(); // Asegura que la tabla empiece ordenada ASCENDENTE
})

/**
 * Filtra los usuarios para la tabla basándose en el término de búsqueda.
 */
const filteredUsers = computed(() =>
    usuarios.value.filter((u) =>
        Object.values(u).some((val) =>
            // Asegúrate de que 'val' no sea null/undefined antes de llamar a toLowerCase()
            String(val || '').toLowerCase().includes(search.value.toLowerCase())
        )
    )
)

/**
 * Prepara el diálogo de confirmación para eliminar un usuario.
 * @param id El ID del usuario a eliminar.
 */
function handleDeleteUser(id: number) {
    userToDeleteId.value = id;
    confirmDialogTitle.value = 'Confirmar Eliminación';
    confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar a este usuario? Esta acción es irreversible.';
    confirmDialogConfirmText.value = 'Eliminar';
    confirmDialogConfirmColor.value = 'error';
    currentAction.value = 'delete';
    showConfirmDialog.value = true;
}

/**
 * Maneja la cancelación de una acción en el diálogo de confirmación.
 */
function handleCancelAction() {
    console.log('Acción cancelada por el usuario.');
    userToDeleteId.value = null;
    currentAction.value = '';
    showConfirmDialog.value = false; // Asegúrate de cerrar el diálogo también
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

                        <v-col cols="12" md="6">
                            <v-select
                                label="Rol"
                                v-model="rol"
                                :items="roles"
                                item-title="nombre"
                                item-value="id"
                                required
                                outlined
                            ></v-select>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                label="Contraseña"
                                v-model="password"
                                type="password"
                                :required="!isEditing"
                                minlength="6"
                                outlined
                            />
                        </v-col>
                    </v-row>
                    <div class="d-flex justify-start">
                        <v-btn v-if="isEditing" color="secondary" @click="resetForm" class="mr-2">Cancelar Edición</v-btn>

                        <v-btn v-if="!isEditing" color="grey" text @click="resetForm" class="mr-2">Limpiar Formulario</v-btn>

                        <v-btn color="primary" type="submit">{{ isEditing ? 'Actualizar Usuario' : 'Crear Usuario' }}</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card outlined>
            <v-card-title class="text-h6">
                Lista de Usuarios
            </v-card-title>

            <v-row align="center" class="px-4 pb-4">
                <v-col cols="12" sm="6" md="5" lg="4">
                    <v-text-field v-model="search" label="Buscar usuario" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
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
                :items="filteredUsers"
                item-value="id"
                v-model:sort-by="sortBy"
                class="elevation-1"
                :sort-desc.sync="sortDesc"
            >
                <template v-slot:item.rol_display_name="{ item }">
                    {{ item.rol_display_name }}
                </template>

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

<style scoped>
/* Tu estilo específico para este componente */
.form {
    padding: 16px;
    border-radius: 8px;
}
.text-h5 {
    color: #1976D2; /* Color de ejemplo, ajusta a tu tema */
    font-weight: bold;
}
.text-h6 {
    color: #1976D2; /* Color de ejemplo, ajusta a tu tema */
    font-weight: bold;
}
</style>
