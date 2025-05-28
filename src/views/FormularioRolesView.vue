<template>
  <v-container class="py-5">
    <v-card class="mb-5" outlined>
      <v-card-title class="text-h5 text-center">Formulario de Asignación de Permisos</v-card-title>
      <v-card-text>
        <v-form ref="formularioAsignacion" @submit.prevent="enviarFormulario">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="rolSeleccionado"
                :items="roles"
                label="Selecciona un rol"
                item-title="nombre"
                item-value="id"
                outlined dense required :loading="cargandoRoles" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="itemSeleccionado"
                :items="items"
                label="Selecciona un Ítem"
                item-title="nombre"
                item-value="id"
                outlined dense required :loading="cargandoItems" />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="permisosSeleccionados"
                :items="permisos"
                color="success"
                label="Permisos"
                item-title="nombre"
                item-value="id"
                outlined dense multiple chips clearable required
                :loading="cargandoPermisos" />
            </v-col>
          </v-row>

          <v-btn color="primary" type="submit" :loading="enviandoFormulario">
            Asignar Permisos
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card outlined>
      <v-card-title class="text-h6">Asignaciones Existentes</v-card-title>
      <v-data-table
        :headers="headersAsignaciones"
        :items="asignaciones"
        :loading="cargandoAsignaciones"
        loading-text="Cargando..."
        no-data-text="No hay asignaciones"
        class="elevation-1">
        <template v-slot:item.actions="{ item }">
          <v-btn icon class="mr-2" @click="abrirDialogoEdicion(item)"> <v-icon color="blue">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="eliminarAsignacion(item.id)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="dialogoEdicionAbierto" max-width="600px">
  <v-card>
    <v-card-title class="text-h6">Editar Permisos de Asignación</v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field
              label="Rol"
              :model-value="rolEnEdicion?.nombre"
              readonly
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              label="Ítem"
              :model-value="itemEnEdicion?.nombre"
              readonly
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="permisosEditados"
              :items="permisos"
              label="Permisos"
              item-title="nombre"
              item-value="id"
              outlined dense multiple chips clearable
              :loading="cargandoPermisos"
            ></v-select>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" text @click="dialogoEdicionAbierto = false">Cancelar</v-btn>
      <v-btn color="blue darken-1" text @click="guardarEdicion" :loading="guardandoEdicion">Guardar</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import servicioPermisos from '@/services/permisosService'


const rolSeleccionado = ref<number | null>(null)
const itemSeleccionado = ref<number | null>(null)
const permisosSeleccionados = ref<number[]>([])

const roles = ref([])
const items = ref([])
const permisos = ref([])
const asignaciones = ref([])

const cargandoRoles = ref(false)
const cargandoItems = ref(false)
const cargandoPermisos = ref(false)
const cargandoAsignaciones = ref(false)
const enviandoFormulario = ref(false)

// Nuevas variables para la edición
const dialogoEdicionAbierto = ref(false)
const asignacionEnEdicion = ref<any>(null) // Almacenará el objeto de la asignación seleccionada
const rolEnEdicion = ref<any>(null)
const itemEnEdicion = ref<any>(null)
const permisosEditados = ref<number[]>([]) // Almacenará los IDs de los permisos para el v-select
const guardandoEdicion = ref(false) // Estado de carga para el botón de guardar

const headersAsignaciones = [
  { title: 'Rol', key: 'rol.nombre' },
  { title: 'Ítem', key: 'item.nombre' },
  { title: 'Permiso', key: 'permiso.nombre' },
  { title: 'Acciones', key: 'actions', sortable: false }
]

onMounted(async () => {
  await Promise.all([
    cargarRoles(),
    cargarItems(),
    cargarPermisos(),
    cargarAsignaciones()
  ])
})

async function cargarRoles() {
  cargandoRoles.value = true
  roles.value = await servicioPermisos.obtenerRoles()
  cargandoRoles.value = false
}

async function cargarItems() {
  cargandoItems.value = true
  items.value = await servicioPermisos.obtenerItems()
  cargandoItems.value = false
}

async function cargarPermisos() {
  cargandoPermisos.value = true
  permisos.value = await servicioPermisos.obtenerPermisos()
  cargandoPermisos.value = false
}

async function cargarAsignaciones() {
  cargandoAsignaciones.value = true
  asignaciones.value = await servicioPermisos.obtenerAsignaciones()
  cargandoAsignaciones.value = false
}

async function enviarFormulario() {
  if (!rolSeleccionado.value || !itemSeleccionado.value || permisosSeleccionados.value.length === 0) return

  enviandoFormulario.value = true
  try {
    await servicioPermisos.asignarPermisosRolItem({
      roleId: rolSeleccionado.value,
      itemId: itemSeleccionado.value,
      permisosIds: permisosSeleccionados.value
    })
    await cargarAsignaciones()
    rolSeleccionado.value = null
    itemSeleccionado.value = null
    permisosSeleccionados.value = []
  } catch (err) {
    console.error(err)
  } finally {
    enviandoFormulario.value = false
  }
}


async function eliminarAsignacion(asignacionId: number) {
  try {
    await servicioPermisos.eliminarAsignacion(asignacionId)
    await cargarAsignaciones()
  } catch (err) {
    console.error(err)
  }
}

// Funciones para la edición
function abrirDialogoEdicion(item: any) {
  asignacionEnEdicion.value = item
  rolEnEdicion.value = item.rol
  itemEnEdicion.value = item.item
  permisosEditados.value = []
  dialogoEdicionAbierto.value = true
}

async function guardarEdicion() {
  if (!asignacionEnEdicion.value || permisosEditados.value.length === 0) return

  guardandoEdicion.value = true
  try {
    // Aquí asumimos que el servicio actualizará los permisos del rol-item
    await servicioPermisos.actualizarPermisosRolItem({
      rolId: rolEnEdicion.value.id,
      itemId: itemEnEdicion.value.id,
      permisosIds: permisosEditados.value
    })

    dialogoEdicionAbierto.value = false
    await cargarAsignaciones() // Recargar la tabla
  } catch (err) {
    console.error("Error al guardar edición:", err)
  } finally {
    guardandoEdicion.value = false
  }
}
</script>

<style scoped>
</style>
