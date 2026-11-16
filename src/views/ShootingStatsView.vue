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
    <aside class="court-panel">
      <CourtMap v-model="selectedZone" :stats="allTotals" />
      <p class="court-hint">
        {{ selectedZone ? zoneLabel(selectedZone) : 'Todas las zonas' }} ·
        tocá una zona para filtrar
      </p>
      <button v-if="selectedZone" type="button" class="btn btn-ghost" @click="selectedZone = ''">Ver todas</button>
    </aside>

      <section class="stats-content">
    <div v-if="loading" class="card empty">Cargando estadísticas...</div>
    <div v-else class="card">
      <div class="tile-stats">
        <div class="big-pct">{{ accuracy }}<small>%</small></div>
        <div class="stat-label">Efectividad {{ selectedZone ? '· ' + zoneLabel(selectedZone) : 'total' }}</div>
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
          <div class="stat-value">{{ sessionCount }}</div>
          <div class="stat-label">Sesiones</div>
        </div>
        <div v-if="!selectedZone" class="stat">
          <div class="stat-value">{{ bestZone.name === '–' ? '–' : zoneLabel(bestZone.name) }}</div>
          <div class="stat-label">Mejor zona{{ bestZone.pct !== null ? ' · ' + bestZone.pct.toFixed(1) + '%' : '' }}</div>
        </div>
      </div>
      <p v-if="rows.length === 0" class="empty">No hay sesiones en esta zona todavía.</p>
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
          <div class="best-val">{{ best.zoneText }}</div>
        </div>
        <div>
          <div class="stat-label">Convertidos / Intentados</div>
          <div class="best-val">{{ best.made }} / {{ best.attempts }}</div>
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
import CourtMap from '../components/CourtMap.vue'
import { SHOT_ZONES, zoneLabel, zoneTotals } from '../constants/shootingZones'

const sessions = ref([])
const loading = ref(true)
const selectedZone = ref('')

const pctOf = (x) => (Number(x.attempts) ? (Number(x.made) / Number(x.attempts)) * 100 : 0)

// Totales por zona de todas las sesiones (colorea la cancha)
const allTotals = computed(() => zoneTotals(sessions.value))

// Una fila por (sesión, zona), filtrada por la zona elegida
const rows = computed(() =>
  sessions.value.flatMap((s) =>
    (s.zones ?? [])
      .filter((z) => !selectedZone.value || z.zone === selectedZone.value)
      .map((z) => ({ session_id: s.id, session_date: s.session_date, ...z }))
  )
)
const totalAttempts = computed(() => rows.value.reduce((s, x) => s + Number(x.attempts), 0))
const totalMade = computed(() => rows.value.reduce((s, x) => s + Number(x.made), 0))
const accuracy = computed(() => (totalAttempts.value ? ((totalMade.value / totalAttempts.value) * 100).toFixed(1) : '–'))
const sessionCount = computed(() => new Set(rows.value.map((x) => x.session_id)).size)

const bestZone = computed(() => {
  let name = '–', pct = null
  for (const z of SHOT_ZONES) {
    const t = allTotals.value[z.key]
    if (t && t.attempts && (pct === null || (t.made / t.attempts) * 100 > pct)) {
      name = z.key
      pct = (t.made / t.attempts) * 100
    }
  }
  return { name, pct }
})

// Mejor sesión: con zona elegida, por esa zona; sin filtro, por el total de la sesión
const best = computed(() => {
  const bySession = new Map()
  for (const r of rows.value) {
    const cur = bySession.get(r.session_id) ?? { session_date: r.session_date, attempts: 0, made: 0, zones: [] }
    cur.attempts += Number(r.attempts)
    cur.made += Number(r.made)
    cur.zones.push(r.zone)
    bySession.set(r.session_id, cur)
  }
  const list = [...bySession.values()].filter((x) => x.attempts > 0)
  if (!list.length) return null
  const top = list.reduce((a, b) => (pctOf(b) > pctOf(a) ? b : a))
  return {
    ...top,
    zoneText: top.zones.length === 1 ? zoneLabel(top.zones[0]) : `${top.zones.length} zonas`
  }
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
