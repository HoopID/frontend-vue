<template>
  <main class="container">
    <div class="page-header">
      <div>
        <h2>Partidos</h2>
        <p>Cargá la planilla de cada partido y mirá tu evolución mes a mes.</p>
      </div>
      <div class="header-actions">
        <router-link to="/" class="btn btn-ghost">← Volver</router-link>
      </div>
    </div>

    <div class="stats match-summary">
      <div class="stat">
        <div class="stat-value">{{ matches.length }}</div>
        <div class="stat-label">Partidos</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ avg('points') }}</div>
        <div class="stat-label">Puntos / partido</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ avg('rebounds') }}</div>
        <div class="stat-label">Rebotes / partido</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ avg('assists') }}</div>
        <div class="stat-label">Asistencias / partido</div>
      </div>
    </div>

    <form ref="formEl" class="card" @submit.prevent="handleSubmit">
      <h3>{{ editingId ? 'Editar partido' : 'Nuevo partido' }}</h3>
      <div class="grid-2">
        <div class="field">
          <label>Fecha</label>
          <input v-model="form.match_date" type="date" required />
        </div>
        <div class="field">
          <label>Rival</label>
          <input v-model.trim="form.opponent" type="text" maxlength="80" placeholder="Ej.: Club Atlético" required />
        </div>
      </div>
      <div class="stats-form">
        <div v-for="f in STAT_FIELDS" :key="f.key" class="field">
          <label>{{ f.label }}</label>
          <input v-model.number="form[f.key]" type="number" min="0" step="1" />
        </div>
      </div>
      <div class="zone-actions">
        <button type="submit" class="btn" :disabled="saving">
          {{ saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Registrar partido' }}
        </button>
        <button v-if="editingId" type="button" class="btn btn-ghost" @click="resetForm">Cancelar</button>
      </div>
      <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
    </form>

    <div class="card">
      <div class="card-head">
        <h3>Evolución mensual</h3>
        <div class="field year-field">
          <label>Año</label>
          <select v-model="year" @change="fetchMonthly">
            <option value="">Todos</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
      <div v-if="monthly.length === 0" class="empty">Todavía no hay datos para mostrar.</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Partidos</th>
              <th>Min</th>
              <th>Pts</th>
              <th>Reb</th>
              <th>Ast</th>
              <th>Rob</th>
              <th>Tap</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in monthly" :key="m.month">
              <td>{{ m.month }}</td>
              <td>{{ m.games_played }}</td>
              <td>{{ m.avg_minutes }}</td>
              <td>{{ m.avg_points }}</td>
              <td>{{ m.avg_rebounds }}</td>
              <td>{{ m.avg_assists }}</td>
              <td>{{ m.avg_steals }}</td>
              <td>{{ m.avg_blocks }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="court-hint">Promedios por partido.</p>
    </div>

    <div class="card">
      <h3>Historial</h3>
      <div v-if="loading" class="empty">Cargando partidos...</div>
      <div v-else-if="matches.length === 0" class="empty">🏀 Todavía no registraste partidos.</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Rival</th>
              <th>Min</th>
              <th>Pts</th>
              <th>Reb</th>
              <th>Ast</th>
              <th>Rob</th>
              <th>Tap</th>
              <th>Per</th>
              <th>Fal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in matches" :key="m.id" :class="{ 'row-editing': m.id === editingId }">
              <td>{{ m.match_date }}</td>
              <td>{{ m.opponent }}</td>
              <td>{{ m.minutes_played }}</td>
              <td>{{ m.points }}</td>
              <td>{{ m.rebounds }}</td>
              <td>{{ m.assists }}</td>
              <td>{{ m.steals }}</td>
              <td>{{ m.blocks }}</td>
              <td>{{ m.turnovers }}</td>
              <td>{{ m.fouls }}</td>
              <td class="row-actions">
                <button class="btn btn-ghost btn-sm" @click="startEdit(m)">Editar</button>
                <button class="btn btn-danger" @click="handleDelete(m.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { matchService } from '../api/matchService'

const STAT_FIELDS = [
  { key: 'minutes_played', label: 'Minutos' },
  { key: 'points', label: 'Puntos' },
  { key: 'rebounds', label: 'Rebotes' },
  { key: 'assists', label: 'Asistencias' },
  { key: 'steals', label: 'Robos' },
  { key: 'blocks', label: 'Tapones' },
  { key: 'turnovers', label: 'Pérdidas' },
  { key: 'fouls', label: 'Faltas' }
]

const today = () => new Date().toISOString().split('T')[0]
const emptyForm = () => ({
  match_date: today(),
  opponent: '',
  minutes_played: 0,
  points: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  fouls: 0
})

const matches = ref([])
const monthly = ref([])
const year = ref('')
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const form = ref(emptyForm())
const editingId = ref(null)
const formEl = ref(null)

const years = computed(() =>
  [...new Set(matches.value.map((m) => String(m.match_date).slice(0, 4)))].sort().reverse()
)
const avg = (field) =>
  matches.value.length
    ? (matches.value.reduce((s, m) => s + Number(m[field] ?? 0), 0) / matches.value.length).toFixed(1)
    : '–'

const apiMessage = (error, fallback) => {
  const data = error.response?.data
  const msg = data?.message || data?.error || data?.detail
  return typeof msg === 'string' ? msg : fallback
}

const fetchMatches = async () => {
  try {
    const res = await matchService.getMatches()
    matches.value = Array.isArray(res.matches) ? res.matches : []
  } catch (e) {
    errorMessage.value = 'Error al obtener los partidos.'
  } finally {
    loading.value = false
  }
}

const fetchMonthly = async () => {
  try {
    const res = await matchService.getMonthlyStats(year.value)
    monthly.value = res.monthly_stats || []
  } catch (e) {
    monthly.value = []
  }
}

const refresh = async () => {
  await fetchMatches()
  if (year.value && !years.value.includes(year.value)) year.value = ''
  await fetchMonthly()
}

const resetForm = () => {
  form.value = emptyForm()
  editingId.value = null
  errorMessage.value = ''
}

const startEdit = (m) => {
  editingId.value = m.id
  form.value = {
    match_date: String(m.match_date).slice(0, 10),
    opponent: m.opponent,
    ...Object.fromEntries(STAT_FIELDS.map((f) => [f.key, Number(m[f.key] ?? 0)]))
  }
  errorMessage.value = ''
  formEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleSubmit = async () => {
  const payload = { match_date: form.value.match_date, opponent: form.value.opponent }
  for (const f of STAT_FIELDS) {
    const v = Number(form.value[f.key])
    if (!Number.isInteger(v) || v < 0) {
      errorMessage.value = `${f.label} debe ser un entero mayor o igual a 0.`
      return
    }
    payload[f.key] = v
  }
  if (!payload.opponent) {
    errorMessage.value = 'Ingresá el rival.'
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    if (editingId.value) await matchService.updateMatch(editingId.value, payload)
    else await matchService.createMatch(payload)
    resetForm()
    await refresh()
  } catch (error) {
    errorMessage.value = apiMessage(error, 'Error al guardar el partido.')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('¿Eliminar este partido?')) return
  try {
    await matchService.deleteMatch(id)
    if (editingId.value === id) resetForm()
    await refresh()
  } catch (error) {
    errorMessage.value = apiMessage(error, 'Error al eliminar el partido.')
  }
}

onMounted(refresh)
</script>
