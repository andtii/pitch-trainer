import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { GameState, GameStats, SessionRecord, DailyGoal, TrainingMode } from '@/types'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { XP_REWARDS, getLevelForXp, calculateStreakBonus } from '@/lib/xpConfig'

const STORAGE_KEY = 'pitchtrainer-game'
const MAX_SESSIONS = 100

const DAILY_GOAL_POOL: Array<Omit<DailyGoal, 'current' | 'completed'>> = [
  { id: 'correct-10', description: 'Get 10 correct answers', icon: '✅', target: 10 },
  { id: 'correct-25', description: 'Get 25 correct answers', icon: '🎯', target: 25 },
  { id: 'practice-5min', description: 'Practice for 5 minutes', icon: '⏱️', target: 300 },
  { id: 'sessions-3', description: 'Complete 3 exercises', icon: '🏋️', target: 3 },
  { id: 'streak-5', description: 'Achieve a 5-streak', icon: '🔥', target: 5 },
  { id: 'stability-80', description: 'Score 80%+ stability', icon: '🪨', target: 80 },
  { id: 'scale-1', description: 'Complete a scale', icon: '🎼', target: 1 },
  { id: 'xp-100', description: 'Earn 100 XP today', icon: '⭐', target: 100 },
]

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function generateDailyGoals(): DailyGoal[] {
  const shuffled = [...DAILY_GOAL_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map(g => ({ ...g, current: 0, completed: false }))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const DEFAULT_STATE: GameState = {
  totalXp: 0,
  unlockedAchievements: {},
  sessions: [],
  dailyGoals: [],
  dailyGoalsDate: '',
  currentDailyStreak: 0,
  longestDailyStreak: 0,
  lastPracticeDate: '',
  lifetimeCorrect: 0,
  lifetimeTotal: 0,
  lifetimeBestStreak: 0,
  lifetimePracticeSeconds: 0,
  lifetimeScalesCompleted: 0,
  lifetimeStabilitySessions: 0,
  uniqueScalesCompleted: [],
  pendingAchievements: [],
}

function loadState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_STATE, ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATE }
}

export const useGameStore = defineStore('game', () => {
  const initial = loadState()

  const totalXp = ref(initial.totalXp)
  const unlockedAchievements = ref(initial.unlockedAchievements)
  const sessions = ref<SessionRecord[]>(initial.sessions)
  const dailyGoals = ref<DailyGoal[]>(initial.dailyGoals)
  const dailyGoalsDate = ref(initial.dailyGoalsDate)
  const currentDailyStreak = ref(initial.currentDailyStreak)
  const longestDailyStreak = ref(initial.longestDailyStreak)
  const lastPracticeDate = ref(initial.lastPracticeDate)
  const lifetimeCorrect = ref(initial.lifetimeCorrect)
  const lifetimeTotal = ref(initial.lifetimeTotal)
  const lifetimeBestStreak = ref(initial.lifetimeBestStreak)
  const lifetimePracticeSeconds = ref(initial.lifetimePracticeSeconds)
  const lifetimeScalesCompleted = ref(initial.lifetimeScalesCompleted)
  const lifetimeStabilitySessions = ref(initial.lifetimeStabilitySessions)
  const uniqueScalesCompleted = ref<string[]>(initial.uniqueScalesCompleted)
  const pendingAchievements = ref<string[]>(initial.pendingAchievements)

  const level = computed(() => getLevelForXp(totalXp.value))

  const stats = computed<GameStats>(() => ({
    totalXp: totalXp.value,
    level: level.value,
    lifetimeCorrect: lifetimeCorrect.value,
    lifetimeTotal: lifetimeTotal.value,
    lifetimeBestStreak: lifetimeBestStreak.value,
    lifetimePracticeSeconds: lifetimePracticeSeconds.value,
    lifetimeScalesCompleted: lifetimeScalesCompleted.value,
    lifetimeStabilitySessions: lifetimeStabilitySessions.value,
    uniqueScalesCompleted: uniqueScalesCompleted.value,
    totalSessions: sessions.value.length,
    currentDailyStreak: currentDailyStreak.value,
    longestDailyStreak: longestDailyStreak.value,
    unlockedAchievementIds: Object.keys(unlockedAchievements.value),
  }))

  // --- Persistence ---
  function save() {
    const state: GameState = {
      totalXp: totalXp.value,
      unlockedAchievements: unlockedAchievements.value,
      sessions: sessions.value,
      dailyGoals: dailyGoals.value,
      dailyGoalsDate: dailyGoalsDate.value,
      currentDailyStreak: currentDailyStreak.value,
      longestDailyStreak: longestDailyStreak.value,
      lastPracticeDate: lastPracticeDate.value,
      lifetimeCorrect: lifetimeCorrect.value,
      lifetimeTotal: lifetimeTotal.value,
      lifetimeBestStreak: lifetimeBestStreak.value,
      lifetimePracticeSeconds: lifetimePracticeSeconds.value,
      lifetimeScalesCompleted: lifetimeScalesCompleted.value,
      lifetimeStabilitySessions: lifetimeStabilitySessions.value,
      uniqueScalesCompleted: uniqueScalesCompleted.value,
      pendingAchievements: pendingAchievements.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  watch([totalXp, sessions, dailyGoals, currentDailyStreak, longestDailyStreak,
    lifetimeCorrect, lifetimeTotal, lifetimeBestStreak, lifetimePracticeSeconds,
    lifetimeScalesCompleted, lifetimeStabilitySessions, pendingAchievements], save, { deep: true })

  // --- Daily Goals ---
  function ensureDailyGoals() {
    const today = getTodayDate()
    if (dailyGoalsDate.value !== today) {
      dailyGoals.value = generateDailyGoals()
      dailyGoalsDate.value = today
    }
  }

  function updateDailyStreak() {
    const today = getTodayDate()
    if (lastPracticeDate.value === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    if (lastPracticeDate.value === yesterdayStr) {
      currentDailyStreak.value++
    } else if (lastPracticeDate.value !== today) {
      currentDailyStreak.value = 1
    }

    longestDailyStreak.value = Math.max(longestDailyStreak.value, currentDailyStreak.value)
    lastPracticeDate.value = today
  }

  function progressDailyGoal(goalId: string, amount: number) {
    ensureDailyGoals()
    const goal = dailyGoals.value.find(g => g.id === goalId)
    if (goal && !goal.completed) {
      goal.current = Math.min(goal.current + amount, goal.target)
      if (goal.current >= goal.target) {
        goal.completed = true
        awardXp(XP_REWARDS.dailyGoalComplete)
      }
    }
  }

  // --- XP ---
  let dailyXpAccumulator = 0

  function awardXp(amount: number) {
    totalXp.value += amount
    dailyXpAccumulator += amount
    progressDailyGoal('xp-100', dailyXpAccumulator)
  }

  // --- Achievements ---
  function checkAchievements() {
    const currentStats = stats.value
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedAchievements.value[achievement.id]) continue
      if (achievement.condition(currentStats)) {
        unlockedAchievements.value[achievement.id] = { unlockedAt: new Date().toISOString() }
        pendingAchievements.value.push(achievement.id)
        awardXp(achievement.xpReward)
      }
    }
  }

  function dismissAchievement(): string | undefined {
    return pendingAchievements.value.shift()
  }

  // --- Session Recording ---
  function recordCorrectAnswer(streakCount: number) {
    lifetimeCorrect.value++
    lifetimeTotal.value++
    if (streakCount > lifetimeBestStreak.value) {
      lifetimeBestStreak.value = streakCount
    }

    const xp = XP_REWARDS.correctAnswer + calculateStreakBonus(streakCount)
    awardXp(xp)

    updateDailyStreak()
    progressDailyGoal('correct-10', 1)
    progressDailyGoal('correct-25', 1)
    progressDailyGoal('streak-5', streakCount >= 5 ? 1 : 0)
    checkAchievements()

    return xp
  }

  function recordWrongAnswer() {
    lifetimeTotal.value++
    updateDailyStreak()
  }

  function recordScaleComplete(scaleName: string) {
    lifetimeScalesCompleted.value++
    if (!uniqueScalesCompleted.value.includes(scaleName)) {
      uniqueScalesCompleted.value.push(scaleName)
    }

    awardXp(XP_REWARDS.scaleComplete)
    updateDailyStreak()
    progressDailyGoal('scale-1', 1)
    checkAchievements()

    return XP_REWARDS.scaleComplete
  }

  function recordStabilitySession(score: number) {
    let xp = 0
    if (score >= 90) {
      lifetimeStabilitySessions.value++
      xp = XP_REWARDS.stabilityGreat
    } else if (score >= 80) {
      xp = XP_REWARDS.stabilityGood
    }

    if (xp > 0) awardXp(xp)
    updateDailyStreak()
    progressDailyGoal('stability-80', score >= 80 ? 1 : 0)
    checkAchievements()

    return xp
  }

  function recordPracticeTime(seconds: number) {
    lifetimePracticeSeconds.value += seconds
    progressDailyGoal('practice-5min', seconds)
  }

  function saveSession(mode: TrainingMode, durationSeconds: number, score?: SessionRecord['score'], stabilityScore?: number, xpEarned: number = 0) {
    const session: SessionRecord = {
      id: generateId(),
      mode,
      startedAt: new Date().toISOString(),
      durationSeconds,
      score,
      stabilityScore,
      xpEarned,
    }
    sessions.value.unshift(session)
    if (sessions.value.length > MAX_SESSIONS) {
      sessions.value = sessions.value.slice(0, MAX_SESSIONS)
    }

    updateDailyStreak()
    progressDailyGoal('sessions-3', 1)
    checkAchievements()
  }

  // Initialize daily goals on store creation
  ensureDailyGoals()

  return {
    // State
    totalXp,
    level,
    unlockedAchievements,
    sessions,
    dailyGoals,
    dailyGoalsDate,
    currentDailyStreak,
    longestDailyStreak,
    lastPracticeDate,
    lifetimeCorrect,
    lifetimeTotal,
    lifetimeBestStreak,
    lifetimePracticeSeconds,
    lifetimeScalesCompleted,
    lifetimeStabilitySessions,
    uniqueScalesCompleted,
    pendingAchievements,
    stats,

    // Actions
    awardXp,
    recordCorrectAnswer,
    recordWrongAnswer,
    recordScaleComplete,
    recordStabilitySession,
    recordPracticeTime,
    saveSession,
    checkAchievements,
    dismissAchievement,
    ensureDailyGoals,
    progressDailyGoal,
  }
})
