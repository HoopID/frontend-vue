<template>
  <main class="container container-full">
    <div class="page-header">
      <div>
        <h2>Estadísticas de tiro</h2>
        <p>Elegí una zona para ver tu rendimiento.</p>
      </div>
      <div class="header-actions">
        <router-link to="/shooting-sessions" class="btn">+ Registrar sesión</router-link>
        <router-link to="/" class="btn btn-ghost">← Volver</router-link>
      </div>
    </div>

    <div class="stats-layout">
    <aside class="zone-tabs" role="tablist">
      <button
        v-for="z in ['', ...zones]"
        :key="z"
        type="button"
        class="zone-tab"
        :class="{ active: selectedZone === z }"
        @click="selectedZone = z"
      >
        <span class="zone-icon">{{ icons[z] || '🏀' }}</span>
        <span>{{ z || 'Todas' }}</span>
      </button>
    </aside>

      <section class="stats-content">
    <div v-if="loading" class="card empty">Cargando estadísticas...</div>
    <div v-else class="card">
      <div class="tile-stats">
        <div class="big-pct">{{ accuracy }}<small>%</small></div>
        <div class="stat-label">Efectividad {{ selectedZone ? '· ' + selectedZone : 'total' }}</div>
      </div>
      <div class="stats" style="margin-top: 1.5rem">
        <div class="stat">
          <div class="stat-value">{{ totalMade }}</div>
          <div class="stat-label">Convertidos</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ totalAttempts }}</div>
          <div class="stat-label">Intentados</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ filtered.length }}</div>
          <div class="stat-label">Sesiones</div>
        </div>
        <div v-if="!selectedZone" class="stat">
          <div class="stat-value">{{ bestZone.name }}</div>
          <div class="stat-label">Mejor zona{{ bestZone.pct !== null ? ' · ' + bestZone.pct.toFixed(1) + '%' : '' }}</div>
        </div>
      </div>
      <p v-if="filtered.length === 0" class="empty">No hay sesiones en esta zona todavía.</p>
    </div>

    <div v-if="!loading && best" class="card best-session">
      <h3>🏆 Mejor sesión</h3>
      <div class="best-grid">
        <div>
          <div class="stat-label">Fecha</div>
          <div class="best-val">{{ best.session_date }}</div>
        </div>
        <div>
          <div class="stat-label">Zona</div>
          <div class="best-val">{{ zoneOf(best) }}</div>
        </div>
        <div>
          <div class="stat-label">Convertidos / Intentados</div>
          <div class="best-val">{{ best.made ?? best.shots_made }} / {{ best.attempts ?? best.shots_attempted }}</div>
        </div>
        <div>
          <div class="stat-label">Efectividad</div>
          <div class="best-val accent">{{ pctOf(best).toFixed(1) }}%</div>
        </div>
      </div>
    </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { shootingService } from '../api/shootingService'

const sessions = ref([])
const loading = ref(true)
const selectedZone = ref('')
const icons = { '': '📊', Triple: '🎯', 'Media Distancia': '📏', 'Tiro Libre': '🏁' }

const zoneOf = (x) => x.shot_zone ?? x.shot_type
const zones = computed(() => {
  const base = ['Triple', 'Media Distancia', 'Tiro Libre']
  const extra = sessions.value.map(zoneOf).filter((z) => z && !base.includes(z))
  return [...base, ...new Set(extra)]
})
const filtered = computed(() =>
  selectedZone.value ? sessions.value.filter((x) => zoneOf(x) === selectedZone.value) : sessions.value
)
const totalAttempts = computed(() => filtered.value.reduce((s, x) => s + Number(x.attempts ?? 0), 0))
const totalMade = computed(() => filtered.value.reduce((s, x) => s + Number(x.made ?? 0), 0))
const accuracy = computed(() => (totalAttempts.value ? ((totalMade.value / totalAttempts.value) * 100).toFixed(1) : '–'))
const pctOf = (x) => (Number(x.attempts) ? (Number(x.made) / Number(x.attempts)) * 100 : 0)
const bestZone = computed(() => {
  let name = '–', pct = null
  for (const z of zones.value) {
    const list = sessions.value.filter((x) => zoneOf(x) === z)
    const att = list.reduce((s, x) => s + Number(x.attempts ?? 0), 0)
    const made = list.reduce((s, x) => s + Number(x.made ?? 0), 0)
    if (att && (pct === null || made / att * 100 > pct)) { name = z; pct = (made / att) * 100 }
  }
  return { name, pct }
})
const best = computed(() => {
  const list = filtered.value.filter((x) => Number(x.attempts) > 0)
  return list.length ? list.reduce((a, b) => (pctOf(b) > pctOf(a) ? b : a)) : null
})

onMounted(async () => {
  try {
    const res = await shootingService.getSessions()
    const list = res.sessions || res
    sessions.value = Array.isArray(list) ? list : []
  } catch (e) { /* sin sesiones */ }
  loading.value = false
})
</script>
