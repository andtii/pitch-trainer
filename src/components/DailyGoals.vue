<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()

onMounted(() => {
  game.ensureDailyGoals()
})
</script>

<template>
  <div class="daily-goals">
    <div class="header">
      <h3 class="title">Daily Goals</h3>
      <span class="streak-badge">🔥 {{ game.currentDailyStreak }} day streak</span>
    </div>

    <ul class="goal-list">
      <li
        v-for="goal in game.dailyGoals"
        :key="goal.id"
        class="goal-item"
        :class="{ completed: goal.completed }"
      >
        <div class="goal-info">
          <span class="goal-icon">{{ goal.completed ? '✅' : goal.icon }}</span>
          <span class="goal-description">{{ goal.description }}</span>
        </div>
        <div class="goal-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }"
            />
          </div>
          <span class="progress-text">{{ goal.current }}/{{ goal.target }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.daily-goals {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.streak-badge {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.6rem;
  white-space: nowrap;
}

.goal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.goal-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.goal-icon {
  flex-shrink: 0;
  font-size: 1.1rem;
  line-height: 1;
}

.goal-description {
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-normal);
}

.goal-item.completed .goal-description {
  text-decoration: line-through;
  color: var(--text-muted);
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.progress-bar {
  width: 80px;
  height: 6px;
  background: var(--bg-input);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--accent-teal);
  transition: width var(--transition-normal);
}

.goal-item.completed .progress-fill {
  background: var(--pitch-perfect);
}

.progress-text {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 2.5rem;
  text-align: right;
}
</style>
