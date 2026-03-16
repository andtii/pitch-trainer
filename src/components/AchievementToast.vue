<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { getAchievementById } from '@/lib/achievements'
import type { AchievementDefinition } from '@/types'

const game = useGameStore()

const currentAchievement = ref<AchievementDefinition | null>(null)
const visible = ref(false)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function showNext() {
  if (visible.value || game.pendingAchievements.length === 0) return

  const id = game.pendingAchievements[0]
  const achievement = getAchievementById(id)

  if (!achievement) {
    game.dismissAchievement()
    showNext()
    return
  }

  currentAchievement.value = achievement
  visible.value = true

  dismissTimer = setTimeout(() => {
    dismiss()
  }, 4000)
}

function dismiss() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
  visible.value = false
}

function onAfterLeave() {
  game.dismissAchievement()
  currentAchievement.value = null
  showNext()
}

watch(
  () => game.pendingAchievements.length,
  () => showNext(),
  { immediate: true },
)
</script>

<template>
  <Transition name="toast" @after-leave="onAfterLeave">
    <div v-if="visible && currentAchievement" class="toast-wrapper">
      <div class="toast" @click="dismiss">
        <div class="toast-header">🏆 Achievement Unlocked!</div>
        <div class="toast-body">
          <span class="toast-icon">{{ currentAchievement.icon }}</span>
          <div class="toast-info">
            <div class="toast-name">
              {{ currentAchievement.name }}
              <span class="xp-badge">+{{ currentAchievement.xpReward }} XP</span>
            </div>
            <div class="toast-description">{{ currentAchievement.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid var(--accent-teal);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow), 0 0 24px rgba(0, 229, 204, 0.15);
  padding: 1rem 1.25rem;
  min-width: 300px;
  max-width: 420px;
}

.toast-header {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-teal);
  letter-spacing: 0.03em;
  margin-bottom: 0.625rem;
}

.toast-body {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.toast-info {
  min-width: 0;
}

.toast-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
}

.xp-badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-purple);
  background: rgba(168, 85, 247, 0.12);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.toast-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
  line-height: 1.4;
}

/* Transition: slide down + fade in / slide up + fade out */
.toast-enter-active {
  transition:
    transform var(--transition-normal),
    opacity var(--transition-normal);
}

.toast-leave-active {
  transition:
    transform var(--transition-normal),
    opacity var(--transition-normal);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-1.5rem);
}

.toast-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-1.5rem);
}
</style>
