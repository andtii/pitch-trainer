<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import type { ExperienceLevel } from '@/types'

const router = useRouter()
const settings = useSettingsStore()

const levels: { key: ExperienceLevel; title: string; icon: string; description: string; color: string }[] = [
  {
    key: 'beginner',
    title: 'Beginner',
    icon: '🌱',
    description: "I'm new to singing and want to start with the basics. Wider pitch tolerance and simpler exercises.",
    color: 'var(--pitch-perfect)',
  },
  {
    key: 'intermediate',
    title: 'Intermediate',
    icon: '🎶',
    description: "I can carry a tune but want to get more accurate. Standard pitch tolerance and all exercises.",
    color: 'var(--accent-teal)',
  },
  {
    key: 'advanced',
    title: 'Advanced',
    icon: '🏆',
    description: "I'm experienced and want tight accuracy targets. Narrow pitch tolerance and full range.",
    color: 'var(--accent-purple)',
  },
]

function selectLevel(level: ExperienceLevel) {
  settings.applyPreset(level)
  settings.hasCompletedOnboarding = true
  router.replace('/')
}
</script>

<template>
  <div class="onboarding container">
    <div class="hero">
      <span class="hero-icon">🎵</span>
      <h1>Welcome to PitchTrainer</h1>
      <p class="subtitle">Let's set things up for you. How would you describe your singing experience?</p>
    </div>

    <div class="levels-grid">
      <button
        v-for="level in levels"
        :key="level.key"
        class="level-card card"
        @click="selectLevel(level.key)"
      >
        <span class="level-icon">{{ level.icon }}</span>
        <h2 class="level-title" :style="{ color: level.color }">{{ level.title }}</h2>
        <p class="level-desc">{{ level.description }}</p>
      </button>
    </div>

    <p class="hint">You can change this anytime in Settings.</p>
  </div>
</template>

<style scoped>
.onboarding {
  padding-top: 4rem;
  text-align: center;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero {
  margin-bottom: 3rem;
}

.hero-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, var(--accent-teal), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.15rem;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  max-width: 780px;
  width: 100%;
  margin-bottom: 2rem;
}

.level-card {
  text-align: center;
  cursor: pointer;
  padding: 2rem 1.5rem;
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.level-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow);
  border-color: var(--border-hover);
}

.level-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.level-title {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.level-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.hint {
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
