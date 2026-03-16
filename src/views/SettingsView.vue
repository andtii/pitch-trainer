<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import type { ExperienceLevel } from '@/types'

const settings = useSettingsStore()

const levels: { key: ExperienceLevel; label: string }[] = [
  { key: 'beginner', label: '🌱 Beginner' },
  { key: 'intermediate', label: '🎶 Intermediate' },
  { key: 'advanced', label: '🏆 Advanced' },
]

function onPresetChange(level: ExperienceLevel) {
  settings.applyPreset(level)
}
</script>

<template>
  <div class="settings-view container">
    <h1>⚙️ Settings</h1>
    <p class="description">Customize your training experience.</p>

    <div class="settings-sections">
      <!-- Experience Level -->
      <section class="settings-section card">
        <h2>Experience Level</h2>
        <p class="section-hint">Changes pitch sensitivity, hold times, and difficulty presets.</p>
        <div class="level-buttons">
          <button
            v-for="level in levels"
            :key="level.key"
            class="btn"
            :class="settings.experienceLevel === level.key ? 'btn-primary' : 'btn-secondary'"
            @click="onPresetChange(level.key)"
          >
            {{ level.label }}
          </button>
        </div>
      </section>

      <!-- Pitch Sensitivity -->
      <section class="settings-section card">
        <h2>Pitch Sensitivity</h2>
        <p class="section-hint">How close to the target note counts as accurate.</p>

        <div class="slider-group">
          <label>
            <span class="slider-label">Green zone (perfect): <strong>±{{ settings.greenZoneCents }}¢</strong></span>
            <input
              type="range"
              :value="settings.greenZoneCents"
              @input="settings.greenZoneCents = Number(($event.target as HTMLInputElement).value)"
              min="3"
              max="40"
              step="1"
              class="slider"
            />
            <span class="slider-range">3¢ — 40¢</span>
          </label>
        </div>

        <div class="slider-group">
          <label>
            <span class="slider-label">Yellow zone (close): <strong>±{{ settings.yellowZoneCents }}¢</strong></span>
            <input
              type="range"
              :value="settings.yellowZoneCents"
              @input="settings.yellowZoneCents = Number(($event.target as HTMLInputElement).value)"
              min="10"
              max="50"
              step="1"
              class="slider"
            />
            <span class="slider-range">10¢ — 50¢</span>
          </label>
        </div>

        <div class="slider-group">
          <label>
            <span class="slider-label">Hold time (auto-advance): <strong>{{ settings.holdTimeMs }}ms</strong></span>
            <input
              type="range"
              :value="settings.holdTimeMs"
              @input="settings.holdTimeMs = Number(($event.target as HTMLInputElement).value)"
              min="300"
              max="2000"
              step="100"
              class="slider"
            />
            <span class="slider-range">300ms — 2000ms</span>
          </label>
        </div>
      </section>

      <!-- Reference Pitch -->
      <section class="settings-section card">
        <h2>Reference Pitch</h2>
        <p class="section-hint">Standard tuning is A4 = 440 Hz.</p>
        <div class="inline-setting">
          <label>
            A4 =
            <input
              type="number"
              :value="settings.referencePitch"
              @input="settings.referencePitch = Number(($event.target as HTMLInputElement).value)"
              min="400"
              max="480"
              step="1"
              class="number-input"
            />
            Hz
          </label>
        </div>
      </section>

      <!-- Vocal Range -->
      <section class="settings-section card">
        <h2>Vocal Range</h2>
        <p class="section-hint">Octave range for random note selection.</p>
        <div class="inline-setting">
          <label>
            Min octave
            <select
              :value="settings.minOctave"
              @change="settings.minOctave = Number(($event.target as HTMLSelectElement).value)"
              class="select-input"
            >
              <option v-for="o in [1,2,3,4,5]" :key="o" :value="o">{{ o }}</option>
            </select>
          </label>
          <label>
            Max octave
            <select
              :value="settings.maxOctave"
              @change="settings.maxOctave = Number(($event.target as HTMLSelectElement).value)"
              class="select-input"
            >
              <option v-for="o in [2,3,4,5,6]" :key="o" :value="o">{{ o }}</option>
            </select>
          </label>
        </div>
      </section>

      <!-- Reset -->
      <section class="settings-section">
        <button class="btn btn-secondary reset-btn" @click="settings.reset()">
          ↺ Reset All Settings
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 640px;
  margin: 0 auto;
}

.settings-view h1 { margin-bottom: 0.5rem; }
.description {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.settings-section h2 {
  font-size: 1.15rem;
  margin-bottom: 0.25rem;
}

.section-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.level-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.slider-group {
  margin-bottom: 1rem;
}

.slider-group:last-child {
  margin-bottom: 0;
}

.slider-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.slider-label strong {
  color: var(--accent-teal);
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  appearance: none;
  background: var(--bg-input);
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-teal);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-teal);
  border: none;
  cursor: pointer;
}

.slider-range {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.inline-setting {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.inline-setting label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.number-input {
  width: 80px;
  padding: 0.5rem 0.75rem;
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: var(--font-mono);
  text-align: center;
}

.select-input {
  padding: 0.5rem 0.75rem;
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: var(--font-sans);
  cursor: pointer;
}

.reset-btn {
  width: 100%;
  justify-content: center;
  color: var(--pitch-off);
  border-color: rgba(239, 68, 68, 0.3);
}

.reset-btn:hover {
  border-color: var(--pitch-off) !important;
  background: rgba(239, 68, 68, 0.1);
}
</style>
