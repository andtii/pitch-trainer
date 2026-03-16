<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { usePitchDetection } from '@/composables/usePitchDetection'
import { useSettingsStore } from '@/stores/settings'
import { formatNote } from '@/lib/musicTheory'
import StabilityMeter from '@/components/StabilityMeter.vue'
import PitchGraph from '@/components/PitchGraph.vue'

const settings = useSettingsStore()
const {
  isListening,
  detectedNote,
  detectedFrequency,
  startListening,
  stopListening,
} = usePitchDetection(settings.referencePitch)

const isExerciseActive = ref(false)
const stabilityScore = ref<number | null>(null)

// Rolling window of frequency samples for stability calculation
const WINDOW_MS = 2000
const frequencyHistory = ref<{ time: number; cents: number }[]>([])

// Convert frequency to cents relative to A4 for absolute comparison
function frequencyToCentsAbsolute(freq: number): number {
  return 1200 * Math.log2(freq / settings.referencePitch)
}

// Calculate standard deviation of cents values relative to their median
const stdDevCents = computed(() => {
  const samples = frequencyHistory.value
  if (samples.length < 5) return 0

  const centsValues = samples.map(s => s.cents)
  const sorted = [...centsValues].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  const deviations = centsValues.map(c => c - median)
  const variance = deviations.reduce((sum, d) => sum + d * d, 0) / deviations.length
  return Math.sqrt(variance)
})

const detectedNoteName = computed(() => {
  if (!detectedNote.value) return null
  return formatNote(detectedNote.value)
})

const encouragement = computed(() => {
  if (stabilityScore.value === null) return null
  if (stabilityScore.value >= 90) return { text: 'Amazing! Rock steady! 🎯', class: 'perfect' }
  if (stabilityScore.value >= 70) return { text: 'Great job! Very stable! 🌟', class: 'perfect' }
  if (stabilityScore.value >= 50) return { text: 'Getting there! Try to relax and sustain 💪', class: 'close' }
  if (stabilityScore.value >= 30) return { text: 'Keep at it! Focus on holding one note 🎵', class: 'off' }
  return { text: "Don't worry — this takes practice! Try humming gently 🫶", class: 'off' }
})

// Track frequency samples in the rolling window
let sampleInterval: ReturnType<typeof setInterval> | null = null

function startExercise() {
  stabilityScore.value = null
  frequencyHistory.value = []
  isExerciseActive.value = true

  sampleInterval = setInterval(() => {
    const now = performance.now()

    if (detectedFrequency.value) {
      const cents = frequencyToCentsAbsolute(detectedFrequency.value)
      frequencyHistory.value.push({ time: now, cents })
    }

    // Trim old samples outside the window
    const cutoff = now - WINDOW_MS
    while (frequencyHistory.value.length > 0 && frequencyHistory.value[0].time < cutoff) {
      frequencyHistory.value.shift()
    }
  }, 50)
}

function stopExercise() {
  if (sampleInterval) {
    clearInterval(sampleInterval)
    sampleInterval = null
  }

  // Calculate final score
  if (frequencyHistory.value.length >= 10) {
    stabilityScore.value = Math.max(0, Math.round(100 - stdDevCents.value * 4))
  }

  isExerciseActive.value = false
}

async function toggleMic() {
  if (isListening.value) {
    stopExercise()
    stopListening()
  } else {
    try {
      await startListening()
      startExercise()
    } catch {
      // Mic denied
    }
  }
}

function tryAgain() {
  stabilityScore.value = null
  frequencyHistory.value = []
  if (isListening.value) {
    startExercise()
  }
}

onUnmounted(() => {
  if (sampleInterval) clearInterval(sampleInterval)
  if (isListening.value) stopListening()
})
</script>

<template>
  <div class="stability-view container">
    <h1>🎯 Pitch Stability</h1>
    <p class="description">
      Sing any comfortable note and hold it steady. No target — just focus on keeping your pitch stable.
    </p>

    <div class="controls">
      <button
        class="btn"
        :class="isListening ? 'btn-active' : 'btn-primary'"
        @click="toggleMic"
      >
        {{ isListening ? '⏹ Stop' : '🎤 Start Singing' }}
      </button>
      <button
        v-if="stabilityScore !== null"
        class="btn btn-secondary"
        @click="tryAgain"
      >
        ↺ Try Again
      </button>
    </div>

    <!-- Live feedback while singing -->
    <div v-if="isListening && isExerciseActive" class="feedback-area">
      <div class="live-info">
        <div class="detected-label">You're singing</div>
        <div class="detected-note" :class="{ active: detectedNote }">
          {{ detectedNoteName ?? '...' }}
        </div>
      </div>

      <StabilityMeter
        :std-dev-cents="stdDevCents"
        :is-active="isExerciseActive && detectedNote !== null"
      />

      <PitchGraph
        :target-note="null"
        :detected-frequency="detectedFrequency"
        :is-active="isListening"
        :reference-pitch="settings.referencePitch"
      />

      <div class="tip">
        💡 Try to keep the ring steady and green. Relax your breath and sustain the note.
      </div>
    </div>

    <!-- Result after stopping -->
    <div v-if="stabilityScore !== null && !isListening" class="result-area">
      <div class="score-display">
        <div class="score-value" :class="encouragement?.class">
          {{ stabilityScore }}%
        </div>
        <div class="score-label">Stability Score</div>
      </div>

      <div v-if="encouragement" class="encouragement" :class="encouragement.class">
        {{ encouragement.text }}
      </div>
    </div>

    <!-- Intro prompt when idle -->
    <div v-if="!isListening && stabilityScore === null" class="intro-prompt">
      <div class="intro-icon">🎤</div>
      <p>Press <strong>Start Singing</strong> and hold any note you're comfortable with.</p>
      <p class="intro-hint">Don't worry about which note — just try to keep it steady!</p>
    </div>
  </div>
</template>

<style scoped>
.stability-view {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.stability-view h1 { margin-bottom: 0.5rem; }
.description {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.btn-active {
  background: var(--pitch-off);
  color: white;
}

.feedback-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.live-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.detected-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detected-note {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.detected-note.active {
  color: var(--accent-teal);
}

.tip {
  font-size: 0.9rem;
  color: var(--text-muted);
  max-width: 400px;
  line-height: 1.5;
}

.result-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.score-value {
  font-size: 4rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.score-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.encouragement {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
}

.perfect {
  color: var(--pitch-perfect);
}

.close {
  color: var(--pitch-close);
}

.off {
  color: var(--pitch-off);
}

.encouragement.perfect {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.encouragement.close {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.encouragement.off {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.intro-prompt {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.intro-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.intro-prompt p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.intro-hint {
  color: var(--text-muted) !important;
  font-size: 0.9rem !important;
}
</style>
