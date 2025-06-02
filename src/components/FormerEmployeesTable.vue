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
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun ancien employé</h3>
      <p class="mt-1 text-sm text-gray-500">Les employés licenciés ou démissionnaires apparaîtront ici.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employé
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ancien poste
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de départ
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Raison du départ
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
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
                  <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">
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
              <div class="text-sm text-gray-900">{{ employee.position }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ employee.termination_date ? formatDate(employee.termination_date) : '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
              <div class="truncate" :title="employee.termination_reason">
                {{ employee.termination_reason || '-' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                v-if="employee.is_blacklisted"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                Blacklisté
              </span>
              <span 
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Normal
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <!-- Bouton Réactiver -->
                <button
                  v-if="!employee.is_blacklisted"
                  @click="$emit('reactivate', employee)"
                  class="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                  title="Réactiver l'employé"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
                
                <!-- Bouton Voir détails -->
                <button
                  @click="showDetails(employee)"
                  class="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                  title="Voir les détails"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
          {{ employees.length }} ancien{{ employees.length > 1 ? 's' : '' }} employé{{ employees.length > 1 ? 's' : '' }}
        </div>
        <div class="flex space-x-4">
          <div class="text-gray-600">
            Blacklistés: <span class="font-medium text-red-600">{{ blacklistedCount }}</span>
          </div>
          <div class="text-gray-600">
            Réactivables: <span class="font-medium text-green-600">{{ reactivableCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <EmployeeDetailsModal
      v-if="showDetailsModal"
      :employee="selectedEmployee"
      @close="showDetailsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Employee } from '@/lib/firebase'
import EmployeeDetailsModal from './EmployeeDetailsModal.vue'

interface Props {
  employees: Employee[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reactivate: [employee: Employee]
  delete: [employee: Employee]
}>()

const showDetailsModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

const blacklistedCount = computed(() => 
  props.employees.filter(emp => emp.is_blacklisted).length
)

const reactivableCount = computed(() => 
  props.employees.filter(emp => !emp.is_blacklisted).length
)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const showDetails = (employee: Employee) => {
  selectedEmployee.value = employee
  showDetailsModal.value = true
}
</script> 