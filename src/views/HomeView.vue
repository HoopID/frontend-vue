<template>
  <main class="container container-full home-full">
    <section class="duo">
      <router-link to="/profile" class="tile tile-link">
        <h3 class="tile-title">Perfil</h3>
        <div class="avatar">{{ initial }}</div>
        <h2 class="tile-name">{{ displayName }}</h2>
        <div class="athlete-meta">
          <span v-if="profile.position" class="chip">{{ profile.position }}</span>
          <span v-if="profile.current_club" class="chip">{{ profile.current_club }}</span>
          <span v-if="profile.selection_team" class="chip">{{ profile.selection_team }}</span>
          <span v-if="!profile.position && !profile.current_club" class="chip">Completá tu perfil</span>
        </div>
        <div class="card-stats">
          <div class="card-stat">
            <div class="stat-value">{{ profile.height_cm ?? '–' }}<small>cm</small></div>
            <div class="stat-label">Altura</div>
          </div>
          <div class="card-stat">
            <div class="stat-value">{{ profile.weight_kg ?? '–' }}<small>kg</small></div>
            <div class="stat-label">Peso</div>
          </div>
          <div class="card-stat">
            <div class="stat-value">{{ profile.wingspan_cm ?? '–' }}<small>cm</small></div>
            <div class="stat-label">Envergadura</div>
          </div>
          <div class="card-stat">
            <div class="stat-value">{{ profile.vertical_leap_cm ?? '–' }}<small>cm</small></div>
            <div class="stat-label">Salto</div>
          </div>
        </div>
      <span class="tile-hint">Editar perfil →</span>
      </router-link>

      <router-link to="/shooting-stats" class="tile tile-link">
        <h3 class="tile-title">Estadísticas de tiro</h3>
        <div class="big-pct">{{ accuracy }}<small>%</small></div>
        <div class="stat-label">Efectividad total</div>
        <div class="card-stats">
          <div class="card-stat">
            <div class="stat-value">{{ totalMade }}</div>
            <div class="stat-label">Convertidos</div>
          </div>
          <div class="card-stat">
            <div class="stat-value">{{ totalAttempts }}</div>
            <div class="stat-label">Intentados</div>
          </div>
          <div class="card-stat">
            <div class="stat-value">{{ sessionCount }}</div>
            <div class="stat-label">Sesiones</div>
          </div>
          <div class="card-stat">
            <div class="stat-value stat-text">{{ bestZone }}</div>
            <div class="stat-label">Mejor zona</div>
          </div>
        </div>
      <span class="tile-hint">Ver por zona →</span>
      </router-link>

      <router-link to="/matches" class="tile tile-link">
        <h3 class="tile-title">Partidos</h3>
        <div class="big-pct">{{ avgPoints }}<small>pts</small></div>
        <div class="stat-label">Promedio por partido</div>
        <div class="card-stats">
          <div class="card-stat">
            <div class="stat-value">{{ matches.length }}</div>
            <div class="stat-label">Jugados</div>
          </div>
          <div class="card-stat">
            <div class="stat-value">{{ avgOf('rebounds') }}</div>
            <div class="stat-label">Rebotes</div>
          </div>
          <div class="card-stat">
            <div class="stat-value">{{ avgOf('assists') }}</div>
            <div class="stat-label">Asistencias</div>
          </div>
          <div class="card-stat">
            <div class="stat-value stat-text">{{ lastRival }}</div>
            <div class="stat-label">Último rival</div>
          </div>
        </div>
      <span class="tile-hint">Ver partidos →</span>
      </router-link>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { profileService } from '../api/profileService'
import { shootingService } from '../api/shootingService'
import { matchService } from '../api/matchService'
import { zoneLabel, zoneTotals } from '../constants/shootingZones'

const authStore = useAuthStore()
const profile = ref({})
const sessions = ref([])
const matches = ref([])

const displayName = computed(() => [profile.value.first_name, profile.value.last_name].filter(Boolean).join(' ') || authStore.user?.email?.split('@')[0] || 'Atleta')
const initial = computed(() => displayName.value.charAt(0).toUpperCase())
const sessionCount = computed(() => sessions.value.length)
const totalAttempts = computed(() => sessions.value.reduce((s, x) => s + Number(x.attempts ?? 0), 0))
const totalMade = computed(() => sessions.value.reduce((s, x) => s + Number(x.made ?? 0), 0))
const accuracy = computed(() => (totalAttempts.value ? ((totalMade.value / totalAttempts.value) * 100).toFixed(1) : '–'))
const bestZone = computed(() => {
  let best = '–', bestPct = -1
  for (const [z, v] of Object.entries(zoneTotals(sessions.value))) {
    const pct = v.attempts ? v.made / v.attempts : 0
    if (pct > bestPct) { best = zoneLabel(z); bestPct = pct }
  }
  return best
})

const avgOf = (f) => (matches.value.length ? (matches.value.reduce((s, m) => s + Number(m[f] ?? 0), 0) / matches.value.length).toFixed(1) : '–')
const avgPoints = computed(() => avgOf('points'))
const lastRival = computed(() => matches.value[0]?.opponent ?? '–')

onMounted(async () => {
  try {
    const res = await matchService.getMatches()
    matches.value = Array.isArray(res.matches) ? res.matches : []
  } catch (e) { /* sin partidos */ }
  try {
    const res = await profileService.getProfile()
    profile.value = res?.profile || {}
  } catch (e) { /* perfil aún no creado */ }
  try {
    const res = await shootingService.getSessions()
    const list = res.sessions || res
    sessions.value = Array.isArray(list) ? list : []
  } catch (e) { /* sin sesiones */ }
})
</script>
