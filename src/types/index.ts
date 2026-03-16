export interface NoteInfo {
  name: string
  octave: number
  frequency: number
  midi: number
}

export interface PitchData {
  frequency: number | null
  note: NoteInfo | null
  centsOff: number
  confidence: number
}

export interface Interval {
  name: string
  shortName: string
  semitones: number
}

export interface Scale {
  name: string
  pattern: number[]
}

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type TrainingMode = 'free-play' | 'interval' | 'scale' | 'ear-training' | 'stability'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface SessionScore {
  correct: number
  total: number
  streak: number
  bestStreak: number
}

export interface Settings {
  referencePitch: number
  minOctave: number
  maxOctave: number
  difficulty: Difficulty
  experienceLevel: ExperienceLevel
  hasCompletedOnboarding: boolean
  greenZoneCents: number
  yellowZoneCents: number
  holdTimeMs: number
}

export * from './game'
