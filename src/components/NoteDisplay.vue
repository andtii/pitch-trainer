<script setup lang="ts">
import type { NoteInfo } from '@/types'
import { formatNote } from '@/lib/musicTheory'
import { computed } from 'vue'

const props = defineProps<{
  targetNote: NoteInfo | null
  detectedNote: NoteInfo | null
  centsOff: number
  isActive: boolean
}>()

const accuracyPercent = computed(() => {
  if (!props.isActive || !props.detectedNote || !props.targetNote) return null
  const cents = Math.abs(props.centsOff)
  return Math.max(0, Math.round(100 - cents * 2))
})

const accuracyClass = computed(() => {
  if (accuracyPercent.value === null) return ''
  if (accuracyPercent.value >= 80) return 'perfect'
  if (accuracyPercent.value >= 50) return 'close'
  return 'off'
})

const centsDisplay = computed(() => {
  if (!props.isActive) return '—'
  const c = Math.round(props.centsOff)
  if (c > 0) return `+${c}¢`
  if (c < 0) return `${c}¢`
  return '0¢'
})
</script>

<template>
  <div class="note-display">
    <div class="note-section target">
      <span class="label">Target</span>
      <span class="note-name">{{ targetNote ? formatNote(targetNote) : '—' }}</span>
    </div>

    <div class="divider"></div>

    <div class="note-section detected">
      <span class="label">Detected</span>
      <span class="note-name" :class="accuracyClass">
        {{ isActive && detectedNote ? formatNote(detectedNote) : '—' }}
      </span>
    </div>

    <div class="divider"></div>

    <div class="note-section cents">
      <span class="label">Cents</span>
      <span class="cents-value" :class="accuracyClass">{{ centsDisplay }}</span>
    </div>

    <div v-if="accuracyPercent !== null" class="accuracy-badge" :class="accuracyClass">
      {{ accuracyPercent }}%
    </div>
  </div>
</template>

<style scoped>
.note-display {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.note-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.note-name {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.cents-value {
  font-size: 1.5rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.divider {
  width: 1px;
  height: 48px;
  background: var(--border);
}

.perfect {
  color: var(--pitch-perfect) !important;
}

.close {
  color: var(--pitch-close) !important;
}

.off {
  color: var(--pitch-off) !important;
}

.accuracy-badge {
  margin-left: auto;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.accuracy-badge.close {
  background: rgba(234, 179, 8, 0.1);
  border-color: rgba(234, 179, 8, 0.3);
}

.accuracy-badge.off {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

@media (max-width: 600px) {
  .note-display {
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
  .note-name { font-size: 1.25rem; }
  .cents-value { font-size: 1.1rem; }
}
</style>
