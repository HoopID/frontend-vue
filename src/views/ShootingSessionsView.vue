<template>
  <main class="container">
    <div class="page-header">
      <div>
        <h2>Sesiones de tiro</h2>
        <p>Elegí zonas en la cancha y cargá intentos y aciertos de cada una en la misma sesión.</p>
      </div>
    </div>

    <form class="card" @submit.prevent="handleCreate">
      <h3>Nueva sesión</h3>
      <div class="field" style="max-width: 220px">
        <label>Fecha</label>
        <input v-model="sessionDate" type="date" required />
      </div>

      <div class="session-builder">
        <CourtMap v-model="selectedZone" :stats="entryStats" />

        <div class="zone-panel">
          <template v-if="selectedZone">
            <h4>{{ zoneLabel(selectedZone) }}</h4>
            <div class="grid-2">
              <div class="field">
                <label>Intentados</label>
                <input v-model.number="draft.attempts" type="number" min="1" step="1" />
              </div>
              <div class="field">
                <label>Convertidos</label>
                <input v-model.number="draft.made" type="number" min="0" step="1" />
              </div>
            </div>
            <div class="zone-actions">
              <button type="button" class="btn" @click="saveZone">
                {{ entryFor(selectedZone) ? 'Actualizar zona' : 'Agregar a la sesión' }}
              </button>
              <button v-if="entryFor(selectedZone)" type="button" class="btn btn-danger" @click="removeZone(selectedZone)">
                Quitar
              </button>
            </div>
            <p v-if="zoneError" class="alert alert-error">{{ zoneError }}</p>
          </template>
          <p v-else class="empty">Tocá una zona de la cancha para cargar sus tiros.</p>

          <div v-if="entries.length" class="zone-list">
            <div class="stat-label">En esta sesión</div>
            <button
              v-for="e in entries"
              :key="e.zone"
              type="button"
              class="zone-chip"
              :class="{ active: e.zone === selectedZone }"
              @click="selectedZone = e.zone"
            >
              {{ zoneLabel(e.zone) }} · {{ e.made }}/{{ e.attempts }}
            </button>
            <div class="session-total">
              Total: {{ total.made }}/{{ total.attempts }} ·
              <span class="pct" :class="pctClass(totalPct)">{{ totalPct.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" class="btn" :disabled="saving || !entries.length">
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
              <th>Zonas</th>
              <th>Convertidos</th>
              <th>Efectividad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sessions" :key="item.id">
              <td>{{ item.session_date }}</td>
              <td>
                <span v-for="z in item.zones" :key="z.zone" class="zone-chip zone-chip-static">
                  {{ zoneLabel(z.zone) }} {{ z.made }}/{{ z.attempts }}
                </span>
              </td>
              <td>{{ item.made }} / {{ item.attempts }}</td>
              <td>
                <span class="pct" :class="pctClass(pctOf(item))">{{ pctOf(item).toFixed(1) }}%</span>
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
import { ref, computed, watch, onMounted } from 'vue'
import { shootingService } from '../api/shootingService'
import CourtMap from '../components/CourtMap.vue'
import { zoneLabel } from '../constants/shootingZones'

const sessions = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const zoneError = ref('')

const sessionDate = ref(new Date().toISOString().split('T')[0])
const selectedZone = ref('')
const entries = ref([]) // [{ zone, attempts, made }] de la sesión en armado
const draft = ref({ attempts: 0, made: 0 })

const entryFor = (zone) => entries.value.find((e) => e.zone === zone)
const entryStats = computed(() =>
  Object.fromEntries(entries.value.map((e) => [e.zone, { attempts: e.attempts, made: e.made }]))
)
const total = computed(() => ({
  attempts: entries.value.reduce((s, e) => s + e.attempts, 0),
  made: entries.value.reduce((s, e) => s + e.made, 0)
}))
const totalPct = computed(() => (total.value.attempts ? (total.value.made / total.value.attempts) * 100 : 0))
const pctOf = (i) => (Number(i.attempts) ? (Number(i.made) / Number(i.attempts)) * 100 : 0)
const pctClass = (p) => (p >= 60 ? 'pct-high' : p >= 40 ? 'pct-mid' : 'pct-low')

// Al elegir una zona se precargan sus valores si ya fue agregada
watch(selectedZone, (zone) => {
  zoneError.value = ''
  const e = zone && entryFor(zone)
  draft.value = e ? { attempts: e.attempts, made: e.made } : { attempts: 0, made: 0 }
})

const saveZone = () => {
  const attempts = Number(draft.value.attempts)
  const made = Number(draft.value.made)
  if (!Number.isInteger(attempts) || attempts < 1) {
    zoneError.value = 'Los intentos deben ser un entero mayor a 0.'
    return
  }
  if (!Number.isInteger(made) || made < 0) {
    zoneError.value = 'Los convertidos deben ser un entero mayor o igual a 0.'
    return
  }
  if (made > attempts) {
    zoneError.value = 'Los convertidos no pueden superar los intentados.'
    return
  }
  zoneError.value = ''
  const existing = entryFor(selectedZone.value)
  if (existing) {
    existing.attempts = attempts
    existing.made = made
  } else {
    entries.value.push({ zone: selectedZone.value, attempts, made })
  }
}

const removeZone = (zone) => {
  entries.value = entries.value.filter((e) => e.zone !== zone)
  draft.value = { attempts: 0, made: 0 }
}

const fetchSessions = async () => {
  loading.value = true
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
  if (!entries.value.length) {
    errorMessage.value = 'Agregá al menos una zona a la sesión.'
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    await shootingService.createSession({
      session_date: sessionDate.value,
      zones: entries.value.map((e) => ({ zone: e.zone, attempts: e.attempts, made: e.made }))
    })
    entries.value = []
    selectedZone.value = ''
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
