<script setup lang="ts">
import type { AchievementDefinition } from '@/types'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  achievement: AchievementDefinition
  unlocked?: boolean
  unlockedAt?: string
}>(), {
  unlocked: false,
})

const formattedDate = computed(() => {
  if (!props.unlockedAt) return null
  return new Date(props.unlockedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})

const tooltipText = computed(() => {
  let text = `${props.achievement.description}\n+${props.achievement.xpReward} XP`
  if (props.unlocked && formattedDate.value) {
    text += `\nUnlocked ${formattedDate.value}`
  }
  return text
})
</script>

<template>
  <div
    class="achievement-badge"
    :class="{ unlocked, locked: !unlocked }"
    :aria-label="tooltipText"
  >
    <div class="icon-wrapper">
      <span class="icon">{{ achievement.icon }}</span>
      <span v-if="!unlocked" class="lock-overlay">?</span>
    </div>
    <span class="name">{{ achievement.name }}</span>

    <div class="tooltip">
      <p class="tooltip-desc">{{ achievement.description }}</p>
      <p class="tooltip-xp">+{{ achievement.xpReward }} XP</p>
      <p v-if="unlocked && formattedDate" class="tooltip-date">
        Unlocked {{ formattedDate }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.achievement-badge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  width: 96px;
  padding: 0.75rem 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: default;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

/* Unlocked state */
.achievement-badge.unlocked {
  box-shadow: 0 0 12px rgba(0, 229, 204, 0.15);
}

.achievement-badge.unlocked:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 229, 204, 0.3);
}

/* Locked state */
.achievement-badge.locked {
  opacity: 0.4;
  filter: grayscale(1);
}

.achievement-badge.locked:hover {
  opacity: 0.65;
  filter: grayscale(0.6);
}

/* Icon */
.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.icon {
  font-size: 2rem;
  line-height: 1;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: rgba(22, 22, 42, 0.7);
  border-radius: 50%;
}

/* Name */
.name {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--text-primary);
  text-align: center;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 100%;
}

/* Tooltip */
.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 200px;
  padding: 0.5rem 0.75rem;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-fast);
  z-index: 10;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--border);
}

.achievement-badge:hover .tooltip {
  opacity: 1;
}

.tooltip-desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.tooltip-xp {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--accent-teal);
}

.tooltip-date {
  margin: 0.25rem 0 0;
  font-size: 0.675rem;
  color: var(--text-muted);
}
</style>
