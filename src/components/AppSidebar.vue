
<template>
  <v-navigation-drawer
    expand-on-hover
    rail
    app
    permanent
    color="#90CAF9"
    style="margin-top: 64px;"
  >
     <!-- Perfil de usuario -->
    <v-list>
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
        :subtitle="auth.user?.correo"
        :title="auth.user?.nombre"
      />
    </v-list>

    <v-divider></v-divider>

    <!-- Navegación con tus rutas -->
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        :to="{ path: '/dashboard' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-cog"
        title="Settings"
        :to="{ path: '/settings' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-account"
        title="Profile"
        :to="{ path: '/profile' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-table"
        title="Usuarios"
        :to="{ path: '/Usuarios' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-ticket"
        title="Tickets"
        :to="{ path: '/tickets' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-domain"
        title="Empresas"
        :to="{ path: '/formulario-empresas' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-domain"
        title="Proyectos"
        :to="{ path: '/proyectos' }"
        link
      />
      <v-list-item
        prepend-icon="mdi-domain"
        title="Roles"
        :to="{ path: '/Roles' }"
        link
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { authSetStore } from '@/stores/AuthStore'
const auth = authSetStore()
</script>

<style scoped>
.v-navigation-drawer {
  color: white;
  z-index: 1000;
}
</style>
