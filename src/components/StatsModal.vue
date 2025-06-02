<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">
            Statistiques détaillées des employés
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Statistiques générales -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-blue-600">{{ stats.totalEmployees }}</div>
              <div class="text-sm text-gray-600">Total employés</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-green-600">{{ stats.activeEmployees }}</div>
              <div class="text-sm text-gray-600">Employés actifs</div>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-orange-600">{{ stats.formerEmployees }}</div>
              <div class="text-sm text-gray-600">Anciens employés</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg text-center">
              <div class="text-3xl font-bold text-red-600">{{ stats.blacklistedEmployees }}</div>
              <div class="text-sm text-gray-600">Blacklistés</div>
            </div>
          </div>

          <!-- Statistiques financières -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Statistiques financières</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">${{ formatCurrency(stats.totalPayroll) }}</div>
                <div class="text-sm text-gray-600">Masse salariale totale</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">${{ formatCurrency(stats.averageSalary) }}</div>
                <div class="text-sm text-gray-600">Salaire moyen</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ stats.totalHours }}h</div>
                <div class="text-sm text-gray-600">Heures totales</div>
              </div>
            </div>
          </div>

          <!-- Répartition par poste -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Répartition par poste</h4>
            <div class="space-y-3">
              <div 
                v-for="position in stats.positionBreakdown" 
                :key="position.name"
                class="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span class="font-medium">{{ position.name }}</span>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-600">{{ position.count }} employé{{ position.count > 1 ? 's' : '' }}</span>
                  <span class="text-sm font-medium">${{ formatCurrency(position.totalSalary) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Top employés -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Top par heures -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Top employés (heures)</h4>
              <div class="space-y-2">
                <div 
                  v-for="(employee, index) in stats.topByHours" 
                  :key="employee.id"
                  class="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div class="flex items-center">
                    <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {{ index + 1 }}
                    </span>
                    <span class="text-sm font-medium">{{ employee.first_name }} {{ employee.last_name }}</span>
                  </div>
                  <span class="text-sm text-gray-600">{{ employee.hours_worked }}h</span>
                </div>
              </div>
            </div>

            <!-- Top par gains -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Top employés (gains)</h4>
              <div class="space-y-2">
                <div 
                  v-for="(employee, index) in stats.topByEarnings" 
                  :key="employee.id"
                  class="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div class="flex items-center">
                    <span class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {{ index + 1 }}
                    </span>
                    <span class="text-sm font-medium">{{ employee.first_name }} {{ employee.last_name }}</span>
                  </div>
                  <span class="text-sm text-gray-600">${{ formatCurrency(employee.total_earnings) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tendances -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Tendances</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-4 bg-white rounded">
                <div class="text-lg font-semibold text-gray-900">{{ stats.employeesWithoutHours }}</div>
                <div class="text-sm text-gray-600">Employés sans heures</div>
              </div>
              <div class="text-center p-4 bg-white rounded">
                <div class="text-lg font-semibold text-gray-900">{{ stats.employeesWithBonus }}</div>
                <div class="text-sm text-gray-600">Employés avec prime</div>
              </div>
              <div class="text-center p-4 bg-white rounded">
                <div class="text-lg font-semibold text-gray-900">{{ stats.employeesOvertime }}</div>
                <div class="text-sm text-gray-600">Employés +40h</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              @click="exportStats"
              class="btn-secondary"
            >
              Exporter les stats
            </button>
            <button
              @click="$emit('close')"
              class="btn-primary"
            >
              Fermer
            </button>
          </div>
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

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const stats = computed(() => {
  const activeEmployees = props.employees.filter(emp => emp.is_active && !emp.is_former)
  const formerEmployees = props.employees.filter(emp => emp.is_former)
  
  // Statistiques de base
  const totalEmployees = props.employees.length
  const blacklistedEmployees = formerEmployees.filter(emp => emp.is_blacklisted).length
  
  // Statistiques financières
  const totalPayroll = activeEmployees.reduce((sum, emp) => sum + emp.total_earnings, 0)
  const averageSalary = activeEmployees.length > 0 ? totalPayroll / activeEmployees.length : 0
  const totalHours = activeEmployees.reduce((sum, emp) => sum + emp.hours_worked, 0)
  
  // Répartition par poste
  const positionMap = new Map<string, { count: number, totalSalary: number }>()
  activeEmployees.forEach(emp => {
    const current = positionMap.get(emp.position) || { count: 0, totalSalary: 0 }
    positionMap.set(emp.position, {
      count: current.count + 1,
      totalSalary: current.totalSalary + emp.total_earnings
    })
  })
  
  const positionBreakdown = Array.from(positionMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    totalSalary: data.totalSalary
  })).sort((a, b) => b.count - a.count)
  
  // Top employés
  const topByHours = [...activeEmployees]
    .sort((a, b) => b.hours_worked - a.hours_worked)
    .slice(0, 5)
  
  const topByEarnings = [...activeEmployees]
    .sort((a, b) => b.total_earnings - a.total_earnings)
    .slice(0, 5)
  
  // Tendances
  const employeesWithoutHours = activeEmployees.filter(emp => emp.hours_worked === 0).length
  const employeesWithBonus = activeEmployees.filter(emp => emp.bonus_amount > 0).length
  const employeesOvertime = activeEmployees.filter(emp => emp.hours_worked > 40).length
  
  return {
    totalEmployees,
    activeEmployees: activeEmployees.length,
    formerEmployees: formerEmployees.length,
    blacklistedEmployees,
    totalPayroll,
    averageSalary,
    totalHours,
    positionBreakdown,
    topByHours,
    topByEarnings,
    employeesWithoutHours,
    employeesWithBonus,
    employeesOvertime
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const exportStats = () => {
  const statsData = {
    'Date de génération': new Date().toLocaleDateString('fr-FR'),
    'Total employés': stats.value.totalEmployees,
    'Employés actifs': stats.value.activeEmployees,
    'Anciens employés': stats.value.formerEmployees,
    'Employés blacklistés': stats.value.blacklistedEmployees,
    'Masse salariale totale': stats.value.totalPayroll,
    'Salaire moyen': stats.value.averageSalary,
    'Heures totales': stats.value.totalHours,
    'Employés sans heures': stats.value.employeesWithoutHours,
    'Employés avec prime': stats.value.employeesWithBonus,
    'Employés +40h': stats.value.employeesOvertime
  }

  const csvContent = Object.entries(statsData)
    .map(([key, value]) => `"${key}","${value}"`)
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `statistiques_employes_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script> 