import type { NoteName, NoteInfo, Interval, Scale } from '@/types'

export const NOTE_NAMES: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

export const NATURAL_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

export const INTERVALS: Interval[] = [
  { name: 'Unison', shortName: 'P1', semitones: 0 },
  { name: 'Minor 2nd', shortName: 'm2', semitones: 1 },
  { name: 'Major 2nd', shortName: 'M2', semitones: 2 },
  { name: 'Minor 3rd', shortName: 'm3', semitones: 3 },
  { name: 'Major 3rd', shortName: 'M3', semitones: 4 },
  { name: 'Perfect 4th', shortName: 'P4', semitones: 5 },
  { name: 'Tritone', shortName: 'TT', semitones: 6 },
  { name: 'Perfect 5th', shortName: 'P5', semitones: 7 },
  { name: 'Minor 6th', shortName: 'm6', semitones: 8 },
  { name: 'Major 6th', shortName: 'M6', semitones: 9 },
  { name: 'Minor 7th', shortName: 'm7', semitones: 10 },
  { name: 'Major 7th', shortName: 'M7', semitones: 11 },
  { name: 'Octave', shortName: 'P8', semitones: 12 },
]

export const SCALES: Record<string, Scale> = {
  major: { name: 'Major', pattern: [0, 2, 4, 5, 7, 9, 11] },
  naturalMinor: { name: 'Natural Minor', pattern: [0, 2, 3, 5, 7, 8, 10] },
  harmonicMinor: { name: 'Harmonic Minor', pattern: [0, 2, 3, 5, 7, 8, 11] },
  melodicMinor: { name: 'Melodic Minor', pattern: [0, 2, 3, 5, 7, 9, 11] },
  pentatonicMajor: { name: 'Pentatonic Major', pattern: [0, 2, 4, 7, 9] },
  pentatonicMinor: { name: 'Pentatonic Minor', pattern: [0, 3, 5, 7, 10] },
  blues: { name: 'Blues', pattern: [0, 3, 5, 6, 7, 10] },
  dorian: { name: 'Dorian', pattern: [0, 2, 3, 5, 7, 9, 10] },
  mixolydian: { name: 'Mixolydian', pattern: [0, 2, 4, 5, 7, 9, 10] },
  chromatic: { name: 'Chromatic', pattern: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
}

const A4_MIDI = 69

/**
 * Convert MIDI note number to frequency.
 */
export function midiToFrequency(midi: number, referencePitch = 440): number {
  return referencePitch * Math.pow(2, (midi - A4_MIDI) / 12)
}

/**
 * Convert frequency to the nearest MIDI note number.
 */
export function frequencyToMidi(frequency: number, referencePitch = 440): number {
  return A4_MIDI + 12 * Math.log2(frequency / referencePitch)
}

/**
 * Get the note name and octave from a MIDI number.
 */
export function midiToNoteName(midi: number): { name: NoteName; octave: number } {
  const noteIndex = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  return { name: NOTE_NAMES[noteIndex], octave }
}

/**
 * Get NoteInfo for a given MIDI number.
 */
export function getNoteInfo(midi: number, referencePitch = 440): NoteInfo {
  const { name, octave } = midiToNoteName(midi)
  return {
    name,
    octave,
    frequency: midiToFrequency(midi, referencePitch),
    midi,
  }
}

/**
 * Get the nearest note info for a given frequency.
 */
export function frequencyToNoteInfo(frequency: number, referencePitch = 440): NoteInfo {
  const midi = Math.round(frequencyToMidi(frequency, referencePitch))
  return getNoteInfo(midi, referencePitch)
}

/**
 * Calculate cents deviation from the nearest note.
 */
export function getCentsOff(frequency: number, referencePitch = 440): number {
  const midi = frequencyToMidi(frequency, referencePitch)
  const nearestMidi = Math.round(midi)
  return (midi - nearestMidi) * 100
}

/**
 * Get MIDI number from note name and octave.
 */
export function noteNameToMidi(name: NoteName, octave: number): number {
  const index = NOTE_NAMES.indexOf(name)
  return (octave + 1) * 12 + index
}

/**
 * Get all notes in a scale for a given root and octave.
 */
export function getScaleNotes(
  root: NoteName,
  scaleKey: string,
  octave: number,
  referencePitch = 440
): NoteInfo[] {
  const scale = SCALES[scaleKey]
  if (!scale) return []

  const rootMidi = noteNameToMidi(root, octave)
  return scale.pattern.map((semitones) => getNoteInfo(rootMidi + semitones, referencePitch))
}

/**
 * Format a note for display (e.g., "C#4").
 */
export function formatNote(note: NoteInfo): string {
  return `${note.name}${note.octave}`
}

/**
 * Get a random note in the given octave range.
 */
export function getRandomNote(
  minOctave: number,
  maxOctave: number,
  chromaticOnly = true,
  referencePitch = 440
): NoteInfo {
  const minMidi = noteNameToMidi('C', minOctave)
  const maxMidi = noteNameToMidi('B', maxOctave)

  if (chromaticOnly) {
    const midi = minMidi + Math.floor(Math.random() * (maxMidi - minMidi + 1))
    return getNoteInfo(midi, referencePitch)
  }

  const naturalIndices = NATURAL_NOTES.map((n) => NOTE_NAMES.indexOf(n))
  const candidates: number[] = []
  for (let oct = minOctave; oct <= maxOctave; oct++) {
    for (const idx of naturalIndices) {
      candidates.push((oct + 1) * 12 + idx)
    }
  }
  const midi = candidates[Math.floor(Math.random() * candidates.length)]
  return getNoteInfo(midi, referencePitch)
}
