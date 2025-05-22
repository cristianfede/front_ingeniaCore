<template>
  <v-toolbar
    color="#2962FF"
    dark
    app
    elevation="2"
  >
    <v-btn icon="mdi-menu" class="d-none"></v-btn>

    <v-toolbar-title>Bievenido, Laura</v-toolbar-title>
    <v-toolbar-items>bienvenido laura</v-toolbar-items>

    <v-spacer></v-spacer>

    <!-- Botón Cerrar Sesión -->
    <router-link to="/login">
       <v-btn icon="mdi-export"></v-btn>
    </router-link>
  </v-toolbar>
</template>

<script setup lang="ts">
// No se necesita lógica adicional por ahora
</script>

<style scoped>
.v-toolbar {
  position: fixed;
}/* No necesitas mucho estilo aquí porque Vuetify lo maneja */

.v-toolbar-items {
  position:fixed, right,
}
</style>
