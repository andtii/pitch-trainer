<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePitchDetection } from '@/composables/usePitchDetection'
import { useToneSynth } from '@/composables/useToneSynth'
import { useSettingsStore } from '@/stores/settings'
import { getRandomNote, formatNote } from '@/lib/musicTheory'
import type { NoteInfo } from '@/types'
import PitchMeter from '@/components/PitchMeter.vue'
import PitchGraph from '@/components/PitchGraph.vue'
import NoteDisplay from '@/components/NoteDisplay.vue'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import MicPermission from '@/components/MicPermission.vue'

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

const targetNote = ref<NoteInfo | null>(null)
const micPermission = ref<boolean | null>(null)

const detectedNoteName = computed(() => {
  if (!detectedNote.value) return undefined
  return formatNote(detectedNote.value)
})

function pickRandomNote() {
  targetNote.value = getRandomNote(
    settings.minOctave,
    settings.maxOctave,
    true,
    settings.referencePitch
  )
  playTarget()
}

function onNoteClick(note: NoteInfo) {
  targetNote.value = note
  play(note.frequency, 1.0)
}

function playTarget() {
  if (targetNote.value) {
    play(targetNote.value.frequency, 1.0)
  }
}

async function toggleMic() {
  if (isListening.value) {
    stopListening()
  } else {
    try {
      await startListening()
      micPermission.value = true
    } catch {
      micPermission.value = false
    }
  }
}

async function requestMicPermission() {
  try {
    await startListening()
    micPermission.value = true
  } catch {
    micPermission.value = false
  }
}
</script>

<template>
  <div class="free-play container">
    <h1>🎤 Free Play</h1>
    <p class="description">Pick a note or let the app choose one randomly, then sing it!</p>

    <div class="controls">
      <button class="btn btn-primary" @click="pickRandomNote">
        🎲 Random Note
      </button>
      <button
        v-if="targetNote"
        class="btn btn-secondary"
        :disabled="isPlaying"
        @click="playTarget"
      >
        🔊 Replay
      </button>
      <button
        class="btn"
        :class="isListening ? 'btn-active' : 'btn-secondary'"
        @click="toggleMic"
      >
        {{ isListening ? '⏹ Stop Mic' : '🎤 Start Mic' }}
      </button>
    </div>

    <MicPermission
      v-if="micPermission === null"
      :has-permission="micPermission"
      :is-listening="isListening"
      @request-permission="requestMicPermission"
    />

    <div v-if="micPermission" class="feedback-area">
      <NoteDisplay
        :target-note="targetNote"
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
          :target-note="targetNote"
          :detected-frequency="detectedFrequency"
          :is-active="isListening"
          :reference-pitch="settings.referencePitch"
        />
      </div>
    </div>

    <PianoKeyboard
      :active-note="targetNote"
      :reference-pitch="settings.referencePitch"
      @note-click="onNoteClick"
    />
  </div>
</template>

<style scoped>
.free-play {
  max-width: 800px;
  margin: 0 auto;
}

.free-play h1 {
  text-align: center;
  margin-bottom: 0.5rem;
}

.description {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
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

.btn-active:hover {
  background: #dc2626;
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
