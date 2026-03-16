import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Difficulty, Settings } from '@/types'

const STORAGE_KEY = 'pitchtrainer-settings'

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {
    referencePitch: 440,
    minOctave: 3,
    maxOctave: 5,
    difficulty: 'medium',
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const defaults = loadSettings()

  const referencePitch = ref(defaults.referencePitch)
  const minOctave = ref(defaults.minOctave)
  const maxOctave = ref(defaults.maxOctave)
  const difficulty = ref<Difficulty>(defaults.difficulty)

  function save() {
    const settings: Settings = {
      referencePitch: referencePitch.value,
      minOctave: minOctave.value,
      maxOctave: maxOctave.value,
      difficulty: difficulty.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }

  watch([referencePitch, minOctave, maxOctave, difficulty], save)

  function reset() {
    referencePitch.value = 440
    minOctave.value = 3
    maxOctave.value = 5
    difficulty.value = 'medium'
  }

  return {
    referencePitch,
    minOctave,
    maxOctave,
    difficulty,
    reset,
  }
})
