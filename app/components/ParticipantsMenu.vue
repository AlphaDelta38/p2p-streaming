<template>
  <div :class="$style.participantsDropdown">
    <div :class="$style.dropdownHeader">
      <h4>{{ t('room.participants') }}</h4>
      <span :class="$style.countBadge">{{ participantCount }}</span>
    </div>

    <div :class="$style.participantsList">
      <div :class="$style.participantItem">
        <div :class="$style.participantInfo">
          <div :class="$style.avatar">{{ (username || t('stream.you')).charAt(0).toUpperCase() }}</div>
          <span :class="$style.name">{{ username || t('stream.you') }}</span>
          <span :class="$style.youBadge">{{ t('room.youBadge') }}</span>
        </div>
      </div>

      <div v-for="[peerId, peerData] in peers" :key="peerId" :class="$style.participantItem">
        <div :class="$style.participantInfo">
          <div :class="$style.avatar">{{ (remoteUsernames.get(peerId) || peerId).charAt(0).toUpperCase() }}</div>
          <span :class="$style.name">{{ remoteUsernames.get(peerId) || peerId.substring(0, 4) }}</span>
        </div>
        <div :class="$style.volumeControls" v-if="peerData.streams.length > 0">
          <div v-if="hasStreamType(peerData.streams, 'mic')" :class="$style.volumeControl">
            <svg viewBox="0 0 24 24" width="16" height="16" :class="$style.volumeIcon"><path fill="currentColor" d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" /></svg>
            <input type="range" min="0" max="1" step="0.05" :value="volumes.get(peerId)?.mic ?? 1" @input="updateVolume(peerId, 'mic', Number(($event.target as HTMLInputElement).value))" :class="$style.volumeSlider" />
          </div>
          <div v-if="hasStreamType(peerData.streams, 'screen')" :class="$style.volumeControl">
            <svg viewBox="0 0 24 24" width="16" height="16" :class="$style.volumeIcon"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" /></svg>
            <input type="range" min="0" max="1" step="0.05" :value="volumes.get(peerId)?.screen ?? 1" @input="updateVolume(peerId, 'screen', Number(($event.target as HTMLInputElement).value))" :class="$style.volumeSlider" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMeteredPeer } from '../composables/useMeteredPeer'
import { useI18n } from 'vue-i18n'

const { peers, participantCount, username, remoteUsernames, volumes, updateVolume } = useMeteredPeer()
const { t } = useI18n()

const hasStreamType = (streams: MediaStream[], type: 'mic' | 'screen') => {
  return streams.some(s => type === 'screen' ? s.getVideoTracks().length > 0 : s.getVideoTracks().length === 0)
}
</script>

<style module>
.participantsDropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.75rem;
  width: 280px;
  background: rgba(15, 15, 20, 0.95);
  backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: slide-up 0.2s var(--transition-fast) both;
}

.dropdownHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdownHeader h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.countBadge {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.participantsList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.participantItem {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.participantItem:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.participantInfo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: #fff;
  flex-shrink: 0;
}

.name {
  flex: 1;
  font-weight: 500;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.youBadge {
  font-size: 0.7rem;
  background: var(--color-primary-glow);
  color: #c4b5fd;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
}

.volumeControls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-left: 44px;
}

.volumeControl {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volumeIcon {
  color: var(--color-text-muted);
}

.volumeSlider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  appearance: none;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}

.volumeSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.volumeSlider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}
</style>
