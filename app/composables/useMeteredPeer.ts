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

const username = ref(process.client ? localStorage.getItem('p2p_username') || '' : '')
const remoteUsernames = ref<Map<string, string>>(new Map())
const volumes = ref<Map<string, { mic: number, screen: number }>>(new Map())

const updateVolume = (peerId: string, type: 'mic' | 'screen', value: number) => {
  const peerVolumes = volumes.value.get(peerId) || { mic: 1, screen: 1 }
  peerVolumes[type] = value
  volumes.value.set(peerId, peerVolumes)
  volumes.value = new Map(volumes.value)
}

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
      peerInstance = new MeteredPeer({ 
        apiKey,
        rtcPeerConnectionFactory: (config: any) => {
          const enrichedConfig = {
            ...config,
            iceServers: [
              ...(config.iceServers || []),
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' }
            ]
          }
          
          console.log('[WebRTC Debug] Initializing RTCPeerConnection with config:', JSON.stringify(enrichedConfig.iceServers))
          const pc = new RTCPeerConnection(enrichedConfig)
          
          pc.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
              console.log(`[WebRTC Debug] Candidate found: Type=${event.candidate.type}, Protocol=${event.candidate.protocol}, IP=${event.candidate.address}`)
            } else {
              console.log('[WebRTC Debug] ICE candidate gathering finished.')
            }
          })

          pc.addEventListener('iceconnectionstatechange', () => {
            console.log('[WebRTC Debug] ICE Connection State =>', pc.iceConnectionState)
            if (pc.iceConnectionState === 'failed') {
              console.error('[WebRTC Debug] CONNECTION FAILED! Symmetric NAT or Firewall blocked the P2P connection.')
            }
          })

          pc.addEventListener('connectionstatechange', () => {
            console.log('[WebRTC Debug] Overall Connection State =>', pc.connectionState)
          })

          return pc
        }
      })
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
      
      volumes.value.set(remote.id, { mic: 1, screen: 1 })
      volumes.value = new Map(volumes.value)

      if (username.value) {
        peer.sendTo(remote.id, { type: 'username', value: username.value }).catch(() => {})
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
      remoteUsernames.value.delete(remote.id)
      remoteUsernames.value = new Map(remoteUsernames.value)
      volumes.value.delete(remote.id)
      volumes.value = new Map(volumes.value)
      addToast(t('toast.peerLeft'), 'info')
    })

    peer.on('data', (payload: any) => {
      if (payload.data && payload.data.type === 'username') {
        remoteUsernames.value.set(payload.senderPeerId, payload.data.value)
        remoteUsernames.value = new Map(remoteUsernames.value)
      }
    })
  }

  const createRoom = async () => {
    try {
      const peer = await getMeteredPeer()
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      await peer.join(code)
      roomCode.value = code
      isConnected.value = true
      
      const router = useRouter()
      router.replace({ query: { room: code } })
      
      if (username.value) {
        peer.send({ type: 'username', value: username.value }).catch(() => {})
      }
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
      
      const router = useRouter()
      router.replace({ query: { room: normalizedCode } })
      
      if (username.value) {
        peer.send({ type: 'username', value: username.value }).catch(() => {})
      }
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
    remoteUsernames.value = new Map()
    volumes.value = new Map()
    peerInstance = null
    
    const router = useRouter()
    router.replace({ query: {} })
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
      if (isScreenSharing.value) {
        if (localStreams.value.screen) {
          localStreams.value.screen.getTracks().forEach((t) => t.stop())
          if (peerInstance) {
            try { peerInstance.removeStream(localStreams.value.screen) } catch (e) {}
          }
        }
        localStreams.value = { ...localStreams.value, screen: undefined }
        isScreenSharing.value = false
        addToast(t('toast.screenStopped'), 'info')
      } else {
        let stream;
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30, max: 60}
            },
            audio: true
          })
        } catch (e) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
          })
        }

        const videoTrack = stream.getVideoTracks()[0]
        const audioTrack = stream.getAudioTracks()[0]
        
        if (videoTrack) {
          videoTrack.onended = () => {
            if (peerInstance && localStreams.value.screen) {
              const vTrack = localStreams.value.screen.getVideoTracks()[0]
              const aTrack = localStreams.value.screen.getAudioTracks()[0]
              if (vTrack) {
                try { peerInstance.removeTrack(vTrack) } catch (e) {}
              }
              if (aTrack) {
                try { peerInstance.removeTrack(aTrack) } catch (e) {}
              }
            }
            localStreams.value = { ...localStreams.value, screen: undefined }
            isScreenSharing.value = false
            addToast(t('toast.screenStopped'), 'info')
          }
        }

        localStreams.value = { ...localStreams.value, screen: stream }
        
        if (peerInstance) {
          if (videoTrack) {
            try {
              peerInstance.addTrack(videoTrack, stream, { role: 'screen', label: 'Screen Share' })
            } catch (err) {
              console.error('Failed to add screen video track:', err)
            }
          }
          
          if (audioTrack) {
            setTimeout(() => {
              try {
                if (isScreenSharing.value) {
                  peerInstance.addTrack(audioTrack, stream, { role: 'screen-audio', label: 'Screen Audio' })
                }
              } catch (err) {
                console.error('Failed to add screen audio track:', err)
              }
            }, 1000)
          }
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
    username,
    remoteUsernames,
    volumes,
    updateVolume,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleMicrophone,
    toggleScreenShare,
  }
}
