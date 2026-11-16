<template>
  <div class="court-wrap">
    <svg class="court" viewBox="-10 -6 520 348" role="group" aria-label="Mapa de tiro">
      <defs>
        <linearGradient :id="woodId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#d9a066" />
          <stop offset="1" stop-color="#b9772f" />
        </linearGradient>
        <pattern :id="plankId" width="25" height="10" patternUnits="userSpaceOnUse">
          <rect width="25" height="10" fill="none" />
          <rect width="1.5" height="10" fill="rgba(0,0,0,0.10)" />
        </pattern>
        <clipPath :id="clipId" clip-rule="evenodd">
          <path :d="OUTSIDE" clip-rule="evenodd" />
        </clipPath>
        <clipPath :id="insideId">
          <path :d="INSIDE" />
        </clipPath>
        <filter :id="glowId" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ff6b1a" flood-opacity="0.95" />
        </filter>
      </defs>

      <!-- Piso de madera -->
      <rect x="0" y="10" width="500" height="320" rx="6" :fill="`url(#${woodId})`" />
      <rect x="0" y="10" width="500" height="320" rx="6" :fill="`url(#${plankId})`" />
      <!-- Pintura (zona pintada) -->
      <rect x="170" y="10" width="160" height="190" fill="rgba(160,60,20,0.55)" />

      <!-- Áreas de click de cada zona (invisibles; se iluminan al pasar el mouse) -->
      <g :clip-path="`url(#${insideId})`">
        <path v-for="z in inside" :key="z.key" :d="z.d" v-bind="zoneAttrs(z.key)" @click="pick(z.key)">
          <title>{{ zoneLabel(z.key) }}</title>
        </path>
      </g>
      <g :clip-path="`url(#${clipId})`">
        <path v-for="z in wings" :key="z.key" :d="z.d" v-bind="zoneAttrs(z.key)" @click="pick(z.key)">
          <title>{{ zoneLabel(z.key) }}</title>
        </path>
      </g>
      <path v-for="z in corners" :key="z.key" :d="z.d" v-bind="zoneAttrs(z.key)" @click="pick(z.key)">
        <title>{{ zoneLabel(z.key) }}</title>
      </path>
      <!-- Tiro libre: círculo centrado en la línea de tiro libre -->
      <circle :cx="FT.cx" :cy="FT.cy" :r="FT.r" v-bind="zoneAttrs('free_throw')" @click="pick('free_throw')">
        <title>{{ zoneLabel('free_throw') }}</title>
      </circle>

      <!-- Líneas de la cancha -->
      <g class="lines">
        <rect x="0" y="10" width="500" height="320" rx="6" />
        <rect x="170" y="10" width="160" height="190" />
        <path d="M190 200 A60 60 0 0 0 310 200" />
        <path d="M190 200 A60 60 0 0 1 310 200" stroke-dasharray="6 6" />
        <path d="M30 10 V142 A237.5 237.5 0 0 0 470 142 V10" />
        <path d="M210 10 V52 A40 40 0 0 0 290 52 V10" />
        <path d="M190 330 A60 60 0 0 1 310 330" />
        <path d="M220 38 H280" class="board" />
        <path d="M250 38 V44.5" />
        <circle cx="250" cy="52" r="7.5" class="hoop" />
        <path d="M170 70 h-8 M170 100 h-8 M170 130 h-8 M170 160 h-8 M330 70 h8 M330 100 h8 M330 130 h8 M330 160 h8" />
      </g>

      <!-- Puntos: uno por zona -->
      <g class="dots" pointer-events="none">
        <g v-for="d in dots" :key="d.key" :class="['dot', { selected: modelValue === d.key }]">
          <circle
            :cx="d.x"
            :cy="d.y"
            r="13"
            class="dot-c"
            :fill="dotColor(d.key)"
            :filter="modelValue === d.key ? `url(#${glowId})` : null"
          />
          <text
            v-if="valueText(d.key)"
            :x="d.side === 'right' ? d.x + 20 : d.x"
            :y="d.side === 'right' ? d.y + 5 : d.y + 28"
            :text-anchor="d.side === 'right' ? 'start' : 'middle'"
            class="lbl-val"
          >
            {{ valueText(d.key) }}
          </text>
        </g>
      </g>
    </svg>

    <ul class="legend" aria-label="Referencias de color">
      <li><i class="sw sw-high"></i> 60% o más</li>
      <li><i class="sw sw-mid"></i> 40% a 59%</li>
      <li><i class="sw sw-low"></i> menos de 40%</li>
      <li><i class="sw sw-none"></i> sin datos</li>
    </ul>
  </div>
</template>

<script setup>
import { zoneLabel } from '../constants/shootingZones'

// modelValue: zona seleccionada. stats: { [zona]: { attempts, made } } para colorear y mostrar aciertos.
const props = defineProps({
  modelValue: { type: String, default: '' },
  stats: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue'])

const uid = `court${Math.random().toString(36).slice(2, 8)}`
const clipId = `${uid}-out`
const insideId = `${uid}-in`
const woodId = `${uid}-wood`
const plankId = `${uid}-plank`
const glowId = `${uid}-glow`

// Geometría (media cancha, aro arriba): el aro está en (250, 52) y la línea de 3 a 237,5 de radio.
const INSIDE = 'M30 10 V142 A237.5 237.5 0 0 0 470 142 V10 Z'
const OUTSIDE = `M0 10 H500 V330 H0 Z ${INSIDE}`
const FT = { cx: 250, cy: 200, r: 26 } // centro de la línea de tiro libre

const inside = [
  { key: 'paint', d: 'M170 10 H330 V200 H170 Z' },
  { key: 'mid_left', d: 'M30 10 H170 V150 H30 Z' },
  { key: 'mid_right', d: 'M330 10 H470 V150 H330 Z' },
  { key: 'mid_center', d: 'M170 200 H330 V330 H170 Z' },
  // Codos: media distancia a la altura de la línea de tiro libre, a cada lado de la pintura
  { key: 'elbow_left', d: 'M30 150 H170 V330 H30 Z' },
  { key: 'elbow_right', d: 'M330 150 H470 V330 H330 Z' }
]
const wings = [
  { key: 'wing_left', d: 'M0 142 L30 142 L250 52 L110 330 L0 330 Z' },
  { key: 'top', d: 'M250 52 L110 330 L390 330 Z' },
  { key: 'wing_right', d: 'M500 142 L470 142 L250 52 L390 330 L500 330 Z' }
]
const corners = [
  { key: 'corner_left', d: 'M0 10 H30 V142 H0 Z' },
  { key: 'corner_right', d: 'M470 10 H500 V142 H470 Z' }
]

// Posición del punto de cada zona
const dots = [
  { key: 'paint', x: 250, y: 118 },
  { key: 'free_throw', x: FT.cx, y: FT.cy },
  { key: 'mid_left', x: 100, y: 80 },
  { key: 'elbow_left', x: 120, y: 205 },
  { key: 'elbow_right', x: 380, y: 205 },
  { key: 'mid_center', x: 250, y: 262 },
  { key: 'mid_right', x: 400, y: 80 },
  { key: 'corner_left', x: 15, y: 76 },
  { key: 'corner_right', x: 485, y: 76 },
  { key: 'wing_left', x: 70, y: 268 },
  { key: 'top', x: 250, y: 310, side: 'right' },
  { key: 'wing_right', x: 430, y: 268 }
]

const dotColor = (key) => {
  const s = props.stats[key]
  if (!s || !s.attempts) return 'rgba(255,255,255,0.85)'
  const pct = (s.made / s.attempts) * 100
  if (pct >= 60) return '#22c55e'
  if (pct >= 40) return '#facc15'
  return '#ef4444'
}

const zoneAttrs = (key) => ({
  class: ['zone', { selected: props.modelValue === key }],
  tabindex: 0,
  role: 'button',
  'aria-label': zoneLabel(key),
  'aria-pressed': props.modelValue === key,
  onKeydown: (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(key)
    }
  }
})

const valueText = (key) => {
  const s = props.stats[key]
  return s && s.attempts ? `${s.made}/${s.attempts}` : ''
}

const pick = (key) => emit('update:modelValue', props.modelValue === key ? '' : key)
</script>

<style scoped>
.court-wrap { width: 100%; max-width: 640px; margin: 0 auto; }
.court { width: 100%; display: block; border-radius: 12px; box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.8); background: #14141b; }
.zone { cursor: pointer; fill: transparent; stroke: transparent; stroke-width: 2; transition: fill 0.15s, stroke 0.15s; outline: none; }
.zone:hover, .zone:focus-visible { fill: rgba(255, 255, 255, 0.16); stroke: rgba(255, 255, 255, 0.8); }
.zone.selected { fill: rgba(255, 107, 26, 0.16); stroke: #ff6b1a; stroke-width: 3; }
.lines { fill: none; stroke: rgba(255, 255, 255, 0.92); stroke-width: 2.2; stroke-linecap: round; pointer-events: none; }
.lines .board { stroke-width: 4; }
.lines .hoop { stroke: #ff6b1a; stroke-width: 3.5; }
.dot-c { stroke: rgba(20, 20, 27, 0.85); stroke-width: 2.5; }
.dot.selected .dot-c { stroke: #ff6b1a; stroke-width: 4; }
.lbl-val { fill: #fff; font-size: 14px; font-weight: 800; paint-order: stroke; stroke: rgba(0, 0, 0, 0.75); stroke-width: 3.5px; stroke-linejoin: round; }
.legend { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem 1.1rem; margin: 0.8rem 0 0; padding: 0; font-size: 0.8rem; color: var(--text); }
.legend li { display: flex; align-items: center; gap: 0.4rem; }
.sw { display: inline-block; width: 0.9rem; height: 0.9rem; border-radius: 50%; border: 1px solid rgba(20, 20, 27, 0.85); }
.sw-high { background: #22c55e; }
.sw-mid { background: #facc15; }
.sw-low { background: #ef4444; }
.sw-none { background: rgba(255, 255, 255, 0.85); }
</style>
