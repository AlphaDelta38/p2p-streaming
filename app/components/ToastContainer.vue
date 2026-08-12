<template>
  <div :class="[$style.container, $style[`container-${currentPosition}`]]">
    <TransitionGroup :name="$style.list" tag="div" :class="$style.list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[$style.toast, $style[`toast-${toast.type}`]]"
        @click="removeToast(toast.id)"
      >
        <div :class="$style.icon">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
          </svg>
          <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
          </svg>
        </div>
        <div :class="$style.content">
          {{ toast.message }}
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, currentPosition, removeToast } = useToast()
</script>

<style module>
.container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.container-top {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.container-bottom-right {
  bottom: 24px;
  right: 24px;
  align-items: flex-end;
}

.container-bottom {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--color-glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: var(--color-text);
  min-width: 250px;
  max-width: 400px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.4);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-success .icon { color: var(--color-primary); }
.toast-error .icon { color: var(--color-danger); }
.toast-info .icon { color: #3b82f6; }

.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.container-bottom .list-enter-from,
.container-bottom-right .list-enter-from {
  transform: translateY(20px) scale(0.9);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
