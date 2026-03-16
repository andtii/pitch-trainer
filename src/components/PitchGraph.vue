<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { NoteInfo } from '@/types'
import { formatNote, frequencyToMidi } from '@/lib/musicTheory'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

const props = defineProps<{
  targetNote: NoteInfo | null
  detectedFrequency: number | null
  isActive: boolean
  referencePitch?: number
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const wrapper = ref<HTMLElement | null>(null)
let animFrameId: number | null = null
let resizeObserver: ResizeObserver | null = null
let logicalW = 400
let logicalH = 200

interface PitchPoint {
  time: number
  midi: number
  centsOff: number
}

const history: PitchPoint[] = []
const WINDOW_SECONDS = 8
const MAX_POINTS = 500

function sizeCanvas() {
  if (!canvas.value || !wrapper.value) return
  const w = wrapper.value.clientWidth
  const h = Math.min(200, Math.round(w * 0.5))
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

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.save()

  const now = performance.now() / 1000

  // Add current point
  if (props.isActive && props.detectedFrequency) {
    const midi = frequencyToMidi(props.detectedFrequency, props.referencePitch ?? 440)
    const rounded = Math.round(midi)
    history.push({
      time: now,
      midi,
      centsOff: (midi - rounded) * 100,
    })
  }

  // Trim old points
  while (history.length > MAX_POINTS) history.shift()
  while (history.length > 0 && history[0].time < now - WINDOW_SECONDS) history.shift()

  const padding = { top: 20, bottom: 20, left: 50, right: 20 }
  const plotW = w - padding.left - padding.right
  const plotH = h - padding.top - padding.bottom

  // Determine Y range (in MIDI semitones)
  let minMidi = 55 // G3
  let maxMidi = 72 // C5
  if (props.targetNote) {
    minMidi = props.targetNote.midi - 6
    maxMidi = props.targetNote.midi + 6
  }
  const midiRange = maxMidi - minMidi

  function midiToY(midi: number): number {
    return padding.top + plotH - ((midi - minMidi) / midiRange) * plotH
  }

  function timeToX(t: number): number {
    return padding.left + ((t - (now - WINDOW_SECONDS)) / WINDOW_SECONDS) * plotW
  }

  // Grid lines for semitones
  ctx.strokeStyle = 'rgba(42, 42, 68, 0.5)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.font = '10px var(--font-mono, monospace)'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.textAlign = 'right'

  for (let m = Math.ceil(minMidi); m <= Math.floor(maxMidi); m++) {
    const y = midiToY(m)
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(w - padding.right, y)
    ctx.stroke()
  }
  ctx.setLineDash([])

  // Target note line
  if (props.targetNote) {
    const targetY = midiToY(props.targetNote.midi)
    ctx.strokeStyle = 'rgba(0, 229, 204, 0.6)'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.moveTo(padding.left, targetY)
    ctx.lineTo(w - padding.right, targetY)
    ctx.stroke()
    ctx.setLineDash([])

    // Target label
    ctx.font = 'bold 12px var(--font-sans, system-ui)'
    ctx.fillStyle = '#00e5cc'
    ctx.textAlign = 'left'
    ctx.fillText(formatNote(props.targetNote), w - padding.right + 4, targetY + 4)
  }

  // Draw pitch trail
  if (history.length > 1) {
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1]
      const curr = history[i]

      if (curr.time - prev.time > 0.2) continue

      const x1 = timeToX(prev.time)
      const y1 = midiToY(prev.midi)
      const x2 = timeToX(curr.time)
      const y2 = midiToY(curr.midi)

      let deviation = 0
      if (props.targetNote) {
        deviation = Math.abs(curr.midi - props.targetNote.midi) * 100
      }

      let color: string
      if (deviation <= settings.greenZoneCents) color = '#22c55e'
      else if (deviation <= settings.yellowZoneCents) color = '#eab308'
      else color = '#ef4444'

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()
    }
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
  history.length = 0
})
</script>

<template>
  <div ref="wrapper" class="pitch-graph">
    <canvas ref="canvas" class="graph-canvas"></canvas>
  </div>
</template>

<style scoped>
.pitch-graph {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: rgba(15, 15, 26, 0.8);
  overflow: hidden;
}

.graph-canvas {
  display: block;
}
</style>
