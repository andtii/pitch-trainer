<script setup lang="ts">
const props = defineProps<{
  hasPermission: boolean | null
  isListening: boolean
}>()

const emit = defineEmits<{
  (e: 'request-permission'): void
}>()
</script>

<template>
  <div class="mic-permission">
    <template v-if="hasPermission === null">
      <div class="mic-status pending">
        <span class="mic-icon">🎤</span>
        <p>Microphone access is needed to detect your pitch.</p>
        <button class="btn btn-primary" @click="emit('request-permission')">
          Enable Microphone
        </button>
      </div>
    </template>

    <template v-else-if="hasPermission === false">
      <div class="mic-status error">
        <span class="mic-icon">🚫</span>
        <p>Microphone access was denied. Please allow microphone access in your browser settings.</p>
      </div>
    </template>

    <template v-else>
      <div class="mic-status active" :class="{ listening: isListening }">
        <span class="mic-icon">🎤</span>
        <span class="mic-label">{{ isListening ? 'Listening...' : 'Mic ready' }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mic-permission {
  display: flex;
  justify-content: center;
}

.mic-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.mic-status.pending {
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 1.5rem 2rem;
  text-align: center;
}

.mic-status.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--pitch-off);
}

.mic-status.active {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.mic-status.active.listening {
  animation: pulse 1.5s ease-in-out infinite;
}

.mic-icon {
  font-size: 1.5rem;
}

.mic-label {
  color: var(--pitch-perfect);
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
