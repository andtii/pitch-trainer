<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToneSynth } from '@/composables/useToneSynth'
import { usePitchDetection } from '@/composables/usePitchDetection'
import { useSettingsStore } from '@/stores/settings'
import {
  INTERVALS,
  getRandomNote,
  getNoteInfo,
  formatNote,
} from '@/lib/musicTheory'
import type { NoteInfo, Interval, SessionScore } from '@/types'
import PitchMeter from '@/components/PitchMeter.vue'
import NoteDisplay from '@/components/NoteDisplay.vue'

const settings = useSettingsStore()
const { playNotes, isPlaying } = useToneSynth()
const {
  isListening,
  detectedNote,
  centsOff,
  startListening,
  stopListening,
} = usePitchDetection(settings.referencePitch)

type SubMode = 'identify' | 'sing'
const subMode = ref<SubMode>('identify')
const rootNote = ref<NoteInfo | null>(null)
const targetInterval = ref<Interval | null>(null)
const targetNote = ref<NoteInfo | null>(null)
const selectedAnswer = ref<string | null>(null)
const showResult = ref(false)
const micPermission = ref<boolean | null>(null)

const score = ref<SessionScore>({
  correct: 0,
  total: 0,
  streak: 0,
  bestStreak: 0,
})

const detectedNoteName = computed(() => {
  if (!detectedNote.value) return undefined
  return formatNote(detectedNote.value)
})

// Filter out unison for more interesting training
const availableIntervals = INTERVALS.filter((i) => i.semitones >= 1 && i.semitones <= 12)

function generateQuestion() {
  showResult.value = false
  selectedAnswer.value = null

  rootNote.value = getRandomNote(
    settings.minOctave,
    Math.max(settings.minOctave, settings.maxOctave - 1),
    true,
    settings.referencePitch
  )

  const idx = Math.floor(Math.random() * availableIntervals.length)
  targetInterval.value = availableIntervals[idx]
  targetNote.value = getNoteInfo(
    rootNote.value.midi + targetInterval.value.semitones,
    settings.referencePitch
  )

  playIntervalNotes()
}

function playIntervalNotes() {
  if (!rootNote.value || !targetNote.value) return
  playNotes([rootNote.value.frequency, targetNote.value.frequency], 0.8, 0.3)
}

function selectAnswer(interval: Interval) {
  if (showResult.value) return
  selectedAnswer.value = interval.shortName
  showResult.value = true
  score.value.total++

  if (interval.semitones === targetInterval.value?.semitones) {
    score.value.correct++
    score.value.streak++
    score.value.bestStreak = Math.max(score.value.bestStreak, score.value.streak)
  } else {
    score.value.streak = 0
  }
}

const isCorrectAnswer = computed(() => {
  if (!selectedAnswer.value || !targetInterval.value) return false
  return selectedAnswer.value === targetInterval.value.shortName
})

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
</script>

<template>
  <div class="interval-view container">
    <h1>🎵 Interval Training</h1>

    <div class="mode-tabs">
      <button
        class="tab"
        :class="{ active: subMode === 'identify' }"
        @click="subMode = 'identify'"
      >
        👂 Identify
      </button>
      <button
        class="tab"
        :class="{ active: subMode === 'sing' }"
        @click="subMode = 'sing'"
      >
        🎤 Sing
      </button>
    </div>

    <div class="score-bar">
      <span>Score: {{ score.correct }}/{{ score.total }}</span>
      <span>Streak: {{ score.streak }} 🔥</span>
      <span>Best: {{ score.bestStreak }}</span>
    </div>

    <div class="controls">
      <button class="btn btn-primary" @click="generateQuestion">
        {{ rootNote ? '⏭ Next' : '▶ Start' }}
      </button>
      <button
        v-if="rootNote"
        class="btn btn-secondary"
        :disabled="isPlaying"
        @click="playIntervalNotes"
      >
        🔊 Replay
      </button>
      <button
        v-if="subMode === 'sing'"
        class="btn"
        :class="isListening ? 'btn-active' : 'btn-secondary'"
        @click="toggleMic"
      >
        {{ isListening ? '⏹ Stop' : '🎤 Mic' }}
      </button>
    </div>

    <!-- Identify mode -->
    <template v-if="subMode === 'identify' && rootNote">
      <p class="prompt">What interval did you hear?</p>
      <div class="interval-grid">
        <button
          v-for="interval in availableIntervals"
          :key="interval.shortName"
          class="interval-btn"
          :class="{
            correct: showResult && interval.semitones === targetInterval?.semitones,
            wrong: showResult && selectedAnswer === interval.shortName && !isCorrectAnswer,
            selected: selectedAnswer === interval.shortName,
          }"
          @click="selectAnswer(interval)"
        >
          <span class="interval-short">{{ interval.shortName }}</span>
          <span class="interval-name">{{ interval.name }}</span>
        </button>
      </div>

      <div v-if="showResult" class="result" :class="isCorrectAnswer ? 'correct' : 'wrong'">
        <template v-if="isCorrectAnswer">✅ Correct!</template>
        <template v-else>
          ❌ The answer was <strong>{{ targetInterval?.name }}</strong>
        </template>
      </div>
    </template>

    <!-- Sing mode -->
    <template v-if="subMode === 'sing' && rootNote && targetNote">
      <div class="sing-prompt">
        <p>
          Root: <strong>{{ formatNote(rootNote) }}</strong> →
          Sing the <strong>{{ targetInterval?.name }}</strong>
          ({{ formatNote(targetNote) }})
        </p>
      </div>

      <NoteDisplay
        :target-note="targetNote"
        :detected-note="detectedNote"
        :cents-off="centsOff"
        :is-active="isListening"
      />

      <div class="meter-area">
        <PitchMeter
          :cents-off="centsOff"
          :is-active="isListening && detectedNote !== null"
          :note-name="detectedNoteName"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.interval-view {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.interval-view h1 {
  margin-bottom: 1rem;
}

.mode-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--bg-input);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.tab.active {
  background: var(--accent-purple);
  color: white;
  border-color: var(--accent-purple);
}

.score-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-family: var(--font-mono);
}

.controls {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-active {
  background: var(--pitch-off);
  color: white;
}

.prompt {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.interval-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.interval-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.interval-btn:hover {
  border-color: var(--accent-purple);
}

.interval-btn.correct {
  border-color: var(--pitch-perfect);
  background: rgba(34, 197, 94, 0.15);
}

.interval-btn.wrong {
  border-color: var(--pitch-off);
  background: rgba(239, 68, 68, 0.15);
}

.interval-short {
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: 1.1rem;
}

.interval-name {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.result {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.result.correct {
  color: var(--pitch-perfect);
  background: rgba(34, 197, 94, 0.1);
}

.result.wrong {
  color: var(--pitch-off);
  background: rgba(239, 68, 68, 0.1);
}

.sing-prompt {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.sing-prompt strong {
  color: var(--accent-teal);
}

.meter-area {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>
