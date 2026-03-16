<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToneSynth } from '@/composables/useToneSynth'
import { usePitchDetection } from '@/composables/usePitchDetection'
import { useSettingsStore } from '@/stores/settings'
import { getScaleNotes, formatNote } from '@/lib/musicTheory'
import type { NoteInfo, NoteName } from '@/types'
import PitchMeter from '@/components/PitchMeter.vue'
import PitchGraph from '@/components/PitchGraph.vue'
import NoteDisplay from '@/components/NoteDisplay.vue'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import ScaleSelector from '@/components/ScaleSelector.vue'

const settings = useSettingsStore()
const { play, isPlaying } = useToneSynth()
const {
  isListening,
  detectedNote,
  detectedFrequency,
  centsOff,
  startListening,
  stopListening,
} = usePitchDetection(settings.referencePitch)

const rootNote = ref<NoteName>('C')
const scaleKey = ref('major')
const currentStep = ref(0)
const isStarted = ref(false)
const direction = ref<'ascending' | 'descending' | 'both'>('ascending')

const scaleNotes = computed(() => {
  const notes = getScaleNotes(rootNote.value, scaleKey.value, 4, settings.referencePitch)
  if (direction.value === 'descending') {
    return [...notes].reverse()
  } else if (direction.value === 'both') {
    const ascending = [...notes]
    const descending = [...notes].reverse().slice(1)
    return [...ascending, ...descending]
  }
  return notes
})

const currentTargetNote = computed<NoteInfo | null>(() => {
  if (!isStarted.value || currentStep.value >= scaleNotes.value.length) return null
  return scaleNotes.value[currentStep.value]
})

const progressPercent = computed(() => {
  if (scaleNotes.value.length === 0) return 0
  return Math.round((currentStep.value / scaleNotes.value.length) * 100)
})

const isComplete = computed(() => {
  return isStarted.value && currentStep.value >= scaleNotes.value.length
})

const detectedNoteName = computed(() => {
  if (!detectedNote.value) return undefined
  return formatNote(detectedNote.value)
})

function startScale() {
  currentStep.value = 0
  isStarted.value = true
  playCurrentNote()
}

function playCurrentNote() {
  if (currentTargetNote.value) {
    play(currentTargetNote.value.frequency, 1.0)
  }
}

function nextNote() {
  if (currentStep.value < scaleNotes.value.length - 1) {
    currentStep.value++
    playCurrentNote()
  } else {
    currentStep.value = scaleNotes.value.length
  }
}

function reset() {
  currentStep.value = 0
  isStarted.value = false
}

async function toggleMic() {
  if (isListening.value) {
    stopListening()
  } else {
    try {
      await startListening()
    } catch {
      // Mic denied
    }
  }
}

// Auto-advance when pitch is close enough for 1 second
let holdTimer: ReturnType<typeof setTimeout> | null = null
watch([centsOff, detectedNote, currentTargetNote], () => {
  if (!isListening.value || !detectedNote.value || !currentTargetNote.value) {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
    return
  }

  const onTarget = detectedNote.value.midi === currentTargetNote.value.midi && Math.abs(centsOff.value) < settings.greenZoneCents

  if (onTarget && !holdTimer) {
    holdTimer = setTimeout(() => {
      nextNote()
      holdTimer = null
    }, settings.holdTimeMs)
  } else if (!onTarget && holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
})
</script>

<template>
  <div class="scale-view container">
    <h1>🎹 Scale Training</h1>
    <p class="description">Practice singing scales note by note with real-time feedback.</p>

    <div class="config-row">
      <ScaleSelector
        :model-root="rootNote"
        :model-scale="scaleKey"
        @update:model-root="rootNote = $event"
        @update:model-scale="scaleKey = $event"
      />
      <div class="direction-selector">
        <label class="selector-label">Direction</label>
        <select class="selector-input" v-model="direction">
          <option value="ascending">Ascending ↑</option>
          <option value="descending">Descending ↓</option>
          <option value="both">Both ↕</option>
        </select>
      </div>
    </div>

    <div class="controls">
      <button class="btn btn-primary" @click="isStarted ? reset() : startScale()">
        {{ isStarted ? '↺ Reset' : '▶ Start' }}
      </button>
      <button
        v-if="isStarted && !isComplete"
        class="btn btn-secondary"
        :disabled="isPlaying"
        @click="playCurrentNote"
      >
        🔊 Replay
      </button>
      <button
        v-if="isStarted && !isComplete"
        class="btn btn-secondary"
        @click="nextNote"
      >
        ⏭ Skip
      </button>
      <button
        class="btn"
        :class="isListening ? 'btn-active' : 'btn-secondary'"
        @click="toggleMic"
      >
        {{ isListening ? '⏹ Stop Mic' : '🎤 Start Mic' }}
      </button>
    </div>

    <!-- Progress -->
    <div v-if="isStarted" class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="scale-steps">
        <span
          v-for="(note, idx) in scaleNotes"
          :key="idx"
          class="step"
          :class="{
            active: idx === currentStep,
            done: idx < currentStep,
          }"
        >
          {{ formatNote(note) }}
        </span>
      </div>
    </div>

    <!-- Complete message -->
    <div v-if="isComplete" class="complete-banner">
      🎉 Scale complete! Great job!
    </div>

    <!-- Feedback -->
    <div v-if="isStarted && !isComplete" class="feedback-area">
      <NoteDisplay
        :target-note="currentTargetNote"
        :detected-note="detectedNote"
        :cents-off="centsOff"
        :is-active="isListening"
      />

      <div class="visualizations">
        <PitchMeter
          :cents-off="centsOff"
          :is-active="isListening && detectedNote !== null"
          :note-name="detectedNoteName"
        />
        <PitchGraph
          :target-note="currentTargetNote"
          :detected-frequency="detectedFrequency"
          :is-active="isListening"
          :reference-pitch="settings.referencePitch"
        />
      </div>
    </div>

    <PianoKeyboard
      :active-note="currentTargetNote"
      :highlight-notes="scaleNotes"
      :reference-pitch="settings.referencePitch"
    />
  </div>
</template>

<style scoped>
.scale-view {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.scale-view h1 { margin-bottom: 0.5rem; }
.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.config-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.direction-selector {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selector-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.selector-input {
  padding: 0.5rem 0.75rem;
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: var(--font-sans);
  cursor: pointer;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn-active {
  background: var(--pitch-off);
  color: white;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 6px;
  background: var(--bg-input);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-teal), var(--accent-purple));
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.scale-steps {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.step {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.step.active {
  background: var(--accent-teal);
  color: var(--bg-primary);
  font-weight: 700;
}

.step.done {
  background: rgba(34, 197, 94, 0.2);
  color: var(--pitch-perfect);
}

.complete-banner {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--pitch-perfect);
  margin: 2rem 0;
}

.feedback-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.visualizations {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
</style>
