<template>
  <div class="sidebar">
    <ul>
      <li><router-link to="/dashboard">Dashboard</router-link></li>
      <li><router-link to="/settings">Settings</router-link></li>
      <li><router-link to="/profile">Profile</router-link></li>
      <li><router-link to="/crud">Usuarios</router-link></li>
      <li><router-link to="/tickets">Tickets</router-link></li>
      <li><router-link to="/formulario-empresas">Empresas</router-link></li> </ul>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  min-height: 100vh; /* se asegura que cubra mínimo el alto de pantalla */
  height: 100%; /* crecerá si el contenido es más largo */
  background: #2367aa;
  color: white;
  padding: 20px;
  position: sticky; /* se queda visible si hacés scroll */
  top: 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
}
</style>
