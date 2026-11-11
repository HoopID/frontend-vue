<template>
  <div class="auth-wrap">
    <div class="card auth-card">
      <span class="brand">HOOP<span>ID</span></span>
      <p class="auth-sub">Tu perfil de atleta, tus números.</p>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="tu@email.com" />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" required placeholder="••••••••" />
        </div>
        <button type="submit" class="btn btn-block" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
      <p class="auth-foot">
        ¿No tenés cuenta? <router-link to="/register">Registrate</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    const data = error.response?.data
    errorMessage.value = data?.message || data?.detail || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
