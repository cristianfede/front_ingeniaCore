<template>
  <form @submit.prevent="changePassword" class="reset-form">
    <h2>New Password</h2>

    <div class="input-group">
      <label for="newPassword">Reset Password</label>
      <input
        type="password"
        id="newPassword"
        v-model="newPassword"
        required
        placeholder="Enter your new password"
      />
    </div>

    <div class="input-group">
      <label for="confirmPassword">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        v-model="confirmPassword"
        required
        placeholder="Confirm your new password"
      />
    </div>

    <button type="submit">Change Password</button>

    <p v-if="message" class="message">{{ message }}</p>

    <router-link to="/login" class="login-again">Log in again</router-link>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')

const changePassword = () => {
  if (newPassword.value.length < 8) {
    message.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match.'
    return
  }

  message.value = 'Your password has been changed successfully.'
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

.login-again {
  display: block;
  margin-top: 15px;
  font-size: 14px;
  color: white;
  text-decoration: underline;
  cursor: pointer;
}
</style>
