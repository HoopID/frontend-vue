<template>
  <div style="padding: 2rem; font-family: sans-serif;">
    <h1>🏀 HoopID Dashboard</h1>
    <p>Bienvenido al panel principal de tu perfil deportivo.</p>
    <button @click="handleLogout" style="padding: 8px 12px; cursor: pointer;">Cerrar Sesión</button>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>