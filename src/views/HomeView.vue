<template>
  <div style="padding: 2rem; font-family: sans-serif;">
    <h1>🏀 HoopID Dashboard</h1>
    <p>Bienvenido al panel principal de tu perfil deportivo.</p>

    <div style="margin: 1.5rem 0; display: flex; gap: 1rem;">
      <router-link to="/profile" style="padding: 8px 12px; background: #e0e0e0; text-decoration: none; color: #333; border-radius: 4px;">
        Editar Mi Perfil
      </router-link>
      <router-link to="/shooting-sessions" style="padding: 8px 12px; background: #007bff; text-decoration: none; color: white; border-radius: 4px;">
        Sesiones de Tiro
      </router-link>
    </div>

    <button @click="handleLogout" style="padding: 8px 12px; cursor: pointer;">
      Cerrar Sesión
    </button>
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