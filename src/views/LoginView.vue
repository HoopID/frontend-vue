<template>
  <div style="max-width: 400px; margin: 3rem auto; font-family: sans-serif;">
    <h2>🏀 Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin">
      <div style="margin-bottom: 1rem;">
        <label>Email:</label><br />
        <input v-model="email" type="email" required style="width: 100%; padding: 8px;" />
      </div>
      <div style="margin-bottom: 1rem;">
        <label>Contraseña:</label><br />
        <input v-model="password" type="password" required style="width: 100%; padding: 8px;" />
      </div>
      <button type="submit" style="padding: 10px 15px; cursor: pointer;">Ingresar</button>
    </form>

    <p v-if="errorMessage" style="color: red; margin-top: 1rem; font-weight: bold;">
      {{ errorMessage }}
    </p>
    <p style="margin-top: 1.5rem;">
      ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.response?.data?.detail || 'Error al iniciar sesión'
  }
}
</script>