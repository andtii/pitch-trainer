<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToneSynth } from '@/composables/useToneSynth'
import { useSettingsStore } from '@/stores/settings'
import {
  getRandomNote,
  formatNote,
  NOTE_NAMES,
  NATURAL_NOTES,
} from '@/lib/musicTheory'
import type { NoteInfo, Difficulty, SessionScore, NoteName } from '@/types'

const settings = useSettingsStore()
const { play, isPlaying } = useToneSynth()

const difficulty = ref<Difficulty>(settings.difficulty)
const currentNote = ref<NoteInfo | null>(null)
const choices = ref<string[]>([])
const selectedAnswer = ref<string | null>(null)
const showResult = ref(false)
const freeformInput = ref('')

const score = ref<SessionScore>({
  correct: 0,
  total: 0,
  streak: 0,
  bestStreak: 0,
})

const isChromaticMode = computed(() => difficulty.value !== 'easy')
const isFreeInput = computed(() => difficulty.value === 'hard')

function generateChoices(correctName: NoteName): string[] {
  const pool = isChromaticMode.value ? [...NOTE_NAMES] : [...NATURAL_NOTES]
  const selected = new Set<string>([correctName])

  while (selected.size < 4 && selected.size < pool.length) {
    const rand = pool[Math.floor(Math.random() * pool.length)]
    selected.add(rand)
  }

  return [...selected].sort(() => Math.random() - 0.5)
}

function newQuestion() {
  showResult.value = false
  selectedAnswer.value = null
  freeformInput.value = ''

  currentNote.value = getRandomNote(
    settings.minOctave,
    settings.maxOctave,
    isChromaticMode.value,
    settings.referencePitch
  )

  choices.value = generateChoices(currentNote.value.name as NoteName)
  playCurrentNote()
}

function playCurrentNote() {
  if (currentNote.value) {
    play(currentNote.value.frequency, 1.2)
  }
}

function submitAnswer(answer: string) {
  if (showResult.value || !currentNote.value) return
  selectedAnswer.value = answer.toUpperCase().trim()
  showResult.value = true
  score.value.total++

  const correct = currentNote.value.name.toUpperCase()
  if (selectedAnswer.value === correct) {
    score.value.correct++
    score.value.streak++
    score.value.bestStreak = Math.max(score.value.bestStreak, score.value.streak)
  } else {
    score.value.streak = 0
  }
}

function submitFreeform() {
  if (freeformInput.value.trim()) {
    submitAnswer(freeformInput.value.trim())
  }
}

const isCorrect = computed(() => {
  if (!selectedAnswer.value || !currentNote.value) return false
  return selectedAnswer.value === currentNote.value.name.toUpperCase()
})

const accuracyPercent = computed(() => {
  if (score.value.total === 0) return 0
  return Math.round((score.value.correct / score.value.total) * 100)
})
</script>

<template>
  <div class="ear-training container">
    <h1>👂 Ear Training</h1>
    <p class="description">Listen to a note and identify which one it is.</p>

    <div class="difficulty-tabs">
      <button
        v-for="d in (['easy', 'medium', 'hard'] as Difficulty[])"
        :key="d"
        class="tab"
        :class="{ active: difficulty === d }"
        @click="difficulty = d; score = { correct: 0, total: 0, streak: 0, bestStreak: 0 }"
      >
        {{ d.charAt(0).toUpperCase() + d.slice(1) }}
      </button>
    </div>

    <div class="difficulty-desc">
      <template v-if="difficulty === 'easy'">Natural notes only, 4 choices</template>
      <template v-else-if="difficulty === 'medium'">All chromatic notes, 4 choices</template>
      <template v-else>All chromatic notes, type your answer</template>
    </div>

    <div class="score-bar">
      <span>Score: {{ score.correct }}/{{ score.total }} ({{ accuracyPercent }}%)</span>
      <span>Streak: {{ score.streak }} 🔥</span>
      <span>Best: {{ score.bestStreak }}</span>
    </div>

    <div class="controls">
      <button class="btn btn-primary" @click="newQuestion">
        {{ currentNote ? '⏭ Next' : '▶ Start' }}
      </button>
      <button
        v-if="currentNote"
        class="btn btn-secondary"
        :disabled="isPlaying"
        @click="playCurrentNote"
      >
        🔊 Replay
      </button>
    </div>

    <template v-if="currentNote">
      <!-- Multiple choice -->
      <div v-if="!isFreeInput" class="choices-grid">
        <button
          v-for="choice in choices"
          :key="choice"
          class="choice-btn"
          :class="{
            correct: showResult && choice === currentNote.name,
            wrong: showResult && selectedAnswer === choice.toUpperCase() && !isCorrect,
          }"
          @click="submitAnswer(choice)"
        >
          {{ choice }}
        </button>
      </div>

      <!-- Free input -->
      <div v-else class="free-input">
        <input
          v-model="freeformInput"
          class="note-input"
          placeholder="Type note name (e.g. C#)"
          :disabled="showResult"
          @keyup.enter="submitFreeform"
        />
        <button
          class="btn btn-primary"
          :disabled="showResult || !freeformInput.trim()"
          @click="submitFreeform"
        >
          Submit
        </button>
      </div>

      <!-- Result -->
      <div v-if="showResult" class="result" :class="isCorrect ? 'correct' : 'wrong'">
        <template v-if="isCorrect">
          ✅ Correct! It was {{ formatNote(currentNote) }}
        </template>
        <template v-else>
          ❌ Wrong! It was <strong>{{ formatNote(currentNote) }}</strong>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ear-training {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.ear-training h1 { margin-bottom: 0.5rem; }

.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.difficulty-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
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
  background: var(--accent-pink);
  color: white;
  border-color: var(--accent-pink);
}

.difficulty-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
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

.choices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.choice-btn {
  padding: 1.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.choice-btn:hover {
  border-color: var(--accent-pink);
  background: var(--bg-input);
}

.choice-btn.correct {
  border-color: var(--pitch-perfect);
  background: rgba(34, 197, 94, 0.15);
  color: var(--pitch-perfect);
}

.choice-btn.wrong {
  border-color: var(--pitch-off);
  background: rgba(239, 68, 68, 0.15);
  color: var(--pitch-off);
}

.free-input {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.note-input {
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  font-family: var(--font-mono);
  background: var(--bg-input);
  color: var(--text-primary);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  text-align: center;
  width: 200px;
  transition: border-color var(--transition-fast);
}

.note-input:focus {
  border-color: var(--accent-pink);
  outline: none;
}

.result {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: var(--radius-md);
}

.result.correct {
  color: var(--pitch-perfect);
  background: rgba(34, 197, 94, 0.1);
}

.result.wrong {
  color: var(--pitch-off);
  background: rgba(239, 68, 68, 0.1);
}
</style>
