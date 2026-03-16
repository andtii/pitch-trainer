<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  centsOff: number
  isActive: boolean
  noteName?: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let animFrameId: number | null = null
let displayCents = 0

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !canvas.value) return

  const w = canvas.value.width
  const h = canvas.value.height
  const cx = w / 2
  const cy = h - 20

  // Smooth animation
  displayCents = lerp(displayCents, props.isActive ? props.centsOff : 0, 0.15)

  ctx.clearRect(0, 0, w, h)

  const radius = Math.min(cx - 20, cy - 20)

  // Draw arc background
  ctx.beginPath()
  ctx.arc(cx, cy, radius, Math.PI, 0)
  ctx.strokeStyle = 'rgba(42, 42, 68, 0.8)'
  ctx.lineWidth = 8
  ctx.stroke()

  // Draw colored zones
  const zones = [
    { start: -50, end: -25, color: 'rgba(239, 68, 68, 0.4)' },
    { start: -25, end: -10, color: 'rgba(234, 179, 8, 0.4)' },
    { start: -10, end: 10, color: 'rgba(34, 197, 94, 0.4)' },
    { start: 10, end: 25, color: 'rgba(234, 179, 8, 0.4)' },
    { start: 25, end: 50, color: 'rgba(239, 68, 68, 0.4)' },
  ]

  for (const zone of zones) {
    const startAngle = Math.PI + ((zone.start + 50) / 100) * Math.PI
    const endAngle = Math.PI + ((zone.end + 50) / 100) * Math.PI
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.strokeStyle = zone.color
    ctx.lineWidth = 12
    ctx.stroke()
  }

  // Draw tick marks
  for (let cents = -50; cents <= 50; cents += 10) {
    const angle = Math.PI + ((cents + 50) / 100) * Math.PI
    const innerR = radius - 18
    const outerR = radius + (cents === 0 ? 12 : 6)
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

  // Draw needle
  if (props.isActive) {
    const clampedCents = Math.max(-50, Math.min(50, displayCents))
    const needleAngle = Math.PI + ((clampedCents + 50) / 100) * Math.PI
    const needleLength = radius - 25

    const absCents = Math.abs(displayCents)
    let needleColor: string
    if (absCents <= 10) needleColor = '#22c55e'
    else if (absCents <= 25) needleColor = '#eab308'
    else needleColor = '#ef4444'

    // Glow
    ctx.shadowColor = needleColor
    ctx.shadowBlur = 10

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(
      cx + Math.cos(needleAngle) * needleLength,
      cy + Math.sin(needleAngle) * needleLength
    )
    ctx.strokeStyle = needleColor
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.shadowBlur = 0

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fillStyle = needleColor
    ctx.fill()
  }

  // Labels
  ctx.font = '12px var(--font-sans, system-ui)'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('♭ flat', cx - radius + 20, cy + 16)
  ctx.fillText('sharp ♯', cx + radius - 20, cy + 16)

  // Cents display
  if (props.isActive) {
    const absCents = Math.abs(Math.round(displayCents))
    const sign = displayCents > 0.5 ? '+' : displayCents < -0.5 ? '-' : ''
    ctx.font = 'bold 24px var(--font-mono, monospace)'
    ctx.fillStyle = props.isActive ? '#e8e8f0' : 'rgba(255,255,255,0.3)'
    ctx.textAlign = 'center'
    ctx.fillText(`${sign}${absCents}¢`, cx, cy - 30)
  }

  animFrameId = requestAnimationFrame(draw)
}

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth * window.devicePixelRatio
    canvas.value.height = canvas.value.offsetHeight * window.devicePixelRatio
    const ctx = canvas.value.getContext('2d')
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    canvas.value.style.width = canvas.value.offsetWidth + 'px'
    canvas.value.style.height = canvas.value.offsetHeight + 'px'
  }
  draw()
})

onUnmounted(() => {
  if (animFrameId !== null) cancelAnimationFrame(animFrameId)
})
</script>

<template>
  <div class="pitch-meter">
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
}

.meter-canvas {
  width: 320px;
  height: 180px;
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
