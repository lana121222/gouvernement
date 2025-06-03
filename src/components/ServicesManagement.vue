<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Gestion des services</h3>
        <p class="text-gray-600">Prise et fin de service des employés</p>
      </div>
      <div class="text-sm text-gray-500">
        {{ accountingStore.activeEmployees.length }} employé(s) actif(s)
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-600 text-lg">🟢</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">En service</p>
            <p class="text-2xl font-semibold text-gray-900">{{ employeesOnDuty.length }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span class="text-gray-600 text-lg">⏰</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Hors service</p>
            <p class="text-2xl font-semibold text-gray-900">{{ employeesOffDuty.length }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 text-lg">📊</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total services aujourd'hui</p>
            <p class="text-2xl font-semibold text-gray-900">{{ todayServices.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des employés actifs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="employee in accountingStore.activeEmployees"
        :key="employee.id"
        class="card relative"
      >
        <!-- Indicateur de statut -->
        <div 
          :class="[
            'absolute top-3 right-3 w-3 h-3 rounded-full',
            accountingStore.isEmployeeOnDuty(employee.id) 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-gray-300'
          ]"
        ></div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div 
                :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg',
                  accountingStore.isEmployeeOnDuty(employee.id) 
                    ? 'bg-green-500' 
                    : 'bg-gray-400'
                ]"
              >
                {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
              </div>
            </div>
            <div class="flex-1">
              <h4 class="text-base font-medium text-gray-900">
                {{ employee.first_name }} {{ employee.last_name }}
              </h4>
              <p class="text-sm text-gray-500">{{ employee.position }}</p>
              
              <!-- Compteur temps réel -->
              <div v-if="accountingStore.isEmployeeOnDuty(employee.id)" class="mt-1">
                <div class="text-sm font-medium text-green-600">
                  🟢 En service
                </div>
                <div class="text-xs text-green-500">
                  {{ formatDuration(getCurrentDuration(employee.id)) }}
                </div>
                <div class="text-xs text-gray-400">
                  Depuis {{ getShiftStartTime(employee.id) }}
                </div>
              </div>
              
              <div v-else class="mt-1">
                <div class="text-sm text-gray-400">
                  ⏰ Hors service
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Boutons d'action -->
        <div class="mt-4 flex space-x-2">
          <button
            v-if="!accountingStore.isEmployeeOnDuty(employee.id)"
            @click="startShift(employee)"
            :disabled="accountingStore.loading"
            class="flex-1 btn-primary text-sm disabled:opacity-50"
            data-dashlane-rid=""
            data-form-type=""
          >
            {{ accountingStore.loading ? 'Démarrage...' : '🟢 Prise de service' }}
          </button>
          <button
            v-else
            @click="endShift(employee)"
            :disabled="accountingStore.loading"
            class="flex-1 btn-secondary text-sm disabled:opacity-50"
            data-dashlane-rid=""
            data-form-type=""
          >
            {{ accountingStore.loading ? 'Arrêt...' : '🔴 Fin de service' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Message si aucun employé -->
    <div v-if="accountingStore.activeEmployees.length === 0" class="card text-center py-8">
      <div class="text-gray-500">
        <div class="text-4xl mb-4">👥</div>
        <h3 class="text-lg font-medium text-gray-900">Aucun employé actif</h3>
        <p class="text-gray-500">Ajoutez des employés pour gérer leurs services</p>
      </div>
    </div>

    <!-- Historique des services récents -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-medium text-gray-900">Historique des services</h4>
        <button
          @click="refreshHistory"
          :disabled="accountingStore.loading"
          class="btn-secondary text-sm disabled:opacity-50"
          data-dashlane-rid=""
          data-form-type=""
        >
          🔄 Actualiser
        </button>
      </div>
      
      <div v-if="accountingStore.loading" class="text-center py-4">
        <div class="text-gray-500">Chargement...</div>
      </div>
      
      <div v-else-if="recentServiceTransactions.length === 0" class="text-center py-8 text-gray-500">
        <div class="text-4xl mb-4">📋</div>
        <p>Aucun service enregistré</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employé
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Heure
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in recentServiceTransactions" :key="transaction.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ transaction.employee_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    transaction.type === 'prise_service' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ transaction.type === 'prise_service' ? '🟢 Prise de service' : '🔴 Fin de service' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.shift_duration ? formatDuration(transaction.shift_duration) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDateTime(transaction.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { Employee, ServiceTransaction } from '@/lib/firebase'
import { useNotificationStore } from '@/stores/notifications'

const accountingStore = useAccountingStore()
const notificationStore = useNotificationStore()

// Timer pour mise à jour en temps réel
const currentTime = ref(new Date())
let timeInterval: number | null = null

// Computed properties
const employeesOnDuty = computed(() => 
  accountingStore.activeEmployees.filter(emp => accountingStore.isEmployeeOnDuty(emp.id))
)

const employeesOffDuty = computed(() => 
  accountingStore.activeEmployees.filter(emp => !accountingStore.isEmployeeOnDuty(emp.id))
)

const todayServices = computed(() => {
  const today = new Date().toDateString()
  return accountingStore.serviceTransactions.filter(t => 
    new Date(t.created_at).toDateString() === today &&
    t.type === 'prise_service' // Seulement les prises de service
  )
})

const recentServiceTransactions = computed(() => 
  accountingStore.serviceTransactions
    .filter(t => t.type === 'prise_service' || t.type === 'fin_service')
    .slice(0, 20)
)

// Fonctions
const startShift = async (employee: Employee) => {
  try {
    console.log('Démarrage du service pour:', employee.first_name, employee.last_name)
    await accountingStore.startShift(employee.id, `${employee.first_name} ${employee.last_name}`)
    console.log('Service démarré avec succès')
  } catch (error) {
    console.error('Erreur lors de la prise de service:', error)
    notificationStore.error(
      'Erreur de prise de service',
      'Erreur lors de la prise de service: ' + (error as Error).message
    )
  }
}

const endShift = async (employee: Employee) => {
  try {
    console.log('Fin du service pour:', employee.first_name, employee.last_name)
    await accountingStore.endShift(employee.id, `${employee.first_name} ${employee.last_name}`)
    console.log('Fin de service enregistrée avec succès')
  } catch (error) {
    console.error('Erreur lors de la fin de service:', error)
    notificationStore.error(
      'Erreur de fin de service',
      'Erreur lors de la fin de service: ' + (error as Error).message
    )
  }
}

const refreshHistory = async () => {
  try {
    await accountingStore.fetchServiceTransactions()
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error)
  }
}

// Obtenir la durée actuelle en temps réel
const getCurrentDuration = (employeeId: string): number => {
  // Force la réactivité avec currentTime
  currentTime.value
  
  // Utiliser la fonction qui retourne les secondes pour un affichage temps réel
  const totalSeconds = accountingStore.getCurrentShiftDurationInSeconds(employeeId)
  return Math.floor(totalSeconds / 60) // Convertir en minutes pour formatDuration
}

// Obtenir l'heure de début de service
const getShiftStartTime = (employeeId: string): string => {
  const startTime = accountingStore.activeShifts.get(employeeId)
  if (!startTime) return ''
  
  return startTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Utilitaires de formatage
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins}min`
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  console.log('Initialisation du composant ServicesManagement')
  
  // Initialiser le store
  await accountingStore.initializeServiceStore()
  
  // Démarrer le timer pour mise à jour temps réel
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000) // Mise à jour chaque seconde
  
  console.log('ServicesManagement initialisé')
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script> 