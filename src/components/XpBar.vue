<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { getXpProgress } from '@/lib/xpConfig'

defineProps<{
  compact?: boolean
}>()

const game = useGameStore()
const progress = computed(() => getXpProgress(game.totalXp))

const barWidthPercent = computed(() =>
  `${Math.min(progress.value.progress * 100, 100)}%`
)
</script>

<template>
  <div class="xp-bar" :class="{ compact }">
    <div class="level-badge" :aria-label="`Level ${progress.level}`">
      {{ progress.level }}
    </div>

    <div class="bar-track" role="progressbar"
      :aria-valuenow="progress.currentLevelXp"
      :aria-valuemin="0"
      :aria-valuemax="progress.nextLevelXp"
    >
      <div class="bar-fill" :style="{ width: barWidthPercent }" />
    </div>

    <span class="xp-text">
      {{ progress.currentLevelXp }}&nbsp;/&nbsp;{{ progress.nextLevelXp }}&nbsp;XP
    </span>
  </div>
</template>

<style scoped>
.xp-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-card, #16162a);
  border-radius: var(--radius-md, 10px);
  user-select: none;
}

/* ── Level badge ── */
.level-badge {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-teal, #00e5cc), var(--accent-purple, #a855f7));
  color: var(--bg-card, #16162a);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

/* ── Progress track ── */
.bar-track {
  flex: 1;
  height: 12px;
  background: var(--bg-input, #1e1e36);
  border-radius: var(--radius-sm, 6px);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  min-width: 0;
  border-radius: var(--radius-sm, 6px);
  background: linear-gradient(90deg, var(--accent-teal, #00e5cc), var(--accent-purple, #a855f7));
  transition: width 400ms ease;
}

/* ── XP text ── */
.xp-text {
  flex-shrink: 0;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  color: var(--text-secondary, #9ca3b4);
  white-space: nowrap;
}

/* ── Compact variant ── */
.xp-bar.compact {
  gap: 8px;
  padding: 6px 10px;
}

.compact .level-badge {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.compact .bar-track {
  height: 8px;
}

.compact .xp-text {
  font-size: 11px;
}
</style>
