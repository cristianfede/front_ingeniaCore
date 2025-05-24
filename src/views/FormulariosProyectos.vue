<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { obtenerProyectos, obtenerEmpresas, crearProyecto } from '../services/proyectosService'

const proyectos = ref<any[]>([])
const empresas = ref<any[]>([])   // <- listado de empresas
const nombre = ref('')
const empresa_id = ref<number | null>(null)

const search = ref('')
const isEditing = ref(false)

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
    }
}
async function cargarEmpresas() {
    try {
        empresas.value = await obtenerEmpresas()
    } catch (error) {
        console.error('Error al cargar empresas:', error)
    }
}
async function guardarProyecto() {
    try {
        if (!nombre.value || !empresa_id.value) {
            alert('Por favor, completa todos los campos.')
            return
        }

        const formData = new FormData()
        formData.append('nombre', nombre.value)
        formData.append('empresa_id', empresa_id.value.toString())

        await crearProyecto(formData)

        // Refrescar lista de proyectos
        await cargarProyectos()

        // Resetear formulario
        resetForm()
    } catch (error) {
        console.error('Error al guardar proyecto:', error)
        alert('No se pudo guardar el proyecto.')
    }
}

function resetForm() {
    nombre.value = ''
    empresa_id.value = null
    isEditing.value = false
}

// Cargar los proyectos cuando el componente se monta
onMounted(() => {
    cargarProyectos()
    cargarEmpresas()
})

// Filtrar proyectos por búsqueda
const filteredProyectos = computed(() =>
    proyectos.value.filter(p =>
        p.nombre.toLowerCase().includes(search.value.toLowerCase())
    )
)
</script>

<template>

    <v-card class="mb-5" outlined>
        <v-card-title class="text-h5 text-center">Asignar Proyectos</v-card-title>
        <v-card-text>
            <v-form @submit.prevent="guardarProyecto" class="form" style="color: black">
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
    <v-container>
        <v-card outlined>
            <v-card-title>
                Listado de Proyectos
            </v-card-title>

            <v-text-field v-model="search" label="Buscar proyecto" prepend-inner-icon="mdi-magnify" outlined dense
                class="mb-4" />

            <v-data-table :headers="headers" :items="filteredProyectos" item-value="id" class="elevation-1">

                <template v-slot:no-data>
                    <v-alert :value="true" color="info" icon="mdi-information">
                        No hay proyectos disponibles.
                    </v-alert>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>



<!--
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { obtenerEmpresas } from '../services/proyectosService'

const nombre = ref('')
const empresa_id = ref<number | null>(null)
const isEditing = ref(false)
const empresas = ref<{ id: number; nombre: string }[]>([])


// async function submit() {
//     if (!nombre.value || empresa_id.value === null ) {
//         snackbar.value = {
//             show: true,
//             message: 'Por favor, completa los campos obligatorios del ticket (Título, Descripción, Estado, Prioridad).',
//             color: 'warning',
//         };
//         return;
//     }

//     if (isEditing.value) {
//         confirmDialogTitle.value = 'Confirmar Actualización';
//         confirmDialogMessage.value = '¿Estás seguro de que quieres actualizar este ticket?';
//         confirmDialogConfirmText.value = 'Actualizar';
//         confirmDialogConfirmColor.value = 'primary';
//         currentAction.value = 'update';
//     } else {
//         confirmDialogTitle.value = 'Confirmar Creación';
//         confirmDialogMessage.value = '¿Estás seguro de que quieres crear este ticket?';
//         confirmDialogConfirmText.value = 'Crear';
//         confirmDialogConfirmColor.value = 'success';
//         currentAction.value = 'create';
//     }
//     showConfirmDialog.value = true;
// }

// async function handleConfirmAction() {
//   snackbar.value.show = false;

//   try {
//     const formData = new FormData();
//     formData.append('titulo', nombre.value);
//     formData.append('estado_id', String(empresa_id.value));

//     if (currentAction.value === 'create') {
//       const nuevoProyecto = await crearTicket(formData);
//       proyectos.value.push(nuevoProyecto);
//       sortBy.value = [{ key: 'id', order: 'desc' }];
//       snackbar.value = { show: true, message: 'Proyecto creado exitosamente.', color: 'success' };
//     } 
//     resetForm();
//   } catch (err: any) {
//     const errorMessage = err?.message || 'Error al procesar la operación del ticket.';
//     snackbar.value = { show: true, message: errorMessage, color: 'error' };
//   } finally {
//     showConfirmDialog.value = false;
//     currentAction.value = '';
//   }
// }
const sortByIdAsc = () => {
    sortBy.value = [{ key: 'id', order: 'asc' }];
};

const sortByIdDesc = () => {
    sortBy.value = [{ key: 'id', order: 'desc' }];
};

onMounted(() => {
    cargarEmpresas()
})


const resetForm = () => {
    nombre.value = ''
    empresa_id.value = null
    isEditing.value = false
}

const cargarEmpresas = async () => {
    try {
        empresas.value = await obtenerEmpresas()
    } catch (error: any) {
        console.error('Error al cargar empresas:', error)
    }
}

const submit = async () => {
    try {
        const response = await fetch('/api/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre.value,
                empresa_id: empresa_id.value,
            }),
        })

        if (!response.ok) throw new Error('Error al guardar proyecto')
        resetForm()
    } catch (error) {
        console.error(error)
    }
}


</script> -->
