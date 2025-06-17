<template>
  <v-toolbar
    color="#2962FF"
    dark
    app
    elevation="2"
  >
    <v-btn icon="mdi-menu" class="d-none"></v-btn>

    <v-toolbar-title>
      Bienvenido, {{ authStore.user?.nombre || 'Usuario' }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

     <v-menu location="bottom end" offset-y>
      <template #activator="{ props }">
        <v-badge
          :content="cantidadNoLeidas"
          color="red"
          v-bind="props"
          overlap
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </template>

      <v-list>
        <v-list-item
          v-for="noti in notificaciones"
          :key="noti.id"
          @click="irADetalle(noti)"
        >
          <v-list-item-title>{{ noti.titulo }}</v-list-item-title>
          <v-list-item-subtitle>{{ noti.mensaje }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item @click="router.push({ name: 'Notificaciones' })">
          <v-list-item-title class="text-primary">
            Ver todas las notificaciones
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn icon="mdi-export" @click="handleLogout"></v-btn>
  </v-toolbar>
</template>

<script setup lang="ts">
import { onMounted, ref} from 'vue';
import { authSetStore } from '@/stores/AuthStore';
import { useRouter } from 'vue-router';
import { obtenerNotificaciones, marcarComoLeida } from '@/services/NotificacionService'

const authStore = authSetStore();
const router = useRouter();
const notificaciones = ref<any[]>([])
const cantidadNoLeidas = ref(0)
const usuarioId = authStore.user?.id || Number(localStorage.getItem('usuarioId'))

async function cargarNotificaciones() {
  try {
    const data = await obtenerNotificaciones(usuarioId)
    notificaciones.value = data
    cantidadNoLeidas.value = data.filter(n => !n.leido).length
  } catch (err) {
    console.error('Error al cargar notificaciones', err)
  }
  await cargarNotificaciones();
}

async function irADetalle(noti: any) {
  // Marcar como leída
  if (!noti.leido) {
    await marcarComoLeida(noti.id)
  }

  // Redirigir al detalle del ticket
  router.push({ name: 'detalle-ticket', params: { id: String(noti.ticketId)}})
}

onMounted(cargarNotificaciones)


onMounted(async () => {
  // Asegúrate de que el usuario esté cargado en el store al montar el componente
  // Esto es crucial para que los datos aparezcan después de una recarga de página
  await authStore.checkAuth();
});

const handleLogout = async () => {
  try {
    await authStore.logout(); // Llama a la acción de logout de tu AuthStore
    router.push('/login'); // Redirige al login después de cerrar sesión
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Podrías mostrar un snackbar o mensaje de error aquí si lo deseas
  }
};
</script>

<style scoped>
.v-toolbar {
  position: fixed;
} /* No necesitas mucho estilo aquí porque Vuetify lo maneja */

.v-toolbar-items {
  position: fixed;
  right: 0;
}
</style>
