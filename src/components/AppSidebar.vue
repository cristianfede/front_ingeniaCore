<template>
  <div class="sidebar">
    <ul>
      <li><router-link to="/dashboard">Dashboard</router-link></li>
      <li><router-link to="/settings">Settings</router-link></li>
      <li><router-link to="/profile">Profile</router-link></li>
      <li><router-link to="/crud">Crud</router-link></li>

    </ul>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: #2367aa;
  color: white;
  padding: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
}
</style>
