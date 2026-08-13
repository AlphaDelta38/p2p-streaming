<template>
  <div :class="$style.session">
    <div :class="$style.header">
      <div :class="$style.roomCode">
        <span :class="$style.roomCodeValue">{{ roomCode }}</span>
        <button :class="$style.roomCodeCopy" @click="copyCode" :title="t('room.copyCode')">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
          </svg>
        </button>
      </div>

      <div :class="$style.participantsWrapper">
        <button :class="$style.participantsBadge" @click="toggleParticipants">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z" />
          </svg>
          {{ participantCount }}
        </button>
        <ParticipantsMenu v-if="showParticipants" />
      </div>
    </div>

    <div :class="$style.grid" v-if="hasStreams">
      <div
        v-if="localStreams.screen"
        :class="[$style.videoTileWrapper, $style.screenTileWrapper]"
      >
        <VideoTile
          :stream="localStreams.screen"
          :label="username || t('stream.you')"
          type="screen"
          :isLocal="true"
          :volume="0"
        />
      </div>

      <div v-if="localStreams.mic" :class="$style.videoTileWrapper">
        <VideoTile
          :stream="localStreams.mic"
          :label="username || t('stream.you')"
          type="mic"
          :isLocal="true"
          :volume="0"
        />
      </div>

      <template v-for="[peerId, peerData] in peers" :key="peerId">
        <div
          v-for="stream in peerData.streams"
          :key="stream.id"
          :class="[$style.videoTileWrapper, streamHasVideo(stream) ? $style.screenTileWrapper : '']"
        >
          <VideoTile
            :stream="stream"
            :label="remoteUsernames.get(peerId) || peerId.substring(0, 4)"
            :type="streamHasVideo(stream) ? 'screen' : 'mic'"
            :isLocal="false"
            :volume="streamHasVideo(stream) ? (volumes.get(peerId)?.screen ?? 1) : (volumes.get(peerId)?.mic ?? 1)"
          />
        </div>
      </template>
    </div>

    <div v-else :class="$style.grid">
      <div :class="$style.emptyState">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path
            fill="currentColor"
            opacity="0.3"
            d="M21 3H3C1.89 3 1 3.89 1 5V15C1 16.11 1.89 17 3 17H8V19H16V17H21C22.11 17 23 16.11 23 15V5C23 3.89 22.11 3 21 3M21 15H3V5H21V15Z"
          />
        </svg>
        <h3>{{ t('empty.title') }}</h3>
        <p>{{ t('empty.description') }}</p>
      </div>
    </div>

    <ControlBar />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMeteredPeer } from '../composables/useMeteredPeer'
import { useToast } from '../composables/useToast'
import { useI18n } from 'vue-i18n'

const { roomCode, localStreams, peers, participantCount, username, remoteUsernames, volumes, updateVolume } = useMeteredPeer()
const { addToast } = useToast()
const { t } = useI18n()

const showParticipants = ref(false)
const toggleParticipants = () => showParticipants.value = !showParticipants.value

const hasStreamType = (streams: MediaStream[], type: 'mic' | 'screen') => {
  return streams.some(s => type === 'screen' ? s.getVideoTracks().length > 0 : s.getVideoTracks().length === 0)
}

const hasStreams = computed(() => {
  return localStreams.value.screen || localStreams.value.mic || peers.value.size > 0
})

const streamHasVideo = (stream: MediaStream) => {
  return stream.getVideoTracks().length > 0
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(roomCode.value)
    addToast(t('room.copied'), 'success')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = roomCode.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    addToast(t('room.copied'), 'success')
  }
}
</script>

<style module>
.session {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.header {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
  z-index: 20;
}

.roomCode {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed var(--color-glass-border);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
}

.roomCodeValue {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-primary);
}

.roomCodeCopy {
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.roomCodeCopy:hover {
  color: var(--color-text);
}

.participantsWrapper {
  position: relative;
}

.participantsBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-glass);
  backdrop-filter: var(--blur-surface);
  border: 1px solid var(--color-glass-border);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--color-text);
}



.grid {
  flex: 1;
  padding: 1rem 2rem 6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-content: start;
  justify-content: center;
  overflow-y: auto;
  perspective: 1000px;
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  color: var(--color-text-muted);
  gap: 1rem;
}

.emptyState svg {
  width: 64px;
  height: 64px;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.videoTileWrapper {
  position: relative;
  background: var(--color-glass);
  backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  
  flex: 1 1 320px;
  max-width: 480px;
  aspect-ratio: 16/9;
  
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  animation: slide-up 0.5s var(--transition-slow) both;
}

.videoTileWrapper:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.screenTileWrapper {
  flex: 1 1 800px;
  max-width: 1280px;
}

@media (max-width: 768px) {
  .grid {
    padding: 1rem 1rem 5rem;
  }
}
</style>
