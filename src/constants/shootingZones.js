// Zonas predefinidas del mapa de tiro. Las claves deben coincidir con el backend (src/constants/zones.js).
export const SHOT_ZONES = [
  { key: 'paint', label: 'Pintura' },
  { key: 'free_throw', label: 'Tiro libre' },
  { key: 'mid_left', label: 'Media izquierda' },
  { key: 'elbow_left', label: 'Codo izquierdo' },
  { key: 'mid_center', label: 'Media central' },
  { key: 'elbow_right', label: 'Codo derecho' },
  { key: 'mid_right', label: 'Media derecha' },
  { key: 'corner_left', label: 'Triple esquina izq.' },
  { key: 'wing_left', label: 'Triple ala izq.' },
  { key: 'top', label: 'Triple frontal' },
  { key: 'wing_right', label: 'Triple ala der.' },
  { key: 'corner_right', label: 'Triple esquina der.' }
]

export const zoneLabel = (key) => SHOT_ZONES.find((z) => z.key === key)?.label ?? key

// Resume las zonas de una lista de sesiones: { [zona]: { attempts, made } }
export function zoneTotals(sessions) {
  const totals = {}
  for (const s of sessions) {
    for (const z of s.zones ?? []) {
      totals[z.zone] ??= { attempts: 0, made: 0 }
      totals[z.zone].attempts += Number(z.attempts)
      totals[z.zone].made += Number(z.made)
    }
  }
  return totals
}
