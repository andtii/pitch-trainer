import type { TrainingMode } from './index'

export interface SessionRecord {
  id: string
  mode: TrainingMode
  startedAt: string
  durationSeconds: number
  score?: {
    correct: number
    total: number
    streak: number
    bestStreak: number
  }
  stabilityScore?: number
  xpEarned: number
}

export interface DailyGoal {
  id: string
  description: string
  icon: string
  target: number
  current: number
  completed: boolean
}

export type AchievementCategory = 'getting-started' | 'milestones' | 'mastery' | 'dedication'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  category: AchievementCategory
  condition: (state: GameStats) => boolean
}

export interface UnlockedAchievement {
  unlockedAt: string
}

export interface GameStats {
  totalXp: number
  level: number
  lifetimeCorrect: number
  lifetimeTotal: number
  lifetimeBestStreak: number
  lifetimePracticeSeconds: number
  lifetimeScalesCompleted: number
  lifetimeStabilitySessions: number
  uniqueScalesCompleted: string[]
  totalSessions: number
  currentDailyStreak: number
  longestDailyStreak: number
  unlockedAchievementIds: string[]
}

export interface GameState {
  totalXp: number
  unlockedAchievements: Record<string, UnlockedAchievement>
  sessions: SessionRecord[]
  dailyGoals: DailyGoal[]
  dailyGoalsDate: string
  currentDailyStreak: number
  longestDailyStreak: number
  lastPracticeDate: string
  lifetimeCorrect: number
  lifetimeTotal: number
  lifetimeBestStreak: number
  lifetimePracticeSeconds: number
  lifetimeScalesCompleted: number
  lifetimeStabilitySessions: number
  uniqueScalesCompleted: string[]
  pendingAchievements: string[]
}

export interface XpRewardEvent {
  type: 'correct-answer' | 'streak-bonus' | 'scale-complete' | 'stability-good' | 'stability-great' | 'daily-goal' | 'achievement'
  amount: number
  streakCount?: number
}
