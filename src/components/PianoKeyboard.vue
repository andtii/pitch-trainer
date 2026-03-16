<script setup lang="ts">
import { computed } from 'vue'
import { NOTE_NAMES, noteNameToMidi, midiToFrequency } from '@/lib/musicTheory'
import type { NoteName, NoteInfo } from '@/types'

const props = withDefaults(defineProps<{
  startOctave?: number
  octaves?: number
  activeNote?: NoteInfo | null
  highlightNotes?: NoteInfo[]
  referencePitch?: number
}>(), {
  startOctave: 3,
  octaves: 2,
  activeNote: null,
  highlightNotes: () => [],
  referencePitch: 440,
})

const emit = defineEmits<{
  (e: 'note-click', note: NoteInfo): void
}>()

const isBlack = (name: NoteName) => name.includes('#')

interface KeyData {
  note: NoteName
  octave: number
  midi: number
  isBlack: boolean
  isActive: boolean
  isHighlighted: boolean
}

const keys = computed<KeyData[]>(() => {
  const result: KeyData[] = []
  for (let oct = props.startOctave; oct < props.startOctave + props.octaves; oct++) {
    for (const name of NOTE_NAMES) {
      const midi = noteNameToMidi(name, oct)
      result.push({
        note: name,
        octave: oct,
        midi,
        isBlack: isBlack(name),
        isActive: props.activeNote?.midi === midi,
        isHighlighted: props.highlightNotes.some((n) => n.midi === midi),
      })
    }
  }
  // Add final C
  const finalOct = props.startOctave + props.octaves
  const finalMidi = noteNameToMidi('C', finalOct)
  result.push({
    note: 'C',
    octave: finalOct,
    midi: finalMidi,
    isBlack: false,
    isActive: props.activeNote?.midi === finalMidi,
    isHighlighted: props.highlightNotes.some((n) => n.midi === finalMidi),
  })
  return result
})

const whiteKeys = computed(() => keys.value.filter((k) => !k.isBlack))
const blackKeys = computed(() => keys.value.filter((k) => k.isBlack))

function onKeyClick(key: KeyData) {
  const freq = midiToFrequency(key.midi, props.referencePitch)
  emit('note-click', {
    name: key.note,
    octave: key.octave,
    frequency: freq,
    midi: key.midi,
  })
}

function getBlackKeyOffset(key: KeyData): string {
  const whiteIndex = whiteKeys.value.findIndex((w) => {
    const wMidi = w.midi
    return key.midi === wMidi + 1 || (key.note === 'A#' && w.note === 'A' && w.octave === key.octave)
  })
  if (whiteIndex === -1) return '0'
  const whiteWidth = 100 / whiteKeys.value.length
  return `calc(${(whiteIndex + 1) * whiteWidth}% - ${whiteWidth * 0.3}px)`
}
</script>

<template>
  <div class="piano-keyboard" :style="{ '--white-count': whiteKeys.length }">
    <div class="white-keys">
      <button
        v-for="key in whiteKeys"
        :key="key.midi"
        class="key white-key"
        :class="{ active: key.isActive, highlighted: key.isHighlighted }"
        @click="onKeyClick(key)"
      >
        <span class="key-label">{{ key.note }}{{ key.octave }}</span>
      </button>
    </div>
    <div class="black-keys">
      <button
        v-for="key in blackKeys"
        :key="key.midi"
        class="key black-key"
        :class="{ active: key.isActive, highlighted: key.isHighlighted }"
        :style="{ left: getBlackKeyOffset(key) }"
        @click="onKeyClick(key)"
      />
    </div>
  </div>
</template>

<style scoped>
.piano-keyboard {
  position: relative;
  height: 120px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  user-select: none;
}

.white-keys {
  display: flex;
  height: 100%;
  gap: 2px;
}

.black-keys {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  pointer-events: none;
}

.key {
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.white-key {
  flex: 1;
  background: linear-gradient(to bottom, #e8e8f0, #d0d0dd);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
}

.white-key:hover {
  background: linear-gradient(to bottom, #f0f0f8, #e0e0ee);
}

.white-key:active,
.white-key.active {
  background: var(--accent-teal);
  border-color: var(--accent-teal);
}

.white-key.highlighted {
  background: linear-gradient(to bottom, rgba(0, 229, 204, 0.3), rgba(0, 229, 204, 0.15));
}

.key-label {
  font-size: 0.6rem;
  color: var(--text-muted);
  font-weight: 500;
}

.white-key.active .key-label {
  color: var(--bg-primary);
}

.black-key {
  position: absolute;
  width: calc(100% / var(--white-count) * 0.6);
  height: 100%;
  background: linear-gradient(to bottom, #2a2a44, #1a1a2e);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  z-index: 2;
}

.black-key:hover {
  background: linear-gradient(to bottom, #3a3a55, #2a2a44);
}

.black-key:active,
.black-key.active {
  background: var(--accent-purple);
}

.black-key.highlighted {
  background: linear-gradient(to bottom, rgba(168, 85, 247, 0.5), rgba(168, 85, 247, 0.3));
}
</style>
