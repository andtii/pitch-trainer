import { ref } from 'vue'
import { useAudioContext } from './useAudioContext'
import { playNote, playSequence, type EnvelopeOptions } from '@/lib/audioSynth'

const DEFAULT_ENVELOPE: EnvelopeOptions = {
  attack: 0.02,
  decay: 0.1,
  sustain: 0.3,
  release: 0.3,
}

export function useToneSynth() {
  const { ensureReady } = useAudioContext()
  const isPlaying = ref(false)

  async function play(frequency: number, duration = 1.0): Promise<void> {
    const ctx = await ensureReady()
    isPlaying.value = true
    playNote(ctx, frequency, duration, DEFAULT_ENVELOPE)
    setTimeout(() => {
      isPlaying.value = false
    }, duration * 1000)
  }

  async function playNotes(
    frequencies: number[],
    noteDuration = 0.8,
    gap = 0.3
  ): Promise<void> {
    const ctx = await ensureReady()
    isPlaying.value = true
    await playSequence(ctx, frequencies, noteDuration, gap, DEFAULT_ENVELOPE)
    setTimeout(() => {
      isPlaying.value = false
    }, noteDuration * 1000)
  }

  return {
    play,
    playNotes,
    isPlaying,
  }
}
