<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps<{
  stdDevCents: number
  isActive: boolean
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const wrapper = ref<HTMLElement | null>(null)
let animFrameId: number | null = null
let resizeObserver: ResizeObserver | null = null
let logicalSize = 220
let displayStdDev = 0

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

const score = computed(() => {
  if (!props.isActive) return null
  return Math.max(0, Math.round(100 - props.stdDevCents * 4))
})

const scoreColor = computed(() => {
  if (score.value === null) return '#6b7280'
  if (score.value >= 80) return '#22c55e'
  if (score.value >= 50) return '#eab308'
  return '#ef4444'
})

import { onMounted } from 'vue'

function sizeCanvas() {
  if (!canvas.value || !wrapper.value) return
  const containerW = wrapper.value.clientWidth
  const size = Math.min(containerW, 220)
  logicalSize = size
  const dpr = window.devicePixelRatio || 1
  canvas.value.width = size * dpr
  canvas.value.height = size * dpr
  canvas.value.style.width = size + 'px'
  canvas.value.style.height = size + 'px'
  const ctx = canvas.value.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !canvas.value) return

  const size = logicalSize
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size / 2 - 12

  displayStdDev = lerp(displayStdDev, props.isActive ? props.stdDevCents : 0, 0.1)

  ctx.save()
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // Stability factor: 1 = perfectly stable, 0 = very unstable
  const stability = Math.max(0, Math.min(1, 1 - displayStdDev / 30))

  // Ring radius wobbles when unstable
  const time = performance.now() / 1000
  const wobble = props.isActive ? (1 - stability) * 8 * Math.sin(time * 6) : 0
  const ringRadius = maxRadius * (0.6 + stability * 0.35) + wobble

  // Ring color transitions from red → yellow → green
  let r: number, g: number, b: number
  if (stability >= 0.7) {
    // Green zone
    const t = (stability - 0.7) / 0.3
    r = Math.round(234 - t * 200)
    g = Math.round(179 + t * 18)
    b = Math.round(8 + t * 86)
  } else if (stability >= 0.3) {
    // Yellow zone
    const t = (stability - 0.3) / 0.4
    r = Math.round(239 - t * 5)
    g = Math.round(68 + t * 111)
    b = 8
  } else {
    // Red zone
    r = 239
    g = 68
    b = 68
  }

  const ringColor = `rgb(${r}, ${g}, ${b})`

  // Outer glow
  if (props.isActive) {
    ctx.beginPath()
    ctx.arc(cx, cy, ringRadius + 4, 0, Math.PI * 2)
    ctx.strokeStyle = ringColor
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.15 + stability * 0.2
    ctx.shadowColor = ringColor
    ctx.shadowBlur = 20
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }

  // Background ring track
  ctx.beginPath()
  ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(42, 42, 68, 0.5)'
  ctx.lineWidth = 6
  ctx.stroke()

  // Active ring
  if (props.isActive) {
    ctx.beginPath()
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2)
    ctx.strokeStyle = ringColor
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  // Center score text
  if (score.value !== null && props.isActive) {
    ctx.font = `bold ${Math.round(size * 0.18)}px var(--font-mono, monospace)`
    ctx.fillStyle = scoreColor.value
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${score.value}%`, cx, cy - 8)

    ctx.font = `${Math.round(size * 0.07)}px var(--font-sans, system-ui)`
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText('stability', cx, cy + size * 0.1)
  } else {
    ctx.font = `${Math.round(size * 0.08)}px var(--font-sans, system-ui)`
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Sing a note', cx, cy)
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
  <div ref="wrapper" class="stability-meter">
    <canvas ref="canvas" class="meter-canvas"></canvas>
  </div>
</template>

<style scoped>
.stability-meter {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 220px;
}

.meter-canvas {
  display: block;
}
</style>
