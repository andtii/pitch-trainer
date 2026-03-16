<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <nav class="container nav-bar">
      <router-link to="/" class="logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">PitchTrainer</span>
      </router-link>
      <div class="nav-links">
        <router-link to="/stability">Stability</router-link>
        <router-link to="/free-play">Free Play</router-link>
        <router-link to="/interval">Intervals</router-link>
        <router-link to="/scale">Scales</router-link>
        <router-link to="/ear-training">Ear Training</router-link>
        <router-link to="/settings" class="settings-link">⚙️</router-link>
      </div>
    </nav>
  </header>

  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.logo:hover {
  color: var(--accent-teal);
}

.logo-icon {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent-teal);
  border-bottom-color: var(--accent-teal);
}

.settings-link {
  font-size: 1.1rem !important;
  border-bottom: none !important;
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 0.75rem;
    font-size: 0.8rem;
  }
  .logo-text {
    display: none;
  }
}
</style>
