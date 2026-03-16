export const XP_REWARDS = {
  correctAnswer: 10,
  streakBonusPerCount: 2,
  scaleComplete: 25,
  stabilityGood: 15,
  stabilityGreat: 25,
  dailyGoalComplete: 50,
} as const

export function getLevelForXp(xp: number): number {
  if (xp <= 0) return 1
  let level = 1
  while (getXpForLevel(level + 1) <= xp) {
    level++
    if (level >= 50) break
  }
  return level
}

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(50 * Math.pow(level, 1.5))
}

export function getXpProgress(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number } {
  const level = getLevelForXp(xp)
  if (level >= 50) {
    return { level: 50, currentLevelXp: 0, nextLevelXp: 0, progress: 1 }
  }
  const currentThreshold = getXpForLevel(level)
  const nextThreshold = getXpForLevel(level + 1)
  const range = nextThreshold - currentThreshold
  const progress = range > 0 ? (xp - currentThreshold) / range : 0
  return { level, currentLevelXp: xp - currentThreshold, nextLevelXp: range, progress }
}

export function calculateStreakBonus(streakCount: number): number {
  return streakCount * XP_REWARDS.streakBonusPerCount
}
