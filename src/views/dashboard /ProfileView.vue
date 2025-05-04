<template>
  <div class="profile-container">
    <h2>Perfil de Usuario</h2>
    <p>Aquí puedes ver y editar la información de tu perfil.</p>

    <div class="profile-info">
      <img class="profile-avatar" src="https://i.pravatar.cc/150?img=3" alt="Avatar de usuario" />

      <div>
        <p><strong>Nombre:</strong> Juan Pérez</p>
        <p><strong>Email:</strong> juan.perez@example.com</p>
        <button @click="editProfile">Editar Perfil</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const editProfile = () => {
  alert('Función para editar perfil en construcción.')
}
</script>

<style scoped>
.profile-container {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #ccc;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
