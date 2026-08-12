<template>
  <div :class="$style.controlBar">
    <div :class="$style.actions">
      <button
        :class="['btn btn--icon', { active: isMicOn, 'btn--pulse': isMicOn }]"
        @click="toggleMicrophone"
        :title="isMicOn ? t('controls.micOn') : t('controls.micOff')"
      >
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            v-if="isMicOn"
            fill="currentColor"
            d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"
          />
          <path
            v-else
            fill="currentColor"
            d="M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11L15,11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z"
          />
        </svg>
      </button>

      <button
        :class="['btn btn--icon', { active: isScreenSharing }]"
        @click="toggleScreenShare"
        :title="isScreenSharing ? t('controls.screenStop') : t('controls.screenStart')"
      >
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            v-if="isScreenSharing"
            fill="currentColor"
            d="M21,3H3A2,2 0 0,0 1,5V15A2,2 0 0,0 3,17H8V19H16V17H21A2,2 0 0,0 23,15V5A2,2 0 0,0 21,3M21,15H3V5H21M10,8V12L14,10"
          />
          <path
            v-else
            fill="currentColor"
            d="M21,3H3C1.89,3 1,3.89 1,5V15A2,2 0 0,0 3,17H8V19H16V17H21A2,2 0 0,0 23,15V5C23,3.89 22.1,3 21,3M21,15H3V5H21V15Z"
          />
        </svg>
      </button>

      <div :class="$style.divider"></div>

      <button
        class="btn btn--icon"
        @click="copyCode"
        :title="t('room.copyCode')"
      >
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            fill="currentColor"
            d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
          />
        </svg>
      </button>

      <button
        :class="['btn btn--icon', $style.btnDanger]"
        @click="handleLeave"
        :title="t('controls.leave')"
      >
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            fill="currentColor"
            d="M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44A8,8 0 1,0 16.56,5.44M13,3H11V13H13"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMeteredPeer } from '../composables/useMeteredPeer'
import { useToast } from '../composables/useToast'
import { useI18n } from 'vue-i18n'

const {
  isMicOn,
  isScreenSharing,
  toggleMicrophone,
  toggleScreenShare,
  leaveRoom,
  roomCode,
} = useMeteredPeer()

const { addToast } = useToast()
const { t } = useI18n()

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(roomCode.value)
    addToast(t('room.copied'), 'success')
  } catch {
    addToast(t('error.generic'), 'error')
  }
}

const handleLeave = () => {
  leaveRoom()
}
</script>

<style module>
.controlBar {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-glass);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-xl);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 30;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.divider {
  width: 1px;
  height: 32px;
  background: var(--color-glass-border);
}

.btnDanger {
  color: var(--color-danger) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.btnDanger:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: var(--color-danger) !important;
}

@media (max-width: 768px) {
  .controlBar {
    width: 90%;
    padding: 0.75rem;
    gap: 0.5rem;
    justify-content: center;
  }
}
</style>
