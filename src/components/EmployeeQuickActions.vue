<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Actions rapides</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Payer tous les employés -->
      <button
        @click="$emit('pay-all')"
        :disabled="!hasEmployeesToPay"
        class="flex flex-col items-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
        </svg>
        <span class="text-sm font-medium text-gray-900">Payer tous</span>
        <span class="text-xs text-gray-500">{{ employeesToPayCount }} employés</span>
      </button>

      <!-- Réinitialiser les heures -->
      <button
        @click="$emit('reset-hours')"
        :disabled="!hasActiveEmployees"
        class="flex flex-col items-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span class="text-sm font-medium text-gray-900">Reset heures</span>
        <span class="text-xs text-gray-500">Tous les employés</span>
      </button>

      <!-- Exporter les données -->
      <button
        @click="$emit('export-data')"
        class="flex flex-col items-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
      >
        <svg class="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span class="text-sm font-medium text-gray-900">Exporter</span>
        <span class="text-xs text-gray-500">CSV/Excel</span>
      </button>

      <!-- Statistiques rapides -->
      <button
        @click="$emit('show-stats')"
        class="flex flex-col items-center p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
      >
        <svg class="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <span class="text-sm font-medium text-gray-900">Statistiques</span>
        <span class="text-xs text-gray-500">Détaillées</span>
      </button>
    </div>

    <!-- Alertes et notifications -->
    <div v-if="alerts.length > 0" class="mt-6 space-y-2">
      <h4 class="text-sm font-medium text-gray-900">Alertes</h4>
      <div 
        v-for="alert in alerts" 
        :key="alert.id"
        :class="[
          'p-3 rounded-md text-sm',
          alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : '',
          alert.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : '',
          alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : ''
        ]"
      >
        <div class="flex items-center">
          <svg v-if="alert.type === 'warning'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <svg v-if="alert.type === 'info'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ alert.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Employee } from '@/lib/firebase'

interface Props {
  employees: Employee[]
}

interface Alert {
  id: string
  type: 'warning' | 'info' | 'success'
  message: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'pay-all': []
  'reset-hours': []
  'export-data': []
  'show-stats': []
}>()

const activeEmployees = computed(() => 
  props.employees.filter(emp => emp.is_active && !emp.is_former)
)

const hasActiveEmployees = computed(() => activeEmployees.value.length > 0)

const employeesToPayCount = computed(() => 
  activeEmployees.value.filter(emp => emp.total_earnings > 0).length
)

const hasEmployeesToPay = computed(() => employeesToPayCount.value > 0)

const totalPayroll = computed(() => 
  activeEmployees.value.reduce((sum, emp) => sum + emp.total_earnings, 0)
)

const alerts = computed((): Alert[] => {
  const alertList: Alert[] = []

  // Alerte pour les employés à payer
  if (employeesToPayCount.value > 0) {
    alertList.push({
      id: 'payroll',
      type: 'info',
      message: `${employeesToPayCount.value} employé${employeesToPayCount.value > 1 ? 's' : ''} en attente de paiement ($${totalPayroll.value.toFixed(2)})`
    })
  }

  // Alerte pour les employés sans heures
  const employeesWithoutHours = activeEmployees.value.filter(emp => emp.hours_worked === 0).length
  if (employeesWithoutHours > 0) {
    alertList.push({
      id: 'no-hours',
      type: 'warning',
      message: `${employeesWithoutHours} employé${employeesWithoutHours > 1 ? 's' : ''} sans heures travaillées`
    })
  }

  // Alerte pour les employés avec beaucoup d'heures
  const employeesWithManyHours = activeEmployees.value.filter(emp => emp.hours_worked > 40).length
  if (employeesWithManyHours > 0) {
    alertList.push({
      id: 'many-hours',
      type: 'warning',
      message: `${employeesWithManyHours} employé${employeesWithManyHours > 1 ? 's' : ''} avec plus de 40h`
    })
  }

  return alertList
})
</script> 