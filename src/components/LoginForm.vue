<template>
  <div class="login-form">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleSubmit">
      <div class="input-group">
        <label for="email">Correo electrónico</label>
        <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
      </div>

      <div class="input-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Ingresa tu contraseña"
          required
        />
      </div>

      <div class="forgot-password">
        <router-link to="/reset-password">¿Olvidó su contraseña?</router-link>
      </div>

      <button type="submit">Ingresar</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authSetStore } from '@/stores/AuthStore.ts'

const authStore = authSetStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    alert('Por favor, completa todos los campos')
    return
  }

  const success = await authStore.login({ email: email.value, password: password.value })

  if (success) {
    alert('Correo o contraseña incorrectos')
  }
}
</script>

<style scoped>
.login-form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 340px;
  padding: 50px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h2 {
  color: white;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  font-size: 14px;
  color: white;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  outline: none;
}

.forgot-password {
  text-align: right;
  margin-bottom: 15px;
}

button {
  width: 50%;
  padding: 10px;
  border: none;
  background: #f5f6f8;
  color: rgb(2, 34, 102);
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #0056b3;
}
</style>
