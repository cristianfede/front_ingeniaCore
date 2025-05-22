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

    <v-btn icon="mdi-export" @click="handleLogout"></v-btn>
  </v-toolbar>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { authSetStore } from '@/stores/AuthStore';
import { useRouter } from 'vue-router';

const authStore = authSetStore();
const router = useRouter();

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
}/* No necesitas mucho estilo aquí porque Vuetify lo maneja */

.v-toolbar-items {
  position:fixed, right,
}
</style>
