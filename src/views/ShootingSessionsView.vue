<template>
  <main class="container">
    <div class="page-header">
      <div>
        <h2>Sesiones de tiro</h2>
        <p>Registrá tus entrenamientos y seguí tu efectividad.</p>
      </div>
    </div>

    <form class="card" @submit.prevent="handleCreate">
      <h3>Nueva sesión</h3>
      <div class="grid-2">
        <div class="field">
          <label>Tiros convertidos</label>
          <input v-model.number="form.shots_made" type="number" min="0" required />
        </div>
        <div class="field">
          <label>Tiros intentados</label>
          <input v-model.number="form.shots_attempted" type="number" min="1" required />
        </div>
      </div>
      <div class="grid-2">
        <div class="field">
          <label>Fecha</label>
          <input v-model="form.session_date" type="date" required />
        </div>
        <div class="field">
          <label>Tipo / zona de tiro</label>
          <select v-model="form.shot_type">
            <option value="Triple">Triple</option>
            <option value="Media Distancia">Media distancia</option>
            <option value="Tiro Libre">Tiro libre</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn" :disabled="saving">
        {{ saving ? 'Guardando...' : 'Registrar sesión' }}
      </button>
      <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
    </form>

    <div class="card">
      <h3>Historial</h3>
      <div v-if="loading" class="empty">Cargando sesiones...</div>
      <div v-else-if="sessions.length === 0" class="empty">
        🏀 Todavía no registraste sesiones de tiro.
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Zona</th>
              <th>Convertidos</th>
              <th>Efectividad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sessions" :key="item.id">
              <td>{{ item.session_date }}</td>
              <td>{{ item.shot_zone ?? item.shot_type }}</td>
              <td>{{ made(item) }} / {{ attempts(item) }}</td>
              <td>
                <span class="pct" :class="pctClass(percentage(item))">{{ percentage(item).toFixed(1) }}%</span>
              </td>
              <td style="text-align: right">
                <button class="btn btn-danger" @click="handleDelete(item.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
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

const made = (i) => Number(i.made ?? i.shots_made ?? 0)
const attempts = (i) => Number(i.attempts ?? i.shots_attempted ?? 0)
const percentage = (i) => (attempts(i) ? (made(i) / attempts(i)) * 100 : 0)
const pctClass = (p) => (p >= 60 ? 'pct-high' : p >= 40 ? 'pct-mid' : 'pct-low')

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
    await shootingService.createSession({
      made: Number(form.value.shots_made),
      attempts: Number(form.value.shots_attempted),
      session_date: form.value.session_date,
      shot_zone: form.value.shot_type
    })
    form.value.shots_made = 0
    form.value.shots_attempted = 0
    await fetchSessions()
  } catch (error) {
    const data = error.response?.data
    const apiError = data?.message || data?.error || data?.detail
    errorMessage.value = typeof apiError === 'string' ? apiError : 'Error al guardar la sesión.'
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('¿Eliminar esta sesión de tiro?')) return
  try {
    await shootingService.deleteSession(id)
    sessions.value = sessions.value.filter((item) => item.id !== id)
  } catch (error) {
    errorMessage.value = 'Error al eliminar la sesión.'
  }
}

onMounted(fetchSessions)
</script>
