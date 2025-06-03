<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Gestion des services</h3>
        <p class="text-gray-600">Prise et fin de service des employés</p>
      </div>
    </div>

    <!-- Liste des employés actifs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="employee in accountingStore.activeEmployees"
        :key="employee.id"
        class="card"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div 
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                  accountingStore.isEmployeeOnDuty(employee.id) 
                    ? 'bg-green-500' 
                    : 'bg-gray-400'
                ]"
              >
                {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
              </div>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ employee.first_name }} {{ employee.last_name }}
              </h4>
              <p class="text-xs text-gray-500">{{ employee.position }}</p>
              <div v-if="accountingStore.isEmployeeOnDuty(employee.id)" class="text-xs text-green-600">
                En service depuis {{ formatDuration(accountingStore.getCurrentShiftDuration(employee.id)) }}
              </div>
              <div v-else class="text-xs text-gray-400">
                Hors service
              </div>
            </div>
          </div>
          
          <div class="flex flex-col space-y-2">
            <button
              v-if="!accountingStore.isEmployeeOnDuty(employee.id)"
              @click="startShift(employee)"
              :disabled="accountingStore.loading"
              class="btn-primary text-xs px-3 py-1 disabled:opacity-50"
            >
              Prise de service
            </button>
            <button
              v-else
              @click="endShift(employee)"
              :disabled="accountingStore.loading"
              class="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
            >
              Fin de service
            </button>
          </div>
        </div>
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
        >
          Actualiser
        </button>
      </div>
      
      <div v-if="accountingStore.loading" class="text-center py-4">
        <div class="text-gray-500">Chargement...</div>
      </div>
      
      <div v-else-if="recentServiceTransactions.length === 0" class="text-center py-8 text-gray-500">
        Aucun service enregistré
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
import { ref, computed, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import type { Employee, ServiceTransaction } from '@/lib/firebase'

const accountingStore = useAccountingStore()

// Services récents (limités aux 20 derniers)
const recentServiceTransactions = computed(() => 
  accountingStore.serviceTransactions
    .filter(t => t.type === 'prise_service' || t.type === 'fin_service')
    .slice(0, 20)
)

// Fonctions
const startShift = async (employee: Employee) => {
  try {
    await accountingStore.startShift(employee.id, `${employee.first_name} ${employee.last_name}`)
  } catch (error) {
    console.error('Erreur lors de la prise de service:', error)
    alert('Erreur lors de la prise de service')
  }
}

const endShift = async (employee: Employee) => {
  try {
    await accountingStore.endShift(employee.id, `${employee.first_name} ${employee.last_name}`)
  } catch (error) {
    console.error('Erreur lors de la fin de service:', error)
    alert('Erreur lors de la fin de service')
  }
}

const refreshHistory = async () => {
  try {
    await accountingStore.fetchServiceTransactions()
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error)
  }
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

onMounted(async () => {
  await accountingStore.initializeServiceStore()
})
</script> 