<template>
  <div class="buttons">
    <router-link to="/login">Cerrar Sesión</router-link>
  </div>
  <div class="navbar">
    <h1>Dashboard</h1>
  </div>
</template>

<style scoped>
.buttons {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}
.navbar {
  height: 60px;
  background: #3a86d3;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
</style>
