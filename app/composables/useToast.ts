import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'
export type ToastPosition = 'top' | 'bottom-right' | 'bottom'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
const currentPosition = ref<ToastPosition>('top')

export const useToast = () => {
  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const setPosition = (position: ToastPosition) => {
    currentPosition.value = position
  }

  return {
    toasts,
    currentPosition,
    addToast,
    removeToast,
    setPosition
  }
}
