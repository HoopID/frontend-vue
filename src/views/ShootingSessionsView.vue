<template>
  <div style="max-width: 800px; margin: 2rem auto; font-family: sans-serif; padding: 0 1rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2>🎯 Sesiones de Tiro</h2>
      <router-link to="/">Volver al Dashboard</router-link>
    </div>

    <!-- Formulario de Registro -->
    <form @submit.prevent="handleCreate" style="background: #f9f9f9; padding: 1rem; border-radius: 6px; margin-bottom: 2rem;">
      <h3>Registrar Nueva Sesión</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <label>Tiros Convertidos:</label><br />
          <input v-model.number="form.shots_made" type="number" min="0" required style="width: 100%; padding: 8px; margin-top: 4px;" />
        </div>
        <div>
          <label>Tiros Intentados:</label><br />
          <input v-model.number="form.shots_attempted" type="number" min="1" required style="width: 100%; padding: 8px; margin-top: 4px;" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <label>Fecha de la Sesión:</label><br />
          <input v-model="form.session_date" type="date" required style="width: 100%; padding: 8px; margin-top: 4px;" />
        </div>
        <div>
          <label>Tipo / Zona de Tiro:</label><br />
          <select v-model="form.shot_type" style="width: 100%; padding: 8px; margin-top: 4px;">
            <option value="Triple">Tiro de 3 Puntos</option>
            <option value="Media Distancia">Media Distancia</option>
            <option value="Tiro Libre">Tiro Libre</option>
            <option value="Catch & Shoot">Catch & Shoot</option>
          </select>
        </div>
      </div>

      <button type="submit" :disabled="saving" style="padding: 8px 16px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 4px;">
        {{ saving ? 'Guardando...' : 'Registrar Sesión' }}
      </button>
    </form>

    <p v-if="errorMessage" style="color: red; font-weight: bold;">{{ errorMessage }}</p>

    <!-- Listado de Sesiones -->
    <h3>Historial de Sesiones</h3>
    <div v-if="loading">Cargando sesiones...</div>
    <div v-else-if="sessions.length === 0">No has registrado sesiones de tiro aún.</div>
    
    <table v-else style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
      <thead>
        <tr style="background: #eee; text-align: left;">
          <th style="padding: 8px;">Fecha</th>
          <th style="padding: 8px;">Tipo</th>
          <th style="padding: 8px;">Convertidos / Intentados</th>
          <th style="padding: 8px;">Efectividad</th>
          <th style="padding: 8px; text-align: center;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sessions" :key="item.id" style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px;">{{ item.session_date }}</td>
          <td style="padding: 8px;">{{ item.shot_type }}</td>
          <td style="padding: 8px;">{{ item.shots_made }} / {{ item.shots_attempted }}</td>
          <td style="padding: 8px; font-weight: bold;">
            {{ (item.shooting_percentage ?? ((item.shots_made / item.shots_attempted) * 100)).toFixed(1) }}%
          </td>
          <td style="padding: 8px; text-align: center;">
            <button 
              @click="handleDelete(item.id)" 
              style="background: #dc3545; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer;">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { shootingService } from '../api/shootingService'

const sessions = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')

const form = ref({
  shots_made: 0,
  shots_attempted: 0,
  session_date: new Date().toISOString().split('T')[0],
  shot_type: 'Triple'
})

const fetchSessions = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await shootingService.getSessions()
    const list = response.sessions || response
    sessions.value = Array.isArray(list) ? list : []
  } catch (error) {
    errorMessage.value = 'Error al obtener el historial de sesiones.'
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  if (form.value.shots_made > form.value.shots_attempted) {
    errorMessage.value = 'Los tiros convertidos no pueden superar los intentados.'
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    const payload = {
      shots_made: Number(form.value.shots_made),
      shots_attempted: Number(form.value.shots_attempted),
      session_date: form.value.session_date,
      shot_type: form.value.shot_type
    }
    
    await shootingService.createSession(payload)
    form.value.shots_made = 0
    form.value.shots_attempted = 0
    
    await fetchSessions()
  } catch (error) {
    const detail = error.response?.data?.detail
    errorMessage.value = typeof detail === 'string' ? detail : 'Error al guardar la sesión.'
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta sesión de tiro?')) return

  try {
    await shootingService.deleteSession(id)
    sessions.value = sessions.value.filter(item => item.id !== id)
  } catch (error) {
    errorMessage.value = 'Error al eliminar la sesión.'
  }
}

onMounted(() => {
  fetchSessions()
})
</script>