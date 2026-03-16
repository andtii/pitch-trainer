/**
 * Audio synthesis helpers using Web Audio API.
 */

export interface EnvelopeOptions {
  attack: number
  decay: number
  sustain: number
  release: number
}

const DEFAULT_ENVELOPE: EnvelopeOptions = {
  attack: 0.02,
  decay: 0.1,
  sustain: 0.3,
  release: 0.3,
}

/**
 * Play a single note with an ADSR envelope.
 */
export function playNote(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  envelope: EnvelopeOptions = DEFAULT_ENVELOPE,
  destination?: AudioNode
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  // Use a combination of sine and triangle for a warmer, piano-like tone
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)

  const now = ctx.currentTime
  const { attack, decay, sustain, release } = envelope

  // ADSR envelope
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.5, now + attack)
  gain.gain.linearRampToValueAtTime(sustain * 0.5, now + attack + decay)
  gain.gain.setValueAtTime(sustain * 0.5, now + duration - release)
  gain.gain.linearRampToValueAtTime(0, now + duration)

  osc.connect(gain)
  gain.connect(destination ?? ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.01)
}

/**
 * Play a sequence of notes with a gap between them.
 */
export async function playSequence(
  ctx: AudioContext,
  frequencies: number[],
  noteDuration: number,
  gapDuration: number,
  envelope: EnvelopeOptions = DEFAULT_ENVELOPE,
  destination?: AudioNode
): Promise<void> {
  for (let i = 0; i < frequencies.length; i++) {
    playNote(ctx, frequencies[i], noteDuration, envelope, destination)
    if (i < frequencies.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, (noteDuration + gapDuration) * 1000)
      )
    }
  }
}
