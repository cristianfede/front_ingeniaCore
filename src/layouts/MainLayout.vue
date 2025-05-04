<template>
  <div class="dashboard-layout">
    <AppSidebar />
    <div class="main-content">
      <AppNavbar />
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  padding: 20px;
  background: #fff;
}
</style>
