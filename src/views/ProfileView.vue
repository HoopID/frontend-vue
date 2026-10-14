<template>
  <div style="max-width: 600px; margin: 2rem auto; font-family: sans-serif; padding: 0 1rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2>🏀 Perfil Físico y Deportivo</h2>
      <router-link to="/">Volver al Dashboard</router-link>
    </div>

    <div v-if="loading">Cargando perfil...</div>

    <form v-else @submit.prevent="handleSave">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <label>Altura (cm):</label><br />
          <input v-model.number="profile.height_cm" type="number" step="0.1" style="width: 100%; padding: 8px; margin-top: 4px;" />
        </div>
        <div>
          <label>Peso (kg):</label><br />
          <input v-model.number="profile.weight_kg" type="number" step="0.1" style="width: 100%; padding: 8px; margin-top: 4px;" />
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Envergadura (cm):</label><br />
        <input v-model.number="profile.wingspan_cm" type="number" step="0.1" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Posición principal:</label><br />
        <select v-model="profile.position" style="width: 100%; padding: 8px; margin-top: 4px;">
          <option value="">Selecciona una posición</option>
          <option value="Base">Base (Point Guard)</option>
          <option value="Escolta">Escolta (Shooting Guard)</option>
          <option value="Alero">Alero (Small Forward)</option>
          <option value="Ala-Pívot">Ala-Pívot (Power Forward)</option>
          <option value="Pívot">Pívot (Center)</option>
        </select>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Club actual:</label><br />
        <input v-model="profile.club" type="text" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Liga / Competencia:</label><br />
        <input v-model="profile.league" type="text" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <button type="submit" :disabled="saving" style="padding: 10px 20px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 4px;">
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </form>

    <p v-if="successMessage" style="color: green; margin-top: 1rem; font-weight: bold;">{{ successMessage }}</p>
    <p v-if="errorMessage" style="color: red; margin-top: 1rem; font-weight: bold;">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { profileService } from '../api/profileService'

const profile = ref({
  height_cm: null,
  weight_kg: null,
  wingspan_cm: null,
  position: '',
  club: '',
  league: ''
})

const loading = ref(true)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const fetchProfile = async () => {
  loading.value = true
  try {
    const data = await profileService.getProfile()
    if (data) {
      profile.value = { ...profile.value, ...data }
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
    errorMessage.value = error.response?.data?.detail || 'Error al guardar el perfil.'
  } finally {
    saving.value = false
  }
}

fetchProfile()
</script>