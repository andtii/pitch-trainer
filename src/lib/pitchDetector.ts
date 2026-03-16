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

  // Check if there's enough signal
  let rms = 0
  for (let i = 0; i < bufferSize; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / bufferSize)
  if (rms < 0.01) return null

  // Autocorrelation
  const correlations = new Float32Array(bufferSize)
  for (let lag = 0; lag < bufferSize; lag++) {
    let sum = 0
    for (let i = 0; i < bufferSize - lag; i++) {
      sum += buffer[i] * buffer[i + lag]
    }
    correlations[lag] = sum
  }

  // Normalize
  const maxCorrelation = correlations[0]
  if (maxCorrelation === 0) return null
  for (let i = 0; i < bufferSize; i++) {
    correlations[i] /= maxCorrelation
  }

  // Find the first dip below threshold, then first peak after it
  // This corresponds to the fundamental period
  let foundDip = false
  let bestLag = -1
  let bestCorrelation = threshold

  // Min lag = sampleRate / maxFreq (e.g., 1200 Hz ~ C6)
  const minLag = Math.floor(sampleRate / 1200)
  // Max lag = sampleRate / minFreq (e.g., 60 Hz ~ B1)
  const maxLag = Math.floor(sampleRate / 60)

  for (let lag = minLag; lag < Math.min(maxLag, bufferSize); lag++) {
    if (!foundDip && correlations[lag] < threshold) {
      foundDip = true
    }
    if (foundDip && correlations[lag] > bestCorrelation) {
      bestCorrelation = correlations[lag]
      bestLag = lag
    }
    // Once we've found a strong peak after the dip, stop looking
    if (foundDip && bestLag !== -1 && correlations[lag] < bestCorrelation * 0.9) {
      break
    }
  }

  if (bestLag === -1) return null

  // Parabolic interpolation for sub-sample accuracy
  const y0 = correlations[bestLag - 1] ?? correlations[bestLag]
  const y1 = correlations[bestLag]
  const y2 = correlations[bestLag + 1] ?? correlations[bestLag]
  const shift = (y0 - y2) / (2 * (y0 - 2 * y1 + y2))
  const refinedLag = bestLag + (isFinite(shift) ? shift : 0)

  return sampleRate / refinedLag
}
