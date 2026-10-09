<template>
  <div style="padding: 2rem; font-family: sans-serif;">
    <h1>🏀 HoopID Frontend</h1>
    <p>Plataforma de seguimiento e inteligencia deportiva para atletas.</p>
    <p>Estado de conexión con Backend: <strong>{{ healthStatus }}</strong></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../api/axios'

const healthStatus = ref('Conectando...')

onMounted(async () => {
  try {
    const response = await apiClient.get('/health')
    healthStatus.value = `Conectado (${response.data.status}) - Hora BD: ${response.data.db_time}`
  } catch (error) {
    healthStatus.value = 'Error al conectar con http://localhost:8000/api'
  }
})
</script>