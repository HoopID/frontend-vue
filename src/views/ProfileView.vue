<template>
  <main class="container" style="max-width: 640px">
    <div class="page-header">
      <div>
        <h2>Perfil físico y deportivo</h2>
        <p>Tus medidas y afiliación.</p>
      </div>
    </div>

    <div v-if="loading" class="card empty">Cargando perfil...</div>

    <form v-else class="card" @submit.prevent="handleSave">
      <div class="grid-2">
        <div class="field">
          <label>Nombre *</label>
          <input v-model="profile.first_name" required type="text" />
        </div>
        <div class="field">
          <label>Apellido *</label>
          <input v-model="profile.last_name" required type="text" />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label>Altura (cm) *</label>
          <input v-model.number="profile.height_cm" required type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Peso (kg) *</label>
          <input v-model.number="profile.weight_kg" required type="number" step="0.1" />
        </div>
      </div>

      <div class="field">
        <label>Envergadura (cm) *</label>
        <input v-model.number="profile.wingspan_cm" required type="number" step="0.1" />
      </div>

      <div class="grid-2">
        <div class="field">
          <label>Salto vertical (cm) *</label>
          <input v-model.number="profile.vertical_leap_cm" required type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Mano hábil *</label>
          <select v-model="profile.dominant_hand" required>
            <option value="">Seleccioná</option>
            <option value="Derecha">Derecha</option>
            <option value="Izquierda">Izquierda</option>
            <option value="Ambidiestro">Ambidiestro</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Posición principal *</label>
        <select v-model="profile.position" required>
          <option value="">Seleccioná una posición</option>
          <option value="Base">Base (Point Guard)</option>
          <option value="Escolta">Escolta (Shooting Guard)</option>
          <option value="Alero">Alero (Small Forward)</option>
          <option value="Ala-Pívot">Ala-Pívot (Power Forward)</option>
          <option value="Pívot">Pívot (Center)</option>
        </select>
      </div>

      <div class="grid-2">
        <div class="field">
          <label>Club actual</label>
          <input v-model="profile.current_club" type="text" />
        </div>
        <div class="field">
          <label>Selección (provincial / nacional)</label>
          <input v-model="profile.selection_team" type="text" />
        </div>
      </div>

      <button type="submit" class="btn" :disabled="saving">
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>

      <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { profileService } from '../api/profileService'

const profile = ref({
  height_cm: null,
  weight_kg: null,
  wingspan_cm: null,
  first_name: '',
  last_name: '',
  vertical_leap_cm: null,
  dominant_hand: '',
  position: '',
  current_club: '',
  selection_team: ''
})

const loading = ref(true)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const fetchProfile = async () => {
  loading.value = true
  try {
    const data = await profileService.getProfile()
    if (data?.profile) {
      const clean = Object.fromEntries(Object.entries(data.profile).map(([k, v]) => [k, v ?? profile.value[k] ?? null]))
      profile.value = { ...profile.value, ...clean }
    }
  } catch (error) {
    errorMessage.value = 'Error al cargar los datos del perfil.'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await profileService.updateProfile(profile.value)
    successMessage.value = '¡Perfil actualizado con éxito!'
  } catch (error) {
    const data = error.response?.data
    errorMessage.value = data?.message || data?.detail || 'Error al guardar el perfil.'
  } finally {
    saving.value = false
  }
}

fetchProfile()
</script>
