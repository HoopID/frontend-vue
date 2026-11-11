<template>
  <div class="auth-wrap">
    <div class="card auth-card">
      <span class="brand">HOOP<span>ID</span></span>
      <p class="auth-sub">Creá tu cuenta de atleta.</p>

      <form @submit.prevent="handleRegister">
        <div class="field">
          <label for="name">Nombre</label>
          <input id="name" v-model="name" type="text" required placeholder="Tu nombre" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="tu@email.com" />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" required placeholder="••••••••" />
        </div>
        <button type="submit" class="btn btn-block" :disabled="loading">
          {{ loading ? 'Creando...' : 'Registrarme' }}
        </button>
      </form>

      <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
      <p class="auth-foot">
        ¿Ya tenés cuenta? <router-link to="/login">Iniciá sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '../api/authService'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()

const handleRegister = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    await authService.register(name.value, email.value, password.value)
    router.push('/login')
  } catch (error) {
    const data = error.response?.data
    const detail = data?.message || data?.detail
    errorMessage.value = typeof detail === 'string' ? detail : 'Error en los datos ingresados'
  } finally {
    loading.value = false
  }
}
</script>
