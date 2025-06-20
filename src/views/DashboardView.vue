<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p class="mt-2 text-gray-600">
              Bienvenue {{ authStore.user?.email }}, 
              <span class="capitalize">{{ authStore.user?.role }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Cartes d'accès rapide -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Comptabilité -->
        <router-link
          v-if="authStore.canAccessAccounting"
          to="/accounting"
          class="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Comptabilité</p>
              <p class="text-lg font-semibold text-gray-900">Gestion financière</p>
            </div>
          </div>
        </router-link>

        <!-- Gestion des utilisateurs (Admin seulement) -->
        <div
          v-if="authStore.user?.role === 'admin'"
          @click="showUserManagement = true"
          class="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Administration</p>
              <p class="text-lg font-semibold text-gray-900">Gestion des utilisateurs</p>
            </div>
          </div>
        </div>

        <!-- Profil -->
        <router-link
          to="/profile"
          class="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Profil</p>
              <p class="text-lg font-semibold text-gray-900">Mes informations</p>
            </div>
          </div>
        </router-link>

        <!-- Notifications -->
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Notifications</p>
              <p class="text-lg font-semibold text-gray-900">3 nouvelles</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Services en cours (si accès comptabilité) -->
      <div v-if="authStore.canAccessAccounting" class="mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Services en cours</h3>
            <router-link
              to="/accounting?tab=services"
              class="text-sm text-primary-600 hover:text-primary-500"
            >
              Voir tout →
            </router-link>
          </div>
          
          <div v-if="accountingStore.activeShifts.size === 0" class="text-center py-6">
            <div class="text-gray-400 text-4xl mb-2">⏰</div>
            <p class="text-gray-500">Aucun employé en service actuellement</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="[employeeId, startTime] in activeShifts"
              :key="employeeId"
              class="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium text-sm">
                    {{ getEmployeeInitials(employeeId) }}
                  </span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">
                    {{ getEmployeeName(employeeId) }}
                  </div>
                  <div class="text-xs text-green-600 font-medium">
                    🟢 {{ formatDuration(employeeId) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Depuis {{ formatTime(startTime) }}
                  </div>
                </div>
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <!-- Résumé -->
          <div v-if="accountingStore.activeShifts.size > 0" class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Total employés en service:</span>
              <span class="font-medium text-gray-900">{{ accountingStore.activeShifts.size }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-gray-600">Temps total cumulé:</span>
              <span class="font-medium text-green-600">{{ getTotalServiceTime() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de gestion des utilisateurs -->
      <div v-if="showUserManagement" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border max-w-6xl shadow-lg rounded-md bg-white">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-medium text-gray-900">
              🔧 Administration - Gestion des utilisateurs
            </h3>
            <button
              @click="showUserManagement = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <UserManagement />
        </div>
      </div>

      <!-- Informations du rôle -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Permissions -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Mes permissions</h3>
          <div class="space-y-2">
            <div v-for="permission in authStore.user?.permissions || []" :key="permission" class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-sm text-gray-700 capitalize">{{ permission }}</span>
            </div>
            <div v-if="!authStore.user?.permissions?.length" class="text-sm text-gray-500">
              Aucune permission spécifique
            </div>
          </div>
        </div>

        <!-- Accès rapides -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Accès rapides</h3>
          <div class="space-y-3">
            <router-link
              to="/"
              class="flex items-center text-sm text-gray-600 hover:text-primary-600"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Accueil public
            </router-link>
            <router-link
              to="/news"
              class="flex items-center text-sm text-gray-600 hover:text-primary-600"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
              Actualités
            </router-link>
            <router-link
              to="/recruitment"
              class="flex items-center text-sm text-gray-600 hover:text-primary-600"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Recrutement
            </router-link>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="mt-8">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
          <div class="flow-root">
            <ul class="-mb-8">
              <li>
                <div class="relative pb-8">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">Connexion réussie</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Il y a quelques instants</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="relative pb-8">
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">Accès au dashboard</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Il y a quelques instants</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import UserManagement from '@/components/UserManagement.vue'
import { useAuthStore } from '@/stores/auth'
import { useAccountingStore } from '@/stores/accounting'

const authStore = useAuthStore()
const accountingStore = useAccountingStore()
const showUserManagement = ref(false)

// Timer pour mise à jour temps réel
const currentTime = ref(new Date())
let timeInterval: number | null = null

// Computed pour les services actifs (mise à jour temps réel)
const activeShifts = computed(() => Array.from(accountingStore.activeShifts.entries()))

const getEmployeeInitials = (employeeId: string) => {
  const employee = accountingStore.employees.find(emp => emp.id === employeeId)
  if (!employee) return '??'
  return `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`
}

const getEmployeeName = (employeeId: string) => {
  return accountingStore.getEmployeeName(employeeId)
}

const formatDuration = (employeeId: string) => {
  const totalSeconds = accountingStore.getCurrentShiftDurationInSeconds(employeeId)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  } else if (minutes > 0) {
    return `${minutes}min ${seconds}sec`
  } else {
    return `${seconds}sec`
  }
}

const formatTime = (startTime: Date) => {
  return startTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTotalServiceTime = () => {
  let totalSeconds = 0
  
  for (const [employeeId] of activeShifts.value) {
    totalSeconds += accountingStore.getCurrentShiftDurationInSeconds(employeeId)
  }
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  } else {
    return `${minutes}min`
  }
}

// Initialiser le store au montage
onMounted(async () => {
  if (authStore.canAccessAccounting) {
    await accountingStore.initializeServiceStore()
  }
  
  // Démarrer le timer pour mise à jour temps réel
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

// Nettoyer le timer au démontage
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script> 