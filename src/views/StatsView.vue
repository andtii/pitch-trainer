<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { ACHIEVEMENTS, getAchievementsByCategory } from '@/lib/achievements'
import { getXpProgress } from '@/lib/xpConfig'
import XpBar from '@/components/XpBar.vue'
import AchievementBadge from '@/components/AchievementBadge.vue'
import DailyGoals from '@/components/DailyGoals.vue'
import type { AchievementCategory } from '@/types'

const game = useGameStore()

const progress = computed(() => getXpProgress(game.totalXp))

const unlockedCount = computed(() => Object.keys(game.unlockedAchievements).length)

const accuracy = computed(() => {
  if (game.lifetimeTotal === 0) return '—'
  return `${Math.round((game.lifetimeCorrect / game.lifetimeTotal) * 100)}%`
})

const practiceTime = computed(() => {
  const totalMinutes = Math.floor(game.lifetimePracticeSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
})

const recentSessions = computed(() =>
  [...game.sessions].reverse().slice(0, 15)
)

const modeIcons: Record<string, string> = {
  'free-play': '🎤',
  'interval': '🎵',
  'scale': '🎹',
  'ear-training': '👂',
  'stability': '🎯',
}

const modeLabels: Record<string, string> = {
  'free-play': 'Free Play',
  'interval': 'Intervals',
  'scale': 'Scales',
  'ear-training': 'Ear Training',
  'stability': 'Stability',
}

const categories: { key: AchievementCategory; label: string }[] = [
  { key: 'getting-started', label: 'Getting Started' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'mastery', label: 'Mastery' },
  { key: 'dedication', label: 'Dedication' },
]

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString()
}
</script>

<template>
  <div class="stats-view">
    <!-- 1. Profile Header -->
    <section class="profile-header card">
      <div class="level-circle" :aria-label="`Level ${progress.level}`">
        <span class="level-number">{{ progress.level }}</span>
      </div>
      <div class="profile-info">
        <XpBar />
        <p class="streak-text">
          <template v-if="game.currentDailyStreak > 0">
            🔥 {{ game.currentDailyStreak }} day streak
          </template>
          <template v-else>
            Start your streak!
          </template>
        </p>
      </div>
    </section>

    <!-- 2. Daily Goals -->
    <section class="card">
      <DailyGoals />
    </section>

    <!-- 3. Lifetime Stats Grid -->
    <section class="card">
      <h2 class="section-title">Lifetime Stats</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ game.sessions.length }}</span>
          <span class="stat-label">Total Sessions</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ game.lifetimeCorrect }}</span>
          <span class="stat-label">Correct Answers</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ game.lifetimeBestStreak }}</span>
          <span class="stat-label">Best Streak</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ accuracy }}</span>
          <span class="stat-label">Accuracy</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ practiceTime }}</span>
          <span class="stat-label">Practice Time</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ game.lifetimeScalesCompleted }}</span>
          <span class="stat-label">Scales Completed</span>
        </div>
      </div>
    </section>

    <!-- 4. Achievement Gallery -->
    <section class="card">
      <div class="section-header">
        <h2 class="section-title">Achievements</h2>
        <span class="section-count">{{ unlockedCount }}/{{ ACHIEVEMENTS.length }} unlocked</span>
      </div>

      <div v-for="cat in categories" :key="cat.key" class="achievement-category">
        <h3 class="category-title">{{ cat.label }}</h3>
        <div class="achievement-grid">
          <AchievementBadge
            v-for="ach in getAchievementsByCategory(cat.key)"
            :key="ach.id"
            :achievement="ach"
            :unlocked="!!game.unlockedAchievements[ach.id]"
            :unlocked-at="game.unlockedAchievements[ach.id]?.unlockedAt"
          />
        </div>
      </div>
    </section>

    <!-- 5. Recent Sessions -->
    <section class="card">
      <h2 class="section-title">Recent Sessions</h2>

      <div v-if="recentSessions.length === 0" class="empty-state">
        No sessions yet. Start training to track your progress!
      </div>

      <ul v-else class="session-list">
        <li v-for="session in recentSessions" :key="session.id" class="session-item">
          <span class="session-icon">{{ modeIcons[session.mode] ?? '🎵' }}</span>
          <span class="session-mode">{{ modeLabels[session.mode] ?? session.mode }}</span>

          <span class="session-details">
            <span v-if="session.score" class="session-score">
              {{ session.score.correct }}/{{ session.score.total }} correct
            </span>
            <span v-if="session.stabilityScore != null" class="session-stability">
              {{ Math.round(session.stabilityScore) }}%
            </span>
          </span>

          <span class="session-xp">+{{ session.xpEarned }} XP</span>
          <span class="session-time">{{ formatRelativeTime(session.startedAt) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.stats-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

/* ── Section headers ── */
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-header .section-title {
  margin: 0;
}

.section-count {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* ── 1. Profile Header ── */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.level-circle {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 3px solid var(--accent-teal);
  box-shadow: 0 0 16px rgba(0, 229, 204, 0.3), inset 0 0 12px rgba(0, 229, 204, 0.08);
  background: var(--bg-secondary);
}

.level-number {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--accent-teal);
  line-height: 1;
}

.profile-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.streak-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ── 3. Lifetime Stats Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-normal);
}

.stat-card:hover {
  border-color: var(--border-hover);
}

.stat-number {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-teal);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.3;
}

/* ── 4. Achievement Gallery ── */
.achievement-category {
  margin-bottom: 1.25rem;
}

.achievement-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 0.75rem;
}

/* ── 5. Recent Sessions ── */
.session-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition-fast);
}

.session-item:last-child {
  border-bottom: none;
}

.session-item:hover {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.session-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 2rem;
  text-align: center;
}

.session-mode {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  min-width: 90px;
}

.session-details {
  flex: 1;
  display: flex;
  gap: 0.75rem;
  min-width: 0;
}

.session-score,
.session-stability {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.session-xp {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--pitch-perfect);
  white-space: nowrap;
}

.session-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  min-width: 70px;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ── Responsive ── */
@media (max-width: 540px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .session-details {
    display: none;
  }
}
</style>
