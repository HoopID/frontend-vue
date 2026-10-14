<template>
  <div style="max-width: 400px; margin: 3rem auto; font-family: sans-serif;">
    <h2>🏀 Registrarse</h2>
    <form @submit.prevent="handleRegister">
      <div style="margin-bottom: 1rem;">
        <label>Nombre:</label><br />
        <input v-model="name" type="text" required style="width: 100%; padding: 8px;" />
      </div>
      <div style="margin-bottom: 1rem;">
        <label>Correo:</label><br />
        <input v-model="email" type="email" required style="width: 100%; padding: 8px;" />
      </div>
      <div style="margin-bottom: 1rem;">
        <label>Contraseña:</label><br />
        <input v-model="password" type="password" required style="width: 100%; padding: 8px;" />
      </div>
      <button type="submit" style="padding: 10px 15px; cursor: pointer;">Registrarse</button>
    </form>

    <p v-if="errorMessage" style="color: red; margin-top: 1rem; font-weight: bold;">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  errorMessage.value = ''
  try {
    await authStore.register(name.value, email.value)
  } catch (error) {
    errorMessage.value = error.response?.data?.detail || 'Error al registrarte'
  }
}
</script>