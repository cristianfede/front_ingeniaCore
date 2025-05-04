<template>
  <form @submit.prevent="resetPassword" class="reset-form">
    <h2>Restablecer Contraseña</h2>

    <div class="input-group">
      <label for="email">Correo Electrónico</label>
      <input
        type="email"
        id="email"
        v-model="email"
        required
        placeholder="Ingresa tu correo electrónico"
      />
    </div>

    <button type="submit">Enviar Instrucciones</button>

    <p v-if="message" class="message">{{ message }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const message = ref('')

const resetPassword = () => {
  if (!email.value.includes('@')) {
    message.value = 'Por favor, ingresa un correo válido.'
    return
  }

  message.value = 'Hemos enviado las instrucciones a tu correo.'
}
</script>

<style scoped>
.reset-form {
  background: rgba(255, 255, 255, 0.2); /* Fondo semi-transparente */
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.input-group label {
  font-size: 14px;
  margin-bottom: 5px;
}

.input-group input {
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

button {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: white;
  transition: 0.3s ease-in-out;
}

button:hover {
  background: rgba(255, 255, 255, 0.5);
}

.message {
  margin-top: 10px;
  font-size: 14px;
  color: #ffeb3b;
}
</style>
