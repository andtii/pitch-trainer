/**
 * Autocorrelation-based pitch detection (YIN-like algorithm).
 * Returns the detected fundamental frequency in Hz, or null if no pitch detected.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  threshold = 0.15
): number | null {
  const bufferSize = buffer.length
  const halfBuffer = Math.floor(bufferSize / 2)

  // Check if there's enough signal
  let rms = 0
  for (let i = 0; i < bufferSize; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / bufferSize)
  if (rms < 0.008) return null

  // Min lag = sampleRate / maxFreq (e.g., 1200 Hz ~ C6)
  const minLag = Math.floor(sampleRate / 1200)
  // Max lag = sampleRate / minFreq (e.g., 60 Hz ~ B1)
  const maxLag = Math.min(Math.floor(sampleRate / 60), halfBuffer)

  // Compute autocorrelation only for the relevant lag range
  // Normalize by the zero-lag value (energy)
  let energy = 0
  for (let i = 0; i < halfBuffer; i++) {
    energy += buffer[i] * buffer[i]
  }
  if (energy === 0) return null

  // Find the first dip below threshold, then first peak after it
  let foundDip = false
  let bestLag = -1
  let bestCorrelation = threshold

  for (let lag = minLag; lag < maxLag; lag++) {
    let sum = 0
    for (let i = 0; i < halfBuffer; i++) {
      sum += buffer[i] * buffer[i + lag]
    }
    const correlation = sum / energy

    if (!foundDip && correlation < threshold) {
      foundDip = true
    }
    if (foundDip && correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestLag = lag
    }
    // Once we've found a strong peak after the dip, stop looking
    if (foundDip && bestLag !== -1 && correlation < bestCorrelation * 0.85) {
      break
    }
  }

  if (bestLag === -1) return null

  // Parabolic interpolation for sub-sample accuracy
  let prevCorr = 0
  let nextCorr = 0
  if (bestLag > minLag) {
    let s = 0
    for (let i = 0; i < halfBuffer; i++) s += buffer[i] * buffer[i + bestLag - 1]
    prevCorr = s / energy
  } else {
    prevCorr = bestCorrelation
  }
  if (bestLag + 1 < maxLag) {
    let s = 0
    for (let i = 0; i < halfBuffer; i++) s += buffer[i] * buffer[i + bestLag + 1]
    nextCorr = s / energy
  } else {
    nextCorr = bestCorrelation
  }

  const denom = 2 * (prevCorr - 2 * bestCorrelation + nextCorr)
  const shift = denom !== 0 ? (prevCorr - nextCorr) / denom : 0
  const refinedLag = bestLag + (isFinite(shift) ? shift : 0)

  return sampleRate / refinedLag
}