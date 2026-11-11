<template>
  <header class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="brand">HOOP<span>ID</span></router-link>
      <router-link to="/" class="nav-link">Inicio</router-link>
      <button class="btn btn-ghost" @click="handleLogout">Salir</button>
    </div>
  </header>
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
