import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { useI18n } from 'vue-i18n'
import { MeteredPeer } from '@metered-ca/realtime'
import { useToast } from './useToast'

const roomCode = ref('')
const isConnected = ref(false)
const isMicOn = ref(false)
const isScreenSharing = ref(false)
const peers = ref<Map<string, { id: string; streams: MediaStream[] }>>(new Map())
const localStreams = ref<{ mic?: MediaStream; screen?: MediaStream }>({
  mic: undefined,
  screen: undefined,
})

let peerInstance: any = null

export const useMeteredPeer = () => {
  const config = useRuntimeConfig()
  const { t } = useI18n()
  const { addToast } = useToast()

  const participantCount = computed(() => 1 + peers.value.size)

  const getMeteredPeer = async () => {
    if (peerInstance) return peerInstance

    const apiKey = config.public.meteredApiKey as string

    if (!apiKey) {
      addToast(t('error.noApiKey'), 'error')
      throw new Error('Metered API key not configured')
    }

    try {
      peerInstance = new MeteredPeer({ apiKey })
      setupPeerEvents(peerInstance)
      return peerInstance
    } catch (error) {
      console.error('Failed to init MeteredPeer:', error)
      addToast(t('error.generic'), 'error')
      throw error
    }
  }

  const setupPeerEvents = (peer: MeteredPeer) => {
    peer.on('peer-joined', ({ peer: remote }: any) => {
      console.log('[WebRTC] Peer joined:', remote.id)
      if (!peers.value.has(remote.id)) {
        peers.value.set(remote.id, { id: remote.id, streams: [] })
      }

      addToast(t('toast.peerJoined'), 'info')

      remote.on('stream-added', ({ stream, metadata }: any) => {
        console.log('[WebRTC] Stream added from peer:', remote.id, 'Stream ID:', stream.id, 'Video tracks:', stream.getVideoTracks().length, 'Metadata:', metadata)
        const peerData = peers.value.get(remote.id)
        if (peerData) {
          const updatedStreams = [...peerData.streams, stream]
          peers.value.set(remote.id, { ...peerData, streams: updatedStreams })
        }
      })

      remote.on('stream-removed', ({ stream }: any) => {
        console.log('[WebRTC] Stream removed from peer:', remote.id, 'Stream ID:', stream.id)
        const peerData = peers.value.get(remote.id)
        if (peerData) {
          const updatedStreams = peerData.streams.filter((s: MediaStream) => s.id !== stream.id)
          peers.value.set(remote.id, { ...peerData, streams: updatedStreams })
        }
      })
    })

    peer.on('peer-left', ({ peer: remote }: any) => {
      console.log('[WebRTC] Peer left:', remote.id)
      peers.value.delete(remote.id)
      addToast(t('toast.peerLeft'), 'info')
    })
  }

  const createRoom = async () => {
    try {
      const peer = await getMeteredPeer()
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      await peer.join(code)
      roomCode.value = code
      isConnected.value = true
    } catch (error) {
      console.error('Failed to create room:', error)
      addToast(t('error.connectionFailed'), 'error')
    }
  }

  const joinRoom = async (code: string) => {
    if (!code.trim()) return
    try {
      const peer = await getMeteredPeer()
      const normalizedCode = code.trim().toUpperCase()
      await peer.join(normalizedCode)
      roomCode.value = normalizedCode
      isConnected.value = true
    } catch (error) {
      console.error('Failed to join room:', error)
      addToast(t('error.connectionFailed'), 'error')
    }
  }

  const leaveRoom = () => {
    if (peerInstance) {
      try {
        peerInstance.leave()
      } catch (_) {
      }
    }

    if (localStreams.value.mic) {
      localStreams.value.mic.getTracks().forEach((t) => t.stop())
    }

    if (localStreams.value.screen) {
      localStreams.value.screen.getTracks().forEach((t) => t.stop())
    }

    localStreams.value = { mic: undefined, screen: undefined }
    isMicOn.value = false
    isScreenSharing.value = false
    isConnected.value = false
    roomCode.value = ''
    peers.value = new Map()
    peerInstance = null
  }

  const toggleMicrophone = async () => {
    try {
      if (isMicOn.value && localStreams.value.mic) {
        localStreams.value.mic.getTracks().forEach((t) => t.stop())
        if (peerInstance) {
          peerInstance.removeStream(localStreams.value.mic)
        }
        localStreams.value = { ...localStreams.value, mic: undefined }
        isMicOn.value = false
        addToast(t('toast.micDisabled'), 'info')
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreams.value = { ...localStreams.value, mic: stream }
        if (peerInstance) {
          peerInstance.addStream(stream, { role: 'mic', label: 'Microphone' })
        }
        isMicOn.value = true
        addToast(t('toast.micEnabled'), 'success')
      }
    } catch (error) {
      console.error('Microphone error:', error)
      addToast(t('error.micPermission'), 'error')
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing.value && localStreams.value.screen) {
        localStreams.value.screen.getTracks().forEach((t) => t.stop())
        if (peerInstance) {
          peerInstance.removeStream(localStreams.value.screen)
        }
        localStreams.value = { ...localStreams.value, screen: undefined }
        isScreenSharing.value = false
        addToast(t('toast.screenStopped'), 'info')
      } else {
        // Request only video to prevent Windows-specific negotiation bugs with audio tracks
        const rawStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const videoTrack = rawStream.getVideoTracks()[0]
        
        // Create a clean stream with only the video track
        const stream = new MediaStream([videoTrack])
        
        if (videoTrack) {
          videoTrack.onended = () => {
            if (peerInstance && localStreams.value.screen) {
              peerInstance.removeStream(localStreams.value.screen)
            }
            localStreams.value = { ...localStreams.value, screen: undefined }
            isScreenSharing.value = false
            addToast(t('toast.screenStopped'), 'info')
          }
        }

        localStreams.value = { ...localStreams.value, screen: stream }
        if (peerInstance) {
          peerInstance.addStream(stream, { role: 'screen', label: 'Screen Share' })
        }
        isScreenSharing.value = true
        addToast(t('toast.screenStarted'), 'success')
      }
    } catch (error) {
      console.error('Screen share error:', error)
      addToast(t('error.screenPermission'), 'error')
    }
  }

  return {
    roomCode,
    isConnected,
    isMicOn,
    isScreenSharing,
    peers,
    localStreams,
    participantCount,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleMicrophone,
    toggleScreenShare,
  }
}
