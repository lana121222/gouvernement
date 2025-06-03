import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: {
    label: string
    action: () => void
    style?: 'primary' | 'secondary'
  }[]
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  // === ACTIONS ===
  
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 5000, // 5 secondes par défaut
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto-suppression après la durée spécifiée
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // === HELPERS POUR TYPES SPÉCIFIQUES ===
  
  const success = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Plus long pour les erreurs
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  // === HELPER POUR CONFIRMATIONS ===
  
  const confirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = addNotification({
        type: 'warning',
        title,
        message,
        duration: 0, // Pas d'auto-suppression
        actions: [
          {
            label: 'Confirmer',
            style: 'primary',
            action: () => {
              removeNotification(id)
              resolve(true)
            }
          },
          {
            label: 'Annuler',
            style: 'secondary',
            action: () => {
              removeNotification(id)
              resolve(false)
            }
          }
        ]
      })
    })
  }

  return {
    notifications: computed(() => notifications.value),
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    confirm
  }
}) 