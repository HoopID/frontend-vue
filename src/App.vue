<template>
  <NavBar v-if="authStore.isAuthenticated" />
  <router-view />
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>
