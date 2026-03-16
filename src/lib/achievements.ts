import type { AchievementDefinition, GameStats } from '@/types'

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Getting Started
  {
    id: 'first-note',
    name: 'First Note',
    description: 'Complete your first exercise',
    icon: '🎵',
    xpReward: 25,
    category: 'getting-started',
    condition: (s: GameStats) => s.totalSessions >= 1,
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Get a 5-streak in any quiz',
    icon: '🔥',
    xpReward: 50,
    category: 'getting-started',
    condition: (s: GameStats) => s.lifetimeBestStreak >= 5,
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Get 10 correct answers in a row',
    icon: '🎯',
    xpReward: 75,
    category: 'getting-started',
    condition: (s: GameStats) => s.lifetimeBestStreak >= 10,
  },
  {
    id: 'warming-up',
    name: 'Warming Up',
    description: 'Complete 5 training sessions',
    icon: '🏃',
    xpReward: 50,
    category: 'getting-started',
    condition: (s: GameStats) => s.totalSessions >= 5,
  },

  // Milestones
  {
    id: 'century',
    name: 'Century',
    description: 'Answer 100 questions correctly',
    icon: '💯',
    xpReward: 100,
    category: 'milestones',
    condition: (s: GameStats) => s.lifetimeCorrect >= 100,
  },
  {
    id: 'mountaineer',
    name: 'Mountaineer',
    description: 'Reach Level 10',
    icon: '🏔️',
    xpReward: 150,
    category: 'milestones',
    condition: (s: GameStats) => s.level >= 10,
  },
  {
    id: 'thousand-stars',
    name: 'Thousand Stars',
    description: 'Earn 1,000 total XP',
    icon: '⭐',
    xpReward: 100,
    category: 'milestones',
    condition: (s: GameStats) => s.totalXp >= 1000,
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Practice for a total of 60 minutes',
    icon: '⏱️',
    xpReward: 100,
    category: 'milestones',
    condition: (s: GameStats) => s.lifetimePracticeSeconds >= 3600,
  },

  // Mastery
  {
    id: 'rock-solid',
    name: 'Rock Solid',
    description: 'Score 90%+ in stability training',
    icon: '🪨',
    xpReward: 75,
    category: 'mastery',
    condition: (s: GameStats) => s.lifetimeStabilitySessions >= 1,
  },
  {
    id: 'scale-master',
    name: 'Scale Master',
    description: 'Complete 10 different scales',
    icon: '🎼',
    xpReward: 100,
    category: 'mastery',
    condition: (s: GameStats) => s.uniqueScalesCompleted.length >= 10,
  },
  {
    id: 'perfect-ear',
    name: 'Perfect Ear',
    description: 'Get 20 correct in a row in ear training',
    icon: '👂',
    xpReward: 150,
    category: 'mastery',
    condition: (s: GameStats) => s.lifetimeBestStreak >= 20,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Achieve a 30-answer streak',
    icon: '💪',
    xpReward: 200,
    category: 'mastery',
    condition: (s: GameStats) => s.lifetimeBestStreak >= 30,
  },

  // Dedication
  {
    id: 'daily-devotion',
    name: 'Daily Devotion',
    description: 'Practice 7 days in a row',
    icon: '📅',
    xpReward: 150,
    category: 'dedication',
    condition: (s: GameStats) => s.currentDailyStreak >= 7,
  },
  {
    id: 'two-week-warrior',
    name: 'Two-Week Warrior',
    description: 'Practice 14 days in a row',
    icon: '⚔️',
    xpReward: 250,
    category: 'dedication',
    condition: (s: GameStats) => s.currentDailyStreak >= 14,
  },
  {
    id: 'dedicated-student',
    name: 'Dedicated Student',
    description: 'Complete 50 training sessions',
    icon: '📚',
    xpReward: 200,
    category: 'dedication',
    condition: (s: GameStats) => s.totalSessions >= 50,
  },
  {
    id: 'answer-machine',
    name: 'Answer Machine',
    description: 'Answer 500 questions total',
    icon: '🤖',
    xpReward: 200,
    category: 'dedication',
    condition: (s: GameStats) => s.lifetimeTotal >= 500,
  },
]

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function getAchievementsByCategory(category: AchievementDefinition['category']): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}
