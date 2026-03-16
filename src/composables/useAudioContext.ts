import { ref } from 'vue'

let audioContext: AudioContext | null = null
const isReady = ref(false)

/**
 * Shared AudioContext singleton.
 * Lazily initializes on first call (must be triggered by user gesture).
 */
export function useAudioContext() {
  function getContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext()
      isReady.value = true
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    return audioContext
  }

  async function ensureReady(): Promise<AudioContext> {
    const ctx = getContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    isReady.value = true
    return ctx
  }

  return {
    getContext,
    ensureReady,
    isReady,
  }
}
