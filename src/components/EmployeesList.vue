<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Employés actifs</h2>
      <button
        @click="showAddModal = true"
        class="btn-primary"
      >
        Ajouter un employé
      </button>
    </div>

    <div v-if="accountingStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="accountingStore.activeEmployees.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun employé</h3>
      <p class="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier employé.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employé
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Poste & Grade
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Taux horaire
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Heures de service
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Primes
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total à payer
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in accountingStore.activeEmployees" :key="employee.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">
                      {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ employee.first_name }} {{ employee.last_name }}
                  </div>
                  <div class="text-sm text-gray-500">{{ employee.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="space-y-1">
                <!-- Poste -->
                <div class="text-sm font-medium text-gray-900">
                  {{ employee.position }}
                </div>
                <!-- Grade avec emoji -->
                <div class="flex items-center space-x-2">
                  <span class="text-lg">{{ getGradeIcon(employee.grade || 'debutant') }}</span>
                  <span class="text-sm text-gray-600 font-medium">
                    {{ formatGradeName(employee.grade || 'debutant') }}
                  </span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${{ formatCurrency(employee.hourly_rate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <!-- Affichage automatique basé sur le temps de service -->
              <div class="space-y-1">
                <div v-if="accountingStore.isEmployeeOnDuty(employee.id)" class="flex items-center space-x-2">
                  <div class="text-lg font-semibold text-green-600">
                    {{ formatServiceHours(employee.id) }}
                  </div>
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div v-else class="text-sm text-gray-500">
                  Hors service
                </div>
                
                <div v-if="accountingStore.isEmployeeOnDuty(employee.id)" class="text-xs text-green-500">
                  Depuis {{ getServiceStartTime(employee.id) }}
                </div>
                
                <div v-else-if="employee.hours_worked > 0" class="text-xs text-gray-400">
                  Heures manuelles: {{ employee.hours_worked }}h
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="space-y-2">
                <!-- Primes automatiques calculées -->
                <div class="space-y-1">
                  <div class="text-xs font-medium text-purple-600">
                    🎯 Primes automatiques: ${{ formatCurrency(getCalculatedBonuses(employee).total) }}
                  </div>
                  <div v-if="getCalculatedBonuses(employee).salesBonus > 0" class="text-xs text-gray-500">
                    💰 Ventes: ${{ formatCurrency(getCalculatedBonuses(employee).salesBonus) }}
                  </div>
                  <div v-if="getCalculatedBonuses(employee).serviceBonus > 0" class="text-xs text-gray-500">
                    🛠️ Prestations: ${{ formatCurrency(getCalculatedBonuses(employee).serviceBonus) }}
                  </div>
                </div>
                
                <!-- Prime manuelle modifiable -->
                <div class="space-y-1">
                  <label class="text-xs font-medium text-blue-600">➕ Prime manuelle:</label>
                  <input
                    v-model.number="employee.bonus_amount"
                    @change="updateEmployeeBonus(employee.id, employee.bonus_amount)"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <!-- Total des primes -->
                <div class="text-xs font-medium text-gray-700 border-t pt-1">
                  Total primes: ${{ formatCurrency(getTotalBonuses(employee)) }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="space-y-1">
                <!-- Total complet (service + manuel + primes) -->
                <div :class="[
                  'text-lg font-medium',
                  accountingStore.isEmployeeOnDuty(employee.id) ? 'text-green-600' : 
                  getTotalEarningsWithBonuses(employee) > 0 ? 'text-gray-900' : 'text-gray-500'
                ]">
                  ${{ formatCurrency(getTotalEarningsWithBonuses(employee)) }}
                </div>
                
                <!-- Détail du calcul -->
                <div class="text-xs text-gray-500">
                  <span v-if="accountingStore.isEmployeeOnDuty(employee.id)">
                    Service: ${{ formatCurrency(getServiceEarnings(employee.id, employee.hourly_rate)) }}
                    <span v-if="employee.hours_worked > 0"> + Manuel: ${{ formatCurrency(employee.hours_worked * employee.hourly_rate) }}</span>
                    <span v-if="getTotalBonuses(employee) > 0"> + Primes: ${{ formatCurrency(getTotalBonuses(employee)) }}</span>
                  </span>
                  <span v-else-if="getTotalEarningsWithBonuses(employee) > 0">
                    <span v-if="employee.hours_worked > 0">Manuel: ${{ formatCurrency(employee.hours_worked * employee.hourly_rate) }}</span>
                    <span v-if="getTotalBonuses(employee) > 0">
                      <span v-if="employee.hours_worked > 0"> + </span>Primes: ${{ formatCurrency(getTotalBonuses(employee)) }}
                    </span>
                  </span>
                  <span v-else>
                    Aucun gain enregistré
                  </span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button
                  v-if="hasEarningsToPay(employee)"
                  @click="showPayModal(employee)"
                  class="text-green-600 hover:text-green-900"
                  title="Payer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </button>
                <button
                  @click="editEmployee(employee)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Modifier"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="showTerminateModal(employee)"
                  class="text-orange-600 hover:text-orange-900"
                  title="Passer en ancien employé"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
                <button
                  @click="openDeleteModal(employee)"
                  class="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Résumé en bas de table -->
    <div v-if="accountingStore.activeEmployees.length > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
      <div class="flex justify-between items-center text-sm">
        <div class="text-gray-600">
          {{ accountingStore.activeEmployees.length }} employé{{ accountingStore.activeEmployees.length > 1 ? 's' : '' }} actif{{ accountingStore.activeEmployees.length > 1 ? 's' : '' }}
        </div>
        <div class="flex space-x-6">
          <div class="text-gray-600">
            Primes automatiques: <span class="font-medium text-purple-600">${{ formatCurrency(totalAutomaticBonuses) }}</span>
          </div>
          <div class="text-gray-600">
            Primes manuelles: <span class="font-medium text-blue-600">${{ formatCurrency(totalManualBonuses) }}</span>
          </div>
          <div class="font-medium text-gray-900">
            Total masse salariale: <span class="text-green-600">${{ formatCurrency(totalPayroll) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout d'employé -->
    <EmployeeModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @save="handleAddEmployee"
    />

    <!-- Modal d'édition d'employé -->
    <EmployeeModal
      v-if="showEditModal"
      :employee="selectedEmployee"
      @close="showEditModal = false"
      @save="handleEditEmployee"
    />

    <!-- Modal de paiement -->
    <PaymentModal
      v-if="showPaymentModal"
      :employee="selectedEmployee"
      @close="showPaymentModal = false"
      @confirm="handlePayment"
    />

    <!-- Modal de licenciement -->
    <TerminationModal
      v-if="showTerminationModal"
      :employee="selectedEmployee"
      @close="showTerminationModal = false"
      @confirm="handleTermination"
    />

    <!-- Modal de suppression -->
    <DeleteModal
      v-if="showDeleteModal"
      :employee="selectedEmployee"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { Employee } from '@/lib/firebase'
import EmployeeModal from './EmployeeModal.vue'
import PaymentModal from './PaymentModal.vue'
import TerminationModal from './TerminationModal.vue'
import DeleteModal from './DeleteModal.vue'

const accountingStore = useAccountingStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const showPaymentModal = ref(false)
const showTerminationModal = ref(false)
const showDeleteModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

// Timer pour mise à jour temps réel
const currentTime = ref(new Date())
let timeInterval: number | null = null

// === FONCTIONS UTILITAIRES ===

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// === FONCTIONS DE GRADE ===

const getGradeIcon = (grade: string) => {
  const icons = {
    'debutant': '🌱',
    'junior': '📈',
    'senior': '⭐',
    'expert': '🎓',
    'manager': '👔',
    'directeur': '👑'
  }
  return icons[grade as keyof typeof icons] || '🌱'
}

const formatGradeName = (grade: string) => {
  const names = {
    'debutant': 'Débutant',
    'junior': 'Junior',
    'senior': 'Senior',
    'expert': 'Expert',
    'manager': 'Manager',
    'directeur': 'Directeur'
  }
  return names[grade as keyof typeof names] || 'Débutant'
}

// === FONCTIONS DE SERVICE ===

// Obtenir l'heure de début du service
const getServiceStartTime = (employeeId: string) => {
  const startTime = accountingStore.activeShifts.get(employeeId)
  if (!startTime) return 'N/A'
  
  return startTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatter les heures de service (temps réel)
const formatServiceHours = (employeeId: string) => {
  if (!accountingStore.isEmployeeOnDuty(employeeId)) {
    return '0h 0min'
  }
  
  const totalSeconds = accountingStore.getCurrentShiftDurationInSeconds(employeeId)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  // Affichage heures et minutes uniquement
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  } else {
    return `${minutes}min`
  }
}

// Calculer les gains basés sur les heures de service
const getServiceEarnings = (employeeId: string, hourlyRate: number) => {
  if (!accountingStore.isEmployeeOnDuty(employeeId)) {
    return 0
  }
  
  const totalSeconds = accountingStore.getCurrentShiftDurationInSeconds(employeeId)
  const hours = totalSeconds / 3600 // Conversion précise en heures décimales
  
  return hours * hourlyRate
}

// === FONCTIONS DE PRIMES ===

// Calculer les primes automatiques basées sur les ventes et prestations
const getCalculatedBonuses = (employee: Employee) => {
  return accountingStore.calculateEmployeeBonuses(employee.id)
}

// Calculer le total des primes (automatiques + manuelles)
const getTotalBonuses = (employee: Employee) => {
  const calculatedBonuses = getCalculatedBonuses(employee)
  return calculatedBonuses.total + employee.bonus_amount
}

// Calculer le total des gains (service + manuel + toutes les primes)
const getTotalEarningsWithBonuses = (employee: Employee) => {
  const serviceEarnings = getServiceEarnings(employee.id, employee.hourly_rate)
  const manualEarnings = employee.hours_worked * employee.hourly_rate
  const totalBonuses = getTotalBonuses(employee)
  
  return serviceEarnings + manualEarnings + totalBonuses
}

// Vérifier si l'employé a des gains à payer
const hasEarningsToPay = (employee: Employee) => {
  return getTotalEarningsWithBonuses(employee) > 0
}

// === COMPUTED PROPERTIES ===

// Total des primes automatiques pour tous les employés
const totalAutomaticBonuses = computed(() => 
  accountingStore.activeEmployees.reduce((sum, emp) => {
    const bonuses = getCalculatedBonuses(emp)
    return sum + bonuses.total
  }, 0)
)

// Total des primes manuelles pour tous les employés
const totalManualBonuses = computed(() => 
  accountingStore.activeEmployees.reduce((sum, emp) => sum + emp.bonus_amount, 0)
)

// Total de la masse salariale incluant toutes les primes
const totalPayroll = computed(() => 
  accountingStore.activeEmployees.reduce((sum, emp) => {
    if (accountingStore.isEmployeeOnDuty(emp.id)) {
      return sum + getServiceEarnings(emp.id, emp.hourly_rate) + getTotalBonuses(emp)
    } else {
      return sum + (emp.hours_worked * emp.hourly_rate) + getTotalBonuses(emp)
    }
  }, 0)
)

// === GESTIONNAIRES D'ÉVÉNEMENTS ===

const updateEmployeeBonus = async (id: string, bonus: number) => {
  await accountingStore.updateEmployee(id, { bonus_amount: bonus })
}

const showPayModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showPaymentModal.value = true
}

const editEmployee = (employee: Employee) => {
  selectedEmployee.value = employee
  showEditModal.value = true
}

const showTerminateModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showTerminationModal.value = true
}

const openDeleteModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showDeleteModal.value = true
}

const handleAddEmployee = async (employeeData: any) => {
  await accountingStore.addEmployee(employeeData)
  showAddModal.value = false
}

const handleEditEmployee = async (employeeData: any) => {
  if (selectedEmployee.value) {
    await accountingStore.updateEmployee(selectedEmployee.value.id, employeeData)
    showEditModal.value = false
    selectedEmployee.value = null
  }
}

const handlePayment = async () => {
  if (selectedEmployee.value) {
    await accountingStore.payEmployee(selectedEmployee.value.id)
    showPaymentModal.value = false
    selectedEmployee.value = null
  }
}

const handleTermination = async (reason: string, isBlacklisted: boolean) => {
  if (selectedEmployee.value) {
    await accountingStore.moveToFormer(selectedEmployee.value.id, reason, isBlacklisted)
    showTerminationModal.value = false
    selectedEmployee.value = null
  }
}

const handleDelete = async () => {
  if (selectedEmployee.value) {
    await accountingStore.deleteEmployee(selectedEmployee.value.id)
    showDeleteModal.value = false
    selectedEmployee.value = null
  }
}

// === LIFECYCLE ===

// Démarrer le timer temps réel
onMounted(async () => {
  // Initialiser le système de services
  await accountingStore.initializeServiceStore()
  
  // Démarrer le timer de mise à jour
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000) // Mise à jour chaque seconde
})

// Nettoyer le timer
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script> 