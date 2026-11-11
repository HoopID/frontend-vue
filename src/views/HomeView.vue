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
            <div class="stat-value">{{ bestZone }}</div>
            <div class="stat-label">Mejor zona</div>
          </div>
        </div>
      <span class="tile-hint">Ver por zona →</span>
      </router-link>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { profileService } from '../api/profileService'
import { shootingService } from '../api/shootingService'

const authStore = useAuthStore()
const profile = ref({})
const sessions = ref([])

const displayName = computed(() => [profile.value.first_name, profile.value.last_name].filter(Boolean).join(' ') || authStore.user?.email?.split('@')[0] || 'Atleta')
const initial = computed(() => displayName.value.charAt(0).toUpperCase())
const sessionCount = computed(() => sessions.value.length)
const totalAttempts = computed(() => sessions.value.reduce((s, x) => s + Number(x.attempts ?? 0), 0))
const totalMade = computed(() => sessions.value.reduce((s, x) => s + Number(x.made ?? 0), 0))
const accuracy = computed(() => (totalAttempts.value ? ((totalMade.value / totalAttempts.value) * 100).toFixed(1) : '–'))
const bestZone = computed(() => {
  const zones = {}
  for (const x of sessions.value) {
    const z = x.shot_zone ?? x.shot_type
    zones[z] ??= { made: 0, att: 0 }
    zones[z].made += Number(x.made ?? 0)
    zones[z].att += Number(x.attempts ?? 0)
  }
  let best = '–', bestPct = -1
  for (const [z, v] of Object.entries(zones)) {
    const pct = v.att ? v.made / v.att : 0
    if (pct > bestPct) { best = z; bestPct = pct }
  }
  return best
})

onMounted(async () => {
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
