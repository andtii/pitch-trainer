<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

const props = defineProps<{
  centsOff: number
  isActive: boolean
  noteName?: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const wrapper = ref<HTMLElement | null>(null)
let animFrameId: number | null = null
let displayCents = 0
let resizeObserver: ResizeObserver | null = null
// Logical (CSS) size used for drawing calculations
let logicalW = 320
let logicalH = 180

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function sizeCanvas() {
  if (!canvas.value || !wrapper.value) return
  const containerW = wrapper.value.clientWidth
  const w = Math.min(containerW, 320)
  const h = Math.round(w * (180 / 320))
  logicalW = w
  logicalH = h
  const dpr = window.devicePixelRatio || 1
  canvas.value.width = w * dpr
  canvas.value.height = h * dpr
  canvas.value.style.width = w + 'px'
  canvas.value.style.height = h + 'px'
  const ctx = canvas.value.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !canvas.value) return

  const w = logicalW
  const h = logicalH
  const scale = w / 320

  const cx = w / 2
  const cy = h - 20 * scale

  displayCents = lerp(displayCents, props.isActive ? props.centsOff : 0, 0.15)

  ctx.save()
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  const radius = Math.min(cx - 20 * scale, cy - 20 * scale)

  // Arc background
  ctx.beginPath()
  ctx.arc(cx, cy, radius, Math.PI, 0)
  ctx.strokeStyle = 'rgba(42, 42, 68, 0.8)'
  ctx.lineWidth = 8 * scale
  ctx.stroke()

  // Colored zones — driven by settings store
  const greenZone = settings.greenZoneCents
  const yellowZone = settings.yellowZoneCents
  const zones = [
    { start: -50, end: -yellowZone, color: 'rgba(239, 68, 68, 0.4)' },
    { start: -yellowZone, end: -greenZone, color: 'rgba(234, 179, 8, 0.4)' },
    { start: -greenZone, end: greenZone, color: 'rgba(34, 197, 94, 0.4)' },
    { start: greenZone, end: yellowZone, color: 'rgba(234, 179, 8, 0.4)' },
    { start: yellowZone, end: 50, color: 'rgba(239, 68, 68, 0.4)' },
  ]

  for (const zone of zones) {
    const startAngle = Math.PI + ((zone.start + 50) / 100) * Math.PI
    const endAngle = Math.PI + ((zone.end + 50) / 100) * Math.PI
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.strokeStyle = zone.color
    ctx.lineWidth = 12 * scale
    ctx.stroke()
  }

  // Tick marks
  for (let cents = -50; cents <= 50; cents += 10) {
    const angle = Math.PI + ((cents + 50) / 100) * Math.PI
    const innerR = radius - 18 * scale
    const outerR = radius + (cents === 0 ? 12 : 6) * scale
    const x1 = cx + Math.cos(angle) * innerR
    const y1 = cy + Math.sin(angle) * innerR
    const x2 = cx + Math.cos(angle) * outerR
    const y2 = cy + Math.sin(angle) * outerR

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = cents === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'
    ctx.lineWidth = cents === 0 ? 2 : 1
    ctx.stroke()
  }

  // Needle
  if (props.isActive) {
    const clampedCents = Math.max(-50, Math.min(50, displayCents))
    const needleAngle = Math.PI + ((clampedCents + 50) / 100) * Math.PI
    const needleLength = radius - 25 * scale

    const absCents = Math.abs(displayCents)
    let needleColor: string
    if (absCents <= settings.greenZoneCents) needleColor = '#22c55e'
    else if (absCents <= settings.yellowZoneCents) needleColor = '#eab308'
    else needleColor = '#ef4444'

    ctx.shadowColor = needleColor
    ctx.shadowBlur = 10 * scale

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(
      cx + Math.cos(needleAngle) * needleLength,
      cy + Math.sin(needleAngle) * needleLength
    )
    ctx.strokeStyle = needleColor
    ctx.lineWidth = 3 * scale
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.shadowBlur = 0

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 6 * scale, 0, Math.PI * 2)
    ctx.fillStyle = needleColor
    ctx.fill()
  }

  // Labels
  ctx.font = `${Math.round(12 * scale)}px var(--font-sans, system-ui)`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('♭ flat', cx - radius + 20 * scale, cy + 16 * scale)
  ctx.fillText('sharp ♯', cx + radius - 20 * scale, cy + 16 * scale)

  // Cents display
  if (props.isActive) {
    const absCents = Math.abs(Math.round(displayCents))
    const sign = displayCents > 0.5 ? '+' : displayCents < -0.5 ? '-' : ''
    ctx.font = `bold ${Math.round(24 * scale)}px var(--font-mono, monospace)`
    ctx.fillStyle = '#e8e8f0'
    ctx.textAlign = 'center'
    ctx.fillText(`${sign}${absCents}¢`, cx, cy - 30 * scale)
  }

  ctx.restore()
  animFrameId = requestAnimationFrame(draw)
}

onMounted(() => {
  sizeCanvas()
  resizeObserver = new ResizeObserver(() => sizeCanvas())
  if (wrapper.value) resizeObserver.observe(wrapper.value)
  draw()
})

onUnmounted(() => {
  if (animFrameId !== null) cancelAnimationFrame(animFrameId)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="wrapper" class="pitch-meter">
    <canvas ref="canvas" class="meter-canvas"></canvas>
    <div v-if="noteName && isActive" class="detected-note">{{ noteName }}</div>
    <div v-else class="detected-note inactive">—</div>
  </div>
</template>

<style scoped>
.pitch-meter {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
}

.meter-canvas {
  display: block;
  max-width: 100%;
}

.detected-note {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0.25rem;
}

.detected-note.inactive {
  color: var(--text-muted);
}
</style>
