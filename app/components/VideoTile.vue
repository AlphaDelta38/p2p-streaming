<template>
  <div :class="$style.inner">
    <video
      v-show="!isAudioOnly"
      ref="videoRef"
      autoplay
      playsinline
      :muted="isLocal"
      :class="$style.video"
    ></video>

    <div v-if="isAudioOnly" :class="$style.audio">
      <div :class="$style.audioPulse"></div>
      <svg viewBox="0 0 24 24" width="40" height="40">
        <path
          fill="currentColor"
          d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"
        />
      </svg>
    </div>

    <div :class="$style.label">
      <svg v-if="type === 'screen'" viewBox="0 0 24 24" width="14" height="14">
        <path
          fill="currentColor"
          d="M21 3H3C1.89 3 1 3.89 1 5V15C1 16.11 1.89 17 3 17H8V19H16V17H21C22.11 17 23 16.11 23 15V5C23 3.89 22.11 3 21 3M21 15H3V5H21V15Z"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="14" height="14">
        <path
          fill="currentColor"
          d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"
        />
      </svg>
      <span>{{ labelText }}</span>
      <span v-if="type === 'screen'" :class="$style.typeBadge">{{ t('stream.screen') }}</span>
      <span v-else :class="$style.typeBadge">{{ t('stream.microphone') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  stream: MediaStream
  label: string
  type: 'screen' | 'mic'
  isLocal: boolean
}>()

const { t } = useI18n()
const labelText = computed(() => props.label)

const videoRef = ref<HTMLVideoElement | null>(null)

const isAudioOnly = computed(() => {
  return props.stream.getVideoTracks().length === 0
})

const setStream = () => {
  if (videoRef.value && props.stream) {
    videoRef.value.srcObject = props.stream
    videoRef.value.play().catch((err) => {
      console.warn('[VideoTile] Autoplay blocked or failed to play:', err)
    })
  }
}

onMounted(() => {
  setStream()
})

watch(
  () => props.stream,
  () => {
    setStream()
  },
)
</script>

<style module>
.inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.audio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  color: var(--color-primary);
}

.audioPulse {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-glow);
  animation: audioPulse 2s ease-in-out infinite;
}

.label {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.typeBadge {
  font-size: 0.7rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes audioPulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.1;
  }
}
</style>
