<script setup lang="ts">
import { ref, computed } from 'vue'
import { NOTE_NAMES, SCALES } from '@/lib/musicTheory'
import type { NoteName } from '@/types'

const props = withDefaults(defineProps<{
  modelRoot?: NoteName
  modelScale?: string
}>(), {
  modelRoot: 'C',
  modelScale: 'major',
})

const emit = defineEmits<{
  (e: 'update:modelRoot', value: NoteName): void
  (e: 'update:modelScale', value: string): void
}>()

const root = ref<NoteName>(props.modelRoot)
const scaleKey = ref(props.modelScale)

const scaleOptions = computed(() =>
  Object.entries(SCALES).map(([key, scale]) => ({
    key,
    name: scale.name,
  }))
)

function onRootChange(event: Event) {
  const val = (event.target as HTMLSelectElement).value as NoteName
  root.value = val
  emit('update:modelRoot', val)
}

function onScaleChange(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  scaleKey.value = val
  emit('update:modelScale', val)
}
</script>

<template>
  <div class="scale-selector">
    <div class="selector-group">
      <label class="selector-label">Root</label>
      <select class="selector-input" :value="root" @change="onRootChange">
        <option v-for="note in NOTE_NAMES" :key="note" :value="note">{{ note }}</option>
      </select>
    </div>
    <div class="selector-group">
      <label class="selector-label">Scale</label>
      <select class="selector-input" :value="scaleKey" @change="onScaleChange">
        <option v-for="opt in scaleOptions" :key="opt.key" :value="opt.key">
          {{ opt.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.scale-selector {
  display: flex;
  gap: 1rem;
}

.selector-group {
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
  transition: border-color var(--transition-fast);
}

.selector-input:hover {
  border-color: var(--border-hover);
}

.selector-input:focus {
  border-color: var(--accent-teal);
  outline: none;
}

.selector-input option {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
</style>
