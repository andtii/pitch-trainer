<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const modes = [
  {
    name: 'Pitch Stability',
    description: 'Hold any note steady — build the foundation of pitch control. Great for beginners!',
    icon: '🎯',
    route: '/stability',
    color: 'var(--pitch-perfect)',
  },
  {
    name: 'Free Play',
    description: 'Play a note, sing it, and see real-time feedback on your pitch accuracy.',
    icon: '🎤',
    route: '/free-play',
    color: 'var(--accent-teal)',
  },
  {
    name: 'Interval Training',
    description: 'Learn to identify and sing musical intervals between two notes.',
    icon: '🎵',
    route: '/interval',
    color: 'var(--accent-purple)',
  },
  {
    name: 'Scale Training',
    description: 'Practice singing scales step by step with guided feedback.',
    icon: '🎹',
    route: '/scale',
    color: 'var(--accent-blue)',
  },
  {
    name: 'Ear Training',
    description: 'Test your ear — hear a note and guess which one it is.',
    icon: '👂',
    route: '/ear-training',
    color: 'var(--accent-pink)',
  },
  {
    name: 'Your Stats',
    description: 'Track your progress, achievements, daily goals, and XP.',
    icon: '📊',
    route: '/stats',
    color: 'var(--accent-teal)',
  },
]
</script>

<template>
  <div class="home container">
    <div class="hero">
      <h1>🎵 PitchTrainer</h1>
      <p class="subtitle">Train your singing pitch with real-time feedback</p>
    </div>

    <div class="modes-grid">
      <button
        v-for="mode in modes"
        :key="mode.route"
        class="mode-card card"
        @click="router.push(mode.route)"
      >
        <span class="mode-icon" :style="{ color: mode.color }">{{ mode.icon }}</span>
        <h2 class="mode-name">{{ mode.name }}</h2>
        <p class="mode-desc">{{ mode.description }}</p>
        <span class="mode-arrow" :style="{ color: mode.color }">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-top: 3rem;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-teal), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.15rem;
  color: var(--text-secondary);
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  max-width: 900px;
  margin: 0 auto;
}

.mode-card {
  text-align: left;
  cursor: pointer;
  position: relative;
  padding: 1.75rem;
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.mode-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.mode-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.mode-name {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.mode-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.mode-arrow {
  position: absolute;
  top: 1.75rem;
  right: 1.75rem;
  font-size: 1.5rem;
  opacity: 0;
  transform: translateX(-8px);
  transition: all var(--transition-normal);
}

.mode-card:hover .mode-arrow {
  opacity: 1;
  transform: translateX(0);
}
</style>
