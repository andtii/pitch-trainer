import { ref, computed, onUnmounted } from 'vue'
import { useAudioContext } from './useAudioContext'
import { detectPitch } from '@/lib/pitchDetector'
import { frequencyToNoteInfo, getCentsOff } from '@/lib/musicTheory'
import type { NoteInfo, PitchData } from '@/types'

const BUFFER_SIZE = 4096
const SMOOTHING_WINDOW = 5
const DETECTION_INTERVAL_MS = 33
const NULL_TOLERANCE = 10

export function usePitchDetection(referencePitch = 440) {
  const { ensureReady } = useAudioContext()

  const isListening = ref(false)
  const detectedFrequency = ref<number | null>(null)
  const detectedNote = ref<NoteInfo | null>(null)
  const centsOff = ref(0)
  const confidence = ref(0)

  let analyser: AnalyserNode | null = null
  let sourceNode: MediaStreamAudioSourceNode | null = null
  let mediaStream: MediaStream | null = null
  let timerId: ReturnType<typeof setTimeout> | null = null
  let audioBuffer: Float32Array<ArrayBuffer> | null = null
  let consecutiveNulls = 0
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
    return sorted[Math.floor(sorted.length / 2)]
  }

  function processAudio() {
    if (!analyser || !isListening.value) return

    // Resume AudioContext if browser suspended it
    if (analyser.context.state === 'suspended') {
      ;(analyser.context as AudioContext).resume()
    }

    if (!audioBuffer || audioBuffer.length !== analyser.fftSize) {
      audioBuffer = new Float32Array(analyser.fftSize)
    }
    analyser.getFloatTimeDomainData(audioBuffer)

    const freq = detectPitch(audioBuffer, analyser.context.sampleRate)

    if (freq !== null && freq > 50 && freq < 1500) {
      consecutiveNulls = 0
      const smoothed = smoothFrequency(freq)
      detectedFrequency.value = smoothed
      detectedNote.value = frequencyToNoteInfo(smoothed, referencePitch)
      centsOff.value = getCentsOff(smoothed, referencePitch)
      confidence.value = Math.min(1, recentFrequencies.length / SMOOTHING_WINDOW)
    } else {
      consecutiveNulls++
      if (consecutiveNulls >= NULL_TOLERANCE) {
        detectedFrequency.value = null
        detectedNote.value = null
        centsOff.value = 0
        confidence.value = 0
        recentFrequencies.length = 0
      }
    }

    // setTimeout is immune to browser rAF throttling
    timerId = setTimeout(processAudio, DETECTION_INTERVAL_MS)
  }

  async function startListening(): Promise<void> {
    if (isListening.value) return

    const ctx = await ensureReady()
    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      sourceNode = ctx.createMediaStreamSource(stream)
      analyser = ctx.createAnalyser()
      analyser.fftSize = BUFFER_SIZE
      analyser.smoothingTimeConstant = 0
      sourceNode.connect(analyser)
      mediaStream = stream
    } catch (err) {
      stream?.getTracks().forEach((t) => t.stop())
      analyser = null
      sourceNode = null
      throw err
    }

    audioBuffer = new Float32Array(BUFFER_SIZE)
    consecutiveNulls = 0
    isListening.value = true
    recentFrequencies.length = 0
    processAudio()
  }

  function stopListening(): void {
    isListening.value = false
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
    if (sourceNode) {
      sourceNode.disconnect()
      sourceNode = null
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      mediaStream = null
    }
    analyser = null
    audioBuffer = null
    consecutiveNulls = 0
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