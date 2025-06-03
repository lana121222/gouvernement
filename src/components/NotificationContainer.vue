<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full">
      <TransitionGroup
        name="notification"
        tag="div"
        class="space-y-3"
      >
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          :class="[
            'relative rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300',
            'transform hover:scale-105 hover:shadow-xl',
            getNotificationClasses(notification.type)
          ]"
        >
          <!-- Icône et contenu -->
          <div class="p-4">
            <div class="flex items-start">
              <!-- Icône -->
              <div class="flex-shrink-0">
                <component
                  :is="getIcon(notification.type)"
                  :class="[
                    'h-6 w-6',
                    getIconClasses(notification.type)
                  ]"
                />
              </div>
              
              <!-- Contenu -->
              <div class="ml-3 flex-1">
                <h4 :class="['text-sm font-semibold', getTitleClasses(notification.type)]">
                  {{ notification.title }}
                </h4>
                <p
                  v-if="notification.message"
                  :class="['mt-1 text-sm', getMessageClasses(notification.type)]"
                >
                  {{ notification.message }}
                </p>
                
                <!-- Actions -->
                <div v-if="notification.actions && notification.actions.length > 0" class="mt-3 space-x-2">
                  <button
                    v-for="(action, index) in notification.actions"
                    :key="index"
                    @click="handleAction(notification.id, action)"
                    :class="[
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      action.style === 'primary' 
                        ? 'bg-white text-gray-900 hover:bg-gray-50 shadow-sm border'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-20'
                    ]"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
              
              <!-- Bouton fermer -->
              <div class="ml-4 flex-shrink-0">
                <button
                  @click="notificationStore.removeNotification(notification.id)"
                  :class="[
                    'rounded-md p-1.5 transition-colors',
                    'hover:bg-white hover:bg-opacity-20'
                  ]"
                >
                  <XMarkIcon class="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Barre de progression pour auto-suppression -->
          <div
            v-if="notification.duration && notification.duration > 0"
            class="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg"
            :style="{ 
              width: '100%',
              animation: `progress ${notification.duration}ms linear`
            }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'
import type { Notification } from '@/stores/notifications'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'

const notificationStore = useNotificationStore()

// === HELPERS POUR STYLES ===

const getNotificationClasses = (type: Notification['type']) => {
  const classes = {
    success: 'bg-green-500 border-green-400 text-white',
    error: 'bg-red-500 border-red-400 text-white',
    warning: 'bg-amber-500 border-amber-400 text-white',
    info: 'bg-blue-500 border-blue-400 text-white'
  }
  return classes[type]
}

const getIcon = (type: Notification['type']) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type]
}

const getIconClasses = (type: Notification['type']) => {
  return 'text-white'
}

const getTitleClasses = (type: Notification['type']) => {
  return 'text-white'
}

const getMessageClasses = (type: Notification['type']) => {
  return 'text-white text-opacity-90'
}

// === GESTIONNAIRES D'ÉVÉNEMENTS ===

const handleAction = (notificationId: string, action: { label: string; action: () => void; style?: 'primary' | 'secondary' }) => {
  action.action()
  notificationStore.removeNotification(notificationId)
}
</script>

<style scoped>
/* Animations pour les notifications */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Animation de la barre de progression */
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style> 