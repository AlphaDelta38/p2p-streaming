<template>
  <div :class="$style.lobby">
    <div :class="$style.card">
      <h1 :class="$style.logo">{{ t('app.title') }}</h1>
      <p :class="$style.subtitle">{{ t('app.subtitle') }}</p>

      <div :class="$style.actions">
        <button class="btn btn--primary" @click="handleCreate" :disabled="isCreating">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          {{ isCreating ? t('lobby.creating') : t('lobby.createRoom') }}
        </button>

        <div :class="$style.divider">
          <span>{{ t('lobby.or') }}</span>
        </div>

        <div :class="$style.join">
          <input
            v-model="inputCode"
            type="text"
            :placeholder="t('lobby.roomCodePlaceholder')"
            class="input"
            maxlength="6"
            @keyup.enter="handleJoin"
          />
          <button
            class="btn btn--ghost"
            @click="handleJoin"
            :disabled="!inputCode.trim() || isJoining"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
            </svg>
            {{ isJoining ? t('lobby.joining') : t('lobby.joinRoom') }}
          </button>
        </div>
      </div>

      <div :class="$style.footer">
        <LanguageSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMeteredPeer } from '../composables/useMeteredPeer'
import { useI18n } from 'vue-i18n'

const { createRoom, joinRoom } = useMeteredPeer()
const { t } = useI18n()
const inputCode = ref('')
const isCreating = ref(false)
const isJoining = ref(false)

const handleCreate = async () => {
  isCreating.value = true
  try {
    await createRoom()
  } finally {
    isCreating.value = false
  }
}

const handleJoin = async () => {
  if (!inputCode.value.trim()) return
  isJoining.value = true
  try {
    await joinRoom(inputCode.value)
  } finally {
    isJoining.value = false
  }
}
</script>

<style module>
.lobby {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 10;
}

.card {
  width: 100%;
  max-width: 480px;
  background: var(--color-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-xl);
  padding: 3rem 2.5rem;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: slide-up 0.6s var(--transition-slow) both;
}

.logo {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
}

.subtitle {
  color: var(--color-text-muted);
  text-align: center;
  font-size: 1.1rem;
  margin-top: -1.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-dim);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-glass-border);
}

.join {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .card {
    padding: 2rem 1.5rem;
  }
}
</style>
