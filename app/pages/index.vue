<template>
  <div class="app-container">
    <Transition name="fade" mode="out-in">
      <RoomLobby v-if="!isConnected" key="lobby" />
      <RoomSession v-else key="session" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMeteredPeer } from '../composables/useMeteredPeer'

const { isConnected } = useMeteredPeer()
</script>
