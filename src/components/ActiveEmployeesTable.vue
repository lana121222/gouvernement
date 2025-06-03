<template>
  <div class="card">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Chargement...</p>
    </div>

    <div v-else-if="employees.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun employé actif</h3>
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
              Poste
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Taux horaire
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Heures de service
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prime
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
          <tr v-for="employee in employees" :key="employee.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <div 
                    :class="[
                      'h-10 w-10 rounded-full flex items-center justify-center',
                      accountingStore.isEmployeeOnDuty(employee.id) 
                        ? 'bg-green-100 ring-2 ring-green-500' 
                        : 'bg-primary-100'
                    ]"
                  >
                    <span 
                      :class="[
                        'text-sm font-medium',
                        accountingStore.isEmployeeOnDuty(employee.id) 
                          ? 'text-green-600' 
                          : 'text-primary-600'
                      ]"
                    >
                      {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ employee.first_name }} {{ employee.last_name }}
                    <span 
                      v-if="accountingStore.isEmployeeOnDuty(employee.id)"
                      class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      🟢 En service
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">{{ employee.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ employee.position }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${{ formatCurrency(employee.hourly_rate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="space-y-1">
                <!-- Heures de service automatiques (temps réel) -->
                <div class="flex items-center space-x-2">
                  <div 
                    :class="[
                      'text-sm font-medium',
                      accountingStore.isEmployeeOnDuty(employee.id) 
                        ? 'text-green-600' 
                        : 'text-gray-900'
                    ]"
                  >
                    {{ formatServiceHours(employee.id) }}
                  </div>
                  <div 
                    v-if="accountingStore.isEmployeeOnDuty(employee.id)"
                    class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  ></div>
                </div>
                
                <!-- Heures manuelles (affichage secondaire) -->
                <div class="text-xs text-gray-500">
                  Manuel: 
                  <input
                    :value="employee.hours_worked"
                    @change="updateHours(employee.id, $event)"
                    type="number"
                    min="0"
                    step="0.5"
                    class="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  />h
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                :value="employee.bonus_amount"
                @change="updateBonus(employee.id, $event)"
                type="number"
                min="0"
                step="0.01"
                class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="space-y-1">
                <!-- Total avec heures de service -->
                <div 
                  :class="[
                    'text-lg font-medium',
                    getTotalEarningsWithService(employee) > 0 ? 'text-green-600' : 'text-gray-900'
                  ]"
                >
                  ${{ formatCurrency(getTotalEarningsWithService(employee)) }}
                </div>
                
                <!-- Détail du calcul -->
                <div class="text-xs text-gray-500">
                  Service: ${{ formatCurrency(getServiceEarnings(employee.id, employee.hourly_rate)) }}
                  <br>
                  Manuel: ${{ formatCurrency(employee.total_earnings) }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <!-- Bouton Payer -->
                <button
                  v-if="employee.total_earnings > 0"
                  @click="$emit('pay', employee)"
                  class="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                  title="Payer l'employé"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </button>
                
                <!-- Bouton Modifier -->
                <button
                  @click="$emit('edit', employee)"
                  class="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                  title="Modifier l'employé"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                
                <!-- Bouton Licencier -->
                <button
                  @click="$emit('terminate', employee)"
                  class="text-orange-600 hover:text-orange-900 p-1 rounded-full hover:bg-orange-50"
                  title="Passer en ancien employé"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
                
                <!-- Bouton Supprimer -->
                <button
                  @click="$emit('delete', employee)"
                  class="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                  title="Supprimer définitivement"
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
    <div v-if="employees.length > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
      <div class="flex justify-between items-center text-sm">
        <div class="text-gray-600">
          {{ employees.length }} employé{{ employees.length > 1 ? 's' : '' }} actif{{ employees.length > 1 ? 's' : '' }}
        </div>
        <div class="font-medium text-gray-900">
          Total masse salariale: <span class="text-green-600">${{ formatCurrency(totalPayroll) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Employee } from '@/lib/firebase'
import { useAccountingStore } from '@/stores/accounting'

interface Props {
  employees: Employee[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [employee: Employee]
  pay: [employee: Employee]
  terminate: [employee: Employee]
  delete: [employee: Employee]
  'update-hours': [id: string, hours: number]
  'update-bonus': [id: string, bonus: number]
}>()

const accountingStore = useAccountingStore()

// Timer pour mise à jour temps réel
const currentTime = ref(new Date())
let timeInterval: number | null = null

const totalPayroll = computed(() => 
  props.employees.reduce((sum, emp) => sum + getTotalEarningsWithService(emp), 0)
)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const updateHours = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const hours = parseFloat(target.value) || 0
  emit('update-hours', id, hours)
}

const updateBonus = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const bonus = parseFloat(target.value) || 0
  emit('update-bonus', id, bonus)
}

// Formatter les heures de service (temps réel)
const formatServiceHours = (employeeId: string) => {
  if (!accountingStore.isEmployeeOnDuty(employeeId)) {
    return '0h 0min'
  }
  
  const minutes = accountingStore.getCurrentShiftDuration(employeeId)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins}min`
}

// Calculer les gains basés sur les heures de service
const getServiceEarnings = (employeeId: string, hourlyRate: number) => {
  if (!accountingStore.isEmployeeOnDuty(employeeId)) {
    return 0
  }
  
  const minutes = accountingStore.getCurrentShiftDuration(employeeId)
  const hours = minutes / 60
  
  return hours * hourlyRate
}

// Calculer le total des gains (service + manuel + prime)
const getTotalEarningsWithService = (employee: Employee) => {
  const serviceEarnings = getServiceEarnings(employee.id, employee.hourly_rate)
  const manualEarnings = (employee.hours_worked * employee.hourly_rate)
  const bonus = employee.bonus_amount
  
  return serviceEarnings + manualEarnings + bonus
}

// Démarrer le timer temps réel
onMounted(() => {
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