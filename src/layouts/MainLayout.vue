<template>
  <v-app>
    <AppSidebar />

    <v-layout>
      <AppNavbar />

    </v-layout>
      <v-main class="pa-15" style="background: #fff;">
        <router-view />
      </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
</script>
