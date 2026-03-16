import { ref, computed, onUnmounted } from 'vue'
import { useAudioContext } from './useAudioContext'
import { detectPitch } from '@/lib/pitchDetector'
import { frequencyToNoteInfo, getCentsOff } from '@/lib/musicTheory'
import type { NoteInfo, PitchData } from '@/types'

const BUFFER_SIZE = 2048
const SMOOTHING_WINDOW = 5

export function usePitchDetection(referencePitch = 440) {
  const { ensureReady } = useAudioContext()

  const isListening = ref(false)
  const detectedFrequency = ref<number | null>(null)
  const detectedNote = ref<NoteInfo | null>(null)
  const centsOff = ref(0)
  const confidence = ref(0)

  let analyser: AnalyserNode | null = null
  let mediaStream: MediaStream | null = null
  let animFrameId: number | null = null
  const recentFrequencies: number[] = []

  const pitchData = computed<PitchData>(() => ({
    frequency: detectedFrequency.value,
    note: detectedNote.value,
    centsOff: centsOff.value,
    confidence: confidence.value,
  }))

  function smoothFrequency(freq: number): number {
    recentFrequencies.push(freq)
    if (recentFrequencies.length > SMOOTHING_WINDOW) {
      recentFrequencies.shift()
    }
    const sorted = [...recentFrequencies].sort((a, b) => a - b)
    // Median filter
    return sorted[Math.floor(sorted.length / 2)]
  }

  function processAudio() {
    if (!analyser || !isListening.value) return

    const buffer = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(buffer)

    const freq = detectPitch(buffer, analyser.context.sampleRate)

    if (freq !== null && freq > 50 && freq < 1500) {
      const smoothed = smoothFrequency(freq)
      detectedFrequency.value = smoothed
      detectedNote.value = frequencyToNoteInfo(smoothed, referencePitch)
      centsOff.value = getCentsOff(smoothed, referencePitch)
      confidence.value = Math.min(1, recentFrequencies.length / SMOOTHING_WINDOW)
    } else {
      detectedFrequency.value = null
      detectedNote.value = null
      centsOff.value = 0
      confidence.value = 0
    }

    animFrameId = requestAnimationFrame(processAudio)
  }

  async function startListening(): Promise<void> {
    if (isListening.value) return

    const ctx = await ensureReady()
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })

    const source = ctx.createMediaStreamSource(mediaStream)
    analyser = ctx.createAnalyser()
    analyser.fftSize = BUFFER_SIZE
    source.connect(analyser)

    isListening.value = true
    recentFrequencies.length = 0
    processAudio()
  }

  function stopListening(): void {
    isListening.value = false
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      mediaStream = null
    }
    analyser = null
    detectedFrequency.value = null
    detectedNote.value = null
    centsOff.value = 0
    confidence.value = 0
    recentFrequencies.length = 0
  }

  onUnmounted(() => {
    stopListening()
  })

  return {
    isListening,
    detectedFrequency,
    detectedNote,
    centsOff,
    confidence,
    pitchData,
    startListening,
    stopListening,
  }
}
