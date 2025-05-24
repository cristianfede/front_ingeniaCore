<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { obtenerProyectos, obtenerEmpresas, crearProyecto, actualizarProyecto, eliminarProyecto } from '../services/proyectosService'
import ConfirmDialog from '../components/Confirmardialogo.vue'; // Asegúrate de que la ruta sea correcta

const proyectos = ref<any[]>([])
const empresas = ref<any[]>([])   // <- listado de empresas
const nombre = ref('')
const empresa_id = ref<number | null>(null)

const search = ref('')
const isEditing = ref(false)
const editingProyectoId = ref<number | null>(null) // Para guardar el ID del proyecto en edición

// --- Variables de estado para notificaciones y modales de confirmación ---
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
const currentAction = ref(''); // 'create', 'update', 'delete'
const proyectoToDeleteId = ref<number | null>(null);
// ------------------------------------------------------------------

// Definición para el tipo de ordenamiento (necesario para v-data-table en Vuetify 3)
type MySortItem = {
key: string;
order: boolean | 'asc' | 'desc' | undefined;
};
const sortBy = ref<MySortItem[]>([{ key: 'id', order: 'asc' }]); // Ordenar por ID ascendente por defecto
const sortDesc = ref(false); // No usado directamente si 'order' es 'asc' o 'desc'

// Cabeceras para la tabla
const headers = [
{ title: 'ID', key: 'id' },
{ title: 'Empresa', key: 'empresa.nombre' },
{ title: 'Nombre del Proyecto', key: 'nombre' },
{ title: 'Acciones', key: 'actions', sortable: false },
]

// Cargar proyectos desde la API
async function cargarProyectos() {
try {
 proyectos.value = await obtenerProyectos()
} catch (error: any) {
console.error('Error al cargar proyectos:', error)
snackbar.value = {
show: true,
message: 'Error al cargar proyectos.',
color: 'error',
};
 }
}

async function cargarEmpresas() {
try {
empresas.value = await obtenerEmpresas()
} catch (error) {
 console.error('Error al cargar empresas:', error)
snackbar.value = {
show: true,
 message: 'Error al cargar empresas.',
 color: 'error',
 };
 }
}

// Lógica para enviar el formulario (crear/actualizar)
async function submitForm() {
 if (!nombre.value || empresa_id.value === null) {
 snackbar.value = {
show: true,
message: 'Por favor, completa todos los campos requeridos.',
color: 'warning',
 };
 return;
}

if (isEditing.value) {
confirmDialogTitle.value = 'Confirmar Actualización de Proyecto';
confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este proyecto?';
 confirmDialogConfirmText.value = 'Actualizar';
confirmDialogConfirmColor.value = 'primary';
 currentAction.value = 'update';
 } else {
confirmDialogTitle.value = 'Confirmar Creación de Proyecto';
 confirmDialogMessage.value = '¿Estás seguro de que quieres crear este proyecto?';
confirmDialogConfirmText.value = 'Crear';
 confirmDialogConfirmColor.value = 'success';
currentAction.value = 'create';
}
 showConfirmDialog.value = true;
}

// Manejar la acción de confirmación (crear, actualizar, eliminar)
async function handleConfirmAction() {
snackbar.value.show = false; // Oculta cualquier snackbar anterior

try {
const projectData = {
 nombre: nombre.value,
empresa_id: empresa_id.value,
 };

 if (currentAction.value === 'create') {
 const nuevoProyecto = await crearProyecto(projectData);
proyectos.value.push(nuevoProyecto);
 sortBy.value = [{ key: 'id', order: 'desc' }]; // Muestra el más reciente primero
 snackbar.value = { show: true, message: 'Proyecto creado exitosamente.', color: 'success' };
 } else if (currentAction.value === 'update') {
 const actualizado = await actualizarProyecto(editingProyectoId.value!, projectData);
 const index = proyectos.value.findIndex(p => p.id === editingProyectoId.value);
if (index !== -1) {
 // Actualiza el proyecto en el array con los datos recibidos
 Object.assign(proyectos.value[index], actualizado);
 }
snackbar.value = { show: true, message: 'Proyecto actualizado correctamente.', color: 'success' };
 } else if (currentAction.value === 'delete') {
if (proyectoToDeleteId.value !== null) {
await eliminarProyecto(proyectoToDeleteId.value);
 proyectos.value = proyectos.value.filter(p => p.id !== proyectoToDeleteId.value);
 cargarProyectos();
 snackbar.value = { show: true, message: 'Proyecto eliminado correctamente.', color: 'success' };
}
 }
 resetForm();
 } catch (err: any) {
 const errorMessage = err?.response?.data?.message || 'Error al procesar la operación del proyecto.';
 snackbar.value = { show: true, message: errorMessage, color: 'error' };
 } finally {
showConfirmDialog.value = false;
 currentAction.value = '';
}
}

// Función para editar un proyecto
function editProyecto(proyecto: any) {
isEditing.value = true; editingProyectoId.value = proyecto.id;
 nombre.value = proyecto.nombre;
 empresa_id.value = proyecto.empresa_id;
}

// Función para eliminar un proyecto (muestra el diálogo de confirmación)
function handleDeleteProyecto(id: number) {
 proyectoToDeleteId.value = id;
confirmDialogTitle.value = 'Confirmar Eliminación de Proyecto';
 confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar este proyecto? Esta acción es irreversible.';
 confirmDialogConfirmText.value = 'Eliminar';
 confirmDialogConfirmColor.value = 'error';
currentAction.value = 'delete';
 showConfirmDialog.value = true;
}

// Manejar la cancelación del diálogo de confirmación
function handleCancelAction() {
console.log('Acción de proyecto cancelada por el usuario.');
proyectoToDeleteId.value = null;
currentAction.value = '';
 showConfirmDialog.value = false; // Asegura que el modal se cierre
}


function resetForm() {
 nombre.value = ''
 empresa_id.value = null
 isEditing.value = false
editingProyectoId.value = null
proyectoToDeleteId.value = null
}

// Cargar los proyectos y empresas cuando el componente se monta
onMounted(() => {
cargarProyectos();
cargarEmpresas();
sortByIdDesc(); // Por defecto, mostrar los más recientes
});

// Filtrar proyectos por búsqueda
const filteredProyectos = computed(() =>
proyectos.value.filter(p =>
 p.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
p.empresa.nombre.toLowerCase().includes(search.value.toLowerCase()) // También buscar por nombre de empresa
)
);

// Funciones para ordenar la tabla
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
<v-card-title class="text-h5 text-center">Asignar Proyectos</v-card-title>
 <v-card-text>
<v-form @submit.prevent="submitForm" class="form" style="color: black">
 <v-row>
<v-col cols="12" md="6">
 <v-text-field label="Nombre del proyecto" v-model="nombre" required outlined />
</v-col>

<v-col cols="12" md="6">
 <v-select label="Empresa" :items="empresas" item-value="id" item-title="nombre"
v-model="empresa_id" required outlined />
</v-col>
</v-row>

<div class="d-flex justify-start">
<v-btn v-if="isEditing" color="secondary" @click="resetForm" class="mr-2">Cancelar</v-btn>
 <v-btn v-if="!isEditing" color="grey" text @click="resetForm" class="mr-2">Limpiar</v-btn>
<v-btn color="primary" type="submit">Guardar Proyecto</v-btn>
 </div>
 </v-form>

</v-card-text>
</v-card>
<v-card outlined>
<v-card-title class="text-h6">Listado de Proyectos</v-card-title>
<v-row align="center" class="px-4 pb-4">
<v-col cols="12" sm="6" md="5" lg="4">
<v-text-field v-model="search" label="Buscar proyecto" prepend-inner-icon="mdi-magnify" outlined dense hide-details />
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
:items="filteredProyectos"
 item-value="id"
 v-model:sort-by="sortBy"
v-model:sort-desc="sortDesc"
 class="elevation-1"
 >
<template v-slot:item.actions="{ item }">
<v-btn icon @click="editProyecto(item)" class="mr-1">
<v-icon color="primary">mdi-pencil</v-icon>
 </v-btn>
 <v-btn icon @click="handleDeleteProyecto(item.id)">
 <v-icon color="red">mdi-delete</v-icon>
 </v-btn>
</template>
<template v-slot:no-data>
 <v-alert :value="true" color="info" icon="mdi-information">
No hay proyectos disponibles.
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