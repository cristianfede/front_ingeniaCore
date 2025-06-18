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
import { onMounted, ref } from 'vue'; // También podrías importar `onUnmounted` si vas a usar polling
import { authSetStore } from '@/stores/AuthStore';
import { useRouter } from 'vue-router';
import { obtenerNotificaciones, marcarComoLeida } from '@/services/NotificacionService'

const authStore = authSetStore();
const router = useRouter();
const notificaciones = ref<any[]>([])
const cantidadNoLeidas = ref(0)

// Define usuarioId como una ref o computed para asegurar que sea reactivo si cambia
// aunque para el ID de usuario logueado, suele ser estático una vez logueado.
// Lo obtendremos dentro de la función de carga para asegurar que `authStore.user` esté disponible.
// const usuarioId = authStore.user?.id || Number(localStorage.getItem('usuarioId')) // Ya no necesitas esta línea aquí

async function cargarNotificaciones() {
  try {
    // Asegúrate de que authStore.user esté cargado antes de intentar obtener el ID
    if (!authStore.user?.id) {
        // Podrías esperar un momento o intentar de nuevo si el user aún no está cargado
        // Para este caso, vamos a asumir que checkAuth() ya lo hizo.
        console.warn('Usuario ID no disponible para cargar notificaciones.');
        return;
    }
    const userId = authStore.user.id; // Obtén el ID dentro de la función
    const data = await obtenerNotificaciones(userId); // Usa el userId de la store
    notificaciones.value = data;
    cantidadNoLeidas.value = data.filter((n: any) => !n.leido).length;
  } catch (err) {
    console.error('Error al cargar notificaciones', err);
  }
  // ⭐⭐⭐ ELIMINADA LA LLAMADA RECURSIVA: await cargarNotificaciones(); ⭐⭐⭐
}

async function irADetalle(noti: any) {
  // Marcar como leída
  if (!noti.leido) {
    await marcarComoLeida(noti.id);
    // Vuelve a cargar las notificaciones para actualizar el conteo y la lista visible
    await cargarNotificaciones(); // Recarga para reflejar el cambio de "leído"
  }

  // Redirigir al detalle del ticket
  router.push({ name: 'detalle-ticket', params: { id: String(noti.ticketId)}});
}

// Consolidamos la lógica de montaje en un solo onMounted
onMounted(async () => {
  // Primero, asegúrate de que la autenticación del usuario esté verificada.
  // Esto es vital para que `authStore.user` tenga el ID correcto.
  await authStore.checkAuth();

  // Una vez que el usuario esté cargado, llama a cargarNotificaciones.
  await cargarNotificaciones();

  // Opcional: Si quieres polling (actualización periódica de notificaciones)
  // let intervalId = setInterval(cargarNotificaciones, 60000); // Cada 60 segundos
  // Para limpiar el intervalo al desmontar el componente, necesitarías onUnmounted:
  // onUnmounted(() => {
  //   if (intervalId) {
  //     clearInterval(intervalId);
  //   }
  // });
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
</script>

<style scoped>
.v-toolbar {
  position: fixed;
  width: 100%; /* Asegura que la barra ocupe todo el ancho si es fija */
  z-index: 1000; /* Asegura que esté por encima de otros elementos */
}

/* Considera si necesitas esta clase o si Vuetify ya posiciona bien los ítems */
/* .v-toolbar-items {
  position: fixed;
  right: 0;
} */
</style>