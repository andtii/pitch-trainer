import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Difficulty, ExperienceLevel, Settings } from '@/types'

const STORAGE_KEY = 'pitchtrainer-settings'

const PRESETS: Record<ExperienceLevel, Pick<Settings, 'greenZoneCents' | 'yellowZoneCents' | 'holdTimeMs' | 'difficulty' | 'minOctave' | 'maxOctave'>> = {
  beginner: { greenZoneCents: 25, yellowZoneCents: 45, holdTimeMs: 600, difficulty: 'easy', minOctave: 3, maxOctave: 4 },
  intermediate: { greenZoneCents: 10, yellowZoneCents: 25, holdTimeMs: 1000, difficulty: 'medium', minOctave: 3, maxOctave: 5 },
  advanced: { greenZoneCents: 5, yellowZoneCents: 15, holdTimeMs: 1500, difficulty: 'hard', minOctave: 2, maxOctave: 6 },
}

const DEFAULT_SETTINGS: Settings = {
  referencePitch: 440,
  minOctave: 3,
  maxOctave: 5,
  difficulty: 'medium',
  experienceLevel: 'intermediate',
  hasCompletedOnboarding: false,
  greenZoneCents: 10,
  yellowZoneCents: 25,
  holdTimeMs: 1000,
}

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch {}
  return { ...DEFAULT_SETTINGS }
}

export const useSettingsStore = defineStore('settings', () => {
  const defaults = loadSettings()

  const referencePitch = ref(defaults.referencePitch)
  const minOctave = ref(defaults.minOctave)
  const maxOctave = ref(defaults.maxOctave)
  const difficulty = ref<Difficulty>(defaults.difficulty)
  const experienceLevel = ref<ExperienceLevel>(defaults.experienceLevel)
  const hasCompletedOnboarding = ref(defaults.hasCompletedOnboarding)
  const greenZoneCents = ref(defaults.greenZoneCents)
  const yellowZoneCents = ref(defaults.yellowZoneCents)
  const holdTimeMs = ref(defaults.holdTimeMs)

  function save() {
    const settings: Settings = {
      referencePitch: referencePitch.value,
      minOctave: minOctave.value,
      maxOctave: maxOctave.value,
      difficulty: difficulty.value,
      experienceLevel: experienceLevel.value,
      hasCompletedOnboarding: hasCompletedOnboarding.value,
      greenZoneCents: greenZoneCents.value,
      yellowZoneCents: yellowZoneCents.value,
      holdTimeMs: holdTimeMs.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }

  watch([referencePitch, minOctave, maxOctave, difficulty, experienceLevel, hasCompletedOnboarding, greenZoneCents, yellowZoneCents, holdTimeMs], save)

  function applyPreset(level: ExperienceLevel) {
    const preset = PRESETS[level]
    experienceLevel.value = level
    greenZoneCents.value = preset.greenZoneCents
    yellowZoneCents.value = preset.yellowZoneCents
    holdTimeMs.value = preset.holdTimeMs
    difficulty.value = preset.difficulty
    minOctave.value = preset.minOctave
    maxOctave.value = preset.maxOctave
  }

  function reset() {
    referencePitch.value = DEFAULT_SETTINGS.referencePitch
    applyPreset('intermediate')
  }

  return {
    referencePitch,
    minOctave,
    maxOctave,
    difficulty,
    experienceLevel,
    hasCompletedOnboarding,
    greenZoneCents,
    yellowZoneCents,
    holdTimeMs,
    applyPreset,
    reset,
  }
})
