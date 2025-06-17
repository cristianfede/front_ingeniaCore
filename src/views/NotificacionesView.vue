<template>
  <v-container>
    <v-card class="mt-4" elevation="2">
      <v-card-title class="text-h6">Mis notificaciones</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list class="pa-0">
          <v-list-item
            v-for="noti in notificaciones"
            :key="noti.id"
            @click="irADetalle(noti)"
            :class="[
              'rounded-lg',
              'ma-2',
              'cursor-pointer',
              'transition',
              noti.leido ? 'bg-blue-grey-lighten-5' : 'bg-grey-lighten-3',
              'hover:shadow-sm'
            ]"
          >
            <!-- Ícono del tipo de notificación -->
            <template #prepend>
              <v-icon
                :color="noti.titulo === 'Nuevo comentario' ? 'teal' : 'indigo'"
                size="24"
              >
                {{ noti.titulo === 'Nuevo comentario' ? 'mdi-comment-text' : 'mdi-alert-circle' }}
              </v-icon>
            </template>

            <!-- Título -->
            <template #title>
              <span class="font-weight-medium">{{ noti.titulo }}</span>
            </template>

            <!-- Mensaje -->
            <template #subtitle>
              <span>{{ noti.mensaje }}</span>
            </template>

            <!-- Ícono de leído/no leído -->
            <template #append>
              <v-icon
                :color="noti.leido ? 'grey' : 'primary'"
                size="20"
              >
                {{ noti.leido ? 'mdi-email-open' : 'mdi-email' }}
              </v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authSetStore } from '@/stores/AuthStore'
import { obtenerNotificaciones, marcarComoLeida } from '@/services/NotificacionService'

const router = useRouter()
const authStore = authSetStore()

// Define the Notificacion interface
interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  leido: boolean
  ticketId: number
}

const notificaciones = ref<Notificacion[]>([])

async function cargarNotificaciones(usuarioId: number) {
  try {
    const data = await obtenerNotificaciones(usuarioId)
    notificaciones.value = data
  } catch (error) {
    console.error('❌ Error al cargar notificaciones:', error)
  }
}

async function irADetalle(noti: Notificacion) {
  try {
    if (!noti.leido) {
      await marcarComoLeida(noti.id)
    }
    router.push({ name: 'detalle-ticket', params: { id: noti.ticketId } })
  } catch (error) {
    console.error('❌ Error al redirigir al detalle:', error)
  }
}

onMounted(async () => {
  await authStore.checkAuth()

  const usuarioId = authStore.user?.id || Number(localStorage.getItem('usuarioId'))

  if (usuarioId) {
    await cargarNotificaciones(usuarioId)
  } else {
    console.warn('⚠ No se encontró usuarioId. No se cargaron notificaciones.')
  }
})
</script>